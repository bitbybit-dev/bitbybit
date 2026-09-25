import { packageSuite } from "../vitest.shared";

export default packageSuite({ coverage: ["lib/api/services/**/*.ts", "lib/api/kernel-calls/**/*.ts"] });
