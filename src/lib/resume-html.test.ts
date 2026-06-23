import { describe, it, expect } from "vitest";
import { renderResumeHtml } from "@/lib/resume-html";
import { buildResumeModel } from "@/lib/resume-model";
import type { ResumeContact } from "@/lib/resume-contact";

const contact: ResumeContact = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "+1 (555) 555-0100",
  location: "Boston, MA",
};

const model = buildResumeModel(contact);
const html = renderResumeHtml(model);

describe("renderResumeHtml", () => {
  it("is a single well-formed HTML document", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("</html>");
  });

  it("renders the contact header (name, headline, contact line)", () => {
    expect(html).toContain("Jane Doe");
    expect(html).toContain(model.headline.replace(/&/g, "&amp;"));
    expect(html).toContain(contact.email);
    expect(html).toContain(contact.phone);
    expect(html).toContain(contact.location);
  });

  it("renders every section heading in order", () => {
    const order = ["Summary", "Experience", "Skills", "Education", "Certifications"];
    const positions = order.map((h) => html.indexOf(`<h2>${h}</h2>`));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("includes experience companies, skill groups, and certifications", () => {
    const escape = (s: string) => s.replace(/&/g, "&amp;");
    for (const job of model.experience) expect(html).toContain(job.company);
    for (const group of model.skills)
      expect(html).toContain(escape(group.title));
    for (const cert of model.certifications)
      expect(html).toContain(escape(cert.name));
  });

  it("escapes HTML-significant characters in injected content", () => {
    const evil = renderResumeHtml(
      buildResumeModel({ ...contact, fullName: 'A<b> & "c"' })
    );
    expect(evil).toContain("A&lt;b&gt; &amp; &quot;c&quot;");
    expect(evil).not.toContain("<b>");
  });
});
