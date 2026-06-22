import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";
import { buildResumeModel } from "@/lib/resume-model";
import type { ResumeContact } from "@/lib/resume-contact";
import { renderResumePdf } from "./render-pdf";

const CONTACT: ResumeContact = {
  fullName: "Test Owner",
  email: "owner@example.com",
  phone: "+1 555 010 0000",
  location: "Boston, MA",
};

// The PDF smoke test needs a real Chromium. It runs locally and in the e2e job
// (which installs browsers) but is skipped in the lightweight unit gate where no
// browser is present, so the suite stays green everywhere.
function chromiumAvailable(): boolean {
  try {
    return existsSync(chromium.executablePath());
  } catch {
    return false;
  }
}

describe.skipIf(!chromiumAvailable())("renderResumePdf", () => {
  it("produces a valid, non-empty PDF", async () => {
    const model = buildResumeModel(CONTACT);
    const pdf = await renderResumePdf(model);
    expect(pdf.byteLength).toBeGreaterThan(1000);
    // PDF files start with the "%PDF-" magic header.
    expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  }, 60_000);
});
