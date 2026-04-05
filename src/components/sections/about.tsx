"use client";

import { motion } from "motion/react";
import { SectionHeading } from "@/components/shared/section-heading";
import { SocialLinks } from "@/components/shared/social-links";

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
          title="Cloud-first engineering with practical operations depth"
          description="Methodical problem solver with production experience across AWS and Microsoft 365 environments, multi-account Terraform deployments, and SOC 2-aligned infrastructure workflows."
        />
        <motion.div
          className="grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm lg:grid-cols-[1.3fr_1fr]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.15 }}
        >
          <motion.div
            className="space-y-4 text-[#334155]"
            variants={fadeInUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p>
              I specialize in building and maintaining infrastructure that is
              scalable, secure, and straightforward to operate. My day-to-day
              work spans cloud architecture, networking, automation, and
              escalation support.
            </p>
            <p>
              Recent focus areas include website development, Terraform module design, CI/CD
              pipelines, hybrid cloud migrations, and cost-optimized AWS
              environments designed for high reliability under real production
              constraints.
            </p>
          </motion.div>
          <motion.div
            className="rounded-xl border border-border bg-[#f8f4ed] p-5"
            variants={fadeInUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="technical-text text-xs font-semibold uppercase tracking-[0.18em] text-[#475569]">
              Profile Links
            </p>
            <p className="mt-2 text-sm text-[#475569]">
              Check out my LinkedIn profile and GitLab.
            </p>
            <SocialLinks className="mt-4 flex items-center gap-2" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
