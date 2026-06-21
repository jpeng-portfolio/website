//! Core HTTP handler: method routing, CORS, validation, Turnstile, and the
//! two-email send orchestration. Built on `lambda_http` types so the binary is
//! a thin wrapper, but every branch here is unit-testable with mock deps.

use lambda_http::{Body, Request, Response};
use serde_json::json;

use crate::config::Config;
use crate::email::{
    build_emails, EmailSender, TemplateStore, AUTO_REPLY_TEMPLATE_KEY, NOTIFICATION_TEMPLATE_KEY,
};
use crate::turnstile::TurnstileVerifier;
use crate::validation::{validate, ContactRequest};

/// Injected dependencies for the handler. The verifier is optional: when
/// `None`, Turnstile verification is skipped (no secret configured).
pub struct Deps<'a> {
    pub config: &'a Config,
    pub verifier: Option<&'a dyn TurnstileVerifier>,
    pub templates: &'a dyn TemplateStore,
    pub mailer: &'a dyn EmailSender,
}

/// Internal error used to build a 500 response. Carries a log message; the
/// client only ever sees a generic body.
#[derive(Debug)]
pub struct AppError(pub String);

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

impl std::error::Error for AppError {}

const CONTENT_TYPE_JSON: &str = "application/json";

/// Build a response with the locked-down CORS headers + JSON content type.
fn respond(allowed_origin: &str, status: u16, body: serde_json::Value) -> Response<Body> {
    Response::builder()
        .status(status)
        .header("content-type", CONTENT_TYPE_JSON)
        .header("access-control-allow-origin", allowed_origin)
        .header("access-control-allow-methods", "POST, OPTIONS")
        .header("access-control-allow-headers", "content-type")
        .header("access-control-max-age", "86400")
        .header("vary", "Origin")
        .body(Body::from(body.to_string()))
        // builder() only errors on invalid header/status; ours are static-valid.
        .expect("response should build")
}

fn ok_response(allowed_origin: &str) -> Response<Body> {
    respond(allowed_origin, 200, json!({ "ok": true }))
}

fn error_response(allowed_origin: &str, status: u16, message: &str) -> Response<Body> {
    respond(allowed_origin, status, json!({ "error": message }))
}

/// Empty 204 preflight response carrying just the CORS headers.
fn preflight_response(allowed_origin: &str) -> Response<Body> {
    Response::builder()
        .status(204)
        .header("access-control-allow-origin", allowed_origin)
        .header("access-control-allow-methods", "POST, OPTIONS")
        .header("access-control-allow-headers", "content-type")
        .header("access-control-max-age", "86400")
        .header("vary", "Origin")
        .body(Body::Empty)
        .expect("preflight response should build")
}

/// Handle one request. Never returns `Err`; all outcomes map to an HTTP
/// response with the correct status + CORS headers.
pub async fn handle(req: Request, deps: &Deps<'_>) -> Response<Body> {
    let origin = deps.config.allowed_origin.as_str();

    // CORS preflight.
    if req.method() == lambda_http::http::Method::OPTIONS {
        return preflight_response(origin);
    }

    // Only POST is accepted.
    if req.method() != lambda_http::http::Method::POST {
        return error_response(origin, 405, "Method not allowed.");
    }

    // Parse JSON body.
    let body_bytes = req.body();
    let parsed: ContactRequest = match serde_json::from_slice(body_bytes.as_ref()) {
        Ok(p) => p,
        Err(_) => return error_response(origin, 400, "Invalid request body."),
    };

    // Validate fields.
    let contact = match validate(&parsed) {
        Ok(c) => c,
        Err(e) => return error_response(origin, 400, e.message()),
    };

    // Turnstile verification (only when a secret is configured).
    if let Some(verifier) = deps.verifier {
        let token = parsed.turnstile_response.as_deref().unwrap_or("");
        if token.is_empty() {
            return error_response(origin, 400, "Captcha verification required.");
        }
        match verifier.verify(token).await {
            Ok(true) => {}
            Ok(false) => return error_response(origin, 400, "Captcha verification failed."),
            Err(e) => {
                tracing::error!(error = %e, "turnstile verification error");
                return error_response(origin, 500, "Internal server error.");
            }
        }
    }

    // Orchestrate the two emails. Any failure is a 500 with a generic body.
    match send_emails(deps, &contact).await {
        Ok(()) => ok_response(origin),
        Err(e) => {
            tracing::error!(error = %e, "failed to send contact emails");
            error_response(origin, 500, "Internal server error.")
        }
    }
}

