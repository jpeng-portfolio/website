import { SkillCategory } from "@/components/skills/skill-category";
import { SkillLegend } from "@/components/skills/skill-legend";
import { SectionHeading } from "@/components/shared/section-heading";
import { skillCategories } from "@/lib/skills-data";

export function SkillsSection() {
  return (
    <section id="skills" className="section-padding border-b border-border/60">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Skills"
          title="Skills & Strengths"
          description="Visual proficiency bars inspired by service-status gauge styling, categorized by platform, tools, languages, operations, and communication."
        />
        <SkillLegend />
        <div className="grid gap-5 lg:grid-cols-2">
          {skillCategories.map((category) => (
            <SkillCategory key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
