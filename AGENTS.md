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
- Keep display data in `src/lib/*-data.ts`.
- Keep site metadata and social links in `src/config/site.ts`.
- Contact form should post to `NEXT_PUBLIC_CONTACT_API_URL` and remain SES-integration friendly.
## Quality expectations
- Keep code clean and composable.
- Prefer small, reusable components over deeply nested JSX blocks.
- Validate changes with lint + build before handing off.
