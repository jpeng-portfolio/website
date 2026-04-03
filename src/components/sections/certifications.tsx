import { BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";

const certifications = [
  { name: "AWS Certified Solutions Architect – Associate", date: "March 2024" },
  { name: "eLearnSecurity Junior Penetration Tester (eJPT)", date: "July 2023" },
  { name: "CompTIA A+", date: "April 2021" },
];

export function CertificationsSection() {
  return (
    <section id="certifications" className="section-padding border-b border-border/60">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Credentials"
          title="Certifications & Education"
          description="Validated cloud, security, and infrastructure capabilities with hands-on delivery across client environments."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert) => (
            <Card key={cert.name} className="border-border/90 bg-card">
              <CardHeader>
                <CardTitle className="flex items-start gap-2 text-base">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2DD4BF]" />
                  <span>{cert.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="technical-text text-xs uppercase tracking-[0.12em] text-[#475569]">
                {cert.date}
              </CardContent>
            </Card>
          ))}
          <Card className="border-border/90 bg-card">
            <CardHeader>
              <CardTitle className="text-base">
                Bunker Hill Community College
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-[#475569]">
              <p>Associate in Science, Computer Science Transfer</p>
              <p className="technical-text text-xs uppercase tracking-[0.12em]">
                May 2025
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
