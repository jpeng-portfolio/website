# M1 · Owner-gated resume downloads (single-source PDF + DOCX)

> Size: XL · Builds on: the **landed** GitHub Actions + Pulumi foundation — the `Deploy`/`PR` workflows
> (`.github/workflows/`) and the `infrastructure/` Pulumi program (`dns` / `static-site` / `contact-api`,
> composed in `index.ts`). M1 **extends** both: a new auth module + a protected CloudFront behavior in the
> Pulumi program, and a résumé-generation step in the deploy build.

## Goal
Make the website the **single source of truth** for résumé content, have the **pipeline regenerate**
a traditional, ATS-friendly **PDF and DOCX** from that content on every deploy, and expose **two
download links** (PDF + DOCX) behind an **owner-only sign-in portal** (Amazon Cognito + a CloudFront
Lambda@Edge authorizer). Jason edits his résumé by editing the site's data; CI rebuilds both
documents; only Jason — after signing in — can download them.

## In scope
- A canonical résumé data model in `src/lib/` (summary, education, certifications, headline) that the
  **rendered site sections also consume**, so the site and the résumé never drift.
- Pure-Node document generation from that model: **Playwright → PDF**, **`docx` library → DOCX**, in a
  traditional single-column ATS layout.
- A CI step that **regenerates both documents from the site content** before `next build`, publishing
  them to a CloudFront-gated path.
- **Owner-only auth:** a single Cognito user (self-sign-up disabled), a sign-in portal page, and a
  Lambda@Edge authorizer protecting the `/resume/files/*` CloudFront behavior.
- The two download links (PDF + DOCX) surfaced in the site, reachable only after sign-in.

## Out of scope (YAGNI)
- Multi-user accounts, recruiter access, public résumé download, lead capture, or sharing links.
- Self-registration / password reset UX beyond what a single owner needs.
- Multiple résumé variants / tailoring per job, cover letters, or a résumé editor UI (content is edited
  in `src/lib` data, as code).
- Analytics on downloads.

## Architecture & decisions

### Content / data model (`src/lib`)
- **`src/lib/resume-data.ts`** — public-safe résumé content: professional summary, headline/title,
  education, certifications. The existing **`experience-data.ts`** and **`skills-data.ts`** are reused
  as-is (résumé skill groups are *derived* from the site's skill categories — levels dropped for the
  document). `about.tsx` and `certifications.tsx` are **refactored to read from this data** instead of
  their current hardcoded literals, so editing the data updates both the site and the résumé.
- **Private contact details (phone, email, location) are NOT committed to source.** This repo is a
  public-facing portfolio; per the project's fail-loud-config rule, the generator reads contact details
  from **build-time secrets** (e.g. a single `RESUME_CONTACT_JSON` CI secret / Pulumi config) and
  **fails loudly if unset**. No rendered component ever imports them — preserving the on-page privacy
  rule (no phone/street/direct-email in page content). The documents themselves are owner-gated, so the
  full contact header is fine inside them.
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
- Orchestrated by `npm run resume:build`, writing to `public/resume/files/` so `next build` copies them
  into `out/resume/files/` and they deploy to S3. Generation is **deterministic** (stable ordering, no
  timestamps in content) so reruns are idempotent.

### CI pipeline
- Slot `resume:build` (install Playwright Chromium) **before `npm run build`** in `deploy.yml`'s
  **Build site** step (which already runs between the two-phase `pulumi up` — provision → build → publish)
  and in `_gates.yml`'s **e2e** build. Contact details are injected from a CI secret (`RESUME_CONTACT_JSON`);
  a generation failure **fails the build** (fail-loud).
- Files publish to the gated `/resume/files/*` path via the existing publish phase (`publishContent=true`);
  the S3 bucket stays private (OAC) — the only way in is via CloudFront, which enforces auth on that behavior.

### Auth (owner-only)
- **Cognito** user pool + app client + Hosted UI domain; **self-sign-up disabled**, a **single user**
  provisioned by IaC/admin (no public registration). Outputs (pool id, client id, Hosted UI domain) →
  build-time `NEXT_PUBLIC_COGNITO_*` (fail loud if unset).
- **Lambda@Edge authorizer** (us-east-1) on the `/resume/files/*` CloudFront behavior (viewer-request):
  validate the Cognito session (cognito-at-edge pattern); redirect unauthenticated requests to sign-in.
  Edge-function constraints respected (no runtime env vars → config baked at deploy; us-east-1; size
  limits; propagation latency).
