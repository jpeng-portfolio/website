// Résumé build orchestrator. Loads the private contact block (fails loud if the
// RESUME_CONTACT_JSON secret is unset), composes the résumé model from site
// content, and writes a PDF + DOCX into the git-ignored dist/resume/ directory.
// Deterministic/idempotent: stable ordering, fixed metadata, no timestamps in the
// document content — reruns produce the same output.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadResumeContact } from "../../src/lib/resume-contact";
import { buildResumeModel } from "../../src/lib/resume-model";
import { renderResumePdf } from "./render-pdf";
import { renderResumeDocx } from "./render-docx";

const OUT_DIR = path.resolve(process.cwd(), "dist/resume");
const PDF_FILE = "jason-paquette-resume.pdf";
const DOCX_FILE = "jason-paquette-resume.docx";

async function main(): Promise<void> {
  // Fails loud if RESUME_CONTACT_JSON is missing/malformed.
  const contact = loadResumeContact();
  const model = buildResumeModel(contact);

  const [pdf, docx] = await Promise.all([
    renderResumePdf(model),
    renderResumeDocx(model),
  ]);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, PDF_FILE), pdf);
  await writeFile(path.join(OUT_DIR, DOCX_FILE), docx);

  console.log(
    `Résumé generated:\n` +
      `  ${path.join(OUT_DIR, PDF_FILE)} (${pdf.length} bytes)\n` +
      `  ${path.join(OUT_DIR, DOCX_FILE)} (${docx.length} bytes)`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
