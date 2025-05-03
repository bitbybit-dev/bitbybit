import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";
import { Point } from "./point";
import { Polyline } from "./polyline";
import { Transforms } from "./transforms";
import { Vector } from "./vector";
import * as Inputs from "../inputs";
import { TOLERANCE, UnitTestHelper } from "../unit-test-helper";
import { Line } from "./line";

describe("Polyline unit tests", () => {

    const uh = new UnitTestHelper();

    let geometryHelper: GeometryHelper;
    let math: MathBitByBit;
    let vector: Vector;
    let point: Point;
    let polyline: Polyline;
    let line: Line;
    let transforms: Transforms;

    beforeAll(() => {
        geometryHelper = new GeometryHelper();
        math = new MathBitByBit();
        vector = new Vector(math, geometryHelper);
        transforms = new Transforms(vector, math);
        point = new Point(geometryHelper, transforms, vector);
        line = new Line(vector, point, geometryHelper);
        polyline = new Polyline(vector, point, line, geometryHelper);
    });


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
            uh.expectPointsCloseTo(result.points, expectedPoints);
        });

        it("should rotate all points in the polyline", () => {
            const p: Inputs.Base.Polyline3 = { points: [[1, 0, 0], [2, 0, 5]] };
            const transformation = transforms.rotationCenterAxis({
                center: [0, 0, 0], axis: [0, 0, 1], angle: 90
            });
            const result = polyline.transformPolyline({ polyline: p, transformation });
            const expectedPoints: Inputs.Base.Point3[] = [[0, 1, 0], [0, 2, 5]]; // Rotated points
            uh.expectPointsCloseTo(result.points, expectedPoints);
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
            const sortedResult = uh.sortPolylinesForComparison(result);

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
            const sortedResult = uh.sortPolylinesForComparison(result);

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
            const sortedResult = uh.sortPolylinesForComparison(result);

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
            const sortedResult = uh.sortPolylinesForComparison(result);

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
            const sortedResult = uh.sortPolylinesForComparison(result);
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

    describe("polylineSelfIntersection", () => {
        it("should return empty array for polylines with less than 3 segments", () => {
            const polyline1: Inputs.Base.Polyline3 = { points: [[0, 0, 0]], isClosed: false }; // 0 segments
            const polyline2: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [1, 1, 1]], isClosed: false }; // 1 segment
            const polyline3: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [1, 1, 1]], isClosed: true }; // 1 segment (closed)
            const polyline4: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [1, 1, 1], [2, 0, 0]], isClosed: false }; // 2 segments

            expect(polyline.polylineSelfIntersection({ polyline: polyline1 })).toEqual([]);
            expect(polyline.polylineSelfIntersection({ polyline: polyline2 })).toEqual([]);
            expect(polyline.polylineSelfIntersection({ polyline: polyline3 })).toEqual([]);
            expect(polyline.polylineSelfIntersection({ polyline: polyline4 })).toEqual([]);
        });

        it("should return empty array for non-intersecting simple open polyline", () => {
            const pln: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], isClosed: false }; // Open Square shape
            expect(polyline.polylineSelfIntersection({ polyline: pln })).toEqual([]);
        });

        it("should return empty array for non-intersecting simple closed polyline (triangle)", () => {
            const pln: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [5, 0, 0], [2.5, 5, 0]], isClosed: true };
            expect(polyline.polylineSelfIntersection({ polyline: pln })).toEqual([]);
        });

        it("should return empty array for non-intersecting simple closed polyline (square)", () => {
            const pln: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [5, 0, 0], [5, 5, 0], [0, 5, 0]], isClosed: true };
            expect(polyline.polylineSelfIntersection({ polyline: pln })).toEqual([]);
        });

        it("should handle intersection occurring at a non-adjacent vertex", () => {
            const pln: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [2, 0, 0], [2, 2, 0], [0, 2, 0], [3, -1, 0], [1, 1, 0]], isClosed: false };
            const expected: Inputs.Base.Point3[] = [[2, 0, 0]];
            const result = polyline.polylineSelfIntersection({ polyline: pln });
            uh.expectPointArraysCloseTo(result, expected);
        });

        it("should return empty array for collinear overlapping segments", () => {
            const pln: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [5, 0, 0], [2, 0, 0], [8, 0, 0]], isClosed: false };
            expect(polyline.polylineSelfIntersection({ polyline: pln })).toEqual([]);
        });

        it("should find intersection for the complex user-provided polyline (open)", () => {
            const pln: Inputs.Base.Polyline3 = {
                points: [
                    [0, 0, 0], [1, 0, 0], [1, 0, 1], [-3, 0, 0],
                    [-3, 0, -3], [-5, 0, 7], [-1, 0, -6]
                ],
                isClosed: false
            };
            const expectedPoint: Inputs.Base.Point3 = [-20 / 7, 0, 1 / 28];
            const expected: Inputs.Base.Point3[] = [expectedPoint];
            const result = polyline.polylineSelfIntersection({ polyline: pln });
            uh.expectPointArraysCloseTo(result, expected);
        });

        it("should handle wrap-around adjacency check for closed polylines (no intersection)", () => {
            const pln: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [5, 0, 0], [5, 5, 0], [0, 5, 0]], isClosed: true };
            expect(polyline.polylineSelfIntersection({ polyline: pln })).toEqual([]);
        });

        it("should find single intersection for an open figure-eight that intersects ON segments", () => {
            const pln: Inputs.Base.Polyline3 = {
                points: [
                    [0, 0, 0], [4, 2, 0],
                    [0, 4, 0], [4, -2, 0]
                ],
                isClosed: false
            };
            const expected: Inputs.Base.Point3[] = [[2, 1, 0]];
            const result = polyline.polylineSelfIntersection({ polyline: pln });
            uh.expectPointArraysCloseTo(result, expected);
        });

        it("should find two intersection points for a closed bowtie/figure-eight", () => {
            const polylineStar: Inputs.Base.Polyline3 = {
                points: [
                    [0, 0, 0], [5, 5, 0], [10, 0, 0], [0, 4, 0], [10, 4, 0]
                ],
                isClosed: true
            };
            const expectedStar: Inputs.Base.Point3[] = [
                [2.8571428571428568, 2.8571428571428568, 0],
                [4, 4, 0],
                [6, 4, 0],
                [7.142857142857142, 2.857142857142857, 0],
                [5, 2, 0]
            ];
            const resultStar = polyline.polylineSelfIntersection({ polyline: polylineStar });
            uh.expectPointArraysCloseTo(resultStar, expectedStar);
        });

    });

    describe("twoPolylineIntersection", () => {

        const ORIGIN: Inputs.Base.Point3 = [0, 0, 0];
        const plnLineH: Inputs.Base.Polyline3 = { points: [[-5, 0, 0], [5, 0, 0]], isClosed: false };
        const plnLineV: Inputs.Base.Polyline3 = { points: [[0, -5, 0], [0, 5, 0]], isClosed: false };
        const plnLineH_offset: Inputs.Base.Polyline3 = { points: [[-5, 2, 0], [5, 2, 0]], isClosed: false };
        const plnLineV_offset: Inputs.Base.Polyline3 = { points: [[2, -5, 0], [2, 5, 0]], isClosed: false };

        const plnSquareClosed: Inputs.Base.Polyline3 = {
            points: [[0, 0, 0], [5, 0, 0], [5, 5, 0], [0, 5, 0]],
            isClosed: true
        };
        const plnSquareOpen: Inputs.Base.Polyline3 = {
            points: [[0, 0, 0], [5, 0, 0], [5, 5, 0], [0, 5, 0]],
            isClosed: false
        };

        const plnLineAcrossSquareH: Inputs.Base.Polyline3 = { points: [[-1, 2.5, 0], [6, 2.5, 0]], isClosed: false };
        const plnLineAcrossSquareV: Inputs.Base.Polyline3 = { points: [[2.5, -1, 0], [2.5, 6, 0]], isClosed: false };

        const plnZigzag: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [1, 1, 0], [2, 0, 0], [3, 1, 0], [4, 0, 0]], isClosed: false };
        const plnLineAcrossZigzag: Inputs.Base.Polyline3 = { points: [[0, 0.5, 0], [4, 0.5, 0]], isClosed: false };

        const plnLineTouchingCorner: Inputs.Base.Polyline3 = { points: [[5, 5, 0], [10, 10, 0]], isClosed: false };

        const plnShort1: Inputs.Base.Polyline3 = { points: [[100, 100, 100]], isClosed: false };
        const plnEmpty: Inputs.Base.Polyline3 = { points: [], isClosed: false };

        describe("No Intersection", () => {
            it("should return empty array when polylines are far apart", () => {
                const result = polyline.twoPolylineIntersection({ polyline1: plnLineH, polyline2: plnLineH_offset });
                expect(result).toEqual([]);
            });

            it("should return empty array when polylines are parallel and close", () => {
                const result = polyline.twoPolylineIntersection({ polyline1: plnLineV, polyline2: plnLineV_offset });
                expect(result).toEqual([]);
            });

            it("should return empty array when one polyline is empty or has one point", () => {
                const result1 = polyline.twoPolylineIntersection({ polyline1: plnLineH, polyline2: plnEmpty });
                const result2 = polyline.twoPolylineIntersection({ polyline1: plnLineH, polyline2: plnShort1 });
                const result3 = polyline.twoPolylineIntersection({ polyline1: plnEmpty, polyline2: plnLineH });
                expect(result1).toEqual([]);
                expect(result2).toEqual([]);
                expect(result3).toEqual([]);
            });

            it("should return empty array for nested squares", () => {
                const plnInnerSquare: Inputs.Base.Polyline3 = { points: [[1, 1, 0], [4, 1, 0], [4, 4, 0], [1, 4, 0]], isClosed: true };
                const result = polyline.twoPolylineIntersection({ polyline1: plnSquareClosed, polyline2: plnInnerSquare });
                expect(result).toEqual([]);
            });

            it("should return empty array for identical polylines (collinear overlap)", () => {
                const plnLineH_copy: Inputs.Base.Polyline3 = { points: [[-5, 0, 0], [5, 0, 0]], isClosed: false };
                const result = polyline.twoPolylineIntersection({ polyline1: plnLineH, polyline2: plnLineH_copy });
                expect(result).toEqual([]);
            });

            it("should return empty array for partially overlapping collinear polylines", () => {
                const plnLineH_partial: Inputs.Base.Polyline3 = { points: [[0, 0, 0], [10, 0, 0]], isClosed: false };
                const result = polyline.twoPolylineIntersection({ polyline1: plnLineH, polyline2: plnLineH_partial });
                expect(result).toEqual([]);
            });
        });

        describe("Single Intersection", () => {
            it("should find one intersection point for simple crossing lines", () => {
                const expected: Inputs.Base.Point3[] = [ORIGIN];
                const result = polyline.twoPolylineIntersection({ polyline1: plnLineH, polyline2: plnLineV });
                uh.expectPointArraysCloseTo(result, expected);
            });

            it("should find one intersection point when one line crosses another offset", () => {
                const expected: Inputs.Base.Point3[] = [[2, 0, 0]];
                const result = polyline.twoPolylineIntersection({ polyline1: plnLineH, polyline2: plnLineV_offset });
                uh.expectPointArraysCloseTo(result, expected);
            });

            it("should find intersection when segment endpoint lies on another segment", () => {
                const plnLineV_startOnH: Inputs.Base.Polyline3 = { points: [[3, 0, 0], [3, 5, 0]], isClosed: false };
                const expected: Inputs.Base.Point3[] = [[3, 0, 0]];
                const result = polyline.twoPolylineIntersection({ polyline1: plnLineH, polyline2: plnLineV_startOnH });
                uh.expectPointArraysCloseTo(result, expected);
            });

            it("should find intersection when polylines touch at a common vertex", () => {
                const expected: Inputs.Base.Point3[] = [[5, 5, 0]];
                const result = polyline.twoPolylineIntersection({ polyline1: plnSquareClosed, polyline2: plnLineTouchingCorner });
                uh.expectPointArraysCloseTo(result, expected);
            });
        });

        describe("Multiple Intersections", () => {
            it("should find two intersection points for line crossing closed square horizontally", () => {
                const expected: Inputs.Base.Point3[] = [[0, 2.5, 0], [5, 2.5, 0]];
                const result = polyline.twoPolylineIntersection({ polyline1: plnSquareClosed, polyline2: plnLineAcrossSquareH });
                uh.expectPointArraysCloseTo(result, expected);
            });

            it("should find two intersection points for line crossing closed square vertically", () => {
                const expected: Inputs.Base.Point3[] = [[2.5, 0, 0], [2.5, 5, 0]];
                const result = polyline.twoPolylineIntersection({ polyline1: plnSquareClosed, polyline2: plnLineAcrossSquareV });
                uh.expectPointArraysCloseTo(result, expected);
            });

            it("should find only one intersection point for line crossing OPEN square horizontally", () => {
                const expected: Inputs.Base.Point3[] = [[5, 2.5, 0]];
                const result = polyline.twoPolylineIntersection({ polyline1: plnSquareOpen, polyline2: plnLineAcrossSquareH });
                uh.expectPointArraysCloseTo(result, expected);
            });


            it("should find four intersections for line crossing zigzag polyline", () => {
                const expected: Inputs.Base.Point3[] = [[0.5, 0.5, 0], [1.5, 0.5, 0], [2.5, 0.5, 0], [3.5, 0.5, 0]];
                const result = polyline.twoPolylineIntersection({ polyline1: plnZigzag, polyline2: plnLineAcrossZigzag });
                uh.expectPointArraysCloseTo(result, expected);
            });

            it("should find two intersections for two overlapping closed squares", () => {
                const plnSquareOffset: Inputs.Base.Polyline3 = {
                    points: [[2.5, 2.5, 0], [7.5, 2.5, 0], [7.5, 7.5, 0], [2.5, 7.5, 0]],
                    isClosed: true
                };
                const expected: Inputs.Base.Point3[] = [[5, 2.5, 0], [2.5, 5, 0]];
                const result = polyline.twoPolylineIntersection({ polyline1: plnSquareClosed, polyline2: plnSquareOffset });
                uh.expectPointArraysCloseTo(result, expected);
            });

        });

        describe("Edge Cases", () => {
            it("should use custom tolerance for intersection checks", () => {
                const plnLineV_Zoffset: Inputs.Base.Polyline3 = { points: [[0, -5, 1e-11], [0, 5, 1e-11]], isClosed: false };
                const resultDefault = polyline.twoPolylineIntersection({ polyline1: plnLineH, polyline2: plnLineV_Zoffset });
                expect(resultDefault).toEqual([]);
                // With larger tolerance (e.g., 1e-3), should be considered intersecting near origin keep in mind that it's because we use
                // tolerance based epsilon cube for determining if segments are skewed
                const resultLoose = polyline.twoPolylineIntersection({ polyline1: plnLineH, polyline2: plnLineV_Zoffset, tolerance: 1e-3 });
                uh.expectPointArraysCloseTo(resultLoose, [ORIGIN], 1e-3);
            });
        });
    });

    describe("calculatePolylineMaxFillets", () => {
        const precision = 6;
        it("should return an empty array for fewer than 3 points", () => {
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 0]];
            const input: Inputs.Polyline.PolylineToleranceDto = { polyline: { points } };
            expect(polyline.maxFilletsHalfLine(input)).toEqual([]);
        });

        it("should calculate fillet for the single corner of a 3-point open polyline", () => {
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [5, 0, 0], [5, 3, 0]]; // 90 deg corner at [5,0,0]
            const input: Inputs.Polyline.PolylineToleranceDto = { polyline: { points, isClosed: false } };
            const expectedRadii = [1.5];

            const result = polyline.maxFilletsHalfLine(input);
            uh.expectFloatArraysClose(result, expectedRadii, precision);
        });

        it("should calculate fillets for the two corners of a 4-point open polyline", () => {
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [5, 0, 0], [5, 3, 0], [2, 3, 0]];
            const input: Inputs.Polyline.PolylineToleranceDto = { polyline: { points, isClosed: false } };
            const expectedRadii = [1.5, 1.5];

            const result = polyline.maxFilletsHalfLine(input);
            uh.expectFloatArraysClose(result, expectedRadii, precision);
        });

        it("should calculate fillets for all 3 corners of a 3-point closed polyline (triangle)", () => {
            const points: Inputs.Base.Point3[] = [[0,0,0], [4,0,0], [0,3,0]]; // Right-angle triangle
            const input: Inputs.Polyline.PolylineToleranceDto = { polyline: { points, isClosed: true } };
            const expectedRadii = [2/3, 1.5, 0.75];

            const result = polyline.maxFilletsHalfLine(input);
            uh.expectFloatArraysClose(result, expectedRadii, precision);
        });

        it("should calculate fillets for all 4 corners of a 4-point closed polyline (rectangle)", () => {
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [5, 0, 0], [5, 3, 0], [0, 3, 0]]; // Rectangle
            const input: Inputs.Polyline.PolylineToleranceDto = { polyline: { points, isClosed: true } };
            const expectedRadii = [1.5, 1.5, 1.5, 1.5];

            const result = polyline.maxFilletsHalfLine(input);
            uh.expectFloatArraysClose(result, expectedRadii, precision);
        });

        it("should return 0 for corners where segments are collinear", () => {
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [5, 0, 0], [10, 0, 0], [10, 3, 0]]; // Collinear segment P0-P1-P2
            const input: Inputs.Polyline.PolylineToleranceDto = { polyline: { points, isClosed: false } };
            const expectedRadii = [0.0, 1.5];

            const result = polyline.maxFilletsHalfLine(input);
            uh.expectFloatArraysClose(result, expectedRadii, precision);
        });

        it("should use the provided tolerance", () => {
            const customTolerance = 1e-4;
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [customTolerance / 2, 0, 0], [1, 1, 0]];
            const input: Inputs.Polyline.PolylineToleranceDto = { polyline: { points, isClosed: false }, tolerance: customTolerance };
            const expectedRadii = [0.0];

            const result = polyline.maxFilletsHalfLine(input);
            uh.expectFloatArraysClose(result, expectedRadii, precision);
        });

    });

    describe("calculateSafestPolylineFillet", () => {
        const precision = 6;
        it("should return 0 if calculatePolylineMaxFillets returns an empty array", () => {
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 0]];
            const input: Inputs.Polyline.PolylineToleranceDto = { polyline: { points } };
            expect(polyline.safestFilletRadius(input)).toBe(0);
        });

        it("should return the minimum of the calculated radii", () => {
            const points: Inputs.Base.Point3[] = [[0,0,0], [4,0,0], [0,3,0]];
            const input: Inputs.Polyline.PolylineToleranceDto = { polyline: { points, isClosed: true } };
            const expectedSafest = 2/3;
            expect(polyline.safestFilletRadius(input)).toBeCloseTo(expectedSafest, precision);
        });

        it("should return 0 if any calculated radius is 0", () => {
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [5, 0, 0], [10, 0, 0], [10, 3, 0]];
            const input: Inputs.Polyline.PolylineToleranceDto = { polyline: { points, isClosed: false } };
            expect(polyline.safestFilletRadius(input)).toBeCloseTo(0.0, precision);
        });

        it("should return the single radius if only one corner exists", () => {
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [5, 0, 0], [5, 3, 0]];
            const input: Inputs.Polyline.PolylineToleranceDto = { polyline: { points, isClosed: false } };
            expect(polyline.safestFilletRadius(input)).toBeCloseTo(1.5, precision);
        });
    });

});

