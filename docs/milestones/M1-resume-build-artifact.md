# M1 · Résumé as a build artifact (single-source PDF + DOCX)

> Size: M · Builds on: the **landed** GitHub Actions + Pulumi foundation — the `Deploy`/`PR` workflows
> (`.github/workflows/`) and the `infrastructure/` Pulumi program (`dns` / `static-site` / `contact-api`,
> composed in `index.ts`). M1 **adds a résumé-generation step to CI** and uploads the result as a
> workflow artifact. It does **not** change the Pulumi program or the deployed site's routing.

## Goal
Make the website the **single source of truth** for résumé content, and have **CI regenerate** a
traditional, ATS-friendly **PDF and DOCX** from that content — published as **GitHub Actions
workflow artifacts** that only the owner can download from the run. Jason edits his résumé by editing
the site's data; CI rebuilds both documents and attaches them to the workflow run for him to grab and
submit with applications. No public download, no sign-in, no auth infrastructure.

## In scope
- A canonical résumé data model in `src/lib/` (summary, education, certifications, headline) that the
  **rendered site sections also consume**, so the site and the résumé never drift.
- Pure-Node document generation from that model: **Playwright → PDF**, **`docx` library → DOCX**, in a
  traditional single-column ATS layout.
- A CI step that **regenerates both documents from the site content** and uploads them as a
  **GitHub Actions artifact** (`actions/upload-artifact`).

## Out of scope (YAGNI)
- **Any auth / owner-gating** — no Cognito, no Lambda@Edge authorizer, no sign-in portal.
- **Serving the résumé from the site** — the documents are not copied into `out/`, not published to
  S3, and not reachable from `jpcloudengineering.com`. No CloudFront behavior changes.
- Public résumé download, recruiter access, lead capture, sharing links, or download analytics.
- Multiple résumé variants / tailoring per job, cover letters, or a résumé editor UI (content is edited
  in `src/lib` data, as code).

## Architecture & decisions

### Content / data model (`src/lib`)
- **`src/lib/resume-data.ts`** — public-safe résumé content: professional summary, headline/title,
  education, certifications. The existing **`experience-data.ts`** and **`skills-data.ts`** are reused
  as-is (résumé skill groups are *derived* from the site's skill categories — levels dropped for the
  document). `about.tsx` and `certifications.tsx` are **refactored to read from this data** instead of
  their current hardcoded literals, so editing the data updates both the site and the résumé.
- **Private contact details (phone, email, location) are NOT committed to source.** This repo is a
  public-facing portfolio; per the project's fail-loud-config rule, the generator reads contact details
  from a **build-time secret** (a single `RESUME_CONTACT_JSON` CI secret) and **fails loudly if unset**.
  No rendered component ever imports them — preserving the on-page privacy rule (no phone/street/
  direct-email in page content). The full contact header is fine inside the generated documents, since
  the artifact is only reachable by the owner from the workflow run.
- **`src/lib/resume-model.ts`** — a **pure transform** that composes `experience-data` + `skills-data` +
  `resume-data` (+ injected contact at generation time) into a normalized `ResumeModel` (skill-group
  mapping, period/date formatting, ordering). This is the one thing both renderers consume. Pure logic →
  unit-tested.

