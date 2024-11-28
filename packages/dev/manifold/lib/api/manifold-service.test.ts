// import Module from "manifold-3d";
import { ManifoldService } from "./manifold-service";

// TODO - if possible, configure to run manifold against actual Module (could be useful to find degradations in expectations), otherwise let's just use mocks
describe("Manifold unit tests", () => {
    let manifold: ManifoldService;
    beforeAll(async () => {
        // const wasm = await Module();
        // wasm.setup();
        manifold = new ManifoldService({} as any);
    });

    it("should create manifold instance", () => {
        expect(manifold).toBeDefined();
    });

});
