"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/shared/section-heading";
import { SocialLinks } from "@/components/shared/social-links";
import { validateContactPayload } from "@/lib/contact-validation";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CONTACT_API_URL = process.env.NEXT_PUBLIC_CONTACT_API_URL;
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function ContactSection() {
  // Double-submit guard — ref so the check is immune to stale closures.
  const submittingRef = useRef(false);
  const [loading, setLoading] = useState(false);

  // Turnstile
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  function initTurnstile() {
    if (!TURNSTILE_SITE_KEY || !turnstileContainerRef.current || widgetIdRef.current) return;
    widgetIdRef.current =
      window.turnstile?.render(turnstileContainerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => {
          setTurnstileToken("");
          toast.error("Bot verification failed. Please try again.");
        },
      }) ?? null;
  }

  // Runs after every render so it catches the case where the script loads
  // asynchronously after the initial mount. The widgetIdRef guard prevents
  // double-rendering.
  useEffect(() => {
    if (typeof window !== "undefined" && window.turnstile) {
      initTurnstile();
    }
  });

  function resetTurnstile() {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
    widgetIdRef.current = null;
    setTurnstileToken("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    const validationError = validateContactPayload(payload);
    if (validationError) {
      toast.error(validationError);
      return;
    }

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

      if (!response.ok) throw new Error("Request failed");

      toast.success("Message sent.");
      form.reset();
      resetTurnstile();
    } catch {
      toast.error("Unable to send your message right now.");
      resetTurnstile();
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
              <>
                <Script
                  src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                  strategy="afterInteractive"
                  onLoad={initTurnstile}
                />
                <div ref={turnstileContainerRef} />
              </>
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
