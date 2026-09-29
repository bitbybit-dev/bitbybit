import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import { readKernelException } from "../../kernel-exception";
import * as Inputs from "../../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT boxes and nearest points", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const close = (values: number[], digits = 9): unknown[] => values.map(value => expect.closeTo(value, digits));
    const loose = <T>(value: unknown): T => value as T;
    const thrownBy = (action: () => unknown): InputError => {
        try {
            action();
        } catch (error) {
            expect(error).toBeInstanceOf(InputError);
            return error as InputError;
        }
        throw new Error("expected an InputError, but nothing was thrown");
    };
    const messageOf = (action: () => unknown): string => {
        try {
            action();
        } catch (error) {
            const read = readKernelException(kernel, error);
            return read instanceof Error ? read.message : String(read);
        }
        return "nothing thrown";
    };
    const tenBox = (): TopoDS_Shape => occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [5, 5, 5], originOnCenter: true });
    const meshTriangle = (): TopoDS_Shape => {
        const stl = "solid t\nfacet normal 0 0 1\nouter loop\nvertex 1 2 3\nvertex 4 2 3\nvertex 1 6 3\nendloop\nendfacet\nendsolid t\n";
        return kernel.ReadStlFromBytes(new TextEncoder().encode(stl), false);
    };
    const QUARTER_TURN_DIRECTION: Inputs.Base.Vector3 = [Math.SQRT1_2, Math.SQRT1_2, 0];

    describe("tightBoundingBox", () => {
        it("should box a ball of radius 3 at its exact size", () => {
            // Arrange
            const ball = occt.shapes.solid.createSphere({ radius: 3, center: [1, 2, 3] });

            // Act
            const box = occt.analysis.measure.tightBoundingBox({ shape: ball });

            // Assert
            expect(box.min).toEqual(close([-2, -1, 0]));
            expect(box.max).toEqual(close([4, 5, 6]));
            expect(box.center).toEqual(close([1, 2, 3]));
            expect(box.size).toEqual(close([6, 6, 6]));
        });

        it("should box a face that carries only a mesh by the mesh's nodes", () => {
            // Arrange
            const mesh = meshTriangle();

            // Act
            const box = occt.analysis.measure.tightBoundingBox({ shape: mesh });

            // Assert
            expect(box.min).toEqual(close([1, 2, 3]));
            expect(box.max).toEqual(close([4, 6, 3]));
        });

        it("should refuse a shape with nothing to bound, and a missing one", () => {
            // Arrange
            const empty = occt.shapes.compound.makeCompound({ shapes: [] });

            // Act
            const nothing = thrownBy(() => occt.analysis.measure.tightBoundingBox({ shape: empty }));
            const missing = thrownBy(() => occt.analysis.measure.tightBoundingBox({ shape: loose<TopoDS_Shape>(undefined) }));

            // Assert
            expect(nothing.message).toBe("`shape` has no geometry to bound, so it has no bounding box.");
            expect(nothing.property).toBe("shape");
            expect(missing.property).toBe("shape");
        });
    });

    describe("boundingBoxInFrame", () => {
        it("should box a 10 box seen from a frame turned 45 degrees about z", () => {
            // Arrange
            const frame: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 1, 0] };

            // Act
            const box = occt.analysis.measure.boundingBoxInFrame({ shape: tenBox(), frame });

            // Assert
            expect(box.halfSizes).toEqual(close([5 * Math.SQRT2, 5 * Math.SQRT2, 5]));
            expect(box.frame.origin).toEqual(close([5, 5, 5]));
            expect(box.frame.normal).toEqual(close([0, 0, 1]));
            expect(box.frame.direction).toEqual(close(QUARTER_TURN_DIRECTION));
        });

        it("should give the same box wherever the frame's origin is and however long its axes are", () => {
            // Arrange
            const atOrigin = occt.analysis.measure.boundingBoxInFrame({ shape: tenBox(), frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 1, 0] } });

            // Act
            const elsewhere = occt.analysis.measure.boundingBoxInFrame({ shape: tenBox(), frame: { origin: [1, 2, 3], normal: [0, 0, 7], direction: [3, 3, 5] } });

            // Assert
            expect(elsewhere.halfSizes).toEqual(close(atOrigin.halfSizes));
            expect(elsewhere.frame.origin).toEqual(close(atOrigin.frame.origin));
            expect(elsewhere.frame.direction).toEqual(close(QUARTER_TURN_DIRECTION));
        });

        it("should keep the axes of a frame lined up with the world, giving the tight box", () => {
            // Arrange
            const ball = occt.shapes.solid.createSphere({ radius: 3, center: [1, 2, 3] });

            // Act
            const box = occt.analysis.measure.boundingBoxInFrame({ shape: ball, frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } });

            // Assert
            expect(box.halfSizes).toEqual(close([3, 3, 3]));
            expect(box.frame.origin).toEqual(close([1, 2, 3]));
        });

        it("should refuse a frame that is not one, and a shape with nothing to bound", () => {
            // Act
            const noNormal = thrownBy(() => occt.analysis.measure.boundingBoxInFrame({ shape: tenBox(), frame: { origin: [0, 0, 0], normal: [0, 0, 0], direction: [1, 0, 0] } }));
            const missing = thrownBy(() => occt.analysis.measure.boundingBoxInFrame({ shape: tenBox(), frame: loose<Inputs.Base.Frame>(undefined) }));
            const nothing = thrownBy(() => occt.analysis.measure.boundingBoxInFrame({ shape: occt.shapes.compound.makeCompound({ shapes: [] }), frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } }));

            // Assert
            expect(noNormal.message).toBe("`frame` is not a frame: its `normal` has no length.");
            expect(missing.property).toBe("frame");
            expect(nothing.property).toBe("shape");
        });
    });

    describe("extrema", () => {
        it("should find a ball 4 from a box's face, each side's (u, v) as fractions of its face", () => {
            // Arrange
            const box = tenBox();
            const ball = occt.shapes.solid.createSphere({ radius: 1, center: [15, 5, 5] });

            // Act
            const pairs = occt.analysis.measure.extrema({ shapeA: box, shapeB: ball });

            // Assert
            expect(pairs).toHaveLength(1);
            const [pair] = pairs;
            expect(pair!.distance).toBeCloseTo(4, 9);
            expect(pair!.pointA).toEqual(close([10, 5, 5]));
            expect(pair!.pointB).toEqual(close([14, 5, 5]));
            expect([pair!.supportA, pair!.supportB]).toEqual([Inputs.OCCT.shapeTypeEnum.face, Inputs.OCCT.shapeTypeEnum.face]);
            expect(occt.shapes.face.getFaceCenterOfMass({ shape: occt.shapes.face.getFace({ shape: box, index: pair!.indexA }) })).toEqual(close([10, 5, 5]));
            expect(pair!.indexB).toBe(0);
            expect([pair!.uA, pair!.vA]).toEqual(close([0.5, 0.5]));
            expect([pair!.uB, pair!.vB]).toEqual(close([0.5, 0.5]));
        });

        it("should place each point on its face at the (u, v) it reports", () => {
            // Arrange
            const box = tenBox();
            const ball = occt.shapes.solid.createSphere({ radius: 1, center: [13, 2, 7] });

            // Act
            const [pair] = occt.analysis.measure.extrema({ shapeA: ball, shapeB: box });

            // Assert
            const ballFace = occt.shapes.face.getFace({ shape: ball, index: pair!.indexA });
            const boxFace = occt.shapes.face.getFace({ shape: box, index: pair!.indexB });
            expect(pair!.pointB).toEqual(close([10, 2, 7]));
            expect(occt.shapes.face.pointOnUV({ shape: ballFace, paramU: pair!.uA, paramV: pair!.vA })).toEqual(close(pair!.pointA));
            expect(occt.shapes.face.pointOnUV({ shape: boxFace, paramU: pair!.uB, paramV: pair!.vB })).toEqual(close(pair!.pointB));
        });

        it.each([
            { name: "running forward", center: [12, 12, 3] as Inputs.Base.Point3, nearest: [10, 10, 3], orientation: Inputs.OCCT.topAbsOrientationEnum.forward },
            { name: "running reversed", center: [-2, 12, 3] as Inputs.Base.Point3, nearest: [0, 10, 3], orientation: Inputs.OCCT.topAbsOrientationEnum.reversed },
        ])("should find a ball beside an edge $name nearest the edge, at a fraction along the edge as it runs", ({ center, nearest, orientation }) => {
            // Arrange
            const box = tenBox();
            const ball = occt.shapes.solid.createSphere({ radius: 1, center });

            // Act
            const [pair] = occt.analysis.measure.extrema({ shapeA: box, shapeB: ball });

            // Assert
            const edge = occt.shapes.edge.getEdge({ shape: box, index: pair!.indexA });
            const start = occt.shapes.edge.startPointOnEdge({ shape: edge });
            expect(occt.shapes.shape.getOrientation({ shape: edge })).toBe(orientation);
            expect(pair!.supportA).toBe(Inputs.OCCT.shapeTypeEnum.edge);
            expect(pair!.pointA).toEqual(close(nearest));
            expect(pair!.distance).toBeCloseTo(2 * Math.SQRT2 - 1, 9);
            expect(pair!.uA).toBeCloseTo(Math.hypot(nearest[0]! - start[0], nearest[1]! - start[1], nearest[2]! - start[2]) / 10, 9);
            expect(pair!.vA).toBe(0);
            expect(occt.shapes.edge.frameOnEdgeAtParam({ shape: edge, param: pair!.uA }).origin).toEqual(close(nearest));
        });

        it("should measure an edge given on its own at a fraction along it as it runs, the way it was turned", () => {
            // Arrange
            const line = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });
            const turned = occt.shapes.edge.reversedEdge({ shape: line });
            const vertex = occt.shapes.vertex.vertexFromPoint({ point: [3, 4, 0] });

            // Act
            const [forward] = occt.analysis.measure.extrema({ shapeA: line, shapeB: vertex });
            const [backward] = occt.analysis.measure.extrema({ shapeA: turned, shapeB: vertex });

            // Assert
            expect(forward!.pointA).toEqual(close([3, 0, 0]));
            expect([forward!.supportA, forward!.indexA, forward!.uA]).toEqual([Inputs.OCCT.shapeTypeEnum.edge, 0, expect.closeTo(0.3, 9)]);
            expect([forward!.supportB, forward!.indexB, forward!.uB, forward!.vB]).toEqual([Inputs.OCCT.shapeTypeEnum.vertex, 0, 0, 0]);
            expect(backward!.uA).toBeCloseTo(0.7, 9);
        });

        it("should report a box inside another as one pair on a vertex of the inner box, the outer's index -1", () => {
            // Arrange
            const outer = tenBox();
            const inner = occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [5, 5, 5], originOnCenter: true });

            // Act
            const pairs = occt.analysis.measure.extrema({ shapeA: outer, shapeB: inner });

            // Assert
            expect(pairs).toHaveLength(1);
            const [pair] = pairs;
            const vertex = occt.shapes.vertex.getVertices({ shape: inner })[pair!.indexB]!;
            expect(pair!.distance).toBe(0);
            expect([pair!.supportA, pair!.supportB]).toEqual([Inputs.OCCT.shapeTypeEnum.vertex, Inputs.OCCT.shapeTypeEnum.vertex]);
            expect(pair!.indexA).toBe(-1);
            expect(pair!.pointA).toEqual(close(pair!.pointB));
            expect(occt.shapes.vertex.vertexToPoint({ shape: vertex })).toEqual(close(pair!.pointB));
            expect([pair!.uA, pair!.vA, pair!.uB, pair!.vB]).toEqual([0, 0, 0, 0]);
        });

        it("should give every nearest pair between two boxes 2 apart", () => {
            // Arrange
            const left = tenBox();
            const right = occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [17, 5, 5], originOnCenter: true });

            // Act
            const pairs = occt.analysis.measure.extrema({ shapeA: left, shapeB: right });

            // Assert
            expect(pairs.length).toBeGreaterThan(1);
            pairs.forEach(pair => {
                expect(pair.distance).toBeCloseTo(2, 9);
                expect(pair.pointA[0]).toBeCloseTo(10, 9);
                expect([pair.pointB[0] - pair.pointA[0], pair.pointB[1] - pair.pointA[1], pair.pointB[2] - pair.pointA[2]]).toEqual(close([2, 0, 0]));
            });
        });

        it("should refuse missing shapes, and shapes whose distance cannot be measured", () => {
            // Arrange
            const empty = occt.shapes.compound.makeCompound({ shapes: [] });

            // Act
            const missingA = thrownBy(() => occt.analysis.measure.extrema({ shapeA: loose<TopoDS_Shape>(undefined), shapeB: tenBox() }));
            const missingB = thrownBy(() => occt.analysis.measure.extrema({ shapeA: tenBox(), shapeB: loose<TopoDS_Shape>(undefined) }));
            const unmeasurable = messageOf(() => occt.analysis.measure.extrema({ shapeA: empty, shapeB: tenBox() }));

            // Assert
            expect(missingA.property).toBe("shapeA");
            expect(missingB.property).toBe("shapeB");
            expect(unmeasurable).toBe("Standard_DomainError: ExtremaBetween: the distance could not be computed");
        });
    });
});
