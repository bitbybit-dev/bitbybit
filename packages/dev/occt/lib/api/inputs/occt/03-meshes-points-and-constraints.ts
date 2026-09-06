// A fragment of the OCCT inputs namespace: scripts/gen-occ-inputs.mjs assembles every file in this
// directory, in file-name order, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { circleInclusionEnum, positionResultEnum, twoCircleInclusionEnum } from "./02-enums";

export class DecomposedMeshDto {
    constructor(faceList?: DecomposedFaceDto[], edgeList?: DecomposedEdgeDto[]) {
        if (faceList !== undefined) { this.faceList = faceList; }
        if (edgeList !== undefined) { this.edgeList = edgeList; }
    }
    /**
     * Face list for decomposed faces
     */
    faceList!: DecomposedFaceDto[];
    /**
     * Edge list for decomposed edges
     */
    edgeList!: DecomposedEdgeDto[];
    /**
     * The points list in a shape that includes vertex shapes
     */
    pointsList!: Base.Point3[];
    /**
     * Map of "#rrggbbaa" colour to the face indices carrying it. Only present for the docToMesh /
     * docToMeshes endpoints, which resolve per-face colours from the shape's XCAF document.
     */
    colorGroups?: { [color: string]: number[] } | undefined;
}

export class DecomposedFaceDto {
    faceIndex!: number;
    normalCoord!: number[];
    numberOfTriangles!: number;
    triIndexes!: number[];
    vertexCoord!: number[];
    vertexCoordVec!: Base.Vector3[];
    centerPoint!: Base.Point3;
    centerNormal!: Base.Vector3;
    uvs!: number[];
    /** Surface area of the face. Only present when shapeToMesh is called with computeMetadata. */
    area?: number | undefined;
    /** True center of mass of the face. Only present when computeMetadata is enabled. */
    centerOfMass?: Base.Point3 | undefined;
    /** Surface kind, e.g. "Plane", "Cylinder", "BSplineSurface". Only present with computeMetadata. */
    surfaceType?: string | undefined;
    /** OCCT tolerance of the face. Only present with computeMetadata. */
    tolerance?: number | undefined;
    /** Indices of faces sharing an edge with this face. Only present with computeMetadata. */
    adjacentFaces?: number[] | undefined;
    /** Stable BRepGraph UID of the face (-1 if unavailable). Only present with computeMetadata. */
    faceUid?: number | undefined;
}
export class DecomposedEdgeDto {
    edgeIndex!: number;
    middlePoint!: Base.Point3;
    vertexCoord!: Base.Vector3[];
    /** Length of the edge. Only present when shapeToMesh is called with computeMetadata. */
    length?: number | undefined;
    /** True center of mass of the edge. Only present when computeMetadata is enabled. */
    centerOfMass?: Base.Point3 | undefined;
    /** Curve kind, e.g. "Line", "Circle", "BSplineCurve". Only present with computeMetadata. */
    curveType?: string | undefined;
    /** Whether the edge is degenerated (no 3D curve). Only present with computeMetadata. */
    degenerated?: boolean | undefined;
    /** Indices of faces incident to this edge. Only present with computeMetadata. */
    incidentFaces?: number[] | undefined;
    /** Stable BRepGraph UID of the edge (-1 if unavailable). Only present with computeMetadata. */
    edgeUid?: number | undefined;
}
export class ShapesDto<T> {
    constructor(shapes?: T[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
    }
    /**
     * The OCCT shapes
     * @default undefined
     */
    shapes!: T[];
}
export class PointDto {
    constructor(point?: Base.Point3) {
        if (point !== undefined) { this.point = point; }
    }
    /**
     * The point
     * @default [0, 0, 0]
     */
    point: Base.Point3 = [0, 0, 0];
}
export class XYZDto {
    constructor(x?: number, y?: number, z?: number) {
        if (x !== undefined) { this.x = x; }
        if (y !== undefined) { this.y = y; }
        if (z !== undefined) { this.z = z; }
    }
    /**
     * X coord
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    x: number = 0;
    /**
     * Y coord
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    y: number = 0;
    /**
     * Z coord
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    z: number = 0;
}
export class PointsDto {
    constructor(points?: Base.Point3[]) {
        if (points !== undefined) { this.points = points; }
    }
    /**
     * The point
     * @default undefined
     */
    points!: Base.Point3[];
}
export class ConstraintTanLinesFromPtToCircleDto<T> {
    constructor(circle?: T, point?: Base.Point3, tolerance?: number, positionResult?: positionResultEnum, circleRemainder?: circleInclusionEnum) {
        if (circle !== undefined) { this.circle = circle; }
        if (point !== undefined) { this.point = point; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (positionResult !== undefined) { this.positionResult = positionResult; }
        if (circleRemainder !== undefined) { this.circleRemainder = circleRemainder; }
    }
    /**
     * The circle for tangent points
     * @default undefined
     */
    circle!: T;
    /**
     * The point from which to find the lines
     * @default undefined
     */
    point!: Base.Point3;
    /**
     * tolerance
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
    /**
     * Filters resulting lines by position
     * @default all
     */
    positionResult: positionResultEnum = positionResultEnum.all;
    /**
     * Splits provided circle on tangent points and adds it to the solutions
     * This only works when number of solutions contains 2 lines, when solution involves more than 4 lines, this option will be ignored.
     * @default none
     */
    circleRemainder: circleInclusionEnum = circleInclusionEnum.none;
}
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
     * The circle for tangent points
     * @default undefined
     */
    circle!: T;
    /**
     * The point from which to find the lines
     * @default undefined
     */
    point1!: Base.Point3;
    /**
     * The point from which to find the lines
     * @default undefined
     */
    point2!: Base.Point3;
    /**
     * tolerance
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
    /**
     * Filters resulting lines by position
     * @default all
     */
    positionResult: positionResultEnum = positionResultEnum.all;
    /**
     * Splits provided circle on tangent points and adds it to the solutions
     * This only works when number of solutions contains 2 lines, when solution involves more than 4 lines, this option will be ignored.
     * @default none
     */
    circleRemainder: circleInclusionEnum = circleInclusionEnum.none;
}
export class ConstraintTanLinesOnTwoCirclesDto<T> {
    constructor(circle1?: T, circle2?: T, tolerance?: number, positionResult?: positionResultEnum, circleRemainders?: twoCircleInclusionEnum) {
        if (circle1 !== undefined) { this.circle1 = circle1; }
        if (circle2 !== undefined) { this.circle2 = circle2; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (positionResult !== undefined) { this.positionResult = positionResult; }
        if (circleRemainders !== undefined) { this.circleRemainders = circleRemainders; }
    }
    /**
     * The first circle for tangential lines
     * @default undefined
     */
    circle1!: T;
    /**
     * The second circle for tangential lines
     * @default undefined
     */
    circle2!: T;
    /**
     * tolerance
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
    /**
     * Filters resulting lines by position relative to circles
     * @default all
     */
    positionResult: positionResultEnum = positionResultEnum.all;
    /**
     * Splits provided circles on tangent points and returns those as part of the solutions
     * This only works when number of solutions is limited to 2 lines, when solution involves more than 4 lines, this option will be ignored.
     * @default none
     */
    circleRemainders: twoCircleInclusionEnum = twoCircleInclusionEnum.none;
}

export class ConstraintTanCirclesOnTwoCirclesDto<T> {
    constructor(circle1?: T, circle2?: T, tolerance?: number, radius?: number) {
        if (circle1 !== undefined) { this.circle1 = circle1; }
        if (circle2 !== undefined) { this.circle2 = circle2; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (radius !== undefined) { this.radius = radius; }
    }
    /**
     * The first circle for tangential lines
     * @default undefined
     */
    circle1!: T;
    /**
     * The second circle for tangential lines
     * @default undefined
     */
    circle2!: T;
    /**
     * tolerance
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
    /**
     * Radius of the circles being constructed
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 0.3;
}
export class ConstraintTanCirclesOnCircleAndPntDto<T> {
    constructor(circle?: T, point?: Base.Point3, tolerance?: number, radius?: number) {
        if (circle !== undefined) { this.circle = circle; }
        if (point !== undefined) { this.point = point; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (radius !== undefined) { this.radius = radius; }
    }
    /**
     * The first circle for tangential lines
     * @default undefined
     */
    circle!: T;
    /**
     * The second circle for tangential lines
     * @default undefined
     */
    point!: Base.Point3;
    /**
     * tolerance
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
    /**
     * Radius of the circles being constructed
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 0.3;
}
export class CurveAndSurfaceDto<T, U> {
    constructor(curve?: T, surface?: U) {
        if (curve !== undefined) { this.curve = curve; }
        if (surface !== undefined) { this.surface = surface; }
    }
    /**
     * Curve
     * @default undefined
     */
    curve!: T;
    /**
     * Surface
     * @default undefined
     */
    surface!: U;
}
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
     * First OCCT edge to fillet
     * @default undefined
     */
    edge1!: T;
    /**
     * Second OCCT edge to fillet
     * @default undefined
     */
    edge2!: T;
    /**
     * Plane origin that is also used to find the closest solution if two solutions exist.
     * @default [0, 0, 0]
     */
    planeOrigin: Base.Point3 = [0, 0, 0];
    /**
     * Plane direction for fillet
     * @default [0, 1, 0]
     */
    planeDirection: Base.Vector3 = [0, 1, 0];
    /**
     * Radius of the fillet
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 0.3;
    /**
     * if solution is -1 planeOrigin chooses a particular fillet in case of several fillets may be constructed (for example, a circle intersecting a segment in 2 points). Put the intersecting (or common) point of the edges
     * @default -1
     * @optional true
     */
    solution?: number | undefined = -1;
}
export class ClosestPointsOnShapeFromPointsDto<T> {
    constructor(shape?: T, points?: Base.Point3[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (points !== undefined) { this.points = points; }
    }
    /**
     * The OCCT shape
     * @default undefined
     */
    shape!: T;
    /**
     * The list of points
     * @default undefined
     */
    points!: Base.Point3[];
}
export class BoundingBoxDto {
    constructor(bbox?: BoundingBoxPropsDto) {
        if (bbox !== undefined) { this.bbox = bbox; }
    }
    /**
     * Bounding box
     * @default undefined
     */
    bbox?: BoundingBoxPropsDto | undefined;
}
export class BoundingBoxPropsDto {
    constructor(min?: Base.Point3, max?: Base.Point3, center?: Base.Point3, size?: Base.Vector3) {
        if (min !== undefined) { this.min = min; }
        if (max !== undefined) { this.max = max; }
        if (center !== undefined) { this.center = center; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * Minimum point of the bounding box
     * @default [0, 0, 0]
     */
    min: Base.Point3 = [0, 0, 0];
    /**
     * Maximum point of the bounding box
     * @default [0, 0, 0]
     */
    max: Base.Point3 = [0, 0, 0];
    /**
     * Center point of the bounding box
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Size of the bounding box
     * @default [0, 0, 0]
     */
    size: Base.Vector3 = [0, 0, 0];
}
export class BoundingSpherePropsDto {
    constructor(center?: Base.Point3, radius?: number) {
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
    }
    /**
     * Center point of the bounding box
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Radius of the bounding sphere
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 0;
}
export class SplitWireOnPointsDto<T> {
    constructor(shape?: T, points?: Base.Point3[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (points !== undefined) { this.points = points; }
    }
    /**
     * The OCCT wire shape
     * @default undefined
     */
    shape!: T;
    /**
     * The list of points
     * @default undefined
     */
    points!: Base.Point3[];
}

export class ClosestPointsOnShapesFromPointsDto<T> {
    constructor(shapes?: T[], points?: Base.Point3[]) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (points !== undefined) { this.points = points; }
    }
    /**
     * The OCCT shapes
     * @default undefined
     */
    shapes!: T[];
    /**
     * The list of points
     * @default undefined
     */
    points!: Base.Point3[];
}
export class ClosestPointsBetweenTwoShapesDto<T> {
    constructor(shape1?: T, shape2?: T) {
        if (shape1 !== undefined) { this.shape1 = shape1; }
        if (shape2 !== undefined) { this.shape2 = shape2; }
    }
    /**
     * First OCCT shape
     * @default undefined
     */
    shape1!: T;
    /**
    * Second OCCT shape
    * @default undefined
    */
    shape2!: T;
}
export class FaceFromSurfaceAndWireDto<T, U> {
    constructor(surface?: T, wire?: U, inside?: boolean) {
        if (surface !== undefined) { this.surface = surface; }
        if (wire !== undefined) { this.wire = wire; }
        if (inside !== undefined) { this.inside = inside; }
    }
    /**
     * Surface from which to create a face
     * @default undefined
     */
    surface!: T;
    /**
     * Wire that represents a boundary on the surface to delimit the face
     * @default undefined
     */
    wire!: U;
    /**
     * Indicates wether face should be created inside or outside the wire
     * @default true
     */
    inside = true;
}
export class WireOnFaceDto<T, U> {
    constructor(wire?: T, face?: U) {
        if (wire !== undefined) { this.wire = wire; }
        if (face !== undefined) { this.face = face; }
    }
    /**
     * Wire to place on face
     * @default undefined
     */
    wire!: T;
    /**
     * Face on which the wire will be placed
     * @default undefined
     */
    face!: U;
}
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
     * Brep OpenCascade geometry
     * @default undefined
     */
    shape?: T | undefined;
    /**
     * Face opacity value between 0 and 1
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    faceOpacity = 1;
    /**
     * Edge opacity value between 0 and 1
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    edgeOpacity = 1;
    /**
     * Hex colour string for the edges
     * @default #ffffff
     */
    edgeColour: Base.Color = "#ffffff";
    /**
     * Face material
     * @default undefined
     * @optional true
     */
    faceMaterial?: Base.Material | undefined;
    /**
     * Hex colour string for face colour
     * @default #ff0000
     */
    faceColour: Base.Color = "#ff0000";
    /**
     * Edge width
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    edgeWidth = 2;
    /**
     * You can turn off drawing of edges via this property
     * @default true
     */
    drawEdges = true;
    /**
     * You can turn off drawing of faces via this property
     * @default true
     */
    drawFaces = true;
    /**
     * You can turn off drawing of vertexes via this property
     * @default false
     */
    drawVertices = false;
    /**
     * Color of the vertices that will be drawn
     * @default #ff00ff
     */
    vertexColour = "#ffaaff";
    /**
     * The size of a vertices that will be drawn
     * @default 0.03
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    vertexSize = 0.03;
    /**
     * Precision of the mesh that will be generated for the shape, lower number will mean more triangles
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    precision = 0.01;
    /**
     * Draw index of edges in space
     * @default false
     */
    drawEdgeIndexes = false;
    /**
     * Indicates the edge index height if they are drawn
     * @default 0.06
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    edgeIndexHeight = 0.06;
    /**
     * Edge index colour if the edges are drawn
     * @default #ff00ff
     */
    edgeIndexColour: Base.Color = "#ff00ff";
    /**
     * Draw indexes of faces in space
     * @default false
     */
    drawFaceIndexes = false;
    /**
     * Indicates the edge index height if they are drawn
     * @default 0.06
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    faceIndexHeight = 0.06;
    /**
     * Edge index colour if the edges are drawn
     * @default #0000ff
     */
    faceIndexColour: Base.Color = "#0000ff";
    /**
     * Draw two-sided faces with different colors for front and back. This helps visualize face orientation.
     * @default true
     */
    drawTwoSided = true;
    /**
     * Hex colour string for back face colour (negative side of the face). Only used when drawTwoSided is true.
     * @default #0000ff
     */
    backFaceColour: Base.Color = "#0000ff";
    /**
     * Back face opacity value between 0 and 1. Only used when drawTwoSided is true.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    backFaceOpacity = 1;
    /**
     * Keep the cached triangulation on the shape after meshing. When false (default) the mesh data
     * is flushed so it does not accumulate in memory across draws.
     * @default false
     */
    keepMeshData = false;
    /**
     * Allow re-meshing to a lower resolution triangulation than one already cached on the shape.
     * @default true
     */
    allowQualityDecrease = true;
    /**
     * Force every face to be re-meshed to the requested precision regardless of cached triangulation.
     * @default false
     */
    forceFaceDeflection = false;
}
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
     * Brep OpenCascade geometry
     * @default undefined
     */
    shapes!: T[];
    /**
     * Face opacity value between 0 and 1
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    faceOpacity = 1;
    /**
     * Edge opacity value between 0 and 1
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    edgeOpacity = 1;
    /**
     * Hex colour string for the edges
     * @default #ffffff
     */
    edgeColour: Base.Color = "#ffffff";
    /**
     * Face material
     * @default undefined
     * @optional true
     */
    faceMaterial?: Base.Material | undefined;
    /**
     * Hex colour string for face colour
     * @default #ff0000
     */
    faceColour: Base.Color = "#ff0000";
    /**
     * Edge width
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    edgeWidth = 2;
    /**
     * You can turn off drawing of edges via this property
     * @default true
     */
    drawEdges = true;
    /**
     * You can turn off drawing of faces via this property
     * @default true
     */
    drawFaces = true;
    /**
     * You can turn off drawing of vertexes via this property
     * @default false
     */
    drawVertices = false;
    /**
     * Color of the vertices that will be drawn
     * @default #ff00ff
     */
    vertexColour = "#ffaaff";
    /**
     * The size of a vertices that will be drawn
     * @default 0.03
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    vertexSize = 0.03;
    /**
     * Precision of the mesh that will be generated for the shape, lower number will mean more triangles
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    precision = 0.01;
    /**
     * Draw index of edges in space
     * @default false
     */
    drawEdgeIndexes = false;
    /**
     * Indicates the edge index height if they are drawn
     * @default 0.06
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    edgeIndexHeight = 0.06;
    /**
     * Edge index colour if the edges are drawn
     * @default #ff00ff
     */
    edgeIndexColour: Base.Color = "#ff00ff";
    /**
     * Draw indexes of faces in space
     * @default false
     */
    drawFaceIndexes = false;
    /**
     * Indicates the edge index height if they are drawn
     * @default 0.06
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    faceIndexHeight = 0.06;
    /**
     * Edge index colour if the edges are drawn
     * @default #0000ff
     */
    faceIndexColour: Base.Color = "#0000ff";
    /**
     * Draw two-sided faces with different colors for front and back. This helps visualize face orientation.
     * @default true
     */
    drawTwoSided = true;
    /**
     * Hex colour string for back face colour (negative side of the face). Only used when drawTwoSided is true.
     * @default #0000ff
     */
    backFaceColour: Base.Color = "#0000ff";
    /**
     * Back face opacity value between 0 and 1. Only used when drawTwoSided is true.
     * @default 1
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    backFaceOpacity = 1;
    /**
     * Keep the cached triangulation on each shape after meshing. When false (default) the mesh data
     * is flushed so it does not accumulate in memory across draws.
     * @default false
     */
    keepMeshData = false;
    /**
     * Allow re-meshing to a lower resolution triangulation than one already cached on a shape.
     * @default true
     */
    allowQualityDecrease = true;
    /**
     * Force every face to be re-meshed to the requested precision regardless of cached triangulation.
     * @default false
     */
    forceFaceDeflection = false;
}
