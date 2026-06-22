import { describe, it, expect } from "vitest";
import { buildResumeModel } from "@/lib/resume-model";
import type { ResumeContact } from "@/lib/resume-contact";
import { renderResumeDocx, resumeDocxOutline } from "./render-docx";

const CONTACT: ResumeContact = {
  fullName: "Test Owner",
  email: "owner@example.com",
  phone: "+1 555 010 0000",
  location: "Boston, MA",
};

const model = buildResumeModel(CONTACT);

describe("resumeDocxOutline", () => {
  const outline = resumeDocxOutline(model);

  it("puts the name, headline, and contact in the header", () => {
    expect(outline.name).toBe(CONTACT.fullName);
    expect(outline.headline).toBe(model.headline);
    expect(outline.contact).toContain(CONTACT.email);
    expect(outline.contact).toContain(CONTACT.phone);
    expect(outline.contact).toContain(CONTACT.location);
  });

  it("has the expected sections in order", () => {
    expect(outline.sections.map((s) => s.title)).toEqual([
      "Summary",
      "Experience",
      "Skills",
      "Education",
      "Certifications",
    ]);
  });

  it("renders each experience role as a subheading + italic company + bullets", () => {
    const experience = outline.sections.find((s) => s.title === "Experience")!;
    for (const role of model.experience) {
      const heading = experience.lines.find(
        (l) => l.kind === "subheading" && l.left === role.role,
      );
      expect(heading).toBeDefined();
    }
    expect(experience.lines.some((l) => l.kind === "bullet")).toBe(true);
    expect(experience.lines.some((l) => l.kind === "italic")).toBe(true);
  });

  it("lists every skill group", () => {
    const skills = outline.sections.find((s) => s.title === "Skills")!;
    expect(skills.lines).toHaveLength(model.skills.length);
  });
});

describe("renderResumeDocx", () => {
  it("produces a non-empty .docx (zip) buffer", async () => {
    const buffer = await renderResumeDocx(model);
    expect(buffer.byteLength).toBeGreaterThan(0);
    // .docx is an OOXML zip — the magic bytes are "PK".
    expect(buffer.subarray(0, 2).toString("latin1")).toBe("PK");
  });
});
