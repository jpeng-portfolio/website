import { SectionHeading } from "@/components/shared/section-heading";
import { SocialLinks } from "@/components/shared/social-links";

export function AboutSection() {
  return (
    <section id="about" className="section-padding border-b border-border/60">
      <div className="container-shell">
        <SectionHeading
          eyebrow="About"
          title="Cloud-first engineering with practical operations depth"
          description="Methodical problem solver with production experience across AWS and Microsoft 365 environments, multi-account Terraform deployments, and SOC 2-aligned infrastructure workflows."
        />
        <div className="grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4 text-[#334155]">
            <p>
              I specialize in building and maintaining infrastructure that is
              scalable, secure, and straightforward to operate. My day-to-day
              work spans cloud architecture, networking, automation, and
              escalation support.
            </p>
            <p>
              Recent focus areas include Terraform module design, CI/CD
              pipelines, hybrid cloud migrations, and cost-optimized AWS
              environments designed for high reliability under real production
              constraints.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-[#f8f4ed] p-5">
            <p className="technical-text text-xs font-semibold uppercase tracking-[0.18em] text-[#475569]">
              Profile Links
            </p>
            <p className="mt-2 text-sm text-[#475569]">
              Add your LinkedIn and GitLab URLs in <code>src/config/site.ts</code>.
            </p>
            <SocialLinks className="mt-4 flex items-center gap-2" />
          </div>
        </div>
      </div>
    </section>
  );
}
