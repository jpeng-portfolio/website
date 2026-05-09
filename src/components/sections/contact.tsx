"use client";

import { FormEvent, useRef, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/shared/section-heading";
import { SocialLinks } from "@/components/shared/social-links";
import { TurnstileWidget, type TurnstileHandle } from "@/components/shared/turnstile-widget";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CONTACT_API_URL = process.env.NEXT_PUBLIC_CONTACT_API_URL;
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePayload(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string | null {
  if (!payload.name || !payload.email || !payload.subject || !payload.message) {
    return "Please complete all fields.";
  }
  if (payload.name.length > 100) return "Name must be 100 characters or fewer.";
  if (payload.email.length > 254) return "Email address is too long.";
  if (!EMAIL_RE.test(payload.email)) return "Please enter a valid email address.";
  if (payload.subject.length > 200) return "Subject must be 200 characters or fewer.";
  if (payload.message.length > 5000) return "Message must be 5,000 characters or fewer.";
  return null;
}

export function ContactSection() {
  // Double-submit guard — a ref so the check is always current regardless of render cycle.
  const submittingRef = useRef(false);
  const [loading, setLoading] = useState(false);

  const turnstileRef = useRef<TurnstileHandle>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  function handleTurnstileVerify(token: string) {
    setTurnstileToken(token);
  }

  function handleTurnstileError() {
    setTurnstileToken(null);
    toast.error("Bot verification failed. Please try again.");
  }

  function handleTurnstileExpire() {
    setTurnstileToken(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Double-submit prevention.
    if (submittingRef.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    // Client-side validation (mirrors server-side rules).
    const validationError = validatePayload(payload);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Require Turnstile token when the widget is configured.
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      toast.error("Please complete the bot verification.");
      return;
    }

    if (!CONTACT_API_URL) {
      toast.info("Set NEXT_PUBLIC_CONTACT_API_URL to enable form submissions.");
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          ...(turnstileToken ? { "cf-turnstile-response": turnstileToken } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      toast.success("Message sent.");
      form.reset();
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch {
      toast.error("Unable to send your message right now.");
      // Reset Turnstile so the user can retry without refreshing.
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="section-padding">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Contact"
          title="Let's build something together"
          description="Send me a message and I'll get back to you."
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
              <Input id="name" name="name" placeholder="Your name" maxLength={100} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" maxLength={254} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" placeholder="How can I help?" maxLength={200} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell me about your project..."
                rows={6}
                maxLength={5000}
              />
            </div>

            {TURNSTILE_SITE_KEY && (
              <TurnstileWidget
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={handleTurnstileVerify}
                onError={handleTurnstileError}
                onExpire={handleTurnstileExpire}
              />
            )}

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
              <li>• AWS Architecture & Cost Optimization.</li>
              <li>• Infrastructure Design & Troubleshooting.</li>
              <li>• VPNs & Networking.</li>
              <li>• Email & Identity Solutions.</li>
            </ul>
            <SocialLinks className="mt-5 flex gap-2" />
          </motion.aside>
        </motion.div>
      </div>
    </section>
  );
}
