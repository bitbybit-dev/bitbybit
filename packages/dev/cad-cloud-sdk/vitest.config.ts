import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: false,
        include: ["src/**/*.test.ts"],
        testTimeout: 10_000,
        coverage: {
            provider: "v8",
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.test.ts", "src/__test__/**", "src/types/**"],
            reporter: ["text", "lcov", "json-summary"],
            reportsDirectory: "coverage",
        },
    },
});
