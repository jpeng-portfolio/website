// Pure transform composing the site's content (experience + skills + résumé data)
// plus the injected private contact block into a single normalized `ResumeModel`.
// This is the one structure both document renderers (PDF + DOCX) consume, so the
// two outputs are guaranteed identical in content.
//
// Pure logic only — contact is INJECTED (never read from env here) so the model is
// trivially unit-testable and never touches the private accessor at import time.

import { experienceRoles } from "./experience-data";
import { skillCategories } from "./skills-data";
import { resumeData } from "./resume-data";
import type { ResumeContact } from "./resume-contact";
import type { Certification, EducationEntry } from "./resume-data";

export type ResumeExperienceEntry = {
  role: string;
  company: string;
  period: string;
  bullets: string[];
};

export type ResumeSkillGroup = {
  title: string;
  /** Skill names only — proficiency levels are dropped for the document. */
  skills: string[];
};

export type ResumeModel = {
  contact: ResumeContact;
  headline: string;
  summary: string[];
  experience: ResumeExperienceEntry[];
  skills: ResumeSkillGroup[];
  education: EducationEntry[];
  certifications: Certification[];
};

/**
 * Build the normalized résumé model. Deterministic: preserves source ordering and
 * introduces no timestamps, so repeated runs produce identical content.
 */
export function buildResumeModel(contact: ResumeContact): ResumeModel {
  return {
    contact,
    headline: resumeData.headline,
    summary: [...resumeData.summaryParagraphs],
    experience: experienceRoles.map((role) => ({
      role: role.role,
      company: role.company,
      period: role.period,
      bullets: [...role.bullets],
    })),
    skills: skillCategories.map((category) => ({
      title: category.title,
      skills: category.skills.map((skill) => skill.name),
    })),
    education: resumeData.education.map((entry) => ({ ...entry })),
    certifications: resumeData.certifications.map((cert) => ({ ...cert })),
  };
}
