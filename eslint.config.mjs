import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

export default [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "tsconfig.tsbuildinfo",
    ],
  },
  {
    rules: {
      // Existing codebase uses permissive payload typing in API handlers.
      "@typescript-eslint/no-explicit-any": "off",
      // Legacy server modules still rely on CommonJS in a few places.
      "@typescript-eslint/no-require-imports": "off",
      // Content pages include human-readable apostrophes/quotes in JSX copy.
      "react/no-unescaped-entities": "off",
      // This codebase intentionally initializes local state from effects in a few flows.
      "react-hooks/set-state-in-effect": "off",
      // UI skeletons and placeholders may use non-deterministic values by design.
      "react-hooks/purity": "off",
    },
  },
]
