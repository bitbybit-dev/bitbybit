import { describe, expect, it } from "vitest";
import type * as Inputs from "../../inputs";
import { isInsidePolygon2, perimeter2, signedArea2, wound2 } from "./polygons";

const SQUARE: Inputs.Base.Point2[] = [[0, 0], [4, 0], [4, 3], [0, 3]];

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
