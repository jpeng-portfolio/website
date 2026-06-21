# Prompt: Design GitHub Actions CI/CD + Pulumi IaC for the jpeng-portfolio website

## Role & objective
Set up modern CI/CD and Infrastructure-as-Code for the `jpeng-portfolio` repo (`website/` app +
in-repo `infrastructure/`). We are **leaving GitLab CI and Terraform behind**. Infra and app code
are **tightly coupled and versioned together (SST-style)**: one repo, shipped as a unit. Deliver:

1. **GitHub Actions workflows** following a PR-driven methodology: every PR runs quality **gates**
   (lint → typecheck → unit tests → integration tests) **plus `pulumi preview`**; merging to the
   default branch runs the gates then **`pulumi up` + deploys production**. No per-PR preview
   *environments* — just the preview diff on PRs, gates only.
2. **Pulumi IaC (TypeScript)** in a dedicated in-repo **`infrastructure/`** folder (replacing the
   Terraform there), **state in Pulumi Cloud**, AWS auth via **GitHub OIDC (already provisioned)**,
   **serverless-first**.

Produce real artifacts: the workflow YAML, the Pulumi program, the new test scaffolding, and a
migration plan — not just prose.

## ⚠️ Use the Pulumi MCP server for every Pulumi decision
A **Pulumi MCP server is connected** — it is the **source of truth** for anything Pulumi-related.
Do NOT write Pulumi resource code from memory. For each resource/provider, use the MCP tools to
confirm the exact type token, input/output schema, and available functions **before** writing it:
- `resource-search` / `list-resources` — find the right resource type for a need.
- `get-type` — fetch the precise schema (inputs/outputs) for a resource type token.
- `get-resource` — look up a specific resource's definition.
- `list-functions` / `get-function` — provider functions / data sources (e.g. lookups used in
  `pulumi preview`).
- `get-stacks` — inspect existing stacks if any are registered.
- `get-policy-violations` — check the program against policy.
- Treat `deploy-to-aws` and the Neo agent tools as available but **do not deploy** without explicit
  human confirmation.
Validate every AWS and Cloudflare resource token + schema through the MCP before finalizing the
program, and note in the output which types you verified.

## Ground truth (verify before changing)
- **App:** Static **Next.js 16.2.2** (App Router), React 19, TypeScript (strict), Tailwind v4,
  shadcn/ui. **npm** (`package-lock.json`). CI on **Node 22**.
- **Build:** `next build` with `output: "export"`, `trailingSlash: true`, `images.unoptimized` →
  static site in **`out/`**.
- **Scripts today:** only `dev`, `build`, `start`, `lint`. **No `typecheck`, no test runner, no
  tests** — you must add them.
- **Repo shape:** NOT an npm workspace. Top-level: `website/` (app), `infrastructure/` (Terraform →
  becomes the Pulumi program), `payload-cms/` (out of scope). Workflows go in repo-root
  `.github/workflows/`.
- **Build-time public env:** `NEXT_PUBLIC_CONTACT_API_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

## Assumed pre-existing — consume, do NOT provision
These already exist and are passed in as **deploy dependencies/inputs**, not created by Pulumi or
the workflow. Fail loudly if any is missing at deploy time.
- **GitHub→AWS OIDC role** — already created. The workflow only *assumes* it via OIDC
  (`AWS_ROLE_ARN` GitHub secret). Do not create the OIDC provider/role in Pulumi.
- **Cloudflare Turnstile** — already created. Its values are inputs, not resources:
  - **Site key** → public, build-time `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
  - **Secret key** → if the contact Lambda verifies the Turnstile token server-side, supply it as a
    Pulumi secret / Lambda env var; do not provision Turnstile itself.

## Methodology (SST-style coupled infra + app)
- **On pull request** (open/synchronize/reopen vs default branch): run app gates
  (`lint` → `typecheck` → `unit` → `integration`) **and `pulumi preview`** to surface the infra
  diff on the PR. No `pulumi up`, no prod change. Gates + clean preview required to merge.
