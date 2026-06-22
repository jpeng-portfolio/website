// Lambda@Edge entry point (viewer-request) for the /resume/files/* behavior.
//
// Loads the deploy-time-baked config.json (Lambda@Edge has no runtime env vars),
// constructs the cognito-at-edge Authenticator once per cold start, and exports
// the handler. Kept tiny; the testable logic lives in ./handler.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Authenticator } from "cognito-at-edge";
import { assertConfig, createHandler } from "./handler";

const config = assertConfig(
  JSON.parse(readFileSync(join(__dirname, "config.json"), "utf8")),
);

// Public client (no secret); cognito-at-edge validates the Cognito session
// cookies/JWTs and drives the Hosted UI redirect + callback at the edge.
const authenticator = new Authenticator({
  region: config.region,
  userPoolId: config.userPoolId,
  userPoolAppId: config.userPoolAppId,
  userPoolDomain: config.userPoolDomain,
  parseAuthPath: config.parseAuthPath,
  logLevel: "error",
});

export const handler = createHandler(authenticator);
