import { Base } from "@bitbybit-dev/base";
import { Engineering } from "@bitbybit-dev/base/lib/api/inputs/engineering-inputs";

/**
 * The size of an ASME inch fastener, the unit it is made in and where it sits, shared by the screws,
 * nuts and washers of `parts.mechanical.fasteners.ansi`.
 */
export abstract class AnsiFastenerSharedDto {
    /**
     * The thread size, such as 1/4 or #10.
     * @default in1_4
     */
    size?: Engineering.ansiThreadSizeEnum | undefined = Engineering.ansiThreadSizeEnum.in1_4;
    /**
     * The unit the fastener is made in and its lengths are read in; the size names an inch thread
     * whatever it is.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
    /**
     * Where it sits: the origin where it bears, as under a head, the normal along its axis away from
     * the part. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * An ASME screw's thread size and series, its length under the head, the unit and where its head
 * sits, for `parts.mechanical.fasteners.ansi.socketHeadCapScrew` and `parts.mechanical.fasteners.ansi.hexBolt`.
 */
export abstract class AnsiScrewSharedDto extends AnsiFastenerSharedDto {
    /**
     * Whether the thread is coarse (UNC) or fine (UNF), which sets the pitch a modelled thread is cut
     * at and the tip's chamfer.
     * @default unc
     */
    series?: Engineering.ansiThreadSeriesEnum | undefined = Engineering.ansiThreadSeriesEnum.unc;
    /**
     * The length of the screw from under its head to its tip, in `unit`.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    length?: number | undefined = 1;
    /**
     * When true the threaded length is modelled, as `parts.mechanical.machining.ansi.thread` cuts it, its
     * faces all named `thread`; when false the thread is a light cosmetic face.
     * @default false
     */
    modelledThread?: boolean | undefined = false;
}
/**
 * An ASME B18.3 cap screw, for `parts.mechanical.fasteners.ansi.socketHeadCapScrew` and its
 * twin with face roles: its size and series, its length, the unit and where its head sits.
 */
export class AnsiSocketHeadCapScrewDto extends AnsiScrewSharedDto {
    constructor(size?: Engineering.ansiThreadSizeEnum, series?: Engineering.ansiThreadSeriesEnum, length?: number, modelledThread?: boolean, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (size !== undefined) { this.size = size; }
        if (series !== undefined) { this.series = series; }
        if (length !== undefined) { this.length = length; }
        if (modelledThread !== undefined) { this.modelledThread = modelledThread; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
}
/**
 * An ASME B18.2.1 hex cap screw for `parts.mechanical.fasteners.ansi.hexBolt` and its twin with face roles:
 * threaded to the head, or only for the length the standard gives.
 */
export class AnsiHexBoltDto extends AnsiScrewSharedDto {
    constructor(size?: Engineering.ansiThreadSizeEnum, series?: Engineering.ansiThreadSeriesEnum, length?: number, fullyThreaded?: boolean, modelledThread?: boolean, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (size !== undefined) { this.size = size; }
        if (series !== undefined) { this.series = series; }
        if (length !== undefined) { this.length = length; }
        if (fullyThreaded !== undefined) { this.fullyThreaded = fullyThreaded; }
        if (modelledThread !== undefined) { this.modelledThread = modelledThread; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * When true the screw is threaded to its head; when false only for the length ASME B18.2.1 gives,
     * leaving a plain shank a modelled thread shows.
     * @default false
     */
    fullyThreaded?: boolean | undefined = false;
}
/**
 * An ASME hex nut for `parts.mechanical.fasteners.ansi.hexNut` and its twin with face roles: a machine
 * screw nut to #12, a hex nut from 1/4, the unit and where it bears.
 */
export class AnsiHexNutDto extends AnsiFastenerSharedDto {
    constructor(size?: Engineering.ansiThreadSizeEnum, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (size !== undefined) { this.size = size; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
}
/**
 * An ASME B18.22.1 type A plain washer for `parts.mechanical.fasteners.ansi.washer` and its twin with face
 * roles: its size, narrow or wide, the unit and where it bears.
 */
export class AnsiWasherDto extends AnsiFastenerSharedDto {
    constructor(size?: Engineering.ansiThreadSizeEnum, series?: Engineering.ansiWasherSeriesEnum, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (size !== undefined) { this.size = size; }
        if (series !== undefined) { this.series = series; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * Whether the washer is narrow or wide around its hole.
     * @default narrow
     */
    series?: Engineering.ansiWasherSeriesEnum | undefined = Engineering.ansiWasherSeriesEnum.narrow;
}
/**
 * An ASME B18.3 set screw with a hexagon recess for `parts.mechanical.fasteners.ansi.setScrew` and its twin with face roles:
 * its size and series, its length, its point, the unit and where its recess end sits.
 */
export class AnsiSetScrewDto extends AnsiFastenerSharedDto {
    constructor(size?: Engineering.ansiThreadSizeEnum, series?: Engineering.ansiThreadSeriesEnum, length?: number, point?: Engineering.ansiSetScrewPointEnum, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (size !== undefined) { this.size = size; }
        if (series !== undefined) { this.series = series; }
        if (length !== undefined) { this.length = length; }
        if (point !== undefined) { this.point = point; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * Whether the thread is coarse (UNC) or fine (UNF), which sets the root the point starts from.
     * @default unc
     */
    series?: Engineering.ansiThreadSeriesEnum | undefined = Engineering.ansiThreadSeriesEnum.unc;
    /**
     * The shape of the end that bears on the part: cup, flat, cone, oval or half dog.
     * @default cup
     */
    point?: Engineering.ansiSetScrewPointEnum | undefined = Engineering.ansiSetScrewPointEnum.cup;
    /**
     * The length of the set screw, in `unit`.
     * @default 0.25
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.0625
     */
    length?: number | undefined = 0.25;
}
/**
 * An inch R-series deep groove ball bearing for `parts.mechanical.bearings.ansi.ballBearing` and its twin
 * with face roles: which bearing, whether shields close its sides, the unit and where it sits.
 */
export class AnsiBallBearingDto {
    constructor(designation?: Engineering.ansiBallBearingEnum, shields?: boolean, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        if (designation !== undefined) { this.designation = designation; }
        if (shields !== undefined) { this.shields = shields; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The bearing, such as R8 or R188.
     * @default r8
     */
    designation?: Engineering.ansiBallBearingEnum | undefined = Engineering.ansiBallBearingEnum.r8;
    /**
     * When true, a shield closes each side between the rings, at the shielded bearing's width.
     * @default false
     */
    shields?: boolean | undefined = false;
    /**
     * The unit the bearing is made in.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
    /**
     * Where the bearing sits: the centre of one side on the origin and its axis along the normal.
     * Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * An ANSI B17.1 square parallel key with round ends for `parts.mechanical.keys.ansi.parallelKey` and its
 * twin with face roles: sized for its shaft, its length, the unit and where it lies.
 */
export class AnsiParallelKeyDto {
    constructor(shaftDiameter?: number, length?: number, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        if (shaftDiameter !== undefined) { this.shaftDiameter = shaftDiameter; }
        if (length !== undefined) { this.length = length; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The diameter of the shaft the key sits in, in `unit`, which sets its size; ANSI B17.1's square
     * keys cover shafts over 5/16 and up to 6-1/2 inches.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    shaftDiameter?: number | undefined = 1;
    /**
     * The key's length from one round end to the other, in `unit`; at least its width.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    length?: number | undefined = 1;
    /**
     * The unit the key is made in and its lengths are read in.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
    /**
     * Where the key lies: its bottom face's centre on the origin, its height along the normal, its
     * length along the direction. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * An inch tapered retaining ring for a shaft or a bore, for `parts.mechanical.retainingRings.ansi.retainingRing`
 * and its twin with face roles: which ring, the unit and where it sits.
 */
export class AnsiRetainingRingDto {
    constructor(kind?: Engineering.retainingRingKindEnum, diameter?: number, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        if (kind !== undefined) { this.kind = kind; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * Whether the ring sits on a shaft or in a bore.
     * @default shaft
     */
    kind?: Engineering.retainingRingKindEnum | undefined = Engineering.retainingRingKindEnum.shaft;
    /**
     * The shaft's or the bore's diameter in `unit`, one the inch rings list: from 1/8 to 2 inches for
     * shafts, from 1/4 to 2 for bores.
     * @default 0.75
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    diameter?: number | undefined = 0.75;
    /**
     * The unit the ring is made in and its diameter is read in.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
    /**
     * Where the ring sits: its centre on the origin, one side on the frame's plane, its lugs toward
     * the direction. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
