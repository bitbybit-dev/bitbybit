import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";
import { Point } from "./point";
import { Line } from "./line";
import { Lists } from "./lists";
import { Transforms } from "./transforms";
import { Vector } from "./vector";
import * as Inputs from "../inputs";
import { UnitTestHelper } from "../unit-test-helper";

describe("Line unit tests", () => {

    const uh = new UnitTestHelper();

    let geometryHelper: GeometryHelper;
    let math: MathBitByBit;
    let vector: Vector;
    let point: Point;
    let line: Line;
    let lists: Lists;
    let transforms: Transforms;


    // Precision for floating point comparisons
    const TOLERANCE = 1e-7;


    beforeAll(() => {
        geometryHelper = new GeometryHelper();
        math = new MathBitByBit();
        vector = new Vector(math, geometryHelper);
        transforms = new Transforms(vector, math);
        lists = new Lists();
        point = new Point(geometryHelper, transforms, vector, lists);
        line = new Line(vector, point, geometryHelper);
    });


    describe("Line Class Unit Tests (Integration)", () => {

        const sampleLine: Inputs.Base.Line3 = { start: [1, 2, 3], end: [4, 6, 8] };
        const sampleLineZeroLength: Inputs.Base.Line3 = { start: [1, 1, 1], end: [1, 1, 1] };

        describe("getStartPoint", () => {
            it("should return the start point of the line", () => {
                const result = line.getStartPoint({ line: sampleLine });
                expect(result).toEqual(sampleLine.start);
            });
        });

        describe("getEndPoint", () => {
            it("should return the end point of the line", () => {
                const result = line.getEndPoint({ line: sampleLine });
                expect(result).toEqual(sampleLine.end);
            });
        });

        describe("length", () => {
            it("should calculate the length of the line", () => {
                // start: [1, 2, 3], end: [4, 6, 8] -> dx=3, dy=4, dz=5
                // length = sqrt(3^2 + 4^2 + 5^2) = sqrt(9 + 16 + 25) = sqrt(50)
                const expectedLength = Math.sqrt(50);
                const result = line.length({ line: sampleLine });
                expect(result).toBeCloseTo(expectedLength, TOLERANCE);
            });

            it("should return 0 for a zero-length line", () => {
                const result = line.length({ line: sampleLineZeroLength });
                expect(result).toBeCloseTo(0, TOLERANCE);
            });
        });

        describe("reverse", () => {
            it("should swap the start and end points", () => {
                const result = line.reverse({ line: sampleLine });
                const expectedReversedLine: Inputs.Base.Line3 = { start: sampleLine.end, end: sampleLine.start };
                expect(result).toEqual(expectedReversedLine);
                // Ensure it returns a new object
                expect(result).not.toBe(sampleLine);
            });
        });

        describe("transformLine", () => {
            it("should transform both start and end points of the line", () => {
                const inputLine: Inputs.Base.Line3 = { start: [0, 0, 0], end: [1, 0, 0] };
                const transformation = transforms.translationXYZ({ translation: [10, 5, -2] });
                const result = line.transformLine({ line: inputLine, transformation });
                const expectedLine: Inputs.Base.Line3 = { start: [10, 5, -2], end: [11, 5, -2] };
                uh.expectLineCloseTo(result, expectedLine);
            });

            it("should rotate the line", () => {
                const inputLine: Inputs.Base.Line3 = { start: [1, 0, 0], end: [2, 0, 5] };
                const transformation = transforms.rotationCenterAxis({ center: [0, 0, 0], axis: [0, 0, 1], angle: 90 });
                const result = line.transformLine({ line: inputLine, transformation });
                const expectedLine: Inputs.Base.Line3 = { start: [0, 1, 0], end: [0, 2, 5] };
                uh.expectLineCloseTo(result, expectedLine);
            });

            it("should return a new object", () => {
                const inputLine: Inputs.Base.Line3 = { start: [0, 0, 0], end: [1, 0, 0] };
                const transformation = [transforms.identity()];
                const result = line.transformLine({ line: inputLine, transformation });
                expect(result).not.toBe(inputLine);
                expect(result.start).not.toBe(inputLine.start); // transformControlPoints likely creates new points/arrays
                expect(result.end).not.toBe(inputLine.end);
            });
        });

        describe("transformsForLines", () => {
            it("should apply individual transforms to corresponding lines", () => {
                const inputLines: Inputs.Base.Line3[] = [
                    { start: [0, 0, 0], end: [1, 0, 0] },
                    { start: [5, 5, 5], end: [5, 6, 5] }
                ];
                const transformations = [
                    transforms.translationXYZ({ translation: [0, 10, 0] }), // Translate line 1
                    transforms.rotationCenterAxis({ center: [5, 5, 5], axis: [1, 0, 0], angle: 90 }) // Rotate line 2 around its start
                ];
                const result = line.transformsForLines({ lines: inputLines, transformation: transformations });
                const expectedLines: Inputs.Base.Line3[] = [
                    { start: [0, 10, 0], end: [1, 10, 0] },
                    { start: [5, 5, 5], end: [5, 5, 6] } // Rotation around X maps Y=1 -> Z=1
                ];
                uh.expectLinesCloseTo(result, expectedLines);
            });

            it("should handle empty input arrays", () => {
                const result = line.transformsForLines({ lines: [], transformation: [] });
                expect(result).toEqual([]);
            });

            // Note: This method does not check for mismatched array lengths, unlike Point.transformsForPoints
            // Adding such a check might be a good idea in the Line class itself.
            // Testing the current behavior (likely error or incorrect result) is less useful than testing intended logic.
        });

        describe("create", () => {
            it("should create a line object from start and end points", () => {
                const startP: Inputs.Base.Point3 = [9, 8, 7];
                const endP: Inputs.Base.Point3 = [6, 5, 4];
                const result = line.create({ start: startP, end: endP });
                const expectedLine: Inputs.Base.Line3 = { start: startP, end: endP };
                expect(result).toEqual(expectedLine);
            });
        });

        describe("createSegment", () => {
            it("should create a segment from start and end points", () => {
                const startP: Inputs.Base.Point3 = [1, 2, 3];
                const endP: Inputs.Base.Point3 = [4, 5, 6];
                const result = line.createSegment({ start: startP, end: endP });
                expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
            });

            it("should return an array with exactly two points", () => {
                const startP: Inputs.Base.Point3 = [0, 0, 0];
                const endP: Inputs.Base.Point3 = [10, 20, 30];
                const result = line.createSegment({ start: startP, end: endP });
                expect(result.length).toBe(2);
                expect(result[0]).toEqual([0, 0, 0]);
                expect(result[1]).toEqual([10, 20, 30]);
            });

            it("should handle negative coordinates", () => {
                const startP: Inputs.Base.Point3 = [-5, -10, -15];
                const endP: Inputs.Base.Point3 = [-1, -2, -3];
                const result = line.createSegment({ start: startP, end: endP });
                expect(result).toEqual([[-5, -10, -15], [-1, -2, -3]]);
            });

            it("should handle zero-length segment (same start and end)", () => {
                const startP: Inputs.Base.Point3 = [7, 7, 7];
                const endP: Inputs.Base.Point3 = [7, 7, 7];
                const result = line.createSegment({ start: startP, end: endP });
                expect(result).toEqual([[7, 7, 7], [7, 7, 7]]);
            });

            it("should handle floating point coordinates", () => {
                const startP: Inputs.Base.Point3 = [1.5, 2.75, 3.125];
                const endP: Inputs.Base.Point3 = [4.875, 5.0625, 6.03125];
                const result = line.createSegment({ start: startP, end: endP });
                expect(result).toEqual([[1.5, 2.75, 3.125], [4.875, 5.0625, 6.03125]]);
            });

            it("should handle very large coordinates", () => {
                const startP: Inputs.Base.Point3 = [1e10, 2e10, 3e10];
                const endP: Inputs.Base.Point3 = [4e10, 5e10, 6e10];
                const result = line.createSegment({ start: startP, end: endP });
                expect(result).toEqual([[1e10, 2e10, 3e10], [4e10, 5e10, 6e10]]);
            });

            it("should handle very small coordinates", () => {
                const startP: Inputs.Base.Point3 = [1e-10, 2e-10, 3e-10];
                const endP: Inputs.Base.Point3 = [4e-10, 5e-10, 6e-10];
                const result = line.createSegment({ start: startP, end: endP });
                expect(result).toEqual([[1e-10, 2e-10, 3e-10], [4e-10, 5e-10, 6e-10]]);
            });

            it("should create segment along X axis only", () => {
                const startP: Inputs.Base.Point3 = [0, 0, 0];
                const endP: Inputs.Base.Point3 = [100, 0, 0];
                const result = line.createSegment({ start: startP, end: endP });
                expect(result).toEqual([[0, 0, 0], [100, 0, 0]]);
            });

            it("should create segment along Y axis only", () => {
                const startP: Inputs.Base.Point3 = [0, 0, 0];
                const endP: Inputs.Base.Point3 = [0, 100, 0];
                const result = line.createSegment({ start: startP, end: endP });
                expect(result).toEqual([[0, 0, 0], [0, 100, 0]]);
            });

            it("should create segment along Z axis only", () => {
                const startP: Inputs.Base.Point3 = [0, 0, 0];
                const endP: Inputs.Base.Point3 = [0, 0, 100];
                const result = line.createSegment({ start: startP, end: endP });
                expect(result).toEqual([[0, 0, 0], [0, 0, 100]]);
            });

            it("should create diagonal segment in 3D space", () => {
                const startP: Inputs.Base.Point3 = [1, 1, 1];
                const endP: Inputs.Base.Point3 = [2, 2, 2];
                const result = line.createSegment({ start: startP, end: endP });
                expect(result).toEqual([[1, 1, 1], [2, 2, 2]]);
            });
        });

        describe("getPointOnLine", () => {
            const testLine: Inputs.Base.Line3 = { start: [0, 0, 0], end: [10, 20, -30] };

            it("should return the start point when param is 0", () => {
                const result = line.getPointOnLine({ line: testLine, param: 0 });
                uh.expectPointCloseTo(result, testLine.start);
            });

            it("should return the end point when param is 1", () => {
                const result = line.getPointOnLine({ line: testLine, param: 1 });
                uh.expectPointCloseTo(result, testLine.end);
            });

            it("should return the midpoint when param is 0.5", () => {
                const result = line.getPointOnLine({ line: testLine, param: 0.5 });
                const expectedMidpoint: Inputs.Base.Point3 = [5, 10, -15];
                uh.expectPointCloseTo(result, expectedMidpoint);
            });

            it("should extrapolate backward when param is < 0", () => {
                const result = line.getPointOnLine({ line: testLine, param: -0.5 });
                // Direction = [10, 20, -30]. Start + (-0.5)*Dir = [0,0,0] + [-5, -10, 15]
                const expectedPoint: Inputs.Base.Point3 = [-5, -10, 15];
                uh.expectPointCloseTo(result, expectedPoint);
            });

            it("should extrapolate forward when param is > 1", () => {
                const result = line.getPointOnLine({ line: testLine, param: 1.2 });
                // Start + (1.2)*Dir = [0,0,0] + [12, 24, -36]
                const expectedPoint: Inputs.Base.Point3 = [12, 24, -36];
                uh.expectPointCloseTo(result, expectedPoint);
            });
        });

        describe("linesBetweenPoints", () => {
            it("should create lines connecting consecutive points", () => {
                const points: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 1], [2, 0, 0]];
                const result = line.linesBetweenPoints({ points });
                const expectedLines: Inputs.Base.Line3[] = [
                    { start: [0, 0, 0], end: [1, 1, 1] },
                    { start: [1, 1, 1], end: [2, 0, 0] }
                ];
                expect(result).toEqual(expectedLines);
            });

            it("should create one line for two points", () => {
                const points: Inputs.Base.Point3[] = [[5, 0, 0], [0, 5, 0]];
                const result = line.linesBetweenPoints({ points });
                const expectedLines: Inputs.Base.Line3[] = [
                    { start: [5, 0, 0], end: [0, 5, 0] }
                ];
                expect(result).toEqual(expectedLines);
            });

            it("should return an empty array for one point", () => {
                const points: Inputs.Base.Point3[] = [[1, 2, 3]];
                const result = line.linesBetweenPoints({ points });
                expect(result).toEqual([]);
            });

            it("should return an empty array for zero points", () => {
                const points: Inputs.Base.Point3[] = [];
                const result = line.linesBetweenPoints({ points });
                expect(result).toEqual([]);
            });
        });

        describe("linesBetweenStartAndEndPoints", () => {
            it("should create lines between corresponding start and end points", () => {
                const starts: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 1]];
                const ends: Inputs.Base.Point3[] = [[10, 0, 0], [11, 1, 1]];
                const result = line.linesBetweenStartAndEndPoints({ startPoints: starts, endPoints: ends });
                const expectedLines: Inputs.Base.Line3[] = [
                    { start: [0, 0, 0], end: [10, 0, 0] },
                    { start: [1, 1, 1], end: [11, 1, 1] }
                ];
                expect(result).toEqual(expectedLines);
            });

            it("should filter out zero-length lines", () => {
                const starts: Inputs.Base.Point3[] = [[0, 0, 0], [5, 5, 5], [1, 2, 3]];
                const ends: Inputs.Base.Point3[] = [[10, 0, 0], [5, 5, 5], [4, 5, 6]]; // Middle line is zero-length
                const result = line.linesBetweenStartAndEndPoints({ startPoints: starts, endPoints: ends });
                const expectedLines: Inputs.Base.Line3[] = [
                    { start: [0, 0, 0], end: [10, 0, 0] },
                    { start: [1, 2, 3], end: [4, 5, 6] }
                ];
                expect(result).toEqual(expectedLines);
            });

            it("should return an empty array for empty input lists", () => {
                const result = line.linesBetweenStartAndEndPoints({ startPoints: [], endPoints: [] });
                expect(result).toEqual([]);
            });

            // Note: Like transformsForLines, assumes lists are the same length. Mismatched lengths aren't explicitly handled.
        });

        describe("lineToSegment", () => {
            it("should convert a line object to a segment array", () => {
                const result = line.lineToSegment({ line: sampleLine });
                const expectedSegment: Inputs.Base.Segment3 = [sampleLine.start, sampleLine.end];
                expect(result).toEqual(expectedSegment);
            });
        });

        describe("linesToSegments", () => {
            it("should convert multiple line objects to segment arrays", () => {
                const lines: Inputs.Base.Line3[] = [
                    { start: [0, 0, 0], end: [1, 1, 1] },
                    { start: [2, 2, 2], end: [3, 3, 3] }
                ];
                const result = line.linesToSegments({ lines });
                const expectedSegments: Inputs.Base.Segment3[] = [
                    [[0, 0, 0], [1, 1, 1]],
                    [[2, 2, 2], [3, 3, 3]]
                ];
                expect(result).toEqual(expectedSegments);
            });

            it("should return an empty array for empty lines input", () => {
                const result = line.linesToSegments({ lines: [] });
                expect(result).toEqual([]);
            });
        });

        describe("segmentToLine", () => {
            it("should convert a segment array to a line object", () => {
                const segment: Inputs.Base.Segment3 = [[10, 9, 8], [7, 6, 5]];
                const result = line.segmentToLine({ segment });
                const expectedLine: Inputs.Base.Line3 = { start: segment[0], end: segment[1] };
                expect(result).toEqual(expectedLine);
            });
        });

        describe("segmentsToLines", () => {
            it("should convert multiple segment arrays to line objects", () => {
                const segments: Inputs.Base.Segment3[] = [
                    [[0, 0, 0], [1, 1, 1]],
                    [[2, 2, 2], [3, 3, 3]]
                ];
                const result = line.segmentsToLines({ segments });
                const expectedLines: Inputs.Base.Line3[] = [
                    { start: [0, 0, 0], end: [1, 1, 1] },
                    { start: [2, 2, 2], end: [3, 3, 3] }
                ];
                expect(result).toEqual(expectedLines);
            });

            it("should return an empty array for empty segments input", () => {
                const result = line.segmentsToLines({ segments: [] });
                expect(result).toEqual([]);
            });
        });

    });

    describe("lineLineIntersection", () => {

        // --- Test Data ---
        const ORIGIN: Inputs.Base.Point3 = [0, 0, 0];

        // Basic intersecting lines (X and Y axes)
        const lineX: Inputs.Base.Line3 = { start: [-5, 0, 0], end: [5, 0, 0] };
        const lineY: Inputs.Base.Line3 = { start: [0, -5, 0], end: [0, 5, 0] };
        const expectedXYIntersect: Inputs.Base.Point3 = [0, 0, 0];

        // Lines intersecting outside segments
        const lineXshort: Inputs.Base.Line3 = { start: [1, 0, 0], end: [5, 0, 0] };
        const lineYshort: Inputs.Base.Line3 = { start: [0, 1, 0], end: [0, 5, 0] };

        // Lines intersecting at endpoint
        const lineXoriginEnd: Inputs.Base.Line3 = { start: [-5, 0, 0], end: [0, 0, 0] };
        const lineYoriginStart: Inputs.Base.Line3 = { start: [0, 0, 0], end: [0, 5, 0] };

        // Skew lines
        const lineXoffsetY: Inputs.Base.Line3 = { start: [-5, 1, 0], end: [5, 1, 0] };
        const lineY_offsetZ: Inputs.Base.Line3 = { start: [0, -5, 1], end: [0, 5, 1] };
        const lineSkewDiag: Inputs.Base.Line3 = { start: [-5, -5, 5], end: [5, 5, 10] };

        // Parallel non-collinear lines
        const lineXoffsetZ: Inputs.Base.Line3 = { start: [-5, 0, 1], end: [5, 0, 1] };

        // Collinear lines
        const lineX_0_10: Inputs.Base.Line3 = { start: [0, 0, 0], end: [10, 0, 0] };
        const lineX_5_15: Inputs.Base.Line3 = { start: [5, 0, 0], end: [15, 0, 0] };
        const lineX_10_20: Inputs.Base.Line3 = { start: [10, 0, 0], end: [20, 0, 0] };
        const lineX_11_20: Inputs.Base.Line3 = { start: [11, 0, 0], end: [20, 0, 0] };
        const lineX_neg10_neg5: Inputs.Base.Line3 = { start: [-10, 0, 0], end: [-5, 0, 0] };

        // Zero length line
        const zeroLine: Inputs.Base.Line3 = { start: [1, 1, 1], end: [1, 1, 1] };

        describe("Intersecting Lines", () => {
            it("should find intersection within segments (checkSegmentsOnly = true)", () => {
                const result = line.lineLineIntersection({ line1: lineX, line2: lineY, checkSegmentsOnly: true });
                uh.expectPointCloseTo(result, expectedXYIntersect);
            });

            it("should find intersection within segments (checkSegmentsOnly = false)", () => {
                const result = line.lineLineIntersection({ line1: lineX, line2: lineY, checkSegmentsOnly: false });
                uh.expectPointCloseTo(result, expectedXYIntersect);
            });

            it("should find intersection at endpoints (checkSegmentsOnly = true)", () => {
                const result = line.lineLineIntersection({ line1: lineXoriginEnd, line2: lineYoriginStart, checkSegmentsOnly: true });
                uh.expectPointCloseTo(result, ORIGIN);
            });

            it("should find intersection at endpoints (checkSegmentsOnly = false)", () => {
                const result = line.lineLineIntersection({ line1: lineXoriginEnd, line2: lineYoriginStart, checkSegmentsOnly: false });
                uh.expectPointCloseTo(result, ORIGIN);
            });

            it("should NOT find intersection when outside segments (checkSegmentsOnly = true)", () => {
                const result = line.lineLineIntersection({ line1: lineXshort, line2: lineYshort, checkSegmentsOnly: true });
                expect(result).toBeUndefined();
            });

            it("should find intersection when outside segments (checkSegmentsOnly = false)", () => {
                const result = line.lineLineIntersection({ line1: lineXshort, line2: lineYshort, checkSegmentsOnly: false });
                uh.expectPointCloseTo(result, ORIGIN); // The intersection of infinite lines is origin
            });

            it("should handle near-zero results by clipping them", () => {
                const line1: Inputs.Base.Line3 = { start: [-1, 1e-10, 0], end: [1, -1e-10, 0] }; // Crosses Y=0 at X=0
                const line2: Inputs.Base.Line3 = { start: [0, -1, 0], end: [0, 1, 0] }; // Y axis
                const expected: Inputs.Base.Point3 = [0, 0, 0];
                const result = line.lineLineIntersection({ line1, line2, checkSegmentsOnly: true, tolerance: 1e-8 });
                uh.expectPointCloseTo(result, expected);
            });

            it("should handle tolerance based intersection", () => {
                const line1: Inputs.Base.Line3 = { start: [-5, 0, 0], end: [5, 0, 0] };
                const line2: Inputs.Base.Line3 = { start: [0, -5, 1e-10], end: [0, 5, 1e-10] };
                const expected: Inputs.Base.Point3 = [0, 0, 0];
                // Keep in mind that we use epsilon cubes for tolerance - otherwise this case would be considered skewed
                const result = line.lineLineIntersection({ line1, line2, checkSegmentsOnly: true, tolerance: 1e-2 });
                uh.expectPointCloseTo(result, expected);
            });
        });

        describe("Skew Lines", () => {
            it("should return undefined for skew lines (offset parallel) (checkSegmentsOnly = true)", () => {
                const result = line.lineLineIntersection({ line1: lineX, line2: lineY_offsetZ, checkSegmentsOnly: true });
                expect(result).toBeUndefined();
            });

            it("should return undefined for skew lines (offset parallel) (checkSegmentsOnly = false)", () => {
                const result = line.lineLineIntersection({ line1: lineX, line2: lineY_offsetZ, checkSegmentsOnly: false });
                expect(result).toBeUndefined();
            });

            it("should return undefined for skew lines (diagonal) (checkSegmentsOnly = true)", () => {
                const result = line.lineLineIntersection({ line1: lineX, line2: lineSkewDiag, checkSegmentsOnly: true });
                expect(result).toBeUndefined();
            });

            it("should return undefined for skew lines (diagonal) (checkSegmentsOnly = false)", () => {
                const result = line.lineLineIntersection({ line1: lineX, line2: lineSkewDiag, checkSegmentsOnly: false });
                expect(result).toBeUndefined();
            });

            it("should return undefined for another skew case (checkSegmentsOnly = true)", () => {
                const result = line.lineLineIntersection({ line1: lineX, line2: lineXoffsetY, checkSegmentsOnly: true });
                expect(result).toBeUndefined();
            });

            it("should return undefined for another skew case (checkSegmentsOnly = false)", () => {
                const result = line.lineLineIntersection({ line1: lineX, line2: lineXoffsetY, checkSegmentsOnly: false });
                expect(result).toBeUndefined();
            });
        });

        describe("Parallel Lines", () => {
            it("should return undefined for parallel non-collinear lines (checkSegmentsOnly = true)", () => {
                const result = line.lineLineIntersection({ line1: lineX, line2: lineXoffsetZ, checkSegmentsOnly: true });
                expect(result).toBeUndefined();
            });

            it("should return undefined for parallel non-collinear lines (checkSegmentsOnly = false)", () => {
                const result = line.lineLineIntersection({ line1: lineX, line2: lineXoffsetZ, checkSegmentsOnly: false });
                expect(result).toBeUndefined();
            });
        });

        describe("Collinear Lines", () => {

            it("should return undefined for overlapping collinear segments (checkSegmentsOnly = true)", () => {
                const result = line.lineLineIntersection({ line1: lineX_0_10, line2: lineX_5_15, checkSegmentsOnly: true });
                expect(result).toBeUndefined(); // Intersection is a segment [5,0,0] to [10,0,0]
            });
            it("should return undefined for fully contained collinear segments (checkSegmentsOnly = true)", () => {
                const result = line.lineLineIntersection({ line1: lineX_0_10, line2: { start: [2, 0, 0], end: [8, 0, 0] }, checkSegmentsOnly: true });
                expect(result).toBeUndefined();
            });
            it("should return undefined for touching collinear segments (checkSegmentsOnly = true)", () => {
                const result = line.lineLineIntersection({ line1: lineX_0_10, line2: lineX_10_20, checkSegmentsOnly: true });
                expect(result).toBeUndefined();
            });
            it("should return undefined for separate collinear segments (checkSegmentsOnly = true)", () => {
                const result = line.lineLineIntersection({ line1: lineX_0_10, line2: lineX_11_20, checkSegmentsOnly: true });
                expect(result).toBeUndefined();
            });

            it("should return start point of line1 for overlapping collinear segments (checkSegmentsOnly = false)", () => {
                const result = line.lineLineIntersection({ line1: lineX_0_10, line2: lineX_5_15, checkSegmentsOnly: false });
                uh.expectPointCloseTo(result, lineX_0_10.start);
            });

            it("should return start point of line1 for fully contained collinear segments (checkSegmentsOnly = false)", () => {
                const result = line.lineLineIntersection({ line1: lineX_0_10, line2: { start: [2, 0, 0], end: [8, 0, 0] }, checkSegmentsOnly: false });
                uh.expectPointCloseTo(result, lineX_0_10.start);
            });

            it("should return start point of line1 for touching collinear segments (checkSegmentsOnly = false)", () => {
                const result = line.lineLineIntersection({ line1: lineX_0_10, line2: lineX_10_20, checkSegmentsOnly: false });
                uh.expectPointCloseTo(result, lineX_0_10.start);
            });

            it("should return start point of line1 for separate collinear segments (checkSegmentsOnly = false)", () => {
                const result = line.lineLineIntersection({ line1: lineX_0_10, line2: lineX_11_20, checkSegmentsOnly: false });
                uh.expectPointCloseTo(result, lineX_0_10.start);
            });

            it("should return start point of line1 for separate collinear segments (negative side) (checkSegmentsOnly = false)", () => {
                const result = line.lineLineIntersection({ line1: lineX_0_10, line2: lineX_neg10_neg5, checkSegmentsOnly: false });
                uh.expectPointCloseTo(result, lineX_0_10.start);
            });
        });

        describe("Edge Cases", () => {

            it("should return undefined if line1 has zero length", () => {
                const result = line.lineLineIntersection({ line1: zeroLine, line2: lineX, checkSegmentsOnly: true });
                expect(result).toBeUndefined();
            });

            it("should return undefined if line2 has zero length", () => {
                const result = line.lineLineIntersection({ line1: lineX, line2: zeroLine, checkSegmentsOnly: false });
                expect(result).toBeUndefined();
            });

            it("should return undefined if both lines have zero length", () => {
                const result = line.lineLineIntersection({ line1: zeroLine, line2: zeroLine, checkSegmentsOnly: true });
                expect(result).toBeUndefined();
            });

            it("should distinguish near-intersecting skew lines based on tolerance", () => {
                const line1: Inputs.Base.Line3 = { start: [0, 0, 0], end: [10, 0, 0] };
                const tiny_offset = 1e-5;
                const line2_skew: Inputs.Base.Line3 = { start: [5 + tiny_offset, -5, tiny_offset], end: [5 + tiny_offset, 5, tiny_offset] };
                const resultSkewTight = line.lineLineIntersection({ line1, line2: line2_skew, checkSegmentsOnly: true, tolerance: 1e-7 });
                expect(resultSkewTight).toBeUndefined();
                const resultIntersectLoose = line.lineLineIntersection({ line1, line2: line2_skew, checkSegmentsOnly: true, tolerance: 1e-1 });
                expect(resultIntersectLoose).toEqual([5.00001, 0, 0]);
            });

        });
    });
});

