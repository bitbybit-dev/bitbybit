import { describe, expect, it } from "vitest";
import * as Inputs from "../../../../inputs";
import { nurbsCurvePoint } from "../../curves/nurbs";
import { clampedUniformKnots } from "../../curves/nurbs-forms";
import { drawingBounds } from "./drawing-geometry";
import type { DrawingPart, DrawingSpline } from "./drawing-types";

type Point3 = Inputs.Base.Point3;

const partOf = (spline: DrawingSpline): DrawingPart => ({ layer: "0", color: "#000000", lineType: Inputs.IO.lineTypeEnum.continuous, paths: [{ segments: [spline] }] });

const splineOf = (points: Point3[], weights: number[] = points.map(() => 1), degree = 3): DrawingSpline => ({
    kind: "spline",
    curve: { degree, points, weights, knots: clampedUniformKnots(points.length, degree) },
});

const curvePoints = (spline: DrawingSpline, count: number): Point3[] => {
    const { degree, points, weights, knots } = spline.curve;
    const last = knots[knots.length - 1]!;
    return Array.from({ length: count + 1 }, (_, step) => nurbsCurvePoint(degree, points, weights, knots, (last * step) / count));
};

describe("drawing bounds", () => {
    it("should bound a spline by its curve within the tolerance, the control points that reach further left out", () => {
        // Arrange
        const spline = splineOf([[0, 0, 0], [3, 10, 0], [5, 8, 0], [10, 0, 0]]);
        const highest = Math.max(...curvePoints(spline, 10_000).map(point => point[1]));

        // Act
        const bounds = drawingBounds([partOf(spline)], 0.5)!;

        // Assert
        expect([bounds.min, bounds.max[0]]).toEqual([[-0.5, -0.5, -0.5], 10.5]);
        expect(bounds.max[1]).toBeGreaterThanOrEqual(highest);
        expect(bounds.max[1]).toBeLessThanOrEqual(highest + 0.5);
    });

    it("should bound a rational spline by its weighted curve", () => {
        // Arrange
        const spline = splineOf([[10, 0, 0], [10, 10, 0], [0, 10, 0]], [1, Math.SQRT1_2, 1], 2);

        // Act
        const bounds = drawingBounds([partOf(spline)], 1e-3)!;

        // Assert
        expect(bounds).toEqual({ min: [-1e-3, -1e-3, -1e-3], max: [10 + 1e-3, 10 + 1e-3, 1e-3] });
    });

    it("should bound a spline of many control points a trillion times the usual scale quickly, every point of its curve inside", () => {
        // Arrange
        const scale = 1e12;
        const spline = splineOf(Array.from({ length: 40 }, (_, at): Point3 => [at * scale, Math.sin(at) * scale, Math.cos(at * 0.7) * scale]));
        const started = performance.now();

        // Act
        const bounds = drawingBounds([partOf(spline)], 0.01)!;

        // Assert
        expect(performance.now() - started).toBeLessThan(4000);
        const slack = 40 * scale * 1e-6;
        for (const point of curvePoints(spline, 20_000)) {
            point.forEach((value, axis) => {
                expect(value).toBeGreaterThanOrEqual(bounds.min[axis]!);
                expect(value).toBeLessThanOrEqual(bounds.max[axis]!);
            });
        }
        const curve = curvePoints(spline, 20_000);
        [0, 1, 2].forEach(axis => {
            expect(bounds.min[axis]!).toBeGreaterThan(Math.min(...curve.map(point => point[axis]!)) - slack);
            expect(bounds.max[axis]!).toBeLessThan(Math.max(...curve.map(point => point[axis]!)) + slack);
        });
    });
});
