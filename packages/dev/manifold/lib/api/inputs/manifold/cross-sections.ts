// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";
import { manifoldJoinTypeEnum } from "./pointers-and-enums";

/**
 * One cross-section for the methods that take nothing else, such as `crossSection.evaluate.area` or
 * `crossSection.operations.hull`.
 */
export class CrossSectionDto<T> {
    constructor(crossSection?: T) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
    }
    /**
     * The cross-section to work on; it is not changed.
     */
    crossSection!: T;
}
/**
 * Several cross-sections for the methods that take a list, such as `crossSection.booleans.union`.
 */
export class CrossSectionsDto<T> {
    constructor(crossSections?: T[]) {
        if (crossSections !== undefined) { this.crossSections = crossSections; }
    }
    /**
     * The cross-sections, in the order the method uses them.
     */
    crossSections!: T[];
}
/**
 * A cross-section and the sweep settings for `crossSection.operations.extrude`, which grows it
 * along Z into a solid.
 */
export class ExtrudeDto<T> {
    constructor(crossSection?: T) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
    }
    /**
     * The flat outline to extrude.
     */
    crossSection!: T;
    /**
     * How far the outline is swept along Z, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * How many extra copies of the outline are inserted along the way; more keeps a twist or taper
     * smooth.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    nDivisions = 1;
    /**
     * How far the top is turned against the bottom, in degrees.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    twistDegrees = 0;
    /**
     * How much the top is scaled along X; 1 keeps it, 0 with `scaleTopY` at 0 makes a cone.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    scaleTopX = 1;
    /**
     * How much the top is scaled along Y; 1 keeps it, 0 with `scaleTopX` at 0 makes a cone.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    scaleTopY = 1;
    /**
     * When true, the solid is centered on the XY plane; when false it stands on it.
     * @default true
     */
    center = true;
}

/**
 * A cross-section and the turn settings for `crossSection.operations.revolve`, which spins it into
 * a solid.
 */
export class RevolveDto<T> {
    constructor(crossSection?: T, revolveDegrees?: number, matchProfile?: boolean, circularSegments?: number) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (revolveDegrees !== undefined) { this.revolveDegrees = revolveDegrees; }
        if (matchProfile !== undefined) { this.matchProfile = matchProfile; }
        if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
    }
    /**
     * The flat profile to spin; only the part on the positive X side is used.
     */
    crossSection!: T;
    /**
     * How far to spin, in degrees; 360 gives a full turn.
     * @default 360
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    revolveDegrees: number = 360;
    /**
     * When true, the result is turned back to keep the profile's orientation; when false it stands
     * along Z as the kernel makes it.
     * @default true
     */
    matchProfile = true;
    /**
     * How many segments go around the turn; more is rounder.
     * @default 32
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    circularSegments = 32;
}
/**
 * A cross-section and the offset settings for `crossSection.operations.offset`.
 */
export class OffsetDto<T> {
    constructor(crossSection?: T, delta?: number, joinType?: manifoldJoinTypeEnum, miterLimit?: number, circularSegments?: number) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (delta !== undefined) { this.delta = delta; }
        if (joinType !== undefined) { this.joinType = joinType; }
        if (miterLimit !== undefined) { this.miterLimit = miterLimit; }
        if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
    }
    /**
     * The outline to offset.
     */
    crossSection!: T;
    /**
     * How far the outline moves, in model units: positive grows outer contours and shrinks holes,
     * negative does the opposite.
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    delta: number = 1;
    /**
     * How corners are treated: `round`, `square`, `miter` or `bevel`.
     * @default round
     */
    joinType: manifoldJoinTypeEnum = manifoldJoinTypeEnum.round;
    /**
     * For `miter` joins, how far a corner may reach as a multiple of `delta` before it is squared
     * off; 2 is the smallest allowed.
     * @default 2
     * @minimum 2
     * @maximum Infinity
     * @step 0.1
     */
    miterLimit = 2;
    /**
     * For `round` joins, how many segments a full circle of rounding gets.
     * @default 32
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    circularSegments = 32;
}

/**
 * A cross-section and a distance for `crossSection.operations.simplify`.
 */
export class SimplifyDto<T> {
    constructor(crossSection?: T, epsilon?: number) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (epsilon !== undefined) { this.epsilon = epsilon; }
    }
    /**
     * The outline to simplify.
     */
    crossSection!: T;
    /**
     * Points closer than this, in model units, to the line between their neighbors are dropped.
     * @default 1e-6
     * @minimum 0
     * @maximum Infinity
     * @step 1e-7
     */
    epsilon = 1e-6;
}

