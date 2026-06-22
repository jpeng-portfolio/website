// DOCX renderer: builds an ATS-friendly Word document programmatically with the
// `docx` library — same content and section order as the PDF. Output is
// deterministic for identical input (the library writes no timestamps into the
// content we control).
//
// The document is built from a pure `resumeDocxOutline(model)` so its structure
// can be asserted in a unit test without unzipping the packed .docx.

import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import type { ResumeModel } from "@/lib/resume-model";

export type DocxLine =
  | { kind: "subheading"; left: string; right?: string }
  | { kind: "italic"; text: string }
  | { kind: "body"; text: string }
  | { kind: "bullet"; text: string };

export type ResumeDocxSection = { title: string; lines: DocxLine[] };

export type ResumeDocxOutline = {
  name: string;
  headline: string;
  contact: string;
  sections: ResumeDocxSection[];
};

/** Pure outline of the document — the single source for the rendered .docx. */
export function resumeDocxOutline(model: ResumeModel): ResumeDocxOutline {
  const { contact } = model;

  const experienceLines: DocxLine[] = [];
  for (const role of model.experience) {
    experienceLines.push({ kind: "subheading", left: role.role, right: role.period });
    experienceLines.push({ kind: "italic", text: role.company });
    for (const bullet of role.bullets) {
      experienceLines.push({ kind: "bullet", text: bullet });
    }
  }

  const skillLines: DocxLine[] = model.skills.map((group) => ({
    kind: "body",
    text: `${group.title}: ${group.skills.join(", ")}`,
  }));

  const educationLines: DocxLine[] = [];
  for (const edu of model.education) {
    educationLines.push({ kind: "subheading", left: edu.institution, right: edu.date });
    educationLines.push({ kind: "body", text: edu.credential });
  }

  const certLines: DocxLine[] = model.certifications.map((cert) => ({
    kind: "subheading",
    left: cert.name,
    right: cert.date,
  }));

  return {
    name: contact.fullName,
    headline: model.headline,
    contact: [contact.email, contact.phone, contact.location].join("  •  "),
    sections: [
      { title: "Summary", lines: [{ kind: "body", text: model.summary }] },
      { title: "Experience", lines: experienceLines },
      { title: "Skills", lines: skillLines },
      { title: "Education", lines: educationLines },
      { title: "Certifications", lines: certLines },
    ],
  };
}

function lineToParagraph(line: DocxLine): Paragraph {
  switch (line.kind) {
    case "subheading":
      return new Paragraph({
        spacing: { before: 120, after: 20 },
        tabStops: line.right
          ? [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }]
          : undefined,
        children: [
          new TextRun({ text: line.left, bold: true }),
          ...(line.right
            ? [new TextRun({ text: `\t${line.right}`, color: "555555" })]
            : []),
        ],
      });
    case "italic":
      return new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: line.text, italics: true })],
      });
    case "bullet":
      return new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 20 },
        children: [new TextRun(line.text)],
      });
    case "body":
      return new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun(line.text)],
      });
  }
}

function sectionParagraphs(section: ResumeDocxSection): Paragraph[] {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 60 },
      children: [new TextRun({ text: section.title.toUpperCase() })],
    }),
    ...section.lines.map(lineToParagraph),
  ];
}

/** Renders the résumé model to a .docx buffer. */
export async function renderResumeDocx(model: ResumeModel): Promise<Buffer> {
  const outline = resumeDocxOutline(model);

  const header: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: outline.name, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: outline.headline, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: outline.contact, color: "444444" })],
    }),
  ];

  // The document body (word/document.xml) is fully deterministic. The only
  // run-to-run variance is the auto-generated created/modified timestamp in
  // docProps/core.xml — package metadata, not résumé content — which the CI
  // determinism check ignores by comparing the document body.
  const doc = new Document({
    creator: outline.name,
    title: `${outline.name} — Résumé`,
    sections: [
      {
        properties: {},
        children: [
          ...header,
          ...outline.sections.flatMap(sectionParagraphs),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
