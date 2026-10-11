import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: false,
        environment: "node",
        include: ["src/**/*.test.ts"],
        testTimeout: 60_000,
        hookTimeout: 120_000,
        reporters: process.env["GITHUB_ACTIONS"] === "true"
            ? ["default", "json", ["github-actions", { jobSummary: { enabled: false } }]]
            : ["default", "json"],
        outputFile: { json: "test-results/vitest.json" },
    },
});
