import { packageSuite } from "../vitest.shared";

export default packageSuite({
    // The tag service writes into the page, so these suites need a document.
    environment: "jsdom",
    // lib/api/bitbybit is the API surface. lib/asset-manager.ts is deliberately outside it: its own
    // suite drives it through the API class rather than directly.
    coverage: ["lib/api/bitbybit/**/*.ts"],
});
