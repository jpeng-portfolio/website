"use client";

import { motion } from "motion/react";
import { SectionHeading } from "@/components/shared/section-heading";
import { experienceRoles } from "@/lib/experience-data";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const bulletColors = ["#60a5fa", "#c084fc", "#2DD4BF", "#f87171"];

export function ExperienceSection() {
  return (
    <section id="experience" className="section-padding border-b border-border/60">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Experience"
          title="Work Experience"
          description="5+ years delivering across cloud engineering, serverless backends, and full-stack web development."
        />
        <motion.div
          className="space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.15 }}
        >
          {experienceRoles.map((role, idx) => (
            <motion.article
              key={role.company}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
              variants={cardVariants}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A]">
                    {role.role}
                  </h3>
                  <p className="text-sm text-[#475569]">
                    {role.companyUrl ? (
                      <a
                        href={role.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {role.company}
                      </a>
                    ) : (
                      role.company
                    )}
                    {role.freelance && (
                      <span className="ml-2 technical-text text-xs uppercase tracking-[0.12em] text-[#2DD4BF]">
                        Freelance
                      </span>
                    )}
                  </p>
                </div>
                <span className="technical-text text-xs uppercase tracking-[0.12em] text-[#475569] whitespace-nowrap">
                  {role.period}
                </span>
              </div>
              <ul className="space-y-3 text-sm leading-relaxed text-[#334155]">
                {role.bullets.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: bulletColors[idx % bulletColors.length] }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
