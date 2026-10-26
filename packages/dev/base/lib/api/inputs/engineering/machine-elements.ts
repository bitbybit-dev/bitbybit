import { Base } from "../base-inputs";
import { ansiBallBearingEnum, ansiSplinePitchEnum, isoBallBearingEnum, knurlPatternEnum, retainingRingKindEnum } from "./enums";

/**
 * An ISO deep groove ball bearing's designation and a unit, for
 * `engineering.mechanical.bearings.iso.ballBearingSizes`.
 */
export class IsoBallBearingSizesDto {
    constructor(designation?: isoBallBearingEnum, unit?: Base.unitOfLengthEnum) {
        if (designation !== undefined) { this.designation = designation; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The bearing, such as 6204 or 608.
     * @default b608
     */
    designation?: isoBallBearingEnum | undefined = isoBallBearingEnum.b608;
    /**
     * The unit the bearing's sizes come back in.
     * @default millimetre
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.millimetre;
}

/**
 * An inch deep groove ball bearing's designation, whether it is shielded and a unit, for
 * `engineering.mechanical.bearings.ansi.ballBearingSizes`.
 */
export class AnsiBallBearingSizesDto {
    constructor(designation?: ansiBallBearingEnum, shields?: boolean, unit?: Base.unitOfLengthEnum) {
        if (designation !== undefined) { this.designation = designation; }
        if (shields !== undefined) { this.shields = shields; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The bearing, such as R8 or R188.
     * @default r8
     */
    designation?: ansiBallBearingEnum | undefined = ansiBallBearingEnum.r8;
    /**
     * When true, the width of the shielded bearing, which on several R-series sizes is wider than
     * the open one.
     * @default false
     */
    shields?: boolean | undefined = false;
    /**
     * The unit the bearing's sizes come back in.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
}

/**
 * The shaft a DIN 6885 parallel key sits in and a unit, for
 * `engineering.mechanical.keys.din.parallelKeySizes`.
 */
export class DinParallelKeySizesDto {
    constructor(shaftDiameter?: number, unit?: Base.unitOfLengthEnum) {
        if (shaftDiameter !== undefined) { this.shaftDiameter = shaftDiameter; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The diameter of the shaft, in `unit`, which sets the key's width and height; DIN 6885 keys
     * shafts over 6 and up to 65 millimetres.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    shaftDiameter?: number | undefined = 20;
    /**
     * The unit the shaft's diameter and the key's sizes are in.
     * @default millimetre
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.millimetre;
}

/**
 * The shaft an ANSI B17.1 parallel key sits in and a unit, for
 * `engineering.mechanical.keys.ansi.parallelKeySizes`.
 */
export class AnsiParallelKeySizesDto {
    constructor(shaftDiameter?: number, unit?: Base.unitOfLengthEnum) {
        if (shaftDiameter !== undefined) { this.shaftDiameter = shaftDiameter; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The diameter of the shaft, in `unit`, which sets the square key's size; ANSI B17.1's square
     * keys cover shafts over 5/16 and up to 6-1/2 inches.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    shaftDiameter?: number | undefined = 1;
    /**
     * The unit the shaft's diameter and the key's sizes are in.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
}

/**
 * Shaft or bore and a unit, for `engineering.mechanical.retainingRings.din.diameters`, which lists
 * the diameters DIN 471 and DIN 472 give rings for.
 */
export class DinRetainingRingDiametersDto {
    constructor(kind?: retainingRingKindEnum, unit?: Base.unitOfLengthEnum) {
        if (kind !== undefined) { this.kind = kind; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * Whether the rings sit on a shaft or in a bore.
     * @default shaft
     */
    kind?: retainingRingKindEnum | undefined = retainingRingKindEnum.shaft;
    /**
     * The unit the diameters come back in.
     * @default millimetre
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.millimetre;
}

/**
 * A shaft's or a bore's diameter, which DIN ring it takes and a unit, for
 * `engineering.mechanical.retainingRings.din.retainingRingSizes`.
 */
export class DinRetainingRingSizesDto {
    constructor(kind?: retainingRingKindEnum, diameter?: number, unit?: Base.unitOfLengthEnum) {
        if (kind !== undefined) { this.kind = kind; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * Whether the ring sits on a shaft or in a bore.
     * @default shaft
     */
    kind?: retainingRingKindEnum | undefined = retainingRingKindEnum.shaft;
    /**
     * The shaft's or the bore's diameter in `unit`, one DIN 471 or DIN 472 lists: from 3 to 100
     * millimetres for shafts, from 8 to 100 for bores.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    diameter?: number | undefined = 20;
    /**
     * The unit the diameter and the ring's sizes are in.
     * @default millimetre
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.millimetre;
}

/**
 * Shaft or bore and a unit, for `engineering.mechanical.retainingRings.ansi.diameters`, which
 * lists the diameters the inch tapered rings come for.
 */
export class AnsiRetainingRingDiametersDto {
    constructor(kind?: retainingRingKindEnum, unit?: Base.unitOfLengthEnum) {
        if (kind !== undefined) { this.kind = kind; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * Whether the rings sit on a shaft or in a bore.
     * @default shaft
     */
    kind?: retainingRingKindEnum | undefined = retainingRingKindEnum.shaft;
    /**
     * The unit the diameters come back in.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
}

/**
 * A shaft's or a bore's diameter, which inch tapered ring it takes and a unit, for
 * `engineering.mechanical.retainingRings.ansi.retainingRingSizes`.
 */
export class AnsiRetainingRingSizesDto {
    constructor(kind?: retainingRingKindEnum, diameter?: number, unit?: Base.unitOfLengthEnum) {
        if (kind !== undefined) { this.kind = kind; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * Whether the ring sits on a shaft or in a bore.
     * @default shaft
     */
    kind?: retainingRingKindEnum | undefined = retainingRingKindEnum.shaft;
    /**
     * The shaft's or the bore's diameter in `unit`, one the inch rings list: from 1/8 to 2 inches
     * for shafts, from 1/4 to 2 for bores.
     * @default 0.75
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    diameter?: number | undefined = 0.75;
    /**
     * The unit the diameter and the ring's sizes are in.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
}

/**
 * A DIN 5480 involute spline's reference diameter and module, and the unit its sizes come back
 * in, for `engineering.mechanical.splines.din.involuteSplineSizes`.
 */
export class DinInvoluteSplineSizesDto {
    constructor(referenceDiameter?: number, module?: number, unit?: Base.unitOfLengthEnum) {
        if (referenceDiameter !== undefined) { this.referenceDiameter = referenceDiameter; }
        if (module !== undefined) { this.module = module; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The diameter the spline is named by, in millimetres as DIN 5480 names it, such as 25 in
     * W 25x1.25x18.
     * @default 25
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    referenceDiameter?: number | undefined = 25;
    /**
     * The module of its teeth in millimetres, one of DIN 5480's: 0.5, 0.6, 0.75, 0.8, 1, 1.25,
     * 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 8 or 10.
     * @default 1.25
     * @minimum 0.5
     * @maximum 10
     * @step 0.05
     */
    module?: number | undefined = 1.25;
    /**
     * The unit the spline's sizes come back in.
     * @default millimetre
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.millimetre;
}

/**
 * An ANSI B92.1 involute spline's teeth and pitch, and the unit its sizes come back in, for
 * `engineering.mechanical.splines.ansi.involuteSplineSizes`.
 */
export class AnsiInvoluteSplineSizesDto {
    constructor(teeth?: number, pitch?: ansiSplinePitchEnum, unit?: Base.unitOfLengthEnum) {
        if (teeth !== undefined) { this.teeth = teeth; }
        if (pitch !== undefined) { this.pitch = pitch; }
        if (unit !== undefined) { this.unit = unit; }
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
    pitch?: ansiSplinePitchEnum | undefined = ansiSplinePitchEnum.p16_32;
    /**
     * The unit the spline's sizes come back in.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
}

/**
 * A cylinder's diameter, an ASME B94.6 diametral pitch, a pattern and a unit, for
 * `engineering.mechanical.knurls.ansi.knurlSizes`.
 */
export class AnsiKnurlSizesDto {
    constructor(diameter?: number, diametralPitch?: number, pattern?: knurlPatternEnum, unit?: Base.unitOfLengthEnum) {
        if (diameter !== undefined) { this.diameter = diameter; }
        if (diametralPitch !== undefined) { this.diametralPitch = diametralPitch; }
        if (pattern !== undefined) { this.pattern = pattern; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The cylinder's diameter in `unit`.
     * @default 0.5
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.125
     */
    diameter?: number | undefined = 0.5;
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
    pattern?: knurlPatternEnum | undefined = knurlPatternEnum.straight;
    /**
     * The unit the diameter and the grooves' sizes are in.
     * @default inch
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.inch;
}

/**
 * A cylinder's diameter, a DIN 82 pitch, a pattern and a unit, for
 * `engineering.mechanical.knurls.din.knurlSizes`.
 */
export class DinKnurlSizesDto {
    constructor(diameter?: number, pitch?: number, pattern?: knurlPatternEnum, unit?: Base.unitOfLengthEnum) {
        if (diameter !== undefined) { this.diameter = diameter; }
        if (pitch !== undefined) { this.pitch = pitch; }
        if (pattern !== undefined) { this.pattern = pattern; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The cylinder's diameter in `unit`, more than twice `pitch`.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    diameter?: number | undefined = 20;
    /**
     * The distance between grooves round the circumference, in millimetres, one of DIN 82's: 0.5,
     * 0.6, 0.8, 1, 1.2 or 1.6.
     * @default 1
     * @minimum 0.5
     * @maximum 1.6
     * @step 0.1
     */
    pitch?: number | undefined = 1;
    /**
     * The grooves' pattern.
     * @default straight
     */
    pattern?: knurlPatternEnum | undefined = knurlPatternEnum.straight;
    /**
     * The unit the diameter and the grooves' sizes are in.
     * @default millimetre
     */
    unit?: Base.unitOfLengthEnum | undefined = Base.unitOfLengthEnum.millimetre;
}
