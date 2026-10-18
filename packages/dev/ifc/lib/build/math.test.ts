import { cross3, length2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { describe, expect, it } from "vitest";
import type { Frame3, Line2 } from "./build-types";
import { distanceToSegment, distanceToLine, frameFrom, intersectLines, direction2Of, direction3Of, parameterOnLine, placedOnPlan } from "./math";
import { errorFrom } from "../__test__/build-setup";

const PARALLEL = 1e-9;
const NO_DIRECTION = "A direction needs a finite length above zero";
const TURNED_FRAME: Frame3 = { origin: [1000, 2000, 300], x: [0, 1, 0], y: [-1, 0, 0], z: [0, 0, 1] };

describe("plan vectors", () => {
    it("should scale a vector to length one", () => {
        // Act
        const unit = direction2Of([3, 4]);

        // Assert
        expect(unit).toEqual([0.6, 0.8]);
        expect(length2(unit)).toBe(1);
    });

    it("should refuse to normalise a vector of zero length", () => {
        // Act & Assert
        expect(() => direction2Of([0, 0])).toThrow(RangeError);
        expect(() => direction3Of([0, 0, 0])).toThrow(RangeError);
    });

    it.each([
        ["an infinite x", [Infinity, 0]],
        ["a minus infinite x", [-Infinity, 1]],
        ["an x that is not a number", [Number.NaN, 1]],
    ])("should refuse to normalise a plan vector of %s, whose length is not finite, as it would a vector of zero length", (_case, vector) => {
        // Arrange
        const plan: [number, number] = [vector[0]!, vector[1]!];

        // Act
        const refusal = errorFrom(() => direction2Of(plan));

        // Assert
        expect(refusal).toBeInstanceOf(RangeError);
        expect(refusal.message).toBe(NO_DIRECTION);
    });

    it.each([
        ["an infinite z", [0, 0, Infinity]],
        ["a minus infinite y", [1, -Infinity, 0]],
        ["a y that is not a number", [0, Number.NaN, 0]],
    ])("should refuse to normalise a vector of %s, whose length is not finite, as it would a vector of zero length", (_case, vector) => {
        // Arrange
        const spatial: [number, number, number] = [vector[0]!, vector[1]!, vector[2]!];

        // Act
        const refusal = errorFrom(() => direction3Of(spatial));

        // Assert
        expect(refusal).toBeInstanceOf(RangeError);
        expect(refusal.message).toBe(NO_DIRECTION);
    });

    it("should word the refusal of a vector of zero length as it words one of infinite length", () => {
        // Act & Assert
        expect(() => direction2Of([0, 0])).toThrow(NO_DIRECTION);
        expect(() => direction3Of([0, 0, 0])).toThrow(NO_DIRECTION);
    });

    it.each([
        [[2, 3]],
        [[1, 3]],
        [[7, 11]],
        [[-3, 7]],
    ])("should normalise the plan vector %j to the same digits as the vector it is on the plan", (vector) => {
        // Arrange
        const [x, y] = [vector[0]!, vector[1]!];

        // Act
        const plan = direction2Of([x, y]);
        const spatial = direction3Of([x, y, 0]);

        // Assert
        expect(plan).toEqual([spatial[0], spatial[1]]);
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

    it("should refuse an X hint that leaves the X axis to rounding, lying along the Z axis but for its last digits", () => {
        // Arrange
        const zAxis: [number, number, number] = [1, 2, 3];
        const alongZButForRounding: [number, number, number] = [2, 4, 6.000000000001];

        // Act
        const refusal = errorFrom(() => frameFrom([0, 0, 0], zAxis, alongZButForRounding));

        // Assert
        expect(refusal).toBeInstanceOf(RangeError);
        expect(refusal.message).toBe("A frame's X direction has no part square to its Z axis");
    });

    it("should refuse a Z axis of no length or of no finite length", () => {
        // Act & Assert
        expect(() => frameFrom([0, 0, 0], [0, 0, 0], [1, 0, 0])).toThrow(NO_DIRECTION);
        expect(() => frameFrom([0, 0, 0], [0, 0, Infinity], [1, 0, 0])).toThrow(NO_DIRECTION);
    });

    it("should refuse an X hint of no length", () => {
        // Act & Assert
        expect(() => frameFrom([0, 0, 0], [0, 0, 1], [0, 0, 0])).toThrow("A frame's X direction has no part square to its Z axis");
    });

    it("should place a plan point by a frame and keep its plan coordinates", () => {
        // Act
        const placed = placedOnPlan(TURNED_FRAME, [100, 50]);

        // Assert
        expect(placed).toEqual([950, 2100]);
    });
});
