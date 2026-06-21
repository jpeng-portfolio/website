//! Cold-start configuration loaded from environment variables.
//!
//! Required variables FAIL LOUDLY when unset — there are no silent fallbacks
//! or placeholder defaults that would let the Lambda run misconfigured.

use std::env::VarError;

/// Runtime configuration for the contact Lambda.
#[derive(Debug, Clone)]
pub struct Config {
    /// Verified SES sender address (the "From").
    pub sender_email: String,
    /// Site-owner destination for the notification email.
    pub contact_email: String,
    /// Exact origin allowed by CORS (e.g. `https://example.com`).
    pub allowed_origin: String,
    /// S3 bucket holding `auto-reply.html` / `notification.html`.
    pub template_bucket: String,
    /// AWS region (must be present so the SDK is pinned, never guessed).
    pub aws_region: String,
    /// Optional Cloudflare Turnstile secret. When `Some`, the token is verified.
    pub turnstile_secret_key: Option<String>,
}

impl Config {
    /// Load configuration from the process environment.
    ///
    /// Returns a human-readable error listing every missing required variable
    /// so a misconfiguration surfaces loudly at cold start.
    pub fn from_env() -> Result<Self, String> {
        Self::from_lookup(|key| std::env::var(key))
    }

    /// Load configuration from an injectable lookup closure (used by tests).
    pub fn from_lookup<F>(lookup: F) -> Result<Self, String>
    where
        F: Fn(&str) -> Result<String, VarError>,
    {
        let mut missing: Vec<&'static str> = Vec::new();

        let mut required = |key: &'static str| -> String {
            match lookup(key) {
                Ok(v) if !v.trim().is_empty() => v,
                _ => {
                    missing.push(key);
                    String::new()
                }
            }
        };

        let sender_email = required("SENDER_EMAIL");
        let contact_email = required("CONTACT_EMAIL");
        let allowed_origin = required("ALLOWED_ORIGIN");
        let template_bucket = required("TEMPLATE_BUCKET");
        // Accept either AWS_REGION (set by the Lambda runtime) or AWS_DEFAULT_REGION.
        let aws_region = lookup("AWS_REGION")
            .ok()
            .filter(|v| !v.trim().is_empty())
            .or_else(|| {
                lookup("AWS_DEFAULT_REGION")
                    .ok()
                    .filter(|v| !v.trim().is_empty())
            })
            .unwrap_or_else(|| {
                missing.push("AWS_REGION");
                String::new()
            });

        if !missing.is_empty() {
            return Err(format!(
                "missing required environment variable(s): {}",
                missing.join(", ")
            ));
        }

        // Optional: only enables Turnstile verification when non-empty.
        let turnstile_secret_key = lookup("TURNSTILE_SECRET_KEY")
            .ok()
            .filter(|v| !v.trim().is_empty());

        Ok(Self {
            sender_email,
            contact_email,
            allowed_origin,
            template_bucket,
            aws_region,
            turnstile_secret_key,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    fn lookup_from(map: HashMap<&'static str, &'static str>) -> impl Fn(&str) -> Result<String, VarError> {
        move |key: &str| match map.get(key) {
            Some(v) => Ok((*v).to_string()),
            None => Err(VarError::NotPresent),
        }
    }

    fn full_map() -> HashMap<&'static str, &'static str> {
        let mut m = HashMap::new();
        m.insert("SENDER_EMAIL", "noreply@example.com");
        m.insert("CONTACT_EMAIL", "owner@example.com");
        m.insert("ALLOWED_ORIGIN", "https://example.com");
        m.insert("TEMPLATE_BUCKET", "templates-bucket");
        m.insert("AWS_REGION", "us-east-1");
        m
    }

    #[test]
    fn loads_all_required_vars() {
        let cfg = Config::from_lookup(lookup_from(full_map())).expect("should load");
        assert_eq!(cfg.sender_email, "noreply@example.com");
        assert_eq!(cfg.contact_email, "owner@example.com");
        assert_eq!(cfg.allowed_origin, "https://example.com");
        assert_eq!(cfg.template_bucket, "templates-bucket");
        assert_eq!(cfg.aws_region, "us-east-1");
        assert!(cfg.turnstile_secret_key.is_none());
    }

    #[test]
    fn turnstile_secret_is_optional_but_picked_up() {
        let mut m = full_map();
        m.insert("TURNSTILE_SECRET_KEY", "secret-123");
        let cfg = Config::from_lookup(lookup_from(m)).expect("should load");
        assert_eq!(cfg.turnstile_secret_key.as_deref(), Some("secret-123"));
    }

    #[test]
    fn empty_turnstile_secret_is_treated_as_absent() {
        let mut m = full_map();
        m.insert("TURNSTILE_SECRET_KEY", "   ");
        let cfg = Config::from_lookup(lookup_from(m)).expect("should load");
        assert!(cfg.turnstile_secret_key.is_none());
    }

    #[test]
    fn fails_loudly_listing_all_missing_required_vars() {
        let err = Config::from_lookup(lookup_from(HashMap::new())).unwrap_err();
        for key in [
            "SENDER_EMAIL",
            "CONTACT_EMAIL",
            "ALLOWED_ORIGIN",
            "TEMPLATE_BUCKET",
            "AWS_REGION",
        ] {
            assert!(err.contains(key), "error should mention {key}: {err}");
        }
    }

    #[test]
    fn empty_required_var_counts_as_missing() {
        let mut m = full_map();
        m.insert("SENDER_EMAIL", "   ");
        let err = Config::from_lookup(lookup_from(m)).unwrap_err();
        assert!(err.contains("SENDER_EMAIL"));
    }

    #[test]
    fn falls_back_to_aws_default_region() {
        let mut m = full_map();
        m.remove("AWS_REGION");
        m.insert("AWS_DEFAULT_REGION", "eu-west-1");
        let cfg = Config::from_lookup(lookup_from(m)).expect("should load");
        assert_eq!(cfg.aws_region, "eu-west-1");
    }
}
