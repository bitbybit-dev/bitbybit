import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import { targets } from "./scripts/inputs.config.mjs";
import noDoubleAssertion from "./eslint-rules/no-double-assertion.mjs";
import noLooseComments from "./eslint-rules/no-loose-comments.mjs";

// The lint of this repository, self-contained: it runs from a bare clone with nothing above it.
//
// What is deliberately NOT here: eslint-plugin-no-comments. The JSDoc on the public API is a
// functional input - the visual editors are generated from its tags (@default,
// @optional, @step and the rest, thousands of them) to build editor controls - and that rule is
// auto-fixable with an allow-list that REPLACES its defaults, so one --fix run with it pointed at
// packages/dev would delete the corpus. The ban on free-form comments that it would have provided
// is here all the same, as the local `bitbybit/no-loose-comments` below: it allows JSDoc and tool
// directives, reports the rest, and has no fixer at all, so nothing it says can rewrite a file.
//
// The rule set is the recommended sets - including the type-aware one, which reads the type graph
// rather than one file at a time - plus the house style the packages already followed. Every
// finding that existed when each landed is recorded in eslint-suppressions.json, written by
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
    // Caught errors default to "all", and without this the underscore convention stops at the catch
    // clause: a swallowed error could only satisfy the rule by losing its name entirely.
    caughtErrorsIgnorePattern: "^_",
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
        "**/*.d.ts",
        ...targets.map((t) => t.out),
    ], "build output, the documentation site and the examples (their own tooling), scaffold templates that ship to users, generated and vendored code, declaration files - every .d.ts here is generated or vendored typings, and a build artifact left in a package root would otherwise be linted and baselined - and the assembled inputs namespaces, whose fragments under lib/api/inputs/ are the linted source"),
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
        extends: [eslint.configs.recommended],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
        rules: { ...HOUSE_STYLE, "no-unused-vars": UNDERSCORE_TOLERANT_UNUSED_VARS },
    },
    {
        files: ["**/*.ts"],
        extends: [...tseslint.configs.recommended],
        plugins: { bitbybit: { rules: { "no-double-assertion": noDoubleAssertion, "no-loose-comments": noLooseComments } } },
        rules: {
            "@typescript-eslint/no-unused-vars": UNDERSCORE_TOLERANT_UNUSED_VARS,
            // A local rule rather than a no-restricted-syntax selector, so that the suppression file
            // budgets it under a name of its own: a shared rule id would let a later selector's
            // findings hide inside a count recorded for this one.
            "bitbybit/no-double-assertion": "error",
        },
    },
    // Type-aware linting. The rules above read one file at a time; these read the type graph, which
    // is what catches a promise nobody awaited, a method that lost its `this`, or an assertion that
    // was never doing anything. It needs a project per file, and every package now has a tsconfig
    // that names its sources and its specs, so the service can place them all.
    {
        files: ["**/*.ts"],
        extends: [...tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            parserOptions: {
                // Three tooling files sit in no package's compilation: the shared vitest factory,
                // and the two configs of the packages whose tsconfig covers `src` alone. Every
                // other vitest config is already inside its package's project, and naming one here
                // that the service can place is itself an error - so this list is exact, not a glob.
                projectService: {
                    allowDefaultProject: [
                        "packages/dev/vitest.shared.ts",
                        "packages/dev/cad-cloud-sdk/vitest.config.ts",
                        "packages/dev/create-app/vitest.config.ts",
                    ],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // A caution on no-unnecessary-type-assertion, which is part of this set: the service
            // above places each file in its package's tsconfig.json, and that is the loose project.
            // `typecheck:strict` compiles the generated strict overlay instead, and under its extra
            // flags an assertion this rule calls unnecessary can be load-bearing - an index read is
            // `T | undefined` there and plain `T` here. Five of them were removed on this rule's
            // advice and broke the strict build. So take a removal it suggests, then run
            // `npm run typecheck:strict` before believing it.
            // These six fire wherever an `any` flows, so they measure the debt that
            // `no-explicit-any` already counts - and they measure it about ten times over, because
            // one `any` is re-reported at every member read, call, argument and return downstream of
            // it. Recording thousands of them would bury the findings that say something new, and
            // none of them can be fixed except by removing the `any` that causes them. They come on
            // as that count comes down; the ratchet on `no-explicit-any` is what drives it.
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-redundant-type-constituents": "off",
        },
    },
    // The JSON API is the one place `any` is the answer rather than the debt. Its methods return a
    // value parsed or queried out of an arbitrary structure, and the caller is the only one who knows
    // its shape - `parse` is TypeScript's own `JSON.parse` with a path expression, and that returns
    // `any` for the same reason. Returning `unknown` instead would compile here and break every
    // script that reads a property off the result. Named and scoped, so it stays a decision: the
    // inputs of these same methods are `unknown`, and that is where narrowing belongs.
    {
        files: ["packages/dev/core/lib/api/bitbybit/json.ts"],
        rules: { "@typescript-eslint/no-explicit-any": "off" },
    },
    // Comments in the packages' own source. JSDoc stays - it is the component generator's input, not
    // commentary - and so do tool directives; a free-form note beside the logic does not, because it
    // is a second description that nothing checks and it drifts away from the code it sits next to.
    // The rule carries no fixer, so no `--fix` can reach that JSDoc.
    //
    // Four trees are out of its way. Specs and the fixtures beside them explain a decision that the
    // assertions cannot state, which is the same allowance the studio's own suites get. The rest are
    // not commentary at all but input or output: a worker package's lib/api is emitted by
    // scripts/gen-worker-api.mjs and check:worker-api compares it byte for byte, so an edit there is
    // undone by the next regeneration and fails a gate in the meantime. The SDK's generated types and
    // request schemas are written by the API's own generators, and their banner is not a note but a
    // record: it carries the catalog version that the release version registry checks for. The marker
    // line above every member of a worker API fragment
    // (`// replaces <path>`, `// after <path>`, `// first`, `// last`) is what places that member in
    // the generated class, and the run of `//` lines that opens an inputs fragment is the header the
    // assembler strips. Reporting either would invite someone to delete it.
    {
        files: ["packages/dev/**/*.ts"],
        ignores: [
            "**/*.test.ts",
            "**/__mocks__/**",
            "**/__test__/**",
            "**/lib/api-hand/**",
            "**/lib/api/inputs/**",
            "packages/dev/*-worker/lib/api/**",
            "packages/dev/cad-cloud-sdk/src/types/schema-exports.ts",
            "packages/dev/cad-cloud-sdk/src/types/pipeline-operations.ts",
            "packages/dev/cad-cloud-sdk/src/types/generated.ts",
            "packages/dev/cad-cloud-sdk/src/validation/request-schemas.ts",
            "**/vitest.config.ts",
            "packages/dev/vitest.shared.ts",
        ],
        rules: { "bitbybit/no-loose-comments": "error" },
    },
    {
        files: ["**/*.test.ts", "**/__mocks__/**"],
        languageOptions: {
            globals: { ...globals.vitest },
        },
    },
]);
