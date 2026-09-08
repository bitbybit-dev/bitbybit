import { describe, it, expect, beforeAll } from "vitest";
import { verbSurface } from "../../__test__/verb";
import type { VerbSurface } from "./surface";
import * as Inputs from "../../inputs";
import { BaseTypes } from "../base-types";

// verb's surface objects have no type on the API today, so the suite names the one the API returns.
type Surface = ReturnType<VerbSurface["createSurfaceByCorners"]>;

// A flat 10 x 6 rectangle in the XY plane, given by its four corners.
const CORNER_A: Inputs.Base.Point3 = [0, 0, 0];
const CORNER_B: Inputs.Base.Point3 = [10, 0, 0];
const CORNER_C: Inputs.Base.Point3 = [10, 6, 0];
const CORNER_D: Inputs.Base.Point3 = [0, 6, 0];
const WIDTH = 10;
const LENGTH = 6;
const MIDDLE = 0.5;
// verb builds a corner surface as a cubic patch even when the four corners are coplanar.
const CORNER_SURFACE_DEGREE = 3;
const UP: Inputs.Base.Vector3 = [0, 0, 1];
const ISOCURVES = 4;

describe("VerbSurface", () => {
    let surfaceService: VerbSurface;
    let flat: Surface;

    beforeAll(() => {
        surfaceService = verbSurface();
        flat = surfaceService.createSurfaceByCorners(
            new Inputs.Verb.CornersDto(CORNER_A, CORNER_B, CORNER_C, CORNER_D));
    });

    describe("createSurfaceByCorners", () => {
        it("should build a cubic patch in both directions", () => {
            // Act
            const inputs = new Inputs.Verb.SurfaceDto(flat);

            // Assert
            expect(surfaceService.degreeU(inputs)).toBe(CORNER_SURFACE_DEGREE);
            expect(surfaceService.degreeV(inputs)).toBe(CORNER_SURFACE_DEGREE);
        });

        it("should span the corners it was given", () => {
            // Act
            const corner = surfaceService.point(new Inputs.Verb.SurfaceLocationDto(flat, 0, 0));
            const opposite = surfaceService.point(new Inputs.Verb.SurfaceLocationDto(flat, 1, 1));

            // Assert
            expect(corner[0]).toBeCloseTo(CORNER_A[0], 6);
            expect(corner[1]).toBeCloseTo(CORNER_A[1], 6);
            expect(opposite[0]).toBeCloseTo(CORNER_C[0], 6);
            expect(opposite[1]).toBeCloseTo(CORNER_C[1], 6);
        });
    });

    describe("point", () => {
        it("should reach the centre of the rectangle at the middle of both parameters", () => {
            // Act
            const middle = surfaceService.point(new Inputs.Verb.SurfaceLocationDto(flat, MIDDLE, MIDDLE));

            // Assert
            expect(middle[0]).toBeCloseTo(WIDTH * MIDDLE, 6);
            expect(middle[1]).toBeCloseTo(LENGTH * MIDDLE, 6);
            expect(middle[2]).toBeCloseTo(0, 6);
        });
    });

    describe("normal", () => {
        it("should stand perpendicular to a surface lying in the XY plane", () => {
            // Act
            const [x, y, z] = surfaceService.normal(new Inputs.Verb.SurfaceLocationDto(flat, MIDDLE, MIDDLE)) as Inputs.Base.Vector3;
            const length = Math.hypot(x, y, z);

            // Assert
            expect(Math.abs(z / length)).toBeCloseTo(Math.abs(UP[2]), 6);
            expect(x / length).toBeCloseTo(0, 6);
            expect(y / length).toBeCloseTo(0, 6);
        });
    });

    describe("closestPoint", () => {
        it("should drop a point above the surface straight down onto it", () => {
            // Arrange
            const above: Inputs.Base.Point3 = [WIDTH * MIDDLE, LENGTH * MIDDLE, 25];

            // Act
            const closest = surfaceService.closestPoint(new Inputs.Verb.SurfaceParamDto(flat, above));

            // Assert
            expect(closest[0]).toBeCloseTo(above[0], 6);
            expect(closest[1]).toBeCloseTo(above[1], 6);
            expect(closest[2]).toBeCloseTo(0, 6);
        });
    });

    describe("domainU and domainV", () => {
        it("should report the parameter range the surface is defined over", () => {
            // Act
            const u = surfaceService.domainU(new Inputs.Verb.SurfaceDto(flat));
            const v = surfaceService.domainV(new Inputs.Verb.SurfaceDto(flat));

            // Assert
            expect(u.min).toBe(0);
            expect(u.max).toBe(1);
            expect(v.min).toBe(0);
            expect(v.max).toBe(1);
        });
    });

    describe("isocurvesSubdivision", () => {
        it("should cut the surface into the requested number of isocurves", () => {
            // Arrange
            const inputs = new Inputs.Verb.IsocurveSubdivisionDto(flat, true, true, true, ISOCURVES);

            // Act
            const curves = surfaceService.isocurvesSubdivision(inputs);

            // Assert
            expect(curves).toHaveLength(ISOCURVES + 1);
        });
    });

    describe("reverse", () => {
        it("should keep the surface in the same place while flipping its normal", () => {
            // Act
            const reversed = surfaceService.reverse(new Inputs.Verb.SurfaceDto(flat));
            const before = surfaceService.normal(new Inputs.Verb.SurfaceLocationDto(flat, MIDDLE, MIDDLE)) as Inputs.Base.Vector3;
            const after = surfaceService.normal(new Inputs.Verb.SurfaceLocationDto(reversed, MIDDLE, MIDDLE)) as Inputs.Base.Vector3;
            const point = surfaceService.point(new Inputs.Verb.SurfaceLocationDto(reversed, MIDDLE, MIDDLE));

            // Assert
            expect(Math.sign(after[2])).toBe(-Math.sign(before[2]));
            expect(point[0]).toBeCloseTo(WIDTH * MIDDLE, 6);
            expect(point[1]).toBeCloseTo(LENGTH * MIDDLE, 6);
        });
    });

    // The rest of the class: the other ways a surface can be made, the readers of what it is made of,
    // the isocurve families, and the transform, which rebuilds the surface from moved control points
    // rather than asking verb to move it.
    describe("createSurfaceByKnotsControlPointsWeights", () => {
        it("should build a flat patch spanning the control points it was given", () => {
            // Arrange - a bilinear patch over the same rectangle
            const points = [[CORNER_A, CORNER_D], [CORNER_B, CORNER_C]];
            const weights = [[1, 1], [1, 1]];

            // Act
            const built = surfaceService.createSurfaceByKnotsControlPointsWeights(
                new Inputs.Verb.KnotsControlPointsWeightsDto(1, 1, [0, 0, 1, 1], [0, 0, 1, 1], points as never, weights as never));

            // Assert
            expect(surfaceService.point(new Inputs.Verb.SurfaceLocationDto(built, 1, 1))).toEqual(CORNER_C);
        });
    });

    describe("createSurfaceByLoftingCurves", () => {
        it("should build a surface running between the curves it was given", () => {
            // Arrange
            const first = surfaceService.isocurve(new Inputs.Verb.SurfaceParameterDto(flat, 0, false));
            const second = surfaceService.isocurve(new Inputs.Verb.SurfaceParameterDto(flat, 1, false));

            // Act
            const lofted = surfaceService.createSurfaceByLoftingCurves(new Inputs.Verb.LoftCurvesDto(1, [first, second]));

            // Assert
            const corner = surfaceService.point(new Inputs.Verb.SurfaceLocationDto(lofted, 0, 0));
            expect(corner[0]).toBeCloseTo(CORNER_A[0], 6);
            expect(corner[1]).toBeCloseTo(CORNER_A[1], 6);
        });
    });

    describe("clone", () => {
        it("should hand back a surface of its own spanning the same corners", () => {
            // Act
            const copy = surfaceService.clone(new Inputs.Verb.SurfaceDto(flat));

            // Assert
            expect(copy).not.toBe(flat);
            expect(surfaceService.point(new Inputs.Verb.SurfaceLocationDto(copy, 1, 1))[0]).toBeCloseTo(CORNER_C[0], 6);
        });
    });

    describe("closestParam", () => {
        it("should give the parameters nearest the point it was given", () => {
            // The API declares a UVDto here, but verb answers with the pair as an array and this
            // method hands back what verb gave it. The declared type is the one that is wrong, and
            // this pins what a caller actually receives.
            // Act
            const uv: BaseTypes.UVDto = surfaceService.closestParam(new Inputs.Verb.SurfaceParamDto(flat, [WIDTH / 2, LENGTH / 2, 5]));
            const pair = Object.values(uv);

            // Assert
            expect(pair[0]).toBeCloseTo(MIDDLE, 4);
            expect(pair[1]).toBeCloseTo(MIDDLE, 4);
        });
    });

    describe("controlPoints", () => {
        it("should give a grid of control points, one row per span", () => {
            // Act
            const points = surfaceService.controlPoints(new Inputs.Verb.SurfaceDto(flat));

            // Assert
            expect(points).toHaveLength(CORNER_SURFACE_DEGREE + 1);
            expect(points[0]).toHaveLength(CORNER_SURFACE_DEGREE + 1);
        });
    });

    describe("weights", () => {
        it("should give a weight for every control point", () => {
            // Act
            const weights = surfaceService.weights(new Inputs.Verb.SurfaceDto(flat));

            // Assert
            expect(weights).toHaveLength(CORNER_SURFACE_DEGREE + 1);
            expect(weights[0]).toEqual([1, 1, 1, 1]);
        });
    });

    describe("knotsU", () => {
        it("should give the knot vector of a cubic patch", () => {
            expect(surfaceService.knotsU(new Inputs.Verb.SurfaceDto(flat))).toEqual([0, 0, 0, 0, 1, 1, 1, 1]);
        });
    });

    describe("knotsV", () => {
        it("should give the knot vector of the other direction", () => {
            expect(surfaceService.knotsV(new Inputs.Verb.SurfaceDto(flat))).toEqual([0, 0, 0, 0, 1, 1, 1, 1]);
        });
    });

    describe("derivatives", () => {
        it("should give the point and how it moves in each direction", () => {
            // Act
            const derivatives = surfaceService.derivatives(new Inputs.Verb.DerivativesDto(flat, MIDDLE, MIDDLE, 1));

            // Assert
            expect(derivatives[0]![0]![0]).toBeCloseTo(WIDTH / 2, 6);
            expect(derivatives[0]![0]![1]).toBeCloseTo(LENGTH / 2, 6);
        });
    });

    describe("boundaries", () => {
        it("should give the four edges of the patch", () => {
            expect(surfaceService.boundaries(new Inputs.Verb.SurfaceDto(flat))).toHaveLength(4);
        });
    });

    describe("isocurve", () => {
        it("should give the curve across the patch at that parameter", () => {
            // Act
            const isocurve = surfaceService.isocurve(new Inputs.Verb.SurfaceParameterDto(flat, MIDDLE, false));

            // Assert - the curve runs the length of the patch at half its width
            expect(isocurve.point(0)[0]).toBeCloseTo(WIDTH / 2, 6);
            expect(isocurve.point(1)[1]).toBeCloseTo(LENGTH, 6);
        });
    });

    describe("isocurvesAtParams", () => {
        it("should give one curve per parameter it was given", () => {
            // Act
            const isocurves = surfaceService.isocurvesAtParams(new Inputs.Verb.IsocurvesParametersDto(flat, [0.25, MIDDLE, 0.75], false));

            // Assert
            expect(isocurves).toHaveLength(3);
        });
    });

    describe("isocurvesSubdivision", () => {
        it("should drop the last curve when it was not asked for", () => {
            // Act
            const withLast = surfaceService.isocurvesSubdivision(new Inputs.Verb.IsocurveSubdivisionDto(flat, false, true, true, ISOCURVES));
            const withoutLast = surfaceService.isocurvesSubdivision(new Inputs.Verb.IsocurveSubdivisionDto(flat, false, false, true, ISOCURVES));

            // Assert
            expect(withoutLast).toHaveLength(withLast.length - 1);
        });

        it("should drop the first curve when it was not asked for", () => {
            // Act
            const withFirst = surfaceService.isocurvesSubdivision(new Inputs.Verb.IsocurveSubdivisionDto(flat, false, true, true, ISOCURVES));
            const withoutFirst = surfaceService.isocurvesSubdivision(new Inputs.Verb.IsocurveSubdivisionDto(flat, false, true, false, ISOCURVES));

            // Assert
            expect(withoutFirst).toHaveLength(withFirst.length - 1);
        });
    });

    describe("split", () => {
        it("should cut the patch in two at the parameter it was given", () => {
            expect(surfaceService.split(new Inputs.Verb.SurfaceParameterDto(flat, MIDDLE, false))).toHaveLength(2);
        });
    });

    describe("transformSurface", () => {
        it("should move the patch by the transformation it was given", () => {
            // Arrange - a translation of 10 along Z
            const translation: Inputs.Base.TransformMatrixes = [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 10, 1]];

            // Act
            const moved = surfaceService.transformSurface(new Inputs.Verb.SurfaceTransformDto(flat, translation));

            // Assert
            expect(surfaceService.point(new Inputs.Verb.SurfaceLocationDto(moved, 0, 0))[2]).toBeCloseTo(10, 6);
        });
    });
});
