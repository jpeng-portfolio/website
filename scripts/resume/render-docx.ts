// Thin runtime wrapper: pack the résumé document model into a DOCX buffer.

import { Packer } from "docx";
import { buildResumeDocument } from "../../src/lib/resume-docx";
import type { ResumeModel } from "../../src/lib/resume-model";

export async function renderResumeDocx(model: ResumeModel): Promise<Buffer> {
  return Packer.toBuffer(buildResumeDocument(model));
}
