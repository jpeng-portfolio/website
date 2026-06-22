"use client";

import { motion } from "motion/react";
import { BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { resumeCertifications, resumeEducation } from "@/lib/resume-data";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function CertificationsSection() {
  return (
    <section id="certifications" className="section-padding border-b border-border/60">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Credentials"
          title="Certifications & Education"
          description="Validated cloud, security, and infrastructure capabilities with hands-on delivery across client environments."
        />
        <motion.div
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.1 }}
        >
          {resumeCertifications.map((cert) => (
            <motion.div
              key={cert.name}
              variants={cardVariants}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <Card className="border-border/90 bg-card h-full">
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
            </motion.div>
          ))}
          {resumeEducation.map((edu) => (
            <motion.div
              key={edu.institution}
              variants={cardVariants}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <Card className="border-border/90 bg-card h-full">
                <CardHeader>
                  <CardTitle className="text-base">{edu.institution}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-[#475569]">
                  <p>{edu.credential}</p>
                  <p className="technical-text text-xs uppercase tracking-[0.12em]">
                    {edu.date}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
