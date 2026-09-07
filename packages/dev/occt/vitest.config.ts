import { packageSuite } from "../vitest.shared";

export default packageSuite({
    // The kernel holds global state, so each file gets its own process rather than sharing one.
    pool: "forks",
    // Building a shape through the real kernel is slower than a unit test, and the first load of
    // the wasm is slower still.
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