- **On push to default branch** (merge): run the same gates, then **`pulumi up`** and publish the
  static site as one deploy. Production deploy never auto-cancelled mid-run.
- **AWS auth:** all jobs that touch AWS authenticate via **GitHub OIDC** (assume-role-with-web-
  identity → short-lived creds). **Reuse the single existing OIDC role for both `preview` and `up`**
  — same model as our other repos; do not invent a second role. Pure app gates
  (lint/typecheck/unit/e2e/Lambda tests) call no AWS and assume no role.
- Concurrency groups so superseded PR runs cancel but the production deploy does not.
- Doc-only changes (`**.md`, etc.) don't trigger a deploy.

> The old GitLab pipeline was tag-triggered (`vX.Y.Z`): build → test(lint) → deploy(S3 sync +
> CloudFront invalidation) → mirror-to-GitHub. Replace with **PR gates+preview / merge deploy**;
> drop the obsolete `mirror_to_github` job.

## Test tooling to add (none exists yet)
Wire each as a distinct, named CI job in both workflows:
- **`typecheck`** — add `tsc --noEmit` as a `typecheck` script.
- **Unit (Vitest)** — real tests for pure logic in `src/lib/*-data.ts` and `src/lib/utils.ts`.
  Script `test:unit`. No browser, no AWS.
- **Integration — Playwright E2E on the built static site** — build, serve `out/`, drive key
  pages/flows headlessly (nav, sections render, contact form renders/validates). Script `test:e2e`,
  Chromium in CI, fully offline.
- **Integration — contact Lambda + API Gateway** — Rust Lambda (`provided.al2023`, arm64) behind an
  HTTP API (`POST /contact` → Lambda → SES). Add `cargo test` for handler logic + a local-invoke/
  contract test of `{name,email,subject,message}` and the CORS/response contract. Offline (mock SES);
  its own gate.

Pick the lightest setup per item; add the npm/cargo scripts; map CI job names 1:1 to gate names.

## Pulumi IaC (in-repo `infrastructure/`, replacing Terraform)
Re-implement the production infra in **Pulumi TypeScript** in **`infrastructure/`**, serverless-first,
**state in Pulumi Cloud** (retire the `jpeng-portfolio-tfstate` bucket + TF lockfile). One
**`production`** stack. Keep it as the single SST-like entrypoint `pulumi preview`/`up` runs against.
**Confirm every resource type + schema via the Pulumi MCP server (above) as you build.**

Recreate (or `pulumi import` — see migration) what the Terraform provisions:
- **Static hosting:** private **S3** + **CloudFront** with **OAC**, URI-rewrite CloudFront Function
  (extensionless → `index.html`), 403/404 → `/404/index.html`, **ACM** cert (us-east-1, DNS-validated),
  TLSv1.2_2021, SNI-only.
- **Contact API (serverless):** API Gateway v2 HTTP API (`POST /contact`, CORS locked to site origin)
  → Rust Lambda (arm64, 256MB, 10s) → **SES** (domain identity + DKIM). S3 bucket for email templates
  (`auto-reply.html`, `notification.html`). Least-privilege IAM (logs/SES/S3).
- **DNS:** Cloudflare (ACM validation, SES verification TXT + 3 DKIM CNAMEs, root CNAME → CloudFront)
  via the Pulumi Cloudflare provider.
- **Config/secrets:** model TF variables as Pulumi config (`domain_name`, Cloudflare zone id,
  **`cloudflare_api_token` as a Pulumi secret**, sender/contact emails, region). Region pinned
  **us-east-1** (CloudFront ACM requirement).
- **Stack outputs** the deploy job needs: site bucket name, CloudFront distribution id, contact API
  invoke URL (to inject `NEXT_PUBLIC_CONTACT_API_URL` at build time).

**Static asset publishing:** prefer Pulumi managing the `out/` objects + invalidation so a single
`pulumi up` is the whole deploy (fits the SST-style coupling). State the trade-off vs. a separate
`aws s3 sync … --delete` + `cloudfront create-invalidation` workflow step.

