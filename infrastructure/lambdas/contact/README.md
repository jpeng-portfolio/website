# contact-lambda

Rust Lambda behind an API Gateway v2 **HTTP API** (`POST /contact`). It validates the contact-form
submission (mirroring the frontend rules), optionally verifies a Cloudflare Turnstile token, and on
success sends two emails via **Amazon SES (v2)** — a notification to the site owner and an
auto-reply to the submitter — using HTML templates stored in S3.

Target runtime: **`provided.al2023`, arm64**.

## Layout

- `src/lib.rs` — library root; re-exports the modules below.
- `src/config.rs` — cold-start env loading. **Fails loudly** on any missing required var.
- `src/validation.rs` — request parsing + field validation (pure, fully tested).
- `src/turnstile.rs` — `TurnstileVerifier` trait + HTTP impl + offline mock.
- `src/email.rs` — `TemplateStore` (S3) and `EmailSender` (SES) traits, template rendering, and
  offline mocks.
- `src/handler.rs` — HTTP routing, CORS, and the email-send orchestration. All branches unit-tested.
- `src/main.rs` — thin binary wrapper wiring real AWS/HTTP clients into the handler.

The binary target is named `bootstrap` (the name `provided.al2*` runtimes expect).

## Environment variables

Required (cold start **fails loudly** if any is unset/empty):

| Var               | Purpose                                                            |
| ----------------- | ----------------------------------------------------------------- |
| `SENDER_EMAIL`    | Verified SES "From" address.                                      |
| `CONTACT_EMAIL`   | Site-owner destination for the notification email.                |
| `ALLOWED_ORIGIN`  | Exact origin allowed by CORS (e.g. `https://example.com`).        |
| `TEMPLATE_BUCKET` | S3 bucket holding `notification.html` and `auto-reply.html`.      |
| `AWS_REGION`      | AWS region (the Lambda runtime sets this; `AWS_DEFAULT_REGION` is accepted as a fallback). |

Optional:

| Var                    | Purpose                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| `TURNSTILE_SECRET_KEY` | When set, the `cf-turnstile-response` token is verified against Cloudflare. When unset, Turnstile is skipped. |
| `RUST_LOG`             | Tracing filter (defaults to `info`).                                      |

## Request / response contract

Request body (JSON):

```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string",
  "cf-turnstile-response": "optional string"
}
```

Validation (all required, non-empty after trim): `name` ≤ 100, `email` ≤ 254 and basic email shape,
`subject` ≤ 200, `message` ≤ 5000.

Responses (always with CORS headers locked to `ALLOWED_ORIGIN` + `Content-Type: application/json`):

| Status | Body                       | When                                              |
| ------ | -------------------------- | ------------------------------------------------- |
| 200    | `{"ok": true}`             | Validated, (verified), both emails sent.          |
| 400    | `{"error": "..."}`         | Bad JSON, validation failure, or Turnstile fail.  |
| 405    | `{"error": "..."}`         | Method other than POST/OPTIONS.                   |
| 204    | (empty)                    | `OPTIONS` preflight (CORS headers only).          |
| 500    | `{"error": "..."}`         | Internal error (template/SES failure). Detail is logged, never leaked. |

## Templates

Store two HTML files in `TEMPLATE_BUCKET`. Placeholders `{{name}}`, `{{email}}`, `{{subject}}`,
`{{message}}` are substituted (HTML-escaped). See `templates/` for reference copies.

- `notification.html` — emailed to the owner (`reply-to` = submitter).
- `auto-reply.html` — emailed to the submitter (`reply-to` = owner).

## Build

Build the `bootstrap` artifact for `provided.al2023` / arm64 with
[`cargo-lambda`](https://www.cargo-lambda.info/):

```bash
cargo lambda build --release --arm64
# → target/lambda/bootstrap/bootstrap
```

## Test

```bash
cargo test
```

All tests run fully offline — no network, no AWS. SES, S3, and Turnstile are mocked behind traits.
