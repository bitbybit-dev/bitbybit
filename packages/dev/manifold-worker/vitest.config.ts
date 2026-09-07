import { packageSuite } from "../vitest.shared";

export default packageSuite({ coverage: ["lib/manifold-worker/**/*.ts", "lib/api/**/*.ts"] });
