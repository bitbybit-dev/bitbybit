// A fragment of the OCCT inputs namespace: scripts/gen-occ-inputs.mjs assembles every file in this
// directory, in file-name order, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { joinTypeEnum } from "./02-enums";

// Threading : Create Surfaces
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
     * Shape to make thick
     * @default undefined
     */
    shape!: T;
    /**
     * closing faces
     * @default undefined
     */
    shapes!: T[];
    /**
     * Offset to apply
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    offset = 1;
    /**
     * Tolerance defines the tolerance criterion for coincidence in generated shapes
     * @default 1.0e-3
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.e-3;
    /**
     * if Intersection is false (default value), the intersection is calculated with the parallels to the two adjacent shapes
     * @default false
     */
    intersection = false;
    /**
     * SelfInter tells the algorithm whether a computation to eliminate self-intersections needs to be applied to the resulting shape. However, as this functionality is not yet implemented, you should use the default value (false)
     * @default false
     */
    selfIntersection = false;
    /**
     * Join defines how to fill the holes that may appear between parallels to the two adjacent faces. It may take values GeomAbs_Arc or GeomAbs_Intersection:
     * if Join is equal to GeomAbs_Arc, then pipes are generated between two free edges of two adjacent parallels, and spheres are generated on "images" of vertices; it is the default value
     * @default arc
    */
    joinType = joinTypeEnum.arc;
    /**
     * if Join is equal to GeomAbs_Intersection, then the parallels to the two adjacent faces are enlarged and intersected, so that there are no free edges on parallels to faces. RemoveIntEdges flag defines whether to remove the INTERNAL edges from the result or not. Warnings Since the algorithm of MakeThickSolid is based on MakeOffsetShape algorithm, the warnings are the same as for MakeOffsetShape.
     * @default false
     */
    removeIntEdges = false;
}
export class TransformDto<T> {
    constructor(shape?: T, translation?: Base.Vector3, rotationAxis?: Base.Vector3, rotationAngle?: number, scaleFactor?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (translation !== undefined) { this.translation = translation; }
        if (rotationAxis !== undefined) { this.rotationAxis = rotationAxis; }
        if (rotationAngle !== undefined) { this.rotationAngle = rotationAngle; }
        if (scaleFactor !== undefined) { this.scaleFactor = scaleFactor; }
    }
    /**
     * Shape to transform
     * @default undefined
     */
    shape!: T;
    /**
     * Translation to apply
     * @default [0,0,0]
     */
    translation: Base.Vector3 = [0, 0, 0];
    /**
     * Rotation to apply
     * @default [0,1,0]
     */
    rotationAxis: Base.Vector3 = [0, 1, 0];
    /**
     * Rotation degrees
     * @default 0
     * @minimum 0
     * @maximum 360
     * @step 1
     */
    rotationAngle = 0;
    /**
     * Scale factor to apply
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    scaleFactor = 1;
}
export class TransformShapesDto<T> {
    constructor(shapes?: T[], translation?: Base.Vector3[], rotationAxes?: Base.Vector3[], rotationDegrees?: number[], scaleFactors?: number[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (translation !== undefined) { this.translations = translation; }
        if (rotationAxes !== undefined) { this.rotationAxes = rotationAxes; }
        if (rotationDegrees !== undefined) { this.rotationAngles = rotationDegrees; }
        if (scaleFactors !== undefined) { this.scaleFactors = scaleFactors; }
    }
    /**
     * Shape to transform
     * @default undefined
     */
    shapes!: T[];
    /**
     * Translation to apply
     * @default [[0,0,0]]
     */
    translations: Base.Vector3[] = [[0, 0, 0]];
    /**
     * Rotation to apply
     * @default [[0,1,0]]
     */
    rotationAxes: Base.Vector3[] = [[0, 1, 0]];
    /**
     * Rotation degrees
     * @default [0]
     */
    rotationAngles: number[] = [0];
    /**
     * Scale factor to apply
     * @default [1]
     */
    scaleFactors: number[] = [1];
}
export class TranslateDto<T> {
    constructor(shape?: T, translation?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (translation !== undefined) { this.translation = translation; }
    }
    /**
     * Shape for translation
     * @default undefined
     */
    shape!: T;
    /**
     * Translation vector
     * @default [0, 0, 0]
     */
    translation: Base.Vector3 = [0, 0, 0];
}
export class TranslateShapesDto<T> {
    constructor(shapes?: T[], translations?: Base.Vector3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (translations !== undefined) { this.translations = translations; }
    }
    /**
     * Shape for translation
     * @default undefined
     */
    shapes!: T[];
    /**
     * Translation vector
     * @default [[0, 0, 0]]
     */
    translations: Base.Vector3[] = [[0, 0, 0]];
}
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
     * Shape for translation
     * @default undefined
     */
    shape!: T;
    /**
     * from origin
     * @default [0, 0, 0]
     */
    fromOrigin: Base.Point3 = [0, 0, 0];
    /**
     * From direction 1
     * @default [0, 0, 1]
     */
    fromNorm: Base.Vector3 = [1, 0, 0];
    /**
     * From direction 2
     * @default [0, 0, 1]
     */
    fromAx: Base.Vector3 = [0, 0, 1];
    /**
     * To origin
     * @default [0, 1, 0]
     */
    toOrigin: Base.Point3 = [0, 1, 0];
    /**
     * To direction 1
     * @default [0, 1, 0]
     */
    toNorm: Base.Vector3 = [0, 1, 0];
    /**
     * To direction 2
     * @default [0, 0, 1]
     */
    toAx: Base.Vector3 = [0, 1, 0];
}
export class AlignDto<T> {
    constructor(shape?: T, fromOrigin?: Base.Point3, fromDirection?: Base.Vector3, toOrigin?: Base.Point3, toDirection?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (fromOrigin !== undefined) { this.fromOrigin = fromOrigin; }
        if (fromDirection !== undefined) { this.fromDirection = fromDirection; }
        if (toOrigin !== undefined) { this.toOrigin = toOrigin; }
        if (toDirection !== undefined) { this.toDirection = toDirection; }
    }
    /**
     * Shape for translation
     * @default undefined
     */
    shape!: T;
    /**
     * from origin
     * @default [0, 0, 0]
     */
    fromOrigin: Base.Point3 = [0, 0, 0];
    /**
     * From direction
     * @default [0, 0, 1]
     */
    fromDirection: Base.Vector3 = [0, 0, 1];
    /**
     * To origin
     * @default [0, 1, 0]
     */
    toOrigin: Base.Point3 = [0, 1, 0];
    /**
     * To direction
     * @default [0, 1, 0]
     */
    toDirection: Base.Vector3 = [0, 1, 0];
}
export class AlignShapesDto<T> {
    constructor(shapes?: T[], fromOrigins?: Base.Vector3[], fromDirections?: Base.Vector3[], toOrigins?: Base.Vector3[], toDirections?: Base.Vector3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (fromOrigins !== undefined) { this.fromOrigins = fromOrigins; }
        if (fromDirections !== undefined) { this.fromDirections = fromDirections; }
        if (toOrigins !== undefined) { this.toOrigins = toOrigins; }
        if (toDirections !== undefined) { this.toDirections = toDirections; }
    }
    /**
     * Shape for translation
     * @default undefined
     */
    shapes!: T[];
    /**
     * from origin
     * @default [[0, 0, 0]]
     */
    fromOrigins: Base.Point3[] = [[0, 0, 0]];
    /**
     * From direction
     * @default [[0, 0, 1]]
     */
    fromDirections: Base.Vector3[] = [[0, 0, 1]];
    /**
     * To origin
     * @default [[0, 1, 0]]
     */
    toOrigins: Base.Point3[] = [[0, 1, 0]];
    /**
     * To direction
     * @default [[0, 1, 0]]
     */
    toDirections: Base.Vector3[] = [[0, 1, 0]];
}

