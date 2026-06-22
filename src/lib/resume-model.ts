// Pure transform that composes the canonical résumé content
// (experience-data + skills-data + resume-data) plus the secret-sourced contact
// into a single normalized `ResumeModel`. This is the one shape both document
// renderers (PDF + DOCX) consume, so the two documents never diverge.
//
// Everything here is pure (no I/O, no Date.now) so it is deterministic and
// unit-tested. Contact details are *injected* by the caller — this module never
// reads the environment itself.

import { experienceRoles, type ExperienceRole } from "@/lib/experience-data";
import { skillCategories } from "@/lib/skills-data";
import {
  aboutParagraphs,
  resumeCertifications,
  resumeEducation,
  resumeHeadline,
  resumeSummary,
  type ResumeCertification,
  type ResumeEducation,
} from "@/lib/resume-data";
import type { ResumeContact } from "@/lib/resume-contact";

export type ResumeSkillGroup = {
  title: string;
  /** Skill names only — proficiency levels are dropped for the document. */
  skills: string[];
};

export type ResumeExperienceEntry = {
  role: string;
  company: string;
  period: string;
  bullets: string[];
};

export type ResumeModel = {
  contact: ResumeContact;
  headline: string;
  summary: string;
  /** Longer narrative (the About-section paragraphs), available to renderers. */
  about: string[];
  experience: ResumeExperienceEntry[];
  skills: ResumeSkillGroup[];
  education: ResumeEducation[];
  certifications: ResumeCertification[];
};

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

/**
 * Parses a "Month YYYY" string into a sortable integer (year * 100 + month).
 * Returns null for unrecognized input so callers can order it deterministically.
 */
export function parseMonthYear(value: string): number | null {
  const match = value.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;
  const month = MONTHS[match[1].toLowerCase()];
  if (!month) return null;
  return Number(match[2]) * 100 + month;
}

/** Sorts dated items most-recent-first; unparseable dates sort to the end. */
function byDateDesc<T extends { date: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const av = parseMonthYear(a.date);
    const bv = parseMonthYear(b.date);
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    return bv - av;
  });
}

function toExperienceEntry(role: ExperienceRole): ResumeExperienceEntry {
  return {
    role: role.role,
    company: role.company,
    period: role.period,
    bullets: [...role.bullets],
  };
}

/**
 * Composes the canonical content + injected contact into a normalized
 * `ResumeModel`. Pure and deterministic.
 */
export function buildResumeModel(contact: ResumeContact): ResumeModel {
  return {
    contact,
    headline: resumeHeadline,
    summary: resumeSummary,
    about: [...aboutParagraphs],
    experience: experienceRoles.map(toExperienceEntry),
    skills: skillCategories.map((category) => ({
      title: category.title,
      skills: category.skills.map((skill) => skill.name),
    })),
    education: byDateDesc(resumeEducation),
    certifications: byDateDesc(resumeCertifications),
  };
}
