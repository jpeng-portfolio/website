//! Email orchestration: fetch HTML templates from S3 and send via SES.
//!
//! Both side effects sit behind traits ([`TemplateStore`], [`EmailSender`]) so
//! the happy-path handler test runs fully offline with mocks. Real
//! implementations use `aws-sdk-s3` and `aws-sdk-sesv2`.

use async_trait::async_trait;

use crate::validation::ValidatedContact;

/// A single email to dispatch.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OutgoingEmail {
    pub to: String,
    pub from: String,
    pub reply_to: Option<String>,
    pub subject: String,
    pub html_body: String,
}

/// Fetches a template's raw HTML by object key.
#[async_trait]
pub trait TemplateStore: Send + Sync {
    async fn fetch(&self, key: &str) -> Result<String, String>;
}

/// Sends a single email.
#[async_trait]
pub trait EmailSender: Send + Sync {
    async fn send(&self, email: &OutgoingEmail) -> Result<(), String>;
}

pub const NOTIFICATION_TEMPLATE_KEY: &str = "notification.html";
pub const AUTO_REPLY_TEMPLATE_KEY: &str = "auto-reply.html";

/// Substitute `{{ placeholder }}` tokens (whitespace-tolerant) with values.
///
/// HTML-escapes every value to avoid breaking the markup or injecting tags.
pub fn render_template(template: &str, vars: &[(&str, &str)]) -> String {
    let mut out = template.to_string();
    for (key, value) in vars {
        let escaped = html_escape(value);
        // Accept `{{key}}`, `{{ key }}`, and `{{  key  }}` spacing variants.
        for placeholder in [
            format!("{{{{{key}}}}}"),
            format!("{{{{ {key} }}}}"),
            format!("{{{{  {key}  }}}}"),
        ] {
            out = out.replace(&placeholder, &escaped);
        }
    }
    out
}

fn html_escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&#39;"),
            _ => out.push(c),
        }
    }
    out
}

/// Build the two outgoing emails (notification + auto-reply) from rendered
/// templates and the validated contact.
pub fn build_emails(
    contact: &ValidatedContact,
    sender_email: &str,
    contact_email: &str,
    notification_template: &str,
    auto_reply_template: &str,
) -> (OutgoingEmail, OutgoingEmail) {
    let vars = [
        ("name", contact.name.as_str()),
        ("email", contact.email.as_str()),
        ("subject", contact.subject.as_str()),
        ("message", contact.message.as_str()),
    ];

    let notification = OutgoingEmail {
        to: contact_email.to_string(),
        from: sender_email.to_string(),
        // Replying to the notification goes straight to the submitter.
        reply_to: Some(contact.email.clone()),
        subject: format!("New contact form submission: {}", contact.subject),
        html_body: render_template(notification_template, &vars),
    };

    let auto_reply = OutgoingEmail {
        to: contact.email.clone(),
        from: sender_email.to_string(),
        reply_to: Some(contact_email.to_string()),
        subject: "Thanks for reaching out".to_string(),
        html_body: render_template(auto_reply_template, &vars),
    };

    (notification, auto_reply)
}

// ---------------------------------------------------------------------------
// Real AWS-backed implementations
// ---------------------------------------------------------------------------

/// S3-backed template store.
pub struct S3TemplateStore {
    client: aws_sdk_s3::Client,
    bucket: String,
}

impl S3TemplateStore {
    pub fn new(client: aws_sdk_s3::Client, bucket: impl Into<String>) -> Self {
        Self {
            client,
            bucket: bucket.into(),
        }
    }
}

#[async_trait]
impl TemplateStore for S3TemplateStore {
    async fn fetch(&self, key: &str) -> Result<String, String> {
        let obj = self
            .client
            .get_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
            .map_err(|e| format!("s3 get_object {key} failed: {e}"))?;

        let bytes = obj
            .body
            .collect()
            .await
            .map_err(|e| format!("s3 body read {key} failed: {e}"))?
            .into_bytes();

        String::from_utf8(bytes.to_vec())
            .map_err(|e| format!("template {key} is not valid utf-8: {e}"))
    }
}

/// SESv2-backed email sender.
pub struct SesEmailSender {
    client: aws_sdk_sesv2::Client,
}

impl SesEmailSender {
    pub fn new(client: aws_sdk_sesv2::Client) -> Self {
        Self { client }
    }
}

