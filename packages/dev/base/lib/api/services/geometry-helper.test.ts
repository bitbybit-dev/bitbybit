import { describe, it, expect, beforeAll } from "vitest";
import * as Inputs from "../inputs";
import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";
import { Vector } from "./vector";

// The implementation that shipped before removeAllDuplicateVectors was made linear. Every
// equivalence test below runs its input through both and demands the identical result, so this is
// the specification of the behaviour the fast path has to reproduce exactly.
const removeAllDuplicateVectorsQuadraticOracle = (
    helper: GeometryHelper,
    vectors: number[][],
    tolerance = 1e-7,
): number[][] => {
    const cleanVectors: number[][] = [];
    vectors.forEach(vector => {
        if (!cleanVectors.some(s => helper.vectorsTheSame(vector, s, tolerance))) {
            cleanVectors.push(vector);
        }
    });
    return cleanVectors;
};

// Reference identity (toBe on every element) rather than deep equality: it proves the same
// elements, in the same order, and the same choice of which of a duplicate pair survived.
const expectSameAsOracle = (
    helper: GeometryHelper,
    vectors: number[][],
    tolerance?: number,
): number[][] => {
    const expected = tolerance === undefined
        ? removeAllDuplicateVectorsQuadraticOracle(helper, vectors)
        : removeAllDuplicateVectorsQuadraticOracle(helper, vectors, tolerance);
    const actual = tolerance === undefined
        ? helper.removeAllDuplicateVectors(vectors)
        : helper.removeAllDuplicateVectors(vectors, tolerance);
    expect(actual.length).toBe(expected.length);
    for (let i = 0; i < expected.length; i++) {
        expect(actual[i]).toBe(expected[i]);
    }
    return actual;
};

