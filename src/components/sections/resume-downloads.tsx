import { FileText, FileType } from "lucide-react";

/**
 * The two owner-gated résumé documents. Paths live under the CloudFront
 * `/resume/files/*` behavior, which the Lambda@Edge authorizer protects — an
 * unauthenticated click is redirected to the Cognito Hosted UI to sign in.
 */
const resumeFiles = [
  {
    label: "Download PDF",
    description: "ATS-friendly PDF résumé",
    href: "/resume/files/jason-paquette-resume.pdf",
    Icon: FileText,
  },
  {
    label: "Download DOCX",
    description: "Editable Word résumé",
    href: "/resume/files/jason-paquette-resume.docx",
    Icon: FileType,
  },
] as const;

export function ResumeDownloads() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2" aria-label="Résumé downloads">
      {resumeFiles.map(({ label, description, href, Icon }) => (
        <li key={href}>
          <a
            href={href}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-[#2DD4BF] hover:bg-[#f8f4ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F172A] text-[#F5F0E8]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="font-medium text-[#0F172A]">{label}</span>
              <span className="technical-text text-xs uppercase tracking-[0.12em] text-[#475569]">
                {description}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
