import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTBooleans } from "./booleans";
import { OCCTSolid } from "./shapes/solid";
import { OCCTWire } from "./shapes/wire";
import * as Inputs from "../api/inputs";

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

    it("should compute difference of two boxes", () => {
        const box1 = solid.createBox({ width: 1, height: 2, length: 1, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 0.3, height: 0.5, length: 3, center: [0.5, 0.5, 0.5] });
        const result = booleans.difference({ shape: box1, shapes: [box2], keepEdges: false });
        const volume = solid.getSolidVolume({ shape: result });
        expect(volume).toBeCloseTo(1.925);
    });

    it("should compute union of two boxes", () => {
        const box1 = solid.createBox({ width: 1, height: 2, length: 1, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 0.3, height: 0.5, length: 3, center: [0.5, 0.5, 0.5] });
        const result = booleans.union({ shapes: [box1, box2], keepEdges: false });
        const volume = solid.getSolidVolume({ shape: result });
        expect(volume).toBeCloseTo(2.375);
    });

    it("should compute intersection of two boxes", () => {
        const box1 = solid.createBox({ width: 1, height: 2, length: 1, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 0.3, height: 0.5, length: 3, center: [0.5, 0.5, 0.5] });
        const result = booleans.intersection({ shapes: [box1, box2], keepEdges: false });
        const volume = solid.getSolidVolume({ shape: result });
        expect(volume).toBeCloseTo(0.075);
    });

    it.each([
        ["difference", () => booleans.difference({ shape: solid.createBox({ width: 1, height: 2, length: 1, center: [0, 0, 0] }), shapes: [], keepEdges: false }), "`shapes` is empty, so there is nothing to subtract from `shape`."],
        ["union", () => booleans.union({ shapes: [], keepEdges: false }), "`shapes` is empty, so there is nothing to join."],
    ] as [string, () => unknown, string][])("should refuse a %s of an empty list, naming the input", (_what, act, message) => {
        // Act
        let refusal: unknown;
        try {
            act();
        } catch (failure) {
            refusal = failure;
        }

        // Assert
        expect(refusal).toMatchObject({ name: "InputError", property: "shapes", message });
    });

    it("should give back the one solid a difference leaves, not a compound holding it", () => {
        // Arrange
        const box = solid.createBox({ width: 4, height: 4, length: 4, center: [0, 0, 0] });
        const corner = solid.createBox({ width: 2, height: 2, length: 2, center: [2, 2, 2] });

        // Act
        const result = booleans.difference({ shape: box, shapes: [corner], keepEdges: false });

        // Assert
        expect(result.ShapeType()).toBe(occt.TopAbs_ShapeEnum.SOLID);
    });

    it("should release the compound it takes the one solid out of", () => {
        // Arrange
        const box = solid.createBox({ width: 4, height: 4, length: 4, center: [0, 0, 0] });
        const corner = solid.createBox({ width: 2, height: 2, length: 2, center: [2, 2, 2] });
        const cut: TopoDS_Shape[] = [];
        const cutTypes: unknown[] = [];
        const original: unknown = Reflect.get(occt, "BooleanCut");
        const booleanCut = occt.BooleanCut.bind(occt);
        Reflect.set(occt, "BooleanCut", (...args: Parameters<typeof occt.BooleanCut>): ReturnType<typeof occt.BooleanCut> => {
            const answer = booleanCut(...args);
            if (answer.shape !== null) {
                cut.push(answer.shape);
                cutTypes.push(answer.shape.ShapeType());
            }
            return answer;
        });

        // Act
        let result: TopoDS_Shape | undefined;
        try {
            result = booleans.difference({ shape: box, shapes: [corner], keepEdges: false });
        } finally {
            Reflect.set(occt, "BooleanCut", original);
        }

        // Assert
        expect(result.ShapeType()).toBe(occt.TopAbs_ShapeEnum.SOLID);
        expect(cutTypes).toEqual([occt.TopAbs_ShapeEnum.COMPOUND]);
        expect(cut.map(shape => shape.isDeleted())).toEqual([true]);
    });

    it("should keep a compound when a difference leaves two solids", () => {
        // Arrange
        const bar = solid.createBox({ width: 6, height: 1, length: 1, center: [0, 0, 0] });
        const middle = solid.createBox({ width: 1, height: 2, length: 2, center: [0, 0, 0] });

        // Act
        const result = booleans.difference({ shape: bar, shapes: [middle], keepEdges: false });

        // Assert
        expect([result.ShapeType(), occt.SolidsOf(result, false).length]).toEqual([occt.TopAbs_ShapeEnum.COMPOUND, 2]);
    });

    it("should compute mesh mesh intersection wires of two intersecting boxes", () => {
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

    it("should compute mesh mesh intersection points of two intersecting boxes", () => {
        const box1 = solid.createBox({ width: 2, height: 2, length: 2, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 2, height: 2, length: 2, center: [1, 1, 1] });
        const points = booleans.meshMeshIntersectionPoints({ shape1: box1, shape2: box2, precision1: 0.01, precision2: 0.01 });
        expect(points.length).toBe(1);
        expect(points[0]!.length).toBe(7);
        expect(points[0]![0]!.length).toBe(3);
        box1.delete();
        box2.delete();
    });

    it("should return empty wires for non-intersecting boxes", () => {
        const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [5, 5, 5] });
        const wires = booleans.meshMeshIntersectionWires({ shape1: box1, shape2: box2, precision1: 0.01, precision2: 0.01 });
        expect(wires.length).toBe(0);
        box1.delete();
        box2.delete();
    });

    it("should return empty points for non-intersecting boxes", () => {
        const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [5, 5, 5] });
        const points = booleans.meshMeshIntersectionPoints({ shape1: box1, shape2: box2, precision1: 0.01, precision2: 0.01 });
        expect(points.length).toBe(0);
        box1.delete();
        box2.delete();
    });

    it("should compute mesh mesh intersection of shapes wires", () => {
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

    it("should compute mesh mesh intersection of shapes points", () => {
        const box1 = solid.createBox({ width: 2, height: 2, length: 2, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 2, height: 2, length: 2, center: [1, 1, 1] });
        const box3 = solid.createBox({ width: 2, height: 2, length: 2, center: [-1, -1, -1] });
        const points = booleans.meshMeshIntersectionOfShapesPoints({ shape: box1, shapes: [box2, box3], precision: 0.01 });
        expect(points.length).toBe(2);
        expect(points[0]!.length).toBe(7);
        expect(points[0]![0]!.length).toBe(3);
        box1.delete();
        box2.delete();
        box3.delete();
    });

    it("should compute mesh mesh intersection of shapes with custom precisions", () => {
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

    it("should return empty wires for mesh mesh intersection of shapes with no intersections", () => {
        const box1 = solid.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
        const box2 = solid.createBox({ width: 1, height: 1, length: 1, center: [10, 10, 10] });
        const box3 = solid.createBox({ width: 1, height: 1, length: 1, center: [-10, -10, -10] });
        const wires = booleans.meshMeshIntersectionOfShapesWires({ shape: box1, shapes: [box2, box3], precision: 0.01 });
        expect(wires.length).toBe(0);
        box1.delete();
        box2.delete();
        box3.delete();
    });

    it("should compute mesh mesh intersection with sphere and box", () => {
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

    describe("strategies", () => {
        const midpoints = (shape: TopoDS_Shape): Inputs.Base.Point3[] =>
            occHelper.shapeGettersService.getEdges({ shape }).map(edge => occHelper.edgesService.pointOnEdgeAtParam({ shape: edge, param: 0.5 }).map(value => Math.round(value * 1e6) / 1e6) as Inputs.Base.Point3);

        it("should fuse shapes apart from each other in one step in groups, numbering them as all at once does", () => {
            // Arrange
            const block = solid.createBox({ width: 50, height: 10, length: 10, center: [25, 5, 5] });
            const pegs = [0, 1, 2, 3, 4].map(step => solid.createCylinder({ radius: 2, height: 12, center: [5 + 10 * step, 5, 5], direction: [0, 0, 1] }));
            const fuse = (strategy: Inputs.OCCT.booleanStrategyEnum): TopoDS_Shape => booleans.union({ shapes: [block, ...pegs], keepEdges: true, strategy });

            // Act
            const oneByOne = fuse(Inputs.OCCT.booleanStrategyEnum.oneAfterAnother);
            const grouped = fuse(Inputs.OCCT.booleanStrategyEnum.inGroups);
            const allAtOnce = fuse(Inputs.OCCT.booleanStrategyEnum.allAtOnce);

            // Assert
            expect(solid.getSolidVolume({ shape: grouped })).toBeCloseTo(solid.getSolidVolume({ shape: oneByOne }), 6);
            expect(midpoints(grouped)).toEqual(midpoints(allAtOnce));
            expect(midpoints(grouped)).not.toEqual(midpoints(oneByOne));
        });

        it("should cut tools that touch each other at one point right in groups", () => {
            // Arrange
            const cube = solid.createCube({ size: 6, center: [0, 0, 0], originOnCenter: true });
            const centres: Inputs.Base.Point3[] = [[0, 2.1, 0], [0, -2.1, 0], [2.1, 0, 0], [-2.1, 0, 0], [0, 0, -2.1], [0, 0, 2.1]];
            const spheres = centres.map(center => solid.createSphere({ radius: 2.1, center }));

            // Act
            const cut = booleans.difference({ shape: cube, shapes: spheres, keepEdges: true, strategy: Inputs.OCCT.booleanStrategyEnum.inGroups });

            // Assert
            expect(solid.getSolidVolume({ shape: cut })).toBeCloseTo(76.2286, 3);
        });
    });

});