#[async_trait]
impl EmailSender for SesEmailSender {
    async fn send(&self, email: &OutgoingEmail) -> Result<(), String> {
        use aws_sdk_sesv2::types::{Body, Content, Destination, EmailContent, Message};

        let subject = Content::builder()
            .data(&email.subject)
            .charset("UTF-8")
            .build()
            .map_err(|e| format!("ses subject build failed: {e}"))?;

        let html = Content::builder()
            .data(&email.html_body)
            .charset("UTF-8")
            .build()
            .map_err(|e| format!("ses body build failed: {e}"))?;

        let body = Body::builder().html(html).build();
        let message = Message::builder().subject(subject).body(body).build();
        let content = EmailContent::builder().simple(message).build();
        let destination = Destination::builder().to_addresses(&email.to).build();

        let mut req = self
            .client
            .send_email()
            .from_email_address(&email.from)
            .destination(destination)
            .content(content);

        if let Some(reply) = &email.reply_to {
            req = req.reply_to_addresses(reply);
        }

        req.send()
            .await
            .map_err(|e| format!("ses send_email to {} failed: {e}", email.to))?;
        Ok(())
    }
}

#[cfg(test)]
pub mod mock {
    use super::*;
    use std::sync::Mutex;

    /// In-memory template store keyed by object name.
    pub struct MockTemplateStore {
        templates: std::collections::HashMap<String, String>,
        fail: bool,
    }

    impl Default for MockTemplateStore {
        fn default() -> Self {
            Self::new()
        }
    }

    impl MockTemplateStore {
        pub fn new() -> Self {
            let mut templates = std::collections::HashMap::new();
            templates.insert(
                NOTIFICATION_TEMPLATE_KEY.to_string(),
                "<p>From {{name}} ({{email}}): {{subject}} - {{message}}</p>".to_string(),
            );
            templates.insert(
                AUTO_REPLY_TEMPLATE_KEY.to_string(),
                "<p>Hi {{name}}, thanks for your message about {{subject}}.</p>".to_string(),
            );
            Self {
                templates,
                fail: false,
            }
        }

        pub fn failing() -> Self {
            Self {
                templates: std::collections::HashMap::new(),
                fail: true,
            }
        }
    }

    #[async_trait]
    impl TemplateStore for MockTemplateStore {
        async fn fetch(&self, key: &str) -> Result<String, String> {
            if self.fail {
                return Err("mock template store failure".to_string());
            }
            self.templates
                .get(key)
                .cloned()
                .ok_or_else(|| format!("missing template {key}"))
        }
    }

    /// Records every email it is asked to send.
    pub struct MockEmailSender {
        pub sent: Mutex<Vec<OutgoingEmail>>,
        fail: bool,
    }

    impl Default for MockEmailSender {
        fn default() -> Self {
            Self::new()
        }
    }

    impl MockEmailSender {
        pub fn new() -> Self {
            Self {
                sent: Mutex::new(Vec::new()),
                fail: false,
            }
        }
        pub fn failing() -> Self {
            Self {
                sent: Mutex::new(Vec::new()),
                fail: true,
            }
        }
    }

    #[async_trait]
    impl EmailSender for MockEmailSender {
        async fn send(&self, email: &OutgoingEmail) -> Result<(), String> {
            if self.fail {
                return Err("mock send failure".to_string());
            }
            self.sent.lock().unwrap().push(email.clone());
            Ok(())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn contact() -> ValidatedContact {
        ValidatedContact {
            name: "Ada".into(),
            email: "ada@example.com".into(),
            subject: "Hi".into(),
            message: "Hello".into(),
        }
    }

    #[test]
    fn renders_placeholders_with_spacing_variants() {
        let tpl = "{{name}} / {{ email }} / {{subject}}";
        let out = render_template(
            tpl,
            &[("name", "Ada"), ("email", "ada@x.io"), ("subject", "Hi")],
        );
        assert_eq!(out, "Ada / ada@x.io / Hi");
    }

    #[test]
    fn render_html_escapes_values() {
        let out = render_template("{{message}}", &[("message", "<script>&\"'")]);
        assert_eq!(out, "&lt;script&gt;&amp;&quot;&#39;");
    }

    #[test]
    fn build_emails_targets_owner_and_submitter() {
        let c = contact();
        let (notification, auto_reply) = build_emails(
            &c,
            "noreply@site.com",
            "owner@site.com",
            "Notify {{name}} {{message}}",
            "Reply {{name}}",
        );

        assert_eq!(notification.to, "owner@site.com");
        assert_eq!(notification.from, "noreply@site.com");
        assert_eq!(notification.reply_to.as_deref(), Some("ada@example.com"));
        assert!(notification.html_body.contains("Ada"));
        assert!(notification.html_body.contains("Hello"));
        assert!(notification.subject.contains("Hi"));

        assert_eq!(auto_reply.to, "ada@example.com");
        assert_eq!(auto_reply.from, "noreply@site.com");
        assert_eq!(auto_reply.reply_to.as_deref(), Some("owner@site.com"));
        assert!(auto_reply.html_body.contains("Ada"));
    }
}
