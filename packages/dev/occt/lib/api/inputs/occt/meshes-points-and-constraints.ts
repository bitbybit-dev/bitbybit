// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { circleInclusionEnum, positionResultEnum, twoCircleInclusionEnum } from "./enums";

/**
 * The triangle mesh of a shape as `shapeToMesh` returns it: one entry per face with its triangles,
 * one per edge with its points, and the vertex points, ready for drawing.
 */
export class DecomposedMeshDto {
    constructor(faceList?: DecomposedFaceDto[], edgeList?: DecomposedEdgeDto[]) {
        if (faceList !== undefined) { this.faceList = faceList; }
        if (edgeList !== undefined) { this.edgeList = edgeList; }
    }
    /**
     * One entry per face with its triangulation.
     */
    faceList!: DecomposedFaceDto[];
    /**
     * One entry per edge with the points that trace it.
     */
    edgeList!: DecomposedEdgeDto[];
    /**
     * The points of the shape's standalone vertices.
     */
    pointsList!: Base.Point3[];
    /**
     * Which faces carry which color, keyed by `#rrggbbaa`; present only for meshes made from an
     * assembly document.
     */
    colorGroups?: { [color: string]: number[] } | undefined;
}

/**
 * The triangulation of one face inside a `DecomposedMeshDto`: flat coordinate lists the way
 * graphics libraries take them, plus optional facts about the face when `computeMetadata` was set.
 */
export class DecomposedFaceDto {
    /**
     * The position of the face in the shape, counting from 0 in the order `shapes.face.getFaces`
     * uses.
     */
    faceIndex!: number;
    /**
     * The vertex normals as a flat list of x, y, z triples, one per vertex.
     */
    normalCoord!: number[];
    /**
     * How many triangles the face was cut into.
     */
    numberOfTriangles!: number;
    /**
     * The triangles as a flat list of vertex indexes, three per triangle.
     */
    triIndexes!: number[];
    /**
     * The vertex positions as a flat list of x, y, z triples.
     */
    vertexCoord!: number[];
    /**
     * The same vertex positions as a list of points.
     */
    vertexCoordVec!: Base.Vector3[];
    /**
     * A point in the middle of the face's parameter range, on the surface.
     */
    centerPoint!: Base.Point3;
    /**
     * The surface normal at `centerPoint`.
     */
    centerNormal!: Base.Vector3;
    /**
     * The texture coordinates as a flat list of u, v pairs, one per vertex.
     */
    uvs!: number[];
    /**
     * The surface area of the face in square model units; present only with `computeMetadata`.
     */
    area?: number | undefined;
    /**
     * The center of mass of the face; present only with `computeMetadata`.
     */
    centerOfMass?: Base.Point3 | undefined;
    /**
     * The kind of surface the face lies on, such as `Plane`, `Cylinder` or `BSplineSurface`;
     * present only with `computeMetadata`.
     */
    surfaceType?: string | undefined;
    /**
     * The geometric tolerance of the face in model units; present only with `computeMetadata`.
     */
    tolerance?: number | undefined;
    /**
     * The indexes of the faces that share an edge with this one; present only with
     * `computeMetadata`.
     */
    adjacentFaces?: number[] | undefined;
    /**
     * The face's stable id in the shape's graph, or -1 when unavailable; present only with
     * `computeMetadata`.
     */
    faceUid?: number | undefined;
}
/**
 * One edge inside a `DecomposedMeshDto`: the points that trace it for drawing, plus optional facts
 * about the edge when `computeMetadata` was set.
 */
