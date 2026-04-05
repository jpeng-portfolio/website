import { SocialLinks } from "@/components/shared/social-links";

type FooterProps = {
  title: string;
  socialLinks: { linkedin: string; gitlab: string };
};

export function Footer({ title, socialLinks }: FooterProps) {
  return (
    <footer className="border-t border-border/80 bg-[#ece6dc]">
      <div className="container-shell flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#0F172A]">{title}</p>
        </div>
        <SocialLinks className="flex items-center gap-2" links={socialLinks} />
      </div>
    </footer>
  );
}
