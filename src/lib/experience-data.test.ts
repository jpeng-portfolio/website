import { describe, it, expect } from "vitest";
import { experienceRoles } from "@/lib/experience-data";

describe("experienceRoles", () => {
  it("has at least one role", () => {
    expect(experienceRoles.length).toBeGreaterThan(0);
  });

  it("each role has non-empty role, company, and period", () => {
    for (const entry of experienceRoles) {
      expect(entry.role.trim().length).toBeGreaterThan(0);
      expect(entry.company.trim().length).toBeGreaterThan(0);
      expect(entry.period.trim().length).toBeGreaterThan(0);
    }
  });

  it("each role has at least one non-empty bullet", () => {
    for (const entry of experienceRoles) {
      expect(entry.bullets.length).toBeGreaterThanOrEqual(1);
      for (const bullet of entry.bullets) {
        expect(bullet.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
