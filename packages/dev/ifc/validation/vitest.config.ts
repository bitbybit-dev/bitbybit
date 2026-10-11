import { packageSuite } from "../../vitest.shared";

const suite = packageSuite({ coverage: [], pool: "forks", testTimeout: 600_000, hookTimeout: 600_000 });

export default {
    ...suite,
    test: { ...suite.test, include: ["validation/**/*.run.ts"], reporters: ["default"] },
};
