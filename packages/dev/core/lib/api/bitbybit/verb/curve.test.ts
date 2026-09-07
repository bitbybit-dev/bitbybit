import { describe, it, expect, beforeAll } from "vitest";
import { verbCurve } from "../../__test__/verb";
import type { VerbCurve } from "./curve";
import * as Inputs from "../../inputs";

// verb's curve objects have no type on the API today, so the suite names the one the API returns.
// When those signatures tighten, this tightens with them rather than pinning `any` in place.
type Curve = ReturnType<VerbCurve["createBezierCurve"]>;

// A straight line of length 10 along X, expressed as a degree-1 curve through two points.
const START: Inputs.Base.Point3 = [0, 0, 0];
const END: Inputs.Base.Point3 = [10, 0, 0];
const LINE_LENGTH = 10;
const LINEAR_DEGREE = 1;
const MIDPOINT: Inputs.Base.Point3 = [5, 0, 0];
const HALFWAY = 0.5;

// A quadratic Bezier arching over the same span; it is longer than the chord it spans.
const BEZIER_POINTS: Inputs.Base.Point3[] = [[0, 0, 0], [5, 5, 0], [10, 0, 0]];
const SUBDIVISIONS = 4;
const OFF_CURVE_POINT: Inputs.Base.Point3 = [5, 20, 0];

describe("VerbCurve", () => {
    let curve: VerbCurve;
    let line: Curve;
    let bezier: Curve;

    beforeAll(() => {
        curve = verbCurve();
        line = curve.createCurveByPoints(new Inputs.Verb.CurvePathDataDto(LINEAR_DEGREE, [START, END]));
        bezier = curve.createBezierCurve(new Inputs.Verb.BezierCurveDto(BEZIER_POINTS));
    });

    describe("createCurveByPoints", () => {
        it("should build a curve of the requested degree through its end points", () => {
            // Act
            const degree = curve.degree(new Inputs.Verb.CurveDto(line));

            // Assert
            expect(degree).toBe(LINEAR_DEGREE);
            expect(curve.startPoint(new Inputs.Verb.CurveDto(line))).toEqual(START);
            expect(curve.endPoint(new Inputs.Verb.CurveDto(line))).toEqual(END);
        });
    });

    describe("length", () => {
        it("should measure a straight curve as the distance between its ends", () => {
            // Act
            const length = curve.length(new Inputs.Verb.CurveDto(line));

            // Assert
            expect(length).toBeCloseTo(LINE_LENGTH, 6);
        });

        it("should measure an arching curve as longer than the chord it spans", () => {
            // Act
            const arch = curve.length(new Inputs.Verb.CurveDto(bezier));

            // Assert
            expect(arch).toBeGreaterThan(LINE_LENGTH);
        });
    });

    describe("pointAtParam", () => {
        it("should reach the midpoint of a straight curve at half its domain", () => {
            // Arrange
            const inputs = new Inputs.Verb.CurveParameterDto(line, HALFWAY);

            // Act
            const point = curve.pointAtParam(inputs);

            // Assert
            expect(point[0]).toBeCloseTo(MIDPOINT[0], 6);
            expect(point[1]).toBeCloseTo(MIDPOINT[1], 6);
            expect(point[2]).toBeCloseTo(MIDPOINT[2], 6);
        });
    });

    describe("closestPoint", () => {
        it("should drop a perpendicular onto the curve", () => {
            // Arrange
            const inputs = new Inputs.Verb.ClosestPointDto(line, [HALFWAY * LINE_LENGTH, 7, 0]);

            // Act
            const closest = curve.closestPoint(inputs);

            // Assert
            expect(closest[0]).toBeCloseTo(MIDPOINT[0], 6);
            expect(closest[1]).toBeCloseTo(0, 6);
        });

        it("should clamp to an end when the point lies beyond the curve", () => {
            // Arrange
            const inputs = new Inputs.Verb.ClosestPointDto(line, [-50, 0, 0]);

            // Act
            const closest = curve.closestPoint(inputs);

            // Assert
            expect(closest[0]).toBeCloseTo(START[0], 6);
        });
    });

    describe("divideByEqualArcLengthToPoints", () => {
        it("should return one more point than the number of pieces, evenly spaced", () => {
            // Arrange
            const inputs = new Inputs.Verb.CurveSubdivisionsDto(line, SUBDIVISIONS);

            // Act
            const points = curve.divideByEqualArcLengthToPoints(inputs);

            // Assert
            expect(points).toHaveLength(SUBDIVISIONS + 1);
            for (const [index, point] of points.entries()) {
                expect(point[0]).toBeCloseTo((LINE_LENGTH / SUBDIVISIONS) * index, 6);
            }
        });
    });

    describe("reverse", () => {
        it("should swap the ends without changing the length", () => {
            // Act
            const reversed = curve.reverse(new Inputs.Verb.CurveDto(line));

            // Assert
            expect(curve.startPoint(new Inputs.Verb.CurveDto(reversed))).toEqual(END);
            expect(curve.endPoint(new Inputs.Verb.CurveDto(reversed))).toEqual(START);
            expect(curve.length(new Inputs.Verb.CurveDto(reversed))).toBeCloseTo(LINE_LENGTH, 6);
        });
    });

    describe("split", () => {
        it("should cut a curve into two pieces whose lengths add back up", () => {
            // Arrange
            const inputs = new Inputs.Verb.CurveParameterDto(bezier, HALFWAY);
            const whole = curve.length(new Inputs.Verb.CurveDto(bezier));

            // Act
            const pieces = curve.split(inputs);

            // Assert
            expect(pieces).toHaveLength(2);
            const total = pieces.reduce((sum, piece) => sum + curve.length(new Inputs.Verb.CurveDto(piece)), 0);
            expect(total).toBeCloseTo(whole, 4);
        });
    });

    describe("tangent", () => {
        it("should point along a straight curve", () => {
            // Arrange
            const inputs = new Inputs.Verb.CurveParameterDto(line, HALFWAY);

            // Act
            const tangent = curve.tangent(inputs);

            // Assert
            expect(tangent[1]).toBeCloseTo(0, 6);
            expect(tangent[2]).toBeCloseTo(0, 6);
            expect(tangent[0]).toBeGreaterThan(0);
        });
    });

    describe("closestParam", () => {
        it("should give the parameter whose point is the closest one", () => {
            // Arrange
            const inputs = new Inputs.Verb.ClosestPointDto(bezier, OFF_CURVE_POINT);

            // Act
            const parameter = curve.closestParam(inputs);
            const atParameter = curve.pointAtParam(new Inputs.Verb.CurveParameterDto(bezier, parameter));
            const closest = curve.closestPoint(inputs);

            // Assert
            expect(atParameter[0]).toBeCloseTo(closest[0], 6);
            expect(atParameter[1]).toBeCloseTo(closest[1], 6);
        });
    });
});
