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
    id: "cloud-platforms",
    title: "Cloud Platforms",
    skills: [
      { name: "Amazon Web Services (AWS)", level: 100 },
      { name: "EC2 / VPC / IAM", level: 100 },
      { name: "Lambda / API Gateway", level: 100 },
      { name: "S3 / CloudFront / Route 53", level: 100 },
      { name: "ALB / CloudWatch", level: 92 },
      { name: "Aurora / RDS / DynamoDB", level: 82 },
      { name: "SQS / EventBridge", level: 85 },
      { name: "Cognito", level: 82 },
      { name: "Amazon Bedrock", level: 78 },
      { name: "Parameter Store", level: 90 },
      { name: "Cloudflare DNS", level: 90 },
    ],
  },
  {
    id: "cicd-iac",
    title: "CI/CD, IaC & Containers",
    skills: [
      { name: "Terraform", level: 100 },
      { name: "GitLab CI/CD", level: 90 },
      { name: "GitHub Actions", level: 80 },
      { name: "Git", level: 95 },
      { name: "Docker", level: 91 },
      { name: "ECS Fargate / ECR", level: 85 },
      { name: "SST v4", level: 82 },
      { name: "Pulumi", level: 75 },
    ],
  },
  {
    id: "monitoring-observability",
    title: "Monitoring & Observability",
    skills: [
      { name: "CloudWatch", level: 95 },
      { name: "DattoRMM", level: 90 },
      { name: "Grafana", level: 80 },
      { name: "Nagios", level: 70 },
      { name: "SNMP Monitoring", level: 80 },
    ],
  },
  {
    id: "languages",
    title: "Scripting & Languages",
    skills: [
      { name: "PowerShell", level: 100 },
      { name: "Bash", level: 85 },
      { name: "Python", level: 75 },
      { name: "Java (Spring Boot)", level: 90 },
      { name: "JavaScript / TypeScript", level: 90 },
      { name: "Next.js / React", level: 92 },
      { name: "C++", level: 90 },
      { name: "REST / WebSocket APIs", level: 85 },
    ],
  },
  {
    id: "networking-email",
    title: "Networking & Email",
    skills: [
      { name: "VPC Design / NAT Gateways & Instances", level: 90 },
      { name: "Site-to-Site / Client VPN", level: 85 },
      { name: "SonicWall Firewalls", level: 88 },
      { name: "DNS / DHCP", level: 95 },
      { name: "VLANs / WAPs", level: 82 },
      { name: "MX / SPF / DKIM / DMARC", level: 93 },
      { name: "Email Filtering & Security", level: 88 },
    ],
  },
  {
    id: "microsoft-infrastructure",
    title: "Microsoft Infrastructure",
    skills: [
      { name: "Active Directory (ADUC / ADCS)", level: 90 },
      { name: "Microsoft 365 / Entra ID", level: 92 },
      { name: "Remote Desktop Services", level: 85 },
      { name: "FSLogix", level: 80 },
      { name: "Group Policy / DNS / DHCP", level: 90 },
    ],
  },
  {
    id: "operating-systems",
    title: "Operating Systems & Platforms",
    skills: [
      { name: "Windows Server", level: 100 },
      { name: "Debian / Ubuntu Linux", level: 90 },
      { name: "Proxmox", level: 80 },
      { name: "VMware ESXi", level: 83 },
    ],
  },
  {
    id: "security",
    title: "Security",
    skills: [
      { name: "SOC 2 Compliance", level: 70 },
      { name: "CIS Baselines", level: 80 },
      { name: "IAM Policies", level: 92 },
      { name: "Firewall Management", level: 90 },
      { name: "LDAP / RADIUS", level: 80 },
      { name: "Nessus", level: 72 },
      { name: "Kali Linux", level: 75 },
    ],
  },
  {
    id: "tools",
    title: "Tools",
    skills: [
      { name: "AI-Assisted Development (Claude Code)", level: 92 },
      { name: "Veeam Backup & Replication", level: 82 },
      { name: "Postman", level: 85 },
    ],
  },
];
