import { packageSuite } from "../vitest.shared";

export default packageSuite({
    coverage: ["lib/api/**/*.ts"],
    environment: "jsdom",
    siblingsFromDist: ["base", "core", "jscad", "manifold", "jscad-worker", "manifold-worker", "occt-worker"],
});
