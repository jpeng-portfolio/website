"use client";

import { motion } from "motion/react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <motion.header
      className="mb-8 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {eyebrow ? (
        <p className="technical-text text-xs font-semibold uppercase tracking-[0.2em] text-[#475569]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-3xl text-base leading-relaxed text-[#334155] sm:text-lg">
          {description}
        </p>
      ) : null}
    </motion.header>
  );
}
