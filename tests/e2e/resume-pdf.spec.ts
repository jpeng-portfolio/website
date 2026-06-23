import { test, expect } from "@playwright/test";
import { renderResumePdf } from "../../scripts/resume/render-pdf";
import { buildResumeModel } from "../../src/lib/resume-model";
import type { ResumeContact } from "../../src/lib/resume-contact";

// Smoke test: the résumé PDF generates as a valid, non-empty document. Runs in the
// e2e job where Chromium is installed. Uses placeholder contact details — the real
// contact block is injected from a secret only in the deploy build.
const contact: ResumeContact = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "+1 (555) 555-0100",
  location: "Boston, MA",
};

test("résumé PDF renders as a valid, non-empty document", async () => {
  const pdf = await renderResumePdf(buildResumeModel(contact));
  expect(pdf.length).toBeGreaterThan(1000);
  // Real PDF documents begin with the %PDF- header (text-based, not rasterized).
  expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
});