- **Sign-in portal** (`/resume`): Cognito Hosted UI redirect + callback handling; once authenticated,
  shows the two download links.

### Infra (Pulumi — verify every resource type/schema via the Pulumi MCP)
Cognito user pool/client/domain + single user; Lambda@Edge function + edge IAM; a new CloudFront cache
behavior for `/resume/files/*` with the viewer-request association. Region pinned **us-east-1**.

### Where tests land
- `resume-model.ts` transform + skill-group mapping/formatting → **Vitest unit tests**.
- DOCX builder → structure/snapshot test (expected sections/headings).
- PDF generation → smoke test (valid, non-empty PDF).
- Lambda@Edge authorizer logic → unit tests (valid / missing / expired session → allow / redirect).
- Infra → clean **`pulumi preview`**.
- Sign-in portal + download links → **real-browser check** (sign in → download both).

## Phases & tasks

> Two tracks run in parallel after M1.1: the **résumé track** (M1.1 → M1.2 → M1.3) and the **auth track**
> (M1.4 → M1.5). They converge at **M1.6** (UI needs both the gated files and Cognito config) and **M1.7**.

### M1.1 — Résumé content as single source of truth  *(Depends on: —)*
- **M1.1.1** (M) — Create `src/lib/resume-data.ts` (summary, headline, education, certifications) and
  refactor `about.tsx` + `certifications.tsx` to consume it. Real-browser check (no visual regression).
- **M1.1.2** (S) — Add the **private-contact contract**: a typed `resume-contact` accessor that reads
  contact details from build-time env/secret and fails loud if unset; add an eslint
  `no-restricted-imports` guard + a unit test ensuring no rendered component imports it.
- **M1.1.3** (M) — Create `src/lib/resume-model.ts`: pure transform composing experience + skills +
  resume-data into `ResumeModel` (skill-group mapping, date/period formatting, ordering) + Vitest unit tests.

### M1.2 — Document generation (PDF + DOCX)  *(Depends on: M1.1)*
- **M1.2.1** (M) — Print/HTML résumé template + `scripts/resume/render-pdf.ts` (Playwright Chromium →
  PDF), ATS single-column layout. Smoke test.
- **M1.2.2** (M) — `scripts/resume/render-docx.ts` (`docx` library → DOCX), same content/sections.
  Structure test.
- **M1.2.3** (S) — `scripts/resume/build.ts` orchestrator + `resume:build` script; output to
  `public/resume/files/`; deterministic/idempotent. *(Integration step — lands after 1.2.1/1.2.2.)*

### M1.3 — CI regenerates the résumé  *(Depends on: M1.2)*
- **M1.3.1** (M) — Add résumé generation to `deploy.yml`'s **Build site** step and `_gates.yml`'s **e2e**
  build (install Chromium, inject `RESUME_CONTACT_JSON` secret, run `resume:build` before `npm run build`);
  the publish phase ships `out/resume/files/*`. Doc-gen failure fails the build.
- **M1.3.2** (S) — CI assertion that both files are produced and non-empty; generation is deterministic.

### M1.4 — Auth building blocks  *(Depends on: —, can run parallel to M1.1–M1.3)*
- **M1.4.1** (M) — Pulumi: Cognito user pool + app client + Hosted UI domain, **self-sign-up disabled**,
  one provisioned user; outputs → `NEXT_PUBLIC_COGNITO_*` (fail loud if unset). Verify schemas via Pulumi MCP.
- **M1.4.2** (M) — Lambda@Edge authorizer fn (us-east-1, cognito-at-edge pattern) + unit tests
  (valid/missing/expired session). Disjoint from 1.4.1.

### M1.5 — Wire gating into CloudFront  *(Depends on: M1.4)*
- **M1.5.1** (M) — Pulumi: `/resume/files/*` CloudFront behavior + viewer-request Lambda@Edge
  association + edge IAM; `pulumi preview` clean.

### M1.6 — Sign-in portal + download UI  *(Depends on: M1.3, M1.5)*
- **M1.6.1** (M) — `/resume` sign-in portal: Cognito Hosted UI redirect + callback; show download links
  when authenticated. Uses `NEXT_PUBLIC_COGNITO_*`.