const mulberry32 = (seed: number) => {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

describe("GeometryHelper unit tests", () => {
    let geometryHelper: GeometryHelper;

    beforeAll(() => {
        geometryHelper = new GeometryHelper();
    });

    describe("arePointsTheSame", () => {
        describe("3D points (Point3)", () => {
            it("should return true for identical 3D points", () => {
                const pointA: Inputs.Base.Point3 = [1, 2, 3];
                const pointB: Inputs.Base.Point3 = [1, 2, 3];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-7)).toBe(true);
            });

            it("should return true for 3D points within tolerance", () => {
                const pointA: Inputs.Base.Point3 = [1, 2, 3];
                const pointB: Inputs.Base.Point3 = [1.0000001, 2.0000001, 3.0000001];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-5)).toBe(true);
            });

            it("should return false for 3D points outside tolerance", () => {
                const pointA: Inputs.Base.Point3 = [1, 2, 3];
                const pointB: Inputs.Base.Point3 = [1.001, 2, 3];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-5)).toBe(false);
            });

            it("should return false when only X differs beyond tolerance", () => {
                const pointA: Inputs.Base.Point3 = [0, 0, 0];
                const pointB: Inputs.Base.Point3 = [0.01, 0, 0];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-5)).toBe(false);
            });

            it("should return false when only Y differs beyond tolerance", () => {
                const pointA: Inputs.Base.Point3 = [0, 0, 0];
                const pointB: Inputs.Base.Point3 = [0, 0.01, 0];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-5)).toBe(false);
            });

            it("should return false when only Z differs beyond tolerance", () => {
                const pointA: Inputs.Base.Point3 = [0, 0, 0];
                const pointB: Inputs.Base.Point3 = [0, 0, 0.01];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-5)).toBe(false);
            });

            it("should return true for 3D points at origin", () => {
                const pointA: Inputs.Base.Point3 = [0, 0, 0];
                const pointB: Inputs.Base.Point3 = [0, 0, 0];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-7)).toBe(true);
            });

            it("should return true for negative 3D points within tolerance", () => {
                const pointA: Inputs.Base.Point3 = [-5, -10, -15];
                const pointB: Inputs.Base.Point3 = [-5.0000001, -10.0000001, -15.0000001];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-5)).toBe(true);
            });

            it("should return false for negative 3D points outside tolerance", () => {
                const pointA: Inputs.Base.Point3 = [-5, -10, -15];
                const pointB: Inputs.Base.Point3 = [-5.1, -10, -15];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-5)).toBe(false);
            });

            it("should handle very large 3D coordinates", () => {
                const pointA: Inputs.Base.Point3 = [1e10, 1e10, 1e10];
                const pointB: Inputs.Base.Point3 = [1e10, 1e10, 1e10];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-7)).toBe(true);
            });

            it("should handle very small 3D coordinates", () => {
                const pointA: Inputs.Base.Point3 = [1e-10, 1e-10, 1e-10];
                const pointB: Inputs.Base.Point3 = [1e-10, 1e-10, 1e-10];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-7)).toBe(true);
            });

            it("should return true when difference equals tolerance minus epsilon", () => {
                const tolerance = 0.01;
                const pointA: Inputs.Base.Point3 = [0, 0, 0];
                const pointB: Inputs.Base.Point3 = [0.009, 0, 0];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, tolerance)).toBe(true);
            });

            it("should return false when difference equals tolerance", () => {
                const tolerance = 0.01;
                const pointA: Inputs.Base.Point3 = [0, 0, 0];
                const pointB: Inputs.Base.Point3 = [0.01, 0, 0];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, tolerance)).toBe(false);
            });
        });

        describe("2D points (Point2)", () => {
            it("should return true for identical 2D points", () => {
                const pointA: Inputs.Base.Point2 = [1, 2];
                const pointB: Inputs.Base.Point2 = [1, 2];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-7)).toBe(true);
            });

            it("should return true for 2D points within tolerance", () => {
                const pointA: Inputs.Base.Point2 = [1, 2];
                const pointB: Inputs.Base.Point2 = [1.0000001, 2.0000001];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-5)).toBe(true);
            });

            it("should return false for 2D points outside tolerance", () => {
                const pointA: Inputs.Base.Point2 = [1, 2];
                const pointB: Inputs.Base.Point2 = [1.01, 2];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-5)).toBe(false);
            });

            it("should return false when only X differs beyond tolerance in 2D", () => {
                const pointA: Inputs.Base.Point2 = [0, 0];
                const pointB: Inputs.Base.Point2 = [0.01, 0];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-5)).toBe(false);
            });

            it("should return false when only Y differs beyond tolerance in 2D", () => {
                const pointA: Inputs.Base.Point2 = [0, 0];
                const pointB: Inputs.Base.Point2 = [0, 0.01];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-5)).toBe(false);
            });

            it("should return true for 2D points at origin", () => {
                const pointA: Inputs.Base.Point2 = [0, 0];
                const pointB: Inputs.Base.Point2 = [0, 0];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-7)).toBe(true);
            });

            it("should return true for negative 2D points within tolerance", () => {
                const pointA: Inputs.Base.Point2 = [-5, -10];
                const pointB: Inputs.Base.Point2 = [-5.0000001, -10.0000001];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-5)).toBe(true);
            });

            it("should return false for negative 2D points outside tolerance", () => {
                const pointA: Inputs.Base.Point2 = [-5, -10];
                const pointB: Inputs.Base.Point2 = [-5.1, -10];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-5)).toBe(false);
            });
        });

        describe("mixed dimensions", () => {
            it("should return false for 2D point compared to 3D point", () => {
                const pointA: Inputs.Base.Point2 = [1, 2];
                const pointB: Inputs.Base.Point3 = [1, 2, 0];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-7)).toBe(false);
            });

            it("should return false for 3D point compared to 2D point", () => {
                const pointA: Inputs.Base.Point3 = [1, 2, 0];
                const pointB: Inputs.Base.Point2 = [1, 2];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-7)).toBe(false);
            });
        });

        describe("tolerance edge cases", () => {
            it("should return false with zero tolerance even for identical points (due to < comparison)", () => {
                // Note: approxEq uses Math.abs(num1 - num2) < tolerance, so 0 < 0 is false
                const pointA: Inputs.Base.Point3 = [1, 2, 3];
                const pointB: Inputs.Base.Point3 = [1, 2, 3];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 0)).toBe(false);
            });

            it("should work with very small tolerance for identical points", () => {
                const pointA: Inputs.Base.Point3 = [1, 2, 3];
                const pointB: Inputs.Base.Point3 = [1, 2, 3];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-15)).toBe(true);
            });

            it("should fail with zero tolerance for any difference", () => {
                const pointA: Inputs.Base.Point3 = [1, 2, 3];
                const pointB: Inputs.Base.Point3 = [1.0000000001, 2, 3];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 0)).toBe(false);
            });

            it("should work with very large tolerance", () => {
                const pointA: Inputs.Base.Point3 = [0, 0, 0];
                const pointB: Inputs.Base.Point3 = [100, 100, 100];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1000)).toBe(true);
            });

            it("should work with default-like tolerance 1e-7", () => {
                const pointA: Inputs.Base.Point3 = [1, 2, 3];
                const pointB: Inputs.Base.Point3 = [1.00000001, 2.00000001, 3.00000001];
                expect(geometryHelper.arePointsTheSame(pointA, pointB, 1e-7)).toBe(true);
            });
        });
    });

    describe("approxEq", () => {
        it("should return true for equal numbers", () => {
            expect(geometryHelper.approxEq(5, 5, 1e-7)).toBe(true);
        });

        it("should return true for numbers within tolerance", () => {
            expect(geometryHelper.approxEq(5, 5.0000001, 1e-5)).toBe(true);
        });

        it("should return false for numbers outside tolerance", () => {
            expect(geometryHelper.approxEq(5, 5.01, 1e-5)).toBe(false);
        });

        it("should return true for zero values", () => {
            expect(geometryHelper.approxEq(0, 0, 1e-7)).toBe(true);
        });

        it("should return true for negative numbers within tolerance", () => {
            expect(geometryHelper.approxEq(-5, -5.0000001, 1e-5)).toBe(true);
        });

        it("should return false for negative numbers outside tolerance", () => {
            expect(geometryHelper.approxEq(-5, -5.01, 1e-5)).toBe(false);
        });

        it("should handle comparison across zero", () => {
            expect(geometryHelper.approxEq(-0.0000001, 0.0000001, 1e-5)).toBe(true);
        });

        it("should return false when difference equals tolerance", () => {
            expect(geometryHelper.approxEq(0, 0.01, 0.01)).toBe(false);
        });

        it("should return true when difference is less than tolerance", () => {
            expect(geometryHelper.approxEq(0, 0.009, 0.01)).toBe(true);
        });
    });

    describe("vectorsTheSame", () => {
        it("should return true for identical vectors", () => {
            expect(geometryHelper.vectorsTheSame([1, 2, 3], [1, 2, 3], 1e-7)).toBe(true);
        });

        it("should return true for vectors within tolerance", () => {
            expect(geometryHelper.vectorsTheSame([1, 2], [1.0000001, 2.0000001], 1e-5)).toBe(true);
        });

        it("should return false for vectors outside tolerance", () => {
            expect(geometryHelper.vectorsTheSame([1, 2], [1.01, 2], 1e-5)).toBe(false);
        });

        it("should return false for vectors of different lengths", () => {
            expect(geometryHelper.vectorsTheSame([1, 2], [1, 2, 3], 1e-7)).toBe(false);
        });

        it("should return true for empty vectors", () => {
            expect(geometryHelper.vectorsTheSame([], [], 1e-7)).toBe(true);
        });

        it("should return true for single element vectors within tolerance", () => {
            expect(geometryHelper.vectorsTheSame([5], [5.0000001], 1e-5)).toBe(true);
        });

        it("should return false for single element vectors outside tolerance", () => {
            expect(geometryHelper.vectorsTheSame([5], [5.01], 1e-5)).toBe(false);
        });

        it("should work with 4D vectors", () => {
            expect(geometryHelper.vectorsTheSame([1, 2, 3, 4], [1, 2, 3, 4], 1e-7)).toBe(true);
        });

        it("should return false for 4D vectors with one different element", () => {
            expect(geometryHelper.vectorsTheSame([1, 2, 3, 4], [1, 2, 3, 4.1], 1e-5)).toBe(false);
        });
    });

    describe("removeAllDuplicateVectors", () => {
        it("should remove duplicate vectors", () => {
            const vectors = [[1, 2], [1, 2], [3, 4]];
            expect(geometryHelper.removeAllDuplicateVectors(vectors, 1e-7)).toEqual([[1, 2], [3, 4]]);
        });

        it("should remove non-consecutive duplicates", () => {
            const vectors = [[1, 2], [3, 4], [1, 2], [5, 6]];
            expect(geometryHelper.removeAllDuplicateVectors(vectors, 1e-7)).toEqual([[1, 2], [3, 4], [5, 6]]);
        });

        it("should return empty array for empty input", () => {
            expect(geometryHelper.removeAllDuplicateVectors([], 1e-7)).toEqual([]);
        });

        it("should return single vector for single input", () => {
            expect(geometryHelper.removeAllDuplicateVectors([[1, 2]], 1e-7)).toEqual([[1, 2]]);
        });

        it("should remove duplicates within tolerance", () => {
            const vectors = [[1, 2], [1.0000001, 2.0000001]];
            expect(geometryHelper.removeAllDuplicateVectors(vectors, 1e-5)).toEqual([[1, 2]]);
        });

        it("should keep vectors outside tolerance", () => {
            const vectors = [[1, 2], [1.01, 2.01]];
            expect(geometryHelper.removeAllDuplicateVectors(vectors, 1e-5)).toEqual([[1, 2], [1.01, 2.01]]);
        });

        it("should handle 3D vectors", () => {
            const vectors = [[1, 2, 3], [1, 2, 3], [4, 5, 6]];
            expect(geometryHelper.removeAllDuplicateVectors(vectors, 1e-7)).toEqual([[1, 2, 3], [4, 5, 6]]);
        });

        it("should use default tolerance if not provided", () => {
            const vectors = [[1, 2], [1.00000001, 2.00000001]];
            expect(geometryHelper.removeAllDuplicateVectors(vectors)).toEqual([[1, 2]]);
        });
    });

    describe("removeConsecutiveVectorDuplicates", () => {
        it("should remove consecutive duplicate vectors", () => {
            const vectors = [[1, 2], [1, 2], [3, 4]];
            expect(geometryHelper.removeConsecutiveVectorDuplicates(vectors, false, 1e-7)).toEqual([[1, 2], [3, 4]]);
        });

        it("should not remove non-consecutive duplicates", () => {
            const vectors = [[1, 2], [3, 4], [1, 2]];
            expect(geometryHelper.removeConsecutiveVectorDuplicates(vectors, false, 1e-7)).toEqual([[1, 2], [3, 4], [1, 2]]);
        });

        it("should check first and last when flag is true", () => {
            const vectors = [[1, 2], [3, 4], [1, 2]];
            expect(geometryHelper.removeConsecutiveVectorDuplicates(vectors, true, 1e-7)).toEqual([[1, 2], [3, 4]]);
        });

        it("should not check first and last when flag is false", () => {
            const vectors = [[1, 2], [3, 4], [1, 2]];
            expect(geometryHelper.removeConsecutiveVectorDuplicates(vectors, false, 1e-7)).toEqual([[1, 2], [3, 4], [1, 2]]);
        });

        it("should return empty array for empty input", () => {
            expect(geometryHelper.removeConsecutiveVectorDuplicates([], true, 1e-7)).toEqual([]);
        });

        it("should return single vector for single input", () => {
            expect(geometryHelper.removeConsecutiveVectorDuplicates([[1, 2]], true, 1e-7)).toEqual([[1, 2]]);
        });

        it("should remove consecutive duplicates within tolerance (keeps last occurrence)", () => {
            const vectors = [[1, 2], [1.0000001, 2.0000001], [3, 4]];
            // Algorithm keeps the last occurrence of consecutive duplicates
            expect(geometryHelper.removeConsecutiveVectorDuplicates(vectors, false, 1e-5)).toEqual([[1.0000001, 2.0000001], [3, 4]]);
        });

        it("should keep consecutive vectors outside tolerance", () => {
            const vectors = [[1, 2], [1.01, 2.01], [3, 4]];
            expect(geometryHelper.removeConsecutiveVectorDuplicates(vectors, false, 1e-5)).toEqual([[1, 2], [1.01, 2.01], [3, 4]]);
        });

        it("should handle multiple consecutive duplicates", () => {
            const vectors = [[1, 2], [1, 2], [1, 2], [3, 4], [3, 4]];
            expect(geometryHelper.removeConsecutiveVectorDuplicates(vectors, false, 1e-7)).toEqual([[1, 2], [3, 4]]);
        });

        it("should handle all identical vectors", () => {
            const vectors = [[1, 2], [1, 2], [1, 2]];
            expect(geometryHelper.removeConsecutiveVectorDuplicates(vectors, false, 1e-7)).toEqual([[1, 2]]);
        });

        it("should handle all identical vectors with checkFirstAndLast", () => {
            const vectors = [[1, 2], [1, 2], [1, 2]];
            expect(geometryHelper.removeConsecutiveVectorDuplicates(vectors, true, 1e-7)).toEqual([]);
        });
    });

    describe("removeConsecutivePointDuplicates", () => {
        it("should remove consecutive duplicate 3D points", () => {
            const points: Inputs.Base.Point3[] = [[1, 2, 3], [1, 2, 3], [4, 5, 6]];
            expect(geometryHelper.removeConsecutivePointDuplicates(points, false, 1e-7)).toEqual([[1, 2, 3], [4, 5, 6]]);
        });

        it("should check first and last when flag is true", () => {
            const points: Inputs.Base.Point3[] = [[1, 2, 3], [4, 5, 6], [1, 2, 3]];
            expect(geometryHelper.removeConsecutivePointDuplicates(points, true, 1e-7)).toEqual([[1, 2, 3], [4, 5, 6]]);
        });

        it("should return empty array for empty input", () => {
            expect(geometryHelper.removeConsecutivePointDuplicates([], true, 1e-7)).toEqual([]);
        });

        it("should return single point for single input", () => {
            const points: Inputs.Base.Point3[] = [[1, 2, 3]];
            expect(geometryHelper.removeConsecutivePointDuplicates(points, true, 1e-7)).toEqual([[1, 2, 3]]);
        });

        it("should remove duplicates within tolerance (keeps last occurrence)", () => {
            const points: Inputs.Base.Point3[] = [[1, 2, 3], [1.0000001, 2.0000001, 3.0000001], [4, 5, 6]];
            // Algorithm keeps the last occurrence of consecutive duplicates
            expect(geometryHelper.removeConsecutivePointDuplicates(points, false, 1e-5)).toEqual([[1.0000001, 2.0000001, 3.0000001], [4, 5, 6]]);
        });
    });

    describe("getArrayDepth", () => {
        it("should return 0 for non-array", () => {
            expect(geometryHelper.getArrayDepth(5)).toBe(0);
        });

        it("should return 1 for flat array", () => {
            expect(geometryHelper.getArrayDepth([1, 2, 3])).toBe(1);
        });

        it("should return 2 for 2D array", () => {
            expect(geometryHelper.getArrayDepth([[1, 2], [3, 4]])).toBe(2);
        });

        it("should return 3 for 3D array", () => {
            expect(geometryHelper.getArrayDepth([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])).toBe(3);
        });

        it("should return -Infinity for empty array (due to Math.max with no arguments)", () => {
            // Note: Math.max(...[]) returns -Infinity, so 1 + (-Infinity) = -Infinity
            expect(geometryHelper.getArrayDepth([])).toBe(-Infinity);
        });

        it("should handle mixed depth arrays (returns max depth)", () => {
            expect(geometryHelper.getArrayDepth([[1, 2], [[3, 4]]])).toBe(3);
        });
    });

    describe("getFlatTransformations", () => {
        it("should return same array for depth 2 transformation", () => {
            const transform: Inputs.Base.TransformMatrixes = [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]];
            expect(geometryHelper.getFlatTransformations(transform)).toEqual(transform);
        });

        it("should flatten depth 3 transformation", () => {
            const transform: Inputs.Base.TransformMatrixes[] = [[[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1]]];
            const result = geometryHelper.getFlatTransformations(transform);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
            expect(result[1]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1]);
        });
    });

    describe("transformControlPoints", () => {
        it("should transform points using identity matrix", () => {
            const identity: Inputs.Base.TransformMatrixes = [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]];
            const points: Inputs.Base.Point3[] = [[1, 2, 3]];
            const result = geometryHelper.transformControlPoints(identity, points);
            expect(result[0]![0]).toBeCloseTo(1, 10);
            expect(result[0]![1]).toBeCloseTo(2, 10);
            expect(result[0]![2]).toBeCloseTo(3, 10);
        });

        it("should transform points using translation matrix", () => {
            // Translation by (10, 20, 30)
            const translation: Inputs.Base.TransformMatrixes = [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 30, 1]];
            const points: Inputs.Base.Point3[] = [[0, 0, 0]];
            const result = geometryHelper.transformControlPoints(translation, points);
            expect(result[0]![0]).toBeCloseTo(10, 10);
            expect(result[0]![1]).toBeCloseTo(20, 10);
            expect(result[0]![2]).toBeCloseTo(30, 10);
        });

        it("should transform multiple points", () => {
            const identity: Inputs.Base.TransformMatrixes = [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]];
            const points: Inputs.Base.Point3[] = [[1, 2, 3], [4, 5, 6]];
            const result = geometryHelper.transformControlPoints(identity, points);
            expect(result).toHaveLength(2);
        });

        it("should apply multiple transformations in sequence", () => {
            // Two translations: first by (1, 0, 0), then by (0, 1, 0)
            const transforms: Inputs.Base.TransformMatrixes = [
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1]
            ];
            const points: Inputs.Base.Point3[] = [[0, 0, 0]];
            const result = geometryHelper.transformControlPoints(transforms, points);
            expect(result[0]![0]).toBeCloseTo(1, 10);
            expect(result[0]![1]).toBeCloseTo(1, 10);
            expect(result[0]![2]).toBeCloseTo(0, 10);
        });

        it("should handle empty points array", () => {
            const identity: Inputs.Base.TransformMatrixes = [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]];
            const points: Inputs.Base.Point3[] = [];
            const result = geometryHelper.transformControlPoints(identity, points);
            expect(result).toEqual([]);
        });

        it("should apply uniform scale transformation", () => {
            // Scale by 2
            const scale: Inputs.Base.TransformMatrixes = [[2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1]];
            const points: Inputs.Base.Point3[] = [[1, 1, 1]];
            const result = geometryHelper.transformControlPoints(scale, points);
            expect(result[0]![0]).toBeCloseTo(2, 10);
            expect(result[0]![1]).toBeCloseTo(2, 10);
            expect(result[0]![2]).toBeCloseTo(2, 10);
        });
    });
});

