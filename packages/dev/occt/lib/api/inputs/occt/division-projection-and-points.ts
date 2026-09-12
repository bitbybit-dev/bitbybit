// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { pointProjectionTypeEnum } from "./enums";

/**
 * A wire or edge and a division count for `divideWireByParamsToPoints`,
 * `divideEdgeByEqualDistanceToPoints` and their siblings in `shapes.wire` and `shapes.edge`.
 */
export class DivideDto<T> {
    constructor(shape?: T, nrOfDivisions?: number, removeStartPoint?: boolean, removeEndPoint?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (nrOfDivisions !== undefined) { this.nrOfDivisions = nrOfDivisions; }
        if (removeStartPoint !== undefined) { this.removeStartPoint = removeStartPoint; }
        if (removeEndPoint !== undefined) { this.removeEndPoint = removeEndPoint; }
    }
    /**
     * The wire or edge to place points along.
     * @default undefined
     */
    shape!: T;
    /**
     * How many steps to divide the curve into; one more point than that is placed, the ends
     * included.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrOfDivisions?: number | undefined = 10;
    /**
     * When true, the point at the start is left out.
     * @default false
     */
    removeStartPoint?: boolean | undefined = false;
    /**
     * When true, the point at the end is left out.
     * @default false
     */
    removeEndPoint?: boolean | undefined = false;
}

/**
 * A wire, a shape and a direction for `shapes.wire.project`, which casts the wire onto the shape
 * along the direction.
 */
