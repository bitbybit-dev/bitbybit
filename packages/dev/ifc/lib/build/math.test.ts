import { cross3, length2 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import { describe, expect, it } from "vitest";
import type { Frame3, Line2 } from "./build-types";
import { distanceToSegment, distanceToLine, frameFrom, intersectLines, normalize2, normalize3, parameterOnLine, placedOnPlan } from "./math";

const PARALLEL = 1e-9;
const TURNED_FRAME: Frame3 = { origin: [1000, 2000, 300], x: [0, 1, 0], y: [-1, 0, 0], z: [0, 0, 1] };

describe("plan vectors", () => {
    it("should scale a vector to length one", () => {
        // Act
        const unit = normalize2([3, 4]);

        // Assert
        expect(unit).toEqual([0.6, 0.8]);
        expect(length2(unit)).toBe(1);
    });

    it("should refuse to normalise a vector of zero length", () => {
        // Act & Assert
        expect(() => normalize2([0, 0])).toThrow(RangeError);
        expect(() => normalize3([0, 0, 0])).toThrow(RangeError);
    });

});

describe("plan lines", () => {
    it("should measure a point's distance from a segment, to its nearer end beyond it", () => {
        // Act
        const distances = [distanceToSegment([2, 3], [0, 0], [4, 0]), distanceToSegment([7, 4], [0, 0], [4, 0]), distanceToSegment([3, 4], [0, 0], [0, 0])];

        // Assert
        expect(distances).toEqual([3, 5, 5]);
    });

    it("should intersect two crossing lines", () => {
        // Act
        const point = intersectLines({ point: [0, 0], direction: [1, 0] }, { point: [3, -5], direction: [0, 1] }, PARALLEL);

        // Assert
        expect(point).toEqual([3, 0]);
    });

    it("should find no intersection of parallel lines", () => {
        // Act
        const point = intersectLines({ point: [0, 0], direction: [1, 0] }, { point: [0, 5], direction: [-1, 0] }, PARALLEL);

        // Assert
        expect(point).toBeUndefined();
    });

    it("should measure a point's distance from a line as positive to its left and negative to its right", () => {
        // Arrange
        const eastward: Line2 = { point: [0, 0], direction: [1, 0] };

        // Act
        const distances = [distanceToLine([5, 2], eastward), distanceToLine([5, -3], eastward)];

        // Assert
        expect(distances).toEqual([2, -3]);
    });

    it("should measure how far along a line a point lies from the line's point", () => {
        // Act
        const along = parameterOnLine([7, 4], { point: [2, 0], direction: [1, 0] });

        // Assert
        expect(along).toBe(5);
    });
});

describe("frames", () => {
    it("should build a right-handed frame, projecting the X hint off the Z axis", () => {
        // Act
        const frame = frameFrom([1, 2, 3], [0, 0, 2], [1, 0, 5]);

        // Assert
        expect(frame).toEqual({ origin: [1, 2, 3], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] });
        expect(cross3(frame.x, frame.y)).toEqual(frame.z);
    });

    it("should place a plan point by a frame and keep its plan coordinates", () => {
        // Act
        const placed = placedOnPlan(TURNED_FRAME, [100, 50]);

        // Assert
        expect(placed).toEqual([950, 2100]);
    });
});
