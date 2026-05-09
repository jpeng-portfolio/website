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
- `NEXT_PUBLIC_CONTACT_API_URL` — public API endpoint for contact form submission.
- `CONTACT_API_URL` — optional CI convenience variable that can be mapped to `NEXT_PUBLIC_CONTACT_API_URL` during pipeline builds.

## GitLab CI/CD (tag-based release)
This repository deploys on semver tags in the format `vX.X.X` (for example: `v1.0.0`).

Pipeline stages:
1. **build** — installs dependencies and runs `npm run build` to produce `out/`.
2. **test** — runs `npm run lint`.
3. **deploy** — uses GitLab OIDC to assume an AWS role, syncs `out/` to S3, and invalidates CloudFront.
4. **mirror** — mirrors the GitLab repository to GitHub on push/schedule pipelines.

Required GitLab CI/CD variables:
- `ROLE_ARN` — IAM role ARN created by infrastructure bootstrap (`gitlab_deploy_role_arn` output).
- `AWS_DEFAULT_REGION` — AWS region (typically `us-east-1`).
- `BUCKET_NAME` — Terraform output `bucket_name` from `../infrastructure/environments/prod`.
- `DISTRIBUTION_ID` — Terraform output `distribution_id` from `../infrastructure/environments/prod`.
- `NEXT_PUBLIC_CONTACT_API_URL` — public contact API URL used by the frontend build.
- `GITHUB_OWNER` — GitHub owner/org used by the mirror target URL.
- `GITHUB_REPO` — GitHub repository name used by the mirror target URL.
- `GITHUB_USERNAME` — GitHub username used for mirror authentication.
- `GITHUB_TOKEN` — GitHub token (PAT/fine-grained token) used for mirror authentication.
- Optional alias: `CONTACT_API_URL` (if set, the pipeline maps it to `NEXT_PUBLIC_CONTACT_API_URL` when that variable is unset).

GitLab provides these required runtime variables automatically (no manual setup needed): `CI_JOB_TOKEN`, `CI_SERVER_HOST`, `CI_PROJECT_PATH`, `CI_PIPELINE_ID`, and `GITLAB_OIDC_TOKEN`.

Variable helper script:
```powershell
.\scripts\set-gitlab-vars.ps1 -GitLabToken "<gitlab_pat_with_api_scope>" -ProjectId "<numeric_project_id>"
```
Optional flags:
- `-Protected $false` to create non-protected variables.
- `-IncludeContactAlias` to also set `CONTACT_API_URL`.

Release command example:
```bash
git tag v1.0.0
git push --tags
```

## Customization checklist
- Update social links in `src/config/site.ts`
- Replace profile image at `public/images/profile.jpg`
- Tune skill values/content in `src/lib/skills-data.ts`
- Tune projects and experience in `src/lib/projects-data.ts` and `src/lib/experience-data.ts`
