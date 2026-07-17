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
    title: "AWS Cloud Platform",
    skills: [
      { name: "Amazon Web Services (AWS)", level: 100 },
      { name: "EC2 / VPC / IAM", level: 100 },
      { name: "Lambda / API Gateway", level: 100 },
      { name: "S3 / CloudFront / Route 53", level: 100 },
      { name: "AWS Organizations", level: 90 },
      { name: "ALB / CloudWatch", level: 92 },
      { name: "Aurora / RDS / DynamoDB", level: 82 },
      { name: "SQS / EventBridge", level: 85 },
      { name: "KMS / CloudTrail", level: 88 },
      { name: "Cognito", level: 82 },
      { name: "Amazon Bedrock / Polly", level: 78 },
      { name: "Parameter Store", level: 90 },
    ],
  },
  {
    id: "multi-cloud",
    title: "Multi-Cloud (Azure & GCP)",
    skills: [
      { name: "Azure AKS", level: 80 },
      { name: "Azure Resource Groups", level: 80 },
      { name: "GCP GKE", level: 80 },
      { name: "GCP VPC Networking", level: 78 },
      { name: "GPU Node Pools", level: 82 },
      { name: "Entra ID / Azure AD", level: 85 },
    ],
  },
  {
    id: "containers-orchestration",
    title: "Containers & Orchestration",
    skills: [
      { name: "Kubernetes (EKS / AKS / GKE)", level: 85 },
      { name: "Helm", level: 82 },
      { name: "KEDA Autoscaling", level: 80 },
      { name: "NVIDIA GPU Operator", level: 78 },
      { name: "Docker", level: 91 },
      { name: "ECS Fargate / ECR", level: 85 },
    ],
  },
  {
    id: "cicd-iac",
    title: "CI/CD & Infrastructure as Code",
    skills: [
      { name: "Terraform", level: 100 },
      { name: "SST", level: 85 },
      { name: "Pulumi", level: 75 },
      { name: "Ansible", level: 78 },
      { name: "GitLab CI/CD", level: 90 },
      { name: "GitHub Actions", level: 85 },
      { name: "Git", level: 95 },
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
      { name: "Go", level: 75 },
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
      { name: "Cloudflare DNS / WAF", level: 90 },
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
      { name: "Zero Trust Network Access (ZTNA)", level: 82 },
      { name: "DevSecOps in CI/CD", level: 80 },
      { name: "IAM Policies", level: 92 },
      { name: "Firewall Management", level: 90 },
      { name: "Prowler", level: 78 },
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
