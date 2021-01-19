import { simplifyDeclaration } from './simplify-declaration';

export const surfaceString = simplifyDeclaration(`
import { Mesh } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
import { BaseTypes } from './base-types';
import { SurfaceConical } from './surface-conical';
import { SurfaceCylindrical } from './surface-cylindrical';
import { SurfaceExtrusion } from './surface-extrusion';
import { SurfaceRevolved } from './surface-revolved';
import { SurfaceSpherical } from './surface-spherical';
import { SurfaceSweep } from './surface-sweep';
/**
 * Contains various functions for Nurbs surfaces.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
export declare class Surface {
    readonly cone: SurfaceConical;
    readonly cylinder: SurfaceCylindrical;
    readonly extrusion: SurfaceExtrusion;
    readonly sphere: SurfaceSpherical;
    readonly revolved: SurfaceRevolved;
    readonly sweep: SurfaceSweep;
    private readonly context;
    private readonly geometryHelper;
    constructor(cone: SurfaceConical, cylinder: SurfaceCylindrical, extrusion: SurfaceExtrusion, sphere: SurfaceSpherical, revolved: SurfaceRevolved, sweep: SurfaceSweep, context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/drawSurface.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#drawsurface
     * @param inputs Contains a surface and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurface(inputs: Inputs.Surface.DrawSurfaceDto): Mesh;
    /**
     * Draws multiple surfaces
     * <div>
     *  <img src="../assets/images/blockly-images/surface/drawSurfaces.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#drawsurfaces
     * @param inputs Contains the Nurbs surfaces and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurfaces(inputs: Inputs.Surface.DrawSurfacesDto): Mesh;
    /**
     * Draws multiple surfaces with multiple colours. Number of colours has to be equal to number of surfaces
     * <div>
     *  <img src="../assets/images/blockly-images/surface/drawSurfacesMultiColour.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#drawsurfacesmulticolour
     * @param inputs Contains the Nurbs surfaces, colours and other information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurfacesMultiColour(inputs: Inputs.Surface.DrawSurfacesColoursDto): Mesh;
    /**
     * Gets the boundary edge Nurbs curves of the surface in a list
     * <div>
     *  <img src="../assets/images/blockly-images/surface/boundaries.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#boundaries
     * @param inputs Nurbs surface
     * @returns Array of curves
     */
    boundaries(inputs: Inputs.Surface.SurfaceDto): any[];
    /**
     * Creates the surface by providing 4 points as corners
     * <div>
     *  <img src="../assets/images/blockly-images/surface/createSurfaceByCorners.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#createsurfacebycorners
     * @param inputs 4 points
     * @returns Nurbs surface
     */
    createSurfaceByCorners(inputs: Inputs.Surface.CornersDto): any;
    /**
     * Creates the Nurbs surface by providing uv knots, uv degrees, points and weights
     * <div>
     *  <img src="../assets/images/blockly-images/surface/createSurfaceByKnotsControlPointsWeights.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#createsurfacebyknotscontrolpointsweights
     * @param inputs Surface creation information
     * @returns Nurbs surface
     */
    createSurfaceByKnotsControlPointsWeights(inputs: Inputs.Surface.KnotsControlPointsWeightsDto): any;
    /**
     * Creates the Nurbs surface by lofting curves
     * <div>
     *  <img src="../assets/images/blockly-images/surface/createSurfaceByLoftingCurves.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#createsurfacebyloftingcurves
     * @param inputs Curves to loft through
     * @returns Nurbs surface
     */
    createSurfaceByLoftingCurves(inputs: Inputs.Surface.LoftCurvesDto): any;
    /**
     * Clone the Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/clone.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#clone
     * @param inputs Nurbs surface
     * @returns Nurbs surface
     */
    clone(inputs: Inputs.Surface.SurfaceDto): any;
    /**
     * Finds the closest parameter on the surface from the point
     * <div>
     *  <img src="../assets/images/blockly-images/surface/closestParam.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#closestparam
     * @param inputs Nurbs surface with a point
     * @returns UV parameters
     */
    closestParam(inputs: Inputs.Surface.SurfaceParamDto): BaseTypes.UVDto;
    /**
     * Finds the closest point on the surface from the point
     * <div>
     *  <img src="../assets/images/blockly-images/surface/closestPoint.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#closestpoint
     * @param inputs Nurbs surface with a point
     * @returns Point
     */
    closestPoint(inputs: Inputs.Surface.SurfaceParamDto): number[];
    /**
     * Gets the control points on the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/controlPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#controlpoints
     * @param inputs Nurbs surface
     * @returns Two dimensional array of points
     */
    controlPoints(inputs: Inputs.Surface.SurfaceDto): number[][][];
    /**
     * Gets the U degree of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/degreeU.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#degreeu
     * @param inputs Nurbs surface
     * @returns U degree
     */
    degreeU(inputs: Inputs.Surface.SurfaceDto): number;
    /**
     * Gets the V degree of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/degreeV.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#degreev
     * @param inputs Nurbs surface
     * @returns V degree
     */
    degreeV(inputs: Inputs.Surface.SurfaceDto): number;
    /**
     * Gets the derivatives of the surface at specified uv coordinate
     * <div>
     *  <img src="../assets/images/blockly-images/surface/derivatives.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#derivatives
     * @param inputs Nurbs surface
     * @returns Two dimensional array of vectors
     */
    derivatives(inputs: Inputs.Surface.DerivativesDto): number[][][];
    /**
     * Gets the U domain of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/domainU.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#domainu
     * @param inputs Nurbs surface
     * @returns U domain as interval
     */
    domainU(inputs: Inputs.Surface.SurfaceDto): BaseTypes.IntervalDto;
    /**
     * Gets the V domain of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/domainV.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#domainv
     * @param inputs Nurbs surface
     * @returns V domain as interval
     */
    domainV(inputs: Inputs.Surface.SurfaceDto): BaseTypes.IntervalDto;
    /**
     * Gets the Nurbs isocurve on the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/isocurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#isocurve
     * @param inputs Nurbs surface
     * @returns Nurbs curve
     */
    isocurve(inputs: Inputs.Surface.SurfaceParameterDto): any;
    /**
     * Subdivides surface into preferred number of isocurves
     * <div>
     *  <img src="../assets/images/blockly-images/surface/isocurveSubdivision.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#isocurvesubdivision
     * @param inputs Nurbs surface
     * @returns Nurbs curves
     */
    isocurvesSubdivision(inputs: Inputs.Surface.IsocurveSubdivisionDto): any[];
    /**
     * Subdivides surface into isocurves on specified array of parameters
     * <div>
     *  <img src="../assets/images/blockly-images/surface/isocurvesAtParams.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#isocurvesatparams
     * @param inputs Nurbs surface
     * @returns Nurbs curves
     */
    isocurvesAtParams(inputs: Inputs.Surface.IsocurvesParametersDto): any[];
    /**
     * Gets the U knots of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/knotsU.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#knotsu
     * @param inputs Nurbs surface
     * @returns Knots on u direction
     */
    knotsU(inputs: Inputs.Surface.SurfaceDto): number[];
    /**
     * Gets the V knots of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/knotsV.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#knotsv
     * @param inputs Nurbs surface
     * @returns Knots on v direction
     */
    knotsV(inputs: Inputs.Surface.SurfaceDto): number[];
    /**
     * Gets the normal on the surface at uv coordinate
     * <div>
     *  <img src="../assets/images/blockly-images/surface/normal.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#normal
     * @param inputs Nurbs surface
     * @returns Normal vector
     */
    normal(inputs: Inputs.Surface.SurfaceLocationDto): number[];
    /**
     * Gets the point on the surface at uv coordinate
     * <div>
     *  <img src="../assets/images/blockly-images/surface/point.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#point
     * @param inputs Nurbs surface
     * @returns Point
     */
    point(inputs: Inputs.Surface.SurfaceLocationDto): number[];
    /**
     * Reverse the Nurbs surface. This will reverse the UV origin and isocurve directions
     * <div>
     *  <img src="../assets/images/blockly-images/surface/reverse.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#reverse
     * @param inputs Nurbs surface
     * @returns Nurbs surface
     */
    reverse(inputs: Inputs.Surface.SurfaceDto): any;
    /**
     * Splits the Nurbs surface in two halfs.
     * <div>
     *  <img src="../assets/images/blockly-images/surface/split.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#split
     * @param inputs Nurbs surface
     * @returns Two Nurbs surfaces
     */
    split(inputs: Inputs.Surface.SurfaceParameterDto): any[];
    /**
     * Transforms the Nurbs surface with a given list of transformations.
     * <div>
     *  <img src="../assets/images/blockly-images/surface/transformSurface.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#transformsurface
     * @param inputs Nurbs surface with transforms
     * @returns Nurbs surface
     */
    transformSurface(inputs: Inputs.Surface.SurfaceTransformDto): any;
    /**
     * Gets the weights of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/weights.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface.surface.html#weights
     * @param inputs Nurbs surface
     * @returns Two dimensional array of weights
     */
    weights(inputs: Inputs.Surface.SurfaceDto): number[][];
    private createOrUpdateSurfaceMesh;
    private parseFaces;
}

`);
