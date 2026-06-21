---
description: Open a PR for the current branch, then watch its CI gates (lint → typecheck → unit → integration → pulumi preview) via PR-activity events and autofix failures until green.
argument-hint: "[issue-number]  (optional — the issue this PR closes; inferred from branch/commits if omitted)"
allowed-tools: Read, Edit, Write, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git push:*), Bash(git fetch:*), Bash(git pull:*), Bash(git checkout:*), Bash(npm run:*), Bash(gh pr view:*), Bash(gh pr checks:*), Bash(gh pr edit:*), Bash(gh run list:*), Bash(gh run view:*), mcp__github__create_pull_request, mcp__github__update_pull_request, mcp__github__pull_request_read, mcp__github__subscribe_pr_activity, mcp__github__unsubscribe_pr_activity, mcp__github__add_issue_comment
---

You are opening a PR and then babysitting its CI gates until they're green. Invoking this command
IS the user's explicit "open the PR" authorization (the repo's default is human-opened PRs — see `CLAUDE.md`).

> Context: `jpeng-portfolio/website` is a static Next.js 16 site (S3 + CloudFront), CI/CD on
> **GitHub Actions** with **Pulumi** IaC (migrating off GitLab CI + Terraform — see `MIGRATION_PROMPT.md`).
> Default branch is **`master`**. Unlike some repos, this one has **no per-PR preview environment** — a
> PR runs the **gates** (`lint` → `typecheck` → `unit` → `integration`) **plus `pulumi preview`** to
> surface the infra diff; no `pulumi up`, no production change happens until merge. So "green" here means
> *all gate checks + a clean preview*, not a deployed PR stage.

## 1. Pre-flight
- **Abort** if the current branch is `master`/`main`.
- Ensure work is committed and the branch is pushed. Run the gates that exist locally from the repo root —
  at minimum `npm run lint`, plus `npm run typecheck` / `npm run test:unit` / `npm run test:e2e` **once
  those scripts exist** (they're planned in `MIGRATION_PROMPT.md`; only `lint` ships today). Everything
  you run must exit 0 before opening the PR. Fix failures first; never `--no-verify`.
- Discard build-cache noise before committing: `git checkout -- tsconfig.tsbuildinfo` (and any
  `*.tsbuildinfo`) if the build wrote one.
- Resolve the **issue** this closes: `$1` if given, else infer from the branch name / commit messages.
  If none applies, that's fine — just omit the `Closes #N` line.

## 2. Open the PR
- Review the **full** branch diff vs `master` (`git diff master...HEAD`, all commits — not just the last one).
- Open it with `mcp__github__create_pull_request` targeting `master`. If a PR already tracks this
  branch, **update that one** instead of opening a duplicate.
- **Title** must be a valid Conventional Commit (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, …)
  — squash-merge uses it as the commit subject. **Body**: a short Summary + a Test plan checklist +
  `Closes #<issue>` if there is one. If the change touches UI, note the real-browser check you ran (per `CLAUDE.md`).

## 3. Subscribe, then stop
- The push/open triggers the **CI** workflow: the gates (`lint` → `typecheck` → `unit` → `integration`)
  **+ `pulumi preview`**.
- Call `mcp__github__subscribe_pr_activity` for the new PR, then **END YOUR TURN.**
- **Do NOT poll with `sleep`, `gh run watch`, or repeated status checks.** CI / review events arrive as
  `<github-webhook-activity>` messages that wake this session — that is the monitor.

## 4. When an activity event arrives — drive it to green
This is a babysit loop; getting the CI gates + a clean `pulumi preview` green is the task, so don't skip
CI events on this PR.
- **Investigate** the event: open the failing job's logs (`gh run view --log-failed`, the
  statusCheckRollup, the `pulumi preview` step output) and diagnose the real cause.
- **Fix → re-kick** when you're confident and it isn't a large refactor: edit the code, re-run the gates
  locally (`npm run lint`, plus `typecheck`/`test:unit`/`test:e2e` where they exist), commit, and push.
  Each push re-triggers the CI gates. Refresh a short status checklist on the PR each round so the thread
  shows live state — but don't narrate every round; the diff is the record.
- **`pulumi preview` failures are real gate failures, not noise.** A broken or unexpected infra diff blocks
  the merge just like a failing test. Read the diff: if it's a genuine config/program error, fix it; if the
  preview *intends* to change infra as part of this PR, make sure that's expected and called out in the PR body.
- **Concurrency.** Superseded PR runs are auto-cancelled (`cancel-in-progress`) — that's expected and harmless
  here, because PR runs only `preview` (they never `pulumi up`). So you can push a fix without waiting for an
  in-flight PR run to finish; just don't thrash (let a run report before re-pushing where practical).
- **Ask first** (via `AskUserQuestion`) when the fix is ambiguous, architecturally significant, or would
  need a large refactor — don't guess on those.
- **Terminal states:** on **green** (all gates pass + clean preview), reply with the passing status (that's
  the deliverable) and stop. If a failure is genuinely real + out of scope, or several re-kicks make no
  progress, reply with the diagnosis and where you're stuck instead of going quiet. Stop and
  `unsubscribe_pr_activity` the moment the user tells you to.

> Merging + the production deploy are a **separate** step — that's `/merge-and-close` (or
> `/merge-and-close-and-test`), and it requires the user's explicit go. This command stops at green CI.

## Footer
After opening (or updating) the PR, end that turn's summary with these labelled links, in order:
- PR #<n> — `https://github.com/jpeng-portfolio/website/pull/<n>`
- Issue #<n> — `https://github.com/jpeng-portfolio/website/issues/<n>` (omit if no issue)
- branch — `https://github.com/jpeng-portfolio/website/tree/<branch>`