**Dependency graph:** let Pulumi infer ordering by passing upstream resource **outputs** into
downstream inputs (don't hardcode names/ARNs) — the references *are* the dependency graph. For
dependencies not expressed through a data reference (e.g. IAM policy → Lambda, ACM validation →
CloudFront), add an explicit `dependsOn` in `ResourceOptions`.

## Migration plan — clean teardown + immediate recreate (must address)
**Strategy: NO `pulumi import`.** We do a clean `terraform destroy` of the existing stack, then
`pulumi up` the new stack immediately after. The goal is to **prepare everything in advance so the
cutover window is as short as possible** — there will be a brief downtime, minimize it.

- **GitHub OIDC already exists** — reuse the existing GitHub→AWS OIDC role; do NOT recreate the old
  GitLab OIDC federation. Confirm its trust policy covers this repo and grants what Pulumi needs.
- **Everything is recreated from scratch.** Build the full Pulumi program ahead of time, validate it
  with `pulumi preview` (a fresh stack previews as all-creates), and have all Pulumi config/secrets
  seeded so `pulumi up` runs unattended. The static `out/` build artifact and email templates should
  be ready so they upload on the first `pulumi up`.
- **Pre-stage the long-pole items to shrink the window:**
  - **Cloudflare DNS** — let the Pulumi Cloudflare provider own the records so ACM-validation, SES
    verification TXT, the 3 DKIM CNAMEs, and the root CNAME → CloudFront are all (re)written
    automatically by `pulumi up`. **Lower record TTLs in Cloudflare *before* the cutover** so the
    new CloudFront/SES values propagate fast.
  - **ACM cert** is recreated → re-validates via DNS. Since Pulumi writes the Cloudflare validation
    records in the same `up`, issuance is automatic but not instant — account for cert issuance +
    **CloudFront distribution propagation (~minutes)** as the slowest steps.
  - **SES domain identity + DKIM** are recreated → new DKIM tokens/records; sending is interrupted
    until DKIM re-verifies. Accept brief contact-form email downtime; minimize via low TTLs above.
- Map every **GitLab CI variable** → **GitHub Actions secret/variable** (`AWS_ROLE_ARN`, region,
  `NEXT_PUBLIC_*`, Cloudflare token as a Pulumi secret). `set-gitlab-vars.ps1` is obsolete.
- **Cutover sequence:** (1) lower Cloudflare TTLs ahead of time; (2) confirm Pulumi program previews
  clean and all config/secrets + the built artifact are ready; (3) `terraform destroy`; (4)
  `pulumi up` immediately; (5) wait for ACM issuance + CloudFront deploy; (6) run the manual test
  plan; (7) retire the Terraform state bucket once verified green. Have a rollback note in case
  `pulumi up` fails mid-cutover.

## Deliverables
1. `.github/workflows/` — PR workflow (gates + `pulumi preview`) and deploy-on-merge workflow
   (gates + `pulumi up` + publish): OIDC auth, Node 22, npm cache, Playwright Chromium, Rust toolchain.
2. Test scaffolding + scripts (`typecheck`, `test:unit`, `test:e2e`, Lambda integration) with a few
   real tests, not just config.
3. Pulumi TypeScript program in `infrastructure/` (Pulumi Cloud backend, `production` stack), with a
   note of which resource types were verified via the Pulumi MCP.
4. **Migration runbook** — the clean teardown + immediate recreate cutover: pre-cutover prep
   (lower TTLs, seed config/secrets, build artifact, clean preview), the `terraform destroy` →
   `pulumi up` sequence, OIDC reuse, secret mapping, expected downtime window, and rollback note.
5. **Manual test plan** to confirm site and contact form post-cutover.

## Constraints
- Conventional Commits for messages and PR titles.
- Fail loudly on missing required config/secret/env — no silent fallbacks.
- Least-privilege IAM. Region pinned `us-east-1`.
- Keep static-export behavior (`out/`, trailing slashes) intact.
- Verify Pulumi specifics via the MCP server, not memory.
- Ask before any destructive cutover step that could take the live site or cert offline.
