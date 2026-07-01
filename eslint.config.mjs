import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default [
  // 1. Core recommended base rulesets applied first
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  // 2. Custom project overrides applied last (highest priority)
  {
    files: ["src/**/*.{ts,js,mjs,cjs}"],
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      "import/order": "off",
      "import/no-unresolved": "off",
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
      
      // Forces these rules to exit as warnings instead of breaking the build
      "prefer-const": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
