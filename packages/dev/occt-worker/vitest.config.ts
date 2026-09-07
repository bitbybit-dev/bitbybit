import { packageSuite } from "../vitest.shared";

export default packageSuite({
    // The kernel holds global state, so each file gets its own process rather than sharing one.
    pool: "forks",
    testTimeout: 30_000,
    hookTimeout: 60_000,
    coverage: ["lib/occ-worker/**/*.ts", "lib/api/**/*.ts"],
});
