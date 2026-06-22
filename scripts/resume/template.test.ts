import { describe, it, expect } from "vitest";
import { buildResumeModel } from "@/lib/resume-model";
import type { ResumeContact } from "@/lib/resume-contact";
import { escapeHtml, renderResumeHtml } from "./template";

const CONTACT: ResumeContact = {
  fullName: "Test Owner",
  email: "owner@example.com",
  phone: "+1 555 010 0000",
  location: "Boston, MA",
};

const model = buildResumeModel(CONTACT);
const html = renderResumeHtml(model);

describe("escapeHtml", () => {
  it("escapes HTML-significant characters", () => {
    expect(escapeHtml(`<a href="x">&'`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&#39;",
    );
  });
});

describe("renderResumeHtml", () => {
  it("is a complete HTML document", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("</html>");
  });

  it("renders the header with name, headline, and contact details", () => {
    expect(html).toContain(CONTACT.fullName);
    expect(html).toContain(escapeHtml(model.headline));
    expect(html).toContain(CONTACT.email);
    expect(html).toContain(CONTACT.phone);
    expect(html).toContain(CONTACT.location);
  });

  it("includes all section headings", () => {
    for (const heading of [
      "Summary",
      "Experience",
      "Skills",
      "Education",
      "Certifications",
    ]) {
      expect(html).toContain(`<h2>${heading}</h2>`);
    }
  });

  it("includes experience roles, skill groups, and certifications", () => {
    expect(html).toContain(escapeHtml(model.experience[0].role));
    expect(html).toContain(escapeHtml(model.experience[0].bullets[0]));
    expect(html).toContain(escapeHtml(model.skills[0].title));
    expect(html).toContain(escapeHtml(model.certifications[0].name));
  });

  it("does not contain proficiency levels from the skills data", () => {
    expect(html).not.toMatch(/level/i);
  });
});
