import { describe, expect, it } from "vitest";
import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls";
import { BaseBitByBit } from "./base-bitbybit";

const base = new BaseBitByBit();
const moveBy = (x: number, y: number, z: number): Inputs.Base.TransformMatrix => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const rounded = (values: readonly number[]): number[] => values.map(value => Number(value.toFixed(9)) + 0);

describe("transforms on whole transformations", () => {
    it("should fold two moves into the one move that makes both", () => {
        // Act
        const [combined] = base.transforms.combine({ transformation: [moveBy(1, 0, 0), moveBy(0, 2, 0)] });

        // Assert
        expect(combined).toEqual(moveBy(1, 2, 0));
    });

    it("should combine a rotation about a point into one matrix that moves points the same way as the list", () => {
        // Arrange
        const turn = base.transforms.rotationCenterAxis({ center: [5, 0, 0], axis: [0, 1, 0], angle: 90 });

        // Act
        const combined = base.transforms.combine({ transformation: turn });

        // Assert
        expect(combined).toHaveLength(1);
        expect(rounded(base.point.transformPoint({ point: [10, 3, 0], transformation: combined }))).toEqual(rounded(base.point.transformPoint({ point: [10, 3, 0], transformation: turn })));
    });

    it("should take a bare matrix as a list of one, and an empty list as the identity", () => {
        // Arrange
        const matrix: unknown = moveBy(4, 5, 6);

        // Act
        const bare = base.transforms.combine({ transformation: matrix as Inputs.Base.TransformMatrixes });
        const none = base.transforms.combine({ transformation: [] });

        // Assert
        expect(bare).toEqual([moveBy(4, 5, 6)]);
        expect(none).toEqual([moveBy(0, 0, 0)]);
    });

    it("should take the nested lists of transformations that point.transformPoints takes, in the same order", () => {
        // Arrange
        const nestedValue: unknown = [[moveBy(1, 0, 0)], [base.transforms.uniformScale({ scale: 2 })[0], moveBy(0, 0, 3)]];
        const nested = nestedValue as Inputs.Base.TransformMatrixes;
        const nestedMoves: unknown = [[moveBy(1, 0, 0)], [moveBy(0, 2, 0)]];

        // Act
        const [combined] = base.transforms.combine({ transformation: nested });
        const determinant = base.transforms.determinant({ transformation: nested });
        const rigid = base.transforms.isRigid({ transformation: nested });
        const [back] = base.transforms.rigidInverse({ transformation: nestedMoves as Inputs.Base.TransformMatrixes });

        // Assert
        expect(base.point.transformPoint({ point: [1, 1, 1], transformation: [combined!] })).toEqual(base.point.transformPoints({ points: [[1, 1, 1]], transformation: nested })[0]);
        expect(combined).toEqual([2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 2, 0, 3, 1]);
        expect([determinant, rigid]).toEqual([8, false]);
        expect(rounded(back!)).toEqual(moveBy(-1, -2, 0));
    });

    it("should refuse a transformation that is not matrices of 16 finite numbers", () => {
        // Arrange
        const short: unknown = [[1, 0, 0]];

        // Act
        const refused = (): unknown => base.transforms.combine({ transformation: short as Inputs.Base.TransformMatrixes });

        // Assert
        expect(refused).toThrow(InputError);
        expect(refused).toThrow("`transformation` is not a matrix of 16 finite numbers, or a list of them.");
    });

    it("should undo a turn and a move, bringing a point back where it started", () => {
        // Arrange
        const placement = [...base.transforms.rotationCenterAxis({ center: [1, 2, 3], axis: [1, 1, 0], angle: 70 }), moveBy(10, -4, 2)];
        const moved = base.point.transformPoint({ point: [3, -1, 7], transformation: placement });

        // Act
        const back = base.point.transformPoint({ point: moved, transformation: base.transforms.rigidInverse({ transformation: placement }) });

        // Assert
        expect(rounded(back)).toEqual([3, -1, 7]);
    });

    it("should refuse to undo a scale, which needs more than a turn and a move undone", () => {
        // Act
        const refused = (): unknown => base.transforms.rigidInverse({ transformation: base.transforms.uniformScale({ scale: 2 }) });

        // Assert
        expect(refused).toThrow(InputError);
        expect(refused).toThrow("`transformation` scales, stretches or mirrors; only one that moves and turns is undone here.");
    });

    it("should give the volume factor of a scale, -1 for a mirror and 1 for a turn", () => {
        // Act
        const scaled = base.transforms.determinant({ transformation: base.transforms.uniformScale({ scale: 2 }) });
        const mirrored = base.transforms.determinant({ transformation: base.transforms.scaleXYZ({ scaleXyz: [-1, 1, 1] }) });
        const turned = base.transforms.determinant({ transformation: base.transforms.rotationCenterX({ center: [0, 0, 0], angle: 37 }) });

        // Assert
        expect(scaled).toBe(8);
        expect(mirrored).toBe(-1);
        expect(turned).toBeCloseTo(1, 12);
    });

    it("should call a turn and a move rigid, and a scale or a mirror not", () => {
        // Act
        const turn = base.transforms.isRigid({ transformation: [...base.transforms.rotationCenterX({ center: [2, 0, 0], angle: 30 }), moveBy(1, 1, 1)] });
        const scale = base.transforms.isRigid({ transformation: base.transforms.uniformScale({ scale: 1.5 }) });
        const mirror = base.transforms.isRigid({ transformation: base.transforms.scaleXYZ({ scaleXyz: [1, -1, 1] }) });

        // Assert
        expect([turn, scale, mirror]).toEqual([true, false, false]);
    });

    it("should let a looser tolerance pass a nearly rigid matrix, and refuse a negative one", () => {
        // Arrange
        const nearly = base.transforms.uniformScale({ scale: 1 + 1e-5 });

        // Act
        const strict = base.transforms.isRigid({ transformation: nearly });
        const loose = base.transforms.isRigid({ transformation: nearly, tolerance: 1e-4 });
        const refused = (): unknown => base.transforms.isRigid({ transformation: nearly, tolerance: -1 });

        // Assert
        expect([strict, loose]).toEqual([false, true]);
        expect(refused).toThrow("`tolerance` is not a number of 0 or more.");
    });

    it("should hold each axis's length, not its square, to the tolerance", () => {
        // Act
        const longer = base.transforms.isRigid({ transformation: base.transforms.uniformScale({ scale: 1.006 }), tolerance: 0.01 });
        const shorter = base.transforms.isRigid({ transformation: base.transforms.uniformScale({ scale: 0.994 }), tolerance: 0.01 });
        const beyond = base.transforms.isRigid({ transformation: base.transforms.uniformScale({ scale: 1.011 }), tolerance: 0.01 });

        // Assert
        expect([longer, shorter, beyond]).toEqual([true, true, false]);
    });
});
