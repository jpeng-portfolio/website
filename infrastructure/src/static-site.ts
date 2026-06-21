import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as cloudflare from "@pulumi/cloudflare";
import * as synced from "@pulumi/synced-folder";
import * as command from "@pulumi/command";
import { config, commonTags, SITE_BUILD_DIR } from "./config";
import { dnsRecord } from "./dns";

/**
 * Static hosting: private S3 origin behind CloudFront with Origin Access
 * Control, a URI-rewrite CloudFront Function, a DNS-validated ACM certificate
 * (us-east-1), and the Cloudflare apex record. Optionally syncs the built
 * `out/` and invalidates the distribution in the same `pulumi up`.
 *
 * Resource type tokens verified via the Pulumi MCP server:
 *   aws:s3/bucketV2:BucketV2, aws:cloudfront/originAccessControl:OriginAccessControl,
 *   aws:cloudfront/function:Function (runtime cloudfront-js-2.0),
 *   aws:cloudfront/distribution:Distribution, aws:acm/certificate:Certificate,
 *   cloudflare:index/dnsRecord:DnsRecord, synced-folder:index:S3BucketFolder,
 *   command:local:Command.
 */

// CloudFront viewer-request function: map extensionless / trailing-slash URIs to
// the static-export index.html. Mirrors `trailingSlash: true` output layout.
const URI_REWRITE_FN = `function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri += 'index.html';
  } else if (uri.lastIndexOf('.') < uri.lastIndexOf('/')) {
    request.uri += '/index.html';
  }
  return request;
}`;

