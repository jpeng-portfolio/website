---
name: brainstorm
description: Turn a rough idea into a validated design and decomposed GitHub milestone(s) before writing any code. Use at the start of any non-trivial feature OR a brand-new site/app on this stack. It runs in two modes — a single capability → one milestone (epic Mx → phases Mx.x → parallel subtasks Mx.x.x), or a whole-app idea → a planned program of multiple milestones with a roadmap. Assumes a fixed static-Next.js / Pulumi / S3+CloudFront / GitHub Actions stack, so it never re-litigates the stack.
---

# Brainstorming — idea → design → decomposed milestone(s)

> Turn a half-formed idea into a validated plan plus the GitHub structure to execute it. This is a thinking-and-scoping skill — it ends **before** implementation, not during it.

<HARD-GATE>
Do NOT write implementation code, scaffold, run a build, change infra, or dispatch an implementation subagent until **both**: the plan is approved by the user, AND the milestone(s) are created on GitHub. The terminal state of this skill is "the work is on the board, ready to pick up" — not "feature built."
</HARD-GATE>

## Two modes — pick one first

**Step 0: classify the request before anything else.**

- **Mode A — Single milestone.** One feature, section, or change to *this existing* site (a new page section, a refactor, a contact-form/infra change). → one milestone (epic `Mx` → phases `Mx.x` → subtasks `Mx.x.x`). This is the common case.
- **Mode B — Whole site/app (greenfield).** A brand-new product on this stack — "build me a site/app that does X" spanning many independent capability areas. → a planned **program**: a milestone *set* (`M0…Mn`) + a roadmap, where each milestone follows the Mode A shape.

If it's ambiguous (e.g. "add a big feature area" that might be one milestone or several), say which you think it is and confirm before proceeding. When in doubt for this existing site, prefer Mode A and split later.

## Fixed stack — assume it, never brainstorm it (both modes)

These are decided for every project on this stack. **Do not ask about them, do not propose alternatives for them:**

- **Static Next.js 16 (App Router)**, `output: "export"` → `out/`, `trailingSlash: true`, `images.unoptimized`. React 19, **TypeScript (strict)**, **Tailwind v4 (CSS variables)**, **shadcn/ui** with custom composition; `@unlumen-ui` + `motion/react` for animation. **npm**; CI on **Node 22**.
- **Hosting:** private **S3** + **CloudFront** (OAC), URL-rewrite CloudFront Function (extensionless → `index.html`), 403/404 → `/404`, **ACM** cert in us-east-1.
- **IaC:** **Pulumi (TypeScript)** in `infrastructure/`, state in **Pulumi Cloud**, one `production` stack, AWS auth via **GitHub OIDC**. **DNS via Cloudflare.** (Migrating off Terraform — see `MIGRATION_PROMPT.md`.)
- **CI/CD:** **GitHub Actions** — PR runs gates (`lint` → `typecheck` → `unit` → `integration`) + `pulumi preview`; merge to `master` runs the gates then `pulumi up` + publishes the static site.
- **Contact backend (the only server-side piece):** contact form POSTs to `NEXT_PUBLIC_CONTACT_API_URL` → **API Gateway (HTTP API)** → **Rust Lambda** (arm64) → **SES**. Spam protection via **Cloudflare Turnstile**.
- **No database, no auth.** This is a public, static, single-page portfolio — there is **no DynamoDB, no Cognito, no user accounts, no server-rendered runtime**. Persistence is (a) **static content data in `src/lib/*-data.ts`** baked into the export at build time, and (b) the **stateless** contact POST. If a request seems to need a DB or login, that's a real design fork — surface it explicitly rather than assuming one.

So **never** ask "which framework / host / CI / IaC tool / styling system?" — those answers are above. Spend questions on *product behavior, content/data shape, component breakdown, and how the work decomposes*. (Mode B may still lock *product-level* decisions on top of the stack — specific AWS services, the domain, third-party deps — see B2.)

## Scale to size first (Mode A)

Judge the request's size before running the full flow:

- **XS / S** (a copy tweak, one component, a palette/config change, tuning a `src/lib/*-data.ts` dataset, a single bug): this skill is overkill. Produce a 2–4 sentence design inline, get a quick thumbs-up, optionally draft a single issue. **Skip the milestone machinery** and say so.
- **M** — a short design doc + a single phase or a small milestone.
- **L / XL** — the full Mode A flow below.

---

# Mode A — single milestone

Create a task per step and do them in order.

