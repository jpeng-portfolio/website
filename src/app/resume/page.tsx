import type { Metadata } from "next";
import { ResumeDownloads } from "@/components/sections/resume-downloads";
import { hostedUiLogoutUrl } from "@/config/cognito";

export const metadata: Metadata = {
  title: "Résumé downloads | JP Cloud Engineering",
  description:
    "Owner-gated résumé downloads. Sign in with the owner account to download the PDF or DOCX.",
  robots: { index: false, follow: false },
};

export default function ResumePortalPage() {
  // Evaluated at build time — fails loud if NEXT_PUBLIC_COGNITO_* is unset.
  const logoutUrl = hostedUiLogoutUrl();

  return (
    <section className="section-padding">
      <div className="container-shell max-w-3xl">
        <header className="mb-8 space-y-3">
          <p className="technical-text text-xs font-semibold uppercase tracking-[0.2em] text-[#475569]">
            Résumé
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl">
            Owner résumé downloads
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-[#334155] sm:text-lg">
            These documents are generated from this site&apos;s content and kept
            private. Selecting a download prompts a one-time sign-in with the
            owner account; once authenticated, the file downloads.
          </p>
        </header>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <ResumeDownloads />

          <p className="mt-6 text-sm text-[#475569]">
            Not the owner? These files aren&apos;t publicly available.
          </p>
          <p className="mt-2 text-sm text-[#475569]">
            Already signed in and finished?{" "}
            <a
              href={logoutUrl}
              className="font-medium text-[#0F172A] underline underline-offset-4 hover:text-[#2DD4BF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF]"
            >
              Sign out
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
