import * as Inputs from "../inputs";
import { GeometryHelper } from "./geometry-helper";

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
            const transform = [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]];
            expect(geometryHelper.getFlatTransformations(transform)).toEqual(transform);
        });

        it("should flatten depth 3 transformation", () => {
            const transform = [[[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1]]];
            const result = geometryHelper.getFlatTransformations(transform);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
            expect(result[1]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1]);
        });
    });

    describe("transformControlPoints", () => {
        it("should transform points using identity matrix", () => {
            const identity = [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]];
            const points: Inputs.Base.Point3[] = [[1, 2, 3]];
            const result = geometryHelper.transformControlPoints(identity, points);
            expect(result[0][0]).toBeCloseTo(1, 10);
            expect(result[0][1]).toBeCloseTo(2, 10);
            expect(result[0][2]).toBeCloseTo(3, 10);
        });

        it("should transform points using translation matrix", () => {
            // Translation by (10, 20, 30)
            const translation = [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 30, 1]];
            const points: Inputs.Base.Point3[] = [[0, 0, 0]];
            const result = geometryHelper.transformControlPoints(translation, points);
            expect(result[0][0]).toBeCloseTo(10, 10);
            expect(result[0][1]).toBeCloseTo(20, 10);
            expect(result[0][2]).toBeCloseTo(30, 10);
        });

        it("should transform multiple points", () => {
            const identity = [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]];
            const points: Inputs.Base.Point3[] = [[1, 2, 3], [4, 5, 6]];
            const result = geometryHelper.transformControlPoints(identity, points);
            expect(result).toHaveLength(2);
        });

        it("should apply multiple transformations in sequence", () => {
            // Two translations: first by (1, 0, 0), then by (0, 1, 0)
            const transforms = [
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1]
            ];
            const points: Inputs.Base.Point3[] = [[0, 0, 0]];
            const result = geometryHelper.transformControlPoints(transforms, points);
            expect(result[0][0]).toBeCloseTo(1, 10);
            expect(result[0][1]).toBeCloseTo(1, 10);
            expect(result[0][2]).toBeCloseTo(0, 10);
        });

        it("should handle empty points array", () => {
            const identity = [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]];
            const points: Inputs.Base.Point3[] = [];
            const result = geometryHelper.transformControlPoints(identity, points);
            expect(result).toEqual([]);
        });

        it("should apply uniform scale transformation", () => {
            // Scale by 2
            const scale = [[2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1]];
            const points: Inputs.Base.Point3[] = [[1, 1, 1]];
            const result = geometryHelper.transformControlPoints(scale, points);
            expect(result[0][0]).toBeCloseTo(2, 10);
            expect(result[0][1]).toBeCloseTo(2, 10);
            expect(result[0][2]).toBeCloseTo(2, 10);
        });
    });
});
