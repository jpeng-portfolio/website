# JP Cloud Engineering Portfolio
Static Next.js portfolio website for cloud and infrastructure engineering work, designed for deployment on AWS S3 + CloudFront.

## Architecture
- **Framework:** Next.js (App Router)
- **Rendering mode:** static export (`output: "export"`)
- **UI system:** shadcn components + custom section components
- **Animation layer:** @unlumen-ui + motion/react
- **Styling:** Tailwind CSS v4 with CSS variables
- **Typography:** Inter + JetBrains Mono
- **Content CMS:** Sanity (embedded Studio at `/studio`)

### App structure
- `src/app/` — root layout, single-page composition, global styles
- `src/app/studio/` — embedded Sanity Studio
- `src/components/layout/` — navbar and footer
- `src/components/sections/` — page section modules
- `src/components/skills/` — segmented skill bar system
- `src/components/shared/` — reusable display primitives
- `src/sanity/` — Sanity client, schemas, GROQ queries, typed fetch helpers
- `src/config/site.ts` — fallback site metadata
- `src/lib/*-data.ts` — fallback content datasets and seed references
- `scripts/seed-sanity.mjs` — initial content seed script

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

## Sanity CMS setup
### 1) Initialize or link a Sanity project
```bash
npm run sanity init
```
### 2) Configure local environment variables
Create `.env.local`:
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=<sanity_project_id>
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=<viewer_token_for_build_time_fetches>
SANITY_API_WRITE_TOKEN=<editor_token_for_seed_script_only>
NEXT_PUBLIC_CONTACT_API_URL=<contact_api_url>
APP_VERBOSE=false
NEXT_PUBLIC_APP_VERBOSE=false
```
### 3) Seed baseline content
```bash
npm run seed:sanity
```
### 4) Open the embedded content studio
Start dev server and browse to `/studio`.

## Build and static export
```bash
npm run build
```
Output is generated in `out/`.

## Sanity runtime behavior
- The website remains fully static at deploy time.
- Content is fetched from Sanity during build via `src/sanity/lib/fetch.ts`.
- If Sanity is not configured or unavailable, fallback data from `src/lib/*-data.ts` and `src/config/site.ts` is used.
- Studio is configured to use hash history, so it can run behind static hosting.

## AWS deployment notes (S3 + CloudFront)
1. Keep the S3 bucket private.
2. Serve site through CloudFront with Origin Access Control (OAC).
3. Upload `out/` contents to S3.
4. Invalidate CloudFront cache after deployment.
5. Point `jpcloudengineering.com` DNS to CloudFront (Route 53 alias recommended).

## Contact API endpoint
`POST /contact` (via API Gateway URL in `NEXT_PUBLIC_CONTACT_API_URL`)

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
- `CONTACT_API_URL` — optional CI alias mapped to `NEXT_PUBLIC_CONTACT_API_URL`.
- `NEXT_PUBLIC_SANITY_PROJECT_ID` — Sanity project ID.
- `NEXT_PUBLIC_SANITY_DATASET` — Sanity dataset (typically `production`).
- `SANITY_API_READ_TOKEN` — build-time read token for Sanity content fetches.
- `SANITY_API_WRITE_TOKEN` — token used by `npm run seed:sanity`.
- `SANITY_PROJECT_ID` — optional CI alias mapped to `NEXT_PUBLIC_SANITY_PROJECT_ID`.
- `SANITY_DATASET` — optional CI alias mapped to `NEXT_PUBLIC_SANITY_DATASET`.
- `APP_VERBOSE` / `NEXT_PUBLIC_APP_VERBOSE` — optional app-wide verbosity flags.

## Network requirements
Clients and CI runners need outbound HTTPS access to:
- Site domain (`jpcloudengineering.com` through CloudFront)
- Contact API URL (`NEXT_PUBLIC_CONTACT_API_URL`)
- Sanity services (`*.sanity.io`) for content fetch and Studio usage

## Database connections
- No relational database is used by this website project.
- Content persistence is managed by Sanity Content Lake.

## GitLab CI/CD
This repository deploys on semver tags in the format `vX.X.X` (for example: `v1.0.0`) and also supports triggered pipelines for Sanity webhooks.

Pipeline stages:
1. **build** — installs dependencies and runs `npm run build` to produce `out/`.
2. **test** — runs `npm run lint`.
3. **deploy** — uses GitLab OIDC to assume an AWS role, syncs `out/` to S3, and invalidates CloudFront.

Required GitLab CI/CD variables:
- `ROLE_ARN`
- `AWS_DEFAULT_REGION`
- `BUCKET_NAME`
- `DISTRIBUTION_ID`
- `NEXT_PUBLIC_CONTACT_API_URL`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`
- Optional aliases: `CONTACT_API_URL`, `SANITY_PROJECT_ID`, `SANITY_DATASET`

## Sanity publish webhook to GitLab
1. In GitLab, create a trigger token (Settings → CI/CD → Pipeline triggers).
2. In Sanity (Manage → API → Webhooks), add:
   - URL: `https://gitlab.com/api/v4/projects/<PROJECT_ID>/trigger/pipeline`
   - Body parameters: `token=<TRIGGER_TOKEN>`, `ref=master`
3. Enable webhook triggers for create/update/publish operations.

Publish flow:
Sanity publish -> GitLab trigger pipeline -> static rebuild -> S3 sync -> CloudFront invalidation.

## Release command example
```bash
git tag v1.0.0
git push --tags
```

## Customization checklist
- Manage site text/content in Sanity Studio (`/studio`)
- Replace profile image at `public/images/profile.jpg`
- Update fallback references in `src/lib/*-data.ts` only when changing seed defaults
