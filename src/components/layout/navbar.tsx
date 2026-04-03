"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e293b] bg-[#0F172A]/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between">
        <a href="#" className="technical-text text-sm font-semibold text-[#F5F0E8]">
          {siteConfig.domain}
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {siteConfig.navItems.map((item) => (
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
      {open ? (
        <div className="border-t border-[#1e293b] bg-[#0F172A] md:hidden">
          <nav className="container-shell flex flex-col py-4">
            {siteConfig.navItems.map((item) => (
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
        </div>
      ) : null}
    </header>
  );
}
