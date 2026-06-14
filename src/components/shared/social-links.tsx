import { siteConfig } from "@/config/site";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";

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
        className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-[#60a5fa]/60 hover:bg-[#60a5fa]/20 hover:shadow-[0_0_0_1px_rgba(96,165,250,0.45),0_0_16px_rgba(96,165,250,0.45)]"
      >
        <FaLinkedinIn className="h-4 w-4 transition-colors group-hover:text-[#60a5fa]" />
      </a>
      <a
        href={siteConfig.socialLinks.github}
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub"
        className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c084fc]/60 hover:bg-[#c084fc]/20 hover:shadow-[0_0_0_1px_rgba(192,132,252,0.45),0_0_16px_rgba(192,132,252,0.45)]"
      >
        <FaGithub className="h-4 w-4 transition-colors group-hover:text-[#c084fc]" />
      </a>
    </div>
  );
}
