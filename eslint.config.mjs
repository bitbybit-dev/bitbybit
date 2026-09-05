import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

// The lint of this repository, self-contained: it runs from a bare clone with nothing above it.
//
// What is deliberately NOT here: eslint-plugin-no-comments. The JSDoc on the public API is a
// functional input - the component generator behind the visual editors reads its tags (@default,
// @optional, @step and the rest, thousands of them) to build editor controls - and that rule is
// auto-fixable with an allow-list that REPLACES its defaults, so one --fix run with it pointed at
// packages/dev would delete the corpus.
//
// The rule set is the two recommended sets plus the house style the packages already followed. Every
// finding that existed when this config landed is recorded in eslint-suppressions.json, written by
// `eslint --suppress-all` from this directory; ESLint fails on a NEW finding and on a suppression
// that is no longer needed, so the count only goes down. Regenerate that file only to record a
// deliberate fix, never to hide a new finding.

const HOUSE_STYLE = {
    "quotes": ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
    "semi": ["error", "always"],
};

const UNDERSCORE_TOLERANT_UNUSED_VARS = ["error", {
    argsIgnorePattern: "^_",
    varsIgnorePattern: "^_",
    ignoreRestSiblings: true,
}];

export default defineConfig([
    globalIgnores([
        "**/node_modules/",
        "**/dist/",
        "**/coverage/",
        "docs/",
        "examples/",
        "packages/dev/create-app/templates/",
        "packages/dev/jscad/jscad-generated.js",
        "packages/dev/occt/bitbybit-dev-occt*/",
        "packages/dev/*/etc/",
    ], "build output, the documentation site and the examples (their own tooling), scaffold templates that ship to users, generated and vendored code"),
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
        extends: [eslint.configs.recommended],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
        rules: HOUSE_STYLE,
    },
    {
        files: ["**/*.ts"],
        extends: [...tseslint.configs.recommended],
        rules: {
            "@typescript-eslint/no-unused-vars": UNDERSCORE_TOLERANT_UNUSED_VARS,
        },
    },
    {
        files: ["**/*.test.ts", "**/__mocks__/**"],
        languageOptions: {
            globals: { ...globals.jest },
        },
    },
]);
