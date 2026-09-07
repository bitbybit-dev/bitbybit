// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";
import { manifoldJoinTypeEnum } from "./pointers-and-enums";

export class CrossSectionDto<T> {
    constructor(crossSection?: T) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
    }
    /**
     * Cross section
     */
    crossSection!: T;
}
export class CrossSectionsDto<T> {
    constructor(crossSections?: T[]) {
        if (crossSections !== undefined) { this.crossSections = crossSections; }
    }
    /**
     * Cross sections
     */
    crossSections!: T[];
}
export class ExtrudeDto<T> {
    constructor(crossSection?: T) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
    }
    /**
     * Extrude cross section shape
     */
    crossSection!: T;
    /**
     * Height of the extrusion
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Number of divisions
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    nDivisions = 1;
    /**
     * Twist degrees
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    twistDegrees = 0;
    /**
     * Scale top
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    scaleTopX = 1;
    /**
     * Scale top
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    scaleTopY = 1;
    /**
     * Center the extrusion
     * @default true
    */
    center = true;
}

export class RevolveDto<T> {
    constructor(crossSection?: T, revolveDegrees?: number, matchProfile?: boolean, circularSegments?: number) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (revolveDegrees !== undefined) { this.revolveDegrees = revolveDegrees; }
        if (matchProfile !== undefined) { this.matchProfile = matchProfile; }
        if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
    }
    /**
     * Revolve cross section shape
     */
    crossSection!: T;
    /**
     * Extrude cross section shape
     * @default 360
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    revolveDegrees: number = 360;
    /**
     * Default manifold library will adjust profile when generating revolved shape. We prefer it to be matching the profile by default. Set to false to use default manifold library behavior.
     * @default true
     */
    matchProfile = true;
    /**
     * Circular segments
     * @default 32
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    circularSegments = 32;
}
export class OffsetDto<T> {
    constructor(crossSection?: T, delta?: number, joinType?: manifoldJoinTypeEnum, miterLimit?: number, circularSegments?: number) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (delta !== undefined) { this.delta = delta; }
        if (joinType !== undefined) { this.joinType = joinType; }
        if (miterLimit !== undefined) { this.miterLimit = miterLimit; }
        if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
    }
    /**
     * Revolve cross section shape
     */
    crossSection!: T;
    /**
     * Positive deltas will cause the expansion of outlining contours
     * to expand, and retraction of inner (hole) contours. Negative deltas will
     * have the opposite effect.
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    delta: number = 1;
    /**
     * The join type specifying the treatment of contour joins
     * (corners).
     * @default round
     */
    joinType: manifoldJoinTypeEnum = manifoldJoinTypeEnum.round;
    /**
     * The maximum distance in multiples of delta that vertices
     * can be offset from their original positions with before squaring is
     * applied, **when the join type is Miter** (default is 2, which is the
     * minimum allowed). See the [Clipper2
     * MiterLimit](http://www.angusj.com/clipper2/Docs/Units/Clipper.Offset/Classes/ClipperOffset/Properties/MiterLimit.htm)
     * page for a visual example.
     * @default 2
     * @minimum 2
     * @maximum Infinity
     * @step 0.1
     */
    miterLimit = 2;
    /**
     * Number of segments per 360 degrees of
     * <B>JoinType::Round</B> corners (roughly, the number of vertices that
     * will be added to each contour). Default is calculated by the static Quality
     * defaults according to the radius.
     * @default 32
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    circularSegments = 32;
}

export class SimplifyDto<T> {
    constructor(crossSection?: T, epsilon?: number) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (epsilon !== undefined) { this.epsilon = epsilon; }
    }
    /**
     * Revolve cross section shape
     */
    crossSection!: T;
    /**
     * Extrude cross section shape
     * @default 1e-6
     * @minimum 0
     * @maximum Infinity
     * @step 1e-7
     */
    epsilon = 1e-6;
}

export class ComposeDto<T> {
    constructor(polygons?: T) {
        if (polygons !== undefined) { this.polygons = polygons; }
    }
    /**
     * Polygons to compose
     */
    polygons!: T;
}
export class MirrorCrossSectionDto<T> {
    constructor(crossSection?: T, normal?: Base.Vector2) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (normal !== undefined) { this.normal = normal; }
    }
    /**
     * Manifold shape
     */
    crossSection!: T;
    /**
     * The normal vector of the plane to be mirrored over
     * @default [1,0]
     */
    normal: Base.Vector2 = [1, 0];
}
export class Scale2DCrossSectionDto<T> {
    constructor(crossSection?: T, vector?: Base.Vector2) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (vector !== undefined) { this.vector = vector; }
    }
    /**
     * Manifold shape
     */
    crossSection!: T;
    /**
     * The normal vector of the plane to be mirrored over
     * @default [2,2]
     */
    vector: Base.Vector2 = [2, 2];
}
export class TranslateCrossSectionDto<T> {
    constructor(crossSection?: T, vector?: Base.Vector2) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (vector !== undefined) { this.vector = vector; }
    }
    /**
     * Manifold shape
     */
    crossSection!: T;
    /**
     * The translation vector
     * @default undefined
     */
    vector!: Base.Vector2;
}
export class RotateCrossSectionDto<T> {
    constructor(crossSection?: T, degrees?: number) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (degrees !== undefined) { this.degrees = degrees; }
    }
    /**
     * Manifold shape
     */
    crossSection!: T;
    /**
     * The rotation vector in eulers
     * @default 45
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    degrees: number = 45;
}
export class ScaleCrossSectionDto<T> {
    constructor(crossSection?: T, factor?: number) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (factor !== undefined) { this.factor = factor; }
    }
    /**
     * Manifold shape
     */
    crossSection!: T;
    /**
     * The normal vector of the plane to be mirrored over
     * @default 2
     */
    factor = 2;
}
export class TranslateXYCrossSectionDto<T> {
    constructor(crossSection?: T, x?: number, y?: number) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (x !== undefined) { this.x = x; }
        if (y !== undefined) { this.y = y; }
    }
    /**
     * Manifold shape
     */
    crossSection!: T;
    /**
     * The translation X axis
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    x = 0;
    /**
     * The translation Y axis
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    y = 0;
}

export class TransformCrossSectionDto<T> {
    constructor(crossSection?: T, transform?: Base.TransformMatrix3x3) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (transform !== undefined) { this.transform = transform; }
    }
    /**
     * Cross section
     */
    crossSection!: T;
    /**
     * The transform matrix to apply
     * @default undefined
     */
    transform!: Base.TransformMatrix3x3;
}
export class CrossSectionWarpDto<T> {
    constructor(crossSection?: T, warpFunc?: (vert: Base.Vector2) => void) {
        if (crossSection !== undefined) { this.crossSection = crossSection; }
        if (warpFunc !== undefined) { this.warpFunc = warpFunc; }
    }
    /**
     * Cross section
     */
    crossSection!: T;
    /**
     * A function that modifies a given vertex position
     * @default undefined
     */
    warpFunc!: (vert: Base.Vector2) => void;
}
