import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import noComments from "eslint-plugin-no-comments";

const DOUBLE_ASSERTION = ":matches(TSAsExpression, TSTypeAssertion) > :matches(TSAsExpression, TSTypeAssertion).expression[typeAnnotation.type=/^TS(Unknown|Any)Keyword$/]";

export default defineConfig([
    globalIgnores(["dist/", "node_modules/", "**/*.d.ts"]),
    {
        files: ["**/*.ts"],
        extends: [eslint.configs.recommended, tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
        plugins: { "no-comments": noComments },
        languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
        rules: {
            quotes: ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
            semi: ["error", "always"],
            eqeqeq: ["error", "always"],
            curly: ["error", "multi-line"],
            "prefer-const": "error",
            "no-var": "error",
            "max-lines": ["error", { max: 600, skipBlankLines: true, skipComments: true }],
            "no-warning-comments": ["error", { terms: ["todo", "fixme", "hack"], location: "anywhere" }],
            "no-comments/disallowComments": ["error", { allow: ["global", "eslint", "/ <reference"] }],
            "no-restricted-syntax": ["error", { selector: DOUBLE_ASSERTION, message: "A double assertion replaces a type instead of narrowing it: write a type predicate, constrain a generic to the union, or fix the type this is arguing with." }],
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", ignoreRestSiblings: true }],
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-non-null-assertion": "error",
            "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true, allowTypedFunctionExpressions: true, allowHigherOrderFunctions: true, allowDirectConstAssertionInArrowFunctions: true }],
            "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports", fixStyle: "separate-type-imports", disallowTypeAnnotations: false }],
            "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true, allowBoolean: true, allowNullish: false, allowRegExp: false }],
            "@typescript-eslint/naming-convention": [
                "error",
                { selector: "default", format: ["camelCase"], leadingUnderscore: "allow" },
                { selector: "variable", format: ["camelCase", "UPPER_CASE"], leadingUnderscore: "allow" },
                { selector: "parameter", format: ["camelCase"], leadingUnderscore: "allow" },
                { selector: "typeLike", format: ["PascalCase"] },
                { selector: "property", format: null },
                { selector: "method", format: ["camelCase"] },
                { selector: "import", format: null },
            ],
            "@typescript-eslint/only-throw-error": "error",
            "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],
            "@typescript-eslint/non-nullable-type-assertion-style": "off",
        },
    },
]);
