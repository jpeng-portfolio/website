import {createClient} from "@sanity/client";

const requiredEnvVars = [
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "SANITY_API_WRITE_TOKEN",
];

const missing = requiredEnvVars.filter((name) => !process.env[name]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-04-05",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

const heroDoc = {
  _id: "heroSection",
  _type: "heroSection",
  headline: "Cloud & Infrastructure Engineer building resilient, cost-aware AWS platforms.",
  subheadline:
    "5+ years supporting production environments across cloud, networking, and hybrid infrastructure. Focused on Terraform automation, CI/CD, and practical reliability engineering.",
  ctaPrimaryLabel: "Get in Touch",
  ctaPrimaryHref: "#contact",
  ctaSecondaryLabel: "View Projects",
  ctaSecondaryHref: "#projects",
};

const aboutDoc = {
  _id: "aboutSection",
  _type: "aboutSection",
  title: "Cloud-first engineering with practical operations depth",
  description:
    "Methodical problem solver with production experience across AWS and Microsoft 365 environments, multi-account Terraform deployments, and SOC 2-aligned infrastructure workflows.",
  paragraphs: [
    "I specialize in building and maintaining infrastructure that is scalable, secure, and straightforward to operate. My day-to-day work spans cloud architecture, networking, automation, and escalation support.",
    "Recent focus areas include website development, Terraform module design, CI/CD pipelines, hybrid cloud migrations, and cost-optimized AWS environments designed for high reliability under real production constraints.",
  ],
  profileLinksHeading: "Profile Links",
  profileLinksDescription: "Check out my LinkedIn profile and GitLab.",
};

const siteConfigDoc = {
  _id: "siteConfig",
  _type: "siteConfig",
  title: "JP Cloud Engineering",
  domain: "jpcloudengineering.com",
  tagline: "Cloud & Infrastructure Engineer",
  description:
    "Cloud and Infrastructure engineering portfolio focused on AWS, Terraform, CI/CD, automation, and reliable production systems.",
  navItems: [
    {label: "About", href: "#about"},
    {label: "Skills", href: "#skills"},
    {label: "Experience", href: "#experience"},
    {label: "Projects", href: "#projects"},
    {label: "Certifications", href: "#certifications"},
    {label: "Contact", href: "#contact"},
  ],
  socialLinks: {
    linkedin: "https://www.linkedin.com/in/jason-paquette-2a865b181/",
    gitlab: "https://gitlab.com/fintechmetrix",
  },
};

const experienceDoc = {
  _id: "experience",
  _type: "experience",
  role: "Cloud & Infrastructure Engineer",
  company: "Direct IT",
  period: "July 2021 – Present",
  highlightGroups: [
    {
      groupTitle: "AWS Cloud Engineering",
      accentColor: "#60a5fa",
      items: [
        "Designed, deployed, and managed AWS and Microsoft 365 environments including SOC 2-compliant workloads.",
        "Provisioned production infrastructure with Terraform modules across VPC, EC2, IAM, Lambda, and security controls.",
        "Built and validated AWS disaster recovery environments for testing and continuity planning.",
        "Deployed virtual firewalls and site-to-site VPN connectivity between on-prem and cloud networks.",
        "Monitored health and performance across multi-client environments with CloudWatch and DattoRMM.",
      ],
    },
    {
      groupTitle: "Windows & On-Premises Infrastructure",
      accentColor: "#c084fc",
      items: [
        "Administered Active Directory, DNS, DHCP, Group Policy, and RDS environments for multiple clients.",
        "Maintained hybrid Windows and Linux server fleets with secure patching and access control workflows.",
        "Automated repetitive infrastructure tasks with PowerShell, Bash, and Python scripts.",
        "Resolved L1-L3 escalations daily across networking, cloud, and on-prem systems.",
        "Collaborated cross-functionally and mentored junior engineers during complex incidents.",
      ],
    },
  ],
};

const skillCategories = [
  {
    _id: "skill-category-cloud-platforms",
    _type: "skillCategory",
    id: "cloud-platforms",
    title: "Cloud Platforms and Operating Systems",
    order: 1,
    skills: [
      {name: "Amazon Web Services (AWS)", level: 100},
      {name: "Microsoft Azure", level: 55},
      {name: "Google Cloud Platform (GCP)", level: 25},
      {name: "Windows 10 and 11", level: 100},
      {name: "Windows Server 2016 through 2025", level: 100},
      {name: "Ubuntu", level: 95},
      {name: "Debian", level: 75},
      {name: "Microsoft 365 / Entra ID", level: 92},
    ],
  },
  {
    _id: "skill-category-languages",
    _type: "skillCategory",
    id: "languages",
    title: "Languages",
    order: 2,
    skills: [
      {name: "Java", level: 100},
      {name: "C++", level: 100},
      {name: "JavaScript / TypeScript", level: 90},
      {name: "Python", level: 75},
      {name: "Bash Scripting", level: 80},
      {name: "PowerShell", level: 100},
      {name: "HTML", level: 80},
      {name: "CSS", level: 75},
      {name: "PostgreSQL", level: 77},
      {name: "Microsoft SQL", level: 70},
      {name: "Oracle SQL", level: 60},
      {name: "REST API", level: 85},
      {name: "Websocket API", level: 78},
    ],
  },
  {
    _id: "skill-category-software-tools",
    _type: "skillCategory",
    id: "software-tools",
    title: "Software, Tools and Frameworks",
    order: 3,
    skills: [
      {name: "JetBrains IDEs", level: 100},
      {name: "Visual Studio Code", level: 100},
      {name: "GitHub Actions", level: 75},
      {name: "Terraform", level: 100},
      {name: "Ansible", level: 58},
      {name: "Docker", level: 91},
      {name: "VMware", level: 83},
      {name: "Next.js", level: 83},
      {name: "SpringBoot", level: 83},
      {name: "Auth0", level: 83},
    ],
  },
  {
    _id: "skill-category-networking-email",
    _type: "skillCategory",
    id: "networking-email",
    title: "Networking and Email",
    order: 4,
    skills: [
      {name: "Domains", level: 93},
      {name: "DNS", level: 95},
      {name: "DHCP", level: 93},
      {name: "VPN - Site-to-Site / Client", level: 85},
      {name: "Routers / Gateways", level: 81},
      {name: "Microsoft 365", level: 100},
      {name: "MX Records", level: 92},
      {name: "SPF", level: 95},
      {name: "DKIM", level: 85},
      {name: "DMARC", level: 91},
    ],
  },
  {
    _id: "skill-category-cybersecurity",
    _type: "skillCategory",
    id: "cybersecurity",
    title: "Cybersecurity",
    order: 5,
    skills: [
      {name: "SSL Certificates", level: 87},
      {name: "Firewalls", level: 92},
      {name: "Port Security", level: 85},
      {name: "Phishing Attacks", level: 91},
      {name: "Enumeration", level: 98},
      {name: "Privilege Escalation", level: 45},
      {name: "Common Exploits and Vulnerabilities", level: 75},
      {name: "System Hardening", level: 55},
      {name: "SOC 2", level: 65},
      {name: "Compliance", level: 75},
    ],
  },
];

const projects = [
  {
    _id: "project-this-website",
    _type: "project",
    order: 1,
    title: "This Website",
    period: "2025",
    liveUrl: "https://jpcloudengineering.com",
    repositoryLabel: "Open Repository",
    repositoryUrl: "https://gitlab.com/fintechmetrix",
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
    _id: "project-scale-to-zero-platform",
    _type: "project",
    order: 2,
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

const certifications = [
  {
    _id: "cert-aws-solutions-architect-associate",
    _type: "certification",
    order: 1,
    name: "AWS Certified Solutions Architect – Associate",
    date: "March 2024",
    certType: "cert",
  },
  {
    _id: "cert-ejpt",
    _type: "certification",
    order: 2,
    name: "eLearnSecurity Junior Penetration Tester (eJPT)",
    date: "July 2023",
    certType: "cert",
  },
  {
    _id: "cert-comptia-a-plus",
    _type: "certification",
    order: 3,
    name: "CompTIA A+",
    date: "April 2021",
    certType: "cert",
  },
  {
    _id: "education-bhcc-associates",
    _type: "certification",
    order: 4,
    name: "Bunker Hill Community College",
    details: "Associate in Science, Computer Science Transfer",
    date: "May 2025",
    certType: "education",
  },
];

const docs = [
  heroDoc,
  aboutDoc,
  siteConfigDoc,
  experienceDoc,
  ...skillCategories,
  ...projects,
  ...certifications,
];

async function seed() {
  console.info(`[sanity-seed] Upserting ${docs.length} documents...`);
  const tx = client.transaction();
  for (const doc of docs) {
    tx.createOrReplace(doc);
  }
  await tx.commit();
  console.info("[sanity-seed] Done.");
}

seed().catch((error) => {
  console.error("[sanity-seed] Failed:", error);
  process.exit(1);
});
