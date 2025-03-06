import initOpenCascade, { OpenCascadeInstance } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTBooleans } from "./booleans";
import { OCCTSolid } from "./shapes/solid";

describe("OCCT booleans unit tests", () => {
    let occt: OpenCascadeInstance;
    let solid: OCCTSolid;
    let booleans: OCCTBooleans;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();

        occHelper = new OccHelper(vec, s, occt);
        solid = new OCCTSolid(occt, occHelper);
        booleans = new OCCTBooleans(occt, occHelper);
    });

    it("should compute difference of two boxes", async () => {
        const box1 = solid.createBox({ width: 1, height: 2, length: 1, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 0.3, height: 0.5, length: 3, center: [0.5, 0.5, 0.5] });
        const result = booleans.difference({ shape: box1, shapes: [box2], keepEdges: false });
        const volume = solid.getSolidVolume({ shape: result });
        expect(volume).toBeCloseTo(1.925);
    });

    it("should compute union of two boxes", async () => {
        const box1 = solid.createBox({ width: 1, height: 2, length: 1, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 0.3, height: 0.5, length: 3, center: [0.5, 0.5, 0.5] });
        const result = booleans.union({ shapes: [box1, box2], keepEdges: false });
        const volume = solid.getSolidVolume({ shape: result });
        expect(volume).toBeCloseTo(2.375);
    });

    it("should compute intersection of two boxes", async () => {
        const box1 = solid.createBox({ width: 1, height: 2, length: 1, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 0.3, height: 0.5, length: 3, center: [0.5, 0.5, 0.5] });
        const result = booleans.intersection({ shapes: [box1, box2], keepEdges: false });
        const volume = solid.getSolidVolume({ shape: result });
        expect(volume).toBeCloseTo(0.075);
    });

    it("should not compute difference if shapes are empty", async () => {
        const box1 = solid.createBox({ width: 1, height: 2, length: 1, center: [0, 0, 0] });
        expect(() => booleans.difference({ shape: box1, shapes: [], keepEdges: false })).toThrowError("Shape is not a compound or is null.");
    });

});

