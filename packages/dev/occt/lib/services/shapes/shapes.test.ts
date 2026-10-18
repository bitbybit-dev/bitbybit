import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTShapes } from "./shapes";

describe("OCCT face unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(occt);
    });

    it("should create shapes object", () => {
        const shapes = new OCCTShapes(occt, occHelper);
        expect(shapes).toBeDefined();
        expect(shapes.compound).toBeDefined();
        expect(shapes.wire).toBeDefined();
        expect(shapes.edge).toBeDefined();
        expect(shapes.face).toBeDefined();
        expect(shapes.solid).toBeDefined();
        expect(shapes.shell).toBeDefined();
        expect(shapes.shape).toBeDefined();
    });

});
