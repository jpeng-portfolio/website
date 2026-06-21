# Migration runbook — GitLab CI + Terraform → GitHub Actions + Pulumi

Strategy: **clean teardown + immediate recreate (no `pulumi import`).** Prepare
everything in advance so the cutover window is short; accept a brief downtime.

The slow steps are **ACM issuance** and **CloudFront propagation (~minutes)**,
plus **SES/DKIM re-verification**. Everything below is about shrinking and
de-risking that window.

---

## 0. One-time prerequisites (no downtime)

1. **Reuse the existing GitHub→AWS OIDC role.** It is already provisioned; we do
   **not** recreate it in Pulumi and we do **not** touch the old GitLab OIDC
   federation. Confirm its trust policy covers this repo
   (`jpeng-portfolio/website`, `ref:refs/heads/*` and `pull_request`) and that it
   grants what Pulumi needs (S3, CloudFront, ACM, API Gateway, Lambda, IAM
   role/policy management, SES, CloudWatch Logs). Record its ARN.

2. **GitHub Actions secrets/variables** (Settings → Secrets and variables →
   Actions). `scripts/set-gitlab-vars.ps1` is obsolete and removed.

   | GitLab CI variable (old) | GitHub (new) | Kind | Notes |
   | --- | --- | --- | --- |
   | `ROLE_ARN` | `AWS_ROLE_ARN` | secret | existing OIDC role, reused for preview + up |
   | `AWS_DEFAULT_REGION` | — | n/a | pinned to `us-east-1` in code/Pulumi.yaml |
   | `BUCKET_NAME` | — | n/a | now a Pulumi stack output (`siteBucketName`) |
   | `DISTRIBUTION_ID` | — | n/a | now a Pulumi stack output (`distributionId`) |
   | `NEXT_PUBLIC_CONTACT_API_URL` | — | n/a | now derived from the `contactApiUrl` output at build |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | variable | public site key |
   | (Pulumi) | `PULUMI_ACCESS_TOKEN` | secret | Pulumi Cloud backend auth |
   | `GITHUB_*` mirror vars | — | n/a | `mirror_to_github` job dropped |

3. **Pulumi stack config + secrets** (seed once so `pulumi up` runs unattended):

   ```bash
   pulumi stack select jpaquette2323-gmail-com/jpeng-portfolio-infra/prod
   pulumi config set        jpeng-portfolio-infra:domainName       jpcloudengineering.com
   pulumi config set        jpeng-portfolio-infra:cloudflareZoneId <zone-id>
   pulumi config set        jpeng-portfolio-infra:senderEmail      no-reply@jpcloudengineering.com
   pulumi config set        jpeng-portfolio-infra:contactEmail     <destination-inbox>
   pulumi config set --secret jpeng-portfolio-infra:cloudflareApiToken <token>
   pulumi config set --secret jpeng-portfolio-infra:turnstileSecretKey <key>   # optional
   ```

4. **Dry run on a clean preview.** With the old stack still live (the new stack
   has no resources yet), a preview reports **all-creates**:

   ```bash
   ( cd lambdas/contact && cargo lambda build --release --arm64 --output-format zip )
   pulumi preview -c jpeng-portfolio-infra:publishContent=false
   ```

   Resolve any config/permission gaps here, before the window.

---

## 1. Pre-cutover (hours ahead — no downtime yet)

- **Lower Cloudflare TTLs** on the records that will change so new values
  propagate fast. The program writes records at `dnsTtl` (default **300 s**); set
  it lower for the cutover if desired: `pulumi config set
  jpeng-portfolio-infra:dnsTtl 60`. If any *existing* (Terraform-managed) records
  have long TTLs, lower them in the Cloudflare dashboard now so resolvers expire
  the old values before cutover.
- Confirm the preview is **clean** and all config/secrets are seeded.
- Confirm the **static build** and **email templates** are ready to upload on the
  first `pulumi up` (the deploy workflow builds them; for a manual cutover, run
  `npm run build` with `NEXT_PUBLIC_*` set).

## 2. Cutover (minimize this window)

1. **`terraform destroy`** the existing stack (frees the S3 bucket name, the
   CloudFront distribution, ACM cert, SES identity, and the Cloudflare records TF
   owned). → **site + contact form go down here.**
2. **`pulumi up` immediately:**
   ```bash
   # Phase 1 — infra (creates API; writes ACM-validation + SES/DKIM DNS):
   pulumi up --yes -c jpeng-portfolio-infra:publishContent=false
   URL=$(pulumi stack output contactApiUrl)
   # Build the site against the real API URL:
   ( cd .. && NEXT_PUBLIC_CONTACT_API_URL="$URL" \
       NEXT_PUBLIC_TURNSTILE_SITE_KEY="<site-key>" npm run build )
   # Phase 2 — publish content + invalidate:
   pulumi up --yes -c jpeng-portfolio-infra:publishContent=true
   ```
   (CI does exactly this two-phase sequence on merge; the manual commands are for
   the one-time cutover.)
3. **Wait for the slow steps:** ACM issues automatically once the validation
   CNAME resolves (Pulumi wrote it in phase 1), then the CloudFront distribution
   propagates (~minutes). SES re-verifies the domain + DKIM as those records
   propagate; **contact-form email stays down until DKIM verifies** — minimized
   by the low TTLs from step 1.
4. **Run the [manual test plan](./MANUAL_TEST_PLAN.md).**
5. **Retire the Terraform state** (`jpeng-portfolio-tfstate` bucket + lockfile)
   **only after** the new stack is verified green.

## 3. Steady state (every merge thereafter)

`Deploy` workflow runs on push to the default branch: gates → provision (phase 1,
read `contactApiUrl`) → build → publish (phase 2). The API id is stable across
deploys, so steady-state deploys cause no DNS/cert churn.

---

## Rollback note

If `pulumi up` fails mid-cutover:

- **Before phase 2 / cert issuance:** the fastest recovery is to fix the error
  and re-run `pulumi up` (it's idempotent and converges). DNS, ACM, and SES are
  all Pulumi-managed now, so a re-run rewrites them correctly.
- **If the new stack is unrecoverable in the window:** `terraform apply` the old
  stack from the retained TF state (do **not** delete it until step 2.5) and
  re-point Cloudflare. Because TTLs were lowered, reverting DNS propagates fast.
- **Partial failure:** `pulumi stack export` for a state snapshot before any
  `pulumi destroy`. Never `terraform destroy` the old stack until the new preview
  is clean and secrets are seeded (step 0.4) — that ordering *is* the safety net.
