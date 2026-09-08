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

    // The rest of the class: the other ways a curve can be made, the readers of what it is made of,
    // the plural forms that map over a list, and the transform, which rebuilds a curve from moved
    // control points rather than asking verb to move it.
    describe("createCurveByKnotsControlPointsWeights", () => {
        it("should build the same line as one built through its points", () => {
            // Arrange
            const knots = [0, 0, 1, 1];
            const weights = [1, 1];

            // Act
            const built = curve.createCurveByKnotsControlPointsWeights(new Inputs.Verb.CurveNurbsDataDto(LINEAR_DEGREE, weights, knots, [START, END]));

            // Assert
            expect(curve.length(new Inputs.Verb.CurveDto(built))).toBeCloseTo(LINE_LENGTH, 5);
        });
    });

    describe("convertLineToNurbsCurve", () => {
        it("should build a curve running between the line's ends", () => {
            // Act
            const converted = curve.convertLineToNurbsCurve(new Inputs.Verb.LineDto({ start: START, end: END }));

            // Assert
            expect(curve.startPoint(new Inputs.Verb.CurveDto(converted))).toEqual(START);
            expect(curve.endPoint(new Inputs.Verb.CurveDto(converted))).toEqual(END);
        });
    });

    describe("convertLinesToNurbsCurves", () => {
        it("should build one curve per line", () => {
            // Act
            const converted = curve.convertLinesToNurbsCurves(new Inputs.Verb.LinesDto([
                { start: START, end: END },
                { start: END, end: START },
            ]));

            // Assert
            expect(converted).toHaveLength(2);
            expect(curve.startPoint(new Inputs.Verb.CurveDto(converted[1]))).toEqual(END);
        });
    });

    describe("convertPolylineToNurbsCurve", () => {
        it("should build a curve through every point of the polyline", () => {
            // Act
            const converted = curve.convertPolylineToNurbsCurve(new Inputs.Verb.PolylineDto({ points: [START, MIDPOINT, END], isClosed: false }));

            // Assert
            expect(curve.startPoint(new Inputs.Verb.CurveDto(converted))).toEqual(START);
            expect(curve.endPoint(new Inputs.Verb.CurveDto(converted))).toEqual(END);
        });
    });

    describe("convertPolylinesToNurbsCurves", () => {
        it("should build one curve per polyline", () => {
            // Act
            const converted = curve.convertPolylinesToNurbsCurves(new Inputs.Verb.PolylinesDto([
                { points: [START, END], isClosed: false },
                { points: [END, START], isClosed: false },
            ]));

            // Assert
            expect(converted).toHaveLength(2);
        });
    });

    describe("clone", () => {
        it("should hand back a curve of its own that spans the same length", () => {
            // Act
            const copy = curve.clone(new Inputs.Verb.CurveDto(line));

            // Assert
            expect(copy).not.toBe(line);
            expect(curve.length(new Inputs.Verb.CurveDto(copy))).toBeCloseTo(LINE_LENGTH, 5);
        });
    });

    describe("closestParams", () => {
        it("should give the parameter nearest each point it was given", () => {
            // Act
            const params = curve.closestParams(new Inputs.Verb.ClosestPointsDto(line, [START, MIDPOINT, END]));

            // Assert
            expect(params[0]).toBeCloseTo(0, 5);
            expect(params[1]).toBeCloseTo(HALFWAY, 5);
            expect(params[2]).toBeCloseTo(1, 5);
        });
    });

    describe("closestPoints", () => {
        it("should give the point on the curve nearest each point it was given", () => {
            // Act
            const points = curve.closestPoints(new Inputs.Verb.ClosestPointsDto(line, [OFF_CURVE_POINT]));

            // Assert
            expect(points[0]![0]).toBeCloseTo(MIDPOINT[0], 5);
            expect(points[0]![1]).toBeCloseTo(0, 5);
        });
    });

    describe("controlPoints", () => {
        it("should give the points the line was built through", () => {
            expect(curve.controlPoints(new Inputs.Verb.CurveDto(line))).toEqual([START, END]);
        });
    });

    describe("weights", () => {
        it("should give one weight per control point", () => {
            expect(curve.weights(new Inputs.Verb.CurveDto(line))).toEqual([1, 1]);
        });
    });

    describe("knots", () => {
        it("should give the knot vector of a degree one curve through two points", () => {
            expect(curve.knots(new Inputs.Verb.CurveDto(line))).toEqual([0, 0, 1, 1]);
        });
    });

    describe("domain", () => {
        it("should run from zero to one", () => {
            // Act
            const domain = curve.domain(new Inputs.Verb.CurveDto(line));

            // Assert
            expect(domain.min).toBe(0);
            expect(domain.max).toBe(1);
        });
    });

    describe("derivatives", () => {
        it("should give the point and the direction it is travelling in", () => {
            // Act
            const derivatives = curve.derivatives(new Inputs.Verb.CurveDerivativesDto(line, HALFWAY, 1));

            // Assert
            expect(derivatives[0]).toEqual(MIDPOINT);
            expect(derivatives[1]).toEqual([LINE_LENGTH, 0, 0]);
        });
    });

    describe("lengthAtParam", () => {
        it("should give half the length halfway along", () => {
            expect(curve.lengthAtParam(new Inputs.Verb.CurveParameterDto(line, HALFWAY))).toBeCloseTo(LINE_LENGTH / 2, 5);
        });
    });

    describe("paramAtLength", () => {
        it("should give the parameter that far along the curve", () => {
            expect(curve.paramAtLength(new Inputs.Verb.CurveLengthToleranceDto(line, LINE_LENGTH / 2, 1e-6))).toBeCloseTo(HALFWAY, 4);
        });
    });

    describe("divideByEqualArcLengthToParams", () => {
        it("should give a parameter per division of the curve", () => {
            // Act
            const params = curve.divideByEqualArcLengthToParams(new Inputs.Verb.CurveSubdivisionsDto(line, SUBDIVISIONS));

            // Assert
            expect(params).toHaveLength(SUBDIVISIONS + 1);
            expect(params[1]).toBeCloseTo(0.25, 5);
        });
    });

    describe("divideByArcLengthToParams", () => {
        it("should give a parameter every step of that length along the curve", () => {
            // Act
            const params = curve.divideByArcLengthToParams(new Inputs.Verb.CurveDivideLengthDto(line, LINE_LENGTH / 2));

            // Assert
            expect(params).toHaveLength(3);
            expect(params[1]).toBeCloseTo(HALFWAY, 5);
        });
    });

    describe("divideByArcLengthToPoints", () => {
        it("should give a point every step of that length along the curve", () => {
            // Act
            const points = curve.divideByArcLengthToPoints(new Inputs.Verb.CurveDivideLengthDto(line, LINE_LENGTH / 2));

            // Assert
            expect(points[1]![0]).toBeCloseTo(MIDPOINT[0], 5);
        });
    });

    describe("divideCurvesByEqualArcLengthToPoints", () => {
        it("should divide every curve it was given", () => {
            // Act
            const points = curve.divideCurvesByEqualArcLengthToPoints(new Inputs.Verb.CurvesSubdivisionsDto([line, bezier], SUBDIVISIONS));

            // Assert
            expect(points).toHaveLength(2);
            expect(points[0]).toHaveLength(SUBDIVISIONS + 1);
        });
    });

    describe("divideCurvesByArcLengthToPoints", () => {
        it("should divide every curve it was given", () => {
            // Act
            const points = curve.divideCurvesByArcLengthToPoints(new Inputs.Verb.CurvesDivideLengthDto([line, bezier], LINE_LENGTH / 2));

            // Assert
            expect(points).toHaveLength(2);
            expect(points[0]).toHaveLength(3);
        });
    });

    describe("startPoints", () => {
        it("should give the start of every curve it was given", () => {
            expect(curve.startPoints(new Inputs.Verb.CurvesDto([line, bezier]))).toEqual([START, START]);
        });
    });

    describe("endPoints", () => {
        it("should give the end of every curve it was given", () => {
            expect(curve.endPoints(new Inputs.Verb.CurvesDto([line, bezier]))).toEqual([END, END]);
        });
    });

    describe("pointsAtParam", () => {
        it("should give the point at that parameter on every curve", () => {
            // Act
            const points = curve.pointsAtParam(new Inputs.Verb.CurvesParameterDto([line, bezier], HALFWAY));

            // Assert
            expect(points).toHaveLength(2);
            expect(points[0]).toEqual(MIDPOINT);
        });
    });

    describe("tessellate", () => {
        it("should walk a straight line in its two end points", () => {
            expect(curve.tessellate(new Inputs.Verb.CurveToleranceDto(line, 0.01))).toEqual([START, END]);
        });

        it("should need more points to follow a curved span", () => {
            expect(curve.tessellate(new Inputs.Verb.CurveToleranceDto(bezier, 0.01)).length).toBeGreaterThan(2);
        });
    });

    describe("transform", () => {
        it("should move the curve by the transformation it was given", () => {
            // Arrange - a translation of 10 along Y
            const translation: Inputs.Base.TransformMatrixes = [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 10, 0, 1]];

            // Act
            const moved = curve.transform(new Inputs.Verb.CurveTransformDto(line, translation));

            // Assert
            expect(curve.startPoint(new Inputs.Verb.CurveDto(moved))).toEqual([0, 10, 0]);
            expect(curve.endPoint(new Inputs.Verb.CurveDto(moved))).toEqual([10, 10, 0]);
        });
    });

    describe("transformCurves", () => {
        it("should move every curve it was given", () => {
            // Arrange
            const translation: Inputs.Base.TransformMatrixes = [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 10, 0, 1]];

            // Act
            const moved = curve.transformCurves(new Inputs.Verb.CurvesTransformDto([line, bezier], translation));

            // Assert
            expect(moved).toHaveLength(2);
            expect(curve.startPoint(new Inputs.Verb.CurveDto(moved[0]))).toEqual([0, 10, 0]);
        });
    });
});
