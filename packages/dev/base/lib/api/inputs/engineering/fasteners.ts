import { Base } from "../base-inputs";
import { ansiSetScrewPointEnum, ansiThreadSeriesEnum, ansiThreadSizeEnum, ansiWasherSeriesEnum, clearanceFitEnum, isoSetScrewPointEnum, isoThreadSizeEnum } from "./enums";

/**
 * An ISO metric thread size and the unit its sizes come back in, shared by the ISO thread and
 * fastener sizes of `engineering.mechanical`.
 */
export abstract class IsoSizeSharedDto {
    /**
     * The thread size, such as M8.
     * @default m3
     */
    size?: isoThreadSizeEnum | undefined = isoThreadSizeEnum.m3;
    /**
     * The unit every length the method takes or gives is in; the size names a metric thread
     * whatever it is.
     * @default millimetre
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.millimetre;
}

/**
 * An ISO metric thread size and a unit, for the cap screw, nut and washer sizes of
 * `engineering.mechanical.fasteners.iso`.
 */
export class IsoSizeDto extends IsoSizeSharedDto {
    constructor(size?: isoThreadSizeEnum, unit?: Base.unitOfLengthEnum) {
        super();
        if (size !== undefined) { this.size = size; }
        if (unit !== undefined) { this.unit = unit; }
    }
}

/**
 * An ISO metric thread size and, for a fine thread, its pitch, for
 * `engineering.mechanical.threads.iso.thread`.
 */
export class IsoThreadDto extends IsoSizeSharedDto {
    constructor(size?: isoThreadSizeEnum, pitch?: number, unit?: Base.unitOfLengthEnum) {
        super();
        if (size !== undefined) { this.size = size; }
        if (pitch !== undefined) { this.pitch = pitch; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The crest-to-crest distance in millimetres, as ISO names it: at most the size's coarse pitch,
     * 3 for an M24. Left out, the coarse pitch.
     * @default undefined
     * @optional true
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 3
     * @step 0.05
     */
    pitch?: number | undefined;
}

/**
 * An ISO metric thread size, how much room is left around it and a unit, for
 * `engineering.mechanical.fasteners.iso.clearanceHole`.
 */
export class IsoClearanceHoleDto extends IsoSizeSharedDto {
    constructor(size?: isoThreadSizeEnum, fit?: clearanceFitEnum, unit?: Base.unitOfLengthEnum) {
        super();
        if (size !== undefined) { this.size = size; }
        if (fit !== undefined) { this.fit = fit; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * How much room the hole leaves around the screw.
     * @default normal
     */
    fit?: clearanceFitEnum | undefined = clearanceFitEnum.normal;
}

/**
 * An ISO hexagon bolt's thread size and length and a unit, for
 * `engineering.mechanical.fasteners.iso.hexBoltSizes`.
 */
export class IsoHexBoltSizesDto extends IsoSizeSharedDto {
    constructor(size?: isoThreadSizeEnum, length?: number, unit?: Base.unitOfLengthEnum) {
        super();
        if (size !== undefined) { this.size = size; }
        if (length !== undefined) { this.length = length; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The length of the bolt from under its head to its tip, in `unit`, which sets how much of
     * it ISO 4014 threads.
     * @default 10
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 10;
}

/**
 * An ISO set screw's thread size, point and length and a unit, for
 * `engineering.mechanical.fasteners.iso.setScrewSizes`.
 */
export class IsoSetScrewSizesDto extends IsoSizeSharedDto {
    constructor(size?: isoThreadSizeEnum, point?: isoSetScrewPointEnum, length?: number, unit?: Base.unitOfLengthEnum) {
        super();
        if (size !== undefined) { this.size = size; }
        if (point !== undefined) { this.point = point; }
        if (length !== undefined) { this.length = length; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The shape of the screw's end that bears on the part.
     * @default flat
     */
    point?: isoSetScrewPointEnum | undefined = isoSetScrewPointEnum.flat;
    /**
     * The screw's whole length in `unit`, which decides whether it counts as short. Left out, a
     * long screw.
     * @default undefined
     * @optional true
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined;
}

/**
 * A Unified inch thread size and the unit its sizes come back in, shared by the ASME thread and
 * fastener sizes of `engineering.mechanical`.
 */
export abstract class AnsiSizeSharedDto {
    /**
     * The thread size, such as 1/4 or #10.
     * @default in1_4
     */
    size?: ansiThreadSizeEnum | undefined = ansiThreadSizeEnum.in1_4;
    /**
     * The unit every length the method takes or gives is in; the size names an inch thread
     * whatever it is.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
}

/**
 * A Unified inch thread size and a unit, for the cap screw and nut sizes of
 * `engineering.mechanical.fasteners.ansi`.
 */
export class AnsiSizeDto extends AnsiSizeSharedDto {
    constructor(size?: ansiThreadSizeEnum, unit?: Base.unitOfLengthEnum) {
        super();
        if (size !== undefined) { this.size = size; }
        if (unit !== undefined) { this.unit = unit; }
    }
}

/**
 * A Unified inch thread size, its series or its own threads per inch, and a unit, for
 * `engineering.mechanical.threads.ansi.thread`.
 */
export class AnsiThreadDto extends AnsiSizeSharedDto {
    constructor(size?: ansiThreadSizeEnum, series?: ansiThreadSeriesEnum, threadsPerInch?: number, unit?: Base.unitOfLengthEnum) {
        super();
        if (size !== undefined) { this.size = size; }
        if (series !== undefined) { this.series = series; }
        if (threadsPerInch !== undefined) { this.threadsPerInch = threadsPerInch; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * Whether the thread is coarse (UNC) or fine (UNF); #0, which has no coarse thread, is cut fine.
     * @default unc
     */
    series?: ansiThreadSeriesEnum | undefined = ansiThreadSeriesEnum.unc;
    /**
     * A pitch of the thread's own, as threads to the inch, at least the size's coarsest; it
     * overrides `series`. Left out, the series' pitch.
     * @default undefined
     * @optional true
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    threadsPerInch?: number | undefined;
}

/**
 * A Unified inch thread size, how much room is left around it and a unit, for
 * `engineering.mechanical.fasteners.ansi.clearanceHole`.
 */
export class AnsiClearanceHoleDto extends AnsiSizeSharedDto {
    constructor(size?: ansiThreadSizeEnum, fit?: clearanceFitEnum, unit?: Base.unitOfLengthEnum) {
        super();
        if (size !== undefined) { this.size = size; }
        if (fit !== undefined) { this.fit = fit; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * How much room the hole leaves around the screw.
     * @default normal
     */
    fit?: clearanceFitEnum | undefined = clearanceFitEnum.normal;
}

/**
 * An ASME hex cap screw's thread size and length and a unit, for
 * `engineering.mechanical.fasteners.ansi.hexBoltSizes`.
 */
export class AnsiHexBoltSizesDto extends AnsiSizeSharedDto {
    constructor(size?: ansiThreadSizeEnum, length?: number, unit?: Base.unitOfLengthEnum) {
        super();
        if (size !== undefined) { this.size = size; }
        if (length !== undefined) { this.length = length; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The length of the screw from under its head to its tip, in `unit`, which sets how much of
     * it ASME B18.2.1 threads.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    length?: number | undefined = 1;
}

/**
 * A Unified inch thread size, a washer series and a unit, for
 * `engineering.mechanical.fasteners.ansi.washerSizes`.
 */
export class AnsiWasherSizesDto extends AnsiSizeSharedDto {
    constructor(size?: ansiThreadSizeEnum, series?: ansiWasherSeriesEnum, unit?: Base.unitOfLengthEnum) {
        super();
        if (size !== undefined) { this.size = size; }
        if (series !== undefined) { this.series = series; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * Whether the washer is narrow or wide around its hole.
     * @default narrow
     */
    series?: ansiWasherSeriesEnum | undefined = ansiWasherSeriesEnum.narrow;
}

/**
 * An ASME set screw's thread size, point, thread series and length and a unit, for
 * `engineering.mechanical.fasteners.ansi.setScrewSizes`.
 */
export class AnsiSetScrewSizesDto extends AnsiSizeSharedDto {
    constructor(size?: ansiThreadSizeEnum, point?: ansiSetScrewPointEnum, series?: ansiThreadSeriesEnum, length?: number, unit?: Base.unitOfLengthEnum) {
        super();
        if (size !== undefined) { this.size = size; }
        if (point !== undefined) { this.point = point; }
        if (series !== undefined) { this.series = series; }
        if (length !== undefined) { this.length = length; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The shape of the screw's end that bears on the part.
     * @default cup
     */
    point?: ansiSetScrewPointEnum | undefined = ansiSetScrewPointEnum.cup;
    /**
     * Whether the screw's thread is coarse (UNC) or fine (UNF), which sets the root its point
     * starts from; #0, which has no coarse thread, is cut fine.
     * @default unc
     */
    series?: ansiThreadSeriesEnum | undefined = ansiThreadSeriesEnum.unc;
    /**
     * The screw's whole length in `unit`, which decides whether it counts as short. Left out, a
     * long screw.
     * @default undefined
     * @optional true
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    length?: number | undefined;
}
