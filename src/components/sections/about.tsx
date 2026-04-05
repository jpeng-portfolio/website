"use client";

import { motion } from "motion/react";
import { SectionHeading } from "@/components/shared/section-heading";
import { SocialLinks } from "@/components/shared/social-links";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type AboutSectionProps = {
  data: {
    title: string;
    description: string;
    paragraphs: string[];
    profileLinksHeading: string;
    profileLinksDescription: string;
  };
  socialLinks: { linkedin: string; gitlab: string };
};

export function AboutSection({ data, socialLinks }: AboutSectionProps) {
  return (
    <section id="about" className="section-padding border-b border-border/60">
      <div className="container-shell">
        <SectionHeading
          eyebrow="About"
          title={data.title}
          description={data.description}
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
            {data.paragraphs.map((paragraph, index) => (
              <p key={`${paragraph}-${index}`}>{paragraph}</p>
            ))}
          </motion.div>
          <motion.div
            className="rounded-xl border border-border bg-[#f8f4ed] p-5"
            variants={fadeInUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="technical-text text-xs font-semibold uppercase tracking-[0.18em] text-[#475569]">
              {data.profileLinksHeading}
            </p>
            <p className="mt-2 text-sm text-[#475569]">
              {data.profileLinksDescription}
            </p>
            <SocialLinks className="mt-4 flex items-center gap-2" links={socialLinks} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
