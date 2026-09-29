import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { readKernelException } from "../../kernel-exception";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";

describe("OCCT curve analysis: closest points, curvature and curve kinds", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const close = (values: readonly number[], digits = 9): unknown[] => values.map(value => expect.closeTo(value, digits));
    const distance = (a: Inputs.Base.Point3, b: Inputs.Base.Point3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const dot = (a: Inputs.Base.Vector3, b: Inputs.Base.Vector3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
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
    const openSquare = (): TopoDS_Shape => occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]] });
    const circleOfRadius = (radius: number): TopoDS_Shape => occt.shapes.edge.createCircleEdge({ radius, center: [0, 0, 0], direction: [0, 0, 1] });
    const segment = (start: Inputs.Base.Point3, end: Inputs.Base.Point3): TopoDS_Shape => occt.shapes.edge.line({ start, end });
    const lateralWireOf = (solid: TopoDS_Shape, type: Inputs.OCCT.surfaceTypeEnum): TopoDS_Shape => {
        const [side] = occt.select.faces.ofType({ shape: solid, type });
        return occt.shapes.wire.getWires({ shape: occt.shapes.face.getFace({ shape: solid, index: side! }) })[0]!;
    };

    describe("closestPoints", () => {
        it("should find the nearest point of an open square with its parameter, length, distance and edge", () => {
            // Arrange
            const wire = openSquare();

            // Act
            const [beside, beforeStart, pastCorner] = occt.analysis.curves.closestPoints({ shape: wire, points: [[12, 5, 0], [-3, -4, 0], [12, -2, 0]] });

            // Assert
            expect(beside!.point).toEqual(close([10, 5, 0]));
            expect([beside!.param, beside!.length, beside!.distance, beside!.edgeIndex]).toEqual(close([0.5, 15, 2, 1]));
            expect(beforeStart!.point).toEqual(close([0, 0, 0]));
            expect([beforeStart!.param, beforeStart!.length, beforeStart!.distance, beforeStart!.edgeIndex]).toEqual(close([0, 0, 5, 0]));
            expect(pastCorner!.point).toEqual(close([10, 0, 0]));
            expect([pastCorner!.param, pastCorner!.length, pastCorner!.distance, pastCorner!.edgeIndex]).toEqual(close([1 / 3, 10, Math.SQRT2 * 2, 1]));
        });

        it("should give a parameter that pointOnWireAtParam and a length that pointOnWireAtLength turn back into the point", () => {
            // Arrange
            const spline = occt.shapes.wire.interpolatePoints({ points: [[0, 0, 0], [3, 2, 0], [6, -1, 1], [9, 1, 0]], periodic: false, tolerance: 1e-7 });

            // Act
            const [nearest] = occt.analysis.curves.closestPoints({ shape: spline, points: [[4, 3, 0]] });

            // Assert
            expect(occt.shapes.wire.pointOnWireAtParam({ shape: spline, param: nearest!.param })).toEqual(close(nearest!.point, 7));
            expect(occt.shapes.wire.pointOnWireAtLength({ shape: spline, length: nearest!.length })).toEqual(close(nearest!.point, 6));
            expect(nearest!.distance).toBeCloseTo(distance(nearest!.point, [4, 3, 0]), 12);
        });

        it("should measure a circle from its start, the parameter a fraction of its turn", () => {
            // Arrange
            const circle = circleOfRadius(5);

            // Act
            const [top] = occt.analysis.curves.closestPoints({ shape: circle, points: [[0, 10, 0]] });

            // Assert
            expect(top!.point).toEqual(close([0, 5, 0]));
            expect(top!.distance).toBeCloseTo(5, 9);
            expect(top!.length).toBeCloseTo(top!.param * 10 * Math.PI, 9);
            expect(top!.edgeIndex).toBe(0);
        });

        it("should number edges as getEdgesAlongWire lists them on a wire that holds a degenerated edge", () => {
            // Arrange
            const cone = occt.shapes.solid.createCone({ radius1: 2, radius2: 0, height: 5, angle: 360, center: [0, 0, 0], direction: [0, 0, 1] });
            const wire = lateralWireOf(cone, Inputs.OCCT.surfaceTypeEnum.cone);
            const edges = occt.shapes.edge.getEdgesAlongWire({ shape: wire });

            // Act
            const [onRim] = occt.analysis.curves.closestPoints({ shape: wire, points: [[-3, 0, 0]] });

            // Assert
            expect(onRim!.point).toEqual(close([-2, 0, 0]));
            expect(occt.shapes.edge.getEdgeLength({ shape: edges[onRim!.edgeIndex]! })).toBeCloseTo(4 * Math.PI, 9);
        });

        it("should refuse points that are not points and a shape that is not a curve", () => {
            // Arrange
            const wire = openSquare();
            const box = occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0], originOnCenter: true });

            // Act
            const notAList = thrownBy(() => occt.analysis.curves.closestPoints({ shape: wire, points: loose("points") }));
            const notAPoint = thrownBy(() => occt.analysis.curves.closestPoints({ shape: wire, points: [[0, 0, 0], [0, NaN, 0]] }));
            const missing = thrownBy(() => occt.analysis.curves.closestPoints({ shape: loose(undefined), points: [[0, 0, 0]] }));
            const solid = messageOf(() => occt.analysis.curves.closestPoints({ shape: box, points: [[0, 0, 0]] }));

            // Assert
            expect(notAList.message).toBe("`points` is not a list of points.");
            expect(notAPoint.message).toBe("`points` holds something other than a point at position 1; each is three finite numbers.");
            expect(missing.message).toBe("`shape` is missing or empty, as an operation that failed can leave it.");
            expect(solid).toBe("Standard_DomainError: ClosestPointsOnCurve: the shape is not an edge or a wire with a curve");
        });
    });

    describe("curvaturesAtParams and curvaturesAtLengths", () => {
        it("should read a circle's curvature, radius and center, with the normal toward the center", () => {
            // Arrange
            const circle = circleOfRadius(5);

            // Act
            const curvatures = occt.analysis.curves.curvaturesAtParams({ shape: circle, params: [0, 0.3, 0.7] });

            // Assert
            expect(curvatures).toHaveLength(3);
            curvatures.forEach(curvature => {
                expect([curvature.curvature, curvature.radius, curvature.torsion]).toEqual(close([0.2, 5, 0]));
                expect(curvature.isStraight).toBe(false);
                expect(curvature.center).toEqual(close([0, 0, 0]));
                expect(curvature.normal).toEqual(close(curvature.point.map(coordinate => -coordinate / 5)));
                expect(curvature.binormal).toEqual(close([0, 0, 1]));
                expect([dot(curvature.tangent, curvature.tangent), dot(curvature.tangent, curvature.normal)]).toEqual(close([1, 0]));
                expect(distance(curvature.point, [0, 0, 0])).toBeCloseTo(5, 9);
            });
        });

        it("should call a straight edge straight, with an endless radius and the center at the point", () => {
            // Arrange
            const line = segment([0, 0, 0], [10, 0, 0]);

            // Act
            const [middle] = occt.analysis.curves.curvaturesAtParams({ shape: line, params: [0.5] });

            // Assert
            expect(middle!.isStraight).toBe(true);
            expect(middle!.curvature).toBe(0);
            expect(middle!.radius).toBe(Infinity);
            expect(middle!.point).toEqual(close([5, 0, 0]));
            expect(middle!.center).toEqual(close([5, 0, 0]));
            expect(middle!.tangent).toEqual(close([1, 0, 0]));
            expect(middle!.normal).toEqual(close([0, 0, 0]));
        });

        it("should read a helix's curvature and torsion as its radius and climb give them", () => {
            // Arrange
            const radius = 2;
            const climbPerRadian = 3 / (2 * Math.PI);
            const helix = occt.shapes.wire.createHelixWire({ radius, pitch: 3, height: 6, center: [0, 0, 0], direction: [0, 0, 1], clockwise: false, tolerance: 1e-4 });

            // Act
            const curvatures = occt.analysis.curves.curvaturesAtParams({ shape: helix, params: [0.25, 0.5, 0.75] });

            // Assert
            const squares = radius * radius + climbPerRadian * climbPerRadian;
            curvatures.forEach(curvature => {
                expect(curvature.curvature).toBeCloseTo(radius / squares, 3);
                expect(curvature.torsion).toBeCloseTo(climbPerRadian / squares, 3);
            });
        });

        it("should read the edge that starts at a corner, and the one before it just short of the corner", () => {
            // Arrange
            const arc = occt.shapes.edge.arcThroughThreePoints({ start: [5, 0, 0], middle: [5 * Math.SQRT1_2, 5 * Math.SQRT1_2, 0], end: [0, 5, 0] });
            const wire = occt.shapes.wire.combineEdgesAndWiresIntoAWire({ shapes: [arc, segment([0, 5, 0], [-10, 5, 0])] });

            // Act
            const [onArc, atCorner] = occt.analysis.curves.curvaturesAtParams({ shape: wire, params: [0.49, 0.5] });

            // Assert
            expect(onArc!.curvature).toBeCloseTo(0.2, 9);
            expect(atCorner!.isStraight).toBe(true);
            expect(atCorner!.point).toEqual(close([0, 5, 0]));
        });

        it("should find a place by its length along the curve", () => {
            // Arrange
            const wire = openSquare();
            const circle = circleOfRadius(5);

            // Act
            const [onTopSide] = occt.analysis.curves.curvaturesAtLengths({ shape: wire, lengths: [25] });
            const [first, halfWayRound] = occt.analysis.curves.curvaturesAtLengths({ shape: circle, lengths: [0, 5 * Math.PI] });

            // Assert
            expect(onTopSide!.point).toEqual(close([5, 10, 0]));
            expect(onTopSide!.tangent).toEqual(close([-1, 0, 0]));
            expect(onTopSide!.isStraight).toBe(true);
            expect(distance(first!.point, halfWayRound!.point)).toBeCloseTo(10, 9);
            expect(halfWayRound!.radius).toBeCloseTo(5, 9);
        });

        it("should refuse a fraction outside 0 to 1, a negative length and something that is not a list", () => {
            // Arrange
            const circle = circleOfRadius(5);

            // Act
            const pastTheEnd = thrownBy(() => occt.analysis.curves.curvaturesAtParams({ shape: circle, params: [0.5, 1.5] }));
            const notAList = thrownBy(() => occt.analysis.curves.curvaturesAtParams({ shape: circle, params: loose(0.5) }));
            const beforeTheStart = thrownBy(() => occt.analysis.curves.curvaturesAtLengths({ shape: circle, lengths: [-1] }));

            // Assert
            expect(pastTheEnd.message).toBe("`params` holds 1.5 at position 1; each is a finite number from 0 to 1.");
            expect(notAList.message).toBe("`params` is not a list of numbers.");
            expect(beforeTheStart.message).toBe("`lengths` holds -1 at position 0; each is a finite number 0 or more.");
        });
    });

    describe("curvatureComb", () => {
        it("should stand every tooth of a circle's comb outward, a fifth of the circle's length long when the scale is left at 0", () => {
            // Arrange
            const circle = circleOfRadius(5);
            const toothLength = (10 * Math.PI) / 5;

            // Act
            const [outline, ...teeth] = occt.analysis.curves.curvatureComb({ shape: circle, samples: 12 });

            // Assert
            expect(outline!.points).toHaveLength(12);
            expect(teeth).toHaveLength(12);
            outline!.points.forEach(tip => expect(distance(tip, [0, 0, 0])).toBeCloseTo(5 + toothLength, 9));
            teeth.forEach((tooth, index) => {
                const [base, tip] = tooth.points;
                expect(distance(base!, [0, 0, 0])).toBeCloseTo(5, 9);
                expect(tip).toEqual(close(base!.map(coordinate => coordinate * (5 + toothLength) / 5)));
                expect(tip).toEqual(outline!.points[index]);
            });
        });

        it("should make each tooth the curvature times the scale long when a scale is given", () => {
            // Arrange
            const circle = circleOfRadius(5);

            // Act
            const [outline] = occt.analysis.curves.curvatureComb({ shape: circle, samples: 4, scale: 10 });

            // Assert
            outline!.points.forEach(tip => expect(distance(tip, [0, 0, 0])).toBeCloseTo(7, 9));
        });

        it("should give a straight edge teeth of no length, fifty of them by default", () => {
            // Arrange
            const line = segment([0, 0, 0], [10, 0, 0]);

            // Act
            const [outline, ...teeth] = occt.analysis.curves.curvatureComb({ shape: line });

            // Assert
            expect(teeth).toHaveLength(50);
            teeth.forEach(tooth => expect(tooth.points[1]).toEqual(close(tooth.points[0]!)));
            expect(outline!.points[49]).toEqual(close([10, 0, 0]));
        });

        it("should refuse fewer than two teeth, a part of a tooth and a negative scale", () => {
            // Arrange
            const circle = circleOfRadius(5);

            // Act
            const one = thrownBy(() => occt.analysis.curves.curvatureComb({ shape: circle, samples: 1 }));
            const fraction = thrownBy(() => occt.analysis.curves.curvatureComb({ shape: circle, samples: 2.5 }));
            const negative = thrownBy(() => occt.analysis.curves.curvatureComb({ shape: circle, scale: -1 }));

            // Assert
            expect(one.message).toBe("`samples` must be a whole number 2 or more; it is 1.");
            expect(fraction.message).toBe("`samples` must be a whole number 2 or more; it is 2.5.");
            expect(negative.message).toBe("`scale` must be a finite number 0 or more; it is -1.");
        });
    });

    describe("curveType", () => {
        it("should tell the kind of curve each edge runs along", () => {
            // Arrange
            const arc = occt.shapes.edge.arcThroughThreePoints({ start: [5, 0, 0], middle: [0, 5, 0], end: [-5, 0, 0] });
            const ellipse = occt.shapes.edge.createEllipseEdge({ radiusMinor: 1, radiusMajor: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const bezier = occt.shapes.edge.getEdges({ shape: occt.shapes.wire.createBezier({ points: [[0, 0, 0], [1, 2, 0], [3, 2, 0], [4, 0, 0]], closed: false }) })[0]!;
            const spline = occt.shapes.edge.getEdges({ shape: occt.shapes.wire.interpolatePoints({ points: [[0, 0, 0], [3, 2, 0], [6, -1, 1], [9, 1, 0]], periodic: false, tolerance: 1e-7 }) })[0]!;

            // Act
            const kinds = [segment([0, 0, 0], [1, 0, 0]), circleOfRadius(3), arc, ellipse, bezier, spline].map(shape => occt.analysis.curves.curveType({ shape }));

            // Assert
            expect(kinds).toEqual([
                Inputs.OCCT.curveTypeEnum.line,
                Inputs.OCCT.curveTypeEnum.circle,
                Inputs.OCCT.curveTypeEnum.circle,
                Inputs.OCCT.curveTypeEnum.ellipse,
                Inputs.OCCT.curveTypeEnum.bezier,
                Inputs.OCCT.curveTypeEnum.bspline,
            ]);
        });

        it("should agree with the edge selector on every edge of a shape", () => {
            // Arrange
            const cylinder = occt.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 0, 1] });
            const edges = occt.shapes.edge.getEdges({ shape: cylinder });

            // Act
            const kinds = edges.map(shape => occt.analysis.curves.curveType({ shape }));

            // Assert
            kinds.forEach((kind, index) => expect(occt.select.edges.ofType({ shape: cylinder, type: kind })).toContain(index));
        });

        it("should refuse a wire and a missing edge", () => {
            // Arrange
            const wire = openSquare();

            // Act
            const notAnEdge = thrownBy(() => occt.analysis.curves.curveType({ shape: loose(wire) }));
            const missing = thrownBy(() => occt.analysis.curves.curveType({ shape: loose(undefined) }));

            // Assert
            expect(notAnEdge.message).toBe("`shape` is not an edge; the edges of a wire or another shape come from `shapes.edge.getEdges`.");
            expect(missing.message).toBe("`shape` is missing or empty, as an operation that failed can leave it.");
        });
    });
});
