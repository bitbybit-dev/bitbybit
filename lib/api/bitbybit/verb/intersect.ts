
import { Context } from "../../context";
import { GeometryHelper } from "../../geometry-helper";
import * as Inputs from "../../inputs/inputs";
import { BaseTypes } from "../base-types";

/**
 * Functions that allow to intersect various geometric entities and get the results
 */

export class VerbIntersect {

    constructor(private readonly context: Context, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Intersects two verb Nurbs curves together and returns intersection results
     * @param inputs Two Nurbs curves
     * @returns Intersection results
     */
    curves(inputs: Inputs.Verb.CurveCurveDto): BaseTypes.CurveCurveIntersection[] {
        return this.context.verb.geom.Intersect.curves(inputs.firstCurve, inputs.secondCurve, inputs.tolerance);
    }

    /**
     * Intersects curve and surface
     * @param inputs Nurbs curve and a Nurbs surface
     * @returns Intersection results
     */
    curveAndSurface(inputs: Inputs.Verb.CurveSurfaceDto): BaseTypes.CurveSurfaceIntersection[] {
        return this.context.verb.geom.Intersect.curveAndSurface(inputs.curve, inputs.surface, inputs.tolerance);
    }

    /**
     * Intersects two surfaces
     * @param inputs Nurbs curve and a Nurbs surface
     * @returns Nurbs curves along the intersection
     */
    surfaces(inputs: Inputs.Verb.SurfaceSurfaceDto): any[] {
        return this.context.verb.geom.Intersect.surfaces(inputs.firstSurface, inputs.secondSurface);
    }

    /**
     * Gets intersection parameters on the first curve from curve-curve intersection
     * @param inputs Intersections data
     * @returns Parameters on first curve
     */
    curveCurveFirstParams(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[] {
        return inputs.intersections.filter(s => s.u0 >= 0 && s.u0 <= 1).map(i => i.u0);
    }

    /**
     * Gets intersection parameters on the second curve from curve-curve intersection
     * @param inputs Intersections data
     * @returns Parameters on second curve
     */
    curveCurveSecondParams(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[] {
        return inputs.intersections.filter(s => s.u1 >= 0 && s.u1 <= 1).map(i => i.u1);
    }

    /**
     * Gets intersection points on the first curve from curve-curve intersection
     * @param inputs Intersections data
     * @returns Points on first curve
     */
    curveCurveFirstPoints(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[][] {
        return inputs.intersections.filter(s => s.u0 >= 0 && s.u0 <= 1).map(i => i.point0);
    }

    /**
     * Gets intersection points on the second curve from curve-curve intersection
     * @param inputs Intersections data
     * @returns Points on second curve
     */
    curveCurveSecondPoints(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[][] {
        return inputs.intersections.filter(s => s.u1 >= 0 && s.u1 <= 1).map(i => i.point1);
    }

    /**
     * Gets intersection parameters on the curve from curve-surface intersection
     * @param inputs Intersections data
     * @returns Parameters on the curve
     */
    curveSurfaceCurveParams(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): number[] {
        return inputs.intersections.filter(s => s.u >= 0 && s.u <= 1).map(i => i.u);
    }

    /**
     * Gets intersection parameters on the surface from curve-surface intersection
     * @param inputs Intersections data
     * @returns Parameters on the surface
     */
    curveSurfaceSurfaceParams(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): BaseTypes.UVDto[] {
        return inputs.intersections.map(i => i.uv);
    }

    /**
     * Gets intersection points on the curve from curve-surface intersection
     * @param inputs Intersections data
     * @returns Points on the curve
     */
    curveSurfaceCurvePoints(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): number[][] {
        return inputs.intersections.filter(s => s.u >= 0 && s.u <= 1).map(i => i.curvePoint);
    }

    /**
     * Gets intersection points on the surface from curve-surface intersection
     * @param inputs Intersections data
     * @returns Points on the surface
     */
    curveSurfaceSurfacePoints(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): number[][] {
        return inputs.intersections.map(i => i.surfacePoint);
    }
}
