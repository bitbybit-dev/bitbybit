import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";
import { Point } from "./point";
import { Line } from "./line";
import { Transforms } from "./transforms";
import { Vector } from "./vector";
import * as Inputs from "../inputs";

describe("Line unit tests", () => {

    let geometryHelper: GeometryHelper;
    let math: MathBitByBit;
    let vector: Vector;
    let point: Point;
    let line: Line;
    let transforms: Transforms;


    // Precision for floating point comparisons
    const TOLERANCE = 1e-7;

    // Helper to compare points/vectors with tolerance
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

    // Helper to compare lines with tolerance
    const expectLineCloseTo = (
        received: Inputs.Base.Line3 | undefined,
        expected: Inputs.Base.Line3
    ) => {
        expect(received).toBeDefined();
        if (!received) return;
        expectPointCloseTo(received.start, expected.start);
        expectPointCloseTo(received.end, expected.end);
    };

    // Helper to compare arrays of lines with tolerance
    const expectLinesCloseTo = (
        received: Inputs.Base.Line3[],
        expected: Inputs.Base.Line3[]
    ) => {
        expect(received.length).toEqual(expected.length);
        received.forEach((l, i) => expectLineCloseTo(l, expected[i]));
    };


    beforeAll(() => {
        geometryHelper = new GeometryHelper();
        math = new MathBitByBit();
        vector = new Vector(math, geometryHelper);
        transforms = new Transforms(vector, math);
        point = new Point(geometryHelper, transforms, vector);
        line = new Line(point, geometryHelper);
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
                expectLineCloseTo(result, expectedLine);
            });

            it("should rotate the line", () => {
                const inputLine: Inputs.Base.Line3 = { start: [1, 0, 0], end: [2, 0, 5] };
                const transformation = transforms.rotationCenterAxis({ center: [0, 0, 0], axis: [0, 0, 1], angle: 90 });
                const result = line.transformLine({ line: inputLine, transformation });
                const expectedLine: Inputs.Base.Line3 = { start: [0, 1, 0], end: [0, 2, 5] };
                expectLineCloseTo(result, expectedLine);
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
                expectLinesCloseTo(result, expectedLines);
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

        describe("getPointOnLine", () => {
            const testLine: Inputs.Base.Line3 = { start: [0, 0, 0], end: [10, 20, -30] };

            it("should return the start point when param is 0", () => {
                const result = line.getPointOnLine({ line: testLine, param: 0 });
                expectPointCloseTo(result, testLine.start);
            });

            it("should return the end point when param is 1", () => {
                const result = line.getPointOnLine({ line: testLine, param: 1 });
                expectPointCloseTo(result, testLine.end);
            });

            it("should return the midpoint when param is 0.5", () => {
                const result = line.getPointOnLine({ line: testLine, param: 0.5 });
                const expectedMidpoint: Inputs.Base.Point3 = [5, 10, -15];
                expectPointCloseTo(result, expectedMidpoint);
            });

            it("should extrapolate backward when param is < 0", () => {
                const result = line.getPointOnLine({ line: testLine, param: -0.5 });
                // Direction = [10, 20, -30]. Start + (-0.5)*Dir = [0,0,0] + [-5, -10, 15]
                const expectedPoint: Inputs.Base.Point3 = [-5, -10, 15];
                expectPointCloseTo(result, expectedPoint);
            });

            it("should extrapolate forward when param is > 1", () => {
                const result = line.getPointOnLine({ line: testLine, param: 1.2 });
                // Start + (1.2)*Dir = [0,0,0] + [12, 24, -36]
                const expectedPoint: Inputs.Base.Point3 = [12, 24, -36];
                expectPointCloseTo(result, expectedPoint);
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
});

