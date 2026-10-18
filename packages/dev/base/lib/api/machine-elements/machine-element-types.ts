import type * as Inputs from "../inputs";

/**
 * A deep groove ball bearing's designation, from the 60 and 62 series and the small 62x and 60x
 * sizes: the bore in millimetres is in its last digits, five times them from 04 up.
 */
export type BallBearingDesignation = `${Inputs.Engineering.ballBearingEnum}`;

/**
 * The boundary sizes of a deep groove ball bearing, in millimetres, from `ballBearingSizes`.
 */
export interface BallBearingSizes {
    /** The diameter of the bore, the shaft it sits on. */
    readonly bore: number;
    /** The outside diameter, the housing it sits in. */
    readonly outside: number;
    /** The width along the axis. */
    readonly width: number;
}

/**
 * The sizes of a DIN 6885 form A parallel key and the keyways for it, in millimetres, from
 * `parallelKeySizes`.
 */
export interface ParallelKeySizes {
    /** The width of the key. */
    readonly width: number;
    /** The height of the key. */
    readonly height: number;
    /** How deep the keyway goes into the shaft. */
    readonly shaftDepth: number;
    /** How deep the keyway goes into the hub, from the shaft's surface. */
    readonly hubDepth: number;
}

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

export interface KeyRow extends ParallelKeySizes {
    readonly upTo: number;
}

/**
 * Where a DIN retaining ring sits: on a shaft (DIN 471, sprung open over it into a groove) or in a
 * bore (DIN 472, squeezed into a groove inside it).
 */
export type RetainingRingKind = `${Inputs.Engineering.retainingRingKindEnum}`;

/**
 * A DIN 471 or DIN 472 retaining ring and its groove, from `retainingRingSizes`.
 */
export interface RetainingRingSizes {
    /** The shaft's or the bore's diameter the ring is for. */
    readonly nominal: number;
    /** The ring's thickness. */
    readonly thickness: number;
    /** The ring's diameter before it is fitted: its inside on a shaft ring, its outside on a bore ring. */
    readonly freeDiameter: number;
    /** How far its lugs reach across the ring, at most. */
    readonly lugWidth: number;
    /** About how wide the ring is opposite its lugs. */
    readonly sectionWidth: number;
    /** The diameter of the hole in each lug for the pliers, at least. */
    readonly lugHoleDiameter: number;
    /** The diameter at the bottom of the groove the ring sits in. */
    readonly grooveDiameter: number;
    /** How wide the groove is. */
    readonly grooveWidth: number;
    /** How far the groove keeps, at least, from the end of the shaft or the bore. */
    readonly edgeDistance: number;
}
