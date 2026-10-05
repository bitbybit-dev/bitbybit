import { describe, it, expect } from "vitest";
import type * as Inputs from "../../api/inputs";
import { BaseBitByBit } from "../../base";
import { DesignProblem } from "./problems";
import { frameMatrix, jointMatrix, movedFrame, squaredFrame, tripleOf, unitVector } from "./placement";

const base = new BaseBitByBit();
const close = (values: readonly number[]): unknown[] => values.map(value => expect.closeTo(value, 9));
const movedPoint = (matrix: Inputs.Base.TransformMatrix, point: Inputs.Base.Point3): number[] => base.point.transformPoint({ point, transformation: [matrix] });
const turned = (matrix: Inputs.Base.TransformMatrix, vector: Inputs.Base.Vector3): number[] => base.vector.sub({ first: movedPoint(matrix, vector), second: movedPoint(matrix, [0, 0, 0]) });

describe("design placement", () => {
    it("should take the first three numbers of a list", () => {
        // Act
        const triple = tripleOf([1, 2, 3, 4]);

        // Assert
        expect(triple).toEqual([1, 2, 3]);
    });

    it("should scale a vector to length 1 and refuse one of no length at its path", () => {
        // Act
        const unit = unitVector([0, 3, 4], "/features/0/direction", base);
        const refused = (): Inputs.Base.Vector3 => unitVector([0, 0, 0], "/features/0/direction", base);

        // Assert
        expect(unit).toEqual(close([0, 0.6, 0.8]));
        expect(refused).toThrow(DesignProblem);
        expect(refused).toThrow("the direction has no length");
    });

    it("should turn a frame's direction square to its normal, and give nothing for a direction along the normal", () => {
        // Act
        const squared = squaredFrame([1, 2, 3], [0, 0, 2], [3, 0, 4], base);
        const along = squaredFrame([1, 2, 3], [0, 0, 2], [0, 0, -5], base);

        // Assert
        expect(squared?.origin).toEqual([1, 2, 3]);
        expect(squared?.normal).toEqual(close([0, 0, 1]));
        expect(squared?.direction).toEqual(close([1, 0, 0]));
        expect(along).toBeUndefined();
    });

    it("should pass on a failure that is not about the frame's input", () => {
        // Arrange
        const failing = new BaseBitByBit();
        failing.frame.create = (): Inputs.Base.Frame => {
            throw new RangeError("out of memory");
        };

        // Act
        const squaring = (): Inputs.Base.Frame | undefined => squaredFrame([0, 0, 0], [0, 0, 1], [1, 0, 0], failing);

        // Assert
        expect(squaring).toThrow(RangeError);
    });

    it("should move the origin and the X and Z axes onto a frame, with Y as its normal crossed with its direction", () => {
        // Arrange
        const frame: Inputs.Base.Frame = { origin: [1, 2, 3], normal: [0, 1, 0], direction: [1, 0, 0] };

        // Act
        const matrix = frameMatrix(frame, base);

        // Assert
        expect(movedPoint(matrix, [0, 0, 0])).toEqual(close([1, 2, 3]));
        expect(turned(matrix, [1, 0, 0])).toEqual(close([1, 0, 0]));
        expect(turned(matrix, [0, 0, 1])).toEqual(close([0, 1, 0]));
        expect(turned(matrix, [0, 1, 0])).toEqual(close([0, 0, -1]));
    });

    it("should move a frame by a placement, its origin as a point and its axes as directions", () => {
        // Arrange
        const placement = frameMatrix({ origin: [0, 0, 5], normal: [0, 0, 1], direction: [0, 1, 0] }, base);
        const frame: Inputs.Base.Frame = { origin: [1, 0, 0], normal: [0, 1, 0], direction: [1, 0, 0] };

        // Act
        const moved = movedFrame(placement, frame, base);

        // Assert
        expect(moved.origin).toEqual(close([0, 1, 5]));
        expect(moved.normal).toEqual(close([-1, 0, 0]));
        expect(moved.direction).toEqual(close([0, 1, 0]));
    });

    it("should bring a connector against its target, facing it, with the x axes along each other", () => {
        // Arrange
        const connector: Inputs.Base.Frame = { origin: [2, 2, 0], normal: [0, 0, -1], direction: [1, 0, 0] };
        const target: Inputs.Base.Frame = { origin: [20, 10, 10], normal: [0, 0, 1], direction: [1, 0, 0] };

        // Act
        const placed = movedFrame(jointMatrix(connector, target, false, 0, 0, base), connector, base);

        // Assert
        expect(placed.origin).toEqual(close([20, 10, 10]));
        expect(placed.normal).toEqual(close([0, 0, -1]));
        expect(placed.direction).toEqual(close([1, 0, 0]));
    });

    it("should face the same way when flipped, turn by the angle about the target's normal, and move away by the offset", () => {
        // Arrange
        const connector: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };
        const target: Inputs.Base.Frame = { origin: [5, 0, 0], normal: [1, 0, 0], direction: [0, 1, 0] };

        // Act
        const flipped = movedFrame(jointMatrix(connector, target, true, 0, 0, base), connector, base);
        const turnedAndRaised = movedFrame(jointMatrix(connector, target, false, 90, 2, base), connector, base);

        // Assert
        expect(flipped.normal).toEqual(close([1, 0, 0]));
        expect(flipped.direction).toEqual(close([0, 1, 0]));
        expect(turnedAndRaised.origin).toEqual(close([7, 0, 0]));
        expect(turnedAndRaised.normal).toEqual(close([-1, 0, 0]));
        expect(turnedAndRaised.direction).toEqual(close([0, 0, 1]));
    });

    it("should lay a direction that leans along the normal into the plane, so a placement stays rigid", () => {
        // Arrange
        const leaning: Inputs.Base.Frame = { origin: [1, 2, 3], normal: [0, 0, 2], direction: [3, 0, 4] };
        const sideways: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [1, 0, 0], direction: [1, 1, 0] };
        const upward: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 1, 0], direction: [1, 1, 0] };
        const connector: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, -1], direction: [1, 0, 0] };

        // Act
        const matrix = frameMatrix(leaning, base);
        const placed = movedFrame(jointMatrix(connector, leaning, false, 90, 0, base), connector, base);

        // Assert
        expect(turned(matrix, [1, 0, 0])).toEqual(close([1, 0, 0]));
        expect(turned(matrix, [0, 1, 0])).toEqual(close([0, 1, 0]));
        expect(turned(frameMatrix(sideways, base), [1, 0, 0])).toEqual(close([0, 1, 0]));
        expect(turned(frameMatrix(upward, base), [1, 0, 0])).toEqual(close([1, 0, 0]));
        expect(placed.normal).toEqual(close([0, 0, -1]));
        expect(placed.direction).toEqual(close([0, 1, 0]));
    });
});
