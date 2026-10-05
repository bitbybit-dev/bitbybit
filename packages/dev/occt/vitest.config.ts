import { packageSuite } from "../vitest.shared";

export default packageSuite({
    pool: "forks",
    testTimeout: 30_000,
    hookTimeout: 60_000,
    coverage: [
        "lib/services/**/*.ts",
        "lib/occ-helper.ts",
        "lib/occ-service.ts",
        "lib/api/shapes-helper.service.ts",
        "lib/api/vector-helper.service.ts",
    ],
});
