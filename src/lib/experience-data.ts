export type ExperienceRole = {
  role: string;
  company: string;
  companyUrl?: string;
  period: string;
  freelance?: boolean;
  bullets: string[];
};

export const experienceRoles: ExperienceRole[] = [
  {
    role: "Full-Stack Serverless Developer",
    company: "Runtime Designs",
    companyUrl: "https://runtimedesigns.com",
    period: "November 2025 – Present",
    freelance: true,
    bullets: [
      "Designed, built, and shipped Dorval Construction's marketing site (dorvalconstruction.com) — a multi-page Next.js 15 site with image gallery, services pages, and a serverless contact form (API Gateway + Lambda + SES) hosted on private S3 + CloudFront with Origin Access Control.",
      "Built Saudade Café (saudadecafe.cafe) — a bilingual (Portuguese/English) Next.js café site with Sanity headless CMS for menu and content management, plus a coworking booking subdomain featuring a multi-step calendar, time-slot, and payment flow.",
      "Operate the studio's own marketing site at runtimedesigns.com on Next.js 15, React, TypeScript, Tailwind CSS, and shadcn/ui, hosted on AWS with Cloudflare DNS.",
      "Own the full client lifecycle — discovery, scoping, design, frontend and serverless backend implementation, AWS deployment, domain and DNS setup, and post-launch support.",
    ],
  },
  {
    role: "Cloud & Infrastructure Engineer",
    company: "Direct IT",
    period: "July 2021 – Present",
    bullets: [
      "Designed and managed AWS and Microsoft 365 infrastructure for clients, including a SOC 2-compliant environment with a $200K–$250K annual cloud budget across 30+ servers.",
      "Provisioned multi-account AWS production infrastructure with Terraform — VPCs, EC2, IAM roles/policies, Lambda functions, security groups — using reusable modules and remote state.",
      "Architected serverless and disaster-recovery environments in AWS using Terraform, including site-to-site VPN tunnels connecting on-premises networks to cloud.",
      "Wrote automation in PowerShell, Bash, and Python; monitored 30+ servers via CloudWatch and DattoRMM.",
      "Resolved 15–20 daily L1–L3 escalations across cloud, networking, and on-premises environments — translating complex technical issues for both technical and non-technical clients.",
    ],
  },
];
