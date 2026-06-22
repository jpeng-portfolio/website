"use client";

import { motion } from "motion/react";
import { SectionHeading } from "@/components/shared/section-heading";
import { SocialLinks } from "@/components/shared/social-links";
import { aboutParagraphs } from "@/lib/resume-data";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function AboutSection() {
  return (
    <section id="about" className="section-padding border-b border-border/60">
      <div className="container-shell">
        <SectionHeading
          eyebrow="About"
          title="AWS cloud and infrastructure engineering, end-to-end"
          description="Designing, deploying, and operating production cloud — multi-account AWS and Microsoft 365 environments provisioned as code with Terraform, automated with CI/CD, and hardened for SOC 2 compliance."
        />
        <motion.div
          className="rounded-2xl border border-border bg-card p-6 shadow-sm after:block after:clear-both after:content-['']"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.15 }}
        >
          <motion.div
            className="mb-6 rounded-xl border border-border bg-[#f8f4ed] p-5 lg:float-right lg:mb-4 lg:ml-8 lg:w-72"
            variants={fadeInUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="technical-text text-xs font-semibold uppercase tracking-[0.18em] text-[#475569]">
              Profile Links
            </p>
            <p className="mt-2 text-sm text-[#475569]">
              Check out my LinkedIn profile and GitHub.
            </p>
            <SocialLinks className="mt-4 flex items-center gap-2" />
          </motion.div>
          <motion.div
            className="space-y-4 text-[#334155]"
            variants={fadeInUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {aboutParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
