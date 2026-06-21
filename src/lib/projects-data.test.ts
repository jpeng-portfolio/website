import { describe, it, expect } from "vitest";
import { projectsData } from "@/lib/projects-data";

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

describe("projectsData", () => {
  it("has at least one project", () => {
    expect(projectsData.length).toBeGreaterThan(0);
  });

  it("each project has a non-empty title and summary", () => {
    for (const project of projectsData) {
      expect(project.title.trim().length).toBeGreaterThan(0);
      expect(project.summary.trim().length).toBeGreaterThan(0);
    }
  });

  it("each project has at least one tech entry and one bullet", () => {
    for (const project of projectsData) {
      expect(project.tech.length).toBeGreaterThanOrEqual(1);
      expect(project.bullets.length).toBeGreaterThanOrEqual(1);
      for (const tech of project.tech) {
        expect(tech.trim().length).toBeGreaterThan(0);
      }
      for (const bullet of project.bullets) {
        expect(bullet.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("any liveUrl/repositoryUrl present is a valid https URL", () => {
    for (const project of projectsData) {
      if (project.liveUrl !== undefined) {
        expect(isHttpsUrl(project.liveUrl)).toBe(true);
      }
      if (project.repositoryUrl !== undefined) {
        expect(isHttpsUrl(project.repositoryUrl)).toBe(true);
      }
    }
  });
});
