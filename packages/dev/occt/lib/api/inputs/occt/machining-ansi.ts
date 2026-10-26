import { Base } from "@bitbybit-dev/base";
import { Engineering } from "@bitbybit-dev/base/lib/api/inputs/engineering-inputs";
import { MachiningFrameSharedDto } from "./machining";

/**
 * The unit an ANSI feature is cut in and where it sits, shared by the tools of
 * `parts.mechanical.machining.ansi`, which size it from the inch tables.
 */
export abstract class AnsiMachiningSharedDto extends MachiningFrameSharedDto {
    /**
     * The unit the feature is cut in and its lengths and diameter are read in.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
}
/**
 * An ANSI B17.1 keyseat for `parts.mechanical.machining.ansi.keywayTool`: the shaft or bore it is sized for,
 * its length and whether it is milled into the shaft or cut through the hub.
 */
export class AnsiKeywayToolDto extends AnsiMachiningSharedDto {
    constructor(diameter?: number, length?: number, inHub?: boolean, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (diameter !== undefined) { this.diameter = diameter; }
        if (length !== undefined) { this.length = length; }
        if (inHub !== undefined) { this.inHub = inHub; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shaft's or the bore's diameter in `unit`, which sets the keyseat's width and depth; ANSI
     * B17.1's square keys cover shafts over 5/16 and up to 6-1/2 inches.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    diameter?: number | undefined = 1;
    /**
     * The keyseat's length along the axis, in `unit`; in a shaft, end to end of its round ends.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    length?: number | undefined = 1;
    /**
     * When true, the straight keyseat cut through a hub's bore; when false, the round-ended pocket
     * milled into a shaft.
     * @default false
     */
    inHub?: boolean | undefined = false;
}
/**
 * A body and an ANSI B17.1 keyseat to cut into it, for `parts.mechanical.machining.ansi.keyway`.
 */
export class AnsiKeywayDto<T> extends AnsiKeywayToolDto {
    constructor(shape?: T, diameter?: number, length?: number, inHub?: boolean, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (length !== undefined) { this.length = length; }
        if (inHub !== undefined) { this.inHub = inHub; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shaft or the hub to cut.
     * @default undefined
     */
    shape!: T;
}
/**
 * The groove an inch tapered retaining ring sits in, for `parts.mechanical.machining.ansi.ringGrooveTool`.
 */
export class AnsiRingGrooveToolDto extends AnsiMachiningSharedDto {
    constructor(kind?: Engineering.retainingRingKindEnum, diameter?: number, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (kind !== undefined) { this.kind = kind; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * Whether the groove is in a shaft or in a bore.
     * @default shaft
     */
    kind?: Engineering.retainingRingKindEnum | undefined = Engineering.retainingRingKindEnum.shaft;
    /**
     * The shaft's or the bore's diameter in `unit`, one the inch rings list.
     * @default 0.75
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    diameter?: number | undefined = 0.75;
}
/**
 * A body and an inch retaining ring's groove to cut into it, for `parts.mechanical.machining.ansi.ringGroove`.
 */
export class AnsiRingGrooveDto<T> extends AnsiRingGrooveToolDto {
    constructor(shape?: T, kind?: Engineering.retainingRingKindEnum, diameter?: number, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (kind !== undefined) { this.kind = kind; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shaft or the bored body to cut.
     * @default undefined
     */
    shape!: T;
}
/**
 * An ASME B94.6 diametral pitch knurl on a round shaft, for `parts.mechanical.machining.ansi.knurlTool`: the
 * shaft's diameter, the knurl's length, its pitch and its pattern.
 */
export class AnsiKnurlToolDto extends AnsiMachiningSharedDto {
    constructor(diameter?: number, length?: number, diametralPitch?: number, pattern?: Engineering.knurlPatternEnum, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (diameter !== undefined) { this.diameter = diameter; }
        if (length !== undefined) { this.length = length; }
        if (diametralPitch !== undefined) { this.diametralPitch = diametralPitch; }
        if (pattern !== undefined) { this.pattern = pattern; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shaft's diameter in `unit`; the knurl's crests sit on the nearest diameter its teeth track
     * on.
     * @default 0.5
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    diameter?: number | undefined = 0.5;
    /**
     * The knurl's length along the axis, in `unit`. A left, right or diamond knurl's grooves twist
     * through at most 1000 degrees along it.
     * @default 0.5
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    length?: number | undefined = 0.5;
    /**
     * Teeth to an inch of diameter, one of ASME B94.6's: 64, 96, 128 or 160.
     * @default 96
     * @minimum 64
     * @maximum 160
     * @step 32
     */
    diametralPitch?: number | undefined = 96;
    /**
     * The grooves' pattern; left and right are B94.6's diagonal knurls.
     * @default straight
     */
    pattern?: Engineering.knurlPatternEnum | undefined = Engineering.knurlPatternEnum.straight;
}
/**
 * A body and an ASME B94.6 knurl to cut into it, for `parts.mechanical.machining.ansi.knurl`.
 */
export class AnsiKnurlDto<T> extends AnsiKnurlToolDto {
    constructor(shape?: T, diameter?: number, length?: number, diametralPitch?: number, pattern?: Engineering.knurlPatternEnum, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (length !== undefined) { this.length = length; }
        if (diametralPitch !== undefined) { this.diametralPitch = diametralPitch; }
        if (pattern !== undefined) { this.pattern = pattern; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shaft to knurl.
     * @default undefined
     */
    shape!: T;
}
/**
 * An ANSI B92.1 involute spline, for `parts.mechanical.machining.ansi.splinedShaft` and
 * `parts.mechanical.machining.ansi.splinedHubTool`: its teeth, pitch and length.
 */
export class AnsiSplineDto extends AnsiMachiningSharedDto {
    constructor(teeth?: number, pitch?: Engineering.ansiSplinePitchEnum, length?: number, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pitch !== undefined) { this.pitch = pitch; }
        if (length !== undefined) { this.length = length; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * How many teeth the spline has, a whole number from 6 to 60.
     * @default 24
     * @minimum 6
     * @maximum 60
     * @step 1
     */
    teeth?: number | undefined = 24;
    /**
     * The pitch over the stub pitch, such as 16/32.
     * @default p16_32
     */
    pitch?: Engineering.ansiSplinePitchEnum | undefined = Engineering.ansiSplinePitchEnum.p16_32;
    /**
     * The spline's length along the axis, in `unit`.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    length?: number | undefined = 1;
}
/**
 * A body and an ANSI B92.1 hub spline to cut through it, for `parts.mechanical.machining.ansi.splinedHub`.
 */
export class AnsiSplinedHubDto<T> extends AnsiSplineDto {
    constructor(shape?: T, teeth?: number, pitch?: Engineering.ansiSplinePitchEnum, length?: number, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pitch !== undefined) { this.pitch = pitch; }
        if (length !== undefined) { this.length = length; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The hub to cut.
     * @default undefined
     */
    shape!: T;
}
/**
 * A Unified inch thread modelled on a shank or in a hole, for `parts.mechanical.machining.ansi.threadTool`: its
 * size and series or pitch, its length, whether it is cut inside a hole and the unit.
 */
export class AnsiThreadToolDto {
    constructor(size?: Engineering.ansiThreadSizeEnum, series?: Engineering.ansiThreadSeriesEnum, threadsPerInch?: number, length?: number, internal?: boolean, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        if (size !== undefined) { this.size = size; }
        if (series !== undefined) { this.series = series; }
        if (threadsPerInch !== undefined) { this.threadsPerInch = threadsPerInch; }
        if (length !== undefined) { this.length = length; }
        if (internal !== undefined) { this.internal = internal; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The thread size, such as 1/4 or #10.
     * @default in1_4
     */
    size?: Engineering.ansiThreadSizeEnum | undefined = Engineering.ansiThreadSizeEnum.in1_4;
    /**
     * Whether the thread is coarse (UNC) or fine (UNF); #0, which has no coarse thread, is cut fine.
     * @default unc
     */
    series?: Engineering.ansiThreadSeriesEnum | undefined = Engineering.ansiThreadSeriesEnum.unc;
    /**
     * A pitch of the thread's own, as threads to the inch, at least the size's coarsest; it overrides
     * `series`. Left out, the series' pitch.
     * @default undefined
     * @optional true
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    threadsPerInch?: number | undefined;
    /**
     * The threaded length along the axis, in `unit`: at most 400 turns of the pitch.
     * @default 0.5
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    length?: number | undefined = 0.5;
    /**
     * When true, the thread is cut in a hole drilled to the minor diameter, as in a nut; when false,
     * on a shank turned to the nominal.
     * @default false
     */
    internal?: boolean | undefined = false;
    /**
     * The unit the thread is cut in and its length is read in.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
    /**
     * Where the thread starts, at a hole's mouth or under a head, its normal out of the part: the
     * thread runs against it. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * A body and a Unified inch thread to cut into it, for `parts.mechanical.machining.ansi.thread`.
 */
export class AnsiThreadCutDto<T> extends AnsiThreadToolDto {
    constructor(shape?: T, size?: Engineering.ansiThreadSizeEnum, series?: Engineering.ansiThreadSeriesEnum, threadsPerInch?: number, length?: number, internal?: boolean, unit?: Base.unitOfLengthEnum, frame?: Base.Frame) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (size !== undefined) { this.size = size; }
        if (series !== undefined) { this.series = series; }
        if (threadsPerInch !== undefined) { this.threadsPerInch = threadsPerInch; }
        if (length !== undefined) { this.length = length; }
        if (internal !== undefined) { this.internal = internal; }
        if (unit !== undefined) { this.unit = unit; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shank or the body with the hole to cut.
     * @default undefined
     */
    shape!: T;
}
