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
