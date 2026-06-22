/**
 * jpeng-portfolio infrastructure — single SST-style Pulumi entrypoint.
 *
 * `pulumi preview` / `pulumi up` run against this program for the one
 * `prod` stack. Ordering between resources is inferred from passing upstream
 * outputs into downstream inputs; where a dependency isn't expressed through a
 * data reference (IAM policy -> Lambda, ACM validation -> CloudFront, content
 * sync -> invalidation) an explicit `dependsOn` is set in the modules.
 *
 * Every AWS and Cloudflare resource type token used here was verified against
 * the Pulumi Registry via the Pulumi MCP server (see the per-module headers).
 */
import * as pulumi from "@pulumi/pulumi";
import { config } from "./src/config";
import { createDnsProvider } from "./src/dns";
import { createStaticSite } from "./src/static-site";
import { createContactApi } from "./src/contact-api";

// One Cloudflare provider (authenticated with the secret API token) owns every
// DNS record: ACM validation, SES verification TXT + DKIM CNAMEs, and the site
// record (apex on prod, `pr-<N>.<domain>` on a preview).
const cloudflareProvider = createDnsProvider();

const site = createStaticSite(cloudflareProvider);

// The contact API is apex-shared and slow to provision, so PR preview stacks
// skip it (deployContactApi=false). Previews build the static site only.
const contact = config.deployContactApi
  ? createContactApi(cloudflareProvider)
  : undefined;

// Stack outputs the deploy/teardown workflows consume.
export const siteBucketName = site.bucketName;
export const distributionId = site.distributionId;
export const distributionDomain = site.distributionDomain;
// The public URL this stack serves — surfaced in the GitHub Actions summary.
export const siteUrl = `https://${config.siteHost}`;
// Injected into the Next.js build as NEXT_PUBLIC_CONTACT_API_URL. Empty on
// preview stacks (no contact API); the preview build supplies its own value.
export const contactApiUrl = contact
  ? contact.contactApiUrl
  : pulumi.output("");