export class DecomposedEdgeDto {
    /**
     * The position of the edge in the shape, counting from 0 in the order `shapes.edge.getEdges`
     * uses.
     */
    edgeIndex!: number;
    /**
     * A point halfway along the edge's parameter range.
     */
    middlePoint!: Base.Point3;
    /**
     * The points that trace the edge, in order, close enough to draw it as a polyline.
     */
    vertexCoord!: Base.Vector3[];
    /**
     * The length of the edge in model units; present only with `computeMetadata`.
     */
    length?: number | undefined;
    /**
     * The center of mass of the edge; present only with `computeMetadata`.
     */
    centerOfMass?: Base.Point3 | undefined;
    /**
     * The kind of curve the edge follows, such as `Line`, `Circle` or `BSplineCurve`; present only
     * with `computeMetadata`.
     */
    curveType?: string | undefined;
    /**
     * True when the edge has no 3D curve, such as the seam at the pole of a sphere; present only
     * with `computeMetadata`.
     */
    degenerated?: boolean | undefined;
    /**
     * The indexes of the faces this edge belongs to; present only with `computeMetadata`.
     */
    incidentFaces?: number[] | undefined;
    /**
     * The edge's stable id in the shape's graph, or -1 when unavailable; present only with
     * `computeMetadata`.
     */
    edgeUid?: number | undefined;
}
/**
 * A list of shapes for the methods that take several at once, such as `shapes.face.getFacesAreas`
 * or `shapes.wire.getWiresLengths`.
 */
