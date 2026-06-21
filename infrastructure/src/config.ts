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

export const commonTags: Record<string, string> = {
  project: "jpeng-portfolio",
  managedBy: "pulumi",
  stack: pulumi.getStack(),
};
