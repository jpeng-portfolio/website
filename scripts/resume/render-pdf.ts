// PDF renderer: drives headless Chromium (via Playwright) over the print/HTML
// template to produce a text-selectable, ATS-friendly PDF. Output is
// deterministic for identical input (no headers/footers, no date stamps).

import { chromium } from "@playwright/test";
import type { ResumeModel } from "@/lib/resume-model";
import { renderResumeHtml } from "./template";

/**
 * Chromium stamps the current time into the PDF's /CreationDate and /ModDate.
 * That's the only run-to-run variance, so we pin those date strings to a fixed
 * epoch. The replacement is the same byte length (D: + 14 digits), so the PDF's
 * xref offsets stay valid and reruns are byte-identical.
 */
function normalizePdfDates(pdf: Buffer): Buffer {
  const latin1 = pdf.toString("latin1");
  const normalized = latin1.replace(/D:\d{14}/g, "D:19700101000000");
  return Buffer.from(normalized, "latin1");
}

/** Renders the résumé model to a PDF buffer using headless Chromium. */
export async function renderResumePdf(model: ResumeModel): Promise<Buffer> {
  const html = renderResumeHtml(model);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      // Margins are handled by the template's @page rule.
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return normalizePdfDates(pdf);
  } finally {
    await browser.close();
  }
}
