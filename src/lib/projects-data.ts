export type ProjectItem = {
  title: string;
  period: string;
  liveUrl: string;
  repositoryUrl?: string;
  repositoryLabel?: string;
  summary: string;
  tech: string[];
  bullets: string[];
};

export const projectsData: ProjectItem[] = [
  {
    title: "Dorval Construction",
    period: "2025",
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
    period: "2025",
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
    period: "2025",
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
    title: "Scale-to-Zero Web Application Platform",
    period: "Personal Project",
    liveUrl: "https://app.fintech-metrix.dev",
    repositoryLabel: "Open Repository",
    repositoryUrl: "https://gitlab.com/fintechmetrix",
    summary:
      "Cost-optimized AWS infrastructure that provisions services on-demand to reduce idle spend while preserving production-grade reliability.",
    tech: [
      "AWS",
      "Terraform",
      "ECS Fargate",
      "Aurora PostgreSQL",
      "CloudFront",
      "Route 53",
      "GitLab CI/CD",
      "Next.js",
      "TypeScript",
      "Java Spring Boot",
    ],
    bullets: [
      "Deployed five ECS Fargate services behind ALB and CloudFront with DNS managed in Route 53.",
      "Built a dual-mode architecture using NAT gateways for high availability and NAT instances for cost-optimized development.",
      "Provisioned multi-cluster Aurora PostgreSQL and observability dashboards for production visibility.",
      "Implemented environment-specific CI/CD with secure variable management and AWS Parameter Store integration.",
    ],
  },
];
