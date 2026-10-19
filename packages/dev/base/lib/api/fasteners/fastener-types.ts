import type * as Inputs from "../inputs";

/**
 * An ISO metric thread size, from M1.6 to M24: the nominal diameter in millimetres after the M.
 */
export type MetricSize = `${Inputs.Engineering.metricSizeEnum}`;

/**
 * How closely a clearance hole fits its screw, after ISO 273: `close` (fine), `normal` (medium) or
 * `loose` (coarse).
 */
export type ClearanceFit = `${Inputs.Engineering.clearanceFitEnum}`;

/**
 * The sizes of an ISO metric thread, in millimetres, from `metricThread`.
 */
export interface MetricThread {
    /** The thread size, such as M8. */
    readonly size: MetricSize;
    /** The nominal, major diameter. */
    readonly diameter: number;
    /** The distance from one thread crest to the next. */
    readonly pitch: number;
    /** The diameter at which the thread's flanks are as wide as its grooves. */
    readonly pitchDiameter: number;
    /** The diameter at the roots of a bolt's thread. */
    readonly minorDiameter: number;
    /** The diameter at the crests of a nut's thread, the hole a tapped thread leaves. */
    readonly internalMinorDiameter: number;
    /** The drill to bore before tapping the thread. */
    readonly tapDrill: number;
}

/**
 * The sizes of an ISO 4762 socket head cap screw's head, in millimetres, from `socketHeadCapScrewSizes`.
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
    /** The diameter of the counterbore that sinks the head, after DIN 974-1. */
    readonly counterboreDiameter: number;
    /** The depth of that counterbore: the head's height and half a millimetre more, so the head sits just below the face. */
    readonly counterboreDepth: number;
}

/**
 * The sizes of an ISO 4017 or ISO 4014 hexagon head bolt's head, in millimetres, from `hexBoltSizes`.
 */
export interface HexBoltSizes {
    /** The width across the flats of the head. */
    readonly acrossFlats: number;
    /** The height of the head. */
    readonly headHeight: number;
    /** The length of thread on an ISO 4014 bolt, threaded only part of its length. */
    readonly threadLength: number;
}

/**
 * The sizes of an ISO 4032 hexagon nut, in millimetres, from `hexNutSizes`.
 */
export interface HexNutSizes {
    /** The width across the flats. */
    readonly acrossFlats: number;
    /** The height of the nut. */
    readonly height: number;
}

/**
 * The sizes of an ISO 7089 plain washer, in millimetres, from `washerSizes`.
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
 * The point of a hexagon socket set screw: flat (ISO 4026), cone (ISO 4027), dog (ISO 4028) or cup
 * (ISO 4029).
 */
export type SetScrewPoint = `${Inputs.Engineering.setScrewPointEnum}`;

/**
 * A hexagon socket set screw, from `setScrewSizes`.
 */
export interface SetScrewSizes {
    /** The hexagon socket's width across flats. */
    readonly socketSize: number;
    /** How deep the socket is at least, which the standard sets lower for a short screw. */
    readonly socketDepth: number;
    /** The diameter of the point: the flat or the dog, the cup's rim, or the cone's tip. */
    readonly pointDiameter: number;
    /**
     * How long the point is along the axis below the thread's root: the chamfer down to a flat, the
     * cone, the dog's cylinder after its chamfer, or the depth of the cup.
     */
    readonly pointLength: number;
    /** The included angle of the point's chamfer or cone, in degrees. */
    readonly pointAngle: number;
    /** The longest screw the standard counts as short, with a shallower socket and point. */
    readonly shortUpTo: number;
}

/**
 * An ISO 7090 plain washer chamfered on the outside of one face, from `chamferedWasherSizes`.
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

export interface ThreadRow {
    readonly diameter: number;
    readonly pitch: number;
    readonly tapDrill: number;
}

export interface SetScrewPointRow {
    readonly diameter: number;
    readonly shortUpTo: number;
}

export interface DogPointRow extends SetScrewPointRow {
    readonly lengthShort: number;
    readonly lengthLong: number;
}

export interface SetScrewRow {
    readonly key: number;
    readonly depthShort: number;
    readonly depthLong: number;
    readonly flat: SetScrewPointRow;
    readonly cone: SetScrewPointRow;
    readonly dog: DogPointRow;
    readonly cup: SetScrewPointRow;
}
