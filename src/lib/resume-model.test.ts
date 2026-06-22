import { describe, it, expect } from "vitest";
import { buildResumeModel, parseMonthYear } from "@/lib/resume-model";
import { skillCategories } from "@/lib/skills-data";
import { experienceRoles } from "@/lib/experience-data";
import type { ResumeContact } from "@/lib/resume-contact";

const CONTACT: ResumeContact = {
  fullName: "Test Owner",
  email: "owner@example.com",
  phone: "+1 555 010 0000",
  location: "Boston, MA",
};

describe("parseMonthYear", () => {
  it("parses a Month YYYY string into a sortable integer", () => {
    expect(parseMonthYear("March 2024")).toBe(2024 * 100 + 3);
    expect(parseMonthYear("may 2025")).toBe(2025 * 100 + 5);
  });

  it("orders correctly: later dates produce larger values", () => {
    expect(parseMonthYear("January 2025")! > parseMonthYear("December 2024")!).toBe(
      true,
    );
  });

  it("returns null for unrecognized input", () => {
    expect(parseMonthYear("2024")).toBeNull();
    expect(parseMonthYear("Smarch 2024")).toBeNull();
    expect(parseMonthYear("")).toBeNull();
  });
});

describe("buildResumeModel", () => {
  const model = buildResumeModel(CONTACT);

  it("injects the provided contact verbatim", () => {
    expect(model.contact).toEqual(CONTACT);
  });

  it("carries headline and summary", () => {
    expect(model.headline.length).toBeGreaterThan(0);
    expect(model.summary.length).toBeGreaterThan(0);
  });

  it("maps every skill category to a group with names only (no levels)", () => {
    expect(model.skills).toHaveLength(skillCategories.length);
    for (const group of model.skills) {
      expect(group.title.length).toBeGreaterThan(0);
      expect(group.skills.length).toBeGreaterThan(0);
      for (const name of group.skills) {
        expect(typeof name).toBe("string");
      }
    }
    // Serialized model must not leak numeric proficiency levels.
    expect(JSON.stringify(model.skills)).not.toMatch(/"level"/);
  });

  it("includes every experience role with its bullets", () => {
    expect(model.experience).toHaveLength(experienceRoles.length);
    for (const entry of model.experience) {
      expect(entry.role.length).toBeGreaterThan(0);
      expect(entry.company.length).toBeGreaterThan(0);
      expect(entry.period.length).toBeGreaterThan(0);
      expect(entry.bullets.length).toBeGreaterThan(0);
    }
  });

  it("orders certifications most-recent-first", () => {
    const values = model.certifications
      .map((c) => parseMonthYear(c.date))
      .filter((v): v is number => v !== null);
    const sorted = [...values].sort((a, b) => b - a);
    expect(values).toEqual(sorted);
  });

  it("is deterministic (stable across runs)", () => {
    expect(buildResumeModel(CONTACT)).toEqual(buildResumeModel(CONTACT));
  });

  it("does not mutate the source data", () => {
    const before = experienceRoles[0].bullets.length;
    const m = buildResumeModel(CONTACT);
    m.experience[0].bullets.push("mutation");
    expect(experienceRoles[0].bullets.length).toBe(before);
  });
});
