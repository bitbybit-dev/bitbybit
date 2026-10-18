import { describe, expect, it } from "vitest";
import type * as Inputs from "../../../inputs";
import { isInsidePolygon2, perimeter2, roundedCorners2, signedArea2, wound2 } from "./polygons";

const SQUARE: Inputs.Base.Point2[] = [[0, 0], [4, 0], [4, 3], [0, 3]];

const TURNING_BACK_COSINE = -0.9;

const stepsRepeatingOrTurningBack = (points: readonly Inputs.Base.Point2[]): number[] =>
    points.flatMap((point, at) => {
        const next = points[(at + 1) % points.length]!;
        const after = points[(at + 2) % points.length]!;
        const step = [next[0] - point[0], next[1] - point[1]] as const;
        const following = [after[0] - next[0], after[1] - next[1]] as const;
        const lengths = Math.hypot(...step) * Math.hypot(...following);
        const reverses = step[0] * following[0] + step[1] * following[1] < TURNING_BACK_COSINE * lengths;
        return lengths === 0 || reverses ? [at] : [];
    });

describe("polygons", () => {
    it("should give a counterclockwise outline a positive area and a clockwise one a negative area", () => {
        // Act
        const counterClockwise = signedArea2(SQUARE);
        const clockwise = signedArea2([...SQUARE].reverse());

        // Assert
        expect(counterClockwise).toBe(12);
        expect(clockwise).toBe(-12);
    });

    it("should give points on one line, and fewer than three points, no area", () => {
        // Act
        const areas = [signedArea2([[0, 0], [1, 0], [2, 0]]), signedArea2([[0, 0], [1, 1]]), signedArea2([])];

        // Assert
        expect(areas).toEqual([0, 0, 0]);
    });

    it("should wind an outline as asked, always as a new list", () => {
        // Act
        const kept = wound2(SQUARE, true);
        const turned = wound2(SQUARE, false);

        // Assert
        expect(kept).toEqual(SQUARE);
        expect(kept).not.toBe(SQUARE);
        expect(turned).toEqual([[0, 3], [4, 3], [4, 0], [0, 0]]);
        expect(SQUARE).toEqual([[0, 0], [4, 0], [4, 3], [0, 3]]);
    });

    it("should find a point inside an outline, whichever way it winds, and outside a notch", () => {
        // Arrange
        const notched: Inputs.Base.Point2[] = [[0, 0], [6, 0], [6, 4], [4, 4], [4, 2], [2, 2], [2, 4], [0, 4]];

        // Act
        const results = [[1, 1], [3, 3], [5, 3], [7, 1], [3, -1]].map((point) => isInsidePolygon2(point as Inputs.Base.Point2, notched));
        const reversed = isInsidePolygon2([1, 1], [...notched].reverse());

        // Assert
        expect(results).toEqual([true, false, true, false, false]);
        expect(reversed).toBe(true);
    });

    it("should measure the perimeter around the whole outline, its closing side included", () => {
        // Act
        const perimeter = perimeter2(SQUARE);

        // Assert
        expect(perimeter).toBe(14);
    });
});

describe("roundedCorners2", () => {
    const fine = (): number => 256;
    const square: Inputs.Base.Point2[] = [[0, 0], [10, 0], [10, 10], [0, 10]];
    const ell: Inputs.Base.Point2[] = [[0, 0], [10, 0], [10, 2], [2, 2], [2, 10], [0, 10]];
    const cornerArea = (radius: number): number => radius * radius * (1 - Math.PI / 4);

    it("should take the corner's quarter of a square out where a convex corner is rounded, and add it where an inner corner is", () => {
        // Act
        const square1 = roundedCorners2(square, [0, 0, 2, 0], fine);
        const ell1 = roundedCorners2(ell, [0, 0, 0, 1, 0, 0], fine);

        // Assert
        expect(signedArea2(square1)).toBeCloseTo(100 - cornerArea(2), 3);
        expect(signedArea2(ell1)).toBeCloseTo(36 + cornerArea(1), 3);
    });

    it("should start and end the arc where it meets the edges, with the segments it is given", () => {
        // Act
        const rounded = roundedCorners2(square, [0, 0, 2, 0], () => 4);

        // Assert
        expect(rounded.length).toBe(4 - 1 + 5);
        expect(rounded[2]![0]).toBeCloseTo(10, 12);
        expect(rounded[2]![1]).toBeCloseTo(8, 12);
        expect(rounded[6]![0]).toBeCloseTo(8, 12);
        expect(rounded[6]![1]).toBeCloseTo(10, 12);
    });

    it("should leave a corner without a radius, and a straight one, as it is", () => {
        // Act
        const straight = roundedCorners2([[0, 0], [5, 0], [10, 0], [10, 10]], [0, 3, 0, 0], fine);

        // Assert
        expect(straight).toEqual([[0, 0], [5, 0], [10, 0], [10, 10]]);
        expect(roundedCorners2(square, [], fine)).toEqual(square);
    });

    it("should refuse a radius its corner's edges are too short for", () => {
        // Act & Assert
        expect(() => roundedCorners2(ell, [0, 0, 0, 9, 0, 0], fine)).toThrow("A corner radius of 9 does not fit the edges beside its corner");
    });

    it("should refuse two radii whose arcs would overlap on the side between them, though each fits alone", () => {
        // Arrange
        const strip: Inputs.Base.Point2[] = [[0, 0], [10, 0], [10, 4], [0, 4]];

        // Act
        const fits = roundedCorners2(strip, [0, 2, 2, 0], fine);
        const overlaps = (): Inputs.Base.Point2[] => roundedCorners2(strip, [0, 2.5, 2.5, 0], fine);

        // Assert
        expect(signedArea2(fits)).toBeCloseTo(40 - 2 * cornerArea(2), 3);
        expect(stepsRepeatingOrTurningBack(fits)).toEqual([]);
        expect(overlaps).toThrow("the arcs at the points at positions 1 and 2 need 5 of the side between them, which is 4 long");
    });

    it("should give the point where two arcs that fill a side meet once, across the wrap too, with no step going back", () => {
        // Arrange
        const four: Inputs.Base.Point2[] = [[0, 0], [4, 0], [4, 4], [0, 4]];

        // Act
        const rounded = roundedCorners2(four, [2, 2, 2, 2], () => 4);

        // Assert
        expect(stepsRepeatingOrTurningBack(rounded)).toEqual([]);
        expect(rounded).toHaveLength(16);
        expect(rounded[0]).toEqual([0, 2]);
        expect(rounded[4]).toEqual([2, 0]);
    });

    it("should give an arc that fills its side up to a sharp corner that corner's point once", () => {
        // Arrange
        const four: Inputs.Base.Point2[] = [[0, 0], [4, 0], [4, 4], [0, 4]];

        // Act
        const rounded = roundedCorners2(four, [0, 4, 0, 0], () => 2);

        // Assert
        expect(stepsRepeatingOrTurningBack(rounded)).toEqual([]);
        expect(rounded).toHaveLength(4);
        expect(rounded[0]).toEqual([0, 0]);
    });

    it("should refuse a point that lies on the one before it, since the corner there has no sides", () => {
        // Act & Assert
        expect(() => roundedCorners2([[0, 0], [10, 0], [10, 0], [10, 10]], [1, 1, 1, 1], fine)).toThrow("The point at position 1 lies on a point beside it, so the corner there has no sides");
    });
});
