---
description: Like /merge-and-close, but after the production deploy goes green it also runs a real-browser smoke test against the LIVE production site (jpcloudengineering.com) — the migration manual test plan: pages/sections render, contact form renders + client-validates. Merges the PR, deletes the branch, closes the issue, watches the production deploy, verifies live production, fixes failures if necessary, then stops.
argument-hint: "[pr-or-issue-number]  (optional — defaults to the open PR for the current branch)"
allowed-tools: Bash(git branch:*), Bash(git checkout:*), Bash(git switch:*), Bash(git pull:*), Bash(git fetch:*), Bash(gh api:*), Bash(gh pr view:*), Bash(gh pr checks:*), Bash(gh pr edit:*), Bash(gh project item-list:*), Bash(gh project item-edit:*), Bash(gh issue view:*), Bash(gh issue close:*), Bash(npm run:*), Bash(npx playwright:*), mcp__github__pull_request_read, mcp__github__merge_pull_request, mcp__github__update_pull_request, mcp__github__issue_read, mcp__github__issue_write, mcp__github__actions_list, mcp__github__get_job_logs
---

You are wrapping up a finished piece of work **and** opting into an extra verification pass:
merge the PR, delete the branch, close the issue, watch the production deploy, **and then run a
real-browser smoke test against the live production site** before you stop. This command is the
user's explicit authorization to merge and delete — so run the whole flow, but **stop immediately**
(with a one-line reason) if any **Abort** condition trips. Do not start new work after finishing.

This is identical to `/merge-and-close` except for the **added step 6** (live production smoke test).
The offline gates (`lint` → `typecheck` → `unit` → `integration`, incl. the Playwright `test:e2e`
suite that drives the built `out/` static site) already run on every PR and on the merge deploy. This
"and-test" variant adds the one thing those offline gates can't cover: **driving the actual deployed
production site** at `https://jpcloudengineering.com` to confirm S3 + CloudFront served the new build
correctly (extensionless URL rewrite, 404 handling, the contact form wired to
`NEXT_PUBLIC_CONTACT_API_URL`). Use it when a change is risky enough to warrant eyes on real production.

> Note: this repo has **no** opt-in CI commit-tag mechanism (no `[E2E]` tag, no authed suite) — the
> extra verification here is a post-deploy smoke test **you** run against live production, not a
> different CI gate. So nothing about the merge commit changes vs `/merge-and-close`.

