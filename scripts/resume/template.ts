// Print/HTML résumé template — a clean, single-column, ATS-friendly document
// (deliberately NOT the site's marketing visual system). Driven entirely by the
// normalized `ResumeModel`. Pure string generation: no I/O, no timestamps, so
// output is deterministic and reruns are byte-identical for identical input.

import type { ResumeModel } from "@/lib/resume-model";

/** Escapes text for safe interpolation into HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function section(title: string, body: string): string {
  return `<section class="section">
      <h2>${escapeHtml(title)}</h2>
      ${body}
    </section>`;
}

function experienceBlock(model: ResumeModel): string {
  const roles = model.experience
    .map(
      (entry) => `<div class="role">
        <div class="role-head">
          <span class="role-title">${escapeHtml(entry.role)}</span>
          <span class="role-period">${escapeHtml(entry.period)}</span>
        </div>
        <div class="role-company">${escapeHtml(entry.company)}</div>
        <ul>
          ${entry.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("\n          ")}
        </ul>
      </div>`,
    )
    .join("\n      ");
  return section("Experience", roles);
}

function skillsBlock(model: ResumeModel): string {
  const groups = model.skills
    .map(
      (group) => `<div class="skill-group">
        <span class="skill-title">${escapeHtml(group.title)}:</span>
        <span class="skill-list">${escapeHtml(group.skills.join(", "))}</span>
      </div>`,
    )
    .join("\n      ");
  return section("Skills", groups);
}

function educationBlock(model: ResumeModel): string {
  const items = model.education
    .map(
      (edu) => `<div class="entry">
        <div class="entry-head">
          <span class="entry-title">${escapeHtml(edu.institution)}</span>
          <span class="entry-date">${escapeHtml(edu.date)}</span>
        </div>
        <div class="entry-sub">${escapeHtml(edu.credential)}</div>
      </div>`,
    )
    .join("\n      ");
  return section("Education", items);
}

function certificationsBlock(model: ResumeModel): string {
  const items = model.certifications
    .map(
      (cert) => `<li><span>${escapeHtml(cert.name)}</span><span class="entry-date">${escapeHtml(cert.date)}</span></li>`,
    )
    .join("\n        ");
  return section("Certifications", `<ul class="certs">\n        ${items}\n      </ul>`);
}

/** Renders the complete résumé as a self-contained HTML document. */
export function renderResumeHtml(model: ResumeModel): string {
  const { contact } = model;
  const contactLine = [contact.email, contact.phone, contact.location]
    .map(escapeHtml)
    .join(" &nbsp;•&nbsp; ");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(contact.fullName)} — Résumé</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: "Calibri", "Helvetica Neue", Arial, sans-serif;
    color: #111111;
    font-size: 10.5pt;
    line-height: 1.35;
  }
  .page { padding: 0; }
  header { text-align: center; margin-bottom: 14px; }
  header h1 { font-size: 20pt; margin: 0 0 2px; letter-spacing: 0.3px; }
  header .headline { font-size: 11pt; color: #333333; margin: 0 0 4px; font-weight: 600; }
  header .contact { font-size: 9.5pt; color: #444444; }
  .section { margin-bottom: 12px; }
  .section h2 {
    font-size: 11pt;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    border-bottom: 1px solid #888888;
    padding-bottom: 2px;
    margin: 0 0 6px;
  }
  p.summary { margin: 0; }
  .role { margin-bottom: 8px; }
  .role-head, .entry-head { display: flex; justify-content: space-between; align-items: baseline; }
  .role-title, .entry-title { font-weight: 700; }
  .role-period, .entry-date { font-size: 9.5pt; color: #555555; white-space: nowrap; padding-left: 12px; }
  .role-company { font-style: italic; color: #333333; margin-bottom: 2px; }
  ul { margin: 2px 0 0; padding-left: 18px; }
  li { margin-bottom: 2px; }
  .skill-group { margin-bottom: 3px; }
  .skill-title { font-weight: 700; }
  .entry { margin-bottom: 4px; }
  .entry-sub { color: #333333; }
  ul.certs { list-style: none; padding-left: 0; }
  ul.certs li { display: flex; justify-content: space-between; }
  @page { size: Letter; margin: 0.6in; }
</style>
</head>
<body>
  <div class="page">
    <header>
      <h1>${escapeHtml(contact.fullName)}</h1>
      <p class="headline">${escapeHtml(model.headline)}</p>
      <p class="contact">${contactLine}</p>
    </header>
    ${section("Summary", `<p class="summary">${escapeHtml(model.summary)}</p>`)}
    ${experienceBlock(model)}
    ${skillsBlock(model)}
    ${educationBlock(model)}
    ${certificationsBlock(model)}
  </div>
</body>
</html>`;
}
