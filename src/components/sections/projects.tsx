"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { type ProjectItem } from "@/lib/projects-data";

type ProjectsSectionProps = {
  projects: ProjectItem[];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="section-padding border-b border-border/60">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Projects"
          title="Web Applications and Cloud Engineering Work"
          description="Representative work focused on cost, reliability, deployment automation, and production observability."
        />
        <div className="space-y-6">
          {projects.map((project) => (
            <motion.div
              key={project.title}
              className="relative overflow-hidden rounded-lg border border-border bg-background"
              whileHover={{ y: -6, boxShadow: "0 12px 24px rgba(0,0,0,0.12)" }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <div className="flex flex-row justify-between px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex flex-col gap-1 flex-1 mr-2">
                  <h2 className="text-lg tracking-tight leading-tight font-medium">
                    {project.title}
                  </h2>
                  <p className="text-foreground/50 text-sm">{project.summary}</p>
                </div>
                <div className="inline-flex h-fit items-center text-sm whitespace-nowrap shrink-0">
                  <span className="rounded-l-full bg-secondary h-fit py-1 px-2 font-medium">
                    {project.period}
                  </span>
                  <span className="rounded-r-full text-sm h-fit py-1 px-2 font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    Featured
                  </span>
                </div>
              </div>
              <div className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-5">
                <ul className="space-y-2 text-sm text-[#334155]">
                  {project.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2DD4BF]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <Badge key={tech} variant="secondary" className="bg-[#e8e1d6] text-[#334155]">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center rounded-lg bg-[#0F172A] px-3 text-sm font-medium text-[#F5F0E8] transition hover:bg-[#1e293b]"
                  >
                    Open Live Demo
                  </a>
                  {project.repositoryUrl ? (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 items-center rounded-lg border border-[#0F172A] bg-transparent px-3 text-sm font-medium text-[#0F172A] transition hover:bg-[#e8e1d6]"
                    >
                      {project.repositoryLabel ?? "Open Repository"}
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
