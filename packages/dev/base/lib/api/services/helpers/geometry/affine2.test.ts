import { describe, expect, it } from "vitest";
import { AFFINE_IDENTITY2, affineAreaScale2, affinePoint2, affineProduct2, affineScaling2, affineTranslation2 } from "./affine2";
import type { AffineMatrix2 } from "./affine2";

const QUARTER_TURN: AffineMatrix2 = [0, 1, -1, 0, 0, 0];

describe("2D affine matrices", () => {
    it("should leave a point where it is under the identity", () => {
        // Act
        const moved = affinePoint2(AFFINE_IDENTITY2, [3, -4]);

        // Assert
        expect(moved).toStrictEqual([3, -4]);
    });

    it("should apply the second matrix of a product first", () => {
        // Arrange
        const turnedThenMoved = affineProduct2(affineTranslation2(10, 0), QUARTER_TURN);
        const movedThenTurned = affineProduct2(QUARTER_TURN, affineTranslation2(10, 0));

        // Act
        const points = [affinePoint2(turnedThenMoved, [1, 0]), affinePoint2(movedThenTurned, [1, 0])];

        // Assert
        expect(points).toStrictEqual([[10, 1], [0, 11]]);
    });

    it("should scale each axis by its own factor", () => {
        // Act
        const scaled = affinePoint2(affineScaling2(2, -3), [5, 7]);

        // Assert
        expect(scaled).toStrictEqual([10, -21]);
    });

    it("should give the square root of the area a matrix scales by, whatever its turn or mirror", () => {
        // Act
        const scales = [affineScaling2(4, 9), affineScaling2(-4, 9), affineProduct2(QUARTER_TURN, affineScaling2(4, 9)), affineTranslation2(5, 5)].map(affineAreaScale2);

        // Assert
        expect(scales).toStrictEqual([6, 6, 6, 1]);
    });
});