- **M1.6.2** (S) — Download-links component (PDF + DOCX → `/resume/files/...`) placed in the site.
  Disjoint from 1.6.1; integrated at end of phase. Real-browser check.

### M1.7 — Hardening, end-to-end verification & launch  *(Depends on: M1.6)*
- **M1.7.1** (S) — End-to-end real-browser test: sign in → download PDF + DOCX; unauthenticated request
  to `/resume/files/*` redirects to sign-in.
- **M1.7.2** (S) — Least-privilege review of the edge Lambda IAM; a11y + error states of the portal; docs update.

## Definition of Done (per phase)
- **M1.1** — All résumé content lives in `src/lib`; `about.tsx`/`certifications.tsx` render from it; private
  contact is secret-sourced + import-guarded; `resume-model` transform unit-tested green; lint/typecheck pass.
- **M1.2** — `npm run resume:build` produces a valid PDF + DOCX into `public/resume/files/`; renderer tests green.
- **M1.3** — A merge build regenerates both documents from site content and publishes them; gen failure fails CI.
- **M1.4** — Cognito (single user, no self-sign-up) + the edge authorizer fn exist; authorizer unit tests green;
  `pulumi preview` clean.
- **M1.5** — `/resume/files/*` is protected by the edge authorizer; `pulumi preview` clean; unauthenticated
  request is redirected.
- **M1.6** — Signing in at `/resume` reveals working PDF + DOCX downloads; verified in a real browser.
- **M1.7** — Full sign-in→download flow verified end-to-end; IAM least-privilege confirmed; a11y/error states done.

## Risks / open questions
- **Single CloudFront distribution.** The auth phases add a protected `/resume/files/*` behavior to the
  **existing** distribution owned by `infrastructure/src/static-site.ts` — not a new distribution. The
  Pulumi change must extend that module in place (Lambda@Edge assoc + behavior) so `pulumi preview` shows
  an in-place update, and the deploy's two-phase `pulumi up` still converges cleanly.
- **Lambda@Edge limits.** No runtime env vars (bake config at deploy), us-east-1 only, code-size caps,
  and minutes-long propagation on each change — slows the auth phases' iteration.
- **Contact details exposure.** Must come from CI secrets / Pulumi config, never committed, since the repo
  may be public. Generator fails loud if the secret is missing.
- **Single-user provisioning.** Confirm how the one Cognito user's credentials are seeded (IaC-created user
  + initial password via secret, vs. manual one-time admin create). Open question.
- **ATS fidelity.** Headless-Chromium PDF must stay text-selectable (not rasterized) for ATS parsing —
  validate during M1.2.

## Status / Next steps / Gotchas
- **Status:** **all phases implemented** on `claude/gracious-galileo-qxblk6` (PR #11). Résumé track
  (M1.1–M1.3): single-source content, deterministic PDF/DOCX generation, CI regeneration. Auth track
  (M1.4–M1.5): Cognito single-owner pool + Hosted UI + Lambda@Edge authorizer + `/resume/files/*` gating.
  Convergence (M1.6–M1.7): `/resume` portal + gated download links + e2e + docs. CI is green
  (gates + edge-authorizer tests + a clean in-place `pulumi preview`).
- **Deploy prerequisites (seed once before the production deploy, fail-loud if unset):**
  - `pulumi config set --secret jpeng-portfolio-infra:resumeOwnerEmail <owner email>`
  - `pulumi config set --secret jpeng-portfolio-infra:resumeOwnerTempPassword <temp password>`
  - `RESUME_CONTACT_JSON` GitHub Actions secret (résumé contact header JSON).
  - `cognitoDomainPrefix` is committed in `Pulumi.prod.yaml` (change if the subdomain is taken).
- **Next step:** merge to `master` → the Deploy workflow provisions Cognito + the edge authorizer and
  publishes the gated files in the same run. Then run the **live** M1.7.1 verification (the auth flow can
  only be checked against the deployed distribution): sign in at `/resume` → download both; an
  unauthenticated `GET /resume/files/*` redirects to the Hosted UI. Lambda@Edge propagation takes a few
  minutes after deploy, and the first sign-in forces the temporary-password change.
- **Gotcha:** keep résumé generation deterministic (no timestamps in document content) so CI reruns don't
  produce spurious diffs; keep the rendered site free of any contact detail the privacy rule forbids; and
  never commit the owner email/password (secret-sourced).
