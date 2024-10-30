import { ContextBase } from "../../context";
import { GeometryHelper } from "../../geometry-helper";
import * as Inputs from "../../inputs/inputs";
import { BaseTypes } from "../base-types";
import { VerbSurfaceConical } from "./surface-conical";
import { VerbSurfaceCylindrical } from "./surface-cylindrical";
import { VerbSurfaceExtrusion } from "./surface-extrusion";
import { VerbSurfaceRevolved } from "./surface-revolved";
import { VerbSurfaceSpherical } from "./surface-spherical";
import { VerbSurfaceSweep } from "./surface-sweep";

/**
 * Contains various functions for Nurbs surfaces.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */

export class VerbSurface {

    public readonly cone: VerbSurfaceConical;
    public readonly cylinder: VerbSurfaceCylindrical;
    public readonly extrusion: VerbSurfaceExtrusion;
    public readonly sphere: VerbSurfaceSpherical;
    public readonly revolved: VerbSurfaceRevolved;
    public readonly sweep: VerbSurfaceSweep;
    constructor(
        private readonly context: ContextBase,
        private readonly geometryHelper: GeometryHelper
    ) {
        this.cone = new VerbSurfaceConical(context);
        this.cylinder = new VerbSurfaceCylindrical(context);
        this.extrusion = new VerbSurfaceExtrusion(context);
        this.sphere = new VerbSurfaceSpherical(context);
        this.revolved = new VerbSurfaceRevolved(context);
        this.sweep = new VerbSurfaceSweep(context);
    }

    /**
     * Gets the boundary edge Nurbs curves of the surface in a list
     * @param inputs Nurbs surface
     * @returns Array of curves
     */
    boundaries(inputs: Inputs.Verb.SurfaceDto): any[] {
        return inputs.surface.boundaries();
    }

    /**
     * Creates the surface by providing 4 points as corners
     * @param inputs 4 points
     * @returns Nurbs surface
     */
    createSurfaceByCorners(inputs: Inputs.Verb.CornersDto): any {
        return this.context.verb.geom.NurbsSurface.byCorners(inputs.point1, inputs.point2, inputs.point3, inputs.point4);
    }

    /**
     * Creates the Nurbs surface by providing uv knots, uv degrees, points and weights
     * @param inputs Surface creation information
     * @returns Nurbs surface
     */
    createSurfaceByKnotsControlPointsWeights(inputs: Inputs.Verb.KnotsControlPointsWeightsDto): any {
        return this.context.verb.geom.NurbsSurface.byKnotsControlPointsWeights(
            inputs.degreeU,
            inputs.degreeV,
            inputs.knotsU,
            inputs.knotsV,
            inputs.points,
            inputs.weights
        );
    }

    /**
     * Creates the Nurbs surface by lofting curves
     * @param inputs Curves to loft through
     * @returns Nurbs surface
     */
    createSurfaceByLoftingCurves(inputs: Inputs.Verb.LoftCurvesDto): any {
        return this.context.verb.geom.NurbsSurface.byLoftingCurves(inputs.curves, inputs.degreeV);
    }

    /**
     * Clone the Nurbs surface
     * @param inputs Nurbs surface
     * @returns Nurbs surface
     */
    clone(inputs: Inputs.Verb.SurfaceDto): any {
        return inputs.surface.clone();
    }

    /**
     * Finds the closest parameter on the surface from the point
     * @param inputs Nurbs surface with a point
     * @returns UV parameters
     */
    closestParam(inputs: Inputs.Verb.SurfaceParamDto): BaseTypes.UVDto {
        return inputs.surface.closestParam(inputs.point);
    }

    /**
     * Finds the closest point on the surface from the point
     * @param inputs Nurbs surface with a point
     * @returns Point
     */
    closestPoint(inputs: Inputs.Verb.SurfaceParamDto): number[] {
        return inputs.surface.closestPoint(inputs.point);
    }

    /**
     * Gets the control points on the surface
     * @param inputs Nurbs surface
     * @returns Two dimensional array of points
     */
    controlPoints(inputs: Inputs.Verb.SurfaceDto): number[][][] {
        return inputs.surface.controlPoints();
    }

    /**
     * Gets the U degree of the surface
     * @param inputs Nurbs surface
     * @returns U degree
     */
    degreeU(inputs: Inputs.Verb.SurfaceDto): number {
        return inputs.surface.degreeU();
    }

    /**
     * Gets the V degree of the surface
     * @param inputs Nurbs surface
     * @returns V degree
     */
    degreeV(inputs: Inputs.Verb.SurfaceDto): number {
        return inputs.surface.degreeV();
    }

