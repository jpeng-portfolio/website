import { SectionHeading } from "@/components/shared/section-heading";
import { experienceData } from "@/lib/experience-data";

export function ExperienceSection() {
  return (
    <section id="experience" className="section-padding border-b border-border/60">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Experience"
          title={`${experienceData.role} — ${experienceData.company}`}
          description={experienceData.period}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-[#0F172A]">
              AWS Cloud Engineering
            </h3>
            <ul className="space-y-3 text-sm leading-relaxed text-[#334155]">
              {experienceData.highlights.awsCloudEngineering.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#60a5fa]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-[#0F172A]">
              Windows & On-Premises Infrastructure
            </h3>
            <ul className="space-y-3 text-sm leading-relaxed text-[#334155]">
              {experienceData.highlights.windowsAndOnPrem.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c084fc]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
