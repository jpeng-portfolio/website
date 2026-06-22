import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Privacy boundary: rendered components/pages must never import the private
  // résumé contact accessor (phone/email/location come from a build-time secret
  // and are only used by the owner-gated résumé generator). See resume-contact.ts.
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
                "Private résumé contact details must never be imported into rendered components (privacy rule). They are secret-sourced at résumé-generation time only.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
