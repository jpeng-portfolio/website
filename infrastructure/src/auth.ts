import * as fs from "fs";
import * as path from "path";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import {
  config,
  commonTags,
  EDGE_AUTHORIZER_DIST,
  RESUME_PARSE_AUTH_PATH,
} from "./config";

/**
 * Owner-only auth for the gated résumé files.
 *
 * A single-user Amazon Cognito user pool (self-sign-up disabled) + Hosted UI
 * domain + public app client, plus a Lambda@Edge viewer-request authorizer
 * (cognito-at-edge) that `static-site.ts` associates with the `/resume/files/*`
 * CloudFront behavior. The edge function gets NO runtime env vars, so its
 * Cognito config is baked into the deployed bundle as a generated `config.json`.
 *
 * Resource type tokens verified via the Pulumi MCP server:
 *   aws:cognito/userPool:UserPool, aws:cognito/userPoolClient:UserPoolClient,
 *   aws:cognito/userPoolDomain:UserPoolDomain, aws:cognito/user:User,
 *   aws:iam/role:Role, aws:iam/rolePolicyAttachment:RolePolicyAttachment,
 *   aws:lambda/function:Function (nodejs20.x, publish=true for Lambda@Edge).
 */

export interface Auth {
  userPoolId: pulumi.Output<string>;
  userPoolClientId: pulumi.Output<string>;
  /** Full Hosted UI domain: `<prefix>.auth.<region>.amazoncognito.com`. */
  hostedUiDomain: pulumi.Output<string>;
  region: string;
  /** Published version ARN for the CloudFront Lambda@Edge association. */
  edgeAuthorizerVersionArn: pulumi.Output<string>;
}

export function createAuth(): Auth {
  const slug = config.domainName.replace(/\./g, "-");

  // --- Cognito user pool (single owner, no self-sign-up) ---------------------
  const userPool = new aws.cognito.UserPool("resume-user-pool", {
    name: `${slug}-resume-owner`,
    // Disable public registration — only an admin (IaC) can create users.
    adminCreateUserConfig: { allowAdminCreateUserOnly: true },
    usernameAttributes: ["email"],
    autoVerifiedAttributes: ["email"],
    passwordPolicy: {
      minimumLength: 12,
      requireLowercase: true,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true,
      temporaryPasswordValidityDays: 7,
    },
    accountRecoverySetting: {
      recoveryMechanisms: [{ name: "verified_email", priority: 1 }],
    },
    mfaConfiguration: "OFF",
    deletionProtection: "ACTIVE",
    tags: { ...commonTags, role: "resume-auth" },
  });

  // --- Hosted UI domain ------------------------------------------------------
  const domain = new aws.cognito.UserPoolDomain("resume-auth-domain", {
    domain: config.cognitoDomainPrefix,
    userPoolId: userPool.id,
  });

  const hostedUiDomain = pulumi.interpolate`${domain.domain}.auth.${config.region}.amazoncognito.com`;

  // --- Public app client (Authorization Code + Hosted UI) --------------------
  const client = new aws.cognito.UserPoolClient(
    "resume-client",
    {
      userPoolId: userPool.id,
      name: `${slug}-resume-web`,
      // Public client (no secret): the edge authorizer + Hosted UI use PKCE/code.
      generateSecret: false,
      allowedOauthFlows: ["code"],
      allowedOauthFlowsUserPoolClient: true,
      allowedOauthScopes: ["openid", "email", "profile"],
      supportedIdentityProviders: ["COGNITO"],
      // Single callback handled by the edge fn (parseAuthPath), under the gated path.
      callbackUrls: [
        pulumi.interpolate`https://${config.domainName}/${RESUME_PARSE_AUTH_PATH}`,
      ],
      logoutUrls: [pulumi.interpolate`https://${config.domainName}/resume`],
      explicitAuthFlows: ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"],
      preventUserExistenceErrors: "ENABLED",
      enableTokenRevocation: true,
    },
    { dependsOn: [domain] },
  );

  // --- The one provisioned owner user ----------------------------------------
  // Temporary password (secret) forces a change on first sign-in; SUPPRESS so
  // Cognito doesn't send its own invite email.
  new aws.cognito.User("resume-owner", {
    userPoolId: userPool.id,
    username: config.resumeOwnerEmail,
    attributes: {
      email: config.resumeOwnerEmail,
      email_verified: "true",
    },
    temporaryPassword: config.resumeOwnerTempPassword,
    messageAction: "SUPPRESS",
  });

  // --- Lambda@Edge authorizer ------------------------------------------------
  // Assumable by both lambda + edgelambda (CloudFront replicates it to edges).
  const edgeRole = new aws.iam.Role("resume-edge-role", {
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Service: ["lambda.amazonaws.com", "edgelambda.amazonaws.com"],
          },
          Action: "sts:AssumeRole",
        },
      ],
    }),
    tags: { ...commonTags, role: "resume-auth" },
  });

  // Basic execution = create/write the per-edge-region CloudWatch log groups
  // Lambda@Edge emits to. This is the least-privilege baseline for edge logging
  // (the fn reads no AWS resources — it only validates Cognito JWTs).
  new aws.iam.RolePolicyAttachment("resume-edge-logs", {
    role: edgeRole.name,
    policyArn:
      "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
  });

  // Fail loud if the bundle hasn't been built (CI builds it before preview/up).
  const distAbs = path.resolve(EDGE_AUTHORIZER_DIST);
  if (!fs.existsSync(distAbs)) {
    throw new Error(
      `Edge authorizer bundle not found at "${distAbs}".\n` +
        `Build it first:\n` +
        `  cd lambdas/edge-authorizer && npm ci && npm run build\n` +
        `(CI builds it automatically before preview/up.)`,
    );
  }

  // Bake the Cognito config into config.json next to the bundled handler —
  // Lambda@Edge has no runtime env vars. The archive hash only changes when one
  // of these resolved values changes, so versions don't churn.
  const configJson = pulumi
    .all([userPool.id, client.id, hostedUiDomain])
    .apply(([userPoolId, userPoolAppId, userPoolDomain]) =>
      JSON.stringify(
        {
          region: config.region,
          userPoolId,
          userPoolAppId,
          userPoolDomain,
          parseAuthPath: RESUME_PARSE_AUTH_PATH,
        },
        null,
        2,
      ),
    );

  const edgeFn = new aws.lambda.Function("resume-edge-authorizer", {
    name: `${slug}-resume-edge-authorizer`,
    runtime: "nodejs20.x",
    handler: "index.handler",
    role: edgeRole.arn,
    memorySize: 128,
    // Viewer-request Lambda@Edge timeout cap is 5s.
    timeout: 5,
    // Lambda@Edge associations require a published, immutable version.
    publish: true,
    code: configJson.apply(
      (json) =>
        new pulumi.asset.AssetArchive({
          "index.js": new pulumi.asset.FileAsset(EDGE_AUTHORIZER_DIST),
          "config.json": new pulumi.asset.StringAsset(json),
        }),
    ),
    tags: { ...commonTags, role: "resume-auth" },
  });

  return {
    userPoolId: userPool.id,
    userPoolClientId: client.id,
    hostedUiDomain,
    region: config.region,
    edgeAuthorizerVersionArn: edgeFn.qualifiedArn,
  };
}
