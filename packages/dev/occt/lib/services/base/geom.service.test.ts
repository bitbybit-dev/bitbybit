import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, BRepAdaptor_Curve, BRepAdaptor_CompCurve } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTEdge, OCCTWire } from "../shapes";

describe("OCCT geom service unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let edge: OCCTEdge;
    let wire: OCCTWire;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
        edge = new OCCTEdge(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
    });

    const curveOfALine = (from: [number, number, number], to: [number, number, number]): BRepAdaptor_Curve => {
        const line = edge.line({ start: from, end: to });
        const curve = new occt.BRepAdaptor_Curve(line);
        line.delete();
        return curve;
    };

    const compCurveOfAPolyline = (): BRepAdaptor_CompCurve => {
        const polyline = wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 0, 10]] });
        const curve = new occt.BRepAdaptor_CompCurve(polyline, false);
        polyline.delete();
        return curve;
    };

    describe("curveLength", () => {
        it("should measure a straight edge end to end", () => {
            // Arrange
            const curve = curveOfALine([0, 0, 0], [10, 0, 0]);

            // Act
            const length = occHelper.geomService.curveLength({ shape: curve });

            // Assert
            expect(length).toBeCloseTo(10, 6);

            curve.delete();
        });
    });

    describe("pointOnCurveAtLength", () => {
        it("should land the given distance along the curve", () => {
            // Arrange
            const curve = curveOfALine([0, 0, 0], [10, 0, 0]);

            // Act
            const point = occHelper.geomService.pointOnCurveAtLength({ shape: curve, length: 2.5 });

            // Assert
            expect(point[0]).toBeCloseTo(2.5, 6);
            expect(point[1]).toBeCloseTo(0, 6);
            expect(point[2]).toBeCloseTo(0, 6);

            curve.delete();
        });

        it("should land at the start for a distance of nothing", () => {
            // Arrange
            const curve = curveOfALine([1, 2, 3], [11, 2, 3]);

            // Act
            const point = occHelper.geomService.pointOnCurveAtLength({ shape: curve, length: 0 });

            // Assert
            expect(point[0]).toBeCloseTo(1, 6);

            curve.delete();
        });
    });

    describe("pointsOnCurveAtLengths", () => {
        it("should land one point per distance it was given, in order", () => {
            // Arrange
            const curve = curveOfALine([0, 0, 0], [10, 0, 0]);

            // Act
            const points = occHelper.geomService.pointsOnCurveAtLengths({ shape: curve, lengths: [0, 5, 10] });

            // Assert
            expect(points).toHaveLength(3);
            expect(points[0]![0]).toBeCloseTo(0, 6);
            expect(points[1]![0]).toBeCloseTo(5, 6);
            expect(points[2]![0]).toBeCloseTo(10, 6);

            curve.delete();
        });
    });

    describe("tangentOnCurveAtLength", () => {
        it("should point along the curve at the distance it was given", () => {
            // Arrange
            const curve = curveOfALine([0, 0, 0], [0, 10, 0]);

            // Act
            const tangent = occHelper.geomService.tangentOnCurveAtLength({ shape: curve, length: 5 });

            expect(tangent[0]).toBeCloseTo(0, 6);
            expect(tangent[1]).toBeGreaterThan(0);
            expect(tangent[2]).toBeCloseTo(0, 6);

            curve.delete();
        });
    });

    describe("divideCurveByEqualLengthDistance", () => {
        it("should space the points evenly along the curve", () => {
            // Arrange
            const curve = curveOfALine([0, 0, 0], [10, 0, 0]);

            // Act
            const points = occHelper.geomService.divideCurveByEqualLengthDistance({
                shape: curve, nrOfDivisions: 5, removeStartPoint: false, removeEndPoint: false
            });

            // Assert
            expect(points).toHaveLength(6);
            points.forEach((point, index) => expect(point[0]).toBeCloseTo(index * 2, 5));

            curve.delete();
        });

        it("should drop the first point when it was asked to", () => {
            // Arrange
            const curve = curveOfALine([0, 0, 0], [10, 0, 0]);

            // Act
            const points = occHelper.geomService.divideCurveByEqualLengthDistance({
                shape: curve, nrOfDivisions: 5, removeStartPoint: true, removeEndPoint: false
            });

            // Assert
            expect(points).toHaveLength(5);
            expect(points[0]![0]).toBeCloseTo(2, 5);

            curve.delete();
        });

        it("should drop the last point when it was asked to", () => {
            // Arrange
            const curve = curveOfALine([0, 0, 0], [10, 0, 0]);

            // Act
            const points = occHelper.geomService.divideCurveByEqualLengthDistance({
                shape: curve, nrOfDivisions: 5, removeStartPoint: false, removeEndPoint: true
            });

            // Assert
            expect(points).toHaveLength(5);
            expect(points[points.length - 1]![0]).toBeCloseTo(8, 5);

            curve.delete();
        });
    });

    describe("the same measurements over a whole wire", () => {
        it("should land a point the given distance along a polyline, past its first corner", () => {
            // Arrange
            const curve = compCurveOfAPolyline();

            // Act
            const point = occHelper.geomService.pointOnCompCurveAtLength({ shape: curve, length: 15 });

            expect(point[0]).toBeCloseTo(10, 5);
            expect(point[2]).toBeCloseTo(5, 5);

            curve.delete();
        });

        it("should land one point per distance it was given", () => {
            // Arrange
            const curve = compCurveOfAPolyline();

            // Act
            const points = occHelper.geomService.pointsOnCompCurveAtLengths({ shape: curve, lengths: [0, 10, 20] });

            // Assert
            expect(points).toHaveLength(3);
            expect(points[0]![0]).toBeCloseTo(0, 5);
            expect(points[2]![2]).toBeCloseTo(10, 5);

            curve.delete();
        });
    });
});
