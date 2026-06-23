// Thin runtime wrapper: render the ATS HTML résumé to a PDF with headless
// Chromium. The PDF is text-based (real HTML text, no images) so it stays
// selectable / ATS-parseable. Chromium comes from the already-present Playwright
// dependency.

import { chromium } from "@playwright/test";
import { renderResumeHtml } from "../../src/lib/resume-html";
import type { ResumeModel } from "../../src/lib/resume-model";

export async function renderResumePdf(model: ResumeModel): Promise<Buffer> {
  const html = renderResumeHtml(model);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    return await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    });
  } finally {
    await browser.close();
  }
}
