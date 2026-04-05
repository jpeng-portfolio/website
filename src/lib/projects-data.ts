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
