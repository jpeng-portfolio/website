export type ProjectItem = {
  title: string;
  period: string;
  image?: string;
  liveUrl?: string;
  repositoryUrl?: string;
  repositoryLabel?: string;
  summary: string;
  tech: string[];
  bullets: string[];
};

export const projectsData: ProjectItem[] = [
  {
    title: "TransformMyNotes",
    period: "2026",
    image: "/projects/transformmynotes.png",
    liveUrl: "https://transformmynotes.com",
    repositoryUrl: "https://github.com/jasonp2323/transformmynotes",
    summary:
      "Mobile-first web app that digitizes handwritten study notes with image capture, AI transcription, a Notion-style block editor, and a full-text searchable notebook.",
    tech: [
      "Next.js",
      "TypeScript",
      "SST v4",
      "Pulumi",
      "AWS Lambda",
      "DynamoDB",
      "AWS S3",
      "Cognito",
      "CloudFront",
      "Amazon Bedrock",
      "Resend",
      "GitHub Actions",
    ],
    bullets: [
      "Mobile-first web app that digitizes handwritten study notes — image capture, transcription via Amazon Bedrock (Claude vision), a Notion-style block editor, and a full-text searchable notebook.",
      "Fully serverless AWS stack defined as code with SST v4 (deployed via Pulumi) — Next.js App Router, Lambda, S3, DynamoDB, Cognito authentication, CloudFront, and Resend.",
      "Invite/approval-gated access with an admin panel, plus groups, shared notes, and a spaced-repetition review deck.",
    ],
  },
  {
    title: "Token Buzz",
    period: "2026",
    image: "/projects/token-buzz.png",
    liveUrl: "https://tokenbuzz.app",
    repositoryUrl: "https://github.com/Token-Buzz",
    summary:
      "Real-time crypto signal-intelligence platform that ingests social chatter across X, Farcaster, Telegram, and Reddit to surface trending tokens with watchlists, alerts, and LLM-summarized context.",
    tech: [
      "Next.js",
      "TypeScript",
      "SST v4",
      "Pulumi",
      "AWS Lambda",
      "DynamoDB",
      "SQS",
      "EventBridge",
      "CloudFront",
      "Cloudflare",
      "Clerk",
      "Resend",
      "Amazon Bedrock",
      "Terraform",
      "GitHub Actions",
    ],
    bullets: [
      "Real-time crypto signal-intelligence platform ingesting social chatter from X, Farcaster, Telegram, and Reddit, surfacing trending tokens with watchlists, alerts, and LLM-summarized context via Amazon Bedrock.",
      "Full serverless AWS stack defined as code with SST v4 (deployed via Pulumi) — CloudFront, Lambda, DynamoDB, SQS, EventBridge, and IAM — fronted by Cloudflare DNS/WAF with Clerk authentication and Resend email.",
      "DynamoDB single-table data model with purpose-built GSIs and typed key-builders; per-user third-party API keys encrypted at rest using AES/KMS envelope encryption.",
      "AWS account hardened to the CIS Foundations Benchmark v6.0 via a dedicated Terraform project (CloudTrail, IAM Access Analyzer, default-SG lockdown, scheduled Prowler evidence scans); CI/CD ships through GitHub Actions using short-lived OIDC credentials with ephemeral per-PR preview environments.",
    ],
  },
  {
    title: "Dorval Construction",
    period: "2026",
    image: "/projects/dorval-construction.png",
    liveUrl: "https://dorvalconstruction.com",
    summary:
      "Marketing site for a custom home remodeling contractor — multi-page Next.js build with image gallery, services pages, and a serverless contact form deployed on AWS.",
    tech: [
      "Next.js 15",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "AWS S3",
      "CloudFront",
      "Lambda",
      "API Gateway",
      "SES",
      "Cloudflare DNS",
    ],
    bullets: [
      "Multi-page Next.js 15 site with image gallery and services pages for a home remodeling contractor.",
      "Serverless contact form using API Gateway HTTP API, Lambda, and SES with full domain verification.",
      "Static site hosted on a private S3 bucket behind CloudFront with Origin Access Control and HTTPS-only enforcement.",
      "Deployed via GitLab CI/CD with DNS managed through Cloudflare.",
    ],
  },
  {
    title: "Saudade Café",
    period: "2026",
    image: "/projects/saudade-cafe.png",
    liveUrl: "https://saudadecafe.cafe",
    summary:
      "Bilingual (Portuguese/English) café site with Sanity headless CMS for menu management and a coworking booking subdomain with multi-step calendar and payment flow.",
    tech: [
      "Next.js 15",
      "TypeScript",
      "Tailwind CSS",
      "Sanity CMS",
      "AWS S3",
      "CloudFront",
      "Lambda",
      "API Gateway",
      "Cloudflare DNS",
    ],
    bullets: [
      "Bilingual (Portuguese/English) Next.js site with Sanity headless CMS powering menu and content management.",
      "Coworking booking subdomain with a multi-step calendar, time-slot selection, and payment flow.",
      "Static export hosted on AWS S3 + CloudFront with DNS on Cloudflare.",
    ],
  },
  {
    title: "This Website",
    period: "2026",
    image: "/projects/this-website.png",
    liveUrl: "https://jpcloudengineering.com",
    repositoryLabel: "Open Repository",
    repositoryUrl: "https://gitlab.com/jpeng-portfolio",
    summary:
      "A statically exported Next.js portfolio deployed on AWS with fully automated Terraform infrastructure, serverless contact form, and daily cost monitoring.",
    tech: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Motion",
      "shadcn/ui",
      "Terraform",
      "AWS S3",
      "CloudFront",
      "Lambda",
      "API Gateway",
      "SES",
      "Cloudflare DNS",
      "GitLab CI/CD",
    ],
    bullets: [
      "Static site served from a private S3 bucket through CloudFront with Origin Access Control, TLS 1.2, and HTTPS-only enforcement.",
      "Serverless contact form using API Gateway HTTP API, an ARM64 Lambda function, and SES with full DKIM and domain verification.",
      "Automated daily cost digest via EventBridge-triggered Lambda querying Cost Explorer, plus AWS Budgets with threshold alerts.",
      "Four reusable Terraform modules (static-site, contact-api, cost-monitor, cloudflare-dns) managing the entire stack.",
      "Tag-driven GitLab CI/CD pipeline using OIDC federation to deploy, sync to S3, and invalidate the CloudFront cache.",
    ],
  },
  {
    title: "FintechMetrix",
    period: "2026",
    repositoryLabel: "Open Repository",
    repositoryUrl: "https://gitlab.com/fintechmetrix",
    summary:
      "Cost-optimized, scale-to-zero AWS platform that provisions services on demand to reduce idle spend while preserving production-grade reliability. Later rebuilt and relaunched as Token Buzz.",
    tech: [
      "AWS",
      "Terraform",
      "ECS Fargate",
      "Aurora PostgreSQL",
      "ALB",
      "CloudFront",
      "Route 53",
      "GitLab CI/CD",
      "Grafana",
      "Next.js",
      "TypeScript",
      "Java Spring Boot",
    ],
    bullets: [
      "Cost-optimized, scale-to-zero AWS platform deployed with Terraform — 5 ECS Fargate services behind ALB/CloudFront/Route 53 with Aurora PostgreSQL auto-scale-down policies.",
      "Full GitLab CI/CD pipeline for multi-environment deployments, managing secrets via GitLab variables and AWS Parameter Store.",
      "Dual-mode networking with NAT gateways (production HA) and NAT instances (low-cost dev), plus Grafana observability dashboards.",
      "Full-stack build in Java Spring Boot, Next.js/TypeScript, and PostgreSQL; later rebuilt from the ground up and relaunched as Token Buzz (no longer live).",
    ],
  },
];
