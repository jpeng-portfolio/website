import { SocialLinks } from "@/components/shared/social-links";

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-[#ece6dc]">
      <div className="container-shell flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#0F172A]">JP Cloud Engineering</p>
          <p className="technical-text text-xs text-[#475569]">
            Built with Next.js, shadcn, and AWS deployment targets (S3 + CloudFront).
          </p>
        </div>
        <SocialLinks className="flex items-center gap-2" />
      </div>
    </footer>
  );
}
