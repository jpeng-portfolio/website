import * as pulumi from "@pulumi/pulumi";

/**
 * Typed, fail-loud stack configuration.
 *
 * Required values use `require`/`requireSecret`, which throw at preview/up time
 * if the value is unset — no silent fallbacks or placeholder defaults that let
 * the stack deploy misconfigured.
 */
const cfg = new pulumi.Config();
const awsCfg = new pulumi.Config("aws");

// Region is pinned: CloudFront's viewer certificate must be issued by ACM in
// us-east-1, and the whole stack is serverless and single-region.
const region = awsCfg.get("region") ?? "us-east-1";
if (region !== "us-east-1") {
  throw new Error(
    `aws:region must be us-east-1 (CloudFront ACM requirement); got "${region}".`,
  );
}

export const config = {
  region,

  /** Apex domain the site is served from, e.g. jpcloudengineering.com. */
  domainName: cfg.require("domainName"),

  /** Cloudflare zone id that owns the domain's DNS. */
  cloudflareZoneId: cfg.require("cloudflareZoneId"),

  /** Cloudflare API token with DNS edit rights — secret. */
  cloudflareApiToken: cfg.requireSecret("cloudflareApiToken"),

  /** SES "From" address; must live on the verified domain identity. */
  senderEmail: cfg.require("senderEmail"),

  /** Inbox that receives contact-form notifications. */
  contactEmail: cfg.require("contactEmail"),

  /**
   * Cloudflare Turnstile secret key. Optional: when set, the contact Lambda
   * verifies the token server-side. When unset, server-side verification is
   * skipped (the public site key still drives the widget at build time).
   */
  turnstileSecretKey: cfg.getSecret("turnstileSecretKey"),

  /** DNS record TTL in seconds. Keep low around a cutover. */
  dnsTtl: cfg.getNumber("dnsTtl") ?? 300,

  // --- Owner-gated résumé downloads (M1 auth) --------------------------------
  /**
   * Cognito Hosted UI domain prefix (the `<prefix>.auth.<region>.amazoncognito.com`
   * subdomain). Must be globally unique within the region.
   */
  cognitoDomainPrefix: cfg.require("cognitoDomainPrefix"),

  /**
   * Email/username of the single résumé owner provisioned in the user pool.
   * Secret — it's personal data and this repo is public, so it's seeded
   * out-of-band (never committed), like the other secrets.
   */
  resumeOwnerEmail: cfg.requireSecret("resumeOwnerEmail"),

  /**
   * Initial (temporary) password for the owner user — secret. Cognito forces a
   * change on first sign-in. Fail-loud if unset.
   */
  resumeOwnerTempPassword: cfg.requireSecret("resumeOwnerTempPassword"),

  /**
   * When true, `pulumi up` also syncs the built `out/` to the site bucket and
   * invalidates CloudFront. PR previews set this false for an infra-only diff.
   */
  publishContent: cfg.getBoolean("publishContent") ?? true,
};

/** Path to the static export, relative to the program root. */
export const SITE_BUILD_DIR = "../out";

/**
 * Path to the packaged Rust Lambda zip. The build step runs
 * `cargo lambda build --release --arm64 --output-format zip` and then copies the
 * artifact (whose nested `target/lambda/<bin>/` path depends on the binary name)
 * to this stable location. Using the zip preserves the executable bit on
 * `bootstrap`, which `provided.al2023` requires. Built in CI before every
 * preview/up.
 */
export const LAMBDA_ZIP_PATH = "lambdas/contact/bootstrap.zip";

/**
 * Path to the bundled Lambda@Edge authorizer entry (esbuild output). CI runs
 * `npm ci && npm run build` in `lambdas/edge-authorizer` before every
 * preview/up; the Pulumi program zips this together with a generated
 * `config.json`. Fail-loud if missing.
 */
export const EDGE_AUTHORIZER_DIST = "lambdas/edge-authorizer/dist/index.js";

/**
 * Single OAuth callback path handled by the edge authorizer (cognito-at-edge
 * `parseAuthPath`). Lives under the gated `/resume/files/*` behavior so the same
 * edge function intercepts it. Kept in sync with the Cognito client callback URL.
 */
export const RESUME_PARSE_AUTH_PATH = "resume/files/_callback";

export const commonTags: Record<string, string> = {
  project: "jpeng-portfolio",
  managedBy: "pulumi",
  stack: pulumi.getStack(),
};
