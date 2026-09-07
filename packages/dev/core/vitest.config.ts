import { packageSuite } from "../vitest.shared";

export default packageSuite({
    // The tag service writes into the page, so these suites need a document.
    environment: "jsdom",
    coverage: ["lib/workers/**/*.ts", "lib/api/bitbybit/**/*.ts"],
});
