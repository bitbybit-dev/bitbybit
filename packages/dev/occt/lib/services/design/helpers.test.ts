import { describe, it, expect } from "vitest";
import { faceDefaultDirection } from "./helpers";

describe("the direction a frame on a face takes by default", () => {
    it("should take X on a face along Y or Z, and Y on a face along X", () => {
        // Act
        const directions = [faceDefaultDirection([0, 1, 0]), faceDefaultDirection([0, 0, -1]), faceDefaultDirection([1, 0, 0])];

        // Assert
        expect(directions).toEqual([[1, 0, 0], [1, 0, 0], [0, 1, 0]]);
    });

    it("should take none on a face that is slanted, or only nearly square to an axis", () => {
        // Arrange
        const tilt = 5e-4;
        const nearlyUp: [number, number, number] = [Math.sin(tilt), Math.cos(tilt), 0];

        // Act
        const directions = [faceDefaultDirection([Math.SQRT1_2, Math.SQRT1_2, 0]), faceDefaultDirection(nearlyUp)];

        // Assert
        expect(directions).toEqual([undefined, undefined]);
    });
});
