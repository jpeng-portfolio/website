// Canonical, public-safe résumé content. This is the single source of truth for
// the headline, professional summary, education, and certifications. Both the
// rendered site sections (About / Certifications) and the generated résumé
// documents consume this data, so the site and the résumé never drift.
//
// NOTE: private contact details (name header, phone, email, location) are NOT
// stored here — they are secret-sourced at generation time via
// `@/lib/resume-contact`, so this file stays safe to render on a public page.

export type ResumeEducation = {
  institution: string;
  credential: string;
  /** Human month-year, e.g. "May 2025". */
  date: string;
};

export type ResumeCertification = {
  name: string;
  /** Human month-year, e.g. "March 2024". */
  date: string;
};

/** Short professional title used as the résumé headline and around the site. */
export const resumeHeadline = "AWS Cloud & Infrastructure Engineer";

/**
 * Narrative paragraphs rendered by the About section. The résumé condenses this
 * into `resumeSummary`; both live here so editing one prompts editing the other.
 */
export const aboutParagraphs: string[] = [
  "I'm an AWS cloud and infrastructure engineer with 5 years designing, deploying, and managing production environments. I provision multi-account AWS infrastructure as code with Terraform — VPCs, EC2, IAM, Lambda, and security groups — and have run a SOC 2-compliant environment of 30+ servers on a $200K–$250K annual cloud budget.",
  "Day to day I build and maintain CI/CD pipelines (GitLab CI/CD and GitHub Actions), architect disaster-recovery and site-to-site VPN topologies, and monitor fleets with CloudWatch and DattoRMM — across both AWS and Microsoft 365 / Active Directory environments. I started on the frontline support desk and grew into owning cloud infrastructure end-to-end.",
  "I also build full-stack serverless applications on AWS — Next.js and TypeScript frontends wired to Lambda-backed APIs with SST — when a project calls for it, so I can take a system from infrastructure all the way to a shipped product.",
];

/**
 * Concise professional summary used at the top of the generated résumé
 * (ATS-friendly: a single, scannable paragraph).
 */
export const resumeSummary =
  "AWS cloud and infrastructure engineer with 5 years designing, deploying, and operating multi-account AWS and Microsoft 365 environments. Provisions production infrastructure as code with Terraform, builds CI/CD pipelines with GitLab CI/CD and GitHub Actions, and has run a SOC 2-compliant 30+ server estate on a $200K–$250K annual cloud budget. Comfortable owning a system end-to-end — from VPC design and disaster recovery to full-stack serverless apps on AWS.";

export const resumeEducation: ResumeEducation[] = [
  {
    institution: "Bunker Hill Community College",
    credential: "Associate in Science, Computer Science Transfer",
    date: "May 2025",
  },
];

export const resumeCertifications: ResumeCertification[] = [
  { name: "AWS Certified Solutions Architect – Associate", date: "March 2024" },
  {
    name: "eLearnSecurity Junior Penetration Tester (eJPT)",
    date: "July 2023",
  },
  { name: "CompTIA A+", date: "April 2021" },
];
