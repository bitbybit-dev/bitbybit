import { describe, expect, it } from "vitest";
import type * as Inputs from "../../../inputs";
import { expandedKnots, knotDomain, nurbsCurvePoint, nurbsSurfacePoint } from "./nurbs";

const QUARTER: Inputs.Base.Point3[] = [[1, 0, 0], [1, 1, 0], [0, 1, 0]];
const QUARTER_WEIGHTS = [1, Math.SQRT1_2, 1];
const CLAMPED_QUADRATIC = [0, 0, 0, 1, 1, 1];

function near(values: readonly number[]): unknown[] {
    return values.map((value) => expect.closeTo(value, 12));
}

describe("expandedKnots and knotDomain", () => {
    it("should repeat each knot by its multiplicity and give the domain a degree leaves", () => {
        // Act
        const knots = expandedKnots([0, 0.5, 1], [3, 1, 3]);

        // Assert
        expect(knots).toEqual([0, 0, 0, 0.5, 1, 1, 1]);
        expect(knotDomain(2, knots)).toEqual([0, 1]);
    });
});

describe("nurbsCurvePoint", () => {
    it("should pass through a clamped curve's end points and follow its control polygon between them", () => {
        // Act
        const points = [0, 0.5, 1].map((t) => nurbsCurvePoint(2, QUARTER, undefined, CLAMPED_QUADRATIC, t));

        // Assert
        expect(points).toEqual([near([1, 0, 0]), near([0.75, 0.75, 0]), near([0, 1, 0])]);
    });

    it("should lie on the circle a rational quadratic with the middle weight a half root of two describes", () => {
        // Act
        const radii = [0.1, 0.3, 0.5, 0.7, 0.9].map((t) => Math.hypot(...nurbsCurvePoint(2, QUARTER, QUARTER_WEIGHTS, CLAMPED_QUADRATIC, t)));

        // Assert
        expect(radii).toEqual(near([1, 1, 1, 1, 1]));
    });

    it("should find the span of a parameter in the middle of many knots and keep a parameter past the domain at its end", () => {
        // Arrange
        const zigzag: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 0], [2, 0, 0], [3, 1, 0], [4, 0, 0]];
        const knots = [0, 0, 1, 2, 3, 4, 4];

        // Act
        const points = [0.5, 1.5, 2.5, 3.5, 4, 5, -1].map((t) => nurbsCurvePoint(1, zigzag, undefined, knots, t).slice(0, 2));

        // Assert
        expect(points).toEqual([near([0.5, 0.5]), near([1.5, 0.5]), near([2.5, 0.5]), near([3.5, 0.5]), near([4, 0]), near([4, 0]), near([0, 0])]);
    });
});

describe("nurbsCurvePoint and repeated knots", () => {
    it("should pass through the control point a doubled inner knot of a quadratic pins, and expand only the multiplicities given", () => {
        // Arrange
        const points: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 0], [2, 0, 0], [3, 1, 0], [4, 0, 0]];
        const knots = expandedKnots([0, 0.5, 1], [3, 2, 3]);

        // Act
        const middle = nurbsCurvePoint(2, points, undefined, knots, 0.5);
        const short = expandedKnots([0, 1], [2]);

        // Assert
        expect(middle).toEqual(near([2, 0, 0]));
        expect(short).toEqual([0, 0]);
    });
});

describe("nurbsSurfacePoint", () => {
    it("should evaluate a bilinear patch at its corners and centre, and a rational one on its cylinder", () => {
        // Arrange
        const flat: Inputs.Base.Point3[][] = [[[0, 0, 0], [0, 2, 0]], [[2, 0, 0], [2, 2, 2]]];
        const cylinder: Inputs.Base.Point3[][] = QUARTER.map((point) => [point, [point[0], point[1], 5]]);
        const weights = QUARTER_WEIGHTS.map((weight) => [weight, weight]);

        // Act
        const centre = nurbsSurfacePoint([1, 1], flat, undefined, [[0, 0, 1, 1], [0, 0, 1, 1]], 0.5, 0.5);
        const corner = nurbsSurfacePoint([1, 1], flat, undefined, [[0, 0, 1, 1], [0, 0, 1, 1]], 1, 1);
        const onCylinder = nurbsSurfacePoint([2, 1], cylinder, weights, [CLAMPED_QUADRATIC, [0, 0, 1, 1]], 0.3, 0.4);

        // Assert
        expect(centre).toEqual(near([1, 1, 0.5]));
        expect(corner).toEqual(near([2, 2, 2]));
        expect(Math.hypot(onCylinder[0], onCylinder[1])).toBeCloseTo(1, 12);
        expect(onCylinder[2]).toBeCloseTo(2, 12);
    });
});