export class ShapesDto<T> {
    constructor(shapes?: T[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
    }
    /**
     * The shapes to work on, in the order the results should come back.
     * @default undefined
     */
    shapes!: T[];
}
/**
 * One point for `shapes.vertex.vertexFromPoint`, which turns it into a vertex shape.
 */
export class PointDto {
    constructor(point?: Base.Point3) {
        if (point !== undefined) { this.point = point; }
    }
    /**
     * The position of the vertex, in model units.
     * @default [0, 0, 0]
     */
    point: Base.Point3 = [0, 0, 0];
}
/**
 * Three coordinates for `shapes.vertex.vertexFromXYZ`, which turns them into a vertex shape.
 */
export class XYZDto {
    constructor(x?: number, y?: number, z?: number) {
        if (x !== undefined) { this.x = x; }
        if (y !== undefined) { this.y = y; }
        if (z !== undefined) { this.z = z; }
    }
    /**
     * The X coordinate, in model units.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    x: number = 0;
    /**
     * The Y coordinate, in model units; Y is up.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    y: number = 0;
    /**
     * The Z coordinate, in model units.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    z: number = 0;
}
/**
 * A list of points for the methods that build shapes from them, such as
 * `shapes.vertex.verticesFromPoints`, `shapes.edge.fromPoints` and `shapes.wire.fromPoints`.
 */
export class PointsDto {
    constructor(points?: Base.Point3[]) {
        if (points !== undefined) { this.points = points; }
    }
    /**
     * The points, in the order the shapes should follow them.
     * @default undefined
     */
    points!: Base.Point3[];
}
/**
 * A circle, a point outside it and the filtering options for
 * `shapes.edge.constraintTanLinesFromPtToCircle`, which draws the tangent lines from the point to
 * the circle.
 */
export class ConstraintTanLinesFromPtToCircleDto<T> {
    constructor(circle?: T, point?: Base.Point3, tolerance?: number, positionResult?: positionResultEnum, circleRemainder?: circleInclusionEnum) {
        if (circle !== undefined) { this.circle = circle; }
        if (point !== undefined) { this.point = point; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (positionResult !== undefined) { this.positionResult = positionResult; }
        if (circleRemainder !== undefined) { this.circleRemainder = circleRemainder; }
    }
    /**
     * The circle edge the lines must touch.
     * @default undefined
     */
    circle!: T;
    /**
     * The point the lines start from; it must lie outside the circle.
     * @default undefined
     */
    point!: Base.Point3;
    /**
     * How close a line must come to the circle to count as touching it, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
    /**
     * Which lines to keep: those on one side of the circle, the other side, or all of them.
     * @default all
     */
    positionResult: positionResultEnum = positionResultEnum.all;
    /**
     * Whether to add the piece of the circle between the touching points on one side or the other;
     * `none` adds nothing.
     * @default none
     */
    circleRemainder: circleInclusionEnum = circleInclusionEnum.none;
}
/**
 * A circle, two points and the filtering options for
 * `shapes.edge.constraintTanLinesFromTwoPtsToCircle`, which draws the tangent lines from each point
 * to the circle.
 */
export class ConstraintTanLinesFromTwoPtsToCircleDto<T> {
    constructor(circle?: T, point1?: Base.Point3, point2?: Base.Point3, tolerance?: number, positionResult?: positionResultEnum, circleRemainder?: circleInclusionEnum) {
        if (circle !== undefined) { this.circle = circle; }
        if (point1 !== undefined) { this.point1 = point1; }
        if (point2 !== undefined) { this.point1 = point2; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (positionResult !== undefined) { this.positionResult = positionResult; }
        if (circleRemainder !== undefined) { this.circleRemainder = circleRemainder; }
    }
    /**
     * The circle edge the lines must touch.
     * @default undefined
     */
    circle!: T;
    /**
     * The first point the lines start from; it must lie outside the circle.
     * @default undefined
     */
    point1!: Base.Point3;
    /**
     * The second point the lines start from; it must lie outside the circle.
     * @default undefined
     */
    point2!: Base.Point3;
    /**
     * How close a line must come to the circle to count as touching it, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
    /**
     * Which lines to keep: those on one side of the circle, the other side, or all of them.
     * @default all
     */
    positionResult: positionResultEnum = positionResultEnum.all;
    /**
     * Whether to add the piece of the circle between the touching points on one side or the other;
     * `none` adds nothing.
     * @default none
     */
    circleRemainder: circleInclusionEnum = circleInclusionEnum.none;
}
/**
 * Two circles and the filtering options for `shapes.edge.constraintTanLinesOnTwoCircles` and
 * `shapes.wire.createWireFromTwoCirclesTan`, which draw the lines that touch both circles.
 */
export class ConstraintTanLinesOnTwoCirclesDto<T> {
    constructor(circle1?: T, circle2?: T, tolerance?: number, positionResult?: positionResultEnum, circleRemainders?: twoCircleInclusionEnum) {
        if (circle1 !== undefined) { this.circle1 = circle1; }
        if (circle2 !== undefined) { this.circle2 = circle2; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (positionResult !== undefined) { this.positionResult = positionResult; }
        if (circleRemainders !== undefined) { this.circleRemainders = circleRemainders; }
    }
    /**
     * The first circle edge the lines must touch.
     * @default undefined
     */
    circle1!: T;
    /**
     * The second circle edge the lines must touch.
     * @default undefined
     */
    circle2!: T;
    /**
     * How close a line must come to a circle to count as touching it, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
    /**
     * Which lines to keep: the outer pair, the crossing inner pair, or all of them.
     * @default all
     */
    positionResult: positionResultEnum = positionResultEnum.all;
    /**
     * Which pieces of the circles between the touching points to add: the outside arcs, the inside
     * arcs, one of each, or `none`.
     * @default none
     */
    circleRemainders: twoCircleInclusionEnum = twoCircleInclusionEnum.none;
}

/**
 * Two circles and a radius for `shapes.edge.constraintTanCirclesOnTwoCircles`, which draws the
 * circles of that radius touching both.
 */
export class ConstraintTanCirclesOnTwoCirclesDto<T> {
    constructor(circle1?: T, circle2?: T, tolerance?: number, radius?: number) {
        if (circle1 !== undefined) { this.circle1 = circle1; }
        if (circle2 !== undefined) { this.circle2 = circle2; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (radius !== undefined) { this.radius = radius; }
    }
    /**
     * The first circle edge the new circles must touch.
     * @default undefined
     */
    circle1!: T;
    /**
     * The second circle edge the new circles must touch.
     * @default undefined
     */
    circle2!: T;
    /**
     * How close a circle must come to the others to count as touching, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
    /**
     * The radius of the circles to draw, in model units.
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 0.3;
}
/**
 * A circle, a point and a radius for `shapes.edge.constraintTanCirclesOnCircleAndPnt`, which draws
 * the circles of that radius through the point that touch the circle.
 */
export class ConstraintTanCirclesOnCircleAndPntDto<T> {
    constructor(circle?: T, point?: Base.Point3, tolerance?: number, radius?: number) {
        if (circle !== undefined) { this.circle = circle; }
        if (point !== undefined) { this.point = point; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (radius !== undefined) { this.radius = radius; }
    }
    /**
     * The circle edge the new circles must touch.
     * @default undefined
     */
    circle!: T;
    /**
     * The point the new circles must pass through.
     * @default undefined
     */
    point!: Base.Point3;
    /**
     * How close a circle must come to the other to count as touching, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
    /**
     * The radius of the circles to draw, in model units.
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 0.3;
}
/**
 * A 2D curve and a surface for `shapes.edge.makeEdgeFromGeom2dCurveAndSurface`, which lays the
 * curve onto the surface as an edge.
 */
export class CurveAndSurfaceDto<T, U> {
    constructor(curve?: T, surface?: U) {
        if (curve !== undefined) { this.curve = curve; }
        if (surface !== undefined) { this.surface = surface; }
    }
    /**
     * The 2D curve, drawn in the surface's UV space.
     * @default undefined
     */
    curve!: T;
    /**
     * The surface the curve is laid onto.
     * @default undefined
     */
    surface!: U;
}
/**
 * Two edges in a plane, the plane and a radius for `fillets.filletTwoEdgesInPlaneIntoAWire`, which
 * joins them with a rounding arc.
 */
export class FilletTwoEdgesInPlaneDto<T> {
    constructor(edge1?: T, edge2?: T, planeOrigin?: Base.Point3, planeDirection?: Base.Vector3, radius?: number, solution?: number) {
        if (edge1 !== undefined) { this.edge1 = edge1; }
        if (edge2 !== undefined) { this.edge2 = edge2; }
        if (planeOrigin !== undefined) { this.planeOrigin = planeOrigin; }
        if (planeDirection !== undefined) { this.planeDirection = planeDirection; }
        if (radius !== undefined) { this.radius = radius; }
        if (solution !== undefined) { this.solution = solution; }
    }
    /**
     * The first edge to join.
     * @default undefined
     */
    edge1!: T;
    /**
     * The second edge to join.
     * @default undefined
     */
    edge2!: T;
    /**
     * A point on the plane the edges lie in; with `solution` at -1 it also picks the arc nearest to
     * it.
     * @default [0, 0, 0]
     */
    planeOrigin: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the edges lie in.
     * @default [0, 1, 0]
     */
    planeDirection: Base.Vector3 = [0, 1, 0];
    /**
     * The radius of the rounding arc, in model units.
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 0.3;
    /**
     * Which arc to use when several fit, counted from 0; -1 takes the one nearest `planeOrigin`.
     * @default -1
     * @optional true
     */
    solution?: number | undefined = -1;
}
/**
 * A shape and points for `operations.closestPointsOnShapeFromPoints` and
 * `operations.distancesToShapeFromPoints`.
 */
export class ClosestPointsOnShapeFromPointsDto<T> {
    constructor(shape?: T, points?: Base.Point3[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (points !== undefined) { this.points = points; }
    }
    /**
     * The shape the closest points are looked for on.
     * @default undefined
     */
    shape!: T;
    /**
     * The points to measure from, in the order the results should come back.
     * @default undefined
     */
    points!: Base.Point3[];
}
/**
 * A bounding box description, as `operations.boundingBoxOfShape` returns it, wrapped for passing
 * on.
 */
export class BoundingBoxDto {
    constructor(bbox?: BoundingBoxPropsDto) {
        if (bbox !== undefined) { this.bbox = bbox; }
    }
    /**
     * The box as its corners, center and size.
     * @default undefined
     */
    bbox?: BoundingBoxPropsDto | undefined;
}
/**
 * The axis-aligned box around a shape, as `operations.boundingBoxOfShape` returns it.
 */
export class BoundingBoxPropsDto {
    constructor(min?: Base.Point3, max?: Base.Point3, center?: Base.Point3, size?: Base.Vector3) {
        if (min !== undefined) { this.min = min; }
        if (max !== undefined) { this.max = max; }
        if (center !== undefined) { this.center = center; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * The corner with the smallest X, Y and Z.
     * @default [0, 0, 0]
     */
    min: Base.Point3 = [0, 0, 0];
    /**
     * The corner with the largest X, Y and Z.
     * @default [0, 0, 0]
     */
    max: Base.Point3 = [0, 0, 0];
    /**
     * The point halfway between the two corners.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The extent along X, Y and Z, in model units.
     * @default [0, 0, 0]
     */
    size: Base.Vector3 = [0, 0, 0];
}
/**
 * The sphere around a shape, as `operations.boundingSphereOfShape` returns it.
 */
export class BoundingSpherePropsDto {
    constructor(center?: Base.Point3, radius?: number) {
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
    }
    /**
     * The center of the sphere, which is the center of the shape's bounding box.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The distance from the center to the box's corner, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 0;
}
/**
 * A wire and points for `shapes.wire.splitOnPoints`, which cuts the wire at the points.
 */
export class SplitWireOnPointsDto<T> {
    constructor(shape?: T, points?: Base.Point3[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (points !== undefined) { this.points = points; }
    }
    /**
     * The wire to cut into pieces.
     * @default undefined
     */
    shape!: T;
    /**
     * Where to cut; each point is moved to the closest place on the wire first.
     * @default undefined
     */
    points!: Base.Point3[];
}

/**
 * Shapes and points for `operations.closestPointsOnShapesFromPoints`, which finds the closest point
 * on every shape for every point.
 */
export class ClosestPointsOnShapesFromPointsDto<T> {
    constructor(shapes?: T[], points?: Base.Point3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (points !== undefined) { this.points = points; }
    }
    /**
     * The shapes the closest points are looked for on, in the order the result groups them.
     * @default undefined
     */
    shapes!: T[];
    /**
     * The points to measure from.
     * @default undefined
     */
    points!: Base.Point3[];
}
/**
 * Two shapes for `operations.closestPointsBetweenTwoShapes`, which finds the pair of points where
 * they come closest.
 */
export class ClosestPointsBetweenTwoShapesDto<T> {
    constructor(shape1?: T, shape2?: T) {
        if (shape1 !== undefined) { this.shape1 = shape1; }
        if (shape2 !== undefined) { this.shape2 = shape2; }
    }
    /**
     * The first shape; the first point of the result lies on it.
     * @default undefined
     */
    shape1!: T;
    /**
     * The second shape; the second point of the result lies on it.
     * @default undefined
     */
    shape2!: T;
}
/**
 * A surface, a wire on it and a side for `shapes.face.faceFromSurfaceAndWire`.
 */
export class FaceFromSurfaceAndWireDto<T, U> {
    constructor(surface?: T, wire?: U, inside?: boolean) {
        if (surface !== undefined) { this.surface = surface; }
        if (wire !== undefined) { this.wire = wire; }
        if (inside !== undefined) { this.inside = inside; }
    }
    /**
     * The surface the face is cut from.
     * @default undefined
     */
    surface!: T;
    /**
     * The wire lying on the surface that bounds the face.
     * @default undefined
     */
    wire!: U;
    /**
     * When true, the wire is turned so the face is the region it encloses; when false the wire's
     * own direction decides.
     * @default true
     */
    inside = true;
}
/**
 * A flat wire and a face for `shapes.wire.placeWireOnFace`, which maps the wire onto the face's
 * surface.
 */
export class WireOnFaceDto<T, U> {
    constructor(wire?: T, face?: U) {
        if (wire !== undefined) { this.wire = wire; }
        if (face !== undefined) { this.face = face; }
    }
    /**
     * The wire drawn on the ground plane; its Z coordinate becomes U and its X coordinate V.
     * @default undefined
     */
    wire!: T;
    /**
     * The face whose surface the wire is mapped onto.
     * @default undefined
     */
    face!: U;
}
/**
 * A shape and how to draw it, for the renderer packages' shape drawing: colors and opacity of
 * faces, edges and vertices, what to show, and how finely to mesh the shape.
 */
export class DrawShapeDto<T> {
    /**
     * Provide options without default values
     */
    constructor(shape?: T, faceOpacity?: number, edgeOpacity?: number, edgeColour?: Base.Color, faceMaterial?: Base.Material, faceColour?: Base.Color, edgeWidth?: number, drawEdges?: boolean, drawFaces?: boolean, drawVertices?: boolean, vertexColour?: Base.Color, vertexSize?: number, precision?: number, drawEdgeIndexes?: boolean, edgeIndexHeight?: number, edgeIndexColour?: Base.Color, drawFaceIndexes?: boolean, faceIndexHeight?: number, faceIndexColour?: Base.Color, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number, keepMeshData?: boolean, allowQualityDecrease?: boolean, forceFaceDeflection?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (faceOpacity !== undefined) { this.faceOpacity = faceOpacity; }
        if (edgeOpacity !== undefined) { this.edgeOpacity = edgeOpacity; }
        if (edgeColour !== undefined) { this.edgeColour = edgeColour; }
        if (faceMaterial !== undefined) { this.faceMaterial = faceMaterial; }
        if (faceColour !== undefined) { this.faceColour = faceColour; }
        if (vertexColour !== undefined) { this.vertexColour = vertexColour; }
        if (vertexSize !== undefined) { this.vertexSize = vertexSize; }
        if (edgeWidth !== undefined) { this.edgeWidth = edgeWidth; }
        if (drawEdges !== undefined) { this.drawEdges = drawEdges; }
        if (drawFaces !== undefined) { this.drawFaces = drawFaces; }
        if (drawVertices !== undefined) { this.drawVertices = drawVertices; }
        if (precision !== undefined) { this.precision = precision; }
        if (drawEdgeIndexes !== undefined) { this.drawEdgeIndexes = drawEdgeIndexes; }
        if (edgeIndexHeight !== undefined) { this.edgeIndexHeight = edgeIndexHeight; }
        if (edgeIndexColour !== undefined) { this.edgeIndexColour = edgeIndexColour; }
        if (drawFaceIndexes !== undefined) { this.drawFaceIndexes = drawFaceIndexes; }
        if (faceIndexHeight !== undefined) { this.faceIndexHeight = faceIndexHeight; }
        if (faceIndexColour !== undefined) { this.faceIndexColour = faceIndexColour; }
        if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
        if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
        if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
        if (keepMeshData !== undefined) { this.keepMeshData = keepMeshData; }
        if (allowQualityDecrease !== undefined) { this.allowQualityDecrease = allowQualityDecrease; }
        if (forceFaceDeflection !== undefined) { this.forceFaceDeflection = forceFaceDeflection; }
    }
    /**
     * The shape to draw; it is meshed at `precision` first.
     * @default undefined
     */
    shape?: T | undefined;
    /**
     * How opaque the faces are, from 0 for invisible to 1 for solid.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    faceOpacity = 1;
    /**
     * How opaque the edges are, from 0 for invisible to 1 for solid.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    edgeOpacity = 1;
    /**
     * The color of the edges as a hex string such as `#ffffff`.
     * @default #ffffff
     */
    edgeColour: Base.Color = "#ffffff";
    /**
     * A material for the faces from the rendering engine; when given it replaces the face color.
     * @default undefined
     * @optional true
     */
    faceMaterial?: Base.Material | undefined;
    /**
     * The color of the faces as a hex string such as `#ff0000`.
     * @default #ff0000
     */
    faceColour: Base.Color = "#ff0000";
    /**
     * How thick the edge lines are drawn.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    edgeWidth = 2;
    /**
     * When false, the edges are not drawn.
     * @default true
     */
    drawEdges = true;
    /**
     * When false, the faces are not drawn.
     * @default true
     */
    drawFaces = true;
    /**
     * When true, the vertices are drawn as small markers.
     * @default false
     */
    drawVertices = false;
    /**
     * The color of the vertex markers as a hex string.
     * @default #ff00ff
     */
    vertexColour = "#ffaaff";
    /**
     * The size of the vertex markers, in model units.
     * @default 0.03
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    vertexSize = 0.03;
    /**
     * The meshing tolerance in model units; a smaller value follows curved surfaces more closely
     * with more triangles.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    precision = 0.01;
    /**
     * When true, each edge's index is written next to it, handy for picking edges to fillet.
     * @default false
     */
    drawEdgeIndexes = false;
    /**
     * The height of the edge index labels, in model units.
     * @default 0.06
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    edgeIndexHeight = 0.06;
    /**
     * The color of the edge index labels as a hex string.
     * @default #ff00ff
     */
    edgeIndexColour: Base.Color = "#ff00ff";
    /**
     * When true, each face's index is written on it, handy for picking faces.
     * @default false
     */
    drawFaceIndexes = false;
    /**
     * The height of the face index labels, in model units.
     * @default 0.06
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    faceIndexHeight = 0.06;
    /**
     * The color of the face index labels as a hex string.
     * @default #0000ff
     */
    faceIndexColour: Base.Color = "#0000ff";
    /**
     * When true, the back of each face is drawn in its own color, which shows which way faces
     * point.
     * @default true
     */
    drawTwoSided = true;
    /**
     * The color of the back of the faces as a hex string; used only with `drawTwoSided`.
     * @default #0000ff
     */
    backFaceColour: Base.Color = "#0000ff";
    /**
     * How opaque the back of the faces is, from 0 to 1; used only with `drawTwoSided`.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    backFaceOpacity = 1;
    /**
     * When true, the triangulation stays cached on the shape after drawing; when false it is
     * cleared so memory does not grow across draws.
     * @default false
     */
    keepMeshData = false;
    /**
     * When true, a shape already meshed more finely may be remeshed at the coarser precision asked
     * for.
     * @default true
     */
    allowQualityDecrease = true;
    /**
     * When true, every face is remeshed at the requested precision even when a triangulation is
     * cached.
     * @default false
     */
    forceFaceDeflection = false;
}
/**
 * Shapes and how to draw them, for the renderer packages' shape drawing: the same options as
 * `DrawShapeDto`, applied to every shape in the list.
 */
export class DrawShapesDto<T> {

    /**
     * Provide options without default values
     */
    constructor(shapes?: T[], faceOpacity?: number, edgeOpacity?: number, edgeColour?: Base.Color, faceMaterial?: Base.Material, faceColour?: Base.Color, edgeWidth?: number, drawEdges?: boolean, drawFaces?: boolean, drawVertices?: boolean, vertexColour?: Base.Color, vertexSize?: number, precision?: number, drawEdgeIndexes?: boolean, edgeIndexHeight?: number, edgeIndexColour?: Base.Color, drawFaceIndexes?: boolean, faceIndexHeight?: number, faceIndexColour?: Base.Color, drawTwoSided?: boolean, backFaceColour?: Base.Color, backFaceOpacity?: number, keepMeshData?: boolean, allowQualityDecrease?: boolean, forceFaceDeflection?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (faceOpacity !== undefined) { this.faceOpacity = faceOpacity; }
        if (edgeOpacity !== undefined) { this.edgeOpacity = edgeOpacity; }
        if (edgeColour !== undefined) { this.edgeColour = edgeColour; }
        if (faceMaterial !== undefined) { this.faceMaterial = faceMaterial; }
        if (faceColour !== undefined) { this.faceColour = faceColour; }
        if (vertexColour !== undefined) { this.vertexColour = vertexColour; }
        if (vertexSize !== undefined) { this.vertexSize = vertexSize; }
        if (edgeWidth !== undefined) { this.edgeWidth = edgeWidth; }
        if (drawEdges !== undefined) { this.drawEdges = drawEdges; }
        if (drawFaces !== undefined) { this.drawFaces = drawFaces; }
        if (drawVertices !== undefined) { this.drawVertices = drawVertices; }
        if (precision !== undefined) { this.precision = precision; }
        if (drawEdgeIndexes !== undefined) { this.drawEdgeIndexes = drawEdgeIndexes; }
        if (edgeIndexHeight !== undefined) { this.edgeIndexHeight = edgeIndexHeight; }
        if (edgeIndexColour !== undefined) { this.edgeIndexColour = edgeIndexColour; }
        if (drawFaceIndexes !== undefined) { this.drawFaceIndexes = drawFaceIndexes; }
        if (faceIndexHeight !== undefined) { this.faceIndexHeight = faceIndexHeight; }
        if (faceIndexColour !== undefined) { this.faceIndexColour = faceIndexColour; }
        if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
        if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
        if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
        if (keepMeshData !== undefined) { this.keepMeshData = keepMeshData; }
        if (allowQualityDecrease !== undefined) { this.allowQualityDecrease = allowQualityDecrease; }
        if (forceFaceDeflection !== undefined) { this.forceFaceDeflection = forceFaceDeflection; }
    }
    /**
     * The shapes to draw with the same options.
     * @default undefined
     */
    shapes!: T[];
    /**
     * How opaque the faces are, from 0 for invisible to 1 for solid.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    faceOpacity = 1;
    /**
     * How opaque the edges are, from 0 for invisible to 1 for solid.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    edgeOpacity = 1;
    /**
     * The color of the edges as a hex string such as `#ffffff`.
     * @default #ffffff
     */
    edgeColour: Base.Color = "#ffffff";
    /**
     * A material for the faces from the rendering engine; when given it replaces the face color.
     * @default undefined
     * @optional true
     */
    faceMaterial?: Base.Material | undefined;
    /**
     * The color of the faces as a hex string such as `#ff0000`.
     * @default #ff0000
     */
    faceColour: Base.Color = "#ff0000";
    /**
     * How thick the edge lines are drawn.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    edgeWidth = 2;
    /**
     * When false, the edges are not drawn.
     * @default true
     */
    drawEdges = true;
    /**
     * When false, the faces are not drawn.
     * @default true
     */
    drawFaces = true;
    /**
     * When true, the vertices are drawn as small markers.
     * @default false
     */
    drawVertices = false;
    /**
     * The color of the vertex markers as a hex string.
     * @default #ff00ff
     */
    vertexColour = "#ffaaff";
    /**
     * The size of the vertex markers, in model units.
     * @default 0.03
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    vertexSize = 0.03;
    /**
     * The meshing tolerance in model units; a smaller value follows curved surfaces more closely
     * with more triangles.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    precision = 0.01;
    /**
     * When true, each edge's index is written next to it, handy for picking edges to fillet.
     * @default false
     */
    drawEdgeIndexes = false;
    /**
     * The height of the edge index labels, in model units.
     * @default 0.06
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    edgeIndexHeight = 0.06;
    /**
     * The color of the edge index labels as a hex string.
     * @default #ff00ff
     */
    edgeIndexColour: Base.Color = "#ff00ff";
    /**
     * When true, each face's index is written on it, handy for picking faces.
     * @default false
     */
    drawFaceIndexes = false;
    /**
     * The height of the face index labels, in model units.
     * @default 0.06
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    faceIndexHeight = 0.06;
    /**
     * The color of the face index labels as a hex string.
     * @default #0000ff
     */
    faceIndexColour: Base.Color = "#0000ff";
    /**
     * When true, the back of each face is drawn in its own color, which shows which way faces
     * point.
     * @default true
     */
    drawTwoSided = true;
    /**
     * The color of the back of the faces as a hex string; used only with `drawTwoSided`.
     * @default #0000ff
     */
    backFaceColour: Base.Color = "#0000ff";
    /**
     * How opaque the back of the faces is, from 0 to 1; used only with `drawTwoSided`.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    backFaceOpacity = 1;
    /**
     * When true, the triangulation stays cached on each shape after drawing; when false it is
     * cleared so memory does not grow across draws.
     * @default false
     */
    keepMeshData = false;
    /**
     * When true, a shape already meshed more finely may be remeshed at the coarser precision asked
     * for.
     * @default true
     */
    allowQualityDecrease = true;
    /**
     * When true, every face is remeshed at the requested precision even when a triangulation is
     * cached.
     * @default false
     */
    forceFaceDeflection = false;
}
