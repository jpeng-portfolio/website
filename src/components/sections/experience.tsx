"use client";

import { motion } from "motion/react";
import { SectionHeading } from "@/components/shared/section-heading";
import { experienceData } from "@/lib/experience-data";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function ExperienceSection() {
  return (
    <section id="experience" className="section-padding border-b border-border/60">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Experience"
          title={`${experienceData.role} — ${experienceData.company}`}
          description={experienceData.period}
        />
        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.15 }}
        >
          <motion.article
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
            variants={cardVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h3 className="mb-4 text-lg font-semibold text-[#0F172A]">
              AWS Cloud Engineering
            </h3>
            <ul className="space-y-3 text-sm leading-relaxed text-[#334155]">
              {experienceData.highlights.awsCloudEngineering.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#60a5fa]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.article>
          <motion.article
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
            variants={cardVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h3 className="mb-4 text-lg font-semibold text-[#0F172A]">
              Windows & On-Premises Infrastructure
            </h3>
            <ul className="space-y-3 text-sm leading-relaxed text-[#334155]">
              {experienceData.highlights.windowsAndOnPrem.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c084fc]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}
