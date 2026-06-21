# Infrastructure (Pulumi, TypeScript)

Serverless-first IaC for the jpeng-portfolio website. One **`prod`** stack,
state in **Pulumi Cloud**, region pinned **us-east-1** (CloudFront ACM
requirement). This program replaces the previous Terraform stack.

```
infrastructure/
├── index.ts                 # SST-style entrypoint: wires modules, exports outputs
├── src/
│   ├── config.ts            # typed, fail-loud stack config + artifact paths
│   ├── dns.ts               # Cloudflare provider + DNS record helper
│   ├── static-site.ts       # S3 + OAC + CloudFront + ACM + apex DNS + content sync
│   └── contact-api.ts       # API Gateway v2 -> Lambda -> SES + templates + DKIM DNS
├── templates/               # SES email templates (uploaded to S3)
│   ├── auto-reply.html
│   └── notification.html
├── lambdas/contact/         # Rust contact Lambda (provided.al2023, arm64)
├── Pulumi.yaml              # project
└── Pulumi.prod.yaml         # prod stack config (secrets are NOT committed)
```

## What it provisions

- **Static hosting** — private `aws.s3.BucketV2` behind a CloudFront
  distribution with **Origin Access Control**, a URI-rewrite **CloudFront
  Function** (`cloudfront-js-2.0`: extensionless/trailing-slash → `index.html`),
  403/404 → `/404/index.html`, a DNS-validated **ACM** cert (TLSv1.2_2021,
  SNI-only), and the Cloudflare apex record.
- **Contact API** — API Gateway v2 **HTTP API** (`POST /contact`, CORS locked to
  the site origin) → **Rust Lambda** (arm64, 256 MB, 10 s) → **SES** (domain
  identity + DKIM). HTML templates live in a private S3 bucket. IAM is
  least-privilege (scoped logs, SES send, template reads).
- **DNS (Cloudflare)** — ACM validation CNAME, SES verification TXT, 3 DKIM
  CNAMEs, apex CNAME → CloudFront. All DNS-only (not proxied).

## Stack outputs

| Output | Used for |
| --- | --- |
| `siteBucketName` | site content bucket |
| `distributionId` | CloudFront invalidation |
| `distributionDomain` | apex DNS target |
| `contactApiUrl` | injected as `NEXT_PUBLIC_CONTACT_API_URL` at build time |

## Resource types verified via the Pulumi MCP server

`aws:s3/bucket:Bucket`, `aws:cloudfront/originAccessControl:OriginAccessControl`,
`aws:cloudfront/function:Function`, `aws:cloudfront/distribution:Distribution`,
`aws:acm/certificate:Certificate`, `aws:apigatewayv2/api:Api`,
`aws:lambda/function:Function`, `aws:ses/domainIdentity:DomainIdentity`,
`aws:ses/domainDkim:DomainDkim`, `cloudflare:index/dnsRecord:DnsRecord` (v5 —
`content`/`ttl`/`type`/`zoneId`), `synced-folder:index:S3BucketFolder`,
`command:local:Command`.

## Config & secrets

Non-secret config lives in `Pulumi.prod.yaml`. Seed secrets once (never
committed):

```bash
pulumi stack select jpaquette2323-gmail-com/jpeng-portfolio-infra/prod
pulumi config set --secret jpeng-portfolio-infra:cloudflareApiToken <token>
pulumi config set --secret jpeng-portfolio-infra:turnstileSecretKey <key>   # optional
# Replace the REPLACE_WITH_* placeholders in Pulumi.prod.yaml:
pulumi config set jpeng-portfolio-infra:cloudflareZoneId <zone-id>
pulumi config set jpeng-portfolio-infra:contactEmail <inbox>
```

The program **fails loudly** if any required value is missing.

## Local usage

```bash
npm install
# Build the Lambda first — the program packages the real artifact:
( cd lambdas/contact \
    && cargo lambda build --release --arm64 --output-format zip \
    && cp "$(find target/lambda -name bootstrap.zip | head -1)" bootstrap.zip )
# Infra-only diff (no content upload):
pulumi preview -c jpeng-portfolio-infra:publishContent=false
```

`publishContent=false` previews/deploys infra only; the deploy workflow flips it
to `true` after the site is built to upload `out/` and invalidate CloudFront.

> **Static publishing trade-off.** The program owns the `out/` objects
> (`synced-folder`, which mirrors `aws s3 sync --delete`) and the invalidation
> (`command:local:Command`, retriggered on a content hash), so a single
> `pulumi up` is the whole deploy — at the cost of routing the invalidation
> through a local `aws` CLI call rather than a native resource. The alternative
> (a separate `aws s3 sync … --delete` + `aws cloudfront create-invalidation`
> workflow step) keeps Pulumi purely about infra but splits the deploy across
> two tools and loses the single-source-of-truth diff.
