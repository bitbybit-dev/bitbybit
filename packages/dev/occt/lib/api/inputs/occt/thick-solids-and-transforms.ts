// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { joinTypeEnum } from "./enums";

// Threading : Create Surfaces
/**
 * A solid, the faces to remove and a wall thickness for `operations.makeThickSolidByJoin`, which
 * hollows the solid into a shell of that thickness.
 */
export class ThickSolidByJoinDto<T> {
    constructor(shape?: T, shapes?: T[], offset?: number, tolerance?: number, intersection?: boolean, selfIntersection?: boolean, joinType?: joinTypeEnum, removeIntEdges?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (shapes !== undefined) { this.shapes = shapes; }
        if (offset !== undefined) { this.offset = offset; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (intersection !== undefined) { this.intersection = intersection; }
        if (selfIntersection !== undefined) { this.selfIntersection = selfIntersection; }
        if (joinType !== undefined) { this.joinType = joinType; }
        if (removeIntEdges !== undefined) { this.removeIntEdges = removeIntEdges; }
    }
    /**
     * The solid to hollow out.
     * @default undefined
     */
    shape!: T;
    /**
     * The faces of the solid to remove, leaving the openings of the shell.
     * @default undefined
     */
    shapes!: T[];
    /**
     * The wall thickness in model units; negative grows the wall inward.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    offset = 1;
    /**
     * How close two points must be to count as the same when the offset walls are joined, in model
     * units.
     * @default 1.0e-3
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.e-3;
    /**
     * When true, the offset faces are intersected with each other rather than joined by their
     * parallels; the kernel's default is false.
     * @default false
     */
    intersection = false;
    /**
     * Whether the kernel should look for self-intersections in the result; not implemented by the
     * kernel, so leave it false.
     * @default false
     */
    selfIntersection = false;
    /**
     * How the offset walls meet at corners: `arc` rounds them, `intersection` extends them to a
     * sharp corner, `tangent` keeps them tangent.
     * @default arc
     */
    joinType = joinTypeEnum.arc;
    /**
     * When true, the internal edges the offset can leave on the walls are removed from the result.
     * @default false
     */
    removeIntEdges = false;
}
/**
 * A shape and a scale, rotation and translation for `transforms.transform`, applied in that order
 * about the origin.
 */
export class TransformDto<T> {
    constructor(shape?: T, translation?: Base.Vector3, rotationAxis?: Base.Vector3, rotationAngle?: number, scaleFactor?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (translation !== undefined) { this.translation = translation; }
        if (rotationAxis !== undefined) { this.rotationAxis = rotationAxis; }
        if (rotationAngle !== undefined) { this.rotationAngle = rotationAngle; }
        if (scaleFactor !== undefined) { this.scaleFactor = scaleFactor; }
    }
    /**
     * The shape to transform; it stays as it is and a transformed copy comes back.
     * @default undefined
     */
    shape!: T;
    /**
     * The vector the shape moves by, in model units, applied last.
     * @default [0,0,0]
     */
    translation: Base.Vector3 = [0, 0, 0];
    /**
     * The direction of the rotation axis, which passes through the origin.
     * @default [0,1,0]
     */
    rotationAxis: Base.Vector3 = [0, 1, 0];
    /**
     * The rotation about the axis, in degrees, applied after the scale.
     * @default 0
     * @minimum 0
     * @maximum 360
     * @step 1
     */
    rotationAngle = 0;
    /**
     * The uniform scale about the origin, applied first; 1 keeps the size.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    scaleFactor = 1;
}
/**
 * Shapes and one scale, rotation and translation each for `transforms.transformShapes`; all the
 * lists must have the same length.
 */
export class TransformShapesDto<T> {
    constructor(shapes?: T[], translation?: Base.Vector3[], rotationAxes?: Base.Vector3[], rotationDegrees?: number[], scaleFactors?: number[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (translation !== undefined) { this.translations = translation; }
        if (rotationAxes !== undefined) { this.rotationAxes = rotationAxes; }
        if (rotationDegrees !== undefined) { this.rotationAngles = rotationDegrees; }
        if (scaleFactors !== undefined) { this.scaleFactors = scaleFactors; }
    }
    /**
     * The shapes to transform; they stay as they are and transformed copies come back in the same
     * order.
     * @default undefined
     */
    shapes!: T[];
    /**
     * One translation vector per shape, in model units.
     * @default [[0,0,0]]
     */
    translations: Base.Vector3[] = [[0, 0, 0]];
    /**
     * One rotation axis direction per shape, each through the origin.
     * @default [[0,1,0]]
     */
    rotationAxes: Base.Vector3[] = [[0, 1, 0]];
    /**
     * One rotation angle per shape, in degrees.
     * @default [0]
     */
    rotationAngles: number[] = [0];
    /**
     * One uniform scale factor per shape, about the origin.
     * @default [1]
     */
    scaleFactors: number[] = [1];
}
/**
 * A shape and a vector for `transforms.translate`.
 */
export class TranslateDto<T> {
    constructor(shape?: T, translation?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (translation !== undefined) { this.translation = translation; }
    }
    /**
     * The shape to move.
     * @default undefined
     */
    shape!: T;
    /**
     * The vector the shape moves by, in model units.
     * @default [0, 0, 0]
     */
    translation: Base.Vector3 = [0, 0, 0];
}
/**
 * Shapes and one vector each for `transforms.translateShapes`; the two lists must have the same
 * length.
 */
export class TranslateShapesDto<T> {
    constructor(shapes?: T[], translations?: Base.Vector3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (translations !== undefined) { this.translations = translations; }
    }
    /**
     * The shapes to move.
     * @default undefined
     */
    shapes!: T[];
    /**
     * One vector per shape, in model units.
     * @default [[0, 0, 0]]
     */
    translations: Base.Vector3[] = [[0, 0, 0]];
}
/**
 * A shape and two full frames for `transforms.alignNormAndAxis`: the point, normal and axis the
 * shape is taken from, and the point, normal and axis it lands on.
 */
export class AlignNormAndAxisDto<T> {
    constructor(shape?: T, fromOrigin?: Base.Point3, fromNorm?: Base.Vector3, fromAx?: Base.Vector3, toOrigin?: Base.Point3, toNorm?: Base.Vector3, toAx?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (fromOrigin !== undefined) { this.fromOrigin = fromOrigin; }
        if (fromNorm !== undefined) { this.fromNorm = fromNorm; }
        if (fromAx !== undefined) { this.fromAx = fromAx; }
        if (toOrigin !== undefined) { this.toOrigin = toOrigin; }
        if (toNorm !== undefined) { this.toNorm = toNorm; }
        if (toAx !== undefined) { this.toAx = toAx; }
    }
    /**
     * The shape to move.
     * @default undefined
     */
    shape!: T;
    /**
     * The point on the shape that is carried onto `toOrigin`.
     * @default [0, 0, 0]
     */
    fromOrigin: Base.Point3 = [0, 0, 0];
    /**
     * The normal direction at the shape's frame, carried onto `toNorm`.
     * @default [0, 0, 1]
     */
    fromNorm: Base.Vector3 = [1, 0, 0];
    /**
     * An axis direction in the plane of the normal at the shape's frame, carried onto `toAx`; it
     * fixes the spin about the normal.
     * @default [0, 0, 1]
     */
    fromAx: Base.Vector3 = [0, 0, 1];
    /**
     * The point `fromOrigin` lands on.
     * @default [0, 1, 0]
     */
    toOrigin: Base.Point3 = [0, 1, 0];
    /**
     * The direction `fromNorm` lands on.
     * @default [0, 1, 0]
     */
    toNorm: Base.Vector3 = [0, 1, 0];
    /**
     * The direction `fromAx` lands on.
     * @default [0, 0, 1]
     */
    toAx: Base.Vector3 = [0, 1, 0];
}
/**
 * A shape, a point and direction on it, and the point and direction to land on, for
 * `transforms.align`.
 */
export class AlignDto<T> {
    constructor(shape?: T, fromOrigin?: Base.Point3, fromDirection?: Base.Vector3, toOrigin?: Base.Point3, toDirection?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (fromOrigin !== undefined) { this.fromOrigin = fromOrigin; }
        if (fromDirection !== undefined) { this.fromDirection = fromDirection; }
        if (toOrigin !== undefined) { this.toOrigin = toOrigin; }
        if (toDirection !== undefined) { this.toDirection = toDirection; }
    }
    /**
     * The shape to move.
     * @default undefined
     */
    shape!: T;
    /**
     * The point on the shape that is carried onto `toOrigin`.
     * @default [0, 0, 0]
     */
    fromOrigin: Base.Point3 = [0, 0, 0];
    /**
     * The direction at the shape's frame that is carried onto `toDirection`.
     * @default [0, 0, 1]
     */
    fromDirection: Base.Vector3 = [0, 0, 1];
    /**
     * The point `fromOrigin` lands on.
     * @default [0, 1, 0]
     */
    toOrigin: Base.Point3 = [0, 1, 0];
    /**
     * The direction `fromDirection` lands on.
     * @default [0, 1, 0]
     */
    toDirection: Base.Vector3 = [0, 1, 0];
}
/**
 * Shapes and one from and to frame each for `transforms.alignShapes`; all the lists must have the
 * same length.
 */
export class AlignShapesDto<T> {
    constructor(shapes?: T[], fromOrigins?: Base.Vector3[], fromDirections?: Base.Vector3[], toOrigins?: Base.Vector3[], toDirections?: Base.Vector3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (fromOrigins !== undefined) { this.fromOrigins = fromOrigins; }
        if (fromDirections !== undefined) { this.fromDirections = fromDirections; }
        if (toOrigins !== undefined) { this.toOrigins = toOrigins; }
        if (toDirections !== undefined) { this.toDirections = toDirections; }
    }
    /**
     * The shapes to move.
     * @default undefined
     */
    shapes!: T[];
    /**
     * One point per shape that is carried onto the matching `toOrigins` entry.
     * @default [[0, 0, 0]]
     */
    fromOrigins: Base.Point3[] = [[0, 0, 0]];
    /**
     * One direction per shape that is carried onto the matching `toDirections` entry.
     * @default [[0, 0, 1]]
     */
    fromDirections: Base.Vector3[] = [[0, 0, 1]];
    /**
     * One point per shape for its `fromOrigins` entry to land on.
     * @default [[0, 1, 0]]
     */
    toOrigins: Base.Point3[] = [[0, 1, 0]];
    /**
     * One direction per shape for its `fromDirections` entry to land on.
     * @default [[0, 1, 0]]
     */
    toDirections: Base.Vector3[] = [[0, 1, 0]];
}

/**
 * A shape and an axis for `transforms.mirror`, which mirrors the shape across the line through
 * `origin` along `direction`.
 */
export class MirrorDto<T> {
    constructor(shape?: T, origin?: Base.Point3, direction?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (origin !== undefined) { this.origin = origin; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The shape to mirror; it stays as it is and a mirrored copy comes back.
     * @default undefined
     */
    shape!: T;
    /**
     * A point on the mirror axis.
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
    /**
     * The direction of the mirror axis.
     * @default [0, 0, 1]
     */
    direction: Base.Vector3 = [0, 0, 1];
}
/**
 * Shapes and one mirror axis each for `transforms.mirrorShapes`; all the lists must have the same
 * length.
 */
export class MirrorShapesDto<T> {
    constructor(shapes?: T[], origins?: Base.Point3[], directions?: Base.Vector3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (origins !== undefined) { this.origins = origins; }
        if (directions !== undefined) { this.directions = directions; }
    }
    /**
     * The shapes to mirror; they stay as they are and mirrored copies come back in the same order.
     * @default undefined
     */
    shapes!: T[];
    /**
     * One point per shape on its mirror axis.
     * @default [[0, 0, 0]]
     */
    origins: Base.Point3[] = [[0, 0, 0]];
    /**
     * One mirror axis direction per shape.
     * @default [[0, 0, 1]]
     */
    directions: Base.Vector3[] = [[0, 0, 1]];
}
/**
 * A shape and a plane for `transforms.mirrorAlongNormal`, which mirrors the shape across the plane
 * through `origin` with the given normal.
 */
export class MirrorAlongNormalDto<T> {
    constructor(shape?: T, origin?: Base.Point3, normal?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (origin !== undefined) { this.origin = origin; }
        if (normal !== undefined) { this.normal = normal; }
    }
    /**
     * The shape to mirror; it stays as it is and a mirrored copy comes back.
     * @default undefined
     */
    shape!: T;
    /**
     * A point on the mirror plane.
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the mirror plane.
     * @default [0, 0, 1]
     */
    normal: Base.Vector3 = [0, 0, 1];
}
/**
 * Shapes and one mirror plane each for `transforms.mirrorAlongNormalShapes`; all the lists must
 * have the same length.
 */
export class MirrorAlongNormalShapesDto<T> {
    constructor(shapes?: T[], origins?: Base.Point3[], normals?: Base.Vector3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (origins !== undefined) { this.origins = origins; }
        if (normals !== undefined) { this.normals = normals; }
    }
    /**
     * The shapes to mirror; they stay as they are and mirrored copies come back in the same order.
     * @default undefined
     */
    shapes!: T[];
    /**
     * One point per shape on its mirror plane.
     * @default [[0, 0, 0]]
     */
    origins: Base.Point3[] = [[0, 0, 0]];
    /**
     * One mirror plane normal per shape.
     * @default [[0, 0, 1]]
     */
    normals: Base.Vector3[] = [[0, 0, 1]];
}
/**
 * A shape, a direction for its Y axis and a point to move it to, for
 * `transforms.alignAndTranslate`.
 */
export class AlignAndTranslateDto<T> {
    constructor(shape?: T, direction?: Base.Vector3, center?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * The shape to place.
     * @default undefined
     */
    shape!: T;
    /**
     * The direction the shape's Y axis should point along after placing.
     * @default [0, 0, 1]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * The point the shape's origin is moved to, in model units.
     */
    center: Base.Vector3 = [0, 0, 0];
}
/**
 * A shape and what to merge for `shapes.shape.unifySameDomain`, which joins faces and edges that
 * lie on one surface or curve, as booleans leave behind.
 */
export class UnifySameDomainDto<T> {
    constructor(shape?: T, unifyEdges?: boolean, unifyFaces?: boolean, concatBSplines?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (unifyEdges !== undefined) { this.unifyEdges = unifyEdges; }
        if (unifyFaces !== undefined) { this.unifyFaces = unifyFaces; }
        if (concatBSplines !== undefined) { this.concatBSplines = concatBSplines; }
    }
    /**
     * The shape to clean up.
     * @default undefined
     */
    shape!: T;
    /**
     * When true, edges that continue each other on one curve are merged into one.
     * @default true
     */
    unifyEdges = true;
    /**
     * When true, faces that lie on one surface are merged into one.
     * @default true
     */
    unifyFaces = true;
    /**
     * When true, neighboring B-spline edges are joined into a single B-spline where possible.
     * @default true
     */
    concatBSplines = true;
}

/**
 * Faces, points and which groups to keep for `shapes.face.filterFacesPoints`, which sorts each
 * point as inside, on the boundary of or outside each face.
 */
export class FilterFacesPointsDto<T> {
    constructor(shapes?: T[], points?: Base.Point3[], tolerance?: number, useBndBox?: boolean, gapTolerance?: number, keepIn?: boolean, keepOn?: boolean, keepOut?: boolean, keepUnknown?: boolean, flatPointsArray?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (points !== undefined) { this.points = points; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (useBndBox !== undefined) { this.useBndBox = useBndBox; }
        if (gapTolerance !== undefined) { this.gapTolerance = gapTolerance; }
        if (keepIn !== undefined) { this.keepIn = keepIn; }
        if (keepOn !== undefined) { this.keepOn = keepOn; }
        if (keepOut !== undefined) { this.keepOut = keepOut; }
        if (keepUnknown !== undefined) { this.keepUnknown = keepUnknown; }
        if (flatPointsArray !== undefined) { this.flatPointsArray = flatPointsArray; }
    }
    /**
     * The faces to test the points against.
     * @default undefined
     */
    shapes!: T[];
    /**
     * The points to sort.
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * How close to a boundary a point may be to count as on it, in model units.
     * @default 1.0e-4
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.0e-4;
    /**
     * Currently unused: the points are always tested against the face itself.
     * @default false
     */
    useBndBox = false;
    /**
     * Currently unused by the filter.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    gapTolerance = 0.1;
    /**
     * When true, points inside a face are kept.
     * @default true
     */
    keepIn = true;
    /**
     * When true, points on the boundary of a face are kept.
     * @default true
     */
    keepOn = true;
    /**
     * When true, points outside a face are kept.
     * @default false
     */
    keepOut = false;
    /**
     * Currently unused: a point is always inside, on or outside.
     * @default false
     */
    keepUnknown = false;
    /**
     * When true, the kept points of all faces come back in one list; when false, one list per face
     * in the order given.
     * @default true
     */
    flatPointsArray = true;
}
/**
 * A face, points and which groups to keep for `shapes.face.filterFacePoints`, which sorts each
 * point as inside, on the boundary of or outside the face.
 */
export class FilterFacePointsDto<T> {
    constructor(shape?: T, points?: Base.Point3[], tolerance?: number, useBndBox?: boolean, gapTolerance?: number, keepIn?: boolean, keepOn?: boolean, keepOut?: boolean, keepUnknown?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (points !== undefined) { this.points = points; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (useBndBox !== undefined) { this.useBndBox = useBndBox; }
        if (gapTolerance !== undefined) { this.gapTolerance = gapTolerance; }
        if (keepIn !== undefined) { this.keepIn = keepIn; }
        if (keepOn !== undefined) { this.keepOn = keepOn; }
        if (keepOut !== undefined) { this.keepOut = keepOut; }
        if (keepUnknown !== undefined) { this.keepUnknown = keepUnknown; }
    }
    /**
     * The face to test the points against.
     * @default undefined
     */
    shape!: T;
    /**
     * The points to sort.
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * How close to the boundary a point may be to count as on it, in model units.
     * @default 1.0e-4
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.0e-4;
    /**
     * Currently unused: the points are always tested against the face itself.
     * @default false
     */
    useBndBox = false;
    /**
     * Currently unused by the filter.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    gapTolerance = 0.1;
    /**
     * When true, points inside the face are kept.
     * @default true
     */
    keepIn = true;
    /**
     * When true, points on the boundary of the face are kept.
     * @default true
     */
    keepOn = true;
    /**
     * When true, points outside the face are kept.
     * @default false
     */
    keepOut = false;
    /**
     * Currently unused: a point is always inside, on or outside.
     * @default false
     */
    keepUnknown = false;
}
/**
 * A solid, points and which groups to keep for `shapes.solid.filterSolidPoints`, which sorts each
 * point as inside the solid, on its surface, outside it or unknown.
 */
export class FilterSolidPointsDto<T> {
    constructor(shape?: T, points?: Base.Point3[], tolerance?: number, keepIn?: boolean, keepOn?: boolean, keepOut?: boolean, keepUnknown?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (points !== undefined) { this.points = points; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (keepIn !== undefined) { this.keepIn = keepIn; }
        if (keepOn !== undefined) { this.keepOn = keepOn; }
        if (keepOut !== undefined) { this.keepOut = keepOut; }
        if (keepUnknown !== undefined) { this.keepUnknown = keepUnknown; }
    }
    /**
     * The solid to test the points against.
     * @default undefined
     */
    shape!: T;
    /**
     * The points to sort.
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * How close to the surface a point may be to count as on it, in model units.
     * @default 1.0e-4
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.0e-4;
    /**
     * When true, points inside the solid are kept.
     * @default true
     */
    keepIn = true;
    /**
     * When true, points on the surface of the solid are kept.
     * @default true
     */
    keepOn = true;
    /**
     * When true, points outside the solid are kept.
     * @default false
     */
    keepOut = false;
    /**
     * When true, points the kernel could not classify are kept.
     * @default false
     */
    keepUnknown = false;
}
/**
 * Shapes and one direction and point each for `transforms.alignAndTranslateShapes`; all the lists
 * must have the same length.
 */
export class AlignAndTranslateShapesDto<T> {
    constructor(shapes?: T[], directions?: Base.Vector3[], centers?: Base.Vector3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (directions !== undefined) { this.directions = directions; }
        if (centers !== undefined) { this.centers = centers; }
    }
    /**
     * The shapes to place.
     * @default undefined
     */
    shapes!: T[];
    /**
     * One direction per shape for its Y axis to point along.
     * @default [0, 0, 1]
     */
    directions: Base.Vector3[] = [[0, 1, 0]];
    /**
     * One point per shape for its origin to move to, in model units.
     */
    centers: Base.Vector3[] = [[0, 0, 0]];
}
/**
 * A shape, an axis through the origin and an angle for `transforms.rotate`.
 */
export class RotateDto<T> {
    constructor(shape?: T, axis?: Base.Vector3, angle?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (axis !== undefined) { this.axis = axis; }
        if (angle !== undefined) { this.angle = angle; }
    }
    /**
     * The shape to rotate; it stays as it is and a rotated copy comes back.
     * @default undefined
     */
    shape!: T;
    /**
     * The direction of the rotation axis, which passes through the origin.
     * @default [0, 0, 1]
     */
    axis: Base.Vector3 = [0, 0, 1];
    /**
     * The rotation in degrees, following the right-hand rule about the axis.
     * @default 0
     * @minimum 0
     * @maximum 360
     * @step 1
     */
    angle = 0;
}
/**
 * A shape, an angle, a center and an axis for `transforms.rotateAroundCenter`, which rotates about
 * the axis through the center.
 */
export class RotateAroundCenterDto<T> {
    constructor(shape?: T, angle?: number, center?: Base.Point3, axis?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (angle !== undefined) { this.angle = angle; }
        if (center !== undefined) { this.center = center; }
        if (axis !== undefined) { this.axis = axis; }
    }
    /**
     * The shape to rotate; it stays as it is and a rotated copy comes back.
     * @default undefined
     */
    shape!: T;
    /**
     * The rotation in degrees, following the right-hand rule about the axis.
     * @default 0
     */
    angle = 0;
    /**
     * The point the rotation axis passes through.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The direction of the rotation axis.
     * @default [0, 0, 1]
     */
    axis: Base.Vector3 = [0, 0, 1];
}
/**
 * Shapes and one axis and angle each for `transforms.rotateShapes`; all the lists must have the
 * same length.
 */
export class RotateShapesDto<T> {
    constructor(shapes?: T[], axes?: Base.Vector3[], angles?: number[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (axes !== undefined) { this.axes = axes; }
        if (angles !== undefined) { this.angles = angles; }
    }
    /**
     * The shapes to rotate; they stay as they are and rotated copies come back in the same order.
     * @default undefined
     */
    shapes!: T[];
    /**
     * One rotation axis direction per shape, each through the origin.
     * @default [[0, 0, 1]]
     */
    axes: Base.Vector3[] = [[0, 0, 1]];
    /**
     * One rotation angle per shape, in degrees.
     * @default [0]
     */
    angles: number[] = [0];
}
/**
 * Shapes and one angle, center and axis each for `transforms.rotateAroundCenterShapes`; all the
 * lists must have the same length.
 */
export class RotateAroundCenterShapesDto<T> {
    constructor(shapes?: T[], angles?: number[], centers?: Base.Point3[], axes?: Base.Vector3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (angles !== undefined) { this.angles = angles; }
        if (centers !== undefined) { this.centers = centers; }
        if (axes !== undefined) { this.axes = axes; }
    }
    /**
     * The shapes to rotate; they stay as they are and rotated copies come back in the same order.
     * @default undefined
     */
    shapes!: T[];
    /**
     * One rotation angle per shape, in degrees.
     * @default [0]
     */
    angles = [0];
    /**
     * One point per shape for its rotation axis to pass through.
     * @default [[0, 0, 0]]
     */
    centers: Base.Point3[] = [[0, 0, 0]];
    /**
     * One rotation axis direction per shape.
     * @default [[0, 0, 1]]
     */
    axes: Base.Vector3[] = [[0, 0, 1]];
}
/**
 * A shape and a factor for `transforms.scale`, which scales uniformly about the origin.
 */
export class ScaleDto<T> {
    constructor(shape?: T, factor?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (factor !== undefined) { this.factor = factor; }
    }
    /**
     * The shape to scale; it stays as it is and a scaled copy comes back.
     * @default undefined
     */
    shape!: T;
    /**
     * The uniform scale factor; 2 doubles every size, 0.5 halves it.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    factor = 1;
}
/**
 * Shapes and one factor each for `transforms.scaleShapes`; the two lists must have the same length.
 */
export class ScaleShapesDto<T> {
    constructor(shapes?: T[], factors?: number[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (factors !== undefined) { this.factors = factors; }
    }
    /**
     * The shapes to scale; they stay as they are and scaled copies come back in the same order.
     * @default undefined
     */
    shapes!: T[];
    /**
     * One uniform scale factor per shape, about the origin.
     * @default [1]
     */
    factors: number[] = [1];
}
/**
 * A shape, three factors and a center for `transforms.scale3d`, which scales each axis on its own
 * about the center.
 */
export class Scale3DDto<T> {
    constructor(shape?: T, scale?: Base.Vector3, center?: Base.Point3) {
        if (shape !== undefined) { this.shape = shape; }
        if (scale !== undefined) { this.scale = scale; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * The shape to scale.
     * @default undefined
     */
    shape!: T;
    /**
     * The factors along X, Y and Z; unequal factors stretch the shape.
     * @default [1, 1, 1]
     */
    scale: Base.Vector3 = [1, 1, 1];
    /**
     * The point that stays in place while everything else scales away from or toward it.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
}
/**
 * Shapes and one factor triple and center each for `transforms.scale3dShapes`; all the lists must
 * have the same length.
 */
export class Scale3DShapesDto<T> {
    constructor(shapes?: T[], scales?: Base.Vector3[], centers?: Base.Point3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (scales !== undefined) { this.scales = scales; }
        if (centers !== undefined) { this.centers = centers; }
    }
    /**
     * The shapes to scale.
     * @default undefined
     */
    shapes!: T[];
    /**
     * One set of X, Y and Z factors per shape.
     * @default [[1, 1, 1]]
     */
    scales: Base.Vector3[] = [[1, 1, 1]];
    /**
     * One point per shape that stays in place while it scales.
     * @default [[0, 0, 0]]
     */
    centers: Base.Point3[] = [[0, 0, 0]];
}
// Matrices are flat 16-number arrays in COLUMN-MAJOR order (Base.TransformMatrix),
// matching glTF/WebGL, Babylon/Three and the matrix returned by getLabelTransform.
// A point transforms as p' = M * p; a list (Base.TransformMatrixes) is applied in
// order (first matrix first).
/**
 * A shape and a matrix, or a list of matrices, for `transforms.transformByMatrix`.
 */
export class TransformByMatrixDto<T> {
    constructor(shape?: T, transformation?: Base.TransformMatrix | Base.TransformMatrixes) {
        if (shape !== undefined) { this.shape = shape; }
        if (transformation !== undefined) { this.transformation = transformation; }
    }
    /**
     * The shape to transform; it stays as it is and a transformed copy comes back.
     * @default undefined
     */
    shape!: T;
    /**
     * A 4x4 column-major matrix of 16 numbers, or a list of them applied first to last as one
     * combined move.
     * @default undefined
     */
    transformation!: Base.TransformMatrix | Base.TransformMatrixes;
}
/**
 * Shapes and one matrix, or list of matrices, applied to all of them for
 * `transforms.transformShapesByMatrix`.
 */
export class TransformShapesByMatrixDto<T> {
    constructor(shapes?: T[], transformation?: Base.TransformMatrix | Base.TransformMatrixes) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (transformation !== undefined) { this.transformation = transformation; }
    }
    /**
     * The shapes to transform, all with the same matrix.
     * @default undefined
     */
    shapes!: T[];
    /**
     * A 4x4 column-major matrix of 16 numbers, or a list of them applied first to last as one
     * combined move.
     * @default undefined
     */
    transformation!: Base.TransformMatrix | Base.TransformMatrixes;
}
/**
 * A shape for `transforms.getShapeTransform`, which reads the placement the shape carries.
 */
export class ShapeTransformQueryDto<T> {
    constructor(shape?: T) {
        if (shape !== undefined) { this.shape = shape; }
    }
    /**
     * The shape whose placement is read.
     * @default undefined
     */
    shape!: T;
}
/**
 * A shape, a factor and a center for `transforms.scaleFromCenter`, which scales uniformly about the
 * center.
 */
export class ScaleFromCenterDto<T> {
    constructor(shape?: T, factor?: number, center?: Base.Point3) {
        if (shape !== undefined) { this.shape = shape; }
        if (factor !== undefined) { this.factor = factor; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * The shape to scale; it stays as it is and a scaled copy comes back.
     * @default undefined
     */
    shape!: T;
    /**
     * The uniform scale factor; 2 doubles every size, 0.5 halves it.
     * @default 1
     * @step 0.1
     */
    factor = 1;
    /**
     * The point that stays in place while everything else scales away from or toward it.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
}
/**
 * A shape and a point for `transforms.mirrorAboutPoint`, which mirrors the shape through the point.
 */
export class MirrorAboutPointDto<T> {
    constructor(shape?: T, point?: Base.Point3) {
        if (shape !== undefined) { this.shape = shape; }
        if (point !== undefined) { this.point = point; }
    }
    /**
     * The shape to mirror; it stays as it is and a mirrored copy comes back.
     * @default undefined
     */
    shape!: T;
    /**
     * The point every part of the shape is mirrored through.
     * @default [0, 0, 0]
     */
    point: Base.Point3 = [0, 0, 0];
}
/**
 * A shape and a quaternion for `transforms.rotateByQuaternion`, which rotates the shape about the
 * origin.
 */
export class RotateByQuaternionDto<T> {
    constructor(shape?: T, quaternion?: [number, number, number, number]) {
        if (shape !== undefined) { this.shape = shape; }
        if (quaternion !== undefined) { this.quaternion = quaternion; }
    }
    /**
     * The shape to rotate; it stays as it is and a rotated copy comes back.
     * @default undefined
     */
    shape!: T;
    /**
     * The rotation as `[x, y, z, w]`; it is normalized before use, and `[0, 0, 0, 1]` is no
     * rotation.
     * @default [0, 0, 0, 1]
     */
    quaternion: [number, number, number, number] = [0, 0, 0, 1];
}
/**
 * A translation, Euler rotation and uniform scale for `transforms.composeTransform`, combined into
 * one matrix as scale, then rotation, then translation.
 */
export class ComposeTransformDto {
    constructor(translation?: Base.Vector3, rotation?: Base.Vector3, scale?: number) {
        if (translation !== undefined) { this.translation = translation; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (scale !== undefined) { this.scale = scale; }
    }
    /**
     * The move as `[x, y, z]`, in model units, applied last.
     * @default [0, 0, 0]
     */
    translation: Base.Vector3 = [0, 0, 0];
    /**
     * Euler angles `[rx, ry, rz]` in degrees about the X, Y and Z axes; the Z turn is applied
     * first, then Y, then X.
     * @default [0, 0, 0]
     */
    rotation: Base.Vector3 = [0, 0, 0];
    /**
     * The uniform scale about the origin, applied first; 1 keeps the size.
     * @default 1
     * @step 0.1
     */
    scale = 1;
}
/**
 * A matrix, or a list of matrices, for `transforms.multiplyTransforms`, which folds them into one.
 */
export class MultiplyTransformsDto {
    constructor(transformation?: Base.TransformMatrix | Base.TransformMatrixes) {
        if (transformation !== undefined) { this.transformation = transformation; }
    }
    /**
     * A 4x4 column-major matrix, or a list of them applied first to last; an empty list gives the
     * identity.
     * @default undefined
     */
    transformation!: Base.TransformMatrix | Base.TransformMatrixes;
}
/**
 * A matrix for `transforms.invertTransform`, which builds the transform that undoes it.
 */
export class InvertTransformDto {
    constructor(transformation?: Base.TransformMatrix) {
        if (transformation !== undefined) { this.transformation = transformation; }
    }
    /**
     * The 4x4 column-major matrix of 16 numbers to invert.
     * @default undefined
     */
    transformation!: Base.TransformMatrix;
}
/**
 * A vector for `transforms.translationToMatrix`, which builds the matrix of that move.
 */
export class TranslationToMatrixDto {
    constructor(translation?: Base.Vector3) {
        if (translation !== undefined) { this.translation = translation; }
    }
    /**
     * The move as `[x, y, z]`, in model units.
     * @default [0, 0, 0]
     */
    translation: Base.Vector3 = [0, 0, 0];
}
/**
 * An axis, an angle and an optional center for `transforms.rotationAxisAngleToMatrix`.
 */
export class RotationAxisAngleToMatrixDto {
    constructor(axis?: Base.Vector3, angle?: number, center?: Base.Point3) {
        if (axis !== undefined) { this.axis = axis; }
        if (angle !== undefined) { this.angle = angle; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * The direction of the rotation axis.
     * @default [0, 0, 1]
     */
    axis: Base.Vector3 = [0, 0, 1];
    /**
     * The rotation in degrees, following the right-hand rule about the axis.
     * @default 0
     * @step 1
     */
    angle = 0;
    /**
     * The point the axis passes through; the origin when left at its default.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
}
/**
 * A factor and an optional center for `transforms.scaleUniformToMatrix`.
 */
export class ScaleUniformToMatrixDto {
    constructor(factor?: number, center?: Base.Point3) {
        if (factor !== undefined) { this.factor = factor; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * The uniform scale factor; 2 doubles every size, 0.5 halves it.
     * @default 1
     * @step 0.1
     */
    factor = 1;
    /**
     * The point that stays in place while everything else scales; the origin when left at its
     * default.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
}
/**
 * A point for `transforms.mirrorPointToMatrix`, the matrix of a mirror through that point.
 */
export class MirrorPointToMatrixDto {
    constructor(point?: Base.Point3) {
        if (point !== undefined) { this.point = point; }
    }
    /**
     * The point every part of a shape is mirrored through.
     * @default [0, 0, 0]
     */
    point: Base.Point3 = [0, 0, 0];
}
/**
 * An axis for `transforms.mirrorAxisToMatrix`, the matrix of a mirror across the line through
 * `origin` along `direction`.
 */
export class MirrorAxisToMatrixDto {
    constructor(origin?: Base.Point3, direction?: Base.Vector3) {
        if (origin !== undefined) { this.origin = origin; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * A point on the mirror axis.
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
    /**
     * The direction of the mirror axis; any length will do, but not a zero vector.
     * @default [1, 0, 0]
     */
    direction: Base.Vector3 = [1, 0, 0];
}
/**
 * A plane for `transforms.mirrorPlaneToMatrix`, the matrix of a mirror across the plane through
 * `origin` with the given normal.
 */
export class MirrorPlaneToMatrixDto {
    constructor(origin?: Base.Point3, normal?: Base.Vector3) {
        if (origin !== undefined) { this.origin = origin; }
        if (normal !== undefined) { this.normal = normal; }
    }
    /**
     * A point on the mirror plane.
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the mirror plane; any length will do, but not a zero vector.
     * @default [0, 0, 1]
     */
    normal: Base.Vector3 = [0, 0, 1];
}
/**
 * A quaternion for `transforms.quaternionToMatrix`, which builds the matrix of that rotation.
 */
export class QuaternionToMatrixDto {
    constructor(quaternion?: [number, number, number, number]) {
        if (quaternion !== undefined) { this.quaternion = quaternion; }
    }
    /**
     * The rotation as `[x, y, z, w]`; it is normalized before use, and `[0, 0, 0, 1]` is no
     * rotation.
     * @default [0, 0, 0, 1]
     */
    quaternion: [number, number, number, number] = [0, 0, 0, 1];
}
/**
 * Decomposed placement transform of a shape or label.
 * `matrix` is a flat 16-number 4x4 in column-major order.
 */
export interface ShapeTransformInfo {
    matrix: Base.TransformMatrix;
    translation: Base.Point3;
    quaternion: [number, number, number, number];
    scale: number;
}
