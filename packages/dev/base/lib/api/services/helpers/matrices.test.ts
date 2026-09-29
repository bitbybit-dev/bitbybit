import { describe, it, expect } from "vitest";
import { composed, followedBy, isTransformMatrix, symmetricEigen } from "./matrices";

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

const moveBy = (x: number, y: number, z: number): number[] => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];

const quarterTurnAboutZ = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

const applied = (matrix: readonly number[], point: readonly number[]): number[] =>
    [0, 1, 2].map(row => matrix[row]! * point[0]! + matrix[4 + row]! * point[1]! + matrix[8 + row]! * point[2]! + matrix[12 + row]!);

const times = (matrix: readonly (readonly number[])[], vector: readonly number[]): number[] =>
    matrix.map(row => row[0]! * vector[0]! + row[1]! * vector[1]! + row[2]! * vector[2]!);

describe("matrices", () => {

    describe("isTransformMatrix", () => {
        it("should take sixteen finite numbers", () => {
            // Act
            const taken = isTransformMatrix(IDENTITY);

            // Assert
            expect(taken).toBe(true);
        });

        it.each([
            { value: IDENTITY.slice(1), reason: "fifteen numbers" },
            { value: [...IDENTITY.slice(1), Number.NaN], reason: "a number that is not finite" },
            { value: [...IDENTITY.slice(1), "1"], reason: "a string among the numbers" },
            { value: { length: 16 }, reason: "something that is not a list" },
        ])("should refuse $reason", ({ value }) => {
            // Act
            const taken = isTransformMatrix(value);

            // Assert
            expect(taken).toBe(false);
        });
    });

    describe("followedBy", () => {
        it("should apply the first matrix, then the second", () => {
            // Act
            const moveThenTurn = followedBy(moveBy(5, 0, 0), quarterTurnAboutZ);
            const turnThenMove = followedBy(quarterTurnAboutZ, moveBy(5, 0, 0));

            // Assert
            expect(applied(moveThenTurn, [1, 0, 0])).toEqual([0, 6, 0]);
            expect(applied(turnThenMove, [1, 0, 0])).toEqual([5, 1, 0]);
        });

        it("should leave a matrix as it is when the other is the identity", () => {
            // Act
            const before = followedBy(IDENTITY, quarterTurnAboutZ);
            const after = followedBy(quarterTurnAboutZ, IDENTITY);

            // Assert
            expect(before).toEqual(quarterTurnAboutZ);
            expect(after).toEqual(quarterTurnAboutZ);
        });
    });

    describe("composed", () => {
        it("should give the identity for an empty list", () => {
            // Act
            const matrix = composed([]);

            // Assert
            expect(matrix).toEqual(IDENTITY);
        });

        it("should apply a list first to last, as nested products do", () => {
            // Arrange
            const list = [moveBy(1, 2, 3), quarterTurnAboutZ, moveBy(0, 0, -4)];

            // Act
            const matrix = composed(list);

            // Assert
            expect(matrix).toEqual(followedBy(followedBy(list[0]!, list[1]!), list[2]!));
            expect(applied(matrix, [0, 0, 0])).toEqual([-2, 1, -1]);
        });

        it("should give a new list, leaving the ones it was handed alone", () => {
            // Arrange
            const only = moveBy(1, 1, 1);

            // Act
            const matrix = composed([only]);

            // Assert
            expect(matrix).toEqual(only);
            expect(matrix).not.toBe(only);
        });
    });

    describe("symmetricEigen", () => {
        it("should give the axes of a diagonal matrix, largest value first", () => {
            // Act
            const pairs = symmetricEigen([[2, 0, 0], [0, 5, 0], [0, 0, 3]]);

            // Assert
            expect(pairs.map(pair => pair.value)).toEqual([5, 3, 2]);
            expect(pairs.map(pair => pair.vector.map(Math.abs))).toEqual([[0, 1, 0], [0, 0, 1], [1, 0, 0]]);
        });

        it("should give unit vectors at right angles, each turned by the matrix into its value times itself", () => {
            // Arrange
            const matrix = [[4, 1, 2], [1, 3, 0.5], [2, 0.5, 6]];

            // Act
            const pairs = symmetricEigen(matrix);

            // Assert
            pairs.forEach(({ value, vector }) => {
                times(matrix, vector).forEach((entry, i) => expect(entry).toBeCloseTo(value * vector[i]!, 12));
                expect(Math.hypot(...vector)).toBeCloseTo(1, 14);
            });
            expect(times([pairs[0]!.vector, pairs[1]!.vector, pairs[2]!.vector], pairs[0]!.vector)).toEqual([expect.closeTo(1, 14), expect.closeTo(0, 14), expect.closeTo(0, 14)]);
            expect(pairs[0]!.value).toBeGreaterThanOrEqual(pairs[1]!.value);
            expect(pairs[1]!.value).toBeGreaterThanOrEqual(pairs[2]!.value);
        });

        it("should leave the matrix it was handed alone", () => {
            // Arrange
            const matrix = [[2, 1, 0], [1, 2, 0], [0, 0, 1]];

            // Act
            symmetricEigen(matrix);

            // Assert
            expect(matrix).toEqual([[2, 1, 0], [1, 2, 0], [0, 0, 1]]);
        });
    });
});
