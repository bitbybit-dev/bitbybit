import { simplifyDeclaration } from './simplify-declaration';

export const intersectString = simplifyDeclaration(`
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
import { BaseTypes } from './base-types';
/**
 * Functions that allow to intersect various geometric entities and get the results
 */
export declare class Intersect {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Intersects two verb Nurbs curves together and returns intersection results
     * <div>
     *  <img src="../assets/images/blockly-images/intersect/curves.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_intersect_.intersect.html#curves
     * @param inputs Two Nurbs curves
     * @returns Intersection results
     */
    curves(inputs: Inputs.Intersect.CurveCurveDto): BaseTypes.CurveCurveIntersection[];
    /**
     * Intersects curve and surface
     * <div>
     *  <img src="../assets/images/blockly-images/intersect/curveAndSurface.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_intersect_.intersect.html#curveAndSurface
     * @param inputs Nurbs curve and a Nurbs surface
     * @returns Intersection results
     */
    curveAndSurface(inputs: Inputs.Intersect.CurveSurfaceDto): BaseTypes.CurveSurfaceIntersection[];
    /**
     * Intersects two surfaces
     * <div>
     *  <img src="../assets/images/blockly-images/intersect/surfaces.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_intersect_.intersect.html#surfaces
     * @param inputs Nurbs curve and a Nurbs surface
     * @returns Nurbs curves along the intersection
     */
    surfaces(inputs: Inputs.Intersect.SurfaceSurfaceDto): any[];
    /**
     * Gets intersection parameters on the first curve from curve-curve intersection
     * <div>
     *  <img src="../assets/images/blockly-images/intersect/curveCurveFirstParams.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_intersect_.intersect.html#curvecurvefirstparams
     * @param inputs Intersections data
     * @returns Parameters on first curve
     */
    curveCurveFirstParams(inputs: Inputs.Intersect.CurveCurveIntersectionsDto): number[];
    /**
     * Gets intersection parameters on the second curve from curve-curve intersection
     * <div>
     *  <img src="../assets/images/blockly-images/intersect/curveCurveSecondParams.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_intersect_.intersect.html#curvecurvesecondparams
     * @param inputs Intersections data
     * @returns Parameters on second curve
     */
    curveCurveSecondParams(inputs: Inputs.Intersect.CurveCurveIntersectionsDto): number[];
    /**
     * Gets intersection points on the first curve from curve-curve intersection
     * <div>
     *  <img src="../assets/images/blockly-images/intersect/curveCurveFirstPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_intersect_.intersect.html#curvecurvefirstpoints
     * @param inputs Intersections data
     * @returns Points on first curve
     */
    curveCurveFirstPoints(inputs: Inputs.Intersect.CurveCurveIntersectionsDto): number[][];
    /**
     * Gets intersection points on the second curve from curve-curve intersection
     * <div>
     *  <img src="../assets/images/blockly-images/intersect/curveCurveSecondPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_intersect_.intersect.html#curvecurvesecondpoints
     * @param inputs Intersections data
     * @returns Points on second curve
     */
    curveCurveSecondPoints(inputs: Inputs.Intersect.CurveCurveIntersectionsDto): number[][];
    /**
     * Gets intersection parameters on the curve from curve-surface intersection
     * <div>
     *  <img src="../assets/images/blockly-images/intersect/curveSurfaceCurveParams.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_intersect_.intersect.html#curvesurfacecurveparams
     * @param inputs Intersections data
     * @returns Parameters on the curve
     */
    curveSurfaceCurveParams(inputs: Inputs.Intersect.CurveSurfaceIntersectionsDto): number[];
    /**
     * Gets intersection parameters on the surface from curve-surface intersection
     * <div>
     *  <img src="../assets/images/blockly-images/intersect/curveSurfaceSurfaceParams.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_intersect_.intersect.html#curvesurfacesurfaceparams
     * @param inputs Intersections data
     * @returns Parameters on the surface
     */
    curveSurfaceSurfaceParams(inputs: Inputs.Intersect.CurveSurfaceIntersectionsDto): BaseTypes.UVDto[];
    /**
     * Gets intersection points on the curve from curve-surface intersection
     * <div>
     *  <img src="../assets/images/blockly-images/intersect/curveSurfaceCurvePoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_intersect_.intersect.html#curvesurfacecurvepoints
     * @param inputs Intersections data
     * @returns Points on the curve
     */
    curveSurfaceCurvePoints(inputs: Inputs.Intersect.CurveSurfaceIntersectionsDto): number[][];
    /**
     * Gets intersection points on the surface from curve-surface intersection
     * <div>
     *  <img src="../assets/images/blockly-images/intersect/curveSurfaceSurfacePoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_intersect_.intersect.html#curvesurfacesurfacepoints
     * @param inputs Intersections data
     * @returns Points on the surface
     */
    curveSurfaceSurfacePoints(inputs: Inputs.Intersect.CurveSurfaceIntersectionsDto): number[][];
}

`);
