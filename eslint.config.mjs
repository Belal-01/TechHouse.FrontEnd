import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Feature-based architecture boundaries:
//   app/  →  features/  →  shared (components/, lib/)
// - A feature is imported only through its public entry: "@/features/<name>" or "@/features/<name>/server".
// - Shared code never imports a feature.
const featureDeepImport = {
  group: ["@/features/*/*", "!@/features/*/server"],
  message: "Import a feature through its public entry: @/features/<name> or @/features/<name>/server.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [featureDeepImport] }],
    },
  },
  {
    files: ["components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            featureDeepImport,
            { group: ["@/features/*", "@/features/**"], message: "Shared code must not depend on a feature." },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
