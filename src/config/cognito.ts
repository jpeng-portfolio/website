import { siteConfig } from "@/config/site";

/**
 * Cognito Hosted UI configuration for the owner-gated résumé portal.
 *
 * Values come from the Pulumi stack outputs, injected at build time as
 * `NEXT_PUBLIC_COGNITO_*`. Per the project's fail-loud rule, each is required —
 * the build throws if a value is unset rather than shipping a misconfigured
 * sign-in flow.
 */
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `${name} is required (Cognito stack output). Set it at build time; ` +
        `refusing to build a misconfigured résumé sign-in portal.`,
    );
  }
  return value;
}

export const cognitoConfig = {
  userPoolId: requiredEnv("NEXT_PUBLIC_COGNITO_USER_POOL_ID"),
  clientId: requiredEnv("NEXT_PUBLIC_COGNITO_CLIENT_ID"),
  /** Hosted UI domain, e.g. `jp-resume.auth.us-east-1.amazoncognito.com`. */
  hostedUiDomain: requiredEnv("NEXT_PUBLIC_COGNITO_HOSTED_UI_DOMAIN"),
  region: requiredEnv("NEXT_PUBLIC_COGNITO_REGION"),
} as const;

const portalUrl = `https://${siteConfig.domain}/resume`;

/**
 * Cognito Hosted UI sign-out URL. The edge authorizer drives sign-in (clicking a
 * gated download redirects an unauthenticated visitor to the Hosted UI), so the
 * portal only needs an explicit way to end the session.
 */
export function hostedUiLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: cognitoConfig.clientId,
    logout_uri: portalUrl,
  });
  return `https://${cognitoConfig.hostedUiDomain}/logout?${params.toString()}`;
}
