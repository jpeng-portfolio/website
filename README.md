# JP Cloud Engineering Portfolio
Static Next.js portfolio website for cloud and infrastructure engineering work, designed for deployment on AWS S3 + CloudFront.

## Architecture
- **Framework:** Next.js (App Router)
- **Rendering mode:** static export (`output: "export"`)
- **UI system:** shadcn components + custom section components
- **Animation layer:** @unlumen-ui + motion/react
- **Styling:** Tailwind CSS v4 with CSS variables
- **Typography:** Inter + JetBrains Mono

### App structure
- `src/app/` — root layout, composed single-page entry, global styles
- `src/components/layout/` — navbar and footer
- `src/components/sections/` — page section modules
- `src/components/skills/` — segmented skill bar system
- `src/components/shared/` — reusable display primitives
- `src/config/site.ts` — domain, navigation, social config
- `src/lib/*-data.ts` — content datasets (skills, projects, experience)

## Visual system
- Background: `#F5F0E8`
- Primary contrast: `#0F172A`
- Accent colors: `#60a5fa`, `#c084fc`, `#2DD4BF`, `#f87171`
- Skills visualization uses segmented bars mapped to 0-100%.

## Privacy rule in UI
The page intentionally avoids rendering direct personal contact information (phone number, address, or direct email text).

## Local development
```bash
npm install
npm run dev
```

## Build and static export
```bash
npm run build
```
Output is generated in `out/`.

## AWS deployment notes (S3 + CloudFront)
1. Keep the S3 bucket private.
2. Serve site through CloudFront with Origin Access Control (OAC).
3. Upload `out/` contents to S3.
4. Invalidate CloudFront cache after deployment.
5. Point `jpcloudengineering.com` DNS to CloudFront (Route 53 alias recommended).

## Contact form and SES integration
The contact section sends POST requests to:
- `NEXT_PUBLIC_CONTACT_API_URL`

Recommended backend path:
- API Gateway endpoint → Lambda function → Amazon SES

Payload shape:
```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string"
}
```

## Environment variables
Build-time public env (must be set; the app fails loudly when required values are missing):
- `NEXT_PUBLIC_CONTACT_API_URL` — public API endpoint for contact-form submission. On deploy this is taken from the Pulumi `contactApiUrl` stack output.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — public Cloudflare Turnstile site key.

## CI/CD (GitHub Actions + Pulumi)
CI/CD runs on **GitHub Actions** with PR gates and deploy-on-merge. Infrastructure is **Pulumi (TypeScript)** in [`infrastructure/`](./infrastructure) (state in Pulumi Cloud, AWS auth via GitHub OIDC). This replaces the previous GitLab CI + Terraform setup.

- **`.github/workflows/pr.yml`** — every PR runs the gates (`lint` → `typecheck` → `test:unit` → e2e + Lambda integration) **and `pulumi preview`** (infra-only diff posted to the PR). No production change.
- **`.github/workflows/deploy.yml`** — push to the default branch runs the same gates, then `pulumi up` (provision) → build the site against the live contact API URL → `pulumi up` (publish `out/` + invalidate CloudFront). Doc-only changes don't deploy.
- **`.github/workflows/_gates.yml`** — reusable gates shared by both.

Required GitHub Actions configuration:
- `AWS_ROLE_ARN` (secret) — existing GitHub→AWS OIDC role, reused for `preview` and `up`.
- `PULUMI_ACCESS_TOKEN` (secret) — Pulumi Cloud backend auth.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (variable) — public Turnstile site key.

Infrastructure config/secrets live in the Pulumi stack — see [`infrastructure/MIGRATION_RUNBOOK.md`](./infrastructure/MIGRATION_RUNBOOK.md) for the GitLab→GitHub variable mapping, the clean teardown + recreate cutover, and rollback notes, and [`infrastructure/MANUAL_TEST_PLAN.md`](./infrastructure/MANUAL_TEST_PLAN.md) for post-cutover verification.

## Tests
- `npm run typecheck` — `tsc --noEmit`.
- `npm run test:unit` — Vitest unit tests for `src/lib` pure logic.
- `npm run test:e2e` — Playwright against the built static export (offline, Chromium).
- Contact Lambda: `cargo test` in [`infrastructure/lambdas/contact`](./infrastructure/lambdas/contact).

## Customization checklist
- Update social links in `src/config/site.ts`
- Replace profile image at `public/images/profile.jpg`
- Tune skill values/content in `src/lib/skills-data.ts`
- Tune projects and experience in `src/lib/projects-data.ts` and `src/lib/experience-data.ts`
