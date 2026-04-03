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

## Customization checklist
- Update social links in `src/config/site.ts`
- Replace profile image at `public/images/profile.jpg`
- Tune skill values/content in `src/lib/skills-data.ts`
- Tune projects and experience in `src/lib/projects-data.ts` and `src/lib/experience-data.ts`
