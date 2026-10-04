import { describe, it, expect } from "vitest";
import * as Inputs from "../../api/inputs";
import { IDENTITY, followedBy, frameMatrix, inverse, jointMatrix, movedFrame, movedPoint, turned } from "./placement";

const close = (values: readonly number[]): unknown[] => values.map(value => expect.closeTo(value, 9));

describe("design placement", () => {
    it("should move the origin and the X and Z axes onto a frame, with Y as its normal crossed with its direction", () => {
        // Arrange
        const frame: Inputs.Base.Frame = { origin: [1, 2, 3], normal: [0, 1, 0], direction: [1, 0, 0] };

        // Act
        const matrix = frameMatrix(frame);

        // Assert
        expect(movedPoint(matrix, [0, 0, 0])).toEqual(close([1, 2, 3]));
        expect(turned(matrix, [1, 0, 0])).toEqual(close([1, 0, 0]));
        expect(turned(matrix, [0, 0, 1])).toEqual(close([0, 1, 0]));
        expect(turned(matrix, [0, 1, 0])).toEqual(close([0, 0, -1]));
    });

    it("should apply the first matrix and then the second, and undo a rigid motion with its inverse", () => {
        // Arrange
        const lift = frameMatrix({ origin: [0, 0, 5], normal: [0, 0, 1], direction: [1, 0, 0] });
        const turn = frameMatrix({ origin: [0, 0, 0], normal: [0, 0, 1], direction: [0, 1, 0] });
        const tilted = frameMatrix({ origin: [3, -2, 7], normal: [1, 1, 0], direction: [0, 0, 1] });

        // Act
        const liftThenTurn = followedBy(lift, turn);
        const undone = followedBy(tilted, inverse(tilted));

        // Assert
        expect(movedPoint(liftThenTurn, [1, 0, 0])).toEqual(close([0, 1, 5]));
        expect(undone).toEqual(close(IDENTITY));
    });

    it("should bring a connector against its target, facing it, with the x axes along each other", () => {
        // Arrange
        const connector: Inputs.Base.Frame = { origin: [2, 2, 0], normal: [0, 0, -1], direction: [1, 0, 0] };
        const target: Inputs.Base.Frame = { origin: [20, 10, 10], normal: [0, 0, 1], direction: [1, 0, 0] };

        // Act
        const placed = movedFrame(jointMatrix(connector, target, false, 0, 0), connector);

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
        const flipped = movedFrame(jointMatrix(connector, target, true, 0, 0), connector);
        const turnedAndRaised = movedFrame(jointMatrix(connector, target, false, 90, 2), connector);

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
        const matrix = frameMatrix(leaning);
        const placed = movedFrame(jointMatrix(connector, leaning, false, 90, 0), connector);

        // Assert
        expect(turned(matrix, [1, 0, 0])).toEqual(close([1, 0, 0]));
        expect(turned(matrix, [0, 1, 0])).toEqual(close([0, 1, 0]));
        expect(turned(frameMatrix(sideways), [1, 0, 0])).toEqual(close([0, 1, 0]));
        expect(turned(frameMatrix(upward), [1, 0, 0])).toEqual(close([1, 0, 0]));
        expect(followedBy(matrix, inverse(matrix))).toEqual(close(IDENTITY));
        expect(placed.normal).toEqual(close([0, 0, -1]));
        expect(placed.direction).toEqual(close([0, 1, 0]));
    });
});