describe("GeometryHelper removeAllDuplicateVectors equivalence with the quadratic original", () => {

    let helper: GeometryHelper;

    beforeAll(() => {
        helper = new GeometryHelper();
    });

    it("should match the original on an empty input", () => {
        expect(expectSameAsOracle(helper, [])).toEqual([]);
    });

    it("should match the original on a single vector", () => {
        expect(expectSameAsOracle(helper, [[1, 2, 3]])).toEqual([[1, 2, 3]]);
    });

    it("should match the original when every vector is a duplicate", () => {
        const vectors = [[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3]];
        expect(expectSameAsOracle(helper, vectors)).toEqual([[1, 2, 3]]);
    });

    it("should match the original when there are no duplicates at all", () => {
        const vectors = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]];
        expect(expectSameAsOracle(helper, vectors)).toEqual(vectors);
    });

    it("should keep the first of each duplicate group in first-seen order", () => {
        const vectors = [[5, 5, 5], [1, 1, 1], [5, 5, 5], [2, 2, 2], [1, 1, 1], [5, 5, 5]];
        expect(expectSameAsOracle(helper, vectors)).toEqual([[5, 5, 5], [1, 1, 1], [2, 2, 2]]);
    });

    it("should match the original across mixed vector lengths", () => {
        const vectors = [[1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5], [1, 2, 3], [1], [1, 2, 3, 4, 5]];
        expect(expectSameAsOracle(helper, vectors)).toEqual([[1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5]]);
    });

    it("should not let component values run together across different lengths", () => {
        const vectors = [[1, 23], [12, 3], [123], [1, 2, 3]];
        expect(expectSameAsOracle(helper, vectors)).toEqual(vectors);
    });

    it("should match the original on empty vectors, which the original treats as all the same", () => {
        const vectors = [[], [], [1], []];
        expect(expectSameAsOracle(helper, vectors)).toEqual([[], [1]]);
    });

    it("should treat negative zero and positive zero as the same, exactly as the original does", () => {
        const vectors = [[-0, 0, 0], [0, -0, 0], [0, 0, -0], [0, 0, 0], [-0, -0, -0]];
        const res = expectSameAsOracle(helper, vectors);
        expect(res.length).toBe(1);
        expect(res[0]).toBe(vectors[0]);
    });

    it("should keep negative zero apart from a value a whole tolerance away, as the original does", () => {
        const vectors = [[-0, 0, 0], [-1e-6, 0, 0], [1e-6, 0, 0]];
        expect(expectSameAsOracle(helper, vectors).length).toBe(3);
    });

    it("should keep every NaN bearing vector, because NaN never compares equal", () => {
        const vectors = [[NaN, 1, 2], [NaN, 1, 2], [1, NaN, 2], [1, 2, 3], [1, 2, 3], [NaN, NaN, NaN], [NaN, NaN, NaN]];
        const res = expectSameAsOracle(helper, vectors);
        expect(res.length).toBe(6);
    });

    it("should keep every infinite vector, because infinity never compares equal either", () => {
        const vectors = [
            [Infinity, 0, 0], [Infinity, 0, 0], [-Infinity, 0, 0], [-Infinity, 0, 0],
            [1, 2, 3], [1, 2, 3], [0, 0, Infinity],
        ];
        const res = expectSameAsOracle(helper, vectors);
        expect(res.length).toBe(6);
    });

    it("should match the original for floats that differ only in the last bits", () => {
        const vectors = [[0.1 + 0.2, 0, 0], [0.3, 0, 0], [0.3000002, 0, 0]];
        const res = expectSameAsOracle(helper, vectors);
        expect(res.length).toBe(2);
        expect(res[0]).toBe(vectors[0]);
        expect(res[1]).toBe(vectors[2]);
    });

    it("should match the original for pairs that straddle a tolerance sized grid boundary", () => {
        const tolerance = 1e-7;
        const vectors: number[][] = [];
        for (let i = -4; i <= 4; i++) {
            const onBoundary = i * tolerance;
            vectors.push([onBoundary, 0, 0]);
            vectors.push([onBoundary - tolerance / 4, 0, 0]);
            vectors.push([onBoundary + tolerance / 4, 0, 0]);
            vectors.push([onBoundary - tolerance / 2, 0, 0]);
            vectors.push([onBoundary + tolerance / 2, 0, 0]);
        }
        expectSameAsOracle(helper, vectors, tolerance);
    });

    it("should match the original for a chain of vectors each within tolerance of the previous one", () => {
        const tolerance = 1e-3;
        const vectors: number[][] = [];
        for (let i = 0; i < 400; i++) {
            vectors.push([i * tolerance * 0.6, 0, 0]);
        }
        expectSameAsOracle(helper, vectors, tolerance);
    });

    it("should match the original for a custom tolerance that swallows near neighbours", () => {
        const vectors = [[1, 2], [1.00001, 2], [2, 3], [2, 3], [1, 2.000000001]];
        expectSameAsOracle(helper, vectors, 0.0001);
        expectSameAsOracle(helper, vectors, 0.00001);
        expectSameAsOracle(helper, vectors, 0.1);
    });

    it("should match the original for a zero or negative tolerance, where nothing but empties collapse", () => {
        const vectors = [[1, 2], [1, 2], [], [], [3, 4]];
        expect(expectSameAsOracle(helper, vectors, 0)).toEqual([[1, 2], [1, 2], [], [3, 4]]);
        expect(expectSameAsOracle(helper, vectors, -1)).toEqual([[1, 2], [1, 2], [], [3, 4]]);
    });

    it("should match the original for a NaN tolerance", () => {
        const vectors = [[1, 2], [1, 2], [], [], [3, 4]];
        expectSameAsOracle(helper, vectors, NaN);
    });

    it("should match the original for an infinite tolerance, where everything of a length collapses", () => {
        const vectors = [[1, 2], [500, 600], [1, 2, 3], [7, 8, 9], [4, 5]];
        expect(expectSameAsOracle(helper, vectors, Infinity)).toEqual([[1, 2], [1, 2, 3]]);
    });

    it("should match the original for magnitudes far beyond safe grid arithmetic", () => {
        const tolerance = 1e-9;
        const huge = 1e12;
        const vectors = [
            [huge, 0, 0], [huge, 0, 0], [1, 2, 3], [1, 2, 3],
            [huge, 0, 0], [-huge, 0, 0], [-huge, 0, 0], [huge + 1, 0, 0],
        ];
        expect(expectSameAsOracle(helper, vectors, tolerance).length).toBe(4);
    });

    it("should match the original where a pair straddles the safe grid arithmetic threshold", () => {
        const tolerance = 1e-9;
        const threshold = 2 ** 50 * tolerance;
        const justAbove = threshold + tolerance / 4;
        const justBelow = threshold - tolerance / 4;
        expect(justAbove - justBelow).toBeLessThan(tolerance);
        const vectors = [
            [justAbove, 0, 0],
            [justBelow, 0, 0],
            [justBelow, 0, 0],
            [justAbove, 0, 0],
            [1, 1, 1],
        ];
        expect(expectSameAsOracle(helper, vectors, tolerance).length).toBe(2);
    });

    it("should match the original for very long vectors that agree on their first components", () => {
        const vectors: number[][] = [];
        for (let i = 0; i < 300; i++) {
            vectors.push([1, 2, 3, 4, 5, 6, i % 7, (i % 5) * 2, i % 3]);
        }
        const res = expectSameAsOracle(helper, vectors);
        expect(res.length).toBe(105);
    });

    it("should match the original for two dimensional and one dimensional inputs", () => {
        const vectors = [[1, 2], [1, 2], [3, 4], [1.00000001, 2], [3, 4.5]];
        expectSameAsOracle(helper, vectors);
        expectSameAsOracle(helper, [[1], [1], [2], [1.00000001], [2.5]]);
    });

    it("should match the original on a randomised lattice with many near duplicates", () => {
        const random = mulberry32(20260907);
        const tolerance = 1e-7;
        const vectors: number[][] = [];
        for (let i = 0; i < 3000; i++) {
            const lattice = () => Math.floor(random() * 12) * tolerance + (random() - 0.5) * tolerance * 1.4;
            vectors.push([lattice(), lattice(), lattice()]);
        }
        expectSameAsOracle(helper, vectors, tolerance);
    });

    it("should match the original on randomised mixed length inputs with odd values", () => {
        const random = mulberry32(424242);
        const oddValues = [0, -0, 1, -1, NaN, Infinity, -Infinity, 1e-7, -1e-7, 5e-8, 1e9, -1e9];
        for (let round = 0; round < 60; round++) {
            const vectors: number[][] = [];
            const count = 1 + Math.floor(random() * 40);
            for (let i = 0; i < count; i++) {
                const length = Math.floor(random() * 9);
                const vector: number[] = [];
                for (let d = 0; d < length; d++) {
                    vector.push(oddValues[Math.floor(random() * oddValues.length)]!);
                }
                vectors.push(vector);
            }
            const tolerance = [1e-7, 1e-3, 0, 1, 1e-12][Math.floor(random() * 5)]!;
            expectSameAsOracle(helper, vectors, tolerance);
        }
    });

    it("should match the original on a large point cloud", () => {
        const random = mulberry32(987654321);
        const vectors: number[][] = [];
        for (let i = 0; i < 4000; i++) {
            const point = [random() * 100, random() * 100, random() * 100];
            vectors.push(point);
            if (i % 3 === 0) {
                vectors.push([...point]);
            }
        }
        const res = expectSameAsOracle(helper, vectors);
        expect(res.length).toBe(4000);
    });

    it("should deduplicate twenty thousand vectors down to the ten thousand distinct ones", () => {
        const vectors: number[][] = [];
        for (let i = 0; i < 10000; i++) {
            vectors.push([i, i * 2, i * 3]);
            vectors.push([i, i * 2, i * 3]);
        }
        const res = helper.removeAllDuplicateVectors(vectors);
        expect(res.length).toBe(10000);
        expect(res[0]).toBe(vectors[0]);
        expect(res[9999]).toBe(vectors[19998]);
    });

    it("should reach the same result through the published Vector api", () => {
        const vector = new Vector(new MathBitByBit(), helper);
        const vectors = [[1, 2, 3], [1, 2, 3], [4, 5, 6], [1, 2, 3.00000001], [4, 5, 6]];
        const res = vector.removeAllDuplicateVectors({ vectors, tolerance: 1e-7 });
        expect(res).toEqual(removeAllDuplicateVectorsQuadraticOracle(helper, vectors, 1e-7));
        expect(res.length).toBe(2);
    });
});
