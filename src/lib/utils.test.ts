import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges multiple class names", () => {
    expect(cn("px-2", "text-sm")).toBe("px-2 text-sm");
  });

  it("dedupes/overrides conflicting Tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles conditional and falsey values", () => {
    expect(cn("base", false && "hidden", null, undefined, "active")).toBe(
      "base active"
    );
    expect(cn({ "is-open": true, "is-closed": false })).toBe("is-open");
  });

  it("flattens array inputs", () => {
    expect(cn(["px-2", "py-2"], "text-sm")).toBe("px-2 py-2 text-sm");
  });

  it("returns an empty string with no meaningful input", () => {
    expect(cn()).toBe("");
    expect(cn(false, null, undefined)).toBe("");
  });
});
