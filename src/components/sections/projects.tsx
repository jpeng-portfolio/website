import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { projectsData } from "@/lib/projects-data";
import { TiltCard } from "@/components/unlumen-ui/tilt-card";

export function ProjectsSection() {
  return (
    <section id="projects" className="section-padding border-b border-border/60">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Projects"
          title="Web Applications and Cloud Engineering Work"
          description="Representative work focused on cost, reliability, deployment automation, and production observability."
        />
        <div className="space-y-6">
          {projectsData.map((project) => (
            <TiltCard
              key={project.title}
              title={project.title}
              description={project.summary}
              price={project.period}
              badgeLabel="Featured"
              badgeVariant="success"
              className="!h-auto !gap-0"
            >
              <div className="space-y-4 pb-4">
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
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
