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
    "dist/**",
    ".wrangler/**",
    ".vinext/**",
    ".sites-runtime/**",
    "outputs/**",
    "vendor/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Images are pre-optimised WebP with generated 800px `srcset` variants
      // (scripts/image-variants.mjs), and navigation is intentionally native
      // (components/site-link.tsx) for the Worker runtime.
      "@next/next/no-img-element": "off",
      "@next/next/no-location-assign-relative-destination": "off",
      // Destructuring a field out before spreading the rest (e.g. the form honeypot) is intentional.
      "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true, varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["components/ui/**/*.{ts,tsx}", "hooks/use-mobile.ts"],
    rules: {
      // These files are vendored verbatim from shadcn@4.17.0. Keep the
      // registry source intact while applying the stricter rules to Site code.
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
