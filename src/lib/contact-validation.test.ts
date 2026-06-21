import { describe, it, expect } from "vitest";
import {
  EMAIL_RE,
  validateContactPayload,
  type ContactPayload,
} from "@/lib/contact-validation";

const valid: ContactPayload = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Hello",
  message: "I'd like to work together.",
};

describe("EMAIL_RE", () => {
  it("matches well-formed addresses", () => {
    expect(EMAIL_RE.test("jane@example.com")).toBe(true);
    expect(EMAIL_RE.test("a.b+c@sub.domain.io")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(EMAIL_RE.test("not-an-email")).toBe(false);
    expect(EMAIL_RE.test("missing@domain")).toBe(false);
    expect(EMAIL_RE.test("@example.com")).toBe(false);
    expect(EMAIL_RE.test("spaces in@example.com")).toBe(false);
  });
});

describe("validateContactPayload", () => {
  it("returns null for a valid payload", () => {
    expect(validateContactPayload(valid)).toBeNull();
  });

  it("requires all fields", () => {
    for (const field of ["name", "email", "subject", "message"] as const) {
      const payload = { ...valid, [field]: "" };
      expect(validateContactPayload(payload)).toBe("Please complete all fields.");
    }
  });

  it("rejects an over-length name", () => {
    expect(
      validateContactPayload({ ...valid, name: "a".repeat(101) })
    ).toBe("Name must be 100 characters or fewer.");
  });

  it("rejects an over-length email", () => {
    const longLocal = "a".repeat(250);
    const email = `${longLocal}@e.io`; // length 256 > 254
    expect(email.length).toBeGreaterThan(254);
    expect(validateContactPayload({ ...valid, email })).toBe(
      "Email address is too long."
    );
  });

  it("rejects a malformed email", () => {
    expect(validateContactPayload({ ...valid, email: "nope" })).toBe(
      "Please enter a valid email address."
    );
  });

  it("rejects an over-length subject", () => {
    expect(
      validateContactPayload({ ...valid, subject: "a".repeat(201) })
    ).toBe("Subject must be 200 characters or fewer.");
  });

  it("rejects an over-length message", () => {
    expect(
      validateContactPayload({ ...valid, message: "a".repeat(5001) })
    ).toBe("Message must be 5,000 characters or fewer.");
  });

  describe("boundary cases (exactly at the limit pass)", () => {
    it("accepts a name of exactly 100 characters", () => {
      expect(
        validateContactPayload({ ...valid, name: "a".repeat(100) })
      ).toBeNull();
    });

    it("accepts an email of exactly 254 characters", () => {
      // local-part 247 + "@aaaa.io" (8) = 255? build to exactly 254.
      const domain = "@example.io"; // 11 chars
      const local = "a".repeat(254 - domain.length); // 243
      const email = `${local}${domain}`;
      expect(email.length).toBe(254);
      expect(EMAIL_RE.test(email)).toBe(true);
      expect(validateContactPayload({ ...valid, email })).toBeNull();
    });

    it("accepts a subject of exactly 200 characters", () => {
      expect(
        validateContactPayload({ ...valid, subject: "a".repeat(200) })
      ).toBeNull();
    });

    it("accepts a message of exactly 5000 characters", () => {
      expect(
        validateContactPayload({ ...valid, message: "a".repeat(5000) })
      ).toBeNull();
    });
  });
});
