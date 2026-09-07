import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: false,
        environment: "node",
        include: ["src/**/*.test.ts"],
        // Each case runs the built CLI as a user would and writes a project tree to a temp folder.
        // There is deliberately no coverage here: the CLI runs as a child process, which V8 coverage
        // in this process cannot observe, so any number it produced would say 0% of code that is in
        // fact exercised end to end. What this suite asserts is the tree the CLI writes.
        testTimeout: 60_000,
        hookTimeout: 120_000,
        reporters: process.env["GITHUB_ACTIONS"] === "true"
            ? ["default", "json", ["github-actions", { jobSummary: { enabled: false } }]]
            : ["default", "json"],
        outputFile: { json: "test-results/vitest.json" },
    },
});
