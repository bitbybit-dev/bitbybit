import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { targets } from "../../scripts/inputs.config.mjs";

const DEV = fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "");

const SOURCES_CONDITION = "@bitbybit-dev/source";
const NODE_DEFAULT_CONDITIONS = ["node", "node-addons", "import", "module", "default"];
const CONDITIONS = [SOURCES_CONDITION, ...NODE_DEFAULT_CONDITIONS];

const inputsFragmentGlobs = targets.map((t) => `**/${t.dir.split("/").slice(3).join("/")}/**`);
const NOT_PRODUCT_CODE = ["**/*.test.ts", "**/__mocks__/**", "**/__test__/**", ...inputsFragmentGlobs];

export type SuiteOptions = {
    coverage: string[];
    environment?: "node" | "jsdom";
    pool?: "forks" | "threads";
    siblingsFromDist?: string[];
    testTimeout?: number;
    hookTimeout?: number;
};

export const packageSuite = (options: SuiteOptions) => defineConfig({
    server: { fs: { allow: [DEV] } },
    resolve: {
        conditions: CONDITIONS,
        alias: [
            ...(options.siblingsFromDist ?? []).flatMap((name) => [
                { find: new RegExp(`^@bitbybit-dev/${name}$`), replacement: `${DEV}/${name}/dist/index.js` },
                { find: new RegExp(`^@bitbybit-dev/${name}/(.*)$`), replacement: `${DEV}/${name}/dist/$1` },
            ]),
        ],
    },
    ssr: { resolve: { conditions: CONDITIONS } },
    test: {
        globals: false,
        environment: options.environment ?? "node",
        include: ["lib/**/*.test.ts"],
        testTimeout: options.testTimeout ?? 10_000,
        ...(options.hookTimeout === undefined ? {} : { hookTimeout: options.hookTimeout }),
        ...(options.pool === undefined ? {} : { pool: options.pool }),
        reporters: process.env["GITHUB_ACTIONS"] === "true"
            ? ["default", "json", ["github-actions", { jobSummary: { enabled: false } }]]
            : ["default", "json"],
        outputFile: { json: "test-results/vitest.json" },
        coverage: {
            provider: "v8",
            include: options.coverage,
            exclude: NOT_PRODUCT_CODE,
            reporter: ["text", "lcov", "json-summary"],
            reportsDirectory: "coverage",
        },
    },
});
