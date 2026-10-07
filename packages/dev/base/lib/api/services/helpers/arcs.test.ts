import { describe, expect, it } from "vitest";
import type * as Inputs from "../../inputs";
import { arcThroughThreePoints, pointsOnArc } from "./arcs";

type Point3 = Inputs.Base.Point3;

const distanceFrom = (center: Point3) => (point: Point3): number => Math.hypot(point[0] - center[0], point[1] - center[1], point[2] - center[2]);

describe("arcs", () => {
    it("should find the circle through three points and the turn from the first to the last through the middle one", () => {
        // Act
        const arc = arcThroughThreePoints([1, 0, 0], [0, 1, 0], [-1, 0, 0]);

        // Assert
        expect(arc!.center.map((value) => value + 0)).toEqual([0, 0, 0]);
        expect(arc!.radius).toBeCloseTo(1, 15);
        expect(arc!.sweep).toBeCloseTo(Math.PI, 15);
    });

    it("should go the long way round when the middle point lies on it", () => {
        // Act
        const arc = arcThroughThreePoints([1, 0, 0], [0, -1, 0], [0, 1, 0]);

        // Assert
        expect(arc!.sweep).toBeCloseTo(1.5 * Math.PI, 12);
    });


    it("should give nothing for three points on one line or two at one place, which fix no single circle", () => {
        // Act
        const arcs = [
            arcThroughThreePoints([0, 0, 0], [1, 1, 1], [2, 2, 2]),
            arcThroughThreePoints([0, 0, 0], [0, 0, 0], [1, 0, 0]),
            arcThroughThreePoints([1, 0, 0], [-1, 0, 0], [1, 0, 0]),
        ];

        // Assert
        expect(arcs).toEqual([undefined, undefined, undefined]);
    });

    it("should divide an arc in a tilted plane into even steps on its circle, keeping its ends as given", () => {
        // Arrange
        const start: Point3 = [3, 0, 0];
        const middle: Point3 = [0, 3 / Math.SQRT2, 3 / Math.SQRT2];
        const end: Point3 = [-3, 0, 0];
        const arc = arcThroughThreePoints(start, middle, end)!;

        // Act
        const points = pointsOnArc(arc, start, end, 4);

        // Assert
        expect(points).toHaveLength(5);
        expect(points[0]).toBe(start);
        expect(points[4]).toBe(end);
        expect(points.map(distanceFrom([0, 0, 0]))).toEqual(points.map(() => expect.closeTo(3, 12)));
        expect(points[2]!.map((value) => Number(value.toFixed(12)) + 0)).toEqual(middle.map((value) => Number(value.toFixed(12))));
    });
});
