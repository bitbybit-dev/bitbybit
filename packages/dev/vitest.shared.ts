import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { targets } from "../../scripts/inputs.config.mjs";

const DEV = fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "");

// The test configuration every package shares. A package's own vitest.config.ts says only what
// differs: which files coverage is measured over, and - where the code needs it - a browser-like
// environment or a process per file.
//
// Sibling packages resolve through the "@bitbybit-dev/source" condition their exports maps put
// first, so a suite reads a sibling's TypeScript sources and sees an edit without a rebuild. The
// conditions after it are the ones Node itself would apply; they are spelled out because naming a
// condition replaces the default list rather than adding to it.
const CONDITIONS = ["@bitbybit-dev/source", "node", "node-addons", "import", "module", "default"];

export type SuiteOptions = {
    /** Coverage is measured over these globs, as the package's own denominator. */
    coverage: string[];
    /** "jsdom" where the code under test reaches for a document or a canvas. */
    environment?: "node" | "jsdom";
    /** "forks" gives each file its own process, for kernels that hold global state. */
    pool?: "forks" | "threads";
    /**
     * Sibling packages this suite reads from their built dist rather than their sources. The
     * renderer suites do: they mount an engine against compiled siblings, and reading a sibling's
     * TypeScript instead would drag its own untranspiled dependencies into the run.
     */
    siblingsFromDist?: string[];
    testTimeout?: number;
    hookTimeout?: number;
};

export const packageSuite = (options: SuiteOptions) => defineConfig({
    // A suite reads its siblings, which sit beside it rather than under it, so the packages
    // directory has to be readable as a whole.
    server: { fs: { allow: [DEV] } },
    resolve: {
        conditions: CONDITIONS,
        alias: [
            // A sibling read from dist needs both forms its consumers use: the bare package name,
            // and any subpath under it.
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
        // Results as JSON for the repository's test report; on GitHub Actions the annotations stay
        // and the runner's own job summary yields to that report.
        reporters: process.env["GITHUB_ACTIONS"] === "true"
            ? ["default", "json", ["github-actions", { jobSummary: { enabled: false } }]]
            : ["default", "json"],
        outputFile: { json: "test-results/vitest.json" },
        coverage: {
            provider: "v8",
            include: options.coverage,
            // Naming an exclude replaces vitest's defaults, so everything that is not product code is
            // spelled out. __test__ holds the kernel boot helpers the suites share; the inputs
            // fragments are the authoring form of an assembled namespace that is already in the
            // denominator, so counting them too would measure the same DTOs twice.
            exclude: [
                "**/*.test.ts",
                "**/__mocks__/**",
                "**/__test__/**",
                ...targets.map((t) => `**/${t.dir.split("/").slice(3).join("/")}/**`),
            ],
            reporter: ["text", "lcov", "json-summary"],
            reportsDirectory: "coverage",
        },
    },
});
