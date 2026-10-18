import type { Base } from "@bitbybit-dev/base";
import { Engineering } from "@bitbybit-dev/base/lib/api/inputs/engineering-inputs";

/**
 * Where a machined feature sits, shared by the tools of `parts.mechanical.machining`: on the axis where it
 * starts, the axis along the normal, the side it faces along the direction.
 */
export abstract class MachiningFrameSharedDto {
    /**
     * Where the feature starts on the axis, the axis along the normal and the side it faces along the
     * direction. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * A DIN 6885 keyway for `parts.mechanical.machining.keywayTool`: the shaft or bore it is sized for, its length
 * and whether it is milled into the shaft or cut through the hub.
 */
export class KeywayToolDto extends MachiningFrameSharedDto {
    constructor(diameter?: number, length?: number, inHub?: boolean, frame?: Base.Frame) {
        super();
        if (diameter !== undefined) { this.diameter = diameter; }
        if (length !== undefined) { this.length = length; }
        if (inHub !== undefined) { this.inHub = inHub; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shaft's or the bore's diameter in millimetres, which sets the keyway's width and depth.
     * @default 20
     * @minimum 6
     * @exclusiveMinimum true
     * @maximum 65
     * @step 1
     */
    diameter?: number | undefined = 20;
    /**
     * The keyway's length along the axis, in millimetres; in a shaft, end to end of its round ends.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 20;
    /**
     * When true, the straight keyway cut through a hub's bore; when false, the round-ended pocket
     * milled into a shaft.
     * @default false
     */
    inHub?: boolean | undefined = false;
}
/**
 * A body and a DIN 6885 keyway to cut into it, for `parts.mechanical.machining.keyway`.
 */
export class KeywayDto<T> extends KeywayToolDto {
    constructor(shape?: T, diameter?: number, length?: number, inHub?: boolean, frame?: Base.Frame) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (length !== undefined) { this.length = length; }
        if (inHub !== undefined) { this.inHub = inHub; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shaft or the hub to cut.
     * @default undefined
     */
    shape!: T;
}
/**
 * A flat on a round shaft for `parts.mechanical.machining.flatTool`: the shaft's diameter, how deep the flat
 * goes and how long it is.
 */
export class FlatToolDto extends MachiningFrameSharedDto {
    constructor(diameter?: number, depth?: number, length?: number, frame?: Base.Frame) {
        super();
        if (diameter !== undefined) { this.diameter = diameter; }
        if (depth !== undefined) { this.depth = depth; }
        if (length !== undefined) { this.length = length; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shaft's diameter in model units.
     * @default 8
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.5
     */
    diameter?: number | undefined = 8;
    /**
     * How far the flat cuts in from the shaft's surface, in model units, less than the diameter.
     * @default 0.5
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    depth?: number | undefined = 0.5;
    /**
     * The flat's length along the axis, in model units.
     * @default 10
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 10;
}
/**
 * A body and a flat to cut into it, for `parts.mechanical.machining.flat`.
 */
export class FlatDto<T> extends FlatToolDto {
    constructor(shape?: T, diameter?: number, depth?: number, length?: number, frame?: Base.Frame) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (depth !== undefined) { this.depth = depth; }
        if (length !== undefined) { this.length = length; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shaft to cut.
     * @default undefined
     */
    shape!: T;
}
/**
 * The groove a DIN 471 or DIN 472 retaining ring sits in, for `parts.mechanical.machining.ringGrooveTool`.
 */
export class RingGrooveToolDto extends MachiningFrameSharedDto {
    constructor(kind?: Engineering.retainingRingKindEnum, diameter?: number, frame?: Base.Frame) {
        super();
        if (kind !== undefined) { this.kind = kind; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * Whether the groove is in a shaft or in a bore.
     * @default shaft
     */
    kind?: Engineering.retainingRingKindEnum | undefined = Engineering.retainingRingKindEnum.shaft;
    /**
     * The shaft's or the bore's diameter in millimetres, one DIN 471 or DIN 472 lists.
     * @default 20
     * @minimum 3
     * @maximum 100
     * @step 1
     */
    diameter?: number | undefined = 20;
}
/**
 * A body and a retaining ring's groove to cut into it, for `parts.mechanical.machining.ringGroove`.
 */
export class RingGrooveDto<T> extends RingGrooveToolDto {
    constructor(shape?: T, kind?: Engineering.retainingRingKindEnum, diameter?: number, frame?: Base.Frame) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (kind !== undefined) { this.kind = kind; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shaft or the bored body to cut.
     * @default undefined
     */
    shape!: T;
}
/**
 * A DIN 82 knurl on a round shaft, for `parts.mechanical.machining.knurlTool`: the shaft's diameter, the knurl's
 * length, its pitch and its pattern.
 */
export class KnurlToolDto extends MachiningFrameSharedDto {
    constructor(diameter?: number, length?: number, pitch?: number, pattern?: Engineering.knurlPatternEnum, frame?: Base.Frame) {
        super();
        if (diameter !== undefined) { this.diameter = diameter; }
        if (length !== undefined) { this.length = length; }
        if (pitch !== undefined) { this.pitch = pitch; }
        if (pattern !== undefined) { this.pattern = pattern; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shaft's diameter in millimetres; the knurl's crests sit on the nearest diameter its pitch
     * divides evenly.
     * @default 10
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    diameter?: number | undefined = 10;
    /**
     * The knurl's length along the axis, in millimetres. A left, right or diamond knurl's grooves
     * twist through at most 1000 degrees along it.
     * @default 10
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 10;
    /**
     * The distance between grooves round the circumference, one of DIN 82's: 0.5, 0.6, 0.8, 1, 1.2
     * or 1.6 mm.
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
    pattern?: Engineering.knurlPatternEnum | undefined = Engineering.knurlPatternEnum.straight;
}
/**
 * A body and a knurl to cut into it, for `parts.mechanical.machining.knurl`.
 */
export class KnurlDto<T> extends KnurlToolDto {
    constructor(shape?: T, diameter?: number, length?: number, pitch?: number, pattern?: Engineering.knurlPatternEnum, frame?: Base.Frame) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (length !== undefined) { this.length = length; }
        if (pitch !== undefined) { this.pitch = pitch; }
        if (pattern !== undefined) { this.pattern = pattern; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shaft to knurl.
     * @default undefined
     */
    shape!: T;
}
/**
 * A DIN 5480 involute spline, for `parts.mechanical.machining.splinedShaft` and
 * `parts.mechanical.machining.splinedHubTool`: its reference diameter, module and length.
 */
export class SplineDto extends MachiningFrameSharedDto {
    constructor(referenceDiameter?: number, module?: number, length?: number, frame?: Base.Frame) {
        super();
        if (referenceDiameter !== undefined) { this.referenceDiameter = referenceDiameter; }
        if (module !== undefined) { this.module = module; }
        if (length !== undefined) { this.length = length; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The diameter the spline is named by, in millimetres, such as 25 in W 25x1.25x18.
     * @default 25
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    referenceDiameter?: number | undefined = 25;
    /**
     * The module of its teeth, one of DIN 5480's from 0.5 to 10.
     * @default 1.25
     * @minimum 0.5
     * @maximum 10
     * @step 0.25
     */
    module?: number | undefined = 1.25;
    /**
     * The spline's length along the axis, in millimetres.
     * @default 20
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 20;
}
/**
 * A body and a DIN 5480 hub spline to cut through it, for `parts.mechanical.machining.splinedHub`.
 */
export class SplinedHubDto<T> extends SplineDto {
    constructor(shape?: T, referenceDiameter?: number, module?: number, length?: number, frame?: Base.Frame) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (referenceDiameter !== undefined) { this.referenceDiameter = referenceDiameter; }
        if (module !== undefined) { this.module = module; }
        if (length !== undefined) { this.length = length; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The hub to cut.
     * @default undefined
     */
    shape!: T;
}
/**
 * An ISO metric thread modelled on a shank or in a hole, for `parts.mechanical.machining.threadTool`: its size,
 * a fine pitch if wanted, its length and whether it is cut inside a hole.
 */
export class ThreadToolDto {
    constructor(size?: Engineering.metricSizeEnum, pitch?: number, length?: number, internal?: boolean, frame?: Base.Frame) {
        if (size !== undefined) { this.size = size; }
        if (pitch !== undefined) { this.pitch = pitch; }
        if (length !== undefined) { this.length = length; }
        if (internal !== undefined) { this.internal = internal; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The thread size, such as M8; the default is the default screw's and bolt's.
     * @default m3
     */
    size?: Engineering.metricSizeEnum | undefined = Engineering.metricSizeEnum.m3;
    /**
     * The distance from one crest to the next, in millimetres. Left out, the size's coarse pitch.
     * @default undefined
     * @optional true
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.05
     */
    pitch?: number | undefined;
    /**
     * The threaded length along the axis, in millimetres: at most 400 turns of the pitch.
     * @default 10
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 10;
    /**
     * When true, the thread is cut in a hole drilled to the minor diameter, as in a nut; when false,
     * on a shank turned to the nominal.
     * @default false
     */
    internal?: boolean | undefined = false;
    /**
     * Where the thread starts, at a hole's mouth or under a head, its normal out of the part: the
     * thread runs against it. Left out, the ground, facing +Y.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
}
/**
 * A body and an ISO metric thread to cut into it, for `parts.mechanical.machining.thread`.
 */
export class ThreadDto<T> extends ThreadToolDto {
    constructor(shape?: T, size?: Engineering.metricSizeEnum, pitch?: number, length?: number, internal?: boolean, frame?: Base.Frame) {
        super();
        if (shape !== undefined) { this.shape = shape; }
        if (size !== undefined) { this.size = size; }
        if (pitch !== undefined) { this.pitch = pitch; }
        if (length !== undefined) { this.length = length; }
        if (internal !== undefined) { this.internal = internal; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shank or the body with the hole to cut.
     * @default undefined
     */
    shape!: T;
}