    /**
     * Gets the derivatives of the surface at specified uv coordinate
     * @param inputs Nurbs surface
     * @returns Two dimensional array of vectors
     */
    derivatives(inputs: Inputs.Verb.DerivativesDto): number[][][] {
        return inputs.surface.derivatives(inputs.u, inputs.v, inputs.numDerivatives);
    }

    /**
     * Gets the U domain of the surface
     * @param inputs Nurbs surface
     * @returns U domain as interval
     */
    domainU(inputs: Inputs.Verb.SurfaceDto): BaseTypes.IntervalDto {
        return inputs.surface.domainU();
    }

    /**
     * Gets the V domain of the surface
     * @param inputs Nurbs surface
     * @returns V domain as interval
     */
    domainV(inputs: Inputs.Verb.SurfaceDto): BaseTypes.IntervalDto {
        return inputs.surface.domainV();
    }

    /**
     * Gets the Nurbs isocurve on the surface
     * @param inputs Nurbs surface
     * @returns Nurbs curve
     */
    isocurve(inputs: Inputs.Verb.SurfaceParameterDto): any {
        return inputs.surface.isocurve(inputs.parameter, inputs.useV);
    }

    /**
     * Subdivides surface into preferred number of isocurves
     * @param inputs Nurbs surface
     * @returns Nurbs curves
     */
    isocurvesSubdivision(inputs: Inputs.Verb.IsocurveSubdivisionDto): any[] {
        const step = (0.999999 / inputs.isocurveSegments);
        const params = this.context.verb.core.Vec.span(0.0000001, 0.9999999, step);
        if (!inputs.includeLast) {
            params.pop();
        }
        if (!inputs.includeFirst) {
            params.shift();
        }
        return params.map(parameter => {
            return inputs.surface.isocurve(parameter, inputs.useV);
        });
    }

    /**
     * Subdivides surface into isocurves on specified array of parameters
     * @param inputs Nurbs surface
     * @returns Nurbs curves
     */
    isocurvesAtParams(inputs: Inputs.Verb.IsocurvesParametersDto): any[] {
        return inputs.parameters.map(parameter => {
            return inputs.surface.isocurve(parameter, inputs.useV);
        });
    }

    /**
     * Gets the U knots of the surface
     * @param inputs Nurbs surface
     * @returns Knots on u direction
     */
    knotsU(inputs: Inputs.Verb.SurfaceDto): number[] {
        return inputs.surface.knotsU();
    }

    /**
     * Gets the V knots of the surface
     * @param inputs Nurbs surface
     * @returns Knots on v direction
     */
    knotsV(inputs: Inputs.Verb.SurfaceDto): number[] {
        return inputs.surface.knotsV();
    }

    /**
     * Gets the normal on the surface at uv coordinate
     * @param inputs Nurbs surface
     * @returns Normal vector
     */
    normal(inputs: Inputs.Verb.SurfaceLocationDto): number[] {
        return inputs.surface.normal(inputs.u, inputs.v);
    }

    /**
     * Gets the point on the surface at uv coordinate
     * @param inputs Nurbs surface
     * @returns Point
     */
    point(inputs: Inputs.Verb.SurfaceLocationDto): number[] {
        return inputs.surface.point(inputs.u, inputs.v);
    }

    /**
     * Reverse the Nurbs surface. This will reverse the UV origin and isocurve directions
     * @param inputs Nurbs surface
     * @returns Nurbs surface
     */
    reverse(inputs: Inputs.Verb.SurfaceDto): any {
        return inputs.surface.reverse();
    }

    /**
     * Splits the Nurbs surface in two halfs.
     * @param inputs Nurbs surface
     * @returns Two Nurbs surfaces
     */
    split(inputs: Inputs.Verb.SurfaceParameterDto): any[] {
        return inputs.surface.split(inputs.parameter, inputs.useV);
    }

    /**
     * Transforms the Nurbs surface with a given list of transformations.
     * @param inputs Nurbs surface with transforms
     * @returns Nurbs surface
     */
    transformSurface(inputs: Inputs.Verb.SurfaceTransformDto): any {
        const points = inputs.surface.controlPoints();
        const transformation = inputs.transformation;
        const twoDimensionalPoints = [];
        points.forEach(ptCollection => {
            let transformedControlPoints = ptCollection;
            transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
            twoDimensionalPoints.push(transformedControlPoints);
        });
        return this.context.verb.geom.NurbsSurface.byKnotsControlPointsWeights(
            inputs.surface.degreeU(),
            inputs.surface.degreeV(),
            inputs.surface.knotsU(),
            inputs.surface.knotsV(),
            twoDimensionalPoints,
            inputs.surface.weights());
    }

    /**
     * Gets the weights of the surface
     * @param inputs Nurbs surface
     * @returns Two dimensional array of weights
     */
    weights(inputs: Inputs.Verb.SurfaceDto): number[][] {
        return inputs.surface.weights();
    }

}
