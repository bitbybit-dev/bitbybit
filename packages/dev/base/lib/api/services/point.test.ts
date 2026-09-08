import { describe, it, expect, beforeAll, vi } from "vitest";
import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";
import { Point } from "./point";
import { Transforms } from "./transforms";
import { Vector } from "./vector";
import * as Inputs from "../inputs";
import { UnitTestHelper } from "../unit-test-helper";
import { Lists } from "./lists";

describe("Point unit tests", () => {
    const uh = new UnitTestHelper();

    let geometryHelper: GeometryHelper;
    let math: MathBitByBit;
    let vector: Vector;
    let point: Point;
    let lists: Lists;
    let transforms: Transforms;

    beforeAll(() => {
        geometryHelper = new GeometryHelper();
        math = new MathBitByBit();
        vector = new Vector(math, geometryHelper);
        transforms = new Transforms(vector, math);
        lists = new Lists();
        point = new Point(geometryHelper, transforms, vector, lists);
    });

    describe("Point Class Unit Tests (Integration)", () => {

        describe("transformPoint", () => {
            it("should translate a point correctly", () => {
                const p: Inputs.Base.Point3 = [1, 2, 3];
                const translationVec: Inputs.Base.Vector3 = [10, -5, 2];
                const transformation = transforms.translationXYZ({ translation: translationVec });
                const result = point.transformPoint({ point: p, transformation });
                uh.expectPointCloseTo(result, [11, -3, 5]);
            });

            it("should rotate a point around Z axis", () => {
                const p: Inputs.Base.Point3 = [1, 0, 5];
                const transformation = transforms.rotationCenterAxis({
                    center: [0, 0, 0],
                    axis: [0, 0, 1],
                    angle: 90
                });
                const result = point.transformPoint({ point: p, transformation });
                uh.expectPointCloseTo(result, [0, 1, 5]);
            });

            it("should scale a point relative to origin", () => {
                const p: Inputs.Base.Point3 = [2, 3, 4];
                const transformation = transforms.scaleCenterXYZ({
                    center: [0, 0, 0],
                    scaleXyz: [2, 0.5, 1]
                });
                const result = point.transformPoint({ point: p, transformation });
                uh.expectPointCloseTo(result, [4, 1.5, 4]);
            });
        });

        describe("transformPoints", () => {
            it("should translate multiple points correctly", () => {
                const pts: Inputs.Base.Point3[] = [[1, 2, 3], [10, 10, 10]];
                const translationVec: Inputs.Base.Vector3 = [5, -5, 0];
                const transformation = transforms.translationXYZ({ translation: translationVec });
                const result = point.transformPoints({ points: pts, transformation });
                uh.expectPointsCloseTo(result, [[6, -3, 3], [15, 5, 10]]);
            });

            it("should rotate multiple points", () => {
                const pts: Inputs.Base.Point3[] = [[1, 0, 0], [0, 1, 5]];
                const transformation = transforms.rotationCenterAxis({
                    center: [0, 0, 0],
                    axis: [0, 0, 1],
                    angle: -90
                });
                const result = point.transformPoints({ points: pts, transformation });
                uh.expectPointsCloseTo(result, [[0, -1, 0], [1, 0, 5]]);
            });

            it("should handle empty points array", () => {
                const pts: Inputs.Base.Point3[] = [];
                const transformation = transforms.identity();
                const result = point.transformPoints({ points: pts, transformation: [transformation] });
                expect(result).toEqual([]);
            });
        });

        describe("transformsForPoints", () => {
            it("should apply individual transforms to corresponding points", () => {
                const pts: Inputs.Base.Point3[] = [[1, 0, 0], [5, 5, 5]];
                const transformations = [
                    transforms.rotationCenterAxis({ center: [0, 0, 0], axis: [0, 0, 1], angle: 90 }),
                    transforms.translationXYZ({ translation: [1, 1, 1] })
                ];
                const result = point.transformsForPoints({ points: pts, transformation: transformations });
                uh.expectPointsCloseTo(result, [[0, 1, 0], [6, 6, 6]]);
            });

            it("should throw an error if points and transformations lengths differ", () => {
                const pts: Inputs.Base.Point3[] = [[1, 1, 1]];
                const transformations = [[transforms.identity()], [transforms.identity()]];
                expect(() => {
                    point.transformsForPoints({ points: pts, transformation: transformations });
                }).toThrow("You must provide equal nr of points and transformations");
            });

            it("should handle empty arrays", () => {
                const pts: Inputs.Base.Point3[] = [];
                const transformations: any[] = [];
                const result = point.transformsForPoints({ points: pts, transformation: transformations });
                expect(result).toEqual([]);
            });
        });

        describe("translatePoints", () => {
            it("should translate points by a single vector", () => {
                const pts: Inputs.Base.Point3[] = [[0, 0, 0], [1, -1, 2]];
                const translation: Inputs.Base.Vector3 = [10, 20, 30];
                const result = point.translatePoints({ points: pts, translation });
                uh.expectPointsCloseTo(result, [[10, 20, 30], [11, 19, 32]]);
            });
        });

        describe("translatePointsWithVectors", () => {
            it("should apply individual translation vectors to corresponding points", () => {
                const pts: Inputs.Base.Point3[] = [[1, 1, 1], [5, 5, 5]];
                const translations: Inputs.Base.Vector3[] = [[10, 0, 0], [0, 20, 0]];
                const result = point.translatePointsWithVectors({ points: pts, translations });
                uh.expectPointsCloseTo(result, [[11, 1, 1], [5, 25, 5]]);
            });

            it("should throw an error if points and translations lengths differ", () => {
                const pts: Inputs.Base.Point3[] = [[1, 1, 1]];
                const translations: Inputs.Base.Vector3[] = [[10, 0, 0], [0, 20, 0]];
                expect(() => {
                    point.translatePointsWithVectors({ points: pts, translations });
                }).toThrow("You must provide equal nr of points and translations");
            });
        });

        describe("translateXYZPoints", () => {
            it("should translate points by individual x, y, z values", () => {
                const pts: Inputs.Base.Point3[] = [[0, 0, 0], [1, -1, 2]];
                const x = -1, y = 2, z = -3;
                const result = point.translateXYZPoints({ points: pts, x, y, z });
                uh.expectPointsCloseTo(result, [[-1, 2, -3], [0, 1, -1]]);
            });
        });

        describe("scalePointsCenterXYZ", () => {
            it("should scale points relative to a center", () => {
                const pts: Inputs.Base.Point3[] = [[2, 2, 2], [0, 0, 0]];
                const center: Inputs.Base.Point3 = [1, 1, 1];
                const scaleXyz: Inputs.Base.Vector3 = [2, 3, 0.5];
                const result = point.scalePointsCenterXYZ({ points: pts, center, scaleXyz });
                uh.expectPointsCloseTo(result, [[3, 4, 1.5], [-1, -2, 0.5]]);
            });
        });

        describe("rotatePointsCenterAxis", () => {
            it("should rotate points around a center and axis", () => {
                const pts: Inputs.Base.Point3[] = [[2, 1, 5], [1, 1, 0]];
                const center: Inputs.Base.Point3 = [1, 1, 5];
                const axis: Inputs.Base.Vector3 = [0, 0, 1];
                const angle = 90;
                const result = point.rotatePointsCenterAxis({ points: pts, center, axis, angle });
                uh.expectPointsCloseTo(result, [[1, 2, 5], [1, 1, 0]]);
            });
        });

        describe("stretchPointsDirFromCenter", () => {
            it("should stretch a point along Z axis from origin by factor 2", () => {
                const pts: Inputs.Base.Point3[] = [[0, 0, 1]];
                const center: Inputs.Base.Point3 = [0, 0, 0];
                const direction: Inputs.Base.Vector3 = [0, 0, 1];
                const scale = 2;
                const result = point.stretchPointsDirFromCenter({ points: pts, center, direction, scale });
                uh.expectPointsCloseTo(result, [[0, 0, 2]]);
            });

            it("should stretch multiple points along X axis from origin by factor 3", () => {
                const pts: Inputs.Base.Point3[] = [[1, 0, 0], [2, 0, 0], [1, 1, 1]];
                const center: Inputs.Base.Point3 = [0, 0, 0];
                const direction: Inputs.Base.Vector3 = [1, 0, 0];
                const scale = 3;
                const result = point.stretchPointsDirFromCenter({ points: pts, center, direction, scale });
                uh.expectPointsCloseTo(result, [[3, 0, 0], [6, 0, 0], [3, 1, 1]]);
            });

            it("should stretch points along Y axis from a non-origin center", () => {
                const pts: Inputs.Base.Point3[] = [[0, 5, 0], [0, 10, 0]];
                const center: Inputs.Base.Point3 = [0, 5, 0];
                const direction: Inputs.Base.Vector3 = [0, 1, 0];
                const scale = 2;
                const result = point.stretchPointsDirFromCenter({ points: pts, center, direction, scale });
                uh.expectPointsCloseTo(result, [[0, 5, 0], [0, 15, 0]]);
            });

            it("should shrink points when scale is less than 1", () => {
                const pts: Inputs.Base.Point3[] = [[4, 0, 0], [8, 0, 0]];
                const center: Inputs.Base.Point3 = [0, 0, 0];
                const direction: Inputs.Base.Vector3 = [1, 0, 0];
                const scale = 0.5;
                const result = point.stretchPointsDirFromCenter({ points: pts, center, direction, scale });
                uh.expectPointsCloseTo(result, [[2, 0, 0], [4, 0, 0]]);
            });

            it("should flip points when scale is negative", () => {
                const pts: Inputs.Base.Point3[] = [[2, 0, 0]];
                const center: Inputs.Base.Point3 = [0, 0, 0];
                const direction: Inputs.Base.Vector3 = [1, 0, 0];
                const scale = -1;
                const result = point.stretchPointsDirFromCenter({ points: pts, center, direction, scale });
                uh.expectPointsCloseTo(result, [[-2, 0, 0]]);
            });

            it("should not change points when scale is 1", () => {
                const pts: Inputs.Base.Point3[] = [[1, 2, 3], [4, 5, 6]];
                const center: Inputs.Base.Point3 = [0, 0, 0];
                const direction: Inputs.Base.Vector3 = [1, 0, 0];
                const scale = 1;
                const result = point.stretchPointsDirFromCenter({ points: pts, center, direction, scale });
                uh.expectPointsCloseTo(result, [[1, 2, 3], [4, 5, 6]]);
            });

            it("should stretch along a diagonal direction", () => {
                const pts: Inputs.Base.Point3[] = [[1, 1, 0]];
                const center: Inputs.Base.Point3 = [0, 0, 0];
                const direction: Inputs.Base.Vector3 = [1, 1, 0];
                const scale = 2;
                const result = point.stretchPointsDirFromCenter({ points: pts, center, direction, scale });
                uh.expectPointsCloseTo(result, [[2, 2, 0]]);
            });

            it("should correctly stretch a point perpendicular to direction (no change in that component)", () => {
                const pts: Inputs.Base.Point3[] = [[0, 5, 0]];
                const center: Inputs.Base.Point3 = [0, 0, 0];
                const direction: Inputs.Base.Vector3 = [1, 0, 0];
                const scale = 10;
                const result = point.stretchPointsDirFromCenter({ points: pts, center, direction, scale });
                uh.expectPointsCloseTo(result, [[0, 5, 0]]);
            });

            it("should handle empty points array", () => {
                const pts: Inputs.Base.Point3[] = [];
                const center: Inputs.Base.Point3 = [0, 0, 0];
                const direction: Inputs.Base.Vector3 = [1, 0, 0];
                const scale = 2;
                const result = point.stretchPointsDirFromCenter({ points: pts, center, direction, scale });
                expect(result).toEqual([]);
            });

            it("should stretch points in 3D along a 3D diagonal direction", () => {
                const pts: Inputs.Base.Point3[] = [[1, 1, 1]];
                const center: Inputs.Base.Point3 = [0, 0, 0];
                const direction: Inputs.Base.Vector3 = [1, 1, 1];
                const scale = 3;
                const result = point.stretchPointsDirFromCenter({ points: pts, center, direction, scale });
                uh.expectPointsCloseTo(result, [[3, 3, 3]]);
            });

            it("should stretch relative to a 3D center point", () => {
                const pts: Inputs.Base.Point3[] = [[5, 5, 5]];
                const center: Inputs.Base.Point3 = [2, 2, 2];
                const direction: Inputs.Base.Vector3 = [1, 1, 1];
                const scale = 2;
                const result = point.stretchPointsDirFromCenter({ points: pts, center, direction, scale });
                uh.expectPointsCloseTo(result, [[8, 8, 8]]);
            });
        });

        describe("boundingBoxOfPoints", () => {
            it("should calculate the correct bounding box for multiple points", () => {
                const points: Inputs.Base.Point3[] = [[1, 2, 3], [4, -1, 6], [0, 5, -2]];
                const expectedBBox: Required<Inputs.Base.BoundingBox> = {
                    min: [0, -1, -2],
                    max: [4, 5, 6],
                    center: [2, 2, 2],
                    width: 4,
                    height: 6,
                    length: 8,
                };
                const result = point.boundingBoxOfPoints({ points }) as Required<Inputs.Base.BoundingBox>;
                expect(result.min).toEqual(expectedBBox.min);
                expect(result.max).toEqual(expectedBBox.max);
                uh.expectPointCloseTo(result.center, expectedBBox.center);
                expect(result.width).toBeCloseTo(expectedBBox.width);
                expect(result.height).toBeCloseTo(expectedBBox.height);
                expect(result.length).toBeCloseTo(expectedBBox.length);
            });

            it("should return a zero-dimension bounding box for a single point", () => {
                const points: Inputs.Base.Point3[] = [[5, 5, 5]];
                const expectedBBox: Required<Inputs.Base.BoundingBox> = {
                    min: [5, 5, 5],
                    max: [5, 5, 5],
                    center: [5, 5, 5],
                    width: 0,
                    height: 0,
                    length: 0,
                };
                const result = point.boundingBoxOfPoints({ points });
                expect(result).toEqual(expectedBBox);
            });

            it("should handle empty points array", () => {
                const points: Inputs.Base.Point3[] = [];
                const result = point.boundingBoxOfPoints({ points });
                expect(result.min).toEqual([Infinity, Infinity, Infinity]);
                expect(result.max).toEqual([-Infinity, -Infinity, -Infinity]);
                expect(result.center).toEqual([NaN, NaN, NaN]);
                expect(result.width).toEqual(-Infinity);
                expect(result.height).toEqual(-Infinity);
                expect(result.length).toEqual(-Infinity);
            });
        });

        describe("closestPointFromPoints methods", () => {
            const sourcePoint: Inputs.Base.Point3 = [0, 0, 0];
            const targetPoints: Inputs.Base.Point3[] = [
                [10, 0, 0],
                [0, 5, 0],
                [0, 0, -7],
                [3, 4, 0],
            ];
            const expectedClosestPoint: Inputs.Base.Point3 = [0, 5, 0];
            const expectedClosestIndex = 2;
            const expectedClosestDistance = 5;

            it("closestPointFromPointsDistance should return the minimum distance", () => {
                const distance = point.closestPointFromPointsDistance({ point: sourcePoint, points: targetPoints });
                expect(distance).toBeCloseTo(expectedClosestDistance);
            });

            it("closestPointFromPointsIndex should return the 1-based index of the closest point", () => {
                const index = point.closestPointFromPointsIndex({ point: sourcePoint, points: targetPoints });
                expect(index).toBe(expectedClosestIndex);
            });

            it("closestPointFromPoints should return the coordinates of the closest point", () => {
                const closest = point.closestPointFromPoints({ point: sourcePoint, points: targetPoints });
                expect(closest).toEqual(expectedClosestPoint);
            });

            it("should handle empty target points list (check internal method behavior)", () => {
                const testFuncDistance = () => point.closestPointFromPointsDistance({ point: sourcePoint, points: [] });
                const testFuncIndex = () => point.closestPointFromPointsIndex({ point: sourcePoint, points: [] });
                const testFuncPoint = () => point.closestPointFromPoints({ point: sourcePoint, points: [] });
                expect(testFuncDistance()).toBe(Number.MAX_SAFE_INTEGER);
                expect(testFuncIndex()).toBeNaN();
                expect(testFuncPoint()).toBeUndefined();
            });
        });

        describe("distance", () => {
            it("should calculate the distance between two points", () => {
                const p1: Inputs.Base.Point3 = [1, 2, 3];
                const p2: Inputs.Base.Point3 = [4, -2, 15];
                const dist = point.distance({ startPoint: p1, endPoint: p2 });
                expect(dist).toBeCloseTo(13);
            });

            it("should return 0 for coincident points", () => {
                const p1: Inputs.Base.Point3 = [5, 5, 5];
                const dist = point.distance({ startPoint: p1, endPoint: p1 });
                expect(dist).toBeCloseTo(0);
            });
        });

        describe("distancesToPoints", () => {
            it("should calculate distances from one start point to multiple end points", () => {
                const start: Inputs.Base.Point3 = [0, 0, 0];
                const ends: Inputs.Base.Point3[] = [
                    [3, 4, 0],
                    [0, 0, 1],
                    [1, 1, 1]
                ];
                const distances = point.distancesToPoints({ startPoint: start, endPoints: ends });
                expect(distances.length).toBe(3);
                expect(distances[0]).toBeCloseTo(5);
                expect(distances[1]).toBeCloseTo(1);
                expect(distances[2]).toBeCloseTo(Math.sqrt(3));
            });

            it("should return an empty array if end points list is empty", () => {
                const start: Inputs.Base.Point3 = [0, 0, 0];
                const ends: Inputs.Base.Point3[] = [];
                const distances = point.distancesToPoints({ startPoint: start, endPoints: ends });
                expect(distances).toEqual([]);
            });
        });

        describe("multiplyPoint", () => {
            it("should create an array with the specified number of identical points", () => {
                const p: Inputs.Base.Point3 = [10, 20, 30];
                const amount = 3;
                const result = point.multiplyPoint({ point: p, amountOfPoints: amount });
                expect(result).toHaveLength(amount);
                expect(result).toEqual([
                    [10, 20, 30],
                    [10, 20, 30],
                    [10, 20, 30]
                ]);
            });

            it("should return an empty array if amount is 0", () => {
                const p: Inputs.Base.Point3 = [10, 20, 30];
                const result = point.multiplyPoint({ point: p, amountOfPoints: 0 });
                expect(result).toEqual([]);
            });

            it("should return an empty array if amount is negative (or handle as error)", () => {
                const p: Inputs.Base.Point3 = [10, 20, 30];
                const result = point.multiplyPoint({ point: p, amountOfPoints: -1 });
                expect(result).toEqual([]);
            });
        });

        describe("getX, getY, getZ", () => {
            const p: Inputs.Base.Point3 = [-1.5, 0, 99.9];
            it("getX should return the first element", () => {
                expect(point.getX({ point: p })).toBe(-1.5);
            });
            it("getY should return the second element", () => {
                expect(point.getY({ point: p })).toBe(0);
            });
            it("getZ should return the third element", () => {
                expect(point.getZ({ point: p })).toBe(99.9);
            });
        });

        describe("averagePoint", () => {
            it("should calculate the average of multiple points", () => {
                const pts: Inputs.Base.Point3[] = [[1, 1, 1], [3, 5, -1], [5, 0, 6]];
                const result = point.averagePoint({ points: pts });
                uh.expectPointCloseTo(result, [3, 2, 2]);
            });

            it("should return the point itself if only one point is provided", () => {
                const pts: Inputs.Base.Point3[] = [[10, 20, 30]];
                const result = point.averagePoint({ points: pts });
                uh.expectPointCloseTo(result, [10, 20, 30]);
            });

            it("should return NaN components if points array is empty", () => {
                const pts: Inputs.Base.Point3[] = [];
                const result = point.averagePoint({ points: pts });
                expect(result[0]).toBeNaN();
                expect(result[1]).toBeNaN();
                expect(result[2]).toBeNaN();
            });
        });

        describe("pointXYZ", () => {
            it("should create a 3D point array from x, y, z", () => {
                const result = point.pointXYZ({ x: 1.1, y: -2.2, z: 3.3 });
                expect(result).toEqual([1.1, -2.2, 3.3]);
            });
        });

        describe("pointXY", () => {
            it("should create a 2D point array from x, y", () => {
                const result = point.pointXY({ x: 5, y: 10 });
                expect(result).toEqual([5, 10]);
            });
        });

        describe("spiral", () => {
            it("should generate the specified number of points", () => {
                const result = point.spiral({
                    phi: 1.618,
                    widening: 9,
                    radius: 10,
                    factor: 1,
                    numberPoints: 20
                });
                expect(result.length).toBe(20);
            });

            it("should generate points with Z=0", () => {
                const result = point.spiral({ phi: 1.618, widening: 9, radius: 5, factor: 2, numberPoints: 5 });
                expect(result.length).toBeGreaterThan(0);
                result.forEach(p => {
                    expect(p[0]).not.toBeNaN();
                    expect(p[1]).not.toBeNaN();
                    expect(p[2]).toBe(0);
                });
            });

            it("should handle step leading to division by zero in log (i=0)", () => {
                const result = point.spiral({ phi: 1.618, widening: 9, radius: 1, factor: 1, numberPoints: 2 });
                expect(result.length).toBe(2);
                expect(result[0]).toEqual([0, 0, 0]);
                expect(result[1]![0]).not.toBeNaN();
                expect(result[1]![1]).not.toBeNaN();
            });
        });

        describe("hexGrid", () => {
            it("should generate the correct number of points", () => {
                const nrX = 3, nrY = 4;
                const result = point.hexGrid({ radiusHexagon: 1, nrHexagonsX: nrX, nrHexagonsY: nrY, orientOnCenter: false, pointsOnGround: false });
                expect(result.length).toBe(nrX * nrY);
            });

            it("should generate points on XY plane by default", () => {
                const result = point.hexGrid({ radiusHexagon: 1, nrHexagonsX: 2, nrHexagonsY: 2, orientOnCenter: false, pointsOnGround: false });
                expect(result.length).toBe(4);
                result.forEach(p => expect(p[2]).toBe(0));
            });

            it("should place points on XZ plane if pointsOnGround is true", () => {
                const result = point.hexGrid({ radiusHexagon: 1, nrHexagonsX: 2, nrHexagonsY: 2, pointsOnGround: true, orientOnCenter: false });
                expect(result.length).toBe(4);
                result.forEach(p => expect(p[1]).toBe(0));
                expect(result[0]![2]).toBe(0);
                if (result.length > 1) {
                    expect(result[1]![2]).not.toBe(0);
                }
            });

            it("should center the grid if orientOnCenter is true", () => {
                const radius = 2;
                const nrX = 3, nrY = 3;
                const resultNoCenter = point.hexGrid({ radiusHexagon: radius, nrHexagonsX: nrX, nrHexagonsY: nrY, orientOnCenter: false, pointsOnGround: false });
                const resultCenter = point.hexGrid({ radiusHexagon: radius, nrHexagonsX: nrX, nrHexagonsY: nrY, orientOnCenter: true, pointsOnGround: false });

                let avgX = 0, avgY = 0, avgZ = 0;
                resultCenter.forEach(p => { avgX += p[0]; avgY += p[1]; avgZ += p[2]; });
                avgX /= resultCenter.length;
                avgY /= resultCenter.length;
                avgZ /= resultCenter.length;

                expect(avgX).toBeCloseTo(0.577);
                expect(avgY).toBeCloseTo(0);
                expect(avgZ).toBeCloseTo(0);

                expect(resultCenter).not.toEqual(resultNoCenter);
            });
        });

        describe("removeConsecutiveDuplicates", () => {
            it("should remove consecutive duplicate points within tolerance", () => {
                const pts: Inputs.Base.Point3[] = [[0, 0, 0], [0, 0, 1e-9], [1, 1, 1], [1, 1, 1 + 1e-4], [2, 2, 2]];
                const tolerance = 1e-5;
                const result = point.removeConsecutiveDuplicates({ points: pts, tolerance, checkFirstAndLast: false });
                uh.expectPointsCloseTo(result, [[0, 0, 0], [1, 1, 1], [1, 1, 1 + 1e-4], [2, 2, 2]]);
            });

            it("should remove consecutive duplicate points with default tolerance", () => {
                const pts: Inputs.Base.Point3[] = [[0, 0, 0], [0, 0, 1e-8], [1, 1, 1], [1, 1, 1 + 1e-3], [2, 2, 2]];
                const result = point.removeConsecutiveDuplicates({ points: pts, tolerance: undefined, checkFirstAndLast: false });
                uh.expectPointsCloseTo(result, [[0, 0, 0], [1, 1, 1], [1, 1, 1 + 1e-3], [2, 2, 2]]);
            });

            it("should keep all points if no consecutive duplicates exist", () => {
                const pts: Inputs.Base.Point3[] = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]];
                const result = point.removeConsecutiveDuplicates({ points: pts, tolerance: 1e-5, checkFirstAndLast: false });
                uh.expectPointsCloseTo(result, pts);
            });

            it("should handle checkFirstAndLast correctly for open polyline", () => {
                const pts: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 1], [2, 2, 2], [0, 0, 1e-9]];
                const result = point.removeConsecutiveDuplicates({ points: pts, checkFirstAndLast: true, tolerance: 1e-5 });
                uh.expectPointsCloseTo(result, [[0, 0, 0], [1, 1, 1], [2, 2, 2]]);
            });

            it("should handle checkFirstAndLast correctly for closed polyline (already duplicated)", () => {
                const pts: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 1], [2, 2, 2], [0, 0, 0]];
                const result = point.removeConsecutiveDuplicates({ points: pts, checkFirstAndLast: true, tolerance: 1e-5 });
                uh.expectPointsCloseTo(result, [[0, 0, 0], [1, 1, 1], [2, 2, 2]]);
            });

            it("should handle checkFirstAndLast=false", () => {
                const pts: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 1], [2, 2, 2], [0, 0, 1e-9]];
                const result = point.removeConsecutiveDuplicates({ points: pts, checkFirstAndLast: false, tolerance: 1e-5 });
                uh.expectPointsCloseTo(result, [[0, 0, 0], [1, 1, 1], [2, 2, 2], [0, 0, 1e-9]]);
            });

            it("should handle single point array", () => {
                const pts: Inputs.Base.Point3[] = [[1, 2, 3]];
                const result = point.removeConsecutiveDuplicates({ points: pts, tolerance: 1e-5, checkFirstAndLast: false });
                uh.expectPointsCloseTo(result, pts);
            });

            it("should handle empty point array", () => {
                const pts: Inputs.Base.Point3[] = [];
                const result = point.removeConsecutiveDuplicates({ points: pts, tolerance: 1e-5, checkFirstAndLast: false });
                expect(result).toEqual([]);
            });
        });

        describe("normalFromThreePoints", () => {
            it("should calculate the normal vector for non-collinear points (XY plane)", () => {
                const p1: Inputs.Base.Point3 = [0, 0, 0];
                const p2: Inputs.Base.Point3 = [1, 0, 0];
                const p3: Inputs.Base.Point3 = [0, 1, 0];
                const normal = point.normalFromThreePoints({ point1: p1, point2: p2, point3: p3, reverseNormal: false });
                uh.expectPointCloseTo(normal, [0, 0, 1]);
            });

            it("should calculate the normal vector for non-collinear points (off-axis)", () => {
                const p1: Inputs.Base.Point3 = [1, 1, 1];
                const p2: Inputs.Base.Point3 = [2, 1, 1];
                const p3: Inputs.Base.Point3 = [1, 2, 1];
                const normal = point.normalFromThreePoints({ point1: p1, point2: p2, point3: p3, reverseNormal: false });
                uh.expectPointCloseTo(normal, [0, 0, 1]);
            });

            it("should calculate the normal vector for points forming XZ plane", () => {
                const p1: Inputs.Base.Point3 = [0, 0, 0];
                const p2: Inputs.Base.Point3 = [1, 0, 0];
                const p3: Inputs.Base.Point3 = [0, 0, 1];
                const normal = point.normalFromThreePoints({ point1: p1, point2: p2, point3: p3, reverseNormal: false });
                uh.expectPointCloseTo(normal, [0, -1, 0]);
            });

            it("should reverse the normal if reverseNormal is true", () => {
                const p1: Inputs.Base.Point3 = [0, 0, 0];
                const p2: Inputs.Base.Point3 = [1, 0, 0];
                const p3: Inputs.Base.Point3 = [0, 1, 0];
                const normal = point.normalFromThreePoints({ point1: p1, point2: p2, point3: p3, reverseNormal: true });
                uh.expectPointCloseTo(normal, [0, 0, -1]);
            });

            it("should return undefined for collinear points", () => {
                const p1: Inputs.Base.Point3 = [0, 0, 0];
                const p2: Inputs.Base.Point3 = [1, 1, 1];
                const p3: Inputs.Base.Point3 = [2, 2, 2];
                const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
                const normal = point.normalFromThreePoints({ point1: p1, point2: p2, point3: p3, reverseNormal: false });
                expect(normal).toBeUndefined();
                expect(consoleWarnSpy).toHaveBeenCalledWith("Points are collinear or coincident; cannot calculate a unique normal.");
                consoleWarnSpy.mockRestore();
            });

            it("should return undefined for coincident points", () => {
                const p1: Inputs.Base.Point3 = [1, 1, 1];
                const p2: Inputs.Base.Point3 = [1, 1, 1];
                const p3: Inputs.Base.Point3 = [2, 3, 4];
                const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
                const normal = point.normalFromThreePoints({ point1: p1, point2: p2, point3: p3, reverseNormal: false });
                expect(normal).toBeUndefined();
                expect(consoleWarnSpy).toHaveBeenCalledWith("Points are collinear or coincident; cannot calculate a unique normal.");
                consoleWarnSpy.mockRestore();
            });

            it("should throw error for invalid point formats", () => {
                const p1: any = [0, 0];
                const p2: Inputs.Base.Point3 = [1, 1, 1];
                const p3: Inputs.Base.Point3 = [2, 2, 2];
                expect(() => point.normalFromThreePoints({ point1: p1, point2: p2, point3: p3, reverseNormal: false })).toThrow("All points must be arrays of 3 numbers [x, y, z]");
                expect(() => point.normalFromThreePoints({ point1: null as any, point2: p2, point3: p3, reverseNormal: false })).toThrow("All points must be arrays of 3 numbers [x, y, z]");
            });
        });

        describe("twoPointsAlmostEqual", () => {
            it("should return true for points within tolerance", () => {
                const p1: Inputs.Base.Point3 = [1, 1, 1];
                const p2: Inputs.Base.Point3 = [1, 1, 1 + 1e-7];
                const tolerance = 1e-5;
                expect(point.twoPointsAlmostEqual({ point1: p1, point2: p2, tolerance })).toBe(true);
            });

            it("should return true for identical points", () => {
                const p1: Inputs.Base.Point3 = [1, 1, 1];
                const tolerance = 1e-5;
                expect(point.twoPointsAlmostEqual({ point1: p1, point2: p1, tolerance })).toBe(true);
            });

            it("should return false for points outside tolerance", () => {
                const p1: Inputs.Base.Point3 = [1, 1, 1];
                const p2: Inputs.Base.Point3 = [1, 1, 1 + 1e-4];
                const tolerance = 1e-5;
                expect(point.twoPointsAlmostEqual({ point1: p1, point2: p2, tolerance })).toBe(false);
            });

            it("should return false for points equal to tolerance distance", () => {
                const p1: Inputs.Base.Point3 = [1, 1, 1];
                const p2: Inputs.Base.Point3 = [1, 1, 1 + 1e-5];
                const tolerance = 1e-5;
                expect(point.twoPointsAlmostEqual({ point1: p1, point2: p2, tolerance })).toBe(false);
            });
        });

    });

    describe("PointService.sortPoints", () => {

        it("should return an empty array when given an empty array", () => {
            const input: Inputs.Point.PointsDto = { points: [] };
            const result = point.sortPoints(input);
            expect(result).toEqual([]);
        });

        it("should return the same array when given an array with a single point", () => {
            const pt: Inputs.Base.Point3 = [1, 2, 3];
            const input: Inputs.Point.PointsDto = { points: [pt] };
            const result = point.sortPoints(input);
            expect(result).toEqual([pt]);
        });

        it("should not modify the original input array (immutability)", () => {
            const originalPoints: Inputs.Base.Point3[] = [[3, 0, 0], [1, 0, 0], [2, 0, 0]];
            const input: Inputs.Point.PointsDto = { points: originalPoints };
            const originalCopy = [...originalPoints];
            const result = point.sortPoints(input);
            expect(result).not.toBe(originalPoints);
            expect(originalPoints).toEqual(originalCopy);
        });

        it("should correctly sort points primarily by the X coordinate", () => {
            const input: Inputs.Point.PointsDto = { points: [[3, 0, 0], [1, 5, 5], [2, -1, -1]] };
            const expected: Inputs.Base.Point3[] = [[1, 5, 5], [2, -1, -1], [3, 0, 0]];
            const result = point.sortPoints(input);
            expect(result).toEqual(expected);
        });

        it("should correctly sort points with the same X coordinate by the Y coordinate", () => {
            const input: Inputs.Point.PointsDto = { points: [[1, 5, 0], [2, 0, 0], [1, 2, 5], [1, 8, -1]] };
            const expected: Inputs.Base.Point3[] = [[1, 2, 5], [1, 5, 0], [1, 8, -1], [2, 0, 0]];
            const result = point.sortPoints(input);
            expect(result).toEqual(expected);
        });

        it("should correctly sort points with the same X and Y coordinates by the Z coordinate", () => {
            const input: Inputs.Point.PointsDto = { points: [[1, 5, 10], [2, 0, 0], [1, 5, -2], [1, 5, 0]] };
            const expected: Inputs.Base.Point3[] = [[1, 5, -2], [1, 5, 0], [1, 5, 10], [2, 0, 0]];
            const result = point.sortPoints(input);
            expect(result).toEqual(expected);
        });

        it("should handle a mix of points with various coordinates including negatives", () => {
            const input: Inputs.Point.PointsDto = {
                points: [
                    [2, 1, 5], [1, 5, 0], [2, 1, 0], [-1, 10, 0], [1, 0, 0], [2, 0, 0], [-1, -5, 10]
                ]
            };
            const expected: Inputs.Base.Point3[] = [
                [-1, -5, 10], [-1, 10, 0], [1, 0, 0], [1, 5, 0], [2, 0, 0], [2, 1, 0], [2, 1, 5]
            ];
            const result = point.sortPoints(input);
            expect(result).toEqual(expected);
        });

        it("should handle already sorted points correctly", () => {
            const expected: Inputs.Base.Point3[] = [[1, 2, 3], [1, 2, 4], [1, 3, 0], [2, 0, 0]];
            const input: Inputs.Point.PointsDto = { points: [...expected] };
            const result = point.sortPoints(input);
            expect(result).toEqual(expected);
        });

        it("should handle reverse sorted points correctly", () => {
            const input: Inputs.Point.PointsDto = { points: [[3, 0, 0], [2, 0, 0], [1, 0, 0]] };
            const expected: Inputs.Base.Point3[] = [[1, 0, 0], [2, 0, 0], [3, 0, 0]];
            const result = point.sortPoints(input);
            expect(result).toEqual(expected);
        });

        it("should handle duplicate points", () => {
            const input: Inputs.Point.PointsDto = { points: [[1, 1, 1], [0, 0, 0], [2, 2, 2], [0, 0, 0], [1, 1, 1]] };
            const expected: Inputs.Base.Point3[] = [[0, 0, 0], [0, 0, 0], [1, 1, 1], [1, 1, 1], [2, 2, 2]];
            const result = point.sortPoints(input);
            expect(result).toEqual(expected);
        });

        it("should handle floating point numbers correctly", () => {
            const input: Inputs.Point.PointsDto = { points: [[1.5, 0.1, 0], [1.1, 0.2, 0], [1.5, 0, 0], [1.1, 0.1, 0]] };
            const expected: Inputs.Base.Point3[] = [[1.1, 0.1, 0], [1.1, 0.2, 0], [1.5, 0, 0], [1.5, 0.1, 0]];
            const result = point.sortPoints(input);
            expect(result).toEqual(expected);
        });
    });

    describe("calculateMaxFilletRadius", () => {
        const defaultTolerance = 1e-7;
        const precision = 6;

        const createInput = (p1: Inputs.Base.Point3, corner: Inputs.Base.Point3, p2: Inputs.Base.Point3, tolerance: number = defaultTolerance): Inputs.Point.ThreePointsToleranceDto => ({
            start: p1,
            center: p2,
            end: corner,
            tolerance: tolerance
        });

        it("should calculate correct radius for a simple 90-degree corner (2D)", () => {
            const geoP1: Inputs.Base.Point3 = [5, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [0, 3, 0];
            const input = createInput(geoP1, geoC, geoP2);
            expect(point.maxFilletRadius(input)).toBeCloseTo(3.0, precision);
        });

        it("should calculate correct radius for a symmetric 90-degree corner (2D)", () => {
            const geoP1: Inputs.Base.Point3 = [4, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [0, 4, 0];
            const input = createInput(geoP1, geoC, geoP2);
            expect(point.maxFilletRadius(input)).toBeCloseTo(4.0, precision);
        });

        it("should calculate correct radius for an acute angle (60 degrees, 2D)", () => {
            const geoP1: Inputs.Base.Point3 = [5, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [5 * Math.cos(Math.PI / 3), 5 * Math.sin(Math.PI / 3), 0];
            const input = createInput(geoP1, geoC, geoP2);
            const expected = 5 * Math.tan(Math.PI / 6);
            expect(point.maxFilletRadius(input)).toBeCloseTo(expected, precision);
        });

        it("should calculate correct radius for an obtuse angle (120 degrees, 2D)", () => {
            const geoP1: Inputs.Base.Point3 = [4, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [6 * Math.cos(2 * Math.PI / 3), 6 * Math.sin(2 * Math.PI / 3), 0];
            const input = createInput(geoP1, geoC, geoP2);
            const expected = 4 * Math.tan(Math.PI / 3);
            expect(point.maxFilletRadius(input)).toBeCloseTo(expected, precision);
        });

        it("should return 0 for collinear points (0 degrees)", () => {
            const geoP1: Inputs.Base.Point3 = [5, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [10, 0, 0];
            const input = createInput(geoP1, geoC, geoP2);
            expect(point.maxFilletRadius(input)).toBeCloseTo(0, precision);
        });

        it("should return 0 for collinear points (180 degrees)", () => {
            const geoP1: Inputs.Base.Point3 = [5, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [-3, 0, 0];
            const input = createInput(geoP1, geoC, geoP2);
            expect(point.maxFilletRadius(input)).toBeCloseTo(0, precision);
        });

        it("should return 0 if one segment has near-zero length (P1=C)", () => {
            const geoP1: Inputs.Base.Point3 = [defaultTolerance / 2, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [0, 3, 0];
            const input = createInput(geoP1, geoC, geoP2);
            expect(point.maxFilletRadius(input)).toBeCloseTo(0, precision);
        });

        it("should return 0 if one segment has near-zero length (P2=C)", () => {
            const geoP1: Inputs.Base.Point3 = [5, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [0, defaultTolerance / 3, 0];
            const input = createInput(geoP1, geoC, geoP2);
            expect(point.maxFilletRadius(input)).toBeCloseTo(0, precision);
        });

        it("should use the provided tolerance if specified", () => {
            const customTolerance = 1e-4;
            const geoP1: Inputs.Base.Point3 = [customTolerance / 2, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [0, 3, 0];
            const input = createInput(geoP1, geoC, geoP2, customTolerance);
            expect(point.maxFilletRadius(input)).toBeCloseTo(0, precision);

            const geoP1_ok: Inputs.Base.Point3 = [customTolerance * 2, 0, 0];
            const input_ok = createInput(geoP1_ok, geoC, geoP2, customTolerance);
            expect(point.maxFilletRadius(input_ok)).toBeGreaterThan(0);
        });

        it("should return 0 if all points coincide", () => {
            const geoP1: Inputs.Base.Point3 = [0, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [0, 0, 0];
            const input = createInput(geoP1, geoC, geoP2);
            expect(point.maxFilletRadius(input)).toBeCloseTo(0, precision);
        });

        it("should calculate correct radius for a corner in 3D space", () => {
            const geoP1: Inputs.Base.Point3 = [1, 1, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [0, 2, 0];
            const input = createInput(geoP1, geoC, geoP2);
            const expected = Math.sqrt(2) * Math.tan(Math.PI / 8);
            expect(point.maxFilletRadius(input)).toBeCloseTo(expected, precision);
        });
    });

    describe("calculateMaxFilletRadiusHalfLine", () => {
        const defaultTolerance = 1e-7;
        const precision = 6;

        const createInput = (p1: Inputs.Base.Point3, corner: Inputs.Base.Point3, p2: Inputs.Base.Point3, tolerance: number = defaultTolerance): Inputs.Point.ThreePointsToleranceDto => ({
            start: p1, center: p2, end: corner, tolerance: tolerance
        });

        it("should calculate correct radius for a simple 90-degree corner (2D)", () => {
            const geoP1: Inputs.Base.Point3 = [5, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [0, 3, 0];
            const input = createInput(geoP1, geoC, geoP2);
            expect(point.maxFilletRadiusHalfLine(input)).toBeCloseTo(1.5, precision);
        });

        it("should calculate correct radius for a symmetric 90-degree corner (2D)", () => {
            const geoP1: Inputs.Base.Point3 = [4, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [0, 4, 0];
            const input = createInput(geoP1, geoC, geoP2);
            expect(point.maxFilletRadiusHalfLine(input)).toBeCloseTo(2.0, precision);
        });

        it("should calculate correct radius for an acute angle (60 degrees, 2D)", () => {
            const geoP1: Inputs.Base.Point3 = [6, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [4 * Math.cos(Math.PI / 3), 4 * Math.sin(Math.PI / 3), 0];
            const input = createInput(geoP1, geoC, geoP2);
            const expected = 2 * Math.tan(Math.PI / 6);
            expect(point.maxFilletRadiusHalfLine(input)).toBeCloseTo(expected, precision);
        });

        it("should calculate correct radius for an obtuse angle (120 degrees, 2D)", () => {
            const geoP1: Inputs.Base.Point3 = [4, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [6 * Math.cos(2 * Math.PI / 3), 6 * Math.sin(2 * Math.PI / 3), 0];
            const input = createInput(geoP1, geoC, geoP2);
            const expected = 2 * Math.tan(Math.PI / 3);
            expect(point.maxFilletRadiusHalfLine(input)).toBeCloseTo(expected, precision);
        });

        it("should return 0 for collinear points (0 degrees)", () => {
            const geoP1: Inputs.Base.Point3 = [5, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [10, 0, 0];
            const input = createInput(geoP1, geoC, geoP2);
            expect(point.maxFilletRadiusHalfLine(input)).toBeCloseTo(0, precision);
        });

        it("should return 0 if one segment has near-zero length", () => {
            const geoP1: Inputs.Base.Point3 = [5, 0, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [0, defaultTolerance / 3, 0];
            const input = createInput(geoP1, geoC, geoP2);
            expect(point.maxFilletRadiusHalfLine(input)).toBeCloseTo(0, precision);
        });

        it("should calculate correct radius for a corner in 3D space", () => {
            const geoP1: Inputs.Base.Point3 = [1, 1, 0];
            const geoC: Inputs.Base.Point3 = [0, 0, 0];
            const geoP2: Inputs.Base.Point3 = [0, 2, 0];
            const input = createInput(geoP1, geoC, geoP2);
            const expected = (Math.sqrt(2) / 2.0) * Math.tan(Math.PI / 8);
            expect(point.maxFilletRadiusHalfLine(input)).toBeCloseTo(expected, precision);
        });
    });

    describe("safestPointsMaxFilletHalfLine", () => {
        const precision = 6;

        it("should return 0 for fewer than 3 points", () => {
            const pts: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 0]];
            const result = point.safestPointsMaxFilletHalfLine({ points: pts, checkLastWithFirst: false });
            expect(result).toBe(0);
        });

        it("should return 0 for a single point", () => {
            const pts: Inputs.Base.Point3[] = [[0, 0, 0]];
            const result = point.safestPointsMaxFilletHalfLine({ points: pts, checkLastWithFirst: false });
            expect(result).toBe(0);
        });

        it("should return 0 for an empty array", () => {
            const pts: Inputs.Base.Point3[] = [];
            const result = point.safestPointsMaxFilletHalfLine({ points: pts, checkLastWithFirst: false });
            expect(result).toBe(0);
        });

        it("should calculate safest fillet for a simple triangle (90-degree corner)", () => {
            const pts: Inputs.Base.Point3[] = [[4, 0, 0], [0, 0, 0], [0, 4, 0]];
            const result = point.safestPointsMaxFilletHalfLine({ points: pts, checkLastWithFirst: false });
            expect(result).toBeCloseTo(2.0, precision);
        });

        it("should return minimum fillet radius among multiple corners", () => {
            const pts: Inputs.Base.Point3[] = [
                [4, 0, 0],
                [0, 0, 0],
                [0, 2, 0],
                [6, 2, 0]
            ];
            const result = point.safestPointsMaxFilletHalfLine({ points: pts, checkLastWithFirst: false });
            expect(result).toBeCloseTo(1.0, precision);
        });

        it("should handle closed polyline with checkLastWithFirst=true", () => {
            const pts: Inputs.Base.Point3[] = [
                [0, 0, 0],
                [4, 0, 0],
                [4, 4, 0],
                [0, 4, 0]
            ];
            const result = point.safestPointsMaxFilletHalfLine({ points: pts, checkLastWithFirst: true });
            expect(result).toBeCloseTo(2.0, precision);
        });

        it("should return smaller radius when one corner has shorter arms", () => {
            const pts: Inputs.Base.Point3[] = [
                [0, 0, 0],
                [2, 0, 0],
                [2, 6, 0],
                [0, 6, 0]
            ];
            const result = point.safestPointsMaxFilletHalfLine({ points: pts, checkLastWithFirst: true });
            expect(result).toBeCloseTo(1.0, precision);
        });

        it("should return 0 when one corner has collinear points", () => {
            const pts: Inputs.Base.Point3[] = [
                [0, 0, 0],
                [2, 0, 0],
                [4, 0, 0]
            ];
            const result = point.safestPointsMaxFilletHalfLine({ points: pts, checkLastWithFirst: false });
            expect(result).toBeCloseTo(0, precision);
        });

        it("should handle equilateral triangle (60-degree angles)", () => {
            const side = 4;
            const h = side * Math.sqrt(3) / 2;
            const pts: Inputs.Base.Point3[] = [
                [0, 0, 0],
                [side, 0, 0],
                [side / 2, h, 0]
            ];
            const expected = (side / 2) * Math.tan(Math.PI / 6);
            const result = point.safestPointsMaxFilletHalfLine({ points: pts, checkLastWithFirst: true });
            expect(result).toBeCloseTo(expected, precision);
        });

        it("should handle regular hexagon", () => {
            const radius = 2;
            const pts: Inputs.Base.Point3[] = [];
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                pts.push([
                    radius * Math.sin(angle),
                    radius * Math.cos(angle),
                    0
                ]);
            }
            const expected = (radius / 2) * Math.tan(Math.PI / 3);
            const result = point.safestPointsMaxFilletHalfLine({ points: pts, checkLastWithFirst: true });
            expect(result).toBeCloseTo(expected, precision);
        });

        it("should handle 3D polyline", () => {
            const pts: Inputs.Base.Point3[] = [
                [4, 0, 0],
                [0, 0, 0],
                [0, 0, 4]
            ];
            const result = point.safestPointsMaxFilletHalfLine({ points: pts, checkLastWithFirst: false });
            expect(result).toBeCloseTo(2.0, precision);
        });
    });

    describe("hexGridScaledToFit", () => {
        const precision = 6;

        it("should return empty result for invalid dimensions (zero width)", () => {
            const result = point.hexGridScaledToFit({
                width: 0,
                height: 10,
                nrHexagonsInWidth: 2,
                nrHexagonsInHeight: 2
            });
            expect(result.centers).toEqual([]);
            expect(result.hexagons).toEqual([]);
            expect(result.shortestDistEdge).toBeUndefined();
            expect(result.longestDistEdge).toBeUndefined();
            expect(result.maxFilletRadius).toBeUndefined();
        });

        it("should return empty result for invalid dimensions (zero height)", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 0,
                nrHexagonsInWidth: 2,
                nrHexagonsInHeight: 2
            });
            expect(result.centers).toEqual([]);
            expect(result.hexagons).toEqual([]);
        });

        it("should return empty result for invalid hexagon counts (zero)", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 10,
                nrHexagonsInWidth: 0,
                nrHexagonsInHeight: 2
            });
            expect(result.centers).toEqual([]);
            expect(result.hexagons).toEqual([]);
        });

        it("should generate correct number of hexagons for 2x2 grid", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 10,
                nrHexagonsInWidth: 2,
                nrHexagonsInHeight: 2
            });
            expect(result.centers).toHaveLength(4);
            expect(result.hexagons).toHaveLength(4);
        });

        it("should generate correct number of hexagons for 3x4 grid", () => {
            const result = point.hexGridScaledToFit({
                width: 20,
                height: 15,
                nrHexagonsInWidth: 3,
                nrHexagonsInHeight: 4
            });
            expect(result.centers).toHaveLength(12);
            expect(result.hexagons).toHaveLength(12);
        });

        it("should generate hexagons with exactly 6 vertices each", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 10,
                nrHexagonsInWidth: 2,
                nrHexagonsInHeight: 2
            });
            result.hexagons.forEach(hex => {
                expect(hex).toHaveLength(6);
            });
        });

        it("should scale hexagons to fit within specified dimensions", () => {
            const width = 20;
            const height = 15;
            const result = point.hexGridScaledToFit({
                width,
                height,
                nrHexagonsInWidth: 3,
                nrHexagonsInHeight: 3
            });

            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            result.hexagons.forEach(hex => {
                hex.forEach(vertex => {
                    if (vertex[0] < minX) minX = vertex[0];
                    if (vertex[0] > maxX) maxX = vertex[0];
                    if (vertex[1] < minY) minY = vertex[1];
                    if (vertex[1] > maxY) maxY = vertex[1];
                });
            });

            expect(minX).toBeCloseTo(0, precision);
            expect(maxX).toBeCloseTo(width, precision);
            expect(minY).toBeCloseTo(0, precision);
            expect(maxY).toBeCloseTo(height, precision);
        });

        it("should place all points on Z=0 by default", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 10,
                nrHexagonsInWidth: 2,
                nrHexagonsInHeight: 2
            });

            result.centers.forEach(center => {
                expect(center[2]).toBe(0);
            });
            result.hexagons.forEach(hex => {
                hex.forEach(vertex => {
                    expect(vertex[2]).toBe(0);
                });
            });
        });

        it("should center the grid when centerGrid=true", () => {
            const width = 10;
            const height = 10;
            const result = point.hexGridScaledToFit({
                width,
                height,
                nrHexagonsInWidth: 2,
                nrHexagonsInHeight: 2,
                centerGrid: true
            });

            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            result.hexagons.forEach(hex => {
                hex.forEach(vertex => {
                    if (vertex[0] < minX) minX = vertex[0];
                    if (vertex[0] > maxX) maxX = vertex[0];
                    if (vertex[1] < minY) minY = vertex[1];
                    if (vertex[1] > maxY) maxY = vertex[1];
                });
            });

            expect(minX).toBeCloseTo(-width / 2, precision);
            expect(maxX).toBeCloseTo(width / 2, precision);
            expect(minY).toBeCloseTo(-height / 2, precision);
            expect(maxY).toBeCloseTo(height / 2, precision);
        });

        it("should place points on ground (XZ plane) when pointsOnGround=true", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 10,
                nrHexagonsInWidth: 2,
                nrHexagonsInHeight: 2,
                pointsOnGround: true
            });

            result.centers.forEach(center => {
                expect(center[1]).toBe(0);
            });
            result.hexagons.forEach(hex => {
                hex.forEach(vertex => {
                    expect(vertex[1]).toBe(0);
                });
            });
        });

        it("should return valid edge distances", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 10,
                nrHexagonsInWidth: 2,
                nrHexagonsInHeight: 2
            });

            expect(result.shortestDistEdge).toBeDefined();
            expect(result.longestDistEdge).toBeDefined();
            expect(result.shortestDistEdge).toBeCloseTo(2.457807219155035);
            expect(result.longestDistEdge).toBeCloseTo(2.8571428571428568);
            expect(result.longestDistEdge).toBeGreaterThanOrEqual(result.shortestDistEdge!);
        });

        it("should return valid maxFilletRadius", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 10,
                nrHexagonsInWidth: 2,
                nrHexagonsInHeight: 2
            });

            expect(result.maxFilletRadius).toBeDefined();
            expect(result.maxFilletRadius).toBeCloseTo(1.7204650534085244);
        });

        it("should generate flat-top hexagons when flatTop=true", () => {
            const width = 10;
            const height = 10;
            const resultPointy = point.hexGridScaledToFit({
                width,
                height,
                nrHexagonsInWidth: 2,
                nrHexagonsInHeight: 2,
                flatTop: false
            });
            const resultFlat = point.hexGridScaledToFit({
                width,
                height,
                nrHexagonsInWidth: 2,
                nrHexagonsInHeight: 2,
                flatTop: true
            });

            expect(resultFlat.hexagons).toHaveLength(resultPointy.hexagons.length);

            const flatFirst = resultFlat.hexagons[0]!;
            const pointyFirst = resultPointy.hexagons[0]!;

            expect(resultFlat.hexagons).toEqual([
                [
                    [0, 4.000000000000001, 0],
                    [1.4285714285714288, 6, 0],
                    [4.285714285714286, 6, 0],
                    [5.714285714285714, 4.000000000000001, 0],
                    [4.2857142857142865, 2.000000000000001, 0],
                    [1.4285714285714306, 2, 0]
                ],
                [
                    [0, 8.000000000000002, 0],
                    [1.4285714285714293, 10, 0],
                    [4.285714285714286, 10, 0],
                    [5.714285714285714, 8.000000000000002, 0],
                    [4.2857142857142865, 6.000000000000002, 0],
                    [1.4285714285714306, 6, 0]
                ],
                [
                    [4.285714285714286, 2.000000000000001, 0],
                    [5.714285714285714, 4.000000000000001, 0],
                    [8.571428571428571, 4.000000000000001, 0],
                    [10, 2.0000000000000004, 0],
                    [8.571428571428573, 8.881784197001252e-16, 0],
                    [5.714285714285716, 0, 0]
                ],
                [
                    [4.285714285714286, 6, 0],
                    [5.714285714285714, 8.000000000000002, 0],
                    [8.571428571428571, 8.000000000000002, 0],
                    [10, 6.000000000000001, 0],
                    [8.571428571428573, 4.000000000000001, 0],
                    [5.714285714285716, 3.9999999999999996, 0]
                ]
            ]);

            expect(resultPointy.hexagons).toEqual([
                [
                    [2.000000000000001, 5.714285714285714, 0],
                    [4.000000000000001, 4.285714285714286, 0],
                    [4.000000000000001, 1.4285714285714293, 0],
                    [2.000000000000001, 0, 0],
                    [1.2819751242557092e-15, 1.4285714285714273, 0],
                    [0, 4.285714285714284, 0]
                ],
                [
                    [4.000000000000001, 10, 0],
                    [6, 8.571428571428571, 0],
                    [6, 5.714285714285714, 0],
                    [4.000000000000001, 4.285714285714286, 0],
                    [2.000000000000001, 5.7142857142857135, 0],
                    [1.9999999999999998, 8.57142857142857, 0]
                ],
                [
                    [6, 5.714285714285714, 0],
                    [8.000000000000002, 4.285714285714286, 0],
                    [8.000000000000002, 1.4285714285714293, 0],
                    [6.000000000000001, 0, 0],
                    [4.000000000000001, 1.4285714285714273, 0],
                    [3.9999999999999996, 4.285714285714284, 0]
                ],
                [
                    [8.000000000000002, 10, 0],
                    [10, 8.571428571428571, 0],
                    [10, 5.714285714285714, 0],
                    [8.000000000000002, 4.285714285714286, 0],
                    [6.000000000000002, 5.7142857142857135, 0],
                    [6, 8.57142857142857, 0]
                ]
            ]);

            let allSame = true;
            for (let i = 0; i < 6; i++) {
                if (Math.abs(flatFirst[i]![0] - pointyFirst[i]![0]) > 1e-6 ||
                    Math.abs(flatFirst[i]![1] - pointyFirst[i]![1]) > 1e-6) {
                    allSame = false;
                    break;
                }
            }
            expect(allSame).toBe(false);
        });

        it("should verify exact hexagon vertex positions for 1x1 grid (pointy-top)", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 10,
                nrHexagonsInWidth: 1,
                nrHexagonsInHeight: 1
            });

            expect(result.hexagons).toHaveLength(1);
            const hex = result.hexagons[0]!;
            expect(hex).toHaveLength(6);

            hex.forEach(v => {
                expect(v[2]).toBe(0);
            });

            const center = result.centers[0]!;
            let avgX = 0, avgY = 0;
            hex.forEach(v => {
                avgX += v[0];
                avgY += v[1];
            });
            avgX /= 6;
            avgY /= 6;

            expect(avgX).toBeCloseTo(center[0], precision);
            expect(avgY).toBeCloseTo(center[1], precision);
        });

        it("should generate hexagons where vertices form valid convex polygon angles", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 10,
                nrHexagonsInWidth: 1,
                nrHexagonsInHeight: 1
            });

            const hex = result.hexagons[0]!;

            for (let i = 0; i < 6; i++) {
                const prev = hex[(i + 5) % 6]!;
                const curr = hex[i]!;
                const next = hex[(i + 1) % 6]!;

                const v1: Inputs.Base.Vector3 = [prev[0] - curr[0], prev[1] - curr[1], 0];
                const v2: Inputs.Base.Vector3 = [next[0] - curr[0], next[1] - curr[1], 0];

                const dot = v1[0] * v2[0] + v1[1] * v2[1];
                const len1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
                const len2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);

                const cosAngle = dot / (len1 * len2);
                const angleDeg = Math.acos(cosAngle) * 180 / Math.PI;

                expect(angleDeg).toBeGreaterThan(60);
                expect(angleDeg).toBeLessThan(180);
            }
        });

        describe("extend options", () => {
            const width = 20;
            const height = 20;

            it("should extend grid beyond top boundary when extendTop=true", () => {
                const resultNormal = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3,
                    extendTop: false
                });
                const resultExtended = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3,
                    extendTop: true
                });

                expect(resultExtended.hexagons).toHaveLength(resultNormal.hexagons.length);

                let maxYNormal = -Infinity;
                let maxYExtended = -Infinity;
                resultNormal.hexagons.forEach(hex => {
                    hex.forEach(v => { if (v[1] > maxYNormal) maxYNormal = v[1]; });
                });
                resultExtended.hexagons.forEach(hex => {
                    hex.forEach(v => { if (v[1] > maxYExtended) maxYExtended = v[1]; });
                });

                expect(maxYExtended).toBeGreaterThan(maxYNormal);
            });

            it("should extend grid beyond bottom boundary when extendBottom=true", () => {
                const resultNormal = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3,
                    extendBottom: false
                });
                const resultExtended = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3,
                    extendBottom: true
                });

                let minYNormal = Infinity;
                let minYExtended = Infinity;
                resultNormal.hexagons.forEach(hex => {
                    hex.forEach(v => { if (v[1] < minYNormal) minYNormal = v[1]; });
                });
                resultExtended.hexagons.forEach(hex => {
                    hex.forEach(v => { if (v[1] < minYExtended) minYExtended = v[1]; });
                });

                expect(minYExtended).toBeLessThan(minYNormal);
            });

            it("should extend grid beyond left boundary when extendLeft=true", () => {
                const resultNormal = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3,
                    extendLeft: false
                });
                const resultExtended = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3,
                    extendLeft: true
                });

                let minXNormal = Infinity;
                let minXExtended = Infinity;
                resultNormal.hexagons.forEach(hex => {
                    hex.forEach(v => { if (v[0] < minXNormal) minXNormal = v[0]; });
                });
                resultExtended.hexagons.forEach(hex => {
                    hex.forEach(v => { if (v[0] < minXExtended) minXExtended = v[0]; });
                });

                expect(minXExtended).toBeLessThan(minXNormal);
            });

            it("should extend grid beyond right boundary when extendRight=true", () => {
                const resultNormal = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3,
                    extendRight: false
                });
                const resultExtended = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3,
                    extendRight: true
                });

                let maxXNormal = -Infinity;
                let maxXExtended = -Infinity;
                resultNormal.hexagons.forEach(hex => {
                    hex.forEach(v => { if (v[0] > maxXNormal) maxXNormal = v[0]; });
                });
                resultExtended.hexagons.forEach(hex => {
                    hex.forEach(v => { if (v[0] > maxXExtended) maxXExtended = v[0]; });
                });

                expect(maxXExtended).toBeGreaterThan(maxXNormal);
            });

            it("should extend grid in both vertical directions when extendTop=true and extendBottom=true", () => {
                const resultNormal = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3
                });
                const resultExtended = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3,
                    extendTop: true,
                    extendBottom: true
                });

                let minYNormal = Infinity, maxYNormal = -Infinity;
                let minYExtended = Infinity, maxYExtended = -Infinity;
                resultNormal.hexagons.forEach(hex => {
                    hex.forEach(v => {
                        if (v[1] < minYNormal) minYNormal = v[1];
                        if (v[1] > maxYNormal) maxYNormal = v[1];
                    });
                });
                resultExtended.hexagons.forEach(hex => {
                    hex.forEach(v => {
                        if (v[1] < minYExtended) minYExtended = v[1];
                        if (v[1] > maxYExtended) maxYExtended = v[1];
                    });
                });

                expect(maxYExtended).toBeGreaterThan(maxYNormal);
                expect(minYExtended).toBeLessThan(minYNormal);
            });

            it("should extend grid in both horizontal directions when extendLeft=true and extendRight=true", () => {
                const resultNormal = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3
                });
                const resultExtended = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3,
                    extendLeft: true,
                    extendRight: true
                });

                let minXNormal = Infinity, maxXNormal = -Infinity;
                let minXExtended = Infinity, maxXExtended = -Infinity;
                resultNormal.hexagons.forEach(hex => {
                    hex.forEach(v => {
                        if (v[0] < minXNormal) minXNormal = v[0];
                        if (v[0] > maxXNormal) maxXNormal = v[0];
                    });
                });
                resultExtended.hexagons.forEach(hex => {
                    hex.forEach(v => {
                        if (v[0] < minXExtended) minXExtended = v[0];
                        if (v[0] > maxXExtended) maxXExtended = v[0];
                    });
                });

                expect(maxXExtended).toBeGreaterThan(maxXNormal);
                expect(minXExtended).toBeLessThan(minXNormal);
            });

            it("should extend grid in all four directions", () => {
                const resultNormal = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3
                });
                const resultExtended = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3,
                    extendTop: true,
                    extendBottom: true,
                    extendLeft: true,
                    extendRight: true
                });

                let minXNormal = Infinity, maxXNormal = -Infinity;
                let minYNormal = Infinity, maxYNormal = -Infinity;
                let minXExtended = Infinity, maxXExtended = -Infinity;
                let minYExtended = Infinity, maxYExtended = -Infinity;

                resultNormal.hexagons.forEach(hex => {
                    hex.forEach(v => {
                        if (v[0] < minXNormal) minXNormal = v[0];
                        if (v[0] > maxXNormal) maxXNormal = v[0];
                        if (v[1] < minYNormal) minYNormal = v[1];
                        if (v[1] > maxYNormal) maxYNormal = v[1];
                    });
                });
                resultExtended.hexagons.forEach(hex => {
                    hex.forEach(v => {
                        if (v[0] < minXExtended) minXExtended = v[0];
                        if (v[0] > maxXExtended) maxXExtended = v[0];
                        if (v[1] < minYExtended) minYExtended = v[1];
                        if (v[1] > maxYExtended) maxYExtended = v[1];
                    });
                });

                expect(maxXExtended).toBeGreaterThan(maxXNormal);
                expect(minXExtended).toBeLessThan(minXNormal);
                expect(maxYExtended).toBeGreaterThan(maxYNormal);
                expect(minYExtended).toBeLessThan(minYNormal);
            });

            it("should maintain hexagon count when extending", () => {
                const resultNormal = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 4,
                    nrHexagonsInHeight: 4
                });
                const resultExtended = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 4,
                    nrHexagonsInHeight: 4,
                    extendTop: true,
                    extendBottom: true,
                    extendLeft: true,
                    extendRight: true
                });

                expect(resultExtended.hexagons).toHaveLength(resultNormal.hexagons.length);
                expect(resultExtended.centers).toHaveLength(resultNormal.centers.length);
            });

            it("should correctly extend with flatTop=true", () => {
                const resultNormal = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3,
                    flatTop: true
                });
                const resultExtended = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 3,
                    nrHexagonsInHeight: 3,
                    flatTop: true,
                    extendTop: true,
                    extendRight: true
                });

                let maxXNormal = -Infinity, maxYNormal = -Infinity;
                let maxXExtended = -Infinity, maxYExtended = -Infinity;
                resultNormal.hexagons.forEach(hex => {
                    hex.forEach(v => {
                        if (v[0] > maxXNormal) maxXNormal = v[0];
                        if (v[1] > maxYNormal) maxYNormal = v[1];
                    });
                });
                resultExtended.hexagons.forEach(hex => {
                    hex.forEach(v => {
                        if (v[0] > maxXExtended) maxXExtended = v[0];
                        if (v[1] > maxYExtended) maxYExtended = v[1];
                    });
                });

                expect(maxXExtended).toBeGreaterThan(maxXNormal);
                expect(maxYExtended).toBeGreaterThan(maxYNormal);
            });

            it("should stretch hexagons proportionally when extending", () => {
                const resultExtended = point.hexGridScaledToFit({
                    width,
                    height,
                    nrHexagonsInWidth: 2,
                    nrHexagonsInHeight: 2,
                    extendTop: true
                });

                resultExtended.hexagons.forEach(hex => {
                    expect(hex).toHaveLength(6);
                });

                resultExtended.hexagons.forEach(hex => {
                    hex.forEach(v => {
                        expect(v[2]).toBe(0);
                    });
                });
            });
        });
    });

    describe("getRegularHexagonVertices (tested via hexGridScaledToFit)", () => {
        const precision = 6;

        it("should generate 6 vertices in consistent winding order", () => {
            const result = point.hexGridScaledToFit({
                width: 2,
                height: 2,
                nrHexagonsInWidth: 1,
                nrHexagonsInHeight: 1
            });

            const hex = result.hexagons[0]!;
            expect(hex).toHaveLength(6);

            let signedArea = 0;
            for (let i = 0; i < 6; i++) {
                const curr = hex[i]!;
                const next = hex[(i + 1) % 6]!;
                signedArea += curr[0] * next[1] - next[0] * curr[1];
            }
            signedArea /= 2;

            expect(Math.abs(signedArea)).toBeCloseTo(3);
        });

        it("should maintain Z coordinate from center point", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 10,
                nrHexagonsInWidth: 2,
                nrHexagonsInHeight: 2,
                pointsOnGround: false
            });

            result.hexagons.forEach((hex, idx) => {
                const centerZ = result.centers[idx]![2];
                hex.forEach(v => {
                    expect(v[2]).toBe(centerZ);
                });
            });
        });

        it("should generate vertices at equal distances from center", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 10,
                nrHexagonsInWidth: 1,
                nrHexagonsInHeight: 1
            });

            const hex = result.hexagons[0]!;
            const center = result.centers[0]!;

            const distances = hex.map(v => {
                const dx = v[0] - center[0];
                const dy = v[1] - center[1];
                return Math.sqrt(dx * dx + dy * dy);
            });

            expect(distances).toEqual([
                5,
                5.590169943749474,
                5.590169943749474,
                5,
                5.590169943749473,
                5.590169943749474
            ]);
        });

        it("should generate edges of equal length for regular hexagon base", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 10,
                nrHexagonsInWidth: 1,
                nrHexagonsInHeight: 1
            });

            const hex = result.hexagons[0]!;
            const edgeLengths: number[] = [];

            for (let i = 0; i < 6; i++) {
                const curr = hex[i]!;
                const next = hex[(i + 1) % 6]!;
                const dx = next[0] - curr[0];
                const dy = next[1] - curr[1];
                edgeLengths.push(Math.sqrt(dx * dx + dy * dy));
            }

            const minEdge = Math.min(...edgeLengths);
            const maxEdge = Math.max(...edgeLengths);

            expect(result.shortestDistEdge).toBeCloseTo(minEdge, precision);
            expect(result.longestDistEdge).toBeCloseTo(maxEdge, precision);
        });

        it("should correctly position hexagon vertices relative to center using sin/cos pattern", () => {
            const result = point.hexGridScaledToFit({
                width: 10,
                height: 10,
                nrHexagonsInWidth: 1,
                nrHexagonsInHeight: 1
            });

            const hex = result.hexagons[0]!;
            const center = result.centers[0]!;

            const angles = hex.map(v => {
                const dx = v[0] - center[0];
                const dy = v[1] - center[1];
                return Math.atan2(dx, dy) * 180 / Math.PI;
            });

            const sortedAngles = [...angles].sort((a, b) => a - b);

            for (let i = 0; i < 5; i++) {
                const diff = sortedAngles[i + 1]! - sortedAngles[i]!;
                expect(diff).toBeGreaterThan(30);
                expect(diff).toBeLessThan(90);
            }
        });
    });

    describe("maxFilletRadius at a corner that is not one", () => {
        it("should give no radius where two of the points are the same", () => {
            expect(point.maxFilletRadius(new Inputs.Point.ThreePointsToleranceDto([0, 0, 0], [0, 0, 0], [1, 0, 0]))).toBe(0);
        });

        it("should give no radius where the three points lie on one line", () => {
            expect(point.maxFilletRadius(new Inputs.Point.ThreePointsToleranceDto([1, 0, 0], [2, 0, 0], [0, 0, 0]))).toBe(0);
        });
    });

    describe("maxFilletRadiusHalfLine at a corner that is not one", () => {
        it("should give no radius where two of the points are the same", () => {
            expect(point.maxFilletRadiusHalfLine(new Inputs.Point.ThreePointsToleranceDto([0, 0, 0], [0, 0, 0], [1, 0, 0]))).toBe(0);
        });

        it("should give no radius where the three points lie on one line", () => {
            expect(point.maxFilletRadiusHalfLine(new Inputs.Point.ThreePointsToleranceDto([1, 0, 0], [2, 0, 0], [0, 0, 0]))).toBe(0);
        });
    });

    describe("maxFilletRadius at a corner too small for the vectors to have a direction", () => {
        it("should give no radius when a tolerance below the direction threshold lets a tiny corner through", () => {
            const inputs = new Inputs.Point.ThreePointsToleranceDto([5e-9, 0, 0], [0, 5e-9, 0], [0, 0, 0], 1e-12);

            // Act & Assert
            expect(point.maxFilletRadius(inputs)).toBe(0);
        });

        it("should give no radius from the half line reader either", () => {
            // Arrange
            const inputs = new Inputs.Point.ThreePointsToleranceDto([5e-9, 0, 0], [0, 5e-9, 0], [0, 0, 0], 1e-12);

            // Act & Assert
            expect(point.maxFilletRadiusHalfLine(inputs)).toBe(0);
        });
    });

    describe("twoPointsAlmostEqual without a tolerance of its own", () => {
        it("should call two points a hair apart the same", () => {
            expect(point.twoPointsAlmostEqual({ point1: [1, 0, 0], point2: [1 + 1e-9, 0, 0] })).toBe(true);
        });

        it("should call two points further apart than that different", () => {
            expect(point.twoPointsAlmostEqual({ point1: [1, 0, 0], point2: [1.1, 0, 0] })).toBe(false);
        });
    });

    describe("hexGridScaledToFit without the sizes and counts", () => {
        it("should fall back to a ten by ten grid in a ten by ten square", () => {
            // Act
            const grid = point.hexGridScaledToFit({});

            // Assert
            expect(grid.centers).toHaveLength(100);
        });

        it("should refuse a grid with no size to fill", () => {
            // Arrange
            const warned: unknown[] = [];
            const consoleWarn = console.warn;
            console.warn = (message: unknown) => { warned.push(message); };

            // Act
            const grid = point.hexGridScaledToFit({ width: 0, height: 10 });
            console.warn = consoleWarn;

            // Assert
            expect(grid).toEqual({ centers: [], hexagons: [], shortestDistEdge: undefined, longestDistEdge: undefined, maxFilletRadius: undefined });
            expect(warned).toHaveLength(1);
        });

        it("should centre a flat topped grid on the origin when asked to", () => {
            // Act
            const grid = point.hexGridScaledToFit({ width: 10, height: 20, flatTop: true, centerGrid: true });
            const xs = grid.centers.map((centre) => centre[0]);

            expect(Math.min(...xs)).toBeLessThan(0);
            expect(Math.max(...xs)).toBeGreaterThan(0);
        });

        it("should group a flat topped grid by the ten columns it falls back to", () => {
            // Act
            const grid = point.hexGridScaledToFit({ width: 10, height: 10, flatTop: true });

            // Assert
            expect(grid.centers).toHaveLength(100);
        });
    });
});
