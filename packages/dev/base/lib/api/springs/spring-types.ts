import type * as Inputs from "../inputs";

/**
 * A compression spring with closed and ground ends, every value given: the shape
 * `compressionSpringPath` reads.
 */
export interface CompressionSpringSpec {
    /** The diameter of the wire. */
    readonly wireDiameter: number;
    /** The outside diameter of the coils. */
    readonly diameter: number;
    /** How many coils spring, besides the closed coil at each end. */
    readonly activeCoils: number;
    /** The spring's length as it stands, from one ground end to the other. */
    readonly length: number;
}

/**
 * The centreline a compression spring's wire follows, from `compressionSpringPath`.
 */
export interface CompressionSpringPath {
    /** Points along the centreline, from below the bottom end to above the top, to interpolate through. */
    readonly points: Inputs.Base.Point3[];
    /** The rise of one active coil. */
    readonly pitch: number;
    /** The length the spring has when every coil closes onto the next. */
    readonly solidLength: number;
}
