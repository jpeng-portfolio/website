import { describe, it, expect } from "vitest";
import { buildResumeModel } from "@/lib/resume-model";
import { experienceRoles } from "@/lib/experience-data";
import { skillCategories } from "@/lib/skills-data";
import { resumeData } from "@/lib/resume-data";
import type { ResumeContact } from "@/lib/resume-contact";

const contact: ResumeContact = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "+1 (555) 555-0100",
  location: "Boston, MA",
};

describe("buildResumeModel", () => {
  const model = buildResumeModel(contact);

  it("passes the injected contact through unchanged", () => {
    expect(model.contact).toEqual(contact);
  });

  it("carries headline and summary from resume-data", () => {
    expect(model.headline).toBe(resumeData.headline);
    expect(model.summary).toEqual(resumeData.summaryParagraphs);
  });

  it("includes every experience role with its bullets and period", () => {
    expect(model.experience).toHaveLength(experienceRoles.length);
    model.experience.forEach((entry, i) => {
      expect(entry.role).toBe(experienceRoles[i].role);
      expect(entry.company).toBe(experienceRoles[i].company);
      expect(entry.period).toBe(experienceRoles[i].period);
      expect(entry.bullets).toEqual(experienceRoles[i].bullets);
    });
  });

  it("maps skill categories to name-only groups (levels dropped)", () => {
    expect(model.skills).toHaveLength(skillCategories.length);
    model.skills.forEach((group, i) => {
      expect(group.title).toBe(skillCategories[i].title);
      expect(group.skills).toEqual(skillCategories[i].skills.map((s) => s.name));
    });
    // No numeric level survives into the model.
    expect(JSON.stringify(model.skills)).not.toMatch(/"level"/);
  });

  it("carries education and certifications from resume-data", () => {
    expect(model.education).toEqual(resumeData.education);
    expect(model.certifications).toEqual(resumeData.certifications);
  });

  it("is deterministic — repeated builds are deep-equal", () => {
    expect(buildResumeModel(contact)).toEqual(buildResumeModel(contact));
  });

  it("returns copies, not references to the source data", () => {
    model.education.push({ school: "x", credential: "y", date: "z" });
    expect(resumeData.education).not.toContainEqual({
      school: "x",
      credential: "y",
      date: "z",
    });
  });
});
