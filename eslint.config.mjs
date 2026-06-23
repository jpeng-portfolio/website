import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Privacy guard: the private résumé contact accessor must never be pulled into
  // rendered UI (no phone/location/direct-email in page content). Build-time
  // résumé generation in scripts/ is the only allowed consumer.
  {
    files: ["src/components/**/*.{ts,tsx}", "src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/resume-contact", "@/lib/resume-contact"],
              message:
                "resume-contact holds private contact details (phone/email/location) and must never be imported into rendered UI. It is for build-time résumé generation only.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
