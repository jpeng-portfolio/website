import { describe, it, expect } from "vitest";
import { skillCategories } from "@/lib/skills-data";

describe("skillCategories", () => {
  it("has at least one category", () => {
    expect(skillCategories.length).toBeGreaterThan(0);
  });

  it("has unique, non-empty category ids", () => {
    const ids = skillCategories.map((c) => c.id);
    for (const id of ids) {
      expect(id.trim().length).toBeGreaterThan(0);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has at least one skill per category", () => {
    for (const category of skillCategories) {
      expect(category.skills.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("has non-empty skill names", () => {
    for (const category of skillCategories) {
      for (const skill of category.skills) {
        expect(skill.name.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("has integer skill levels between 0 and 100", () => {
    for (const category of skillCategories) {
      for (const skill of category.skills) {
        expect(Number.isInteger(skill.level)).toBe(true);
        expect(skill.level).toBeGreaterThanOrEqual(0);
        expect(skill.level).toBeLessThanOrEqual(100);
      }
    }
  });
});