/** Hash the built site so the invalidation only re-runs when content changes. */
function hashBuildDir(dir: string): string {
  const abs = path.resolve(dir);
  if (!fs.existsSync(abs)) {
    return "no-build";
  }
  const hash = crypto.createHash("sha256");
  const walk = (current: string) => {
    for (const entry of fs.readdirSync(current).sort()) {
      const full = path.join(current, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else {
        hash.update(path.relative(abs, full));
        hash.update(fs.readFileSync(full));
      }
    }
  };
  walk(abs);
  return hash.digest("hex");
}

export interface StaticSite {
  bucketName: pulumi.Output<string>;
  distributionId: pulumi.Output<string>;
  distributionDomain: pulumi.Output<string>;
}

export function createStaticSite(
  cloudflareProvider: cloudflare.Provider,
): StaticSite {
  // --- Private origin bucket -------------------------------------------------
  // Dot-free bucket name: a dotted name (e.g. the domain) breaks CloudFront's
  // HTTPS connection to the S3 origin because the `*.s3.<region>.amazonaws.com`
  // certificate can't match the extra dot levels.
  const bucket = new aws.s3.BucketV2("site", {
    bucket: `${config.domainName.replace(/\./g, "-")}-site`,
    tags: { ...commonTags, role: "static-site" },
  });

  // BucketOwnerEnforced is the modern default but disables the object ACLs that
  // synced-folder sets; ObjectWriter keeps ACLs working while the public-access
  // block below guarantees nothing is ever exposed publicly.
  new aws.s3.BucketOwnershipControls("site-ownership", {
    bucket: bucket.id,
    rule: { objectOwnership: "ObjectWriter" },
  });

  new aws.s3.BucketPublicAccessBlock("site-public-access-block", {
    bucket: bucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
  });

  new aws.s3.BucketServerSideEncryptionConfigurationV2("site-encryption", {
    bucket: bucket.id,
    rules: [{ applyServerSideEncryptionByDefault: { sseAlgorithm: "AES256" } }],
  });

  // --- Origin Access Control -------------------------------------------------
  const oac = new aws.cloudfront.OriginAccessControl("site-oac", {
    name: pulumi.interpolate`${config.domainName}-oac`,
    originAccessControlOriginType: "s3",
    signingBehavior: "always",
    signingProtocol: "sigv4",
  });

  const rewriteFn = new aws.cloudfront.Function("site-uri-rewrite", {
    name: pulumi.interpolate`${bucket.bucket}-uri-rewrite`,
    runtime: "cloudfront-js-2.0",
    comment: "Rewrite extensionless/trailing-slash URIs to index.html",
    publish: true,
    code: URI_REWRITE_FN,
  });

  // --- ACM certificate (DNS-validated, us-east-1) ----------------------------
  const cert = new aws.acm.Certificate("site-cert", {
    domainName: config.domainName,
    validationMethod: "DNS",
    tags: { ...commonTags, role: "static-site" },
  });

  const dvo = cert.domainValidationOptions;
  const certValidationRecord = dnsRecord(
    {
      name: "site-cert-validation",
      recordName: dvo.apply((d) => d[0].resourceRecordName.replace(/\.$/, "")),
      type: dvo.apply((d) => d[0].resourceRecordType),
      content: dvo.apply((d) => d[0].resourceRecordValue.replace(/\.$/, "")),
      // Validation CNAMEs are stable; a 1-minute TTL is plenty and re-validates fast.
      ttl: 60,
      proxied: false,
    },
    cloudflareProvider,
  );

  const certValidation = new aws.acm.CertificateValidation("site-cert-validation", {
    certificateArn: cert.arn,
    validationRecordFqdns: [
      dvo.apply((d) => d[0].resourceRecordName.replace(/\.$/, "")),
    ],
  }, { dependsOn: [certValidationRecord] });

  // --- CloudFront distribution ----------------------------------------------
  const originId = "s3-site-origin";
  const distribution = new aws.cloudfront.Distribution("site-cdn", {
    enabled: true,
    isIpv6Enabled: true,
    httpVersion: "http2and3",
    defaultRootObject: "index.html",
    priceClass: "PriceClass_100",
    aliases: [config.domainName],
    comment: pulumi.interpolate`${config.domainName} static site`,
    origins: [
      {
        originId,
        domainName: bucket.bucketRegionalDomainName,
        originAccessControlId: oac.id,
        s3OriginConfig: { originAccessIdentity: "" },
      },
    ],
    defaultCacheBehavior: {
      targetOriginId: originId,
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD"],
      compress: true,
      // Managed "CachingOptimized" policy — avoids the deprecated forwardedValues.
      cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6",
      functionAssociations: [
        { eventType: "viewer-request", functionArn: rewriteFn.arn },
      ],
    },
    customErrorResponses: [
      {
        errorCode: 403,
        responseCode: 404,
        responsePagePath: "/404/index.html",
        errorCachingMinTtl: 10,
      },
      {
        errorCode: 404,
        responseCode: 404,
        responsePagePath: "/404/index.html",
        errorCachingMinTtl: 10,
      },
    ],
    restrictions: { geoRestriction: { restrictionType: "none" } },
    viewerCertificate: {
      // Reference the validated cert so the distribution waits for issuance.
      acmCertificateArn: certValidation.certificateArn,
      sslSupportMethod: "sni-only",
      minimumProtocolVersion: "TLSv1.2_2021",
    },
    tags: { ...commonTags, role: "static-site" },
  });

  // Bucket policy grants the distribution (via OAC) read access. It depends on
  // the distribution ARN, so the reference itself orders policy after the CDN.
  new aws.s3.BucketPolicy("site-bucket-policy", {
    bucket: bucket.id,
    policy: pulumi
      .all([bucket.arn, distribution.arn])
      .apply(([bucketArn, distArn]) =>
        JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "AllowCloudFrontServicePrincipalReadOnly",
              Effect: "Allow",
              Principal: { Service: "cloudfront.amazonaws.com" },
              Action: "s3:GetObject",
              Resource: `${bucketArn}/*`,
              Condition: { StringEquals: { "AWS:SourceArn": distArn } },
            },
          ],
        }),
      ),
  });

  // Apex DNS -> CloudFront (DNS-only; CloudFront terminates TLS via the SNI cert).
  dnsRecord(
    {
      name: "site-apex",
      recordName: config.domainName,
      type: "CNAME",
      content: distribution.domainName,
      proxied: false,
    },
    cloudflareProvider,
    { dependsOn: [distribution] },
  );

  // --- Content publish (optional; skipped on PR previews) --------------------
  if (config.publishContent) {
    const buildAbs = path.resolve(SITE_BUILD_DIR);
    if (!fs.existsSync(buildAbs)) {
      throw new Error(
        `publishContent is true but the static export was not found at "${buildAbs}". ` +
          `Run \`npm run build\` (with NEXT_PUBLIC_* set) before this pulumi up.`,
      );
    }

    const folder = new synced.S3BucketFolder("site-content", {
      path: SITE_BUILD_DIR,
      bucketName: bucket.bucket,
      acl: "private",
      managedObjects: true,
    });

    new command.local.Command(
      "site-invalidation",
      {
        create: pulumi.interpolate`aws cloudfront create-invalidation --distribution-id ${distribution.id} --paths "/*"`,
        update: pulumi.interpolate`aws cloudfront create-invalidation --distribution-id ${distribution.id} --paths "/*"`,
        triggers: [hashBuildDir(SITE_BUILD_DIR), distribution.id],
      },
      { dependsOn: [folder] },
    );
  }

  return {
    bucketName: bucket.bucket,
    distributionId: distribution.id,
    distributionDomain: distribution.domainName,
  };
}
