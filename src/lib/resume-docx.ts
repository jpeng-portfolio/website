// DOCX résumé builder. Split into a pure `buildResumeDocBlocks` (a flat, typed
// description of the document — unit-testable without the docx runtime) and
// `buildResumeDocument`, which maps those blocks onto the `docx` object model.
// Same content/sections as the HTML/PDF renderer, traditional single column.
//
// Deterministic content: stable ordering and no timestamps in the document body,
// so repeated runs produce the same résumé content.

import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import type { ResumeModel } from "./resume-model";

export type DocBlock =
  | { type: "title"; text: string }
  | { type: "subtitle"; text: string }
  | { type: "contact"; text: string }
  | { type: "heading"; text: string }
  | { type: "entry"; text: string; meta?: string }
  | { type: "paragraph"; text: string }
  | { type: "bullet"; text: string };

/** Pure, ordered description of the résumé document. */
export function buildResumeDocBlocks(model: ResumeModel): DocBlock[] {
  const { contact } = model;
  const blocks: DocBlock[] = [
    { type: "title", text: contact.fullName },
    { type: "subtitle", text: model.headline },
    {
      type: "contact",
      text: [contact.location, contact.phone, contact.email].join("  •  "),
    },
  ];

  blocks.push({ type: "heading", text: "Summary" });
  for (const paragraph of model.summary) {
    blocks.push({ type: "paragraph", text: paragraph });
  }

  blocks.push({ type: "heading", text: "Experience" });
  for (const job of model.experience) {
    blocks.push({
      type: "entry",
      text: `${job.role} — ${job.company}`,
      meta: job.period,
    });
    for (const bullet of job.bullets) {
      blocks.push({ type: "bullet", text: bullet });
    }
  }

  blocks.push({ type: "heading", text: "Skills" });
  for (const group of model.skills) {
    blocks.push({
      type: "bullet",
      text: `${group.title}: ${group.skills.join(", ")}`,
    });
  }

  blocks.push({ type: "heading", text: "Education" });
  for (const entry of model.education) {
    blocks.push({ type: "entry", text: entry.school, meta: entry.date });
    blocks.push({ type: "paragraph", text: entry.credential });
  }

  blocks.push({ type: "heading", text: "Certifications" });
  for (const cert of model.certifications) {
    blocks.push({ type: "bullet", text: `${cert.name} (${cert.date})` });
  }

  return blocks;
}

function blockToParagraph(block: DocBlock): Paragraph {
  switch (block.type) {
    case "title":
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: block.text, bold: true, size: 40 })],
      });
    case "subtitle":
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: block.text, size: 22, color: "333333" })],
      });
    case "contact":
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [new TextRun({ text: block.text, size: 19, color: "444444" })],
      });
    case "heading":
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 220, after: 80 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999", space: 1 },
        },
        children: [
          new TextRun({ text: block.text.toUpperCase(), bold: true, size: 22 }),
        ],
      });
    case "entry":
      return new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        spacing: { before: 80 },
        children: [
          new TextRun({ text: block.text, bold: true }),
          ...(block.meta
            ? [new TextRun({ text: `\t${block.meta}`, color: "555555" })]
            : []),
        ],
      });
    case "paragraph":
      return new Paragraph({ children: [new TextRun({ text: block.text })] });
    case "bullet":
      return new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text: block.text })],
      });
  }
}

export function buildResumeDocument(model: ResumeModel): Document {
  const children = buildResumeDocBlocks(model).map(blockToParagraph);
  return new Document({
    creator: model.contact.fullName,
    title: `${model.contact.fullName} — Résumé`,
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        children,
      },
    ],
  });
}
