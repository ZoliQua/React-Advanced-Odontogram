// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Never lint build output, generated docs, coverage, deps or build metadata —
  // linting `dist/` (bundled/minified) produced thousands of spurious errors and
  // made `npm run lint` effectively unusable.
  {
    ignores: [
      "dist/**",
      "docs/**",
      "coverage/**",
      "node_modules/**",
      "**/*.tsbuildinfo",
      "playwright-report/**",
      "test-results/**",
      "blob-report/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: { react: { version: "detect" } },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    // Project-wide rule tuning.
    rules: {
      // The engine deliberately uses `any` at DOM/SVG and dynamic-payload
      // boundaries (see CLAUDE.md "avoid any unless justified"). Keep it VISIBLE
      // as a warning rather than a hard error so `npm run lint` stays green while
      // still flagging new, unjustified uses for review.
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow intentionally-unused args/vars/catch bindings prefixed with `_`.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Node dev-tooling (not part of the browser library bundle).
    files: ["snomed/**", "**/*.mjs", "*.config.{js,ts,mjs}", "vite*.config.ts", "vitest.config.ts"],
    languageOptions: { globals: globals.node },
  },
]);