export class MirrorDto<T> {
    constructor(shape?: T, origin?: Base.Point3, direction?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (origin !== undefined) { this.origin = origin; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Shape to mirror
     * @default undefined
     */
    shape!: T;
    /**
     * Axis origin point
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
    /**
     * Axis direction vector
     * @default [0, 0, 1]
     */
    direction: Base.Vector3 = [0, 0, 1];
}
export class MirrorShapesDto<T> {
    constructor(shapes?: T[], origins?: Base.Point3[], directions?: Base.Vector3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (origins !== undefined) { this.origins = origins; }
        if (directions !== undefined) { this.directions = directions; }
    }
    /**
     * Shape to mirror
     * @default undefined
     */
    shapes!: T[];
    /**
     * Axis origin point
     * @default [[0, 0, 0]]
     */
    origins: Base.Point3[] = [[0, 0, 0]];
    /**
     * Axis direction vector
     * @default [[0, 0, 1]]
     */
    directions: Base.Vector3[] = [[0, 0, 1]];
}
export class MirrorAlongNormalDto<T> {
    constructor(shape?: T, origin?: Base.Point3, normal?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (origin !== undefined) { this.origin = origin; }
        if (normal !== undefined) { this.normal = normal; }
    }
    /**
     * Shape to mirror
     * @default undefined
     */
    shape!: T;
    /**
     * Axis origin point
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
    /**
     * First normal axis direction vector
     * @default [0, 0, 1]
     */
    normal: Base.Vector3 = [0, 0, 1];
}
export class MirrorAlongNormalShapesDto<T> {
    constructor(shapes?: T[], origins?: Base.Point3[], normals?: Base.Vector3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (origins !== undefined) { this.origins = origins; }
        if (normals !== undefined) { this.normals = normals; }
    }
    /**
     * Shape to mirror
     * @default undefined
     */
    shapes!: T[];
    /**
     * Axis origin point
     * @default [[0, 0, 0]]
     */
    origins: Base.Point3[] = [[0, 0, 0]];
    /**
     * First normal axis direction vector
     * @default [[0, 0, 1]]
     */
    normals: Base.Vector3[] = [[0, 0, 1]];
}
export class AlignAndTranslateDto<T> {
    constructor(shape?: T, direction?: Base.Vector3, center?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * Shape to align and translate
     * @default undefined
     */
    shape!: T;
    /**
     * Direction on which to align
     * @default [0, 0, 1]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * Position to translate
     */
    center: Base.Vector3 = [0, 0, 0];
}
export class UnifySameDomainDto<T> {
    constructor(shape?: T, unifyEdges?: boolean, unifyFaces?: boolean, concatBSplines?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (unifyEdges !== undefined) { this.unifyEdges = unifyEdges; }
        if (unifyFaces !== undefined) { this.unifyFaces = unifyFaces; }
        if (concatBSplines !== undefined) { this.concatBSplines = concatBSplines; }
    }
    /**
     * Shape on which action should be performed
     * @default undefined
     */
    shape!: T;
    /**
    * If true, unifies the edges
    * @default true
    */
    unifyEdges = true;
    /**
    * If true, unifies the edges
    * @default true
    */
    unifyFaces = true;
    /**
    * If true, unifies the edges
    * @default true
    */
    concatBSplines = true;
}

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
     * Face that will be used to filter points
     * @default undefined
     */
    shapes!: T[];
    /**
     * Points to filter
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * Tolerance used for filter
     * @default 1.0e-4
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.0e-4;
    /**
    * If true, the bounding box will be used to prefilter the points so that there are less points to check on actual face.
    * Recommended to enable if face has more than 10 edges and geometry is mostly spline.
    * This might be faster, but if it is known that points are withing bounding box, this may not be faster.
    * @default false
    */
    useBndBox = false;
    /**
     * Gap tolerance
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    gapTolerance = 0.1;
    /**
    * Return points that are inside the face
    * @default true
    */
    keepIn = true;
    /**
    * Return points that are on the border of the face
    * @default true
    */
    keepOn = true;
    /**
    * Return points that are outside the borders of the face
    * @default false
    */
    keepOut = false;
    /**
    * Return points that are classified as unknown
    * @default false
    */
    keepUnknown = false;
    /**
     * Returns flat points array by default, otherwise returns points for each face in order provided
     * @default true
     */
    flatPointsArray = true;
}
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
     * Face that will be used to filter points
     * @default undefined
     */
    shape!: T;
    /**
     * Points to filter
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * Tolerance used for filter
     * @default 1.0e-4
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.0e-4;
    /**
    * If true, the bounding box will be used to prefilter the points so that there are less points to check on actual face.
    * Recommended to enable if face has more than 10 edges and geometry is mostly spline.
    * This might be faster, but if it is known that points are withing bounding box, this may not be faster.
    * @default false
    */
    useBndBox = false;
    /**
     * Gap tolerance
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    gapTolerance = 0.1;
    /**
    * Return points that are inside the face
    * @default true
    */
    keepIn = true;
    /**
    * Return points that are on the border of the face
    * @default true
    */
    keepOn = true;
    /**
    * Return points that are outside the borders of the face
    * @default false
    */
    keepOut = false;
    /**
    * Return points that are classified as unknown
    * @default false
    */
    keepUnknown = false;
}
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
     * Face that will be used to filter points
     * @default undefined
     */
    shape!: T;
    /**
     * Points to filter
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * Tolerance used for filter
     * @default 1.0e-4
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.0e-4;
    /**
    * Return points that are inside the face
    * @default true
    */
    keepIn = true;
    /**
    * Return points that are on the border of the face
    * @default true
    */
    keepOn = true;
    /**
    * Return points that are outside the borders of the face
    * @default false
    */
    keepOut = false;
    /**
    * Return points that are classified as unknown
    * @default false
    */
    keepUnknown = false;
}
export class AlignAndTranslateShapesDto<T> {
    constructor(shapes?: T[], directions?: Base.Vector3[], centers?: Base.Vector3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (directions !== undefined) { this.directions = directions; }
        if (centers !== undefined) { this.centers = centers; }
    }
    /**
     * Shapes to align and translate
     * @default undefined
     */
    shapes!: T[];
    /**
     * Directions on which to align
     * @default [0, 0, 1]
     */
    directions: Base.Vector3[] = [[0, 1, 0]];
    /**
     * Positions to translate
     */
    centers: Base.Vector3[] = [[0, 0, 0]];
}
export class RotateDto<T> {
    constructor(shape?: T, axis?: Base.Vector3, angle?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (axis !== undefined) { this.axis = axis; }
        if (angle !== undefined) { this.angle = angle; }
    }
    /**
     * Shape to rotate
     * @default undefined
     */
    shape!: T;
    /**
     * Axis on which to rotate
     * @default [0, 0, 1]
     */
    axis: Base.Vector3 = [0, 0, 1];
    /**
     * Rotation degrees
     * @default 0
     * @minimum 0
     * @maximum 360
     * @step 1
     */
    angle = 0;
}
export class RotateAroundCenterDto<T> {
    constructor(shape?: T, angle?: number, center?: Base.Point3, axis?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (angle !== undefined) { this.angle = angle; }
        if (center !== undefined) { this.center = center; }
        if (axis !== undefined) { this.axis = axis; }
    }
    /**
     * Shape to rotate
     * @default undefined
     */
    shape!: T;
    /**
     * Angle of rotation to apply
     * @default 0
     */
    angle = 0;
    /**
     * Center of the rotation
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Axis around which to rotate
     * @default [0, 0, 1]
     */
    axis: Base.Vector3 = [0, 0, 1];
}
export class RotateShapesDto<T> {
    constructor(shapes?: T[], axes?: Base.Vector3[], angles?: number[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (axes !== undefined) { this.axes = axes; }
        if (angles !== undefined) { this.angles = angles; }
    }
    /**
     * Shape to rotate
     * @default undefined
     */
    shapes!: T[];
    /**
     * Axis on which to rotate
     * @default [[0, 0, 1]]
     */
    axes: Base.Vector3[] = [[0, 0, 1]];
    /**
     * Rotation degrees
     * @default [0]
     */
    angles: number[] = [0];
}
export class RotateAroundCenterShapesDto<T> {
    constructor(shapes?: T[], angles?: number[], centers?: Base.Point3[], axes?: Base.Vector3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (angles !== undefined) { this.angles = angles; }
        if (centers !== undefined) { this.centers = centers; }
        if (axes !== undefined) { this.axes = axes; }
    }
    /**
     * Shape to scale
     * @default undefined
     */
    shapes!: T[];
    /**
     * Angles of rotation to apply
     * @default [0]
     */
    angles = [0];
    /**
     * Centers around which to rotate
     * @default [[0, 0, 0]]
     */
    centers: Base.Point3[] = [[0, 0, 0]];
    /**
     * Axes around which to rotate
     * @default [[0, 0, 1]]
     */
    axes: Base.Vector3[] = [[0, 0, 1]];
}
export class ScaleDto<T> {
    constructor(shape?: T, factor?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (factor !== undefined) { this.factor = factor; }
    }
    /**
     * Shape to scale
     * @default undefined
     */
    shape!: T;
    /**
     * Scale factor to apply
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    factor = 1;
}
export class ScaleShapesDto<T> {
    constructor(shapes?: T[], factors?: number[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (factors !== undefined) { this.factors = factors; }
    }
    /**
     * Shape to scale
     * @default undefined
     */
    shapes!: T[];
    /**
     * Scale factor to apply
     * @default [1]
     */
    factors: number[] = [1];
}
export class Scale3DDto<T> {
    constructor(shape?: T, scale?: Base.Vector3, center?: Base.Point3) {
        if (shape !== undefined) { this.shape = shape; }
        if (scale !== undefined) { this.scale = scale; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * Shape to scale
     * @default undefined
     */
    shape!: T;
    /**
     * Scale factor to apply
     * @default [1, 1, 1]
     */
    scale: Base.Vector3 = [1, 1, 1];
    /**
     * Scale from the center
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
}
export class Scale3DShapesDto<T> {
    constructor(shapes?: T[], scales?: Base.Vector3[], centers?: Base.Point3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (scales !== undefined) { this.scales = scales; }
        if (centers !== undefined) { this.centers = centers; }
    }
    /**
     * Shape to scale
     * @default undefined
     */
    shapes!: T[];
    /**
     * Scale factor to apply
     * @default [[1, 1, 1]]
     */
    scales: Base.Vector3[] = [[1, 1, 1]];
    /**
     * Scale from the center
     * @default [[0, 0, 0]]
     */
    centers: Base.Point3[] = [[0, 0, 0]];
}
// Matrices are flat 16-number arrays in COLUMN-MAJOR order (Base.TransformMatrix),
// matching glTF/WebGL, Babylon/Three and the matrix returned by getLabelTransform.
// A point transforms as p' = M * p; a list (Base.TransformMatrixes) is applied in
// order (first matrix first).
export class TransformByMatrixDto<T> {
    constructor(shape?: T, transformation?: Base.TransformMatrix | Base.TransformMatrixes) {
        if (shape !== undefined) { this.shape = shape; }
        if (transformation !== undefined) { this.transformation = transformation; }
    }
    /**
     * Shape to transform
     * @default undefined
     */
    shape!: T;
    /**
     * Transformation matrix (column-major, 16 numbers) or an ordered list of matrices applied first-to-last
     * @default undefined
     */
    transformation!: Base.TransformMatrix | Base.TransformMatrixes;
}
export class TransformShapesByMatrixDto<T> {
    constructor(shapes?: T[], transformation?: Base.TransformMatrix | Base.TransformMatrixes) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (transformation !== undefined) { this.transformation = transformation; }
    }
    /**
     * Shapes to transform (the same transformation is applied to each)
     * @default undefined
     */
    shapes!: T[];
    /**
     * Transformation matrix (column-major) or an ordered list of matrices applied first-to-last
     * @default undefined
     */
    transformation!: Base.TransformMatrix | Base.TransformMatrixes;
}
export class ShapeTransformQueryDto<T> {
    constructor(shape?: T) {
        if (shape !== undefined) { this.shape = shape; }
    }
    /**
     * Shape whose current placement (location) transform will be read
     * @default undefined
     */
    shape!: T;
}
export class ScaleFromCenterDto<T> {
    constructor(shape?: T, factor?: number, center?: Base.Point3) {
        if (shape !== undefined) { this.shape = shape; }
        if (factor !== undefined) { this.factor = factor; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * Shape to scale
     * @default undefined
     */
    shape!: T;
    /**
     * Uniform scale factor
     * @default 1
     * @step 0.1
     */
    factor = 1;
    /**
     * Center point to scale about
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
}
export class MirrorAboutPointDto<T> {
    constructor(shape?: T, point?: Base.Point3) {
        if (shape !== undefined) { this.shape = shape; }
        if (point !== undefined) { this.point = point; }
    }
    /**
     * Shape to mirror
     * @default undefined
     */
    shape!: T;
    /**
     * Point to mirror (point-invert) about
     * @default [0, 0, 0]
     */
    point: Base.Point3 = [0, 0, 0];
}
export class RotateByQuaternionDto<T> {
    constructor(shape?: T, quaternion?: [number, number, number, number]) {
        if (shape !== undefined) { this.shape = shape; }
        if (quaternion !== undefined) { this.quaternion = quaternion; }
    }
    /**
     * Shape to rotate
     * @default undefined
     */
    shape!: T;
    /**
     * Rotation quaternion [x, y, z, w]
     * @default [0, 0, 0, 1]
     */
    quaternion: [number, number, number, number] = [0, 0, 0, 1];
}
export class ComposeTransformDto {
    constructor(translation?: Base.Vector3, rotation?: Base.Vector3, scale?: number) {
        if (translation !== undefined) { this.translation = translation; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (scale !== undefined) { this.scale = scale; }
    }
    /**
     * Translation as [x, y, z]
     * @default [0, 0, 0]
     */
    translation: Base.Vector3 = [0, 0, 0];
    /**
     * Rotation as Euler angles [rx, ry, rz] in degrees (applied Rx * Ry * Rz)
     * @default [0, 0, 0]
     */
    rotation: Base.Vector3 = [0, 0, 0];
    /**
     * Uniform scale factor
     * @default 1
     * @step 0.1
     */
    scale = 1;
}
export class MultiplyTransformsDto {
    constructor(transformation?: Base.TransformMatrix | Base.TransformMatrixes) {
        if (transformation !== undefined) { this.transformation = transformation; }
    }
    /**
     * Ordered list of matrices (applied first-to-last) folded into a single matrix
     * @default undefined
     */
    transformation!: Base.TransformMatrix | Base.TransformMatrixes;
}
export class InvertTransformDto {
    constructor(transformation?: Base.TransformMatrix) {
        if (transformation !== undefined) { this.transformation = transformation; }
    }
    /**
     * Transformation matrix (column-major, 16 numbers) to invert
     * @default undefined
     */
    transformation!: Base.TransformMatrix;
}
export class TranslationToMatrixDto {
    constructor(translation?: Base.Vector3) {
        if (translation !== undefined) { this.translation = translation; }
    }
    /**
     * Translation as [x, y, z]
     * @default [0, 0, 0]
     */
    translation: Base.Vector3 = [0, 0, 0];
}
export class RotationAxisAngleToMatrixDto {
    constructor(axis?: Base.Vector3, angle?: number, center?: Base.Point3) {
        if (axis !== undefined) { this.axis = axis; }
        if (angle !== undefined) { this.angle = angle; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * Rotation axis direction
     * @default [0, 0, 1]
     */
    axis: Base.Vector3 = [0, 0, 1];
    /**
     * Rotation angle in degrees
     * @default 0
     * @step 1
     */
    angle = 0;
    /**
     * Point the axis passes through
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
}
export class ScaleUniformToMatrixDto {
    constructor(factor?: number, center?: Base.Point3) {
        if (factor !== undefined) { this.factor = factor; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * Uniform scale factor
     * @default 1
     * @step 0.1
     */
    factor = 1;
    /**
     * Center point to scale about
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
}
export class MirrorPointToMatrixDto {
    constructor(point?: Base.Point3) {
        if (point !== undefined) { this.point = point; }
    }
    /**
     * Point to mirror (point-invert) about
     * @default [0, 0, 0]
     */
    point: Base.Point3 = [0, 0, 0];
}
export class MirrorAxisToMatrixDto {
    constructor(origin?: Base.Point3, direction?: Base.Vector3) {
        if (origin !== undefined) { this.origin = origin; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Axis origin
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
    /**
     * Axis direction to mirror about
     * @default [1, 0, 0]
     */
    direction: Base.Vector3 = [1, 0, 0];
}
export class MirrorPlaneToMatrixDto {
    constructor(origin?: Base.Point3, normal?: Base.Vector3) {
        if (origin !== undefined) { this.origin = origin; }
        if (normal !== undefined) { this.normal = normal; }
    }
    /**
     * Plane origin
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
    /**
     * Plane normal to mirror about
     * @default [0, 0, 1]
     */
    normal: Base.Vector3 = [0, 0, 1];
}
export class QuaternionToMatrixDto {
    constructor(quaternion?: [number, number, number, number]) {
        if (quaternion !== undefined) { this.quaternion = quaternion; }
    }
    /**
     * Rotation quaternion [x, y, z, w]
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
