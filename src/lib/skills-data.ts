export type Skill = {
  name: string;
  level: number;
};

export type SkillCategory = {
  id: string;
  title: string;
  skills: Skill[];
};

export const skillCategories: SkillCategory[] = [
  {
    id: "frontend-fullstack",
    title: "Frontend & Full-Stack Web",
    skills: [
      { name: "Next.js 15 / React", level: 92 },
      { name: "TypeScript / JavaScript", level: 90 },
      { name: "Tailwind CSS", level: 88 },
      { name: "shadcn/ui", level: 88 },
      { name: "Sanity Headless CMS", level: 80 },
      { name: "SST (Ion) / SST Monorepo", level: 75 },
      { name: "Node.js", level: 80 },
      { name: "REST / WebSocket APIs", level: 85 },
    ],
  },
  {
    id: "cloud-serverless",
    title: "Cloud & Serverless",
    skills: [
      { name: "Amazon Web Services (AWS)", level: 100 },
      { name: "Lambda / API Gateway", level: 100 },
      { name: "S3 / CloudFront / Route 53", level: 100 },
      { name: "EC2 / VPC / IAM", level: 100 },
      { name: "Aurora / RDS / DynamoDB", level: 82 },
      { name: "SES / Parameter Store", level: 90 },
      { name: "ECS Fargate / ECR", level: 85 },
      { name: "Microsoft Azure", level: 55 },
      { name: "Microsoft 365 / Entra ID", level: 92 },
    ],
  },
  {
    id: "cicd-iac",
    title: "CI/CD & Infrastructure as Code",
    skills: [
      { name: "Terraform", level: 100 },
      { name: "GitLab CI/CD", level: 90 },
      { name: "GitHub Actions", level: 75 },
      { name: "Docker", level: 91 },
      { name: "Ansible", level: 58 },
      { name: "VMware", level: 83 },
    ],
  },
  {
    id: "languages",
    title: "Languages",
    skills: [
      { name: "PowerShell", level: 100 },
      { name: "Java (Spring Boot)", level: 100 },
      { name: "C++", level: 100 },
      { name: "Python", level: 75 },
      { name: "Bash Scripting", level: 80 },
      { name: "Rust", level: 38 },
      { name: "PostgreSQL / MSSQL", level: 74 },
    ],
  },
  {
    id: "cloud-platforms-os",
    title: "Operating Systems & Platforms",
    skills: [
      { name: "Windows 10 and 11", level: 100 },
      { name: "Windows Server 2016–2025", level: 100 },
      { name: "Ubuntu", level: 95 },
      { name: "Debian", level: 75 },
    ],
  },
  {
    id: "networking-security",
    title: "Networking, Email & Security",
    skills: [
      { name: "DNS / DHCP / Domains", level: 95 },
      { name: "VPN – Site-to-Site / Client", level: 85 },
      { name: "Firewalls / Port Security", level: 92 },
      { name: "SPF / DKIM / DMARC", level: 93 },
      { name: "SSL Certificates", level: 87 },
      { name: "SOC 2 Compliance", level: 65 },
      { name: "Enumeration", level: 98 },
      { name: "Common Exploits & Vulnerabilities", level: 75 },
    ],
  },
];
