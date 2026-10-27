import type * as Inputs from "../inputs";

/**
 * The pattern of a knurl: straight grooves along the axis, helical grooves turning left or right,
 * or both crossing in a diamond.
 */
export type KnurlPattern = `${Inputs.Engineering.knurlPatternEnum}`;

/**
 * A knurl's grooves on a cylinder, from `knurls.din.knurlSizes` or `knurls.ansi.knurlSizes`, in the
 * unit asked for.
 */
export interface KnurlSizes {
    /** How many grooves run round the cylinder, in each direction a diamond has. */
    readonly grooves: number;
    /** The diameter the grooves divide evenly, nearest the one asked for. */
    readonly diameter: number;
    /** How deep the grooves are. */
    readonly depth: number;
    /** The grooves' angle to the axis, in degrees: 0 for straight, 30 for the others. */
    readonly helixAngle: number;
}

export interface AnsiKnurlRow {
    readonly depth: number;
    readonly leastTeeth: number;
}
