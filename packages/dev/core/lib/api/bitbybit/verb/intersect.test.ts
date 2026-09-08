import { describe, it, expect, beforeAll } from "vitest";
import * as verb from "verb-nurbs-web";
import { GeometryHelper } from "@bitbybit-dev/base";
import { ContextBase } from "../../context";
import { VerbIntersect } from "./intersect";
import { VerbCurve } from "./curve";
import { VerbSurface } from "./surface";
import { MathBitByBit } from "@bitbybit-dev/base";
import * as Inputs from "../../inputs";
import { BaseTypes } from "../base-types";

const CROSSING: Inputs.Base.Point3[] = [[-5, 0, 0], [5, 0, 0]];
const CROSSED: Inputs.Base.Point3[] = [[0, -5, 0], [0, 5, 0]];
const TOLERANCE = 1e-3;

const OFF_CURVE: BaseTypes.CurveCurveIntersection = {
    point0: [99, 0, 0],
    point1: [99, 0, 0],
    u0: 1.5,
    u1: 1.5,
};

describe("VerbIntersect", () => {
    let intersect: VerbIntersect;
    let curveService: VerbCurve;
    let surfaceService: VerbSurface;
    let crossing: ReturnType<VerbCurve["createCurveByPoints"]>;
    let crossed: ReturnType<VerbCurve["createCurveByPoints"]>;

    beforeAll(() => {
        const context = new ContextBase();
        context.verb = verb;
        const geometryHelper = new GeometryHelper();
        intersect = new VerbIntersect(context, geometryHelper);
        curveService = new VerbCurve(context, geometryHelper, new MathBitByBit());
        surfaceService = new VerbSurface(context, geometryHelper, new MathBitByBit());
        crossing = curveService.createCurveByPoints(new Inputs.Verb.CurvePathDataDto(1, CROSSING));
        crossed = curveService.createCurveByPoints(new Inputs.Verb.CurvePathDataDto(1, CROSSED));
    });

    describe("curves", () => {
        it("should find the one point where two crossing lines meet", () => {
            // Act
            const intersections = intersect.curves(new Inputs.Verb.CurveCurveDto(crossing, crossed, TOLERANCE));

            // Assert
            expect(intersections).toHaveLength(1);
            expect(intersections[0]!.point0[0]).toBeCloseTo(0, 3);
            expect(intersections[0]!.point0[1]).toBeCloseTo(0, 3);
        });

        it("should find nothing between two lines that do not meet", () => {
            // Arrange
            const parallel = curveService.createCurveByPoints(new Inputs.Verb.CurvePathDataDto(1, [[-5, 3, 0], [5, 3, 0]]));

            // Act
            const intersections = intersect.curves(new Inputs.Verb.CurveCurveDto(crossing, parallel, TOLERANCE));

            // Assert
            expect(intersections).toEqual([]);
        });
    });

    describe("curveAndSurface", () => {
        it("should find where a line crosses a plane", () => {
            // Arrange
            const surface = surfaceService.createSurfaceByCorners(new Inputs.Verb.CornersDto([-5, -1, -5], [5, -1, -5], [5, -1, 5], [-5, -1, 5]));
            const downward = curveService.createCurveByPoints(new Inputs.Verb.CurvePathDataDto(1, [[0, 5, 0], [0, -5, 0]]));

            // Act
            const intersections = intersect.curveAndSurface(new Inputs.Verb.CurveSurfaceDto(downward, surface, TOLERANCE));

            // Assert
            expect(intersections).toHaveLength(1);
            expect(intersections[0]!.curvePoint[1]).toBeCloseTo(-1, 3);
        });
    });

    describe("surfaces", () => {
        it("should find the curve along which two planes meet", () => {
            // Arrange
            const flat = surfaceService.createSurfaceByCorners(new Inputs.Verb.CornersDto([-5, 0, -5], [5, 0, -5], [5, 0, 5], [-5, 0, 5]));
            const upright = surfaceService.createSurfaceByCorners(new Inputs.Verb.CornersDto([-5, -5, 0], [5, -5, 0], [5, 5, 0], [-5, 5, 0]));

            // Act
            const curves = intersect.surfaces(new Inputs.Verb.SurfaceSurfaceDto(flat, upright, TOLERANCE));

            // Assert
            expect(curves).toHaveLength(1);
        });
    });

    describe("readers of a curve to curve intersection", () => {
        let intersections: BaseTypes.CurveCurveIntersection[];

        beforeAll(() => {
            intersections = intersect.curves(new Inputs.Verb.CurveCurveDto(crossing, crossed, TOLERANCE));
        });

        it("should give the parameter on the first curve", () => {
            // Act
            const params = intersect.curveCurveFirstParams(new Inputs.Verb.CurveCurveIntersectionsDto(intersections));

            // Assert
            expect(params).toHaveLength(1);
            expect(params[0]).toBeCloseTo(0.5, 3);
        });

        it("should give the parameter on the second curve", () => {
            // Act
            const params = intersect.curveCurveSecondParams(new Inputs.Verb.CurveCurveIntersectionsDto(intersections));

            // Assert
            expect(params[0]).toBeCloseTo(0.5, 3);
        });

        it("should give the point on the first curve", () => {
            // Act
            const points = intersect.curveCurveFirstPoints(new Inputs.Verb.CurveCurveIntersectionsDto(intersections));

            // Assert
            expect(points[0]![0]).toBeCloseTo(0, 3);
        });

        it("should give the point on the second curve", () => {
            // Act
            const points = intersect.curveCurveSecondPoints(new Inputs.Verb.CurveCurveIntersectionsDto(intersections));

            // Assert
            expect(points[0]![1]).toBeCloseTo(0, 3);
        });

        it("should drop a result that falls beyond the end of the first curve", () => {
            // Act
            const params = intersect.curveCurveFirstParams(new Inputs.Verb.CurveCurveIntersectionsDto([OFF_CURVE]));

            // Assert
            expect(params).toEqual([]);
        });

        it("should drop a result that falls beyond the end of the second curve", () => {
            // Act
            const points = intersect.curveCurveSecondPoints(new Inputs.Verb.CurveCurveIntersectionsDto([OFF_CURVE]));

            // Assert
            expect(points).toEqual([]);
        });
    });

    describe("readers of a curve to surface intersection", () => {
        let intersections: BaseTypes.CurveSurfaceIntersection[];

        beforeAll(() => {
            const surface = surfaceService.createSurfaceByCorners(new Inputs.Verb.CornersDto([-5, -1, -5], [5, -1, -5], [5, -1, 5], [-5, -1, 5]));
            const downward = curveService.createCurveByPoints(new Inputs.Verb.CurvePathDataDto(1, [[0, 5, 0], [0, -5, 0]]));
            intersections = intersect.curveAndSurface(new Inputs.Verb.CurveSurfaceDto(downward, surface, TOLERANCE));
        });

        it("should give the parameter on the curve", () => {
            // Act
            const params = intersect.curveSurfaceCurveParams(new Inputs.Verb.CurveSurfaceIntersectionsDto(intersections));

            // Assert
            expect(params[0]).toBeCloseTo(0.6, 3);
        });

        it("should give the parameters on the surface", () => {
            // Act
            const params = intersect.curveSurfaceSurfaceParams(new Inputs.Verb.CurveSurfaceIntersectionsDto(intersections));

            // Assert
            expect(params).toHaveLength(1);
        });

        it("should give the point on the curve", () => {
            // Act
            const points = intersect.curveSurfaceCurvePoints(new Inputs.Verb.CurveSurfaceIntersectionsDto(intersections));

            // Assert
            expect(points[0]![1]).toBeCloseTo(-1, 3);
        });

        it("should give the point on the surface", () => {
            // Act
            const points = intersect.curveSurfaceSurfacePoints(new Inputs.Verb.CurveSurfaceIntersectionsDto(intersections));

            // Assert
            expect(points[0]![1]).toBeCloseTo(-1, 3);
        });

        it("should drop a result that falls beyond the end of the curve", () => {
            // Arrange
            const offCurve: BaseTypes.CurveSurfaceIntersection = {
                u: 1.5,
                uv: { u: 0, v: 0 },
                curvePoint: [99, 0, 0],
                surfacePoint: [99, 0, 0],
            };

            // Act
            const params = intersect.curveSurfaceCurveParams(new Inputs.Verb.CurveSurfaceIntersectionsDto([offCurve]));

            // Assert
            expect(params).toEqual([]);
        });
    });
});
