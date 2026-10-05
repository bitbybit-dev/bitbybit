import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import { targets } from "./scripts/inputs.config.mjs";
import noDoubleAssertion from "./eslint-rules/no-double-assertion.mjs";
import noLooseComments from "./eslint-rules/no-loose-comments.mjs";
import noInputWrites from "./eslint-rules/no-input-writes.mjs";
import noInlineObjectTypes from "./eslint-rules/no-inline-object-types.mjs";

const HOUSE_STYLE = {
    "quotes": ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
    "semi": ["error", "always"],
    "eqeqeq": ["error", "always", { null: "ignore" }],
    "curly": ["error", "all"],
};

const UNDERSCORE_TOLERANT_UNUSED_VARS = ["error", {
    argsIgnorePattern: "^_",
    varsIgnorePattern: "^_",
    caughtErrorsIgnorePattern: "^_",
    ignoreRestSiblings: true,
}];

const LOCAL_RULES = { rules: { "no-double-assertion": noDoubleAssertion, "no-loose-comments": noLooseComments, "no-input-writes": noInputWrites, "no-inline-object-types": noInlineObjectTypes } };
const MAGIC_NUMBERS = ["error", {
    ignore: [-1, 0, 1, 2, 1024],
    ignoreArrayIndexes: true,
    ignoreDefaultValues: true,
    ignoreClassFieldInitialValues: true,
    ignoreEnums: true,
    ignoreNumericLiteralTypes: true,
    ignoreReadonlyClassProperties: true,
    ignoreTypeIndexes: true,
}];
const PLACEMENT_MARKER = "^ (replaces|after) [\\w.]+$|^ (first|last)$";
const NO_JSDOC = { jsDoc: "none" };

const GENERATED = [
    "packages/dev/*-worker/lib/api/**",
    "packages/dev/*/lib/api/dto-registry.ts",
    "packages/dev/*/lib/api/resolved-inputs/**",
    "packages/dev/cad-cloud-sdk/src/types/schema-exports.ts",
    "packages/dev/cad-cloud-sdk/src/types/pipeline-operations.ts",
    "packages/dev/cad-cloud-sdk/src/types/generated.ts",
    "packages/dev/cad-cloud-sdk/src/validation/request-schemas.ts",
    "packages/dev/mcp/src/guides.generated.ts",
];
const TESTS = ["**/*.test.ts", "**/*.test.mjs"];
const STAND_INS = ["**/__mocks__/**", "**/__test__/**"];
const VITEST_CONFIGS = ["**/vitest.config.ts", "packages/dev/vitest.shared.ts"];

export default defineConfig([
    globalIgnores([
        "**/node_modules/",
        "**/dist/",
        "**/coverage/",
        "docs/*",
        "!docs/scripts/",
        "examples/*",
        "!examples/scripts/",
        "packages/dev/create-app/templates/",
        "packages/dev/create-app/.local/",
        "packages/dev/occt/bitbybit-dev-occt*/",
        "packages/dev/*/etc/",
        "**/*.d.ts",
        ...targets.map((t) => t.out),
    ], "outputs, the docs site and example apps, templates, generated and vendored files"),
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
        extends: [eslint.configs.recommended],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
        plugins: { bitbybit: LOCAL_RULES },
        rules: {
            ...HOUSE_STYLE,
            "no-unused-vars": UNDERSCORE_TOLERANT_UNUSED_VARS,
            "no-empty": ["error", { allowEmptyCatch: true }],
            "bitbybit/no-loose-comments": ["error", NO_JSDOC],
        },
    },
    {
        files: ["**/*.ts"],
        extends: [...tseslint.configs.recommended],
        rules: {
            "@typescript-eslint/no-unused-vars": UNDERSCORE_TOLERANT_UNUSED_VARS,
            "@typescript-eslint/consistent-type-imports": "error",
            "bitbybit/no-double-assertion": "error",
        },
    },
    {
        files: ["**/*.ts"],
        extends: [...tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        "packages/dev/vitest.shared.ts",
                        "packages/dev/cad-cloud-sdk/vitest.config.ts",
                        "packages/dev/create-app/vitest.config.ts",
                        "packages/dev/mcp/vitest.config.ts",
                    ],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-redundant-type-constituents": "off",
        },
    },
    {
        files: ["packages/dev/core/lib/api/bitbybit/json.ts"],
        rules: { "@typescript-eslint/no-explicit-any": "off" },
    },
    {
        files: ["packages/dev/base/lib/api/services/logic.ts"],
        rules: { "eqeqeq": "off" },
    },
    {
        files: ["packages/dev/**/*.ts"],
        ignores: [...TESTS, ...STAND_INS, ...VITEST_CONFIGS, "packages/dev/mcp/**"],
        rules: { "bitbybit/no-loose-comments": ["error", { jsDoc: "public-api" }] },
    },
    {
        files: ["packages/dev/*/lib/api-hand/**/*.ts"],
        rules: { "bitbybit/no-loose-comments": ["error", { jsDoc: "public-api", allowLines: [PLACEMENT_MARKER] }] },
    },
    {
        files: ["packages/dev/*/lib/api/inputs/*/namespace.ts"],
        rules: { "bitbybit/no-loose-comments": ["error", { jsDoc: "public-api", documentsAssembledDeclaration: true }] },
    },
    {
        files: ["packages/dev/**/*.ts"],
        ignores: [...TESTS, ...STAND_INS, ...VITEST_CONFIGS],
        rules: {
            "bitbybit/no-inline-object-types": "error",
            "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true, allowTypedFunctionExpressions: true, allowHigherOrderFunctions: true }],
            "max-lines": ["error", { max: 600, skipBlankLines: true, skipComments: true }],
            "@typescript-eslint/no-magic-numbers": MAGIC_NUMBERS,
        },
    },
    {
        files: ["packages/dev/**/constants.ts", "packages/dev/**/*.constants.ts", "packages/dev/occt/lib/services/design/digest.ts"],
        rules: { "@typescript-eslint/no-magic-numbers": "off" },
    },
    {
        files: GENERATED,
        rules: { "bitbybit/no-loose-comments": "off", "bitbybit/no-inline-object-types": "off", "curly": "off", "eqeqeq": "off", "@typescript-eslint/consistent-type-imports": "off", "@typescript-eslint/explicit-function-return-type": "off", "max-lines": "off", "@typescript-eslint/no-magic-numbers": "off" },
    },
    {
        files: [
            "packages/dev/occt/lib/services/**/*.ts",
            "packages/dev/jscad/lib/api/services/**/*.ts",
            "packages/dev/manifold/lib/api/services/**/*.ts",
            "packages/dev/base/lib/api/services/**/*.ts",
        ],
        ignores: TESTS,
        rules: { "bitbybit/no-input-writes": "error" },
    },
    {
        files: [...TESTS, ...STAND_INS],
        languageOptions: {
            globals: { ...globals.vitest },
        },
    },
    {
        files: [...TESTS, ...STAND_INS].filter((glob) => !glob.endsWith(".mjs")),
        rules: { "@typescript-eslint/consistent-type-imports": ["error", { disallowTypeAnnotations: false }] },
    },
    {
        files: TESTS,
        rules: { "bitbybit/no-loose-comments": ["error", { ...NO_JSDOC, allowArrangeActAssert: true }] },
    },
]);