### A1. Explore context
Read the repo before asking anything: `CLAUDE.md`, `README.md`, `MIGRATION_PROMPT.md`, the section components in `src/components/sections/`, the content datasets in `src/lib/*-data.ts`, site config in `src/config/site.ts`, and (if infra is in scope) the Pulumi program in `infrastructure/`. If `docs/milestones/` exists, read its spec format + the latest `Mx` number; if not, you'll establish it. Ask *informed* questions; reuse existing patterns and the theme palette.

### A2. Clarify intent — one question at a time
- **One question per message.** Multiple-choice preferred; open-ended when needed. Stop asking once you can state the design without guessing.
- **Question bank** (pull only what's relevant):
  - **Problem & success** — what problem, for whom, what does "done well" look like?
  - **Behavior & UX** — happy path, key states (empty / loading / error), responsive/mobile behavior, motion, edge cases that change the shape of the work. Respect the **theme palette** and **Inter / JetBrains Mono** typography; skills bars stay segmented, 0–100.
  - **Content & data shape** — what content/data does this read or render? Is it new/changed data in `src/lib/*-data.ts` (and its TypeScript types), or new config in `src/config/site.ts`? Keep display data out of components.
  - **Boundaries** — which sections / components / `src/lib` modules / `src/config` are touched? New vs reused? What stays out (YAGNI — cut it now)?
  - **Server-side / infra (only when the feature actually needs it)** — does it touch the **contact Lambda**, **API Gateway**, **SES**, or **Pulumi** infra in `infrastructure/`? New env/config must **fail loudly when unset** (no silent fallbacks). Note any `pulumi preview`-visible change.
  - **Cross-cutting, only when the feature raises it** — the **privacy rule** (never render phone / street address / direct email in page content); contact-form **abuse/spam** (Turnstile, rate limits) and **SES** sending; **static-export integrity** (keep `out/` + trailing-slash behavior intact); secrets handling.

### A3. Propose the design
- Present in sections scaled to complexity; thumbs-up per section.
- **Offer 2–3 alternatives only where a genuine fork exists** (e.g. build-vs-reuse a component, static-data shape, client-only vs needs-a-Lambda-change, sync vs async UX). Lead with your recommendation. Don't manufacture alternatives for what the fixed stack already decides.
- Cover the non-obvious: new/changed `src/lib` data + its types, `src/config/site.ts` changes, the component breakdown under `src/components/sections|shared|...`, any `infrastructure/` (Pulumi) change, and where tests land — **pure logic (parsers/transforms/data shaping) → Vitest unit tests; a contact-Lambda/infra change → its integration test + a clean `pulumi preview`; any UI change → a real browser check** (render the page, observe the flow — don't rely on typecheck/lint alone).
- Keep units small and independently testable — this makes the subtask decomposition fall out naturally.

### A4. Decompose into milestone structure
Translate the approved design into **epic → phases → subtasks**:

- **Epic (`Mx`)** — the whole capability. One milestone.
- **Phases (`Mx.x`)** — **sequential dependency waves.** Phase N+1 may depend on phase N; done in order. Each is a unit a single session can pick up. Give each a clear **Definition of Done**.
- **Subtasks (`Mx.x.x`)** — the work inside a phase, written so **subagents run them in parallel**:
  - Independent — no subtask waits on a sibling.
  - **Disjoint files/modules** where possible (e.g. one section component per subtask, data in `src/lib` separate from the component that renders it), to avoid merge collisions between parallel agents.
  - If two pieces *must* be ordered (e.g. add the data type before the component that consumes it), that ordering is a **phase boundary**, not two subtasks in one phase.
  - Size each subtask (XS–XL).
- Sanity check: "Could I hand each subtask in this phase to a different agent simultaneously without collisions?" If no, re-cut the phase.

### A5. Write + commit the design doc
Write the spec to `docs/milestones/<Mx>-<slug>.md` (follow the project's own convention if it has one; otherwise establish this section order):

> Title + `> Size: <S> · Depends on: <Mx, …>` → **Goal** → **In scope** → **Out of scope** → **Architecture & decisions** (data/types in `src/lib`, `src/config` changes, component breakdown, any Pulumi/`infrastructure/` change) → **Phases & tasks** (`Mx.x` with its `Mx.x.x` subtasks + sizes) → **DoD (per phase)** → **Risks / open questions** → **Status / Next steps / Gotchas**.

Then **self-review** and fix inline: placeholder scan (no TBD/TODO), internal consistency (architecture matches phases), scope (one coherent milestone), ambiguity (any requirement readable two ways — pick one), and a check that the **privacy rule** and **static-export integrity** aren't violated. Commit on a feature branch (never `master`; name it for what it delivers — `feat-…`, `fix-…`, or `issue-<N>-<slug>`, kebab-case).

### A6. User reviews the spec
> "Spec written and committed to `<path>`. Review it and tell me if you want changes before I open the milestone + issues."

Wait. If they request changes, fix and re-run the self-review.

### A7. Create the GitHub milestone + issues
The spec doc is the source of truth; GitHub mirrors it.

- **Milestone object** — `Mx · <title>`, one-line description.
- **Epic issue** — `Mx · <title> — EPIC`. Body = the full spec mirrored from the doc, with a `## Phases` list linking each phase issue.
- **Phase issues** — one per `Mx.x`. Body = `## Tasks (run in parallel)` (the `Mx.x.x` subtasks + sizes), `## Exit criteria` (phase DoD), any `## Key constraint`. Link back to the epic + spec doc.
- **Board + fields (only if a project board exists).** This repo's `CLAUDE.md` does **not** pin a GitHub Project board or its field/option IDs. If a board exists, resolve project/Status-field/Size IDs **at runtime** via the GitHub GraphQL API (or `gh project list --owner jpeng-portfolio`) and add every issue, setting **Status** (`Ready` for the first phase, `Backlog` for later) and **Size**. If there is **no** board, the milestone + issues are the tracking surface — don't invent IDs. (There is no cycle-time `stamp` script in this repo.)

### A8. Stop — hand off, don't build
Report the milestone, epic, phase issues, and spec path. Then **stop.** Do not implement, do not open a PR — both require the user's explicit go (per `CLAUDE.md`). Next step: pick up phase **`Mx.1`** and dispatch its subtasks to parallel subagents.

---

# Mode B — whole site/app (greenfield)

Plan an entire product as a **program of milestones**. Mode B does the program-level thinking, then **reuses Mode A** to flesh out individual milestones. Do the steps in order.

### B1. Establish context
Greenfield repos are often near-empty. Confirm the fixed stack applies, note anything already scaffolded, and pick the milestone-numbering origin (`M0` for a true greenfield bootstrap).

### B2. Clarify at the program level — one question at a time
Same discipline (one question, multiple-choice preferred). Aim to nail down:
- **Product vision & audience** — what is this, for whom, the one-line value prop.
- **Core journeys / surfaces** — the few end-to-end flows or pages the product must support (for a marketing/portfolio site: the page sections, any interactive widgets, the contact path). These seed the capability areas.
- **Capability areas → candidate milestones** — the major surfaces (e.g. design system, content sections, contact backend, infra, CI/CD, SEO/analytics). Each becomes a milestone.
- **MVP / launch cut vs later** — what's needed to launch vs post-launch. Push speculative areas to a "later/maybe" list (YAGNI at the milestone level).
- **Locked product decisions on top of the stack** — specific AWS services (SES, anything beyond the contact Lambda), the **domain**, key third-party deps, analytics, the spam/abuse posture (Turnstile), and the **privacy rule**. These become the README's **"Locked stack & decisions."**
- Still **never** re-brainstorm the base stack itself (static Next.js / Pulumi / S3+CloudFront / GitHub Actions / Cloudflare).

### B3. Derive the milestone set
- **Start from the recurring foundation.** On this stack, almost every new site begins with the same foundation milestones — recommend them as defaults so the user doesn't reinvent them:
  - **M0 — Repo & tooling bootstrap** (Next.js App Router static export, TS strict, Tailwind v4 + shadcn baseline, lint/`typecheck`/Vitest/Playwright scaffolding, GitHub Actions skeleton). Usually **XL**, depends on nothing.
  - **M1 — Design system** (theme palette, Inter / JetBrains Mono, shared display primitives, layout shells). Gates every UI surface.
  - **M2 — Infra bootstrap (Pulumi)** (S3 + CloudFront + OAC + URL-rewrite function, ACM, Cloudflare DNS, GitHub OIDC, `production` stack). Gates any deploy.
  - **M3 — CI/CD** (GitHub Actions: PR gates + `pulumi preview`; merge → `pulumi up` + publish).
  - A **contact-backend** milestone if the site needs the API Gateway → Rust Lambda → SES + Turnstile path.
  - A late **Hardening & launch** milestone (a11y, SEO/metadata, IAM least-privilege audit, perf/Lighthouse, cost, prod cutover) that depends on everything.
- **Then the product-specific milestones** derived from the capability areas in B2 (the content sections, interactive widgets, etc.). Size each (XS–XL); an XL milestone should be flagged for likely decomposition.
- **Define the program-wide architecture** — the **content/data model** (the `src/lib/*-data.ts` datasets + their TypeScript types, `src/config/site.ts`), the component hierarchy (`sections` / `layout` / `shared`), the contact request/response contract (`{name,email,subject,message}`), and the infra topology (S3 + CloudFront + ACM + Cloudflare + the contact API). This keeps milestones consistent and becomes the README **"Architecture summary."**
- **Sequence into dependency waves.** Build the milestone dependency **DAG**; milestones with no path between them share a **Wave** and can be dispatched to separate agents in parallel. Identify the **critical path** (longest dependent chain).

### B4. Present the program plan — section by section, approval each
Walk the user through: vision → locked decisions → the **milestone list** (a table: `#`, milestone, size, depends-on) → the **dependency graph + waves** → the **architecture summary**. Apply YAGNI: cut speculative milestones to a "later/maybe" appendix rather than scheduling them. Revise on feedback before writing anything.

### B5. Write the program docs
Write three things and commit on a feature branch:
- **`docs/milestones/README.md`** — program overview: product summary, **Locked stack & decisions**, the **Milestones table** (with size + depends-on), the **Architecture summary** (content/data model + infra topology), and the **Tracking model** (epic-issue-per-milestone + board if one exists).
- **`docs/milestones/ROADMAP.md`** — delivery plan: the **dependency graph** (mermaid), the **Wave-by-wave dispatch plan** (which milestones run in parallel and why they're safe together), the **critical path**, and a per-milestone detail table (size, wave, depends-on, parallel-with).
- **One `docs/milestones/Mx.md` per milestone** — at minimum **Goal / In scope / Out of scope / Architecture & decisions / Depends-on** + a `> Size: …` header. Full phase+subtask decomposition is **deferred** to B8 (don't write detailed phase plans for far-future milestones — their shape will shift as earlier ones land).

Then **self-review the set**: dependencies form a DAG (no cycles, no orphan milestone), every milestone has a Size, the architecture summary is consistent with each milestone's data needs, scope is the MVP not the moon. Fix inline.

### B6. User reviews the program
> "Program plan written and committed: `README.md`, `ROADMAP.md`, and `Mx.md` for each milestone. Review it and tell me what to change before I create the milestones + epics on GitHub."

Wait for approval; revise and re-review on feedback.

### B7. Create the GitHub structure
For **each** milestone in the set:
- A **milestone object** (`Mx · <title>`, one-line, optional due date from the roadmap).
- An **epic issue** (`Mx · <title> — EPIC`) whose body mirrors that milestone's `Mx.md`, with a `## Phases` placeholder if not yet decomposed.
- If a project board exists, add each epic and set **Size** and **Status** (`Ready` for the first wave, `Backlog` for the rest), plus any roadmap fields (Wave / Start / Target). Resolve board/field IDs at runtime via GraphQL (this repo's `CLAUDE.md` doesn't pin them); if there's no board, the milestones + epics are the tracking surface.

### B8. Deep-decompose the starting wave (reuse Mode A)
Don't decompose all milestones up front. For the **first wave only** (typically `M0`, then `M1`/`M2`), run **Mode A steps A4 + A7** to break each into phases (`Mx.x`) + parallel subtasks (`Mx.x.x`) and create its phase issues. Recommend leaving later milestones at epic-outline level and decomposing each via **Mode A** when it's about to start — so you plan in detail only what you're about to build, never planning fiction.

### B9. Stop — hand off
Report: the program docs (`README.md`, `ROADMAP.md`), every milestone + epic created, which are fully decomposed vs outline-only, the wave plan, and the recommended starting point (usually **M0**). Then **stop** — no implementing, no PR, until the user gives the go.

---

## Key principles (both modes)
- **One question at a time; multiple-choice preferred.**
- **The stack is fixed — never brainstorm it.** Spend questions on behavior, content/data shape, and decomposition.
- **YAGNI ruthlessly** — cut speculative scope to Out-of-scope (Mode A) or a "later/maybe" list (Mode B) before it becomes a phase or a milestone.
- **Alternatives only where a real fork exists** — not for infra the stack already decides.
- **Subtasks in a phase must be parallel-safe** — independent, disjoint files; ordering becomes a phase boundary. The same logic scales up: **milestones in a wave must be parallel-safe.**
- **No DB / no auth by default** — this is a static, public site; if a request seems to need persistence or login, surface that as a real design fork, don't quietly assume it.
- **Respect the project guardrails** — the privacy rule (no personal contact details in page content), static-export/trailing-slash integrity, fail-loud config, segmented 0–100 skills bars, the theme palette + typography.
- **Foundation milestones recur** — on this stack every greenfield site starts with bootstrap → design system → infra → CI/CD; offer them as defaults.
- **Plan in detail only what you're about to build** — decompose the current milestone/wave fully; leave far-future milestones at outline level.
- **Scale to size** — don't spin up a milestone for an S-sized change, or a whole program for a single feature.
- **Terminal state is a ready board, not built code.**
