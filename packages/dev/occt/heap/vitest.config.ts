import { packageSuite } from "../../vitest.shared";

const suite = packageSuite({ coverage: [], pool: "forks", testTimeout: 3_600_000, hookTimeout: 120_000 });

export default {
    ...suite,
    test: { ...suite.test, include: ["heap/**/*.test.ts", "heap/**/*.run.ts"], reporters: ["default"] },
};
