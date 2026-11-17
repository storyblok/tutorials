// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: [".eve/", ".output/", ".vercel/", "notes/"] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-private-class-members": "off",
      curly: ["error", "all"],
    },
  },
);
