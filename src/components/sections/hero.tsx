import { AuroraBars } from "@/components/unlumen-ui/aurora-bars";
import { Tilt } from "@/components/unlumen-ui/tilt";
import { PhotoPlaceholder } from "@/components/shared/photo-placeholder";
import { siteConfig } from "@/config/site";

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 opacity-20">
        <AuroraBars
          barCount={24}
          colors={["#2DD4BF", "#60a5fa", "#c084fc", "#f87171", "#00000000"]}
          speed={0.35}
          gap={2}
          background="#f5f0e8"
        />
      </div>
      <div className="container-shell section-padding relative grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <p className="technical-text text-xs font-semibold uppercase tracking-[0.2em] text-[#475569]">
            {siteConfig.domain}
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#0F172A] sm:text-5xl">
            Full-Stack Serverless Developer building production Next.js applications on AWS.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[#334155] sm:text-lg">
            Wiring React/TypeScript frontends to Lambda-backed APIs, headless CMS, and
            third-party services — backed by 5 years of cloud engineering across
            Terraform, SOC 2-compliant infrastructure, and multi-account AWS.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#contact"
              className="inline-flex h-8 items-center rounded-lg bg-[#0F172A] px-3 text-sm font-medium text-[#F5F0E8] transition hover:bg-[#1e293b]"
            >
              Get in Touch
            </a>
            <a
              href="#projects"
              className="inline-flex h-8 items-center rounded-lg border border-[#0F172A] bg-transparent px-3 text-sm font-medium text-[#0F172A] transition hover:bg-[#ece6dc]"
            >
              View Projects
            </a>
          </div>
        </div>
        <Tilt rotationFactor={8} className="mx-auto">
          <PhotoPlaceholder />
        </Tilt>
      </div>
    </section>
  );
}