/// Fetch templates and send both notification + auto-reply emails.
async fn send_emails(
    deps: &Deps<'_>,
    contact: &crate::validation::ValidatedContact,
) -> Result<(), AppError> {
    let notification_tpl = deps
        .templates
        .fetch(NOTIFICATION_TEMPLATE_KEY)
        .await
        .map_err(AppError)?;
    let auto_reply_tpl = deps
        .templates
        .fetch(AUTO_REPLY_TEMPLATE_KEY)
        .await
        .map_err(AppError)?;

    let (notification, auto_reply) = build_emails(
        contact,
        &deps.config.sender_email,
        &deps.config.contact_email,
        &notification_tpl,
        &auto_reply_tpl,
    );

    deps.mailer.send(&notification).await.map_err(AppError)?;
    deps.mailer.send(&auto_reply).await.map_err(AppError)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::email::mock::{MockEmailSender, MockTemplateStore};
    use crate::turnstile::mock::MockVerifier;
    use lambda_http::http::Method;

    fn test_config() -> Config {
        Config {
            sender_email: "noreply@example.com".into(),
            contact_email: "owner@example.com".into(),
            allowed_origin: "https://example.com".into(),
            template_bucket: "bucket".into(),
            aws_region: "us-east-1".into(),
            turnstile_secret_key: None,
        }
    }

    fn build_request(method: Method, body: &str) -> Request {
        let mut builder = lambda_http::http::Request::builder().method(method);
        builder = builder.header("content-type", "application/json");
        builder.body(Body::from(body.to_string())).unwrap()
    }

    fn valid_body() -> &'static str {
        r#"{"name":"Ada","email":"ada@example.com","subject":"Hi","message":"Hello there"}"#
    }

    fn assert_cors(resp: &Response<Body>) {
        assert_eq!(
            resp.headers()
                .get("access-control-allow-origin")
                .unwrap(),
            "https://example.com"
        );
    }

    #[tokio::test]
    async fn happy_path_sends_both_emails_and_returns_ok() {
        let config = test_config();
        let templates = MockTemplateStore::new();
        let mailer = MockEmailSender::new();
        let deps = Deps {
            config: &config,
            verifier: None,
            templates: &templates,
            mailer: &mailer,
        };

        let resp = handle(build_request(Method::POST, valid_body()), &deps).await;

        assert_eq!(resp.status(), 200);
        assert_cors(&resp);
        assert_eq!(
            resp.headers().get("content-type").unwrap(),
            "application/json"
        );
        if let Body::Text(t) = resp.body() {
            assert_eq!(t, r#"{"ok":true}"#);
        } else {
            panic!("expected text body");
        }

        let sent = mailer.sent.lock().unwrap();
        assert_eq!(sent.len(), 2, "should send notification + auto-reply");
        // First the owner notification, then the submitter auto-reply.
        assert_eq!(sent[0].to, "owner@example.com");
        assert_eq!(sent[1].to, "ada@example.com");
    }

    #[tokio::test]
    async fn validation_failure_returns_400_with_error_body() {
        let config = test_config();
        let templates = MockTemplateStore::new();
        let mailer = MockEmailSender::new();
        let deps = Deps {
            config: &config,
            verifier: None,
            templates: &templates,
            mailer: &mailer,
        };

        let body = r#"{"name":"","email":"ada@example.com","subject":"Hi","message":"Hello"}"#;
        let resp = handle(build_request(Method::POST, body), &deps).await;

        assert_eq!(resp.status(), 400);
        assert_cors(&resp);
        if let Body::Text(t) = resp.body() {
            let v: serde_json::Value = serde_json::from_str(t).unwrap();
            assert!(v.get("error").is_some());
        } else {
            panic!("expected text body");
        }
        assert_eq!(mailer.sent.lock().unwrap().len(), 0, "no email on invalid");
    }

    #[tokio::test]
    async fn invalid_json_returns_400() {
        let config = test_config();
        let templates = MockTemplateStore::new();
        let mailer = MockEmailSender::new();
        let deps = Deps {
            config: &config,
            verifier: None,
            templates: &templates,
            mailer: &mailer,
        };

        let resp = handle(build_request(Method::POST, "not json"), &deps).await;
        assert_eq!(resp.status(), 400);
        assert_cors(&resp);
    }

    #[tokio::test]
    async fn non_post_returns_405() {
        let config = test_config();
        let templates = MockTemplateStore::new();
        let mailer = MockEmailSender::new();
        let deps = Deps {
            config: &config,
            verifier: None,
            templates: &templates,
            mailer: &mailer,
        };

        let resp = handle(build_request(Method::GET, valid_body()), &deps).await;
        assert_eq!(resp.status(), 405);
        assert_cors(&resp);
    }

    #[tokio::test]
    async fn options_preflight_returns_204_with_cors() {
        let config = test_config();
        let templates = MockTemplateStore::new();
        let mailer = MockEmailSender::new();
        let deps = Deps {
            config: &config,
            verifier: None,
            templates: &templates,
            mailer: &mailer,
        };

        let resp = handle(build_request(Method::OPTIONS, ""), &deps).await;
        assert_eq!(resp.status(), 204);
        assert_cors(&resp);
        assert_eq!(
            resp.headers()
                .get("access-control-allow-methods")
                .unwrap(),
            "POST, OPTIONS"
        );
    }

    #[tokio::test]
    async fn turnstile_accepted_allows_send() {
        let config = test_config();
        let templates = MockTemplateStore::new();
        let mailer = MockEmailSender::new();
        let verifier = MockVerifier::accepting();
        let deps = Deps {
            config: &config,
            verifier: Some(&verifier),
            templates: &templates,
            mailer: &mailer,
        };

        let body = r#"{"name":"Ada","email":"ada@example.com","subject":"Hi","message":"Hello","cf-turnstile-response":"tok-1"}"#;
        let resp = handle(build_request(Method::POST, body), &deps).await;

        assert_eq!(resp.status(), 200);
        assert_eq!(verifier.last_token.lock().unwrap().as_deref(), Some("tok-1"));
        assert_eq!(mailer.sent.lock().unwrap().len(), 2);
    }

    #[tokio::test]
    async fn turnstile_rejected_returns_400_and_sends_nothing() {
        let config = test_config();
        let templates = MockTemplateStore::new();
        let mailer = MockEmailSender::new();
        let verifier = MockVerifier::rejecting();
        let deps = Deps {
            config: &config,
            verifier: Some(&verifier),
            templates: &templates,
            mailer: &mailer,
        };

        let body = r#"{"name":"Ada","email":"ada@example.com","subject":"Hi","message":"Hello","cf-turnstile-response":"bad"}"#;
        let resp = handle(build_request(Method::POST, body), &deps).await;

        assert_eq!(resp.status(), 400);
        assert_eq!(mailer.sent.lock().unwrap().len(), 0);
    }

    #[tokio::test]
    async fn turnstile_required_but_missing_token_returns_400() {
        let config = test_config();
        let templates = MockTemplateStore::new();
        let mailer = MockEmailSender::new();
        let verifier = MockVerifier::accepting();
        let deps = Deps {
            config: &config,
            verifier: Some(&verifier),
            templates: &templates,
            mailer: &mailer,
        };

        // No cf-turnstile-response present.
        let resp = handle(build_request(Method::POST, valid_body()), &deps).await;
        assert_eq!(resp.status(), 400);
        assert_eq!(mailer.sent.lock().unwrap().len(), 0);
    }

    #[tokio::test]
    async fn template_fetch_failure_returns_500() {
        let config = test_config();
        let templates = MockTemplateStore::failing();
        let mailer = MockEmailSender::new();
        let deps = Deps {
            config: &config,
            verifier: None,
            templates: &templates,
            mailer: &mailer,
        };

        let resp = handle(build_request(Method::POST, valid_body()), &deps).await;
        assert_eq!(resp.status(), 500);
        assert_cors(&resp);
        if let Body::Text(t) = resp.body() {
            // Internal detail is never leaked.
            assert!(t.contains("Internal server error"));
            assert!(!t.contains("mock template store failure"));
        }
    }

    #[tokio::test]
    async fn ses_failure_returns_500() {
        let config = test_config();
        let templates = MockTemplateStore::new();
        let mailer = MockEmailSender::failing();
        let deps = Deps {
            config: &config,
            verifier: None,
            templates: &templates,
            mailer: &mailer,
        };

        let resp = handle(build_request(Method::POST, valid_body()), &deps).await;
        assert_eq!(resp.status(), 500);
    }
}
