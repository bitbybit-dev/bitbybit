import { packageSuite } from "../vitest.shared";

export default packageSuite({ coverage: ["lib/ifc-worker/**/*.ts", "lib/api/**/*.ts"] });
