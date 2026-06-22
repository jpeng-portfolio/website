# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Personal portfolio website — a **static Next.js 16 (App Router)** site exported with
`output: "export"` to `out/` and served from **S3 + CloudFront**. TypeScript (strict), React 19,
Tailwind v4, shadcn/ui. Package manager **npm**; CI runs on **Node 22**.

The repo also contains an in-repo `infrastructure/` folder (IaC) that is being migrated from
Terraform to **Pulumi** (infra + app are versioned together, SST-style). See
`MIGRATION_PROMPT.md` for the CI/CD + IaC migration plan.

## Commands

```bash
npm run dev      # local dev server
npm run build    # static export → out/
npm run start    # serve a production build
npm run lint     # eslint
```

> Planned (added during the GitHub Actions / Pulumi migration — see `MIGRATION_PROMPT.md`):
> `typecheck` (`tsc --noEmit`), `test:unit` (Vitest), `test:e2e` (Playwright). Once they exist,
> run them as part of the gates below.

## Project conventions

- **Framework:** Next.js App Router, static export mode. Keep `out/` / trailing-slash behavior intact.
- **UI baseline:** shadcn components with custom composition; `@unlumen-ui` + `motion/react` for
  animation where helpful.
- **Typography:** Inter for primary content, JetBrains Mono for technical labels and metadata.
- **Theme palette:**
  - Background: `#F5F0E8`
  - Primary contrast: `#0F172A`
  - Accent blue: `#60a5fa`
  - Accent purple: `#c084fc`
  - Accent teal: `#2DD4BF`
  - Accent red: `#f87171`
- Skills bars stay segmented and percentage-based, 0–100.
- **Never render personal contact details** (phone, street address, direct email) in page content.

## Architecture & file layout

- Keep page sections modular in `src/components/sections/`.
- Keep display data in `src/lib/*-data.ts`.
- Keep site metadata and social links in `src/config/site.ts`.
- The contact form posts to `NEXT_PUBLIC_CONTACT_API_URL` (→ API Gateway → Lambda → SES); keep it
  SES-integration friendly.
- Required env/config (`NEXT_PUBLIC_CONTACT_API_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`) must
  **fail loudly when unset** — no silent fallbacks or placeholder defaults that let the app run
  misconfigured.

## Quality expectations

- Keep code clean and composable; prefer small, reusable components over deeply nested JSX.
- **Any new pure logic** (parsers, transforms, data shaping) ships with unit tests in the same change.
- **Any UI change** gets a real browser check — render the page and observe the changed flow; don't
  rely on typecheck/lint alone.
- **Verify, don't assume:** review the actual diff before reporting work as done. A summary of intent
  is not proof of what landed.
- For large or parallelizable work, prefer delegating to subagents and reviewing their output over
  doing everything inline.

## Git workflow

- **Conventional Commits are required** for every commit message and PR title (`feat:`, `fix:`,
  `chore:`, `docs:`, `refactor:`, `test:`, optionally scoped).
- **Never commit or push directly to the default branch.** Work on a feature branch named after what
  it delivers (`feat-…`, `fix-…`, or `issue-<N>-<slug>`); short, kebab-case.
- Run `npm run lint` (and `typecheck` / tests once they exist) before every commit and the final
  push — all must exit 0. Never bypass hooks with `--no-verify`; the same checks run in CI.
- **Never open a PR without the user's explicit permission.** Finishing the work, committing, and
  pushing the branch is expected; opening a PR is a separate action that requires the user to ask
  for it. When the branch is ready, push it, summarize what's ready, and stop.

## CI/CD & infrastructure

CI/CD runs on **GitHub Actions** with **PR gates** (lint → typecheck → unit → integration →
`pulumi preview`) and **deploy on merge** (`pulumi up` + publish the static site). IaC is **Pulumi
(TypeScript)** in `infrastructure/`, state in **Pulumi Cloud**, AWS auth via **GitHub OIDC**. Use
the connected **Pulumi MCP server** as the source of truth for any Pulumi resource/schema decision
rather than writing resources from memory. Full plan: `MIGRATION_PROMPT.md`.

**PR preview environments.** Each PR also deploys a disposable `pr-<N>` Pulumi stack to
`pr-<N>.jpcloudengineering.com` (`pr.yml`), with the URL surfaced in the run summary; `teardown.yml`
destroys it when the PR closes. Previews are **static-site only** — the apex-shared contact API is
gated off via `deployContactApi=false` (and any future apex-shared/edge resources, e.g. M1's
Lambda@Edge auth, must be gated the same way so previews stay light and tear down cleanly). The
per-stack host is set with the `siteHost` config key. Preview stacks need a `CLOUDFLARE_API_TOKEN`
GitHub secret (they can't reuse prod's encrypted config). See `infrastructure/README.md`.
