import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "dist/**",
    ".astro/**",
    "apps/docs/dist/**",
    "apps/docs/.astro/**",
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ["**/*.{js,mjs,ts,astro}"],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
