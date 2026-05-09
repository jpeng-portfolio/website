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
          title="Full-stack serverless with cloud engineering depth"
          description="Building and shipping production Next.js applications on AWS — from React/TypeScript frontends to Lambda-backed APIs, headless CMS, and end-to-end infrastructure."
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
              I design, build, and ship full-stack web applications — Next.js
              frontends wired to serverless backends on AWS, with Sanity headless
              CMS, SST, and production-grade Terraform infrastructure underneath.
            </p>
            <p>
              My background in cloud engineering means the frontend, serverless
              backend, and infrastructure stay in sync end-to-end. I own the full
              client lifecycle from discovery and scoping through deployment,
              DNS setup, and post-launch support.
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
