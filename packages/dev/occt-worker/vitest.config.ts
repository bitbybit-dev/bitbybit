import { packageSuite } from "../vitest.shared";

export default packageSuite({
    pool: "forks",
    testTimeout: 30_000,
    hookTimeout: 60_000,
    coverage: ["lib/occ-worker/**/*.ts", "lib/api/**/*.ts"],
});
