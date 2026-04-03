"use client";
import Image from "next/image";
import { UserCircle2 } from "lucide-react";

export function PhotoPlaceholder() {
  return (
    <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-full border-4 border-[#0F172A] bg-[#e8e1d6] shadow-xl sm:h-64 sm:w-64">
      <Image
        src="/images/profile.jpg"
        alt="Profile"
        fill
        className="object-cover"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      <div className="flex h-full w-full items-center justify-center text-[#0F172A]/70">
        <UserCircle2 className="h-24 w-24" />
      </div>
    </div>
  );
}
