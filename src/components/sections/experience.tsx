"use client";

import { motion } from "motion/react";
import { SectionHeading } from "@/components/shared/section-heading";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

type ExperienceSectionProps = {
  data: {
    role: string;
    company: string;
    period: string;
    highlightGroups: {
      groupTitle: string;
      accentColor: string;
      items: string[];
    }[];
  };
};

export function ExperienceSection({ data }: ExperienceSectionProps) {
  return (
    <section id="experience" className="section-padding border-b border-border/60">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Experience"
          title={`${data.role} — ${data.company}`}
          description={data.period}
        />
        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.15 }}
        >
          {data.highlightGroups.map((group) => (
            <motion.article
              key={group.groupTitle}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
              variants={cardVariants}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h3 className="mb-4 text-lg font-semibold text-[#0F172A]">
                {group.groupTitle}
              </h3>
              <ul className="space-y-3 text-sm leading-relaxed text-[#334155]">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: group.accentColor }}
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
