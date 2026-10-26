import type * as Inputs from "../inputs";

/**
 * An involute spline, from `splines.din.involuteSplineSizes` or `splines.ansi.involuteSplineSizes`:
 * its teeth and the diameters of the shaft and the hub, in the unit asked for.
 */
export interface InvoluteSplineSizes {
    /** The diameter the spline is named by: DIN 5480's reference diameter, or ANSI B92.1's pitch diameter. */
    readonly referenceDiameter: number;
    /** The size of the teeth: the pitch circle's diameter divided by the number of teeth. */
    readonly module: number;
    /** How many teeth it has. */
    readonly teeth: number;
    /** The pressure angle, in degrees. */
    readonly pressureAngle: number;
    /** The shaft's profile shift, as a share of the module; the hub's is its negative. */
    readonly profileShift: number;
    /** The radius that rounds the bottom of the shaft's gaps, as a share of the module. */
    readonly rootFillet: number;
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
 * The diametral pitch of an ANSI B92.1 involute spline as the standard writes it, the pitch over the
 * stub pitch, such as 16/32.
 */
export type AnsiSplinePitch = `${Inputs.Engineering.ansiSplinePitchEnum}`;
