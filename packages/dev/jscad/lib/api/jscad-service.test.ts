import { Jscad } from "./jscad-service";

describe("Jscad unit tests", () => {
    let jscad: Jscad;
    beforeAll(async () => {
        const s = await import("../../jscad-generated");
        jscad = new Jscad(s.default());
    });

    it("should create jscad instance", () => {
        expect(jscad).toBeDefined();
    });

    it("should create booleans service", () => {
        expect(jscad.booleans).toBeDefined();
    });
});
