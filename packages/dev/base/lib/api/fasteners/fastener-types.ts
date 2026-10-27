import type * as Inputs from "../inputs";

/**
 * How closely a clearance hole fits its screw: `close` (fine), `normal` (medium) or `loose`
 * (coarse), as ISO 273 and ASME B18.2.8 grade it.
 */
export type ClearanceFit = `${Inputs.Engineering.clearanceFitEnum}`;

/**
 * The sizes of a socket head cap screw's head, from `fasteners.iso.socketHeadCapScrewSizes` or
 * `fasteners.ansi.socketHeadCapScrewSizes`, in the unit asked for.
 */
export interface SocketHeadCapScrewSizes {
    /** The diameter of the round head. */
    readonly headDiameter: number;
    /** The height of the head. */
    readonly headHeight: number;
    /** The width across the flats of the hexagon socket, the key that turns it. */
    readonly socketSize: number;
    /** How deep the socket goes. */
    readonly socketDepth: number;
    /** The length of thread on a screw too long to be threaded to the head. */
    readonly threadLength: number;
    /** The diameter of the counterbore that sinks the head. */
    readonly counterboreDiameter: number;
    /** The depth of that counterbore, so the head sits just below the face. */
    readonly counterboreDepth: number;
}

/**
 * The sizes of a hexagon head bolt's head, from `fasteners.iso.hexBoltSizes` or
 * `fasteners.ansi.hexBoltSizes`, in the unit asked for.
 */
export interface HexBoltSizes {
    /** The width across the flats of the head. */
    readonly acrossFlats: number;
    /** The height of the head. */
    readonly headHeight: number;
    /** The length of thread on a bolt threaded only part of its length. */
    readonly threadLength: number;
}

/**
 * The sizes of a hexagon nut, from `fasteners.iso.hexNutSizes` or `fasteners.ansi.hexNutSizes`, in
 * the unit asked for.
 */
export interface HexNutSizes {
    /** The width across the flats. */
    readonly acrossFlats: number;
    /** The height of the nut. */
    readonly height: number;
}

/**
 * The sizes of a plain washer, from `fasteners.iso.washerSizes` or `fasteners.ansi.washerSizes`, in
 * the unit asked for.
 */
export interface WasherSizes {
    /** The diameter of the hole. */
    readonly innerDiameter: number;
    /** The outside diameter. */
    readonly outerDiameter: number;
    /** How thick the washer is. */
    readonly thickness: number;
}

/**
 * The point of an ISO hexagon socket set screw: flat (ISO 4026), cone (ISO 4027), dog (ISO 4028) or
 * cup (ISO 4029).
 */
export type IsoSetScrewPoint = `${Inputs.Engineering.isoSetScrewPointEnum}`;

/**
 * A hexagon socket set screw, from `fasteners.iso.setScrewSizes` or `fasteners.ansi.setScrewSizes`,
 * in the unit asked for.
 */
export interface SetScrewSizes {
    /** The hexagon socket's width across flats. */
    readonly socketSize: number;
    /** How deep the socket is at least, which the standard may set lower for a short screw. */
    readonly socketDepth: number;
    /** The diameter of the point: the flat or the dog, the cup's rim, or the cone's tip. */
    readonly pointDiameter: number;
    /**
     * How long the point is along the axis below the thread's root: the chamfer down to a flat, the
     * cone, the dog's cylinder after its chamfer, or the depth of the cup.
     */
    readonly pointLength: number;
    /** The included angle of the point's chamfer or cone, in degrees; 0 for an oval point. */
    readonly pointAngle: number;
    /** The radius of an oval point's dome; 0 for every other point. */
    readonly pointRadius: number;
    /** Where short screws end: ISO counts a screw this long as short, ASME B18.3 only a shorter one. A short screw has a shallower socket, and under ISO a blunter cone. */
    readonly shortUpTo: number;
}

/**
 * A plain washer chamfered on the outside of one face, from `fasteners.iso.chamferedWasherSizes`,
 * in the unit asked for.
 */
export interface ChamferedWasherSizes extends WasherSizes {
    /** How far the chamfer reaches down the outside, along the axis. */
    readonly chamferHeight: number;
    /** How far the chamfer reaches in from the outside, across the face. */
    readonly chamferWidth: number;
}

export interface ScrewHeadRow {
    readonly headDiameter: number;
    readonly headHeight: number;
    readonly socketSize: number;
    readonly socketDepth: number;
    readonly counterboreDiameter: number;
}

export interface HexRow {
    readonly acrossFlats: number;
    readonly height: number;
}

export interface ClearanceRow {
    readonly close: number;
    readonly normal: number;
    readonly loose: number;
}

export interface SetScrewPointRow {
    readonly diameter: number;
    readonly shortUpTo: number;
}

export interface DogPointRow extends SetScrewPointRow {
    readonly lengthShort: number;
    readonly lengthLong: number;
}

export interface IsoSetScrewRow {
    readonly key: number;
    readonly depthShort: number;
    readonly depthLong: number;
    readonly flat: SetScrewPointRow;
    readonly cone: SetScrewPointRow;
    readonly dog: DogPointRow;
    readonly cup: SetScrewPointRow;
}

/**
 * The point of an ASME B18.3 hexagon socket set screw: cup, flat, cone, oval or half dog.
 */
export type AnsiSetScrewPoint = `${Inputs.Engineering.ansiSetScrewPointEnum}`;

/**
 * The series of an ASME B18.22.1 type A plain washer: narrow, the former SAE sizes, or wide, the
 * former standard plate sizes.
 */
export type AnsiWasherSeries = `${Inputs.Engineering.ansiWasherSeriesEnum}`;

export interface AnsiScrewHeadRow extends ScrewHeadRow {
    readonly threadLength: number;
    readonly counterboreDepth: number;
}

export interface AnsiWasherRow {
    readonly narrow: WasherSizes;
    readonly wide: WasherSizes;
}

export interface AnsiSetScrewRow {
    readonly key: number;
    readonly depthShort: number;
    readonly depthLong: number;
    readonly cupAndFlatShortUpTo: number;
    readonly coneAndOvalShortUpTo: number;
    readonly halfDogShortUpTo: number;
    readonly pointDiameter: number;
    readonly coneSteepFrom: number;
    readonly ovalRadius: number;
    readonly halfDogDiameter: number;
    readonly halfDogLength: number;
}
