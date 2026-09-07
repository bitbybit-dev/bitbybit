// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { approxParametrizationTypeEnum, geomFillTrihedronEnum, joinTypeEnum } from "./enums";

export class LoftDto<T> {
    constructor(shapes?: T[], makeSolid?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
    }
    /**
     * Wires through which the loft passes
     * @default undefined
     */
    shapes!: T[];
    /**
     * Tries to make a solid when lofting
     * @default false
     */
    makeSolid = false;
}
export class LoftAdvancedDto<T> {
    constructor(shapes?: T[], makeSolid?: boolean, closed?: boolean, periodic?: boolean, straight?: boolean, nrPeriodicSections?: number, useSmoothing?: boolean, maxUDegree?: number, tolerance?: number, parType?: approxParametrizationTypeEnum, startVertex?: Base.Point3, endVertex?: Base.Point3) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
        if (closed !== undefined) { this.closed = closed; }
        if (periodic !== undefined) { this.periodic = periodic; }
        if (straight !== undefined) { this.straight = straight; }
        if (nrPeriodicSections !== undefined) { this.nrPeriodicSections = nrPeriodicSections; }
        if (useSmoothing !== undefined) { this.useSmoothing = useSmoothing; }
        if (maxUDegree !== undefined) { this.maxUDegree = maxUDegree; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (parType !== undefined) { this.parType = parType; }
        if (startVertex !== undefined) { this.startVertex = startVertex; }
        if (endVertex !== undefined) { this.endVertex = endVertex; }
    }
    /**
     * Wires through which the loft passes
     * @default undefined
     */
    shapes!: T[];
    /**
     * Tries to make a solid when lofting
     * @default false
     */
    makeSolid = false;
    /**
     * Will make a closed loft.
     * @default false
     */
    closed = false;
    /**
     * Will make a periodic loft.
     * @default false
     */
    periodic = false;
    /**
     * Indicates whether straight sections should be made out of the loft
     * @default false
     */
    straight = false;
    /**
     * This number only is used when closed non straight lofting is used
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrPeriodicSections = 10;
    /**
     * Tell algorithm to use smoothing
     * @default false
     */
    useSmoothing = false;
    /** 
     * Maximum u degree 
     * @default 3
     */
    maxUDegree = 3;
    /**
     * Tolerance
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.0e-7;
    /**
     * Approximation parametrization type
     * @default approxCentripetal
     */
    parType: approxParametrizationTypeEnum = approxParametrizationTypeEnum.approxCentripetal;
    /**
     * Optional if loft should start with a vertex
     * @default undefined
     * @optional true
     */
    startVertex?: Base.Point3 | undefined;
    /**
     * Optional if loft should end with a vertex
     * @default undefined
     * @optional true
     */
    endVertex?: Base.Point3 | undefined;
}
export class OffsetDto<T, U> {
    constructor(shape?: T, face?: U, distance?: number, tolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (face !== undefined) { this.face = face; }
        if (distance !== undefined) { this.distance = distance; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Shape to offset
     * @default undefined
     */
    shape!: T;
    /**
     * Optionally provide face for the offset
     * @default undefined
     * @optional true
     */
    face?: U | undefined;
    /**
     * Distance of offset
     * @default 0.2
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    distance = 0.2;
    /**
     * Offset tolerance
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    tolerance = 0.1;
}
export class OffsetAdvancedDto<T, U> {
    constructor(shape?: T, face?: U, distance?: number, tolerance?: number, joinType?: joinTypeEnum, removeIntEdges?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (face !== undefined) { this.face = face; }
        if (distance !== undefined) { this.distance = distance; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (joinType !== undefined) { this.joinType = joinType; }
        if (removeIntEdges !== undefined) { this.removeIntEdges = removeIntEdges; }
    }
    /**
     * Shape to offset
     * @default undefined
     */
    shape!: T;
    /**
     * Optionally provide face for the offset
     * @default undefined
     * @optional true
     */
    face?: U | undefined;
    /**
     * Distance of offset
     * @default 0.2
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    distance = 0.2;
    /**
     * Offset tolerance
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    tolerance = 0.1;
    /**
     * Join defines how to fill the holes that may appear between parallels to the two adjacent faces. It may take values GeomAbs_Arc or GeomAbs_Intersection:
     * if Join is equal to GeomAbs_Arc, then pipes are generated between two free edges of two adjacent parallels, and spheres are generated on "images" of vertices; it is the default value
     * @default arc
    */
    joinType = joinTypeEnum.arc;
    /**
     * Removes internal edges
     * @default false
     */
    removeIntEdges = false;
}
export class RevolveDto<T> {
    constructor(shape?: T, angle?: number, direction?: Base.Vector3, copy?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (angle !== undefined) { this.angle = angle; }
        if (direction !== undefined) { this.direction = direction; }
        if (copy !== undefined) { this.copy = copy; }
    }
    /**
     * Shape to revolve
     * @default undefined
     */
    shape!: T;
    /**
     * Angle degrees
     * @default 360
     * @minimum 0
     * @maximum 360
     * @step 1
     */
    angle = 360;
    /**
     * Direction vector
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * Copy original shape
     * @default false
     */
    copy = false;
}
export class ShapeShapesDto<T, U> {
    constructor(shape?: T, shapes?: U[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (shapes !== undefined) { this.shapes = shapes; }
    }
    /**
     * The wire path
     * @default undefined
     */
    shape!: T;
    /**
     * Shapes along the path to be piped
     * @default undefined
     */
    shapes!: U[];
}
export class WiresOnFaceDto<T, U> {
    constructor(wires?: T[], face?: U) {
        if (wires !== undefined) { this.wires = wires; }
        if (face !== undefined) { this.face = face; }
    }
    /**
     * The wires
     * @default undefined
     */
    wires!: T[];
    /**
     * Face shape
     * @default undefined
     */
    face!: U;
}
export class PipeWiresCylindricalDto<T> {
    constructor(shapes?: T[], radius?: number, makeSolid?: boolean, trihedronEnum?: geomFillTrihedronEnum, forceApproxC1?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (radius !== undefined) { this.radius = radius; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
        if (trihedronEnum !== undefined) { this.trihedronEnum = trihedronEnum; }
        if (forceApproxC1 !== undefined) { this.forceApproxC1 = forceApproxC1; }
    }
    /**
     * Wire paths to pipe
     * @default undefined
     */
    shapes!: T[];
    /**
     * Radius of the cylindrical pipe
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    radius = 0.1;
    /**
     * Make solid result by closing start and end parts
     * @default true
     */
    makeSolid = true;
    /**
     * Goemetry Fill Trihedron Options
     * @default isConstantNormal
     */
    trihedronEnum = geomFillTrihedronEnum.isConstantNormal;
    /**
     * Attempt to approximate a C1-continuous surface if a swept surface proved to be C0
     * @default false
     */
    forceApproxC1 = false;
}
export class PipeWireCylindricalDto<T> {
    constructor(shape?: T, radius?: number, makeSolid?: boolean, trihedronEnum?: geomFillTrihedronEnum, forceApproxC1?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (radius !== undefined) { this.radius = radius; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
        if (trihedronEnum !== undefined) { this.trihedronEnum = trihedronEnum; }
        if (forceApproxC1 !== undefined) { this.forceApproxC1 = forceApproxC1; }
    }
    /**
     * Wire path to pipe
     * @default undefined
     */
    shape!: T;
    /**
     * Radius of the cylindrical pipe
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    radius = 0.1;
    /**
     * Make solid result by closing start and end parts
     * @default true
     */
    makeSolid = true;
    /**
     * Goemetry Fill Trihedron Options
     * @default isConstantNormal
     */
    trihedronEnum = geomFillTrihedronEnum.isConstantNormal;
    /**
     * Attempt to approximate a C1-continuous surface if a swept surface proved to be C0
     * @default false
     */
    forceApproxC1 = false;
}
export class PipePolygonWireNGonDto<T> {
    constructor(shapes?: T, radius?: number, nrCorners?: number, makeSolid?: boolean, trihedronEnum?: geomFillTrihedronEnum, forceApproxC1?: boolean) {
        if (shapes !== undefined) { this.shape = shapes; }
        if (radius !== undefined) { this.radius = radius; }
        if (nrCorners !== undefined) { this.nrCorners = nrCorners; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
        if (trihedronEnum !== undefined) { this.trihedronEnum = trihedronEnum; }
        if (forceApproxC1 !== undefined) { this.forceApproxC1 = forceApproxC1; }
    }
    /**
     * Wire path to pipe
     * @default undefined
     */
    shape!: T;
    /**
     * Radius of the cylindrical pipe
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    radius = 0.1;
    /**
     * Nr of ngon corners to be used
     * @default 6
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    nrCorners = 6;
    /**
     * Make solid result by closing start and end parts
     * @default true
     */
    makeSolid = true;
    /**
     * Goemetry Fill Trihedron Options
     * @default isConstantNormal
     */
    trihedronEnum = geomFillTrihedronEnum.isConstantNormal;
    /**
     * Attempt to approximate a C1-continuous surface if a swept surface proved to be C0
     * @default false
     */
    forceApproxC1 = false;
}
export class ExtrudeDto<T> {
    constructor(shape?: T, direction?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Face to extrude
     * @default undefined
     */
    shape!: T;
    /**
     * Direction vector for extrusion
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}

export class ExtrudeShapesDto<T> {
    constructor(shapes?: T[], direction?: Base.Vector3) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Shapes to extrude
     * @default undefined
     */
    shapes!: T[];
    /**
     * Direction vector for extrusion
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}

export class SplitDto<T> {
    constructor(shape?: T, shapes?: T[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (shapes !== undefined) { this.shapes = shapes; }
    }
    /**
     * Shape to split
     * @default undefined
     */
    shape!: T;
    /**
     * Shapes to split from main shape
     * @default undefined
     */
    shapes!: T[];
    /**
     * Local fuzzy tolerance used for splitting
     * @default 1.0e-4
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    localFuzzyTolerance = 1.0e-4;
    /**
     * Set to true if you want to split the shape non-destructively
     * @default true
     */
    nonDestructive = true;
}
export class UnionDto<T> {
    constructor(shapes?: T[], keepEdges?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (keepEdges !== undefined) { this.keepEdges = keepEdges; }
    }
    /**
     * Objects to be joined together
     * @default undefined
     */
    shapes!: T[];
    /**
     * Keeps edges
     * @default false
     */
    keepEdges = false;
}
export class DifferenceDto<T> {
    constructor(shape?: T, shapes?: T[], keepEdges?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (shapes !== undefined) { this.shapes = shapes; }
        if (keepEdges !== undefined) { this.keepEdges = keepEdges; }
    }
    /**
     * Object to subtract from
     * @default undefined
     */
    shape!: T;
    /**
     * Objects to subtract
     * @default undefined
     */
    shapes!: T[];
    /**
     * Keeps edges unaffected
     * @default false
     */
    keepEdges = false;
}

export class IntersectionDto<T> {
    constructor(shapes?: T[], keepEdges?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (keepEdges !== undefined) { this.keepEdges = keepEdges; }
    }
    /**
     * Shapes to intersect
     * @default undefined
     */
    shapes!: T[];
    /**
     * Keep the edges
     * @default false
     */
    keepEdges = false;
}
export class ShapeDto<T> {
    constructor(shape?: T) {
        if (shape !== undefined) { this.shape = shape; }
    }
    /**
     * Shape on which action should be performed
     * @default undefined
     */
    shape!: T;
}
export class MeshMeshIntersectionTwoShapesDto<T> {
    constructor(shape1?: T, shape2?: T, precision1?: number, precision2?: number) {
        if (shape1 !== undefined) { this.shape1 = shape1; }
        if (shape2 !== undefined) { this.shape2 = shape2; }
        if (precision1 !== undefined) { this.precision1 = precision1; }
        if (precision2 !== undefined) { this.precision2 = precision2; }
    }
    /**
     * First shape to be used for intersection
     * @default undefined
     */
    shape1!: T;
    /**
     * Precision of first shape to be used for meshing and computing intersection. 
     * Keep in mind that the lower this value is, the more triangles will be produced and thus the slower the computation.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    precision1?: number | undefined = 0.01;
    /**
     * Second shape to be used for intersection
     * @default undefined
     */
    shape2!: T;
    /**
     * Precision of second shape to be used for meshing and computing intersection. 
     * Keep in mind that the lower this value is, the more triangles will be produced and thus the slower the computation.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    precision2?: number | undefined = 0.01;
}
export class MeshMeshesIntersectionOfShapesDto<T> {
    constructor(shape?: T, shapes?: T[], precision?: number, precisionShapes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (shapes !== undefined) { this.shapes = shapes; }
        if (precision !== undefined) { this.precision = precision; }
        if (precisionShapes !== undefined) { this.precisionShapes = precisionShapes; }
    }
    /**
     * Shape to use for the base of computations
     * @default undefined
     */
    shape!: T;
    /**
     * Precision of first shape to be used for meshing and computing intersection. 
     * Keep in mind that the lower this value is, the more triangles will be produced and thus the slower the computation.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    precision?: number | undefined = 0.01;
    /**
     * Second shape to be used for intersection
     * @default undefined
     */
    shapes!: T[];
    /**
     * Precision of shapes to be used, if undefined, a universal precision will be used of the first shape
     * @default undefined
     * @optional true
     */
    precisionShapes?: number[] | undefined;
}
export class CompareShapesDto<T> {
    constructor(shape?: T, otherShape?: T) {
        if (shape !== undefined) { this.shape = shape; }
        if (otherShape !== undefined) { this.otherShape = otherShape; }
    }
    /**
     * Shape to be compared
     * @default undefined
     */
    shape!: T;
    /**
     * Shape to be compared against
     * @default undefined
     */
    otherShape!: T;
}
export class FixSmallEdgesInWireDto<T> {
    constructor(shape?: T, lockvtx?: boolean, precsmall?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (lockvtx !== undefined) { this.lockvtx = lockvtx; }
        if (precsmall !== undefined) { this.precsmall = precsmall; }
    }
    /**
     * Shape on which action should be performed
     * @default undefined
     */
    shape!: T;
    /**
     * Lock vertex. If true, the edge must be kept.
     * @default false
     */
    lockvtx = false;
    /**
     * Definition of the small distance edge
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.0000000001
     */
    precsmall = 0.0;
}
export class BasicShapeRepairDto<T> {
    constructor(shape?: T, precision?: number, maxTolerance?: number, minTolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (precision !== undefined) { this.precision = precision; }
        if (maxTolerance !== undefined) { this.maxTolerance = maxTolerance; }
        if (minTolerance !== undefined) { this.minTolerance = minTolerance; }
    }
    /**
     * Shape to repair
     * @default undefined
     */
    shape!: T;
    /**
     * Basic precision
     * @default 0.001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0000000001
     */
    precision = 0.001;
    /**
     * maximum allowed tolerance. All problems will be detected for cases when a dimension of invalidity is larger than 
     * the basic precision or a tolerance of sub-shape on that problem is detected. The maximum tolerance value limits 
     * the increasing tolerance for fixing a problem such as fix of not connected and self-intersected wires. If a value 
     * larger than the maximum allowed tolerance is necessary for correcting a detected problem the problem can not be fixed. 
     * The maximal tolerance is not taking into account during computation of tolerance of edges
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.0000000001
     */
    maxTolerance = 0.01;
    /**
     * minimal allowed tolerance. It defines the minimal allowed length of edges.
     * Detected edges having length less than the specified minimal tolerance will be removed.
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0000000001
     */
    minTolerance = 0.0001;
}
export class FixClosedDto<T> {
    constructor(shape?: T, precision?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (precision !== undefined) { this.precision = precision; }
    }
    /**
     * Shape on which action should be performed
     * @default undefined
     */
    shape!: T;
    /**
     * Precision for closed wire
     * @default -0.1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.0000000001
     */
    precision = -0.1;
}
export class ShapesWithToleranceDto<T> {
    constructor(shapes?: T[], tolerance?: number) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The shapes
     * @default undefined
     */
    shapes!: T[];
    /**
     * Tolerance used for intersections
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.0e-7;
}
export class ShapeWithToleranceDto<T> {
    constructor(shape?: T, tolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The shape
     * @default undefined
     */
    shape!: T;
    /**
     * Tolerance used for intersections
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance = 1.0e-7;
}

export class ShapeIndexDto<T> {
    constructor(shape?: T, index?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (index !== undefined) { this.index = index; }
    }
    /**
     * Shape
     * @default undefined
     */
    shape!: T;
    /**
     * Index of the entity
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    index = 0;
}
export class EdgeIndexDto<T> {
    constructor(shape?: T, index?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (index !== undefined) { this.index = index; }
    }
    /**
     * Shape
     * @default undefined
     */
    shape!: T;
    /**
     * Index of the entity
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    index = 0;
}
export class RotationExtrudeDto<T> {
    constructor(shape?: T, height?: number, angle?: number, makeSolid?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (height !== undefined) { this.height = height; }
        if (angle !== undefined) { this.angle = angle; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
    }
    /**
     * Wire to extrude by rotating
     * @default undefined
     */
    shape!: T;
    /**
     * Height of rotation
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Rotation in degrees
     * @default 360
     * @minimum 0
     * @maximum 360
     * @step 1
     */
    angle = 360;
    /**
     * Make solid of the result
     * @default true
     */
    makeSolid = true;
}

