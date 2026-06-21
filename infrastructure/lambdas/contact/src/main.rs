//! Thin binary wrapper: loads config, builds real AWS / HTTP clients, and wires
//! them into [`contact_lambda::handle`]. All logic of interest lives in the
//! library so it can be unit-tested offline.

use std::sync::Arc;

use lambda_http::{run, service_fn, Error, Request, Response};

use contact_lambda::email::{S3TemplateStore, SesEmailSender};
use contact_lambda::handler::{handle, Deps};
use contact_lambda::turnstile::{HttpTurnstileVerifier, TurnstileVerifier};
use contact_lambda::Config;

/// Holds the long-lived clients built once at cold start.
struct Runtime {
    config: Config,
    verifier: Option<Box<dyn TurnstileVerifier>>,
    templates: S3TemplateStore,
    mailer: SesEmailSender,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .without_time()
        .with_target(false)
        .init();

    // FAIL LOUDLY on missing required env at cold start.
    let config = Config::from_env().map_err(|e| Error::from(e.to_string()))?;

    // Pin the AWS SDK to the configured region — never guess.
    let region = aws_config::Region::new(config.aws_region.clone());
    let aws_cfg = aws_config::defaults(aws_config::BehaviorVersion::latest())
        .region(region)
        .load()
        .await;

    let templates = S3TemplateStore::new(
        aws_sdk_s3::Client::new(&aws_cfg),
        config.template_bucket.clone(),
    );
    let mailer = SesEmailSender::new(aws_sdk_sesv2::Client::new(&aws_cfg));

    let verifier: Option<Box<dyn TurnstileVerifier>> = config
        .turnstile_secret_key
        .as_ref()
        .map(|secret| Box::new(HttpTurnstileVerifier::new(secret.clone())) as Box<dyn TurnstileVerifier>);

    let runtime = Arc::new(Runtime {
        config,
        verifier,
        templates,
        mailer,
    });

    run(service_fn(move |req: Request| {
        let runtime = Arc::clone(&runtime);
        async move {
            let deps = Deps {
                config: &runtime.config,
                verifier: runtime.verifier.as_deref(),
                templates: &runtime.templates,
                mailer: &runtime.mailer,
            };
            Ok::<Response<lambda_http::Body>, Error>(handle(req, &deps).await)
        }
    }))
    .await
}
