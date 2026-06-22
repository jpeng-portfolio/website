// Canonical, public-safe résumé content. This is the single source of truth for
// the professional summary, headline, education, and certifications — consumed by
// both the rendered site (about/certifications sections) and the generated résumé
// documents (PDF + DOCX), so the two can never drift.
//
// PRIVATE contact details (phone, email, location) are NOT here — they live behind
// the build-time `resume-contact` accessor and are injected at generation time.

export type EducationEntry = {
  school: string;
  credential: string;
  date: string;
};

export type Certification = {
  name: string;
  date: string;
};

export type ResumeData = {
  /** Short professional headline / title (e.g. for the résumé header). */
  headline: string;
  /** Professional summary, one entry per paragraph. Rendered on the About section. */
  summaryParagraphs: string[];
  education: EducationEntry[];
  certifications: Certification[];
};

export const resumeData: ResumeData = {
  headline: "AWS Cloud & Infrastructure Engineer",
  summaryParagraphs: [
    "I'm an AWS cloud and infrastructure engineer with 5 years designing, deploying, and managing production environments. I provision multi-account AWS infrastructure as code with Terraform — VPCs, EC2, IAM, Lambda, and security groups — and have run a SOC 2-compliant environment of 30+ servers on a $200K–$250K annual cloud budget.",
    "Day to day I build and maintain CI/CD pipelines (GitLab CI/CD and GitHub Actions), architect disaster-recovery and site-to-site VPN topologies, and monitor fleets with CloudWatch and DattoRMM — across both AWS and Microsoft 365 / Active Directory environments. I started on the frontline support desk and grew into owning cloud infrastructure end-to-end.",
    "I also build full-stack serverless applications on AWS — Next.js and TypeScript frontends wired to Lambda-backed APIs with SST — when a project calls for it, so I can take a system from infrastructure all the way to a shipped product.",
  ],
  education: [
    {
      school: "Bunker Hill Community College",
      credential: "Associate in Science, Computer Science Transfer",
      date: "May 2025",
    },
  ],
  certifications: [
    { name: "AWS Certified Solutions Architect – Associate", date: "March 2024" },
    { name: "eLearnSecurity Junior Penetration Tester (eJPT)", date: "July 2023" },
    { name: "CompTIA A+", date: "April 2021" },
  ],
};
