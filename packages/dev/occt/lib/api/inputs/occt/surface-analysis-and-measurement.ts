// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { continuityEnum, fillingStyleEnum } from "./enums";

/**
 * Two shapes for `shapes.face.ruledBetween`, `analysis.measure.extrema` and
 * `analysis.measure.angleBetween`; each method says what the two may be, and results that name a
 * side call the first A and the second B.
 */
export class TwoShapesDto<T> {
    constructor(shapeA?: T, shapeB?: T) {
        if (shapeA !== undefined) { this.shapeA = shapeA; }
        if (shapeB !== undefined) { this.shapeB = shapeB; }
    }
    /**
     * The first shape, side A of the results.
     * @default undefined
     */
    shapeA!: T;
    /**
     * The second shape, side B of the results.
     * @default undefined
     */
    shapeB!: T;
}
/**
 * A grid of points for `shapes.face.fromPointGrid`, which makes a B-spline face through them or
 * near them, with the degrees and the tolerance an approximation keeps to.
 */
export class FaceFromPointGridDto {
    constructor(points?: Base.Point3[][], interpolate?: boolean, periodic?: boolean, degreeMin?: number, degreeMax?: number, tolerance?: number) {
        if (points !== undefined) { this.points = points; }
        if (interpolate !== undefined) { this.interpolate = interpolate; }
        if (periodic !== undefined) { this.periodic = periodic; }
        if (degreeMin !== undefined) { this.degreeMin = degreeMin; }
        if (degreeMax !== undefined) { this.degreeMax = degreeMax; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Rows of equal length, at least two of two points each; the rows step along u and each row runs
     * along v.
     * @default undefined
     */
    points!: Base.Point3[][];
    /**
     * True passes the face through every point at degree 3; false approximates the points within
     * `tolerance`, smoothing what the tolerance allows.
     * @default true
     */
    interpolate?: boolean | undefined = true;
    /**
     * Closes the face in u, joining the last row back to the first, which is not repeated; read only
     * when interpolating.
     * @default false
     */
    periodic?: boolean | undefined = false;
    /**
     * The lowest degree an approximation may use; read only when approximating.
     * @default 3
     * @minimum 1
     * @maximum 25
     * @step 1
     */
    degreeMin?: number | undefined = 3;
    /**
     * The highest degree an approximation may use, at least `degreeMin`; read only when
     * approximating.
     * @default 8
     * @minimum 1
     * @maximum 25
     * @step 1
     */
    degreeMax?: number | undefined = 8;
    /**
     * How far an approximation may pass from the points, in model units; read only when
     * approximating.
     * @default 1e-3
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.001
     */
    tolerance?: number | undefined = 1e-3;
}
/**
 * Two to four edges and a filling style for `shapes.face.boundaryPatch`, which makes a B-spline
 * face bounded by the edges, each taken along its orientation.
 */
export class BoundaryPatchDto<T> {
    constructor(edges?: T[], style?: fillingStyleEnum) {
        if (edges !== undefined) { this.edges = edges; }
        if (style !== undefined) { this.style = style; }
    }
    /**
     * Two to four edges: four that close up, three of which one meets the other two, or two opposite
     * sides, which share a corner in the curved style.
     * @default undefined
     */
    edges!: T[];
    /**
     * How the patch fills between the edges.
     * @default coons
     */
    style?: fillingStyleEnum | undefined = fillingStyleEnum.coons;
}
/**
 * Boundary edges, how the patch meets each, the faces beside them and points to pass near for
 * `shapes.face.fillPatch`, with the settings of the plate surface it fits.
 */
export class FillPatchDto<T, U> {
    constructor(edges?: T[], continuities?: continuityEnum[], supports?: (U | undefined)[], points?: Base.Point3[], degree?: number, pointsOnCurves?: number, iterations?: number, tolerance?: number) {
        if (edges !== undefined) { this.edges = edges; }
        if (continuities !== undefined) { this.continuities = continuities; }
        if (supports !== undefined) { this.supports = supports; }
        if (points !== undefined) { this.points = points; }
        if (degree !== undefined) { this.degree = degree; }
        if (pointsOnCurves !== undefined) { this.pointsOnCurves = pointsOnCurves; }
        if (iterations !== undefined) { this.iterations = iterations; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The boundary edges, in any order and direction, that close into one loop.
     * @default undefined
     */
    edges!: T[];
    /**
     * How the patch meets each edge, one entry per edge in the order of `edges`; left out, the patch
     * only passes through every edge.
     * @default undefined
     * @optional true
     */
    continuities?: continuityEnum[] | undefined;
    /**
     * One face per edge, the face beside it, for tangent or curvature along an edge that stores none;
     * an undefined entry, or leaving it out, gives no face.
     * @default undefined
     * @optional true
     */
    supports?: (U | undefined)[] | undefined;
    /**
     * Points inside the boundary the patch passes near; left out, none.
     * @default undefined
     * @optional true
     */
    points?: Base.Point3[] | undefined;
    /**
     * The degree of the plate surface.
     * @default 3
     * @minimum 2
     * @maximum 9
     * @step 1
     */
    degree?: number | undefined = 3;
    /**
     * How many points of each boundary edge the plate is fitted to.
     * @default 15
     * @minimum 2
     * @maximum Infinity
     * @step 1
     */
    pointsOnCurves?: number | undefined = 15;
    /**
     * How many passes the fit makes; matching curvature may need more than two.
     * @default 2
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    iterations?: number | undefined = 2;
    /**
     * How far the patch may pass from the boundary and the points, in model units.
     * @default 1e-4
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance?: number | undefined = 1e-4;
}
/**
 * A face and a tolerance for `shapes.face.unroll`, which lays a plane, cylinder or cone face flat
 * without stretching it.
 */
export class UnrollFaceDto<T> {
    constructor(shape?: T, tolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The face to lay flat: one on a plane, a cylinder or a cone.
     * @default undefined
     */
    shape!: T;
    /**
     * How far the flat edges may stray from the exact development, in model units.
     * @default 1e-4
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance?: number | undefined = 1e-4;
}
/**
 * A shape and a frame for `analysis.measure.boundingBoxInFrame`, which boxes the shape along the
 * frame's axes instead of the world's.
 */
export class BoundingBoxInFrameDto<T> {
    constructor(shape?: T, frame?: Base.Frame) {
        if (shape !== undefined) { this.shape = shape; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shape the box is found around.
     * @default undefined
     */
    shape!: T;
    /**
     * The frame whose axes the box follows: its x along the frame's direction and its z along the
     * frame's normal. Only the axes matter, not the origin.
     * @default undefined
     */
    frame!: Base.Frame;
}
/**
 * A shape, one of its edges and a place along the edge for `analysis.measure.dihedralAngle`, which
 * measures the angle between the two faces that meet there.
 */
export class DihedralAngleDto<T> {
    constructor(shape?: T, index?: number, param?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (index !== undefined) { this.index = index; }
        if (param !== undefined) { this.param = param; }
    }
    /**
     * The shape the edge belongs to.
     * @default undefined
     */
    shape!: T;
    /**
     * The edge, counted from 0 as `shapes.edge.getEdges` lists them.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    index?: number | undefined = 0;
    /**
     * Where along the edge the angle is read, as a share of its parameter range from 0 at its start
     * to 1 at its end.
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    param?: number | undefined = 0.5;
}
/**
 * A shape, how densely to sample it and whether to read concave bends only, for
 * `analysis.measure.minCurvatureRadius`.
 */
export class MinCurvatureRadiusDto<T> {
    constructor(shape?: T, samples?: number, concaveOnly?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (samples !== undefined) { this.samples = samples; }
        if (concaveOnly !== undefined) { this.concaveOnly = concaveOnly; }
    }
    /**
     * The shape whose tightest bend is found.
     * @default undefined
     */
    shape!: T;
    /**
     * How densely the shape is read: a grid of this many by this many places on each face, and this
     * many places along each edge.
     * @default 16
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    samples?: number | undefined = 16;
    /**
     * True reads only where faces bend concavely, the tightest radius a round tool can reach; edges
     * and convex bends are then skipped.
     * @default false
     */
    concaveOnly?: boolean | undefined = false;
}
/**
 * Shapes and a clearance for `analysis.clashes.betweenShapes`, which finds the pairs of shapes that
 * overlap or come within the clearance of each other.
 */
export class ClashesBetweenShapesDto<T> {
    constructor(shapes?: T[], clearance?: number) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (clearance !== undefined) { this.clearance = clearance; }
    }
    /**
     * The shapes to check against each other; a clash names two of them by their positions here.
     * @default undefined
     */
    shapes!: T[];
    /**
     * How close two shapes may come before they clash, in model units; 0 reports only shapes that
     * touch or overlap.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    clearance?: number | undefined = 0;
}
/**
 * Two shapes, a clearance and a meshing precision for `analysis.clashes.facesWithin`, which finds
 * the faces of one that come within the clearance of faces of the other.
 */
export class FacesWithinDto<T> {
    constructor(shapeA?: T, shapeB?: T, clearance?: number, precision?: number) {
        if (shapeA !== undefined) { this.shapeA = shapeA; }
        if (shapeB !== undefined) { this.shapeB = shapeB; }
        if (clearance !== undefined) { this.clearance = clearance; }
        if (precision !== undefined) { this.precision = precision; }
    }
    /**
     * The first shape, whose faces are side A of each clash.
     * @default undefined
     */
    shapeA!: T;
    /**
     * The second shape, whose faces are side B of each clash.
     * @default undefined
     */
    shapeB!: T;
    /**
     * How close a face of one shape may come to a face of the other before the two clash, in model
     * units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    clearance?: number | undefined = 0.1;
    /**
     * The mesh deflection of the search for candidate pairs, in model units; every pair it finds is
     * then measured exactly.
     * @default 0.01
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.01
     */
    precision?: number | undefined = 0.01;
}
/**
 * A shape and a meshing precision for `analysis.clashes.selfIntersections`, which finds the faces
 * of the shape that cross each other.
 */
export class SelfIntersectionsDto<T> {
    constructor(shape?: T, precision?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (precision !== undefined) { this.precision = precision; }
    }
    /**
     * The shape whose faces are checked against each other.
     * @default undefined
     */
    shape!: T;
    /**
     * The mesh deflection of the search for candidate pairs, in model units; every pair it finds is
     * then confirmed exactly.
     * @default 0.01
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.01
     */
    precision?: number | undefined = 0.01;
}
