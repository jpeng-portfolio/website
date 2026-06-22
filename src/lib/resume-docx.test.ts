import { describe, it, expect } from "vitest";
import { Packer } from "docx";
import {
  buildResumeDocBlocks,
  buildResumeDocument,
} from "@/lib/resume-docx";
import { buildResumeModel } from "@/lib/resume-model";
import type { ResumeContact } from "@/lib/resume-contact";

const contact: ResumeContact = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "+1 (555) 555-0100",
  location: "Boston, MA",
};

const model = buildResumeModel(contact);
const blocks = buildResumeDocBlocks(model);

describe("buildResumeDocBlocks", () => {
  it("starts with the name title, headline subtitle, and contact line", () => {
    expect(blocks[0]).toEqual({ type: "title", text: "Jane Doe" });
    expect(blocks[1]).toEqual({ type: "subtitle", text: model.headline });
    expect(blocks[2].type).toBe("contact");
    expect(blocks[2].text).toContain(contact.email);
  });

  it("emits the section headings in order", () => {
    const headings = blocks
      .filter((b) => b.type === "heading")
      .map((b) => b.text);
    expect(headings).toEqual([
      "Summary",
      "Experience",
      "Skills",
      "Education",
      "Certifications",
    ]);
  });

  it("emits a bullet per experience bullet and per skill group", () => {
    const bulletCount = blocks.filter((b) => b.type === "bullet").length;
    const expected =
      model.experience.reduce((n, j) => n + j.bullets.length, 0) +
      model.skills.length +
      model.certifications.length;
    expect(bulletCount).toBe(expected);
  });

  it("is deterministic", () => {
    expect(buildResumeDocBlocks(model)).toEqual(buildResumeDocBlocks(model));
  });
});

describe("buildResumeDocument", () => {
  it("packs to a valid, non-empty DOCX (zip) buffer", async () => {
    const buffer = await Packer.toBuffer(buildResumeDocument(model));
    expect(buffer.length).toBeGreaterThan(1000);
    // DOCX is a zip archive — starts with the PK signature.
    expect(buffer.subarray(0, 2).toString("latin1")).toBe("PK");
  });
});
