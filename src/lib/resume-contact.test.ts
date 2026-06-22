import { describe, it, expect } from "vitest";
import {
  loadResumeContact,
  RESUME_CONTACT_ENV,
} from "@/lib/resume-contact";

const valid = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "+1 (555) 555-0100",
  location: "Boston, MA",
};

function envWith(
  value: string | undefined
): Record<string, string | undefined> {
  return value === undefined ? {} : { [RESUME_CONTACT_ENV]: value };
}

describe("loadResumeContact", () => {
  it("returns a typed, trimmed contact for valid JSON", () => {
    const contact = loadResumeContact(
      envWith(JSON.stringify({ ...valid, fullName: "  Jane Doe  " }))
    );
    expect(contact).toEqual(valid);
  });

  it("fails loud when the secret is unset", () => {
    expect(() => loadResumeContact(envWith(undefined))).toThrow(
      RESUME_CONTACT_ENV
    );
  });

  it("fails loud when the secret is empty / whitespace", () => {
    expect(() => loadResumeContact(envWith("   "))).toThrow(RESUME_CONTACT_ENV);
  });

  it("fails loud on invalid JSON", () => {
    expect(() => loadResumeContact(envWith("{not json"))).toThrow(
      /not valid JSON/
    );
  });

  it("fails loud when JSON is not an object", () => {
    expect(() => loadResumeContact(envWith('"a string"'))).toThrow(
      /must be a JSON object/
    );
    expect(() => loadResumeContact(envWith("[1,2,3]"))).toThrow(
      /must be a JSON object/
    );
  });

  it.each(["fullName", "email", "phone", "location"])(
    "fails loud when required field %s is missing",
    (field) => {
      const partial = { ...valid } as Record<string, unknown>;
      delete partial[field];
      expect(() => loadResumeContact(envWith(JSON.stringify(partial)))).toThrow(
        new RegExp(field)
      );
    }
  );

  it("fails loud when a required field is empty", () => {
    expect(() =>
      loadResumeContact(envWith(JSON.stringify({ ...valid, email: "  " })))
    ).toThrow(/email/);
  });
});
