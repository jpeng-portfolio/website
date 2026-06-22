// PRIVATE résumé contact details — build-time only.
//
// This module reads the owner's contact block (full name, email, phone, location)
// from the `RESUME_CONTACT_JSON` build secret and FAILS LOUD if it is missing or
// malformed. These details are intentionally NOT committed to source and must
// NEVER be imported into any rendered component: the public site must not display
// a phone number, street/location, or direct email (enforced by an eslint
// `no-restricted-imports` guard + an isolation unit test). The generated résumé
// documents are the only consumers, and they are produced at build time.

export type ResumeContact = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
};

export const RESUME_CONTACT_ENV = "RESUME_CONTACT_JSON";

const REQUIRED_FIELDS = ["fullName", "email", "phone", "location"] as const;

/**
 * Load and validate the private résumé contact block from the environment.
 * Throws (fail-loud) when the secret is unset, not valid JSON, or missing any
 * required field — never returns a partial or placeholder value.
 */
export function loadResumeContact(
  env: Record<string, string | undefined> = process.env
): ResumeContact {
  const raw = env[RESUME_CONTACT_ENV];
  if (raw === undefined || raw.trim() === "") {
    throw new Error(
      `${RESUME_CONTACT_ENV} is not set. The résumé generator requires the ` +
        `owner's contact block as JSON (fields: ${REQUIRED_FIELDS.join(", ")}). ` +
        `Set it as a build secret; it must never be committed to source.`
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `${RESUME_CONTACT_ENV} is not valid JSON: ${(error as Error).message}`
    );
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${RESUME_CONTACT_ENV} must be a JSON object.`);
  }

  const record = parsed as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const field of REQUIRED_FIELDS) {
    const value = record[field];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(
        `${RESUME_CONTACT_ENV} is missing required non-empty string field "${field}".`
      );
    }
    result[field] = value.trim();
  }

  return result as ResumeContact;
}
