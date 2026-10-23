import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // (src/nabc is made by tools/convert-nabc-font.mjs)
    ignores: ["dist/", "coverage/", "test/.build/", "test/reference/.cache/", "src/nabc/"]
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      // the rules that exsurge's .eslintrc turned on, which are still in ESLint
      "accessor-pairs": "error",
      eqeqeq: "error",
      "guard-for-in": "error",
      "no-alert": "error",
      "no-caller": "error",
      "no-div-regex": "error",
      "no-eq-null": "error",
      "no-eval": "error",
      "no-extend-native": "error",
      "no-extra-bind": "error",
      "no-implied-eval": "error",
      "no-inner-declarations": ["error", "functions"],
      "no-iterator": "error",
      "no-label-var": "error",
      "no-lone-blocks": "error",
      "no-new": "error",
      "no-new-func": "error",
      "no-new-wrappers": "error",
      "no-octal-escape": "error",
      "no-proto": "error",
      "no-return-assign": "error",
      "no-script-url": "error",
      "no-self-compare": "error",
      "no-undef-init": "error",
      "no-useless-call": "error",
      "no-useless-concat": "error",
      "no-void": "error",
      "wrap-iife": "error",
      "@typescript-eslint/no-unused-expressions": "error",

      // and the ones it turned off, which the recommended rules would turn on
      "no-var": "off",
      "prefer-const": "off",
      "prefer-rest-params": "off",
      "prefer-spread": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // nor these, which came after it: the code calls hasOwnProperty() on its
      // own objects, escapes characters in regular expressions that needn't
      // be, has combining characters in a character class of Latin vowels,
      // and assigns some variables values that are never used
      "no-prototype-builtins": "off",
      "no-useless-escape": "off",
      "no-misleading-character-class": "off",
      "no-useless-assignment": "off",
      // exsurge is dynamic in places, e.g. the attributes of svg elements
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    files: ["bench/**/*.js"],
    languageOptions: { sourceType: "commonjs" },
    rules: { "@typescript-eslint/no-require-imports": "off" }
  }
);
