import type { SkillCategory as SkillCategoryType } from "@/lib/skills-data";
import { SegmentedSkillBar } from "@/components/skills/segmented-skill-bar";

type SkillCategoryProps = {
  category: SkillCategoryType;
};

export function SkillCategory({ category }: SkillCategoryProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-5 text-xl font-semibold text-[#0F172A]">{category.title}</h3>
      <div className="space-y-4">
        {category.skills.map((skill) => (
          <SegmentedSkillBar
            key={`${category.id}-${skill.name}`}
            label={skill.name}
            value={skill.level}
          />
        ))}
      </div>
    </article>
  );
}
