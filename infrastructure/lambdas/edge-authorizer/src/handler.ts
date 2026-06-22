// Core, testable logic for the Lambda@Edge authorizer that protects the
// `/resume/files/*` CloudFront behavior.
//
// Lambda@Edge functions get NO runtime environment variables, so the Cognito
// configuration is baked into the deployed bundle as a sibling `config.json`
// (written by the Pulumi program at deploy time from the user-pool outputs).
// `index.ts` loads + validates it and wires up `cognito-at-edge`; everything
// here stays pure so it can be unit-tested without real Cognito.

import type {
  CloudFrontRequestEvent,
  CloudFrontRequestResult,
} from "aws-lambda";

export interface AuthorizerConfig {
  region: string;
  userPoolId: string;
  /** Cognito app client id (public client; no secret for the static site). */
  userPoolAppId: string;
  /** Hosted UI domain, e.g. `xxxx.auth.us-east-1.amazoncognito.com`. */
  userPoolDomain: string;
  /**
   * Single OAuth callback path handled by this edge fn (cognito-at-edge
   * `parseAuthPath`). Using one fixed callback path means Cognito only needs one
   * registered callback URL instead of one per protected file.
   */
  parseAuthPath: string;
}

const REQUIRED_FIELDS: (keyof AuthorizerConfig)[] = [
  "region",
  "userPoolId",
  "userPoolAppId",
  "userPoolDomain",
  "parseAuthPath",
];

/**
 * Validates the baked-in config, failing loud (throws) if any field is missing.
 * A misconfigured edge authorizer must never silently fall back to "allow".
 */
export function assertConfig(raw: unknown): AuthorizerConfig {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("edge-authorizer config.json must be a JSON object");
  }
  const record = raw as Record<string, unknown>;
  for (const field of REQUIRED_FIELDS) {
    const value = record[field];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`edge-authorizer config.json: "${field}" is required`);
    }
  }
  return {
    region: record.region as string,
    userPoolId: record.userPoolId as string,
    userPoolAppId: record.userPoolAppId as string,
    userPoolDomain: record.userPoolDomain as string,
    parseAuthPath: record.parseAuthPath as string,
  };
}

/** Minimal shape of the cognito-at-edge Authenticator we depend on. */
export interface SessionAuthenticator {
  handle(event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult>;
}

/**
 * Builds the viewer-request handler. Authenticated requests are returned
 * unchanged (CloudFront proceeds to the S3 origin); unauthenticated or
 * expired-session requests get the authenticator's redirect to the Hosted UI.
 * The decision is fully delegated to `cognito-at-edge` (JWT + JWKS validation).
 */
export function createHandler(authenticator: SessionAuthenticator) {
  return (event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> =>
    authenticator.handle(event);
}
