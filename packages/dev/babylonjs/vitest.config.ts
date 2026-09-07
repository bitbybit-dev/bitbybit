import { packageSuite } from "../vitest.shared";

export default packageSuite({
    // lib/api is the API surface. lib/gui-enriched-babylon.ts is deliberately outside it: it is a
    // re-export shim over @babylonjs/gui with no logic of its own.
    coverage: ["lib/api/**/*.ts"],
    environment: "jsdom",
    siblingsFromDist: ["base", "core", "jscad", "manifold", "jscad-worker", "manifold-worker", "occt-worker"],
});
