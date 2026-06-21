---
description: Merge the current branch's PR into master, delete the branch, close the linked issue (and mark it Done on the project board if one is configured), watch the resulting production deploy (gates → pulumi up → publish static site) and fix failures if necessary, then stop.
argument-hint: "[pr-or-issue-number]  (optional — defaults to the open PR for the current branch)"
allowed-tools: Bash(git branch:*), Bash(git checkout:*), Bash(git switch:*), Bash(git pull:*), Bash(git fetch:*), Bash(gh api:*), Bash(gh pr view:*), Bash(gh pr checks:*), Bash(gh pr edit:*), Bash(gh project item-list:*), Bash(gh project item-edit:*), Bash(gh issue view:*), Bash(gh issue close:*), Bash(npm run:*), mcp__github__pull_request_read, mcp__github__merge_pull_request, mcp__github__update_pull_request, mcp__github__issue_read, mcp__github__issue_write, mcp__github__actions_list, mcp__github__get_job_logs
---

You are wrapping up a finished piece of work: merge the PR, delete the branch, close the
issue, and stop. This command is the user's explicit authorization to merge and delete — so
run the whole flow, but **stop immediately** (with a one-line reason) if any **Abort**
condition below trips. Do not start new work after finishing.

> Context: `jpeng-portfolio/website` is a static Next.js 16 site exported to `out/` and served
> from **S3 + CloudFront**. CI/CD is **GitHub Actions** with **Pulumi** IaC (migrating off
> GitLab CI + Terraform — see `MIGRATION_PROMPT.md`). The default branch is **`master`**. A
> merge to `master` runs the gates (`lint` → `typecheck` → `unit` → `integration`) and then
> **`pulumi up` + publishes the static site** as the single `production` deploy.

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
  (no conflicts), **not a draft**, and its **required checks are green** (statusCheckRollup / `gh pr checks`).
  The PR gate runs the app gates plus **`pulumi preview`** — the preview must be clean too, not just the tests.
- **Abort** with a one-line reason if checks are red, the PR is conflicted, or it's still a draft.
  Don't merge a red, conflicted, or draft PR.
- The repo **squash-merges**, so the **PR title becomes the commit subject** and must be a valid
  Conventional Commit (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, …). If the title isn't,
  fix it first (`gh pr edit --title` / `mcp__github__update_pull_request`) before merging.

## 2. Merge into master
- Squash-merge into `master` with `mcp__github__merge_pull_request` (`merge_method: "squash"`).
- Pass an explicit clean `commit_message` body (e.g. just `Closes #<issue>`) so the squash commit
  message stays tidy — GitHub builds the squash body by concatenating the branch's individual commit
  messages, and a clean body keeps the release/changelog history readable.
- Confirm it reports merged before continuing.

## 3. Delete the branch
- `git checkout master && git pull origin master` first — you can't delete the branch you're on.
- Delete the **remote** branch via the **GitHub API**, not `git push --delete`:
  `gh api --method DELETE repos/jpeng-portfolio/website/git/refs/heads/<branch>`
  (the ref path keeps any slashes in the branch name, e.g. `heads/claude/my-branch`).
  If the squash-merge already deleted the branch, this returns 404/422 — treat that as
  "already gone", not a failure.
- Then delete the local branch (`git branch -d <branch>`).

## 4. Update task status
For the resolved issue number (skip this whole step if there is no tracking issue):
- **Close the issue** (`gh issue close <n>` or `mcp__github__issue_write` state: closed).
- **Project board (only if one is configured).** This repo's `CLAUDE.md` does **not** pin a GitHub
  Project board or its field/option IDs. If the repo has a project board, resolve the project, the
  Status field, and the "Done" option IDs **at runtime** (`gh project list --owner jpeng-portfolio`,
  then `gh project item-list … --format json` to find the item id) and set Status → Done with
  `gh project item-edit`. If there is no board, **closing the issue is the done-state** — don't invent
  IDs. (There is no cycle-time `stamp` script in this repo; nothing to stamp.)
- If the issue is a **phase of an epic**, tick its checkbox in the epic issue body.

## 5. Watch the production deploy — don't walk away from a broken master
The squash-merge pushed to `master`, which triggers the **Deploy** workflow (the GitHub Actions
deploy-on-merge workflow under `.github/workflows/`, per `MIGRATION_PROMPT.md`) → it runs the gates,
then **`pulumi up`** and **publishes the static site** to S3 + invalidates CloudFront. A merge that
red-deploys production is **not** "done", so watch this run to a terminal state before you stop.

- **Find the run.** It's the deploy run for the **merge commit** on `master`. Resolve the merge SHA
  (`gh api repos/jpeng-portfolio/website/commits/master --jq .sha`), then list recent master push
  runs with `mcp__github__actions_list` (`method: list_workflow_runs`, the deploy workflow,
  filter `branch: master`, `event: push`) and pick the run whose `head_sha` matches. (If the GitHub
  Actions migration hasn't landed yet, there may be no deploy run — say so and stop here.)
- **Wait for it.** A `pulumi up` + S3 sync + CloudFront invalidation takes several minutes. Re-check the
  run's status periodically (every minute or two) — do **not** spin in a tight `sleep` loop. (`gh run watch`
  may not resolve the repo's remote in this environment; the MCP `actions_list` / `get_job_logs` tools and
  `gh api` with an explicit repo path always work.)
- **If it fails:** open the failing job's logs (`mcp__github__get_job_logs`, `failed_only: true`,
  `return_content: true`) and diagnose. Then:
  - **Flaky / infra** failure (transient AWS/network, a Pulumi Cloud hiccup) → re-run the run and re-watch.
  - **Real regression from this change** (a failing gate, or a bad `pulumi up` / `pulumi preview` diff) →
    fix it on a **new** branch + PR (never push to `master` directly), and tell the user.
  - **A `pulumi up` that errored mid-apply** is the dangerous case — infra state may be partially applied.
    Do **not** blindly re-run; read the error, check `pulumi` state if needed, and **stop and report**
    rather than risk a half-migrated production stack.
  - If the fix is ambiguous or large, **stop and report the diagnosis** instead of guessing.
- **If it's green:** note that `production` deployed successfully (site published, CloudFront invalidated).

## 6. Finish — then stop
Print a short summary and stop (end the turn; don't pick up new work):
- PR merged — link `https://github.com/jpeng-portfolio/website/pull/<pr#>`
- Branch `<branch>` deleted (local + remote)
- Issue #<n> closed · project Status = Done (if a board is configured)
- Production deploy: green ✅ (or: the failure diagnosis + what you did / what's blocked)

In headless `claude -p` mode the process exits here. In an interactive session the conversation
just goes idle — close it with `/exit` (or the tab) when you're ready.
