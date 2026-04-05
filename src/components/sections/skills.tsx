"use client";

import { motion } from "motion/react";
import { SkillCategory } from "@/components/skills/skill-category";
import { SkillLegend } from "@/components/skills/skill-legend";
import { SectionHeading } from "@/components/shared/section-heading";
import { type SkillCategory as SkillCategoryType } from "@/lib/skills-data";

const slideFromLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

type SkillsSectionProps = {
  categories: SkillCategoryType[];
};

export function SkillsSection({ categories }: SkillsSectionProps) {
  return (
    <section id="skills" className="section-padding border-b border-border/60">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Skills"
          title="Skills & Strengths"
          description="Visual proficiency bars inspired by service-status gauge styling, categorized by platform, tools, languages, operations, and communication."
        />
        <SkillLegend />
        <motion.div
          className="grid gap-5 lg:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.12 }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              variants={index % 2 === 0 ? slideFromLeft : slideFromRight}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <SkillCategory category={category} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