## 0. Resolve the target
- `$1` may be a PR number **or** an issue number; if empty, use the open PR for the **current branch**.
- Establish three things:
  - **Branch** — `git branch --show-current`.
  - **PR** — the open PR for that branch (or the PR number in `$1`).
  - **Issue** — the issue this resolves: parse `Closes #N` / `Resolves #N` / `Fixes #N` from the
    PR body; else use the issue number in `$1`; if still unknown, **ask the user which issue** — never guess.
    (If the work genuinely has no tracking issue, that's fine — skip the issue steps.)
- **Abort** if the current branch is `master` (or `main`), or if no open PR exists for the branch.

## 1. Verify it's safe to merge
- Read the PR (`mcp__github__pull_request_read` or `gh pr view`): confirm it is **mergeable**
  (no conflicts), **not a draft**, and its **required checks are green** (statusCheckRollup / `gh pr checks`),
  including a clean **`pulumi preview`**.
- **Abort** with a one-line reason if checks are red, the PR is conflicted, or it's still a draft.
- The repo **squash-merges**, so the **PR title becomes the commit subject** and must be a valid
  Conventional Commit (`feat:`, `fix:`, `chore:`, …). If the title isn't, fix it first
  (`gh pr edit --title` / `mcp__github__update_pull_request`) before merging.

## 2. Merge into master
- Squash-merge into `master` with `mcp__github__merge_pull_request` (`merge_method: "squash"`), with a
  clean `commit_message` body (e.g. just `Closes #<issue>`).
- Confirm it reports merged before continuing.

## 3. Delete the branch
- `git checkout master && git pull origin master` first — you can't delete the branch you're on.
- Delete the **remote** branch via the **GitHub API**, not `git push --delete`:
  `gh api --method DELETE repos/jpeng-portfolio/website/git/refs/heads/<branch>`
  (the ref path keeps any slashes, e.g. `heads/claude/my-branch`). A 404/422 means the squash-merge
  already deleted it — treat that as "already gone", not a failure.
- Then delete the local branch (`git branch -d <branch>`).

## 4. Update task status
For the resolved issue number (skip if there is no tracking issue):
- **Close the issue** (`gh issue close <n>` or `mcp__github__issue_write` state: closed).
- **Project board (only if one is configured).** This repo's `CLAUDE.md` does not pin a board or its
  field/option IDs. If a board exists, resolve project/Status-field/"Done"-option IDs at runtime
  (`gh project list --owner jpeng-portfolio` → `gh project item-list … --format json`) and set
  Status → Done via `gh project item-edit`. No board → closing the issue is the done-state; don't
  invent IDs. (No cycle-time `stamp` script exists in this repo.)
- If the issue is a **phase of an epic**, tick its checkbox in the epic issue body.

## 5. Watch the production deploy
The squash-merge pushed to `master`, triggering the **Deploy** workflow (GitHub Actions deploy-on-merge,
per `MIGRATION_PROMPT.md`): gates → **`pulumi up`** → publish the static site to S3 + invalidate CloudFront.
Watch it to a terminal state before the smoke test — there's no point testing production until the new
build is actually live.

- **Find the run.** Resolve the merge SHA (`gh api repos/jpeng-portfolio/website/commits/master --jq .sha`),
  list recent master push runs for the deploy workflow with `mcp__github__actions_list`
  (`method: list_workflow_runs`, `branch: master`, `event: push`), and pick the run whose `head_sha` matches.
- **Wait for it.** `pulumi up` + S3 sync + CloudFront invalidation takes several minutes; re-check every
  minute or two — no tight `sleep` loop.
- **If it fails:** open the failing job's logs (`mcp__github__get_job_logs`, `failed_only: true`,
  `return_content: true`) and diagnose:
  - **Flaky / infra** → re-run and re-watch.
  - **Real regression** (failing gate / bad pulumi diff) → fix on a **new** branch + PR (never push
    `master`), tell the user, and **skip the smoke test** (production didn't change).
  - **`pulumi up` errored mid-apply** → state may be partial; do **not** blindly re-run — read the
    error, **stop and report**.
  - Ambiguous or large fix → stop and report the diagnosis.
- **If it's green:** the new build is live — proceed to the smoke test.

## 6. Smoke-test live production — the reason you ran *this* command
With production green, drive the **live** site and confirm it actually serves the new build. CloudFront
invalidation can lag, so allow a minute or two and retry once if you hit a stale response.
- Resolve the production URL from `src/config/site.ts` (`siteConfig.domain` → `https://jpcloudengineering.com`).
- Run the project's real-browser check against that URL (Playwright/headless Chromium — the same harness
  as `test:e2e`, but pointed at production instead of `out/`). Verify the **manual test plan** from
  `MIGRATION_PROMPT.md`:
  - The home page loads over HTTPS and the nav + key sections render (About, Skills, Experience,
    Projects, Certifications, Contact — per `siteConfig.navItems`).
  - Extensionless routing works (a deep link resolves to its `index.html`); a bogus path serves the
    `/404` page.
  - The **contact form renders and client-validates** (required fields / email format / Turnstile widget
    present). Do **not** submit a real message to SES as part of the smoke test unless the user asks.
  - Spot-check that anything the merged change touched is visibly correct on production.
- **If the smoke test fails:** distinguish *stale cache* (retry after invalidation settles) from a *real
  production defect*. For a real defect, fix it on a **new** branch + PR (never push `master`) and tell
  the user; if it's serious/live-breaking, say so plainly and recommend a rollback path. Don't force-push master.
- **If it passes:** note that live production was verified.

## 7. Finish — then stop
Print a short summary and stop (end the turn; don't pick up new work):
- PR merged — link `https://github.com/jpeng-portfolio/website/pull/<pr#>`
- Branch `<branch>` deleted (local + remote)
- Issue #<n> closed · project Status = Done (if a board is configured)
- Production deploy: green ✅
- Live production smoke test: green ✅ (or: the failure diagnosis + what you did / what's blocked)

In headless `claude -p` mode the process exits here. In an interactive session, close it with `/exit`
(or the tab) when you're ready.
