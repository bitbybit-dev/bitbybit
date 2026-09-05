import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: false,
        include: ["src/**/*.test.ts"],
        testTimeout: 10_000,
        // Results as JSON for the repository's test report; on GitHub Actions the annotations stay and
        // the runner's own job summary yields to that report.
        reporters: process.env.GITHUB_ACTIONS === "true" ? ["default", "json", ["github-actions", { jobSummary: { enabled: false } }]] : ["default", "json"],
        outputFile: { json: "test-results/vitest.json" },
        coverage: {
            provider: "v8",
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.test.ts", "src/__test__/**", "src/types/**"],
            reporter: ["text", "lcov", "json-summary"],
            reportsDirectory: "coverage",
        },
    },
});
