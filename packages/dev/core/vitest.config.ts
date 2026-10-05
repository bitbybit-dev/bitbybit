import { packageSuite } from "../vitest.shared";

export default packageSuite({
    environment: "jsdom",
    coverage: ["lib/api/bitbybit/**/*.ts"],
});
