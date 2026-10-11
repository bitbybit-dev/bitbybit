import { packageSuite } from "../../vitest.shared";

const suite = packageSuite({ coverage: [], pool: "forks", testTimeout: 1_800_000, hookTimeout: 120_000 });

export default {
    ...suite,
    test: { ...suite.test, include: ["bench/**/*.run.ts"], reporters: ["default"] },
};
