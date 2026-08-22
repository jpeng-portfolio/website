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
    "I'm an AWS cloud engineer with 8 years of industry experience spanning software development and cloud infrastructure, including 5 years designing, deploying, and operating production AWS environments. I specialize in infrastructure as code with Terraform, multi-environment CI/CD pipelines, and secure, cost-optimized, highly available architectures — including a SOC 2–compliant platform running 30+ servers on a $200K–$250K annual cloud budget.",
    "I'm hands-on across VPC and least-privilege IAM design, multi-account provisioning under AWS Organizations, disaster recovery, observability, and Zero Trust network access (ZTNA). I support multiple client engagements in parallel and translate complex technical issues for technical and non-technical audiences alike.",
    "I also build full-stack serverless applications on AWS — Next.js and TypeScript frontends wired to Lambda-backed APIs — and contribute to open-source GPU tooling for Kubernetes, so I can take a system from infrastructure all the way to a shipped product.",
  ],
  education: [
    {
      school: "Bunker Hill Community College",
      credential: "Associate in Science, Computer Science Transfer",
      date: "May 2025",
    },
  ],
  certifications: [
    { name: "HashiCorp Certified: Terraform Associate (004)", date: "July 2026" },
    { name: "AWS Certified Solutions Architect – Associate", date: "March 2024" },
    { name: "eLearnSecurity Junior Penetration Tester (eJPT)", date: "July 2023" },
    { name: "CompTIA A+", date: "April 2021" },
  ],
};