/**
 * Cross-sections or polygons for `crossSection.operations.compose`, which packs them into one
 * cross-section.
 */
export class ComposeDto<T> {
    constructor(polygons?: T) {
        if (polygons !== undefined) { this.polygons = polygons; }
    }
    /**
     * The cross-sections or polygons to pack together.
     */
    polygons!: T;
}
/**
 * A cross-section and a direction for `crossSection.transforms.mirror`.
 */
export class MirrorCrossSectionDto<T> {
    constructor(crossSection?: T, normal?: Base.Vector2) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (normal !== undefined) { this.normal = normal; }
    }
    /**
     * The outline to mirror.
     */
    crossSection!: T;
    /**
     * The normal of the mirror line through the origin; `[1, 0]` mirrors left to right.
     * @default [1,0]
     */
    normal: Base.Vector2 = [1, 0];
}
/**
 * A cross-section and two factors for `crossSection.transforms.scale2D`.
 */
export class Scale2DCrossSectionDto<T> {
    constructor(crossSection?: T, vector?: Base.Vector2) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (vector !== undefined) { this.vector = vector; }
    }
    /**
     * The outline to scale.
     */
    crossSection!: T;
    /**
     * The factors along X and Y, about the origin; 1 keeps an axis as it is.
     * @default [2,2]
     */
    vector: Base.Vector2 = [2, 2];
}
/**
 * A cross-section and a vector for `crossSection.transforms.translate`.
 */
export class TranslateCrossSectionDto<T> {
    constructor(crossSection?: T, vector?: Base.Vector2) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (vector !== undefined) { this.vector = vector; }
    }
    /**
     * The outline to move.
     */
    crossSection!: T;
    /**
     * The 2D vector the outline moves by, in model units.
     * @default undefined
     */
    vector!: Base.Vector2;
}
/**
 * A cross-section and an angle for `crossSection.transforms.rotate`.
 */
export class RotateCrossSectionDto<T> {
    constructor(crossSection?: T, degrees?: number) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (degrees !== undefined) { this.degrees = degrees; }
    }
    /**
     * The outline to rotate.
     */
    crossSection!: T;
    /**
     * The rotation about the origin, in degrees, counterclockwise.
     * @default 45
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    degrees: number = 45;
}
/**
 * A cross-section and a factor for `crossSection.transforms.scale`.
 */
export class ScaleCrossSectionDto<T> {
    constructor(crossSection?: T, factor?: number) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (factor !== undefined) { this.factor = factor; }
    }
    /**
     * The outline to scale.
     */
    crossSection!: T;
    /**
     * The uniform scale about the origin; 2 doubles every size.
     * @default 2
     */
    factor = 2;
}
/**
 * A cross-section and two distances for `crossSection.transforms.translateXY`.
 */
export class TranslateXYCrossSectionDto<T> {
    constructor(crossSection?: T, x?: number, y?: number) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (x !== undefined) { this.x = x; }
        if (y !== undefined) { this.y = y; }
    }
    /**
     * The outline to move.
     */
    crossSection!: T;
    /**
     * How far to move along X, in model units.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    x = 0;
    /**
     * How far to move along Y, in model units.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    y = 0;
}

/**
 * A cross-section and a 3x3 matrix for `crossSection.transforms.transform`.
 */
export class TransformCrossSectionDto<T> {
    constructor(crossSection?: T, transform?: Base.TransformMatrix3x3) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (transform !== undefined) { this.transform = transform; }
    }
    /**
     * The outline to transform.
     */
    crossSection!: T;
    /**
     * The 3x3 matrix as 9 numbers, any combination of move, turn, scale and shear in the plane.
     * @default undefined
     */
    transform!: Base.TransformMatrix3x3;
}
/**
 * A cross-section and a function for `crossSection.transforms.warp`.
 */
export class CrossSectionWarpDto<T> {
    constructor(crossSection?: T, warpFunc?: (vert: Base.Vector2) => void) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (warpFunc !== undefined) { this.warpFunc = warpFunc; }
    }
    /**
     * The outline to warp.
     */
    crossSection!: T;
    /**
     * A function that receives each 2D point and changes it in place.
     * @default undefined
     */
    warpFunc!: (vert: Base.Vector2) => void;
}