### Document generation (pure-Node, no system binaries)
- A shared **résumé template** (HTML for print + a parallel DOCX structure) driven by `ResumeModel`,
  styled as a clean single-column **ATS-friendly** document (not the site's marketing visual system).
- **PDF:** render the print template with headless **Chromium via Playwright** (already a planned test
  dep) → `jason-paquette-resume.pdf`.
- **DOCX:** build programmatically with the **`docx`** npm library → `jason-paquette-resume.docx`.
- Orchestrated by `npm run resume:build`, writing to a build-output dir (e.g. `dist/resume/`) that is
  **git-ignored** and never copied into `out/`. Generation is **deterministic** (stable ordering, no
  timestamps in content) so reruns are idempotent.

### CI pipeline
- A single **`resume` job in `_gates.yml`** installs Playwright Chromium, resolves the contact block
  (real `RESUME_CONTACT_JSON` secret when available, else a placeholder so fork PRs stay green), runs
  `npm run resume:build`, asserts both files are valid + non-empty, and uploads them via
  **`actions/upload-artifact`** (name `resume`). Because both `pr.yml` and `deploy.yml` call `_gates.yml`
  with `secrets: inherit`, this one job covers **both** PR and deploy: a PR always proves the documents
  generate, and a merge to `master` produces a fresh artifact built with the **real** contact secret.
  One job means no duplicate-artifact collision.
- **Doc-generation failure fails CI** (fail-loud), but a *missing* secret falls back to the placeholder,
  so the production deploy is never blocked on the secret being configured.
- The artifact is downloadable from the workflow run by the owner. **No publish to S3, no change to the
  Pulumi program or the deployed site.**

### Infra
- **None.** No Pulumi changes. The static-site distribution, buckets, and behaviors are untouched.
- **No preview-environment interaction.** The earlier auth-based design needed its Cognito/Lambda@Edge
  resources gated off the per-PR preview stacks; this build-artifact approach adds no infra and serves
  nothing from the site, so per-PR preview deploys and `teardown.yml` are entirely unaffected.

### Where tests land
- `resume-model.ts` transform + skill-group mapping/formatting → **Vitest unit tests**.
- DOCX builder → structure/snapshot test (expected sections/headings).
- PDF generation → smoke test (valid, non-empty, text-selectable PDF).
- `about.tsx` / `certifications.tsx` refactor → **real-browser check** (no visual regression).

## Phases & tasks

### M1.1 — Résumé content as single source of truth  *(Depends on: —)*
- **M1.1.1** (M) — Create `src/lib/resume-data.ts` (summary, headline, education, certifications) and
  refactor `about.tsx` + `certifications.tsx` to consume it. Real-browser check (no visual regression).
- **M1.1.2** (S) — Add the **private-contact contract**: a typed `resume-contact` accessor that reads
  contact details from a build-time secret and fails loud if unset; add an eslint
  `no-restricted-imports` guard + a unit test ensuring no rendered component imports it.
- **M1.1.3** (M) — Create `src/lib/resume-model.ts`: pure transform composing experience + skills +
  resume-data into `ResumeModel` (skill-group mapping, date/period formatting, ordering) + Vitest unit tests.

### M1.2 — Document generation (PDF + DOCX)  *(Depends on: M1.1)*
- **M1.2.1** (M) — Print/HTML résumé template + `scripts/resume/render-pdf.ts` (Playwright Chromium →
  PDF), ATS single-column layout. Smoke test (valid, text-selectable PDF).
- **M1.2.2** (M) — `scripts/resume/render-docx.ts` (`docx` library → DOCX), same content/sections.
  Structure test.
- **M1.2.3** (S) — `scripts/resume/build.ts` orchestrator + `resume:build` script; output to a
  git-ignored `dist/resume/`; deterministic/idempotent. *(Integration step — lands after 1.2.1/1.2.2.)*

### M1.3 — CI builds & uploads the artifact  *(Depends on: M1.2)*
- **M1.3.1** (M) — Add a `resume` job to `_gates.yml` (install Chromium, resolve `RESUME_CONTACT_JSON`
  secret with a placeholder fallback, run `resume:build`) and upload `dist/resume/*` via
  `actions/upload-artifact`. Shared by PR + deploy via the called-workflow pattern. Doc-gen failure fails
  the build.
- **M1.3.2** (S) — CI assertion that both files are produced, non-empty, and have valid PDF/DOCX magic
  bytes. (Content is deterministic by construction — stable ordering, no timestamps in the document body;
  DOCX bytes are not asserted identical because the `docx` library embeds non-deterministic internal ids.)

## Definition of Done (per phase)
- **M1.1** — All résumé content lives in `src/lib`; `about.tsx`/`certifications.tsx` render from it; private
  contact is secret-sourced + import-guarded; `resume-model` transform unit-tested green; lint/typecheck pass.
- **M1.2** — `npm run resume:build` produces a valid PDF + DOCX into `dist/resume/`; renderer tests green.
- **M1.3** — A CI run regenerates both documents from site content and uploads them as a downloadable
  workflow artifact; generation failure fails CI.

## Risks / open questions
- **Contact details exposure.** Must come from a CI secret (`RESUME_CONTACT_JSON`), never committed,
  since the repo may be public. Generator fails loud if the secret is missing.
- **ATS fidelity.** Headless-Chromium PDF must stay text-selectable (not rasterized) for ATS parsing —
  validate during M1.2.
- **Artifact retention.** GitHub Actions artifacts have a retention window (default ~90 days) and are
  only reachable from the workflow run, not the public site — acceptable, since the résumé is for the
  owner to download and submit manually. Re-running CI regenerates a fresh artifact.

## Status / Next steps / Gotchas
- **Status:** ✅ **Implemented** (M1.1–M1.3) on branch `claude/eager-goodall-57y77d`.
  - M1.1 — `src/lib/resume-data.ts`, `resume-contact.ts` (fail-loud + eslint guard + isolation test),
    `resume-model.ts`; `about.tsx`/`certifications.tsx` refactored to consume the data (verified: static
    export renders identical content).
  - M1.2 — `resume-html.ts` (PDF template) + `resume-docx.ts` (pure block builder + `docx` document);
    `scripts/resume/{render-pdf,render-docx,build}.ts`; `npm run resume:build` → `dist/resume/`. Verified
    locally: valid 2-page **text-selectable** PDF (84 text blocks / 305 show-text ops / 0 images / 2
    ToUnicode CMaps) + valid DOCX; fail-loud confirmed on missing secret.
  - M1.3 — `resume` job in `_gates.yml` (Chromium install, secret-or-placeholder, build, validity
    assertions, `upload-artifact`). PDF smoke test in `tests/e2e/resume-pdf.spec.ts`.
  - Gates green locally: lint (0 errors), typecheck, 62 unit tests.
- **Next step:** set the **`RESUME_CONTACT_JSON`** GitHub Actions secret (object with `fullName`, `email`,
  `phone`, `location`) so deploy builds embed real contact details; open a PR when ready.
- **Gotcha:** résumé content is kept deterministic (no timestamps in the document body); the private
  contact accessor is import-guarded out of all rendered UI so no contact detail can leak to the page.
