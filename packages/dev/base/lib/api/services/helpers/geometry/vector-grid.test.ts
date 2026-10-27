import { describe, expect, it } from "vitest";
import { uniqueVectors } from "./vector-grid";

const plainScan = (vectors: number[][], tolerance: number): { kept: number[][]; indexes: number[] } => {
    const kept: number[][] = [];
    const indexes = vectors.map(vector => {
        const found = kept.findIndex(other => other.length === vector.length && other.every((value, at) => Math.abs(value - vector[at]!) < tolerance));
        return found >= 0 ? found : kept.push(vector) - 1;
    });
    return { kept, indexes };
};

const seeded = (seed: number): (() => number) => {
    let state = seed;
    return () => {
        state = (state * 1103515245 + 12345) % 2147483648;
        return state / 2147483648;
    };
};

describe("uniqueVectors", () => {
    it("should keep the first of each group and point every vector at the kept one it matched", () => {
        // Act
        const result = uniqueVectors([[1, 2], [3, 4], [1, 2 + 1e-9], [5, 6], [3, 4]], 1e-7);

        // Assert
        expect(result.kept).toEqual([[1, 2], [3, 4], [5, 6]]);
        expect(result.indexes).toEqual([0, 1, 0, 2, 1]);
    });

    it("should agree with a plain scan, vector for vector, on clustered points near cell edges", () => {
        // Arrange
        const random = seeded(7);
        const tolerance = 1e-3;
        const centers = Array.from({ length: 40 }, () => [random(), random(), random()].map(value => Math.round(value * 50) * tolerance * 8));
        const vectors = Array.from({ length: 2000 }, () => centers[Math.floor(random() * centers.length)]!.map(value => value + (random() - 0.5) * tolerance * 3));

        // Act
        const result = uniqueVectors(vectors, tolerance);

        // Assert
        expect(result).toEqual(plainScan(vectors, tolerance));
    });

    it("should keep every vector with a component that is not finite on its own", () => {
        // Act
        const result = uniqueVectors([[Number.NaN, 0], [Number.NaN, 0], [Infinity, 0]], 1e-7);

        // Assert
        expect(result.indexes).toEqual([0, 1, 2]);
    });

    it("should match vectors the grid cannot place against every kept vector, and grid vectors against them", () => {
        // Arrange
        const huge = 2 ** 60;

        // Act
        const result = uniqueVectors([[huge, 0], [huge, 0], [1, 1], [1, 1]], 1e-7);

        // Assert
        expect(result).toEqual({ kept: [[huge, 0], [1, 1]], indexes: [0, 0, 1, 1] });
    });

    it("should keep vectors of different lengths apart", () => {
        // Act
        const result = uniqueVectors([[1, 2], [1, 2, 0], [1, 2]], 1e-7);

        // Assert
        expect(result.indexes).toEqual([0, 1, 0]);
    });
});
