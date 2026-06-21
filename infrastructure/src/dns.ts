import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";
import { config } from "./config";

/**
 * Cloudflare DNS.
 *
 * Verified via the Pulumi MCP server: the v5+ provider exposes DNS records as
 * `cloudflare:index/dnsRecord:DnsRecord` with required inputs `name`, `ttl`,
 * `type` and `zoneId`, and the record body in `content` (the old `value`
 * attribute was removed). All records below are DNS-only (not proxied) so the
 * CloudFront SNI certificate and SES verification resolve to the real targets.
 */
export function createDnsProvider(): cloudflare.Provider {
  return new cloudflare.Provider("cloudflare", {
    apiToken: config.cloudflareApiToken,
  });
}

export interface DnsRecordArgs {
  /** Logical resource name. */
  name: string;
  /** Fully-qualified record name (no trailing dot), or "@" for the apex. */
  recordName: pulumi.Input<string>;
  type: pulumi.Input<string>;
  content: pulumi.Input<string>;
  /** Override the default (cutover-friendly) TTL when needed. */
  ttl?: number;
  proxied?: boolean;
}

export function dnsRecord(
  args: DnsRecordArgs,
  provider: cloudflare.Provider,
  opts: pulumi.ResourceOptions = {},
): cloudflare.DnsRecord {
  return new cloudflare.DnsRecord(
    args.name,
    {
      zoneId: config.cloudflareZoneId,
      name: args.recordName,
      type: args.type,
      content: args.content,
      ttl: args.ttl ?? config.dnsTtl,
      proxied: args.proxied ?? false,
    },
    { provider, ...opts },
  );
}
