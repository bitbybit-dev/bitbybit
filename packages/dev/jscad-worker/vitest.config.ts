import { packageSuite } from "../vitest.shared";

export default packageSuite({ coverage: ["lib/jscad-worker/**/*.ts", "lib/api/**/*.ts"] });
