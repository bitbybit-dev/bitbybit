import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { readKernelException } from "../../kernel-exception";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import { uvFractions } from "../base/surface-analysis";
import * as Inputs from "../../api/inputs";

describe("OCCT curve analysis: kinks, extremes and intersections", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const close = (values: readonly number[], digits = 9): unknown[] => values.map(value => expect.closeTo(value, digits));
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
    const polyline = (points: Inputs.Base.Point3[]): TopoDS_Shape => occt.shapes.wire.createPolylineWire({ points });
    const closedSquare = (): TopoDS_Shape => occt.shapes.wire.createPolygonWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]] });
    const segment = (start: Inputs.Base.Point3, end: Inputs.Base.Point3): TopoDS_Shape => occt.shapes.edge.line({ start, end });
    const cylinderWall = (): TopoDS_Face => {
        const cylinder = occt.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 0, 1] });
        const [wall] = occt.select.faces.ofType({ shape: cylinder, type: Inputs.OCCT.surfaceTypeEnum.cylinder });
        return occt.shapes.face.getFace({ shape: cylinder, index: wall! });
    };

    describe("kinks", () => {
        it("should find the four corners of a closed square, the closing one first, each on the edge ending there", () => {
            // Arrange
            const square = closedSquare();

            // Act
            const kinks = occt.analysis.curves.kinks({ shape: square, angle: 1 });

            // Assert
            expect(kinks.map(kink => kink.point)).toEqual([close([0, 0, 0]), close([10, 0, 0]), close([10, 10, 0]), close([0, 10, 0])]);
            expect(kinks.map(kink => kink.edgeIndex)).toEqual([3, 0, 1, 2]);
            kinks.forEach(kink => expect(kink.angle).toBeCloseTo(90, 9));
        });

        it("should find only the inner corners of an open wire", () => {
            // Arrange
            const open = polyline([[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]]);

            // Act
            const kinks = occt.analysis.curves.kinks({ shape: open });

            // Assert
            expect(kinks.map(kink => kink.point)).toEqual([close([10, 0, 0]), close([10, 10, 0])]);
            expect(kinks.map(kink => kink.edgeIndex)).toEqual([0, 1]);
        });

        it("should count a turn as a kink only when it is sharper than the angle in degrees", () => {
            // Arrange
            const turn = (30 * Math.PI) / 180;
            const bent = polyline([[0, 0, 0], [10, 0, 0], [10 + 10 * Math.cos(turn), 10 * Math.sin(turn), 0]]);

            // Act
            const sharper = occt.analysis.curves.kinks({ shape: bent, angle: 29 });
            const gentler = occt.analysis.curves.kinks({ shape: bent, angle: 31 });

            // Assert
            expect(sharper).toHaveLength(1);
            expect(sharper[0]!.angle).toBeCloseTo(30, 9);
            expect(gentler).toEqual([]);
        });

        it("should find no kink where two arcs join smoothly", () => {
            // Arrange
            const first = occt.shapes.edge.arcThroughThreePoints({ start: [0, 0, 0], middle: [5, 5, 0], end: [10, 0, 0] });
            const second = occt.shapes.edge.arcThroughThreePoints({ start: [10, 0, 0], middle: [15, -5, 0], end: [20, 0, 0] });
            const wave = occt.shapes.wire.combineEdgesAndWiresIntoAWire({ shapes: [first, second] });

            // Act
            const kinks = occt.analysis.curves.kinks({ shape: wave, angle: 1 });

            // Assert
            expect(kinks).toEqual([]);
        });

        it("should number edges as getEdgesAlongWire lists them on a wire that passes its seam twice and holds a degenerated edge", () => {
            // Arrange
            const cone = occt.shapes.solid.createCone({ radius1: 2, radius2: 0, height: 5, angle: 360, center: [0, 0, 0], direction: [0, 0, 1] });
            const [side] = occt.select.faces.ofType({ shape: cone, type: Inputs.OCCT.surfaceTypeEnum.cone });
            const wire = occt.shapes.wire.getWires({ shape: occt.shapes.face.getFace({ shape: cone, index: side! }) })[0]!;
            const edges = occt.shapes.edge.getEdgesAlongWire({ shape: wire });

            // Act
            const kinks = occt.analysis.curves.kinks({ shape: wire, angle: 1 });

            // Assert
            expect(edges).toHaveLength(3);
            expect(kinks.map(kink => kink.point)).toEqual([close([0, 0, 5]), close([2, 0, 0]), close([2, 0, 0])]);
            expect(kinks[0]!.angle).toBeCloseTo(180, 9);
            kinks.forEach(kink => {
                expect(kernel.BRep_Tool_Degenerated(edges[kink.edgeIndex]!)).toBe(false);
                expect(occt.operations.distancesToShapeFromPoints({ shape: edges[kink.edgeIndex]!, points: [kink.point] })[0]).toBeCloseTo(0, 9);
            });
        });

        it("should refuse an angle past a half turn", () => {
            // Arrange
            const square = closedSquare();

            // Act
            const error = thrownBy(() => occt.analysis.curves.kinks({ shape: square, angle: 200 }));

            // Assert
            expect(error.message).toBe("`angle` must be a finite number from 0 to 180; it is 200.");
        });
    });

    describe("extremesAlong", () => {
        it("should find a roof's ridge as the global maximum and its two ends as tied global minima, up along Y by default", () => {
            // Arrange
            const roof = polyline([[0, 0, 0], [5, 5, 0], [10, 0, 0]]);

            // Act
            const extremes = occt.analysis.curves.extremesAlong({ shape: roof });

            // Assert
            expect(extremes.map(extreme => extreme.point)).toEqual([close([0, 0, 0]), close([5, 5, 0]), close([10, 0, 0])]);
            expect(extremes.map(extreme => [extreme.param, extreme.length, extreme.height])).toEqual([close([0, 0, 0]), close([0.5, 5 * Math.SQRT2, 5]), close([1, 10 * Math.SQRT2, 0])]);
            expect(extremes.map(extreme => [extreme.isMaximum, extreme.isGlobal])).toEqual([[false, true], [true, true], [false, true]]);
        });

        it("should find the top and the bottom of a circle, at parameters that sample back to them", () => {
            // Arrange
            const circle = occt.shapes.edge.createCircleEdge({ radius: 5, center: [0, 0, 0], direction: [0, 0, 1] });

            // Act
            const extremes = occt.analysis.curves.extremesAlong({ shape: circle, direction: [0, 1, 0] });

            // Assert
            const top = extremes.find(extreme => extreme.isMaximum)!;
            const bottom = extremes.find(extreme => !extreme.isMaximum)!;
            expect(extremes).toHaveLength(2);
            expect([top.point, bottom.point]).toEqual([close([0, 5, 0]), close([0, -5, 0])]);
            expect([top.height, bottom.height, top.isGlobal, bottom.isGlobal]).toEqual([expect.closeTo(5, 9), expect.closeTo(-5, 9), true, true]);
            expect(occt.shapes.edge.pointOnEdgeAtParam({ shape: circle, param: top.param })).toEqual(close([0, 5, 0]));
            expect(top.length).toBeCloseTo(top.param * 10 * Math.PI, 9);
        });

        it("should measure heights along the unit direction and turn highs into lows when it is reversed", () => {
            // Arrange
            const roof = polyline([[0, 0, 0], [5, 5, 0], [10, 0, 0]]);

            // Act
            const longUp = occt.analysis.curves.extremesAlong({ shape: roof, direction: [0, 3, 0] });
            const down = occt.analysis.curves.extremesAlong({ shape: roof, direction: [0, -1, 0] });

            // Assert
            expect(longUp.map(extreme => extreme.height)).toEqual(close([0, 5, 0]));
            expect(down.map(extreme => [extreme.isMaximum, extreme.height])).toEqual([[true, expect.closeTo(0, 9)], [false, expect.closeTo(-5, 9)], [true, expect.closeTo(0, 9)]]);
        });

        it("should refuse a direction that points nowhere", () => {
            // Arrange
            const roof = polyline([[0, 0, 0], [5, 5, 0], [10, 0, 0]]);

            // Act
            const error = thrownBy(() => occt.analysis.curves.extremesAlong({ shape: roof, direction: [0, 0, 0] }));

            // Assert
            expect(error.message).toBe("`direction` is [0, 0, 0], which points nowhere.");
        });
    });

    describe("intersectCurves", () => {
        it("should find where two diagonals cross, half way along each", () => {
            // Arrange
            const first = segment([0, 0, 0], [10, 10, 0]);
            const second = segment([0, 10, 0], [10, 0, 0]);

            // Act
            const crossings = occt.analysis.curves.intersectCurves({ shapeA: first, shapeB: second });

            // Assert
            expect(crossings).toEqual([{ point: close([5, 5, 0]), paramA: expect.closeTo(0.5, 9), paramB: expect.closeTo(0.5, 9), edgeIndexA: 0, edgeIndexB: 0, isOverlap: false }]);
        });

        it("should find where a segment crosses a closed square, in order along the square with the square's edges", () => {
            // Arrange
            const square = closedSquare();
            const upright = segment([5, -5, 0], [5, 15, 0]);

            // Act
            const crossings = occt.analysis.curves.intersectCurves({ shapeA: square, shapeB: upright, tolerance: 1e-7 });

            // Assert
            expect(crossings.map(crossing => crossing.point)).toEqual([close([5, 0, 0]), close([5, 10, 0])]);
            expect(crossings.map(crossing => [crossing.paramA, crossing.paramB])).toEqual([close([0.125, 0.25]), close([0.625, 0.75])]);
            expect(crossings.map(crossing => [crossing.edgeIndexA, crossing.edgeIndexB])).toEqual([[0, 0], [2, 0]]);
        });

        it("should give the two ends of a stretch where the curves run together, marked as overlaps", () => {
            // Arrange
            const first = segment([0, 0, 0], [10, 0, 0]);
            const second = segment([5, 0, 0], [15, 0, 0]);

            // Act
            const crossings = occt.analysis.curves.intersectCurves({ shapeA: first, shapeB: second });

            // Assert
            expect(crossings.map(crossing => crossing.point)).toEqual([close([5, 0, 0]), close([10, 0, 0])]);
            expect(crossings.map(crossing => [crossing.paramA, crossing.paramB])).toEqual([close([0.5, 0]), close([1, 0.5])]);
            expect(crossings.every(crossing => crossing.isOverlap)).toBe(true);
        });

        it("should find nothing between parallel segments and count a near miss as meeting only within the tolerance", () => {
            // Arrange
            const first = segment([0, 0, 0], [10, 0, 0]);
            const parallel = segment([0, 1, 0], [10, 1, 0]);
            const passingAbove = segment([5, -5, 0.01], [5, 5, 0.01]);

            // Act
            const none = occt.analysis.curves.intersectCurves({ shapeA: first, shapeB: parallel });
            const strict = occt.analysis.curves.intersectCurves({ shapeA: first, shapeB: passingAbove, tolerance: 1e-7 });
            const fuzzy = occt.analysis.curves.intersectCurves({ shapeA: first, shapeB: passingAbove, tolerance: 0.1 });

            // Assert
            expect(none).toEqual([]);
            expect(strict).toEqual([]);
            expect(fuzzy).toHaveLength(1);
            expect([fuzzy[0]!.paramA, fuzzy[0]!.paramB]).toEqual(close([0.5, 0.5], 3));
        });

        it("should refuse a negative tolerance and a missing second curve", () => {
            // Arrange
            const first = segment([0, 0, 0], [10, 0, 0]);

            // Act
            const negative = thrownBy(() => occt.analysis.curves.intersectCurves({ shapeA: first, shapeB: first, tolerance: -1 }));
            const missing = thrownBy(() => occt.analysis.curves.intersectCurves({ shapeA: first, shapeB: loose(undefined) }));

            // Assert
            expect(negative.message).toBe("`tolerance` must be a finite number 0 or more; it is -1.");
            expect(missing.message).toBe("`shapeB` is missing or empty, as an operation that failed can leave it.");
        });
    });

    describe("intersectCurveWithFace", () => {
        it("should find where a segment passes through a flat face, with its u and v as pointOnUV takes them", () => {
            // Arrange
            const floor = occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
            const upright = segment([1, -5, 2], [1, 5, 2]);

            // Act
            const hits = occt.analysis.curves.intersectCurveWithFace({ shape: upright, face: floor });

            // Assert
            expect(hits).toHaveLength(1);
            expect(hits[0]!.point).toEqual(close([1, 0, 2]));
            expect([hits[0]!.param, hits[0]!.edgeIndex]).toEqual([expect.closeTo(0.5, 9), 0]);
            expect(hits[0]!.isOverlap).toBe(false);
            expect(occt.shapes.face.pointOnUV({ shape: floor, paramU: hits[0]!.u, paramV: hits[0]!.v })).toEqual(close([1, 0, 2]));
        });

        it("should find nothing where the segment passes the surface beyond the face's edges", () => {
            // Arrange
            const floor = occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
            const beside = segment([7, -5, 2], [7, 5, 2]);

            // Act
            const hits = occt.analysis.curves.intersectCurveWithFace({ shape: beside, face: floor });

            // Assert
            expect(hits).toEqual([]);
        });

        it("should give the ends of a stretch lying on the face, marked as overlaps", () => {
            // Arrange
            const floor = occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
            const lying = segment([-2, 0, 1], [2, 0, 1]);

            // Act
            const hits = occt.analysis.curves.intersectCurveWithFace({ shape: lying, face: floor, tolerance: 1e-7 });

            // Assert
            expect(hits.map(hit => hit.param)).toEqual(close([0, 1]));
            expect(hits.every(hit => hit.isOverlap)).toBe(true);
        });

        it("should find both crossings of a cylinder wall, their u and v fractions inside the face's bounds", () => {
            // Arrange
            const wall = cylinderWall();
            const across = segment([-5, 0.5, 2.5], [5, 0.5, 2.5]);
            const x = Math.sqrt(4 - 0.25);

            // Act
            const hits = occt.analysis.curves.intersectCurveWithFace({ shape: across, face: wall });

            // Assert
            expect(hits.map(hit => hit.point)).toEqual([close([-x, 0.5, 2.5]), close([x, 0.5, 2.5])]);
            expect(hits.map(hit => hit.param)).toEqual(close([(5 - x) / 10, (5 + x) / 10]));
            hits.forEach(hit => {
                expect(hit.u).toBeGreaterThanOrEqual(0);
                expect(hit.u).toBeLessThanOrEqual(1);
                expect(hit.v).toBeCloseTo(0.5, 9);
                expect(occt.shapes.face.pointOnUV({ shape: wall, paramU: hit.u, paramV: hit.v })).toEqual(close(hit.point));
            });
        });

        it("should bring a periodic surface's u a whole number of turns outside the face's range back into it", () => {
            // Arrange
            const wall = cylinderWall();
            const bounds = { uMin: 0, uMax: 2 * Math.PI, vMin: 0, vMax: 5 };
            const floor = occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const onWall = uvFractions(kernel, wall, bounds);
            const onFloor = uvFractions(kernel, floor, { uMin: -5, uMax: 5, vMin: -5, vMax: 5 });

            // Assert
            expect(onWall(0.5 - 2 * Math.PI, 2.5)).toEqual(close([0.5 / (2 * Math.PI), 0.5]));
            expect(onWall(0.5 + 4 * Math.PI, 2.5)).toEqual(close([0.5 / (2 * Math.PI), 0.5]));
            expect(onWall(2 * Math.PI, 5)).toEqual(close([1, 1]));
            expect(onFloor(-10, 5)).toEqual(close([-0.5, 1]));
        });

        it("should refuse a missing face and a shape that is not a face", () => {
            // Arrange
            const upright = segment([1, -5, 2], [1, 5, 2]);
            const box = occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0], originOnCenter: true });

            // Act
            const missing = thrownBy(() => occt.analysis.curves.intersectCurveWithFace({ shape: upright, face: loose(undefined) }));
            const solid = messageOf(() => occt.analysis.curves.intersectCurveWithFace({ shape: upright, face: loose(box) }));

            // Assert
            expect(missing.message).toBe("`face` is missing or empty, as an operation that failed can leave it.");
            expect(solid).toBe("Standard_DomainError: IntersectCurveWithFace: the second shape is not a face");
        });
    });
});
