//! Server-side validation of the contact request, mirroring the frontend rules
//! in `src/components/sections/contact.tsx`.
//!
//! Rules (all fields required & non-empty after trim):
//! - name:    <= 100 chars
//! - email:   <= 254 chars AND matches a basic email shape
//! - subject: <= 200 chars
//! - message: <= 5000 chars
//!
//! The frontend regex is `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`; we reproduce it without
//! a regex dependency since the shape is simple.

use serde::Deserialize;

/// Parsed contact-form request body.
///
/// The optional `cf-turnstile-response` token is carried separately so the
/// validated struct only holds the user-facing message fields.
#[derive(Debug, Clone, Deserialize)]
pub struct ContactRequest {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub email: String,
    #[serde(default)]
    pub subject: String,
    #[serde(default)]
    pub message: String,
    #[serde(rename = "cf-turnstile-response", default)]
    pub turnstile_response: Option<String>,
}

/// A validation failure with a user-facing message (returned in the 400 body).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ValidationError(pub String);

impl ValidationError {
    pub fn message(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for ValidationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

impl std::error::Error for ValidationError {}

/// The trimmed, validated fields ready for templating into emails.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ValidatedContact {
    pub name: String,
    pub email: String,
    pub subject: String,
    pub message: String,
}

/// Basic email shape check equivalent to `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
///
/// Requires: a local part with no whitespace/`@`, an `@`, a domain part with
/// no whitespace/`@` that contains at least one `.` with non-empty,
/// whitespace/`@`-free labels on either side.
fn is_valid_email(email: &str) -> bool {
    let mut parts = email.splitn(2, '@');
    let local = match parts.next() {
        Some(l) => l,
        None => return false,
    };
    let domain = match parts.next() {
        Some(d) => d,
        None => return false,
    };

    let no_bad = |s: &str| !s.is_empty() && !s.chars().any(|c| c.is_whitespace() || c == '@');

    if !no_bad(local) || !no_bad(domain) {
        return false;
    }

    // Domain must contain a dot splitting two non-empty, clean segments.
    match domain.rsplit_once('.') {
        Some((head, tail)) => no_bad(head) && no_bad(tail),
        None => false,
    }
}

/// Validate a raw request, trimming fields first (mirrors the frontend, which
/// trims before validating). Returns the cleaned contact on success.
pub fn validate(req: &ContactRequest) -> Result<ValidatedContact, ValidationError> {
    let name = req.name.trim();
    let email = req.email.trim();
    let subject = req.subject.trim();
    let message = req.message.trim();

    if name.is_empty() || email.is_empty() || subject.is_empty() || message.is_empty() {
        return Err(ValidationError("All fields are required.".to_string()));
    }
    if name.chars().count() > 100 {
        return Err(ValidationError(
            "Name must be 100 characters or fewer.".to_string(),
        ));
    }
    if email.chars().count() > 254 {
        return Err(ValidationError("Email address is too long.".to_string()));
    }
    if !is_valid_email(email) {
        return Err(ValidationError(
            "Please enter a valid email address.".to_string(),
        ));
    }
    if subject.chars().count() > 200 {
        return Err(ValidationError(
            "Subject must be 200 characters or fewer.".to_string(),
        ));
    }
    if message.chars().count() > 5000 {
        return Err(ValidationError(
            "Message must be 5,000 characters or fewer.".to_string(),
        ));
    }

    Ok(ValidatedContact {
        name: name.to_string(),
        email: email.to_string(),
        subject: subject.to_string(),
        message: message.to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ok_req() -> ContactRequest {
        ContactRequest {
            name: "Ada Lovelace".to_string(),
            email: "ada@example.com".to_string(),
            subject: "Hello".to_string(),
            message: "I would like to collaborate.".to_string(),
            turnstile_response: None,
        }
    }

    #[test]
    fn parses_body_with_turnstile_field_renamed() {
        let json = r#"{
            "name": "Ada",
            "email": "ada@example.com",
            "subject": "Hi",
            "message": "Hello there",
            "cf-turnstile-response": "tok-123"
        }"#;
        let req: ContactRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "Ada");
        assert_eq!(req.email, "ada@example.com");
        assert_eq!(req.subject, "Hi");
        assert_eq!(req.message, "Hello there");
        assert_eq!(req.turnstile_response.as_deref(), Some("tok-123"));
    }

    #[test]
    fn parses_body_without_turnstile_field() {
        let json = r#"{"name":"A","email":"a@b.co","subject":"S","message":"M"}"#;
        let req: ContactRequest = serde_json::from_str(json).unwrap();
        assert!(req.turnstile_response.is_none());
    }

    #[test]
    fn accepts_valid_request_and_trims() {
        let mut req = ok_req();
        req.name = "  Ada  ".to_string();
        req.message = "  hi  ".to_string();
        let v = validate(&req).unwrap();
        assert_eq!(v.name, "Ada");
        assert_eq!(v.message, "hi");
    }

    #[test]
    fn rejects_empty_after_trim() {
        let mut req = ok_req();
        req.name = "   ".to_string();
        let err = validate(&req).unwrap_err();
        assert_eq!(err.message(), "All fields are required.");
    }

    #[test]
    fn rejects_missing_each_field() {
        for blank in ["name", "email", "subject", "message"] {
            let mut req = ok_req();
            match blank {
                "name" => req.name = "".into(),
                "email" => req.email = "".into(),
                "subject" => req.subject = "".into(),
                "message" => req.message = "".into(),
                _ => unreachable!(),
            }
            assert!(validate(&req).is_err(), "{blank} empty should fail");
        }
    }

    #[test]
    fn rejects_name_over_100() {
        let mut req = ok_req();
        req.name = "a".repeat(101);
        assert_eq!(
            validate(&req).unwrap_err().message(),
            "Name must be 100 characters or fewer."
        );
        req.name = "a".repeat(100);
        assert!(validate(&req).is_ok());
    }

    #[test]
    fn rejects_email_over_254() {
        let mut req = ok_req();
        let local = "a".repeat(250);
        req.email = format!("{local}@b.co"); // > 254
        assert_eq!(
            validate(&req).unwrap_err().message(),
            "Email address is too long."
        );
    }

    #[test]
    fn rejects_subject_over_200() {
        let mut req = ok_req();
        req.subject = "s".repeat(201);
        assert_eq!(
            validate(&req).unwrap_err().message(),
            "Subject must be 200 characters or fewer."
        );
        req.subject = "s".repeat(200);
        assert!(validate(&req).is_ok());
    }

    #[test]
    fn rejects_message_over_5000() {
        let mut req = ok_req();
        req.message = "m".repeat(5001);
        assert_eq!(
            validate(&req).unwrap_err().message(),
            "Message must be 5,000 characters or fewer."
        );
        req.message = "m".repeat(5000);
        assert!(validate(&req).is_ok());
    }

    #[test]
    fn email_shape_matches_frontend_regex() {
        // valid
        for e in ["a@b.co", "ada.lovelace@sub.example.com", "x+y@d.io"] {
            assert!(is_valid_email(e), "{e} should be valid");
        }
        // invalid
        for e in [
            "plainaddress",
            "@no-local.com",
            "no-at.com",
            "a@nodot",
            "a@b.",
            "a@.com",
            "a b@c.com",
            "a@b c.com",
            "two@@at.com",
        ] {
            assert!(!is_valid_email(e), "{e} should be invalid");
        }
    }
}
