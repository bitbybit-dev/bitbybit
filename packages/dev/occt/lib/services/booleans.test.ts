import createBitbybitOcct, { BitbybitOcctModule } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTBooleans } from "./booleans";
import { OCCTSolid } from "./shapes/solid";
import { OCCTWire } from "./shapes/wire";

describe("OCCT booleans unit tests", () => {
    let occt: BitbybitOcctModule;
    let solid: OCCTSolid;
    let wire: OCCTWire;
    let booleans: OCCTBooleans;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();

        occHelper = new OccHelper(vec, s, occt);
        solid = new OCCTSolid(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
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

    it("should compute mesh mesh intersection wires of two intersecting boxes", async () => {
        const box1 = solid.createBox({ width: 2, height: 2, length: 2, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 2, height: 2, length: 2, center: [1, 1, 1] });
        const wires = booleans.meshMeshIntersectionWires({ shape1: box1, shape2: box2, precision1: 0.01, precision2: 0.01 });
        expect(wires.length).toBe(1);
        const totalLength = wires.reduce((acc, w) => acc + wire.getWireLength({ shape: w }), 0);
        expect(totalLength).toBe(6);
        box1.delete();
        box2.delete();
        wires.forEach(w => w.delete());
    });

    it("should compute mesh mesh intersection points of two intersecting boxes", async () => {
        const box1 = solid.createBox({ width: 2, height: 2, length: 2, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 2, height: 2, length: 2, center: [1, 1, 1] });
        const points = booleans.meshMeshIntersectionPoints({ shape1: box1, shape2: box2, precision1: 0.01, precision2: 0.01 });
        expect(points.length).toBe(1);
        expect(points[0].length).toBe(7);
        expect(points[0][0].length).toBe(3);
        box1.delete();
        box2.delete();
    });

    it("should return empty wires for non-intersecting boxes", async () => {
        const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [5, 5, 5] });
        const wires = booleans.meshMeshIntersectionWires({ shape1: box1, shape2: box2, precision1: 0.01, precision2: 0.01 });
        expect(wires.length).toBe(0);
        box1.delete();
        box2.delete();
    });

    it("should return empty points for non-intersecting boxes", async () => {
        const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [5, 5, 5] });
        const points = booleans.meshMeshIntersectionPoints({ shape1: box1, shape2: box2, precision1: 0.01, precision2: 0.01 });
        expect(points.length).toBe(0);
        box1.delete();
        box2.delete();
    });

    it("should compute mesh mesh intersection of shapes wires", async () => {
        const box1 = solid.createBox({ width: 2, height: 2, length: 2, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 2, height: 2, length: 2, center: [1, 1, 1] });
        const box3 = solid.createBox({ width: 2, height: 2, length: 2, center: [-1, -1, -1] });
        const wires = booleans.meshMeshIntersectionOfShapesWires({ shape: box1, shapes: [box2, box3], precision: 0.01 });
        expect(wires.length).toBe(2);
        const totalLength = wires.reduce((acc, w) => acc + wire.getWireLength({ shape: w }), 0);
        expect(totalLength).toBe(12);
        box1.delete();
        box2.delete();
        box3.delete();
        wires.forEach(w => w.delete());
    });

    it("should compute mesh mesh intersection of shapes points", async () => {
        const box1 = solid.createBox({ width: 2, height: 2, length: 2, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 2, height: 2, length: 2, center: [1, 1, 1] });
        const box3 = solid.createBox({ width: 2, height: 2, length: 2, center: [-1, -1, -1] });
        const points = booleans.meshMeshIntersectionOfShapesPoints({ shape: box1, shapes: [box2, box3], precision: 0.01 });
        expect(points.length).toBe(2);
        expect(points[0].length).toBe(7);
        expect(points[0][0].length).toBe(3);
        box1.delete();
        box2.delete();
        box3.delete();
    });

    it("should compute mesh mesh intersection of shapes with custom precisions", async () => {
        const box1 = solid.createBox({ width: 2, height: 2, length: 2, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 2, height: 2, length: 2, center: [1, 1, 1] });
        const box3 = solid.createBox({ width: 2, height: 2, length: 2, center: [-1, -1, -1] });
        const wires = booleans.meshMeshIntersectionOfShapesWires({ shape: box1, shapes: [box2, box3], precision: 0.05, precisionShapes: [0.02, 0.03] });
        expect(wires.length).toBe(2);
        box1.delete();
        box2.delete();
        box3.delete();
        wires.forEach(w => w.delete());
    });

    it("should return empty wires for mesh mesh intersection of shapes with no intersections", async () => {
        const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [10, 10, 10] });
        const box3 = solid.createBox({ width: 1, height: 1, length: 1, center: [-10, -10, -10] });
        const wires = booleans.meshMeshIntersectionOfShapesWires({ shape: box1, shapes: [box2, box3], precision: 0.01 });
        expect(wires.length).toBe(0);
        box1.delete();
        box2.delete();
        box3.delete();
    });

    it("should compute mesh mesh intersection with sphere and box", async () => {
        const sphere = solid.createSphere({ radius: 1, center: [0, 0, 0] });
        const box = solid.createBox({ width: 1, height: 1, length: 1, center: [0.5, 0.5, 0.5] });
        const wires = booleans.meshMeshIntersectionWires({ shape1: sphere, shape2: box, precision1: 0.01, precision2: 0.01 });
        expect(wires.length).toBe(12);
        const points = booleans.meshMeshIntersectionPoints({ shape1: sphere, shape2: box, precision1: 0.01, precision2: 0.01 });
        expect(points.length).toBe(12);
        sphere.delete();
        box.delete();
        wires.forEach(w => w.delete());
    });

});


