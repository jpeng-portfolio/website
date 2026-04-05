"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type NavbarProps = {
  domain: string;
  navItems: { label: string; href: string }[];
};

export function Navbar({ domain, navItems }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e293b] bg-[#0F172A]/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between">
        <a href="#" className="technical-text text-sm font-semibold text-[#F5F0E8]">
          {domain}
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-[#F5F0E8] transition hover:text-[#60a5fa]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#F5F0E8] hover:bg-[#1e293b] md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-menu"
            className="border-t border-[#1e293b] bg-[#0F172A] md:hidden overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <nav className="container-shell flex flex-col py-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="py-2 text-sm text-[#F5F0E8] transition hover:text-[#60a5fa]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
