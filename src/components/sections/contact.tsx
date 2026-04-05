"use client";

import { FormEvent, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/shared/section-heading";
import { SocialLinks } from "@/components/shared/social-links";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CONTACT_API_URL = process.env.NEXT_PUBLIC_CONTACT_API_URL;

type ContactSectionProps = {
  socialLinks: { linkedin: string; gitlab: string };
};

export function ContactSection({ socialLinks }: ContactSectionProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      toast.error("Please complete all fields.");
      return;
    }

    if (!CONTACT_API_URL) {
      toast.info(
        "Set NEXT_PUBLIC_CONTACT_API_URL to connect this form to your SES API endpoint.",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(CONTACT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      toast.success("Message sent.");
      form.reset();
    } catch {
      toast.error("Unable to send your message right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="section-padding">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Contact"
          title="Let's build something reliable"
          description="Send me a message — powered by API Gateway, Lambda, and Amazon SES."
        />
        <motion.div
          className="grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm lg:grid-cols-[1.2fr_0.8fr]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.15 }}
        >
          <motion.form
            className="space-y-4"
            onSubmit={handleSubmit}
            variants={fadeInUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Your name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" placeholder="How can I help?" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell me about your project..."
                rows={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#0F172A] text-[#F5F0E8] hover:bg-[#1e293b] sm:w-auto"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </motion.form>
          <motion.aside
            className="rounded-xl border border-border bg-[#f8f4ed] p-5"
            variants={fadeInUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="technical-text text-xs font-semibold uppercase tracking-[0.18em] text-[#475569]">
              What I Can Help With
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#334155]">
              <li>• Website Design & Hosting.</li>
              <li>• AWS architecture & Cost Optimization.</li>
              <li>• Infrastructure Design & Troubleshooting.</li>
              <li>• VPNs & Networking.</li>
              <li>• Email & Identity Solutions.</li>
            </ul>
            <SocialLinks className="mt-5 flex gap-2" links={socialLinks} />
          </motion.aside>
        </motion.div>
      </div>
    </section>
  );
}
