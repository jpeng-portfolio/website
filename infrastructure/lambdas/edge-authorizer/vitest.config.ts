import { defineConfig } from "vitest/config";

// Own config so vitest doesn't walk up to the repo-root vitest.config.ts (whose
// React/tsconfig-paths plugins aren't installed in this isolated package).
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
