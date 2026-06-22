// Résumé build orchestrator: reads the secret-sourced contact (fail-loud),
// composes the canonical content into a ResumeModel, renders both the PDF and
// the DOCX, and writes them to public/resume/files/ so `next build` copies them
// into out/resume/files/ for the gated CloudFront path.
//
// Run via `npm run resume:build`. Generation is deterministic — reruns with the
// same input produce byte-identical content — so CI reruns don't churn.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getResumeContact } from "@/lib/resume-contact";
import { buildResumeModel } from "@/lib/resume-model";
import { renderResumePdf } from "./render-pdf";
import { renderResumeDocx } from "./render-docx";

const PDF_FILENAME = "jason-paquette-resume.pdf";
const DOCX_FILENAME = "jason-paquette-resume.docx";

function outputDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  // scripts/resume -> repo root -> public/resume/files
  return join(here, "..", "..", "public", "resume", "files");
}

async function main(): Promise<void> {
  const contact = getResumeContact();
  const model = buildResumeModel(contact);

  const dir = outputDir();
  await mkdir(dir, { recursive: true });

  const [pdf, docx] = await Promise.all([
    renderResumePdf(model),
    renderResumeDocx(model),
  ]);

  const pdfPath = join(dir, PDF_FILENAME);
  const docxPath = join(dir, DOCX_FILENAME);
  await writeFile(pdfPath, pdf);
  await writeFile(docxPath, docx);

  console.log(`resume:build — wrote ${pdf.byteLength} bytes -> ${pdfPath}`);
  console.log(`resume:build — wrote ${docx.byteLength} bytes -> ${docxPath}`);
}

main().catch((error) => {
  console.error("resume:build failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
