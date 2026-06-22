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
import { createDnsProvider } from "./src/dns";
import { createStaticSite } from "./src/static-site";
import { createContactApi } from "./src/contact-api";
import { createAuth } from "./src/auth";

// One Cloudflare provider (authenticated with the secret API token) owns every
// DNS record: ACM validation, SES verification TXT + DKIM CNAMEs, and the apex.
const cloudflareProvider = createDnsProvider();

// Owner-only auth (Cognito + Lambda@Edge) gates /resume/files/*. Built first so
// the static site can associate the edge authorizer with that behavior.
const auth = createAuth();

const site = createStaticSite(cloudflareProvider, {
  resumeAuthorizerVersionArn: auth.edgeAuthorizerVersionArn,
});
const contact = createContactApi(cloudflareProvider);

// Stack outputs the deploy workflow consumes.
export const siteBucketName = site.bucketName;
export const distributionId = site.distributionId;
export const distributionDomain = site.distributionDomain;
// Injected into the Next.js build as NEXT_PUBLIC_CONTACT_API_URL.
export const contactApiUrl = contact.contactApiUrl;

// Cognito outputs injected into the Next.js build as NEXT_PUBLIC_COGNITO_*.
export const cognitoUserPoolId = auth.userPoolId;
export const cognitoClientId = auth.userPoolClientId;
export const cognitoHostedUiDomain = auth.hostedUiDomain;
export const cognitoRegion = auth.region;
