import type * as Inputs from "../inputs";

/**
 * A DIN 5480 involute spline by its reference diameter and module, from `involuteSplineSizes`.
 */
export interface InvoluteSplineSizes {
    /** The reference diameter the spline is named by, such as 25 in W 25x1.25x18. */
    readonly referenceDiameter: number;
    /** The module of its teeth. */
    readonly module: number;
    /** How many teeth it has. */
    readonly teeth: number;
    /** The pressure angle, 30 degrees. */
    readonly pressureAngle: number;
    /** The shaft's profile shift, as a share of the module; the hub's is its negative. */
    readonly profileShift: number;
    /** The shaft's tip diameter. */
    readonly shaftTipDiameter: number;
    /** The shaft's root diameter. */
    readonly shaftRootDiameter: number;
    /** The hub's tip diameter, the smallest across its teeth. */
    readonly hubTipDiameter: number;
    /** The hub's root diameter, the largest across its gaps. */
    readonly hubRootDiameter: number;
}

/**
 * The pattern of a knurl after DIN 82: straight grooves along the axis, helical grooves turning
 * left or right, or both crossing in a diamond.
 */
export type KnurlPattern = `${Inputs.Engineering.knurlPatternEnum}`;

/**
 * A knurl's grooves on a cylinder, from `knurlSizes`.
 */
export interface KnurlSizes {
    /** How many grooves run round the cylinder, in each direction a diamond has. */
    readonly grooves: number;
    /** The diameter the pitch divides evenly, nearest the one asked for. */
    readonly diameter: number;
    /** How deep the grooves are, half the pitch for their 90 degree profile. */
    readonly depth: number;
    /** The grooves' angle to the axis, in degrees: 0 for straight, 30 for the others. */
    readonly helixAngle: number;
}
