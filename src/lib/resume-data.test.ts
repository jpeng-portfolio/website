import { describe, it, expect } from "vitest";
import {
  aboutParagraphs,
  resumeCertifications,
  resumeEducation,
  resumeHeadline,
  resumeSummary,
} from "@/lib/resume-data";

describe("resume-data", () => {
  it("has a non-empty headline and summary", () => {
    expect(resumeHeadline.trim().length).toBeGreaterThan(0);
    expect(resumeSummary.trim().length).toBeGreaterThan(0);
  });

  it("has at least one about paragraph, all non-empty", () => {
    expect(aboutParagraphs.length).toBeGreaterThan(0);
    for (const paragraph of aboutParagraphs) {
      expect(paragraph.trim().length).toBeGreaterThan(0);
    }
  });

  it("has education entries with institution, credential, and date", () => {
    expect(resumeEducation.length).toBeGreaterThan(0);
    for (const edu of resumeEducation) {
      expect(edu.institution.trim().length).toBeGreaterThan(0);
      expect(edu.credential.trim().length).toBeGreaterThan(0);
      expect(edu.date.trim().length).toBeGreaterThan(0);
    }
  });

  it("has certifications with name and date", () => {
    expect(resumeCertifications.length).toBeGreaterThan(0);
    for (const cert of resumeCertifications) {
      expect(cert.name.trim().length).toBeGreaterThan(0);
      expect(cert.date.trim().length).toBeGreaterThan(0);
    }
  });

  it("contains no private contact details (privacy rule)", () => {
    // resume-data.ts is rendered on a public page, so it must never carry a
    // phone number, street address, or direct email.
    const haystack = JSON.stringify({
      aboutParagraphs,
      resumeSummary,
      resumeHeadline,
      resumeEducation,
      resumeCertifications,
    });
    expect(haystack).not.toMatch(/\b\d{3}[.\-\s]?\d{3}[.\-\s]?\d{4}\b/); // phone
    expect(haystack).not.toMatch(/@/); // email
  });
});
