import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as cloudflare from "@pulumi/cloudflare";
import { config, commonTags, LAMBDA_ZIP_PATH } from "./config";
import { dnsRecord } from "./dns";

/**
 * Serverless contact API: API Gateway v2 HTTP API -> Rust Lambda (arm64,
 * provided.al2023) -> SES, with HTML email templates in a private S3 bucket and
 * Cloudflare DNS for SES domain verification + DKIM.
 *
 * Resource type tokens verified via the Pulumi MCP server:
 *   aws:apigatewayv2/api:Api (HTTP, corsConfiguration),
 *   aws:lambda/function:Function (role required, code = Archive, arm64),
 *   aws:ses/domainIdentity:DomainIdentity, aws:ses/domainDkim:DomainDkim,
 *   cloudflare:index/dnsRecord:DnsRecord.
 */

/** filebase64sha256 of the lambda zip, or undefined if it hasn't been built. */
function zipSha256(zipPath: string): string | undefined {
  const abs = path.resolve(zipPath);
  if (!fs.existsSync(abs)) {
    return undefined;
  }
  return crypto.createHash("sha256").update(fs.readFileSync(abs)).digest("base64");
}

export interface ContactApi {
  contactApiUrl: pulumi.Output<string>;
}

export function createContactApi(
  cloudflareProvider: cloudflare.Provider,
): ContactApi {
  // The contact API is apex-shared (SES domain identity + DKIM live on the apex
  // domain), so it only ships on stacks that own the apex. Fail loud if the
  // addresses it needs are unset rather than deploying a misconfigured API.
  const senderEmail = config.senderEmail;
  const contactEmail = config.contactEmail;
  if (!senderEmail || !contactEmail) {
    throw new Error(
      "senderEmail and contactEmail are required when deployContactApi is true. " +
        "Set them with `pulumi config set jpeng-portfolio-infra:senderEmail …` " +
        "(and contactEmail), or set deployContactApi=false for a preview stack.",
    );
  }

  // Lambda/bucket names can't contain dots — derive a DNS-safe slug.
  const slug = config.domainName.replace(/\./g, "-");

  // --- Email template store --------------------------------------------------
  const templatesBucket = new aws.s3.Bucket("contact-templates", {
    bucket: `${slug}-contact-templates`,
    tags: { ...commonTags, role: "contact-api" },
  });

  new aws.s3.BucketPublicAccessBlock("contact-templates-pab", {
    bucket: templatesBucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true,
  });

  new aws.s3.BucketServerSideEncryptionConfiguration("contact-templates-sse", {
    bucket: templatesBucket.id,
    rules: [{ applyServerSideEncryptionByDefault: { sseAlgorithm: "AES256" } }],
  });

  for (const file of ["auto-reply.html", "notification.html"]) {
    new aws.s3.BucketObjectv2(`contact-template-${file}`, {
      bucket: templatesBucket.id,
      key: file,
      source: new pulumi.asset.FileAsset(path.join("templates", file)),
      contentType: "text/html; charset=utf-8",
      // Hash so re-uploads happen when a template changes.
      etag: fs.existsSync(path.join("templates", file))
        ? crypto
            .createHash("md5")
            .update(fs.readFileSync(path.join("templates", file)))
            .digest("hex")
        : undefined,
    });
  }

  // --- SES domain identity + DKIM -------------------------------------------
  const identity = new aws.ses.DomainIdentity("contact-ses-identity", {
    domain: config.domainName,
  });

  const dkim = new aws.ses.DomainDkim("contact-ses-dkim", {
    domain: identity.domain,
  });

  // SES domain verification TXT record.
  dnsRecord(
    {
      name: "ses-verification",
      recordName: pulumi.interpolate`_amazonses.${config.domainName}`,
      type: "TXT",
      content: identity.verificationToken,
    },
    cloudflareProvider,
  );

  // The 3 DKIM CNAMEs (SES always issues exactly three tokens).
  for (let i = 0; i < 3; i++) {
    dnsRecord(
      {
        name: `ses-dkim-${i}`,
        recordName: dkim.dkimTokens.apply(
          (t) => `${t[i]}._domainkey.${config.domainName}`,
        ),
        type: "CNAME",
        content: dkim.dkimTokens.apply((t) => `${t[i]}.dkim.amazonses.com`),
      },
      cloudflareProvider,
    );
  }

  // --- Lambda execution role (least privilege) -------------------------------
  const functionName = `${slug}-contact`;

  const logGroup = new aws.cloudwatch.LogGroup("contact-logs", {
    name: `/aws/lambda/${functionName}`,
    retentionInDays: 14,
    tags: { ...commonTags, role: "contact-api" },
  });

  const role = new aws.iam.Role("contact-lambda-role", {
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { Service: "lambda.amazonaws.com" },
          Action: "sts:AssumeRole",
        },
      ],
    }),
    tags: { ...commonTags, role: "contact-api" },
  });

  new aws.iam.RolePolicy("contact-lambda-policy", {
    role: role.id,
    policy: pulumi
      .all([logGroup.arn, identity.arn, templatesBucket.arn])
      .apply(([logArn, identityArn, bucketArn]) =>
        JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "Logs",
              Effect: "Allow",
              Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
              Resource: `${logArn}:*`,
            },
            {
              Sid: "SendEmail",
              Effect: "Allow",
              Action: ["ses:SendEmail", "ses:SendRawEmail"],
              Resource: identityArn,
            },
            {
              Sid: "ReadTemplates",
              Effect: "Allow",
              Action: ["s3:GetObject"],
              Resource: `${bucketArn}/*`,
            },
          ],
        }),
      ),
  });

  // --- Lambda function -------------------------------------------------------
  // Fail loudly with a clear instruction if the package hasn't been built
  // (CI builds it before every preview/up; locally you must build it first).
  const lambdaZipAbs = path.resolve(LAMBDA_ZIP_PATH);
  if (!fs.existsSync(lambdaZipAbs)) {
    throw new Error(
      `Contact Lambda package not found at "${lambdaZipAbs}".\n` +
        `Build it first:\n` +
        `  cd lambdas/contact && cargo lambda build --release --arm64 --output-format zip\n` +
        `  then copy the produced target/lambda/*/bootstrap.zip to lambdas/contact/bootstrap.zip\n` +
        `(CI builds and copies it automatically before preview/up.)`,
    );
  }

  const lambdaEnv: Record<string, pulumi.Input<string>> = {
    SENDER_EMAIL: senderEmail,
    CONTACT_EMAIL: contactEmail,
    ALLOWED_ORIGIN: pulumi.interpolate`https://${config.domainName}`,
    TEMPLATE_BUCKET: templatesBucket.bucket,
  };
  if (config.turnstileSecretKey) {
    lambdaEnv.TURNSTILE_SECRET_KEY = config.turnstileSecretKey;
  }

  const fn = new aws.lambda.Function(
    "contact-fn",
    {
      name: functionName,
      runtime: "provided.al2023",
      architectures: ["arm64"],
      handler: "bootstrap",
      memorySize: 256,
      timeout: 10,
      code: new pulumi.asset.FileArchive(LAMBDA_ZIP_PATH),
      sourceCodeHash: zipSha256(LAMBDA_ZIP_PATH),
      role: role.arn,
      environment: { variables: lambdaEnv },
      loggingConfig: { logFormat: "Text", logGroup: logGroup.name },
      tags: { ...commonTags, role: "contact-api" },
    },
    { dependsOn: [logGroup] },
  );

  // --- HTTP API (CORS locked to the site origin) -----------------------------
  const api = new aws.apigatewayv2.Api("contact-api", {
    protocolType: "HTTP",
    name: `${slug}-contact-api`,
    corsConfiguration: {
      allowOrigins: [pulumi.interpolate`https://${config.domainName}`],
      allowMethods: ["POST", "OPTIONS"],
      allowHeaders: ["content-type"],
      maxAge: 3600,
    },
    tags: { ...commonTags, role: "contact-api" },
  });

  const integration = new aws.apigatewayv2.Integration("contact-integration", {
    apiId: api.id,
    integrationType: "AWS_PROXY",
    integrationMethod: "POST",
    integrationUri: fn.invokeArn,
    payloadFormatVersion: "2.0",
  });

  const route = new aws.apigatewayv2.Route("contact-route", {
    apiId: api.id,
    routeKey: "POST /contact",
    target: pulumi.interpolate`integrations/${integration.id}`,
  });

  const stage = new aws.apigatewayv2.Stage("contact-stage", {
    apiId: api.id,
    name: "$default",
    autoDeploy: true,
    tags: { ...commonTags, role: "contact-api" },
  });

  new aws.lambda.Permission(
    "contact-apigw-invoke",
    {
      action: "lambda:InvokeFunction",
      function: fn.name,
      principal: "apigateway.amazonaws.com",
      sourceArn: pulumi.interpolate`${api.executionArn}/*/*`,
    },
    { dependsOn: [route, stage] },
  );

  // $default stage serves at the API root, so the route maps directly to /contact.
  return {
    contactApiUrl: pulumi.interpolate`${api.apiEndpoint}/contact`,
  };
}
