import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";

// Belt-and-suspenders alongside the eslint `no-restricted-imports` guard: the
// private résumé contact accessor must never be imported into any rendered UI
// (components or app), so no phone/email/location can leak into page content.

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(full) ? [full] : [];
  });
}

describe("resume-contact privacy isolation", () => {
  it("is never imported by any rendered component or app file", () => {
    const root = process.cwd();
    const files = [
      ...walk(path.join(root, "src/components")),
      ...walk(path.join(root, "src/app")),
    ];

    const offenders = files.filter((file) =>
      /from\s+["'][^"']*resume-contact["']/.test(readFileSync(file, "utf8"))
    );

    expect(offenders).toEqual([]);
  });
});
