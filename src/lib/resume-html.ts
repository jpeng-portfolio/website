// Pure HTML renderer for the print/PDF résumé. Produces a single self-contained
// HTML document (inline CSS, system fonts, no images) in a traditional single-
// column, ATS-friendly layout — real selectable text, not the site's marketing
// visual system. Deterministic: no timestamps, stable ordering from the model.

import type { ResumeModel } from "./resume-model";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function section(title: string, body: string): string {
  return `<section class="block"><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

export function renderResumeHtml(model: ResumeModel): string {
  const { contact } = model;

  const contactLine = [contact.location, contact.phone, contact.email]
    .map(escapeHtml)
    .join(" &nbsp;•&nbsp; ");

  const summary = section(
    "Summary",
    model.summary.map((p) => `<p>${escapeHtml(p)}</p>`).join("")
  );

  const experience = section(
    "Experience",
    model.experience
      .map(
        (job) => `
        <div class="entry">
          <div class="entry-head">
            <span class="entry-title">${escapeHtml(job.role)} — ${escapeHtml(job.company)}</span>
            <span class="entry-meta">${escapeHtml(job.period)}</span>
          </div>
          <ul>${job.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
        </div>`
      )
      .join("")
  );

  const skills = section(
    "Skills",
    `<ul class="skills">${model.skills
      .map(
        (group) =>
          `<li><span class="skill-group">${escapeHtml(group.title)}:</span> ${group.skills
            .map(escapeHtml)
            .join(", ")}</li>`
      )
      .join("")}</ul>`
  );

  const education = section(
    "Education",
    model.education
      .map(
        (entry) => `
        <div class="entry">
          <div class="entry-head">
            <span class="entry-title">${escapeHtml(entry.school)}</span>
            <span class="entry-meta">${escapeHtml(entry.date)}</span>
          </div>
          <p>${escapeHtml(entry.credential)}</p>
        </div>`
      )
      .join("")
  );

  const certifications = section(
    "Certifications",
    `<ul>${model.certifications
      .map(
        (cert) =>
          `<li>${escapeHtml(cert.name)} <span class="entry-meta">(${escapeHtml(cert.date)})</span></li>`
      )
      .join("")}</ul>`
  );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(contact.fullName)} — Résumé</title>
<style>
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; }
  body {
    font-family: "Helvetica Neue", Arial, sans-serif;
    color: #111;
    font-size: 10.5pt;
    line-height: 1.4;
    margin: 0;
  }
  header { text-align: center; margin-bottom: 14px; }
  header h1 { font-size: 20pt; margin: 0; letter-spacing: 0.5px; }
  header .headline { font-size: 11pt; color: #333; margin: 2px 0 4px; }
  header .contact { font-size: 9.5pt; color: #444; }
  h2 {
    font-size: 11pt;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid #999;
    padding-bottom: 2px;
    margin: 14px 0 6px;
  }
  .block { margin-bottom: 4px; }
  .entry { margin-bottom: 8px; }
  .entry-head { display: flex; justify-content: space-between; gap: 12px; }
  .entry-title { font-weight: 700; }
  .entry-meta { color: #555; white-space: nowrap; }
  p { margin: 2px 0; }
  ul { margin: 4px 0 0; padding-left: 18px; }
  li { margin: 2px 0; }
  ul.skills { list-style: none; padding-left: 0; }
  ul.skills li { margin: 3px 0; }
  .skill-group { font-weight: 700; }
</style>
</head>
<body>
<header>
  <h1>${escapeHtml(contact.fullName)}</h1>
  <div class="headline">${escapeHtml(model.headline)}</div>
  <div class="contact">${contactLine}</div>
</header>
${summary}
${experience}
${skills}
${education}
${certifications}
</body>
</html>`;
}