export class ProjectWireDto<T, U> {
    constructor(wire?: T, shape?: U, direction?: Base.Vector3) {
        if (wire !== undefined) { this.wire = wire; }
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The wire to cast onto the shape.
     * @default undefined
     */
    wire!: T;
    /**
     * The shape the wire lands on.
     * @default undefined
     */
    shape!: U;
    /**
     * The direction the wire is cast along; only its direction matters.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * Points, a shape and a direction for `shapes.vertex.projectPoints`, which casts each point onto
 * the shape along the direction.
 */
export class ProjectPointsOnShapeDto<T> {
    constructor(points?: Base.Point3[], shape?: T, direction?: Base.Vector3, projectionType?: pointProjectionTypeEnum) {
        if (points !== undefined) { this.points = points; }
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
        if (projectionType !== undefined) { this.projectionType = projectionType; }
    }
    /**
     * The points to cast onto the shape.
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * The shape the points land on.
     * @default undefined
     */
    shape!: T;
    /**
     * The direction and reach of the cast as one vector, in model units: hits farther away than its
     * length are not found.
     * @default [0, 10, 0]
     */
    direction: Base.Vector3 = [0, 10, 0];
    /**
     * Which hits to keep when a point crosses the shape more than once: all of them, the closest,
     * the farthest, or both of those.
     * @default all
     */
    projectionType: pointProjectionTypeEnum = pointProjectionTypeEnum.all;
}
/**
 * A shape and deflection settings for `shapes.wire.wiresToPoints`, which traces every wire of the
 * shape as points.
 */
export class WiresToPointsDto<T> {
    constructor(shape?: T, angularDeflection?: number, curvatureDeflection?: number, minimumOfPoints?: number, uTolerance?: number, minimumLength?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (angularDeflection !== undefined) { this.angularDeflection = angularDeflection; }
        if (curvatureDeflection !== undefined) { this.curvatureDeflection = curvatureDeflection; }
        if (minimumOfPoints !== undefined) { this.minimumOfPoints = minimumOfPoints; }
        if (uTolerance !== undefined) { this.uTolerance = uTolerance; }
        if (minimumLength !== undefined) { this.minimumLength = minimumLength; }
    }
    /**
     * The shape whose wires are traced.
     * @default undefined
     */
    shape!: T;
    /**
     * The largest angle, in radians, the polyline may turn between two points; smaller follows
     * curves more closely.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    angularDeflection = 0.1;
    /**
     * The largest distance, in model units, the polyline may stray from the curve; smaller follows
     * it more closely.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    curvatureDeflection = 0.1;
    /**
     * The fewest points any edge is traced with, however straight.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    minimumOfPoints = 2;
    /**
     * How close two parameter values must be to count as the same point.
     * @default 1.0e-9
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-9
     */
    uTolerance = 1.0e-9;
    /**
     * Edges shorter than this, in model units, are traced with the minimum number of points.
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-7
     */
    minimumLength = 1.0e-7;
}
/**
 * A shape and deflection settings for `shapes.edge.edgesToPoints`, which traces every edge of the
 * shape as points.
 */
export class EdgesToPointsDto<T> {
    constructor(shape?: T, angularDeflection?: number, curvatureDeflection?: number, minimumOfPoints?: number, uTolerance?: number, minimumLength?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (angularDeflection !== undefined) { this.angularDeflection = angularDeflection; }
        if (curvatureDeflection !== undefined) { this.curvatureDeflection = curvatureDeflection; }
        if (minimumOfPoints !== undefined) { this.minimumOfPoints = minimumOfPoints; }
        if (uTolerance !== undefined) { this.uTolerance = uTolerance; }
        if (minimumLength !== undefined) { this.minimumLength = minimumLength; }
    }
    /**
     * The shape whose edges are traced.
     * @default undefined
     */
    shape!: T;
    /**
     * The largest angle, in radians, the polyline may turn between two points; smaller follows
     * curves more closely.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    angularDeflection = 0.1;
    /**
     * The largest distance, in model units, the polyline may stray from the curve; smaller follows
     * it more closely.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    curvatureDeflection = 0.1;
    /**
     * The fewest points any edge is traced with, however straight.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    minimumOfPoints = 2;
    /**
     * How close two parameter values must be to count as the same point.
     * @default 1.0e-9
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-9
     */
    uTolerance = 1.0e-9;
    /**
     * Edges shorter than this, in model units, are traced with the minimum number of points.
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-7
     */
    minimumLength = 1.0e-7;
}
/**
 * Wires, a shape and a direction for `shapes.wire.projectWires`, which casts each wire onto the
 * shape along the direction.
 */
export class ProjectWiresDto<T, U> {
    constructor(wires?: T[], shape?: U, direction?: Base.Vector3) {
        if (wires !== undefined) { this.wires = wires; }
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The wires to cast onto the shape, one result per wire.
     * @default undefined
     */
    wires!: T[];
    /**
     * The shape the wires land on.
     * @default undefined
     */
    shape!: U;
    /**
     * The direction the wires are cast along; only its direction matters.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * Wires or edges and a division count for `divideWiresByParamsToPoints`,
 * `divideEdgesByEqualDistanceToPoints` and their siblings.
 */
export class DivideShapesDto<T> {
    constructor(shapes: T[], nrOfDivisions?: number, removeStartPoint?: boolean, removeEndPoint?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (nrOfDivisions !== undefined) { this.nrOfDivisions = nrOfDivisions; }
        if (removeStartPoint !== undefined) { this.removeStartPoint = removeStartPoint; }
        if (removeEndPoint !== undefined) { this.removeEndPoint = removeEndPoint; }
    }
    /**
     * The wires or edges to place points along, one list of points per shape.
     * @default undefined
     */
    shapes!: T[];
    /**
     * How many steps to divide each curve into; one more point than that is placed, the ends
     * included.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrOfDivisions = 10;
    /**
     * When true, the point at the start of each curve is left out.
     * @default false
     */
    removeStartPoint = false;
    /**
     * When true, the point at the end of each curve is left out.
     * @default false
     */
    removeEndPoint = false;
}
/**
 * A wire, edge or 2D curve and a parameter for the `...AtParam` methods, such as
 * `shapes.wire.pointOnWireAtParam` and `shapes.edge.tangentOnEdgeAtParam`.
 */
export class DataOnGeometryAtParamDto<T> {
    constructor(shape: T, param?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (param !== undefined) { this.param = param; }
    }
    /**
     * The wire, edge or curve to evaluate.
     * @default undefined
     */
    shape!: T;
    /**
     * Where to evaluate, as a fraction from 0 at the start to 1 at the end; for a raw 2D curve it
     * is the curve's own parameter.
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    param = 0.5;
}
/**
 * Several edges and one parameter for `shapes.edge.pointsOnEdgesAtParam` and
 * `tangentsOnEdgesAtParam`.
 */
export class DataOnGeometryesAtParamDto<T> {
    constructor(shapes: T[], param?: number) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (param !== undefined) { this.param = param; }
    }
    /**
     * The edges to evaluate, one result per edge.
     * @default undefined
     */
    shapes!: T[];
    /**
     * Where to evaluate on every edge, as a fraction from 0 at the start to 1 at the end.
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    param = 0.5;
}
/**
 * A face, an edge and two parameters for finding a point inside the face beside the edge; currently
 * unused by the library.
 */
export class PointInFaceDto<T> {
    constructor(face: T, edge: T, tEdgeParam?: number, distance2DParam?: number) {
        if (face !== undefined) { this.face = face; }
        if (edge !== undefined) { this.edge = edge; }
        if (tEdgeParam !== undefined) { this.tEdgeParam = tEdgeParam; }
        if (distance2DParam !== undefined) { this.distance2DParam = distance2DParam; }
    }
    /**
     * The face the point should lie in.
     * @default undefined
     */
    face!: T;
    /**
     * The edge of the face the point is measured from.
     * @default undefined
     */
    edge!: T;
    /**
     * Where along the edge to start, as a fraction from 0 to 1.
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    tEdgeParam = 0.5;
    /**
     * How far from the edge the point lies, measured in the face's UV space.
     * @default 0.5
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    distance2DParam = 0.5;
}

/**
 * A wire and a spacing for `shapes.wire.pointsOnWireAtEqualLength`, which places points every
 * `length` units from the start.
 */
export class PointsOnWireAtEqualLengthDto<T> {
    constructor(shape: T, length?: number, tryNext?: boolean, includeFirst?: boolean, includeLast?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (length !== undefined) { this.length = length; }
        if (tryNext !== undefined) { this.tryNext = tryNext; }
        if (includeFirst !== undefined) { this.includeFirst = includeFirst; }
        if (includeLast !== undefined) { this.includeLast = includeLast; }
    }
    /**
     * The wire to place points along.
     * @default undefined
     */
    shape!: T;
    /**
     * The distance between points along the wire, in model units.
     * @default 0.5
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    length = 0.5;
    /**
     * When true, one more point is asked for a step beyond the last one that fit.
     * @default false
     */
    tryNext = false;
    /**
     * When true, the point at the start of the wire is kept.
     * @default false
     */
    includeFirst = false;
    /**
     * When true, the end point of the wire is appended whatever the spacing.
     * @default false
     */
    includeLast = false;
}


/**
 * A wire and a repeating pattern of gaps for `shapes.wire.pointsOnWireAtPatternOfLengths`.
 */
export class PointsOnWireAtPatternOfLengthsDto<T> {
    constructor(shape: T, lengths?: number[], tryNext?: boolean, includeFirst?: boolean, includeLast?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (lengths !== undefined) { this.lengths = lengths; }
        if (tryNext !== undefined) { this.tryNext = tryNext; }
        if (includeFirst !== undefined) { this.includeLast = includeFirst; }
        if (includeLast !== undefined) { this.includeLast = includeLast; }
    }
    /**
     * The wire to place points along.
     * @default undefined
     */
    shape!: T;
    /**
     * The gaps between points in model units, applied in turn from the start and repeated until the
     * wire runs out.
     * @default undefined
     */
    lengths!: number[];
    /**
     * When true, one more point is asked for at the next gap beyond the last one that fit.
     * @default false
     */
    tryNext = false;
    /**
     * When true, the point at the start of the wire is kept.
     * @default false
     */
    includeFirst = false;
    /**
     * When true, the end point of the wire is appended whatever the pattern.
     * @default false
     */
    includeLast = false;
}
/**
 * A wire or edge and a distance for the `...AtLength` methods, such as
 * `shapes.wire.pointOnWireAtLength` and `shapes.edge.tangentOnEdgeAtLength`.
 */
export class DataOnGeometryAtLengthDto<T> {
    constructor(shape: T, length?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * The wire or edge to evaluate.
     * @default undefined
     */
    shape!: T;
    /**
     * The distance from the start along the curve, in model units.
     * @default 0.5
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    length = 0.5;
}

/**
 * Several edges and one distance for `shapes.edge.pointsOnEdgesAtLength` and
 * `tangentsOnEdgesAtLength`.
 */
export class DataOnGeometryesAtLengthDto<T> {
    constructor(shapes: T[], length?: number) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * The edges to evaluate, one result per edge.
     * @default undefined
     */
    shapes!: T[];
    /**
     * The distance from the start of each edge along its curve, in model units.
     * @default 0.5
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    length = 0.5;
}

/**
 * A wire and several distances for `shapes.wire.pointsOnWireAtLengths`.
 */
export class DataOnGeometryAtLengthsDto<T> {
    constructor(shape: T, lengths?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (lengths !== undefined) { this.lengths = lengths; }
    }
    /**
     * The wire to evaluate.
     * @default undefined
     */
    shape!: T;
    /**
     * The distances from the start along the wire, in model units, one point each.
     * @default undefined
     */
    lengths!: number[];
}
/**
 * A radius, a center and a plane normal for the circle edge, wire and face methods of `shapes` and
 * `geom.curves.geomCircleCurve`.
 */
export class CircleDto {
    constructor(radius?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (radius !== undefined) { this.radius = radius; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The distance from the center to the circle, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * The point the circle is centered on.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the circle lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * A rectangle, hexagon counts and optional patterns for `shapes.wire.hexagonsInGrid` and
 * `shapes.face.hexagonsInGrid`, which fill the rectangle on the ground plane with a honeycomb.
 */
export class HexagonsInGridDto {
    constructor(wdith?: number, height?: number, nrHexagonsInHeight?: number, nrHexagonsInWidth?: number, flatTop?: boolean, extendTop?: boolean, extendBottom?: boolean, extendLeft?: boolean, extendRight?: boolean, scalePatternWidth?: number[], scalePatternHeight?: number[], filletPattern?: number[], inclusionPattern?: boolean[]) {
        if (wdith !== undefined) { this.width = wdith; }
        if (height !== undefined) { this.height = height; }
        if (nrHexagonsInHeight !== undefined) { this.nrHexagonsInHeight = nrHexagonsInHeight; }
        if (nrHexagonsInWidth !== undefined) { this.nrHexagonsInWidth = nrHexagonsInWidth; }
        if (flatTop !== undefined) { this.flatTop = flatTop; }
        if (extendTop !== undefined) { this.extendTop = extendTop; }
        if (extendBottom !== undefined) { this.extendBottom = extendBottom; }
        if (extendLeft !== undefined) { this.extendLeft = extendLeft; }
        if (extendRight !== undefined) { this.extendRight = extendRight; }
        if (scalePatternWidth !== undefined) { this.scalePatternWidth = scalePatternWidth; }
        if (scalePatternHeight !== undefined) { this.scalePatternHeight = scalePatternHeight; }
        if (filletPattern !== undefined) { this.filletPattern = filletPattern; }
        if (inclusionPattern !== undefined) { this.inclusionPattern = inclusionPattern; }
    }
    /**
     * The width of the rectangle to fill, in model units; the hexagon size follows from it and the
     * counts.
     * @default 10
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width?: number | undefined = 10;
    /**
     * The height of the rectangle to fill, in model units.
     * @default 10
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height?: number | undefined = 10;
    /**
     * How many hexagons fit across the width.
     * @default 10
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    nrHexagonsInWidth?: number | undefined = 10;
    /**
     * How many hexagons fit across the height.
     * @default 10
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    nrHexagonsInHeight?: number | undefined = 10;
    /**
     * When true, the hexagons have a flat side at the top and bottom; when false a corner points
     * up.
     * @default false
     */
    flatTop?: boolean | undefined = false;
    /**
     * When true, the grid is stretched so its top row reaches past the top edge, covering it
     * without a jagged border.
     * @default false
     */
    extendTop?: boolean | undefined = false;
    /**
     * When true, the grid is stretched so its bottom row reaches past the bottom edge, covering it
     * without a jagged border.
     * @default false
     */
    extendBottom?: boolean | undefined = false;
    /**
     * When true, the grid is stretched so its left column reaches past the left edge, covering it
     * without a jagged border.
     * @default false
     */
    extendLeft?: boolean | undefined = false;
    /**
     * When true, the grid is stretched so its right column reaches past the right edge, covering it
     * without a jagged border.
     * @default false
     */
    extendRight?: boolean | undefined = false;
    /**
     * Sizes of the hexagons along the width as fractions of their full size, applied in turn; 1 or
     * no list means no scaling.
     * @default undefined
     * @optional true
     */
    scalePatternWidth?: number[] | undefined;
    /**
     * Sizes of the hexagons along the height as fractions of their full size, applied in turn; 1 or
     * no list means no scaling.
     * @default undefined
     * @optional true
     */
    scalePatternHeight?: number[] | undefined;
    /**
     * Corner rounding of the hexagons as fractions from 0 to 1 of the largest radius that fits,
     * applied in turn; 0 leaves sharp corners.
     * @default undefined
     * @optional true
     */
    filletPattern?: number[] | undefined;
    /**
     * Which hexagons are built, applied in turn: true builds one, false skips it.
     * @default undefined
     * @optional true
     */
    inclusionPattern?: boolean[] | undefined;
}
