import { describe, it, expect } from "vitest";
import { resumeData } from "@/lib/resume-data";

describe("resumeData", () => {
  it("has a non-empty headline", () => {
    expect(resumeData.headline.trim().length).toBeGreaterThan(0);
  });

  it("has non-empty summary paragraphs", () => {
    expect(resumeData.summaryParagraphs.length).toBeGreaterThan(0);
    for (const paragraph of resumeData.summaryParagraphs) {
      expect(paragraph.trim().length).toBeGreaterThan(0);
    }
  });

  it("has education entries with school, credential, and date", () => {
    expect(resumeData.education.length).toBeGreaterThan(0);
    for (const entry of resumeData.education) {
      expect(entry.school.trim().length).toBeGreaterThan(0);
      expect(entry.credential.trim().length).toBeGreaterThan(0);
      expect(entry.date.trim().length).toBeGreaterThan(0);
    }
  });

  it("has certifications with unique names and a date", () => {
    expect(resumeData.certifications.length).toBeGreaterThan(0);
    const names = resumeData.certifications.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
    for (const cert of resumeData.certifications) {
      expect(cert.name.trim().length).toBeGreaterThan(0);
      expect(cert.date.trim().length).toBeGreaterThan(0);
    }
  });
});
