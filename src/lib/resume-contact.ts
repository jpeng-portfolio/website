// Private résumé contact details — PRIVACY BOUNDARY.
//
// This repository is a public-facing portfolio. Per the project's privacy rule,
// personal contact details (full name header, phone, email, location) are NEVER
// committed to source and NEVER rendered on a page. They are read here from a
// build-time secret (`RESUME_CONTACT_JSON`) only when generating the owner-gated
// résumé documents, and this module fails loud if that secret is missing or
// malformed.
//
// IMPORTANT: no rendered component may import this module. An eslint
// `no-restricted-imports` guard (see eslint.config.mjs) and a unit test
// (`resume-contact.test.ts`) enforce that boundary.

export type ResumeContact = {
  /** Full name for the résumé header, e.g. "Jason Paquette". */
  fullName: string;
  email: string;
  phone: string;
  /** City, region — e.g. "Boston, MA". */
  location: string;
};

const REQUIRED_FIELDS = ["fullName", "email", "phone", "location"] as const;

const ENV_VAR = "RESUME_CONTACT_JSON";

/**
 * Reads and validates the résumé contact details from the `RESUME_CONTACT_JSON`
 * build-time secret. Throws (fail-loud, no silent fallback) if the secret is
 * unset, not valid JSON, or missing any required field.
 */
export function getResumeContact(): ResumeContact {
  const raw = process.env[ENV_VAR];
  if (!raw || raw.trim() === "") {
    throw new Error(
      `${ENV_VAR} is not set. The résumé generator requires contact details ` +
        `to be provided as a build-time secret (JSON with ` +
        `${REQUIRED_FIELDS.join(", ")}). Refusing to build a misconfigured résumé.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`${ENV_VAR} is set but is not valid JSON.`);
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${ENV_VAR} must be a JSON object.`);
  }

  const record = parsed as Record<string, unknown>;
  for (const field of REQUIRED_FIELDS) {
    const value = record[field];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(
        `${ENV_VAR}.${field} is required and must be a non-empty string.`,
      );
    }
  }

  return {
    fullName: (record.fullName as string).trim(),
    email: (record.email as string).trim(),
    phone: (record.phone as string).trim(),
    location: (record.location as string).trim(),
  };
}
