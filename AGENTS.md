# AGENTS.md
## Project conventions
- Framework: Next.js App Router, static export mode.
- UI baseline: shadcn components with custom composition.
- Animation layer: @unlumen-ui components and motion/react where helpful.
- Typography: Inter for primary content, JetBrains Mono for technical labels and metadata.
- Theme palette:
  - Background: `#F5F0E8`
  - Primary contrast: `#0F172A`
  - Accent blue: `#60a5fa`
  - Accent purple: `#c084fc`
  - Accent teal: `#2DD4BF`
  - Accent red: `#f87171`
- Skills bars should remain segmented and percentage-based from 0-100.
- Do not render personal contact details (phone, street address, direct email) in page content.
## Content and architecture
- Keep sections modular in `src/components/sections/`.
- Sanity CMS is the primary content source for site copy and datasets.
- Keep Sanity implementation in `src/sanity/`:
  - `src/sanity/schemas/*` for schema definitions
  - `src/sanity/queries.ts` for GROQ queries
  - `src/sanity/lib/fetch.ts` for typed fetch helpers + fallbacks
- Keep `src/lib/*-data.ts` only as fallback content and seed references.
- Keep site metadata and social links in `src/config/site.ts`.
- Contact form should post to `NEXT_PUBLIC_CONTACT_API_URL` and remain SES-integration friendly.
- Embedded Sanity Studio lives at `src/app/studio/` and is available at `/studio`.
## Quality expectations
- Keep code clean and composable.
- Prefer small, reusable components over deeply nested JSX blocks.
- Validate changes with lint + build before handing off.
- Use `APP_VERBOSE` / `NEXT_PUBLIC_APP_VERBOSE` for new logging controls.
- GitLab releases are tag-driven (`vX.X.X`) and should pass build, lint test, and S3/CloudFront deploy stages.
