import { describe, it, expect, beforeAll } from "vitest";
import { verbSurface } from "../../__test__/verb";
import type { VerbSurface } from "./surface";
import * as Inputs from "../../inputs";

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
});
