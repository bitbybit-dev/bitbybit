import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";
import { Point } from "./point";
import { Polyline } from "./polyline";
import { Transforms } from "./transforms";
import { Vector } from "./vector";
import * as Inputs from "../inputs";

describe("Polyline unit tests", () => {
    let geometryHelper: GeometryHelper;
    let math: MathBitByBit;
    let vector: Vector;
    let point: Point;
    let polyline: Polyline;
    let transforms: Transforms;

    beforeAll(() => {
        geometryHelper = new GeometryHelper();
        math = new MathBitByBit();
        vector = new Vector(math, geometryHelper);
        transforms = new Transforms(vector, math);
        point = new Point(geometryHelper, transforms, vector);
        polyline = new Polyline(vector, point, geometryHelper);
    });

    const TOLERANCE = 1e-7;

    const expectPointCloseTo = (
        received: Inputs.Base.Point3 | Inputs.Base.Vector3 | undefined,
        expected: Inputs.Base.Point3 | Inputs.Base.Vector3
    ) => {
        expect(received).toBeDefined();
        if (!received) return; // Guard for TS
        expect(received.length).toEqual(expected.length);
        expect(received[0]).toBeCloseTo(expected[0], TOLERANCE);
        expect(received[1]).toBeCloseTo(expected[1], TOLERANCE);
        if (expected.length > 2 && received.length > 2) {
            expect(received[2]).toBeCloseTo(expected[2], TOLERANCE);
        }
    };

    const expectPointsCloseTo = (
        received: Inputs.Base.Point3[] | Inputs.Base.Vector3[],
        expected: Inputs.Base.Point3[] | Inputs.Base.Vector3[]
    ) => {
        expect(received.length).toEqual(expected.length);
        received.forEach((p, i) => expectPointCloseTo(p, expected[i]));
    };

    it("should create polyline", () => {
        const p = polyline.create({
            points: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]],
            isClosed: true
        });
        expect(p).toBeDefined();
        expect(p.points.length).toEqual(4);
    });


    describe("length", () => {
        it("should calculate the length of a simple open polyline", () => {
            const p: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [3, 0, 0], [3, 4, 0]] }; // Length 3 + 4 = 7
            const result = polyline.length({ polyline: p });
            expect(result).toBeCloseTo(7, TOLERANCE);
        });

        it("should calculate the length of a closed polyline (sum of segments)", () => {
            // Note: Implementation sums segment lengths, doesn't automatically add closing segment length
            const p: Inputs.Base.Polyline3 = {
                points: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]], // Explicitly closed square
                isClosed: true
            }; // Length 1 + 1 + 1 + 1 = 4
            const result = polyline.length({ polyline: p });
            expect(result).toBeCloseTo(4, TOLERANCE);
        });

        it("should calculate length correctly even if isClosed=true but points dont form loop", () => {
            // The isClosed flag doesn't affect the length calculation based on the code
            const p: Inputs.Base.Polyline3 = {
                points: [[0, 0, 0], [3, 0, 0], [3, 4, 0]], // Same as open L-shape
                isClosed: true
            }; // Length 3 + 4 = 7
            const result = polyline.length({ polyline: p });
            expect(result).toBeCloseTo(7, TOLERANCE);
        });

        it("should return 0 for a polyline with a single point", () => {
            const p: Inputs.Base.Polyline3 = { points: [[1, 2, 3]] };
            const result = polyline.length({ polyline: p });
            expect(result).toBeCloseTo(0, TOLERANCE);
        });

        it("should return 0 for a polyline with two identical points", () => {
            const p: Inputs.Base.Polyline3 = { points: [[1, 2, 3], [1, 2, 3]] };
            const result = polyline.length({ polyline: p });
            expect(result).toBeCloseTo(0, TOLERANCE);
        });

        it("should return 0 for a polyline with no points", () => {
            const p: Inputs.Base.Polyline3 = { points: [] };
            const result = polyline.length({ polyline: p });
            expect(result).toBeCloseTo(0, TOLERANCE);
        });
    });

    describe("countPoints", () => {
        it("should return the correct number of points", () => {
            const p: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [1, 1, 1], [2, 2, 2]] };
            expect(polyline.countPoints({ polyline: p })).toBe(3);
        });

        it("should return 1 for a single-point polyline", () => {
            const p: Inputs.Base.Polyline3 = { points: [[1, 2, 3]] };
            expect(polyline.countPoints({ polyline: p })).toBe(1);
        });

        it("should return 0 for an empty polyline", () => {
            const p: Inputs.Base.Polyline3 = { points: [] };
            expect(polyline.countPoints({ polyline: p })).toBe(0);
        });
    });

    describe("getPoints", () => {
        it("should return the points array", () => {
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 1]];
            const p: Inputs.Base.Polyline3 = { points: points };
            const result = polyline.getPoints({ polyline: p });
            expect(result).toEqual(points);
            expect(result).toBe(points);
        });

        it("should return an empty array for an empty polyline", () => {
            const p: Inputs.Base.Polyline3 = { points: [] };
            const result = polyline.getPoints({ polyline: p });
            expect(result).toEqual([]);
        });
    });

    describe("reverse", () => {
        it("should reverse the order of points in the polyline", () => {
            const initialPoints: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 1], [2, 2, 2]];
            const p: Inputs.Base.Polyline3 = { points: [...initialPoints] }; // Pass a copy
            const result = polyline.reverse({ polyline: p });
            const expectedPoints: Inputs.Base.Point3[] = [[2, 2, 2], [1, 1, 1], [0, 0, 0]];
            expect(result.points).toEqual(expectedPoints);
            expect(p.points).toEqual(expectedPoints);
        });

        it("should handle a polyline with two points", () => {
            const initialPoints: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 1]];
            const p: Inputs.Base.Polyline3 = { points: [...initialPoints] };
            const result = polyline.reverse({ polyline: p });
            expect(result.points).toEqual([[1, 1, 1], [0, 0, 0]]);
        });

        it("should handle a polyline with a single point", () => {
            const initialPoints: Inputs.Base.Point3[] = [[1, 2, 3]];
            const p: Inputs.Base.Polyline3 = { points: [...initialPoints] };
            const result = polyline.reverse({ polyline: p });
            expect(result.points).toEqual([[1, 2, 3]]);
        });

        it("should handle an empty polyline", () => {
            const p: Inputs.Base.Polyline3 = { points: [] };
            const result = polyline.reverse({ polyline: p });
            expect(result.points).toEqual([]);
        });
    });

    describe("transformPolyline", () => {
        it("should translate all points in the polyline", () => {
            const p: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [1, 1, 0]] };
            const translationVec: Inputs.Base.Vector3 = [10, -5, 2];
            const transformation = transforms.translationXYZ({ translation: translationVec });
            const result = polyline.transformPolyline({ polyline: p, transformation });
            const expectedPoints: Inputs.Base.Point3[] = [[10, -5, 2], [11, -4, 2]];
            expectPointsCloseTo(result.points, expectedPoints);
        });

        it("should rotate all points in the polyline", () => {
            const p: Inputs.Base.Polyline3 = { points: [[1, 0, 0], [2, 0, 5]] };
            const transformation = transforms.rotationCenterAxis({
                center: [0, 0, 0], axis: [0, 0, 1], angle: 90
            });
            const result = polyline.transformPolyline({ polyline: p, transformation });
            const expectedPoints: Inputs.Base.Point3[] = [[0, 1, 0], [0, 2, 5]]; // Rotated points
            expectPointsCloseTo(result.points, expectedPoints);
        });

        it("should handle an empty polyline", () => {
            const p: Inputs.Base.Polyline3 = { points: [] };
            const transformation = transforms.translationXYZ({ translation: [1, 1, 1] });
            const result = polyline.transformPolyline({ polyline: p, transformation });
            expect(result.points).toEqual([]);
        });

        it("should return a new object for the polyline properties", () => {
            const points: Inputs.Base.Point3[] = [[0, 0, 0]];
            const p: Inputs.Base.Polyline3 = { points };
            const transformation = [transforms.identity()];
            const result = polyline.transformPolyline({ polyline: p, transformation });
            expect(result).toBeDefined();
            expect(result.points).toBeDefined();
            expect(result).not.toBe(p);
        });
    });


    describe("sort segments into polylines", () => {

        it("should return an empty array for empty input", () => {
            const result = polyline.sortSegmentsIntoPolylines({ segments: [] });
            expect(result).toEqual([]);
        });

        it("should return an empty array for undefined input", () => {
            const result = polyline.sortSegmentsIntoPolylines({ segments: undefined as any });
            expect(result).toEqual([]);
        });

        it("should handle a single segment", () => {
            const segments: Inputs.Base.Segment3[] = [[[0, 0, 0], [1, 1, 1]]];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[0, 0, 0], [1, 1, 1]]);
            expect(result[0].isClosed).toBe(false);
        });

        it("should handle two unconnected segments", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 0, 0]],
                [[2, 2, 0], [3, 2, 0]],
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            const sortedResult = sortPolylinesForComparison(result);

            expect(sortedResult).toHaveLength(2);
            expect(sortedResult[0].points).toEqual([[0, 0, 0], [1, 0, 0]]);
            expect(sortedResult[0].isClosed).toBe(false);
            expect(sortedResult[1].points).toEqual([[2, 2, 0], [3, 2, 0]]);
            expect(sortedResult[1].isClosed).toBe(false);
        });

        it("should connect two segments in order", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 0, 0]],
                [[1, 0, 0], [1, 1, 0]],
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[0, 0, 0], [1, 0, 0], [1, 1, 0]]);
            expect(result[0].isClosed).toBe(false);
        });

        it("should connect multiple segments in order", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 0, 0]],
                [[1, 0, 0], [1, 1, 0]],
                [[1, 1, 0], [0, 1, 0]],
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]]);
            expect(result[0].isClosed).toBe(false);
        });

        it("should connect multiple segments in scrambled order", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[1, 0, 0], [1, 1, 0]], // Middle
                [[1, 1, 0], [0, 1, 0]], // End
                [[0, 0, 0], [1, 0, 0]], // Start
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]]); // Check the most likely order based on implementation finding index 0 first
            expect(result[0].isClosed).toBe(false);
        });

        it("should connect multiple segments in scrambled order starting from the middle", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[2, 2, 0], [3, 2, 0]], // segment 2 (tail)
                [[0, 2, 0], [1, 2, 0]], // segment 0 (head)
                [[1, 2, 0], [2, 2, 0]], // segment 1 (middle, processed first)
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[0, 2, 0], [1, 2, 0], [2, 2, 0], [3, 2, 0]]);
            expect(result[0].isClosed).toBe(false);
        });


        it("should create a closed polyline from ordered segments", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 0, 0]],
                [[1, 0, 0], [1, 1, 0]],
                [[1, 1, 0], [0, 1, 0]],
                [[0, 1, 0], [0, 0, 0]], // Closing segment
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]]); // Closed loop, last point removed
            expect(result[0].isClosed).toBe(true);
        });

        it("should create a closed polyline from scrambled segments", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[1, 1, 0], [0, 1, 0]],
                [[0, 1, 0], [0, 0, 0]],
                [[0, 0, 0], [1, 0, 0]],
                [[1, 0, 0], [1, 1, 0]],
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[1, 1, 0], [0, 1, 0], [0, 0, 0], [1, 0, 0]]);
            expect(result[0].isClosed).toBe(true);
        });

        it("should create a closed polyline detected during backward pass", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[1, 0, 0], [0, 0, 0]],
                [[0, 1, 0], [1, 1, 0]],
                [[1, 1, 0], [1, 0, 0]],
                [[0, 0, 0], [0, 1, 0]],
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]]);
            expect(result[0].isClosed).toBe(true);
        });


        it("should handle segments connecting within tolerance", () => {
            const tolerance = 0.1;
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 0, 0]],
                [[1.05, 0, 0], [1, 1, 0]], // Connects within tolerance
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments, tolerance });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[0, 0, 0], [1, 0, 0], [1, 1, 0]]);
            expect(result[0].isClosed).toBe(false);
        });

        it("should NOT connect segments outside tolerance", () => {
            const tolerance = 0.01;
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 0, 0]],
                [[1.05, 0, 0], [1, 1, 0]], // Does NOT connect within tolerance
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments, tolerance });
            const sortedResult = sortPolylinesForComparison(result);

            expect(sortedResult).toHaveLength(2);
            expect(sortedResult[0].points).toEqual([[0, 0, 0], [1, 0, 0]]);
            expect(sortedResult[0].isClosed).toBe(false);
            expect(sortedResult[1].points).toEqual([[1.05, 0, 0], [1, 1, 0]]);
            expect(sortedResult[1].isClosed).toBe(false);
        });

        it("should ignore degenerate segments", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 0, 0]],
                [[1, 0, 0], [1, 0, 0]], // Degenerate
                [[1, 0, 0], [1, 1, 0]],
                [[2, 2, 2], [2, 2, 2 + 1e-9]] // Degenerate within default tolerance
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[0, 0, 0], [1, 0, 0], [1, 1, 0]]);
            expect(result[0].isClosed).toBe(false);
        });

        it("should ignore degenerate segments with custom tolerance", () => {
            const tolerance = 0.1;
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 0, 0]],
                [[1, 0, 0], [1.05, 0, 0]], // Degenerate within custom tolerance
                [[1, 0, 0], [1, 1, 0]],
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments, tolerance });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[0, 0, 0], [1, 0, 0], [1, 1, 0]]);
            expect(result[0].isClosed).toBe(false);
        });

        it("should handle multiple distinct polylines", () => {
            const segments: Inputs.Base.Segment3[] = [
                // Polyline 1 (Open)
                [[0, 0, 0], [1, 0, 0]],
                [[1, 0, 0], [1, 1, 0]],
                // Polyline 2 (Closed)
                [[5, 5, 5], [6, 5, 5]],
                [[6, 6, 5], [5, 6, 5]],
                [[6, 5, 5], [6, 6, 5]],
                [[5, 6, 5], [5, 5, 5]],
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            const sortedResult = sortPolylinesForComparison(result);

            expect(sortedResult).toHaveLength(2);

            expect(sortedResult[0].points).toEqual([[0, 0, 0], [1, 0, 0], [1, 1, 0]]);
            expect(sortedResult[0].isClosed).toBe(false);

            expect(sortedResult[1].points).toEqual([[5, 5, 5], [6, 5, 5], [6, 6, 5], [5, 6, 5]]);
            expect(sortedResult[1].isClosed).toBe(true);
        });

        it("should chain through junctions using greedy approach", () => { // Rename for clarity
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 1, 1]], // Seg 0: A -> J
                [[2, 2, 2], [1, 1, 1]], // Seg 1: B -> J
                [[1, 1, 1], [0, 0, 2]], // Seg 2: J -> C
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            const sortedResult = sortPolylinesForComparison(result);

            expect(sortedResult).toHaveLength(2);
            expect(sortedResult).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    points: expect.arrayContaining([[0, 0, 0], [1, 1, 1], [2, 2, 2]]),
                    isClosed: false
                }),
                expect.objectContaining({ points: [[1, 1, 1], [0, 0, 2]], isClosed: false })
            ]));
        });

        it("should handle reversed segment forming a 2-point closed loop", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 1, 1]],
                [[1, 1, 1], [0, 0, 0]], // Reversed
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[0, 0, 0], [1, 1, 1]]);
            expect(result[0].isClosed).toBe(true);
        });

        it("should handle duplicate segments correctly", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 0, 0]],
                [[1, 0, 0], [1, 1, 0]],
                [[0, 0, 0], [1, 0, 0]], // Duplicate of the first segment
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[1, 0, 0], [0, 0, 0], [1, 0, 0], [1, 1, 0]]);
            expect(result[0].isClosed).toBe(false);
        });

        it("should handle segments forming a minimal closed triangle", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 0, 0]],
                [[1, 0, 0], [0, 1, 0]],
                [[0, 1, 0], [0, 0, 0]],
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[0, 0, 0], [1, 0, 0], [0, 1, 0]]);
            expect(result[0].isClosed).toBe(true);
        });

        it("should handle points close to grid boundaries correctly", () => {
            const tolerance = 0.1;

            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [0.99, 0, 0]],      // Seg 0
                [[1.08, 0, 0], [2, 0, 0]],      // Seg 1
                [[1.21, 0, 0], [3, 0, 0]],      // Seg 2 (unconnected)
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments, tolerance });
            const sortedResult = sortPolylinesForComparison(result);
            expect(sortedResult).toHaveLength(2);
            expect(sortedResult[0].points).toEqual([[0, 0, 0], [0.99, 0, 0], [2, 0, 0]]); // Points from original segments
            expect(sortedResult[0].isClosed).toBe(false);
            expect(sortedResult[1].points).toEqual([[1.21, 0, 0], [3, 0, 0]]);
            expect(sortedResult[1].isClosed).toBe(false);
        });

        it("should connect two segments meeting end-to-end (reversed second segment)", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[0, 0, 0], [1, 0, 0]], // A -> B
                [[2, 0, 0], [1, 0, 0]], // C -> B (Reversed connection)
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[0, 0, 0], [1, 0, 0], [2, 0, 0]]);
            expect(result[0].isClosed).toBe(false);
        });

        it("should connect multiple segments with mixed directions", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[1, 0, 0], [2, 0, 0]], // B -> C
                [[0, 0, 0], [1, 0, 0]], // A -> B
                [[3, 0, 0], [2, 0, 0]], // D -> C (Reversed)
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0]]);
            expect(result[0].isClosed).toBe(false);
        });

        it("should form a closed loop with mixed directions", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[1, 1, 0], [0, 1, 0]], // C -> B
                [[0, 0, 0], [1, 0, 0]], // A -> D
                [[1, 0, 0], [1, 1, 0]], // D -> C
                [[0, 1, 0], [0, 0, 0]], // B -> A (Closes loop)
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[1, 1, 0], [0, 1, 0], [0, 0, 0], [1, 0, 0]]);
            expect(result[0].isClosed).toBe(true);
        });

        it("should connect segments meeting start-to-start", () => {
            const segments: Inputs.Base.Segment3[] = [
                [[1, 0, 0], [0, 0, 0]], // B -> A
                [[1, 0, 0], [2, 0, 0]], // B -> C
            ];
            const result = polyline.sortSegmentsIntoPolylines({ segments });
            expect(result).toHaveLength(1);
            expect(result[0].points).toEqual([[2, 0, 0], [1, 0, 0], [0, 0, 0]]); // Order depends on chaining direction
            expect(result[0].isClosed).toBe(false);
        });
    });

    const sortPolylinesForComparison = (polylines: Inputs.Base.Polyline3[]): Inputs.Base.Polyline3[] => {
        return polylines.sort((a, b) => {
            const pA = a.points[0];
            const pB = b.points[0];
            if (pA[0] !== pB[0]) return pA[0] - pB[0];
            if (pA[1] !== pB[1]) return pA[1] - pB[1];
            return pA[2] - pB[2];
        });
    };

});

