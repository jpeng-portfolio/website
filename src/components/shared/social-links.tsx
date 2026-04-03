import { siteConfig } from "@/config/site";

type SocialLinksProps = {
  className?: string;
};

export function SocialLinks({ className }: SocialLinksProps) {
  return (
    <div className={className}>
      <a
        href={siteConfig.socialLinks.linkedin}
        target="_blank"
        rel="noreferrer"
        aria-label="LinkedIn"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:-translate-y-0.5 hover:bg-[#60a5fa]/20"
      >
        <span className="technical-text text-xs font-semibold uppercase">in</span>
      </a>
      <a
        href={siteConfig.socialLinks.gitlab}
        target="_blank"
        rel="noreferrer"
        aria-label="GitLab"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:-translate-y-0.5 hover:bg-[#c084fc]/20"
      >
        <span className="technical-text text-xs font-semibold uppercase">gl</span>
      </a>
    </div>
  );
}
