import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { getResumeContact } from "@/lib/resume-contact";

const ORIGINAL = process.env.RESUME_CONTACT_JSON;

const VALID = JSON.stringify({
  fullName: "Test Owner",
  email: "owner@example.com",
  phone: "+1 555 010 0000",
  location: "Boston, MA",
});

describe("getResumeContact", () => {
  beforeEach(() => {
    delete process.env.RESUME_CONTACT_JSON;
  });

  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.RESUME_CONTACT_JSON;
    else process.env.RESUME_CONTACT_JSON = ORIGINAL;
  });

  it("parses valid JSON into a ResumeContact", () => {
    process.env.RESUME_CONTACT_JSON = VALID;
    expect(getResumeContact()).toEqual({
      fullName: "Test Owner",
      email: "owner@example.com",
      phone: "+1 555 010 0000",
      location: "Boston, MA",
    });
  });

  it("trims surrounding whitespace on each field", () => {
    process.env.RESUME_CONTACT_JSON = JSON.stringify({
      fullName: "  Test Owner  ",
      email: " owner@example.com ",
      phone: " 555 ",
      location: " Boston ",
    });
    expect(getResumeContact().fullName).toBe("Test Owner");
  });

  it("fails loud when the secret is unset", () => {
    expect(() => getResumeContact()).toThrow(/RESUME_CONTACT_JSON is not set/);
  });

  it("fails loud when the secret is not valid JSON", () => {
    process.env.RESUME_CONTACT_JSON = "{not json";
    expect(() => getResumeContact()).toThrow(/not valid JSON/);
  });

  it("fails loud when the secret is not a JSON object", () => {
    process.env.RESUME_CONTACT_JSON = JSON.stringify(["a", "b"]);
    expect(() => getResumeContact()).toThrow(/must be a JSON object/);
  });

  it("fails loud when a required field is missing or empty", () => {
    process.env.RESUME_CONTACT_JSON = JSON.stringify({
      fullName: "Test",
      email: "owner@example.com",
      phone: "",
      location: "Boston",
    });
    expect(() => getResumeContact()).toThrow(/phone is required/);
  });
});

// Privacy boundary guard: assert no rendered component or page imports the
// private contact accessor. This backs the eslint no-restricted-imports rule
// with a test that fails even if the lint config is changed.
describe("resume-contact privacy boundary", () => {
  function collectTsFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        out.push(...collectTsFiles(full));
      } else if (/\.(ts|tsx)$/.test(entry)) {
        out.push(full);
      }
    }
    return out;
  }

  it("is not imported by any file under src/components or src/app", () => {
    const roots = ["src/components", "src/app"]
      .map((p) => join(process.cwd(), p))
      .filter((p) => {
        try {
          return statSync(p).isDirectory();
        } catch {
          return false;
        }
      });

    const offenders: string[] = [];
    for (const root of roots) {
      for (const file of collectTsFiles(root)) {
        const source = readFileSync(file, "utf8");
        if (/resume-contact/.test(source)) {
          offenders.push(file);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
