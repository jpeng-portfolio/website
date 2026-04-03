"use client";

import { CountUp } from "@/components/unlumen-ui/count-up";
import { cn } from "@/lib/utils";

type SegmentedSkillBarProps = {
  label: string;
  value: number;
  totalSegments?: number;
};

function getFilledColor(value: number) {
  if (value >= 90) return "bg-[#2DD4BF]";
  if (value >= 50) return "bg-[#60a5fa]";
  return "bg-[#c084fc]";
}

export function SegmentedSkillBar({
  label,
  value,
  totalSegments = 50,
}: SegmentedSkillBarProps) {
  const filledSegments = Math.round((value / 100) * totalSegments);
  const filledColor = getFilledColor(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-[#0F172A]">{label}</p>
        <p className="technical-text text-xs font-semibold text-[#334155]">
          <CountUp to={value} duration={1.2} />%
        </p>
      </div>
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${totalSegments}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: totalSegments }).map((_, index) => (
          <span
            key={`${label}-${index}`}
            className={cn(
              "h-3 rounded-[2px] transition-all duration-500",
              index < filledSegments ? filledColor : "bg-[#d6d3d1]",
            )}
          />
        ))}
      </div>
    </div>
  );
}
