import { packageSuite } from "../vitest.shared";

export default packageSuite({
    coverage: ["lib/api/**/*.ts"],
    setupFiles: ["lib/api/__test__/kernel-ledger.setup.ts"],
});
