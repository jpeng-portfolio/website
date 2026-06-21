//! Cloudflare Turnstile verification.
//!
//! Verification is behind the [`TurnstileVerifier`] trait so tests can supply
//! an offline mock. The real implementation ([`HttpTurnstileVerifier`]) posts
//! to the Cloudflare siteverify endpoint.

use async_trait::async_trait;
use serde::Deserialize;

pub const SITEVERIFY_URL: &str = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/// Verifies a Turnstile token. Implementations must be safe to call offline in
/// tests (the mock does); the real one performs an HTTP POST.
#[async_trait]
pub trait TurnstileVerifier: Send + Sync {
    /// Returns `Ok(true)` if the token is valid, `Ok(false)` if Cloudflare
    /// rejected it, and `Err` if the verification call itself failed.
    async fn verify(&self, token: &str) -> Result<bool, String>;
}

/// Cloudflare's siteverify JSON response (subset we use).
#[derive(Debug, Deserialize)]
struct SiteVerifyResponse {
    success: bool,
    #[serde(rename = "error-codes", default)]
    error_codes: Vec<String>,
}

/// Real verifier hitting Cloudflare over HTTPS.
pub struct HttpTurnstileVerifier {
    secret: String,
    client: reqwest::Client,
    endpoint: String,
}

impl HttpTurnstileVerifier {
    pub fn new(secret: impl Into<String>) -> Self {
        Self {
            secret: secret.into(),
            client: reqwest::Client::new(),
            endpoint: SITEVERIFY_URL.to_string(),
        }
    }

    /// Override the endpoint (used for integration testing against a fake server).
    pub fn with_endpoint(mut self, endpoint: impl Into<String>) -> Self {
        self.endpoint = endpoint.into();
        self
    }
}

#[async_trait]
impl TurnstileVerifier for HttpTurnstileVerifier {
    async fn verify(&self, token: &str) -> Result<bool, String> {
        let params = [("secret", self.secret.as_str()), ("response", token)];
        let resp = self
            .client
            .post(&self.endpoint)
            .form(&params)
            .send()
            .await
            .map_err(|e| format!("turnstile request failed: {e}"))?;

        let body: SiteVerifyResponse = resp
            .json()
            .await
            .map_err(|e| format!("turnstile response decode failed: {e}"))?;

        if !body.success {
            tracing::warn!(error_codes = ?body.error_codes, "turnstile verification rejected");
        }
        Ok(body.success)
    }
}

#[cfg(test)]
pub mod mock {
    use super::*;
    use std::sync::Mutex;

    /// Test verifier that returns a preset result and records the last token.
    pub struct MockVerifier {
        result: Result<bool, String>,
        pub last_token: Mutex<Option<String>>,
    }

    impl MockVerifier {
        pub fn accepting() -> Self {
            Self {
                result: Ok(true),
                last_token: Mutex::new(None),
            }
        }
        pub fn rejecting() -> Self {
            Self {
                result: Ok(false),
                last_token: Mutex::new(None),
            }
        }
        pub fn erroring() -> Self {
            Self {
                result: Err("boom".to_string()),
                last_token: Mutex::new(None),
            }
        }
    }

    #[async_trait]
    impl TurnstileVerifier for MockVerifier {
        async fn verify(&self, token: &str) -> Result<bool, String> {
            *self.last_token.lock().unwrap() = Some(token.to_string());
            self.result.clone()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::mock::MockVerifier;
    use super::*;

    #[tokio::test]
    async fn accepting_mock_returns_true_and_records_token() {
        let v = MockVerifier::accepting();
        assert_eq!(v.verify("tok-abc").await, Ok(true));
        assert_eq!(v.last_token.lock().unwrap().as_deref(), Some("tok-abc"));
    }

    #[tokio::test]
    async fn rejecting_mock_returns_false() {
        let v = MockVerifier::rejecting();
        assert_eq!(v.verify("bad").await, Ok(false));
    }

    #[tokio::test]
    async fn erroring_mock_surfaces_error() {
        let v = MockVerifier::erroring();
        assert!(v.verify("x").await.is_err());
    }
}
