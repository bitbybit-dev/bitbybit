/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./inputs";

export namespace OCCT {

    export type GeomCurvePointer = { hash: number, type: string };
    export type Geom2dCurvePointer = { hash: number, type: string };
    export type GeomSurfacePointer = { hash: number, type: string };
    export type TopoDSVertexPointer = { hash: number, type: string };
    export type TopoDSEdgePointer = { hash: number, type: string };
    export type TopoDSWirePointer = { hash: number, type: string };
    export type TopoDSFacePointer = { hash: number, type: string };
    export type TopoDSShellPointer = { hash: number, type: string };
    export type TopoDSSolidPointer = { hash: number, type: string };
    export type TopoDSCompSolidPointer = { hash: number, type: string };
    export type TopoDSCompoundPointer = { hash: number, type: string };

    export type TopoDSShapePointer = TopoDSVertexPointer | TopoDSEdgePointer | TopoDSWirePointer | TopoDSFacePointer | TopoDSShellPointer | TopoDSSolidPointer | TopoDSCompoundPointer;

    export enum joinTypeEnum {
        arc = "arc",
        intersection = "intersection",
        tangent = "tangent"
    }
    export enum bRepOffsetModeEnum {
        skin = "skin",
        pipe = "pipe",
        rectoVerso = "rectoVerso"
    }
    export enum approxParametrizationTypeEnum {
        approxChordLength = "approxChordLength",
        approxCentripetal = "approxCentripetal",
        approxIsoParametric = "approxIsoParametric"
    }
    export enum directionEnum {
        outside = "outside",
        inside = "inside",
        middle = "middle"
    }
    export enum fileTypeEnum {
        iges = "iges",
        step = "step"
    }
    export enum topAbsOrientationEnum {
        forward = "forward",
        reversed = "reversed",
        internal = "internal",
        external = "external"
    }
    export enum topAbsStateEnum {
        in = "in",
        out = "out",
        on = "on",
        unknown = "unknown"
    }
    export enum shapeTypeEnum {
        unknown = "unknown",
        vertex = "vertex",
        edge = "edge",
        wire = "wire",
        face = "face",
        shell = "shell",
        solid = "solid",
        compSolid = "compSolid",
        compound = "compound",
        shape = "shape",
    }
    export enum gccEntPositionEnum {
        unqualified = "unqualified",
        enclosing = "enclosing",
        enclosed = "enclosed",
        outside = "outside",
        noqualifier = "noqualifier",
    }
    export enum positionResultEnum {
        keepSide1 = "keepSide1",
        keepSide2 = "keepSide2",
        all = "all",
    }
    export enum circleInclusionEnum {
        none = "none",
        keepSide1 = "keepSide1",
        keepSide2 = "keepSide2",
    }
    export enum twoCircleInclusionEnum {
        none = "none",
        outside = "outside",
        inside = "inside",
        outsideInside = "outsideInside",
        insideOutside = "insideOutside",
    }
    export enum fourSidesStrictEnum {
        outside = "outside",
        inside = "inside",
        outsideInside = "outsideInside",
        insideOutside = "insideOutside",
    }
    export enum twoSidesStrictEnum {
        outside = "outside",
        inside = "inside",
    }
    export enum combinationCirclesForFaceEnum {
        allWithAll = "allWithAll",
        inOrder = "inOrder",
        inOrderClosed = "inOrderClosed",
    }
    export enum typeSpecificityEnum {
        curve,
        edge,
        wire,
        face,
    }
    export enum pointProjectionTypeEnum {
        all = "all",
        closest = "closest",
        furthest = "furthest",
        closestAndFurthest = "closestAndFurthest",
    }
    export enum geomFillTrihedronEnum {
        isCorrectedFrenet = "isCorrectedFrenet",
        isFixed = "isFixed",
        isFrenet = "isFrenet",
        isConstantNormal = "isConstantNormal",
        isDarboux = "isDarboux",
        isGuideAC = "isGuideAC",
        isGuidePlan = "isGuidePlan",
        isGuideACWithContact = "isGuideACWithContact",
        isGuidePlanWithContact = "isGuidePlanWithContact",
        isDiscreteTrihedron = "isDiscreteTrihedron",

    }
    export class DecomposedMeshDto {
        constructor(faceList?: DecomposedFaceDto[], edgeList?: DecomposedEdgeDto[]) {
            if (faceList !== undefined) { this.faceList = faceList; }
            if (edgeList !== undefined) { this.edgeList = edgeList; }
        }
        /**
         * Face list for decomposed faces
         */
        faceList: DecomposedFaceDto[];
        /**
         * Edge list for decomposed edges
         */
        edgeList: DecomposedEdgeDto[];
        /**
         * The points list in a shape that includes vertex shapes
         */
        pointsList: Base.Point3[];
    }

    export class DecomposedFaceDto {
        face_index: number;
        normal_coord: number[];
        number_of_triangles: number;
        tri_indexes: number[];
        vertex_coord: number[];
        vertex_coord_vec: Base.Vector3[];
        center_point: Base.Point3;
        center_normal: Base.Vector3;
        uvs: number[];
    }
    export class DecomposedEdgeDto {
        edge_index: number;
        middle_point: Base.Point3;
        vertex_coord: Base.Vector3[];
    }
    export class ShapesDto<T> {
        constructor(shapes?: T[]) {
            if (shapes !== undefined) { this.shapes = shapes; }
        }
        /**
         * The OCCT shapes
         * @default undefined
         */
        shapes: T[];
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
        x: number;
        /**
         * Y coord
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        y: number;
        /**
         * Z coord
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        z: number;
    }
    export class PointsDto {
        constructor(points?: Base.Point3[]) {
            if (points !== undefined) { this.points = points; }
        }
        /**
         * The point
         * @default undefined
         */
        points: Base.Point3[];
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
        circle: T;
        /**
         * The point from which to find the lines
         * @default undefined
         */
        point: Base.Point3;
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
        circle: T;
        /**
         * The point from which to find the lines
         * @default undefined
         */
        point1: Base.Point3;
        /**
         * The point from which to find the lines
         * @default undefined
         */
        point2: Base.Point3;
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
        circle1: T;
        /**
         * The second circle for tangential lines
         * @default undefined
         */
        circle2: T;
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
        circle1: T;
        /**
         * The second circle for tangential lines
         * @default undefined
         */
        circle2: T;
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
        circle: T;
        /**
         * The second circle for tangential lines
         * @default undefined
         */
        point: Base.Point3;
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
        curve: T;
        /**
         * Surface
         * @default undefined
         */
        surface: U;
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
        edge1: T;
        /**
         * Second OCCT edge to fillet
         * @default undefined
         */
        edge2: T;
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
        solution? = -1;
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
        shape: T;
        /**
         * The list of points
         * @default undefined
         */
        points: Base.Point3[];
    }
    export class BoundingBoxDto {
        constructor(bbox?: BoundingBoxPropsDto) {
            if (bbox !== undefined) { this.bbox = bbox; }
        }
        /**
         * Bounding box
         * @default undefined
         */
        bbox?: BoundingBoxPropsDto;
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
        shape: T;
        /**
         * The list of points
         * @default undefined
         */
        points: Base.Point3[];
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
        shapes: T[];
        /**
         * The list of points
         * @default undefined
         */
        points: Base.Point3[];
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
        shape1: T;
        /**
        * Second OCCT shape
        * @default undefined
        */
        shape2: T;
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
        surface: T;
        /**
         * Wire that represents a boundary on the surface to delimit the face
         * @default undefined
         */
        wire: U;
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
        wire: T;
        /**
         * Face on which the wire will be placed
         * @default undefined
         */
        face: U;
    }
    export class DrawShapeDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T, faceOpacity?: number, edgeOpacity?: number, edgeColour?: Base.Color, faceMaterial?: Base.Material, faceColour?: Base.Color, edgeWidth?: number, drawEdges?: boolean, drawFaces?: boolean, drawVertices?: boolean, vertexColour?: Base.Color, vertexSize?: number, precision?: number, drawEdgeIndexes?: boolean, edgeIndexHeight?: number, edgeIndexColour?: Base.Color, drawFaceIndexes?: boolean, faceIndexHeight?: number, faceIndexColour?: Base.Color) {
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
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape?: T;
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
        faceMaterial?: Base.Material;
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
    }
    export class DrawShapesDto<T> {

        /**
         * Provide options without default values
         */
        constructor(shapes?: T[], faceOpacity?: number, edgeOpacity?: number, edgeColour?: Base.Color, faceMaterial?: Base.Material, faceColour?: Base.Color, edgeWidth?: number, drawEdges?: boolean, drawFaces?: boolean, drawVertices?: boolean, vertexColour?: Base.Color, vertexSize?: number, precision?: number, drawEdgeIndexes?: boolean, edgeIndexHeight?: number, edgeIndexColour?: Base.Color, drawFaceIndexes?: boolean, faceIndexHeight?: number, faceIndexColour?: Base.Color) {
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
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shapes: T[];
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
        faceMaterial?: Base.Material;
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
    }
    export class FaceSubdivisionDto<T> {
        /**
          * Provide options without default values
          */
        constructor(shape?: T, nrDivisionsU?: number, nrDivisionsV?: number, shiftHalfStepU?: boolean, removeStartEdgeU?: boolean, removeEndEdgeU?: boolean, shiftHalfStepV?: boolean, removeStartEdgeV?: boolean, removeEndEdgeV?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (nrDivisionsU !== undefined) { this.nrDivisionsU = nrDivisionsU; }
            if (nrDivisionsV !== undefined) { this.nrDivisionsV = nrDivisionsV; }
            if (shiftHalfStepU !== undefined) { this.shiftHalfStepU = shiftHalfStepU; }
            if (removeStartEdgeU !== undefined) { this.removeStartEdgeU = removeStartEdgeU; }
            if (removeEndEdgeU !== undefined) { this.removeEndEdgeU = removeEndEdgeU; }
            if (shiftHalfStepV !== undefined) { this.shiftHalfStepV = shiftHalfStepV; }
            if (removeStartEdgeV !== undefined) { this.removeStartEdgeV = removeStartEdgeV; }
            if (removeEndEdgeV !== undefined) { this.removeEndEdgeV = removeEndEdgeV; }
        }

        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape: T;
        /**
         * Number of points that will be added on U direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrDivisionsU = 10;
        /**
         * Number  of points that will be added on V direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrDivisionsV = 10;
        /**
         * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
         * @default false
         */
        shiftHalfStepU = false;
        /**
         * Removes start edge points on U
         * @default false
         */
        removeStartEdgeU = false;
        /**
         * Removes end edge points on U 
         * @default false
         */
        removeEndEdgeU = false;
        /**
         * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
         * @default false
         */
        shiftHalfStepV = false;
        /**
         * Removes start edge points on V
         * @default false
         */
        removeStartEdgeV = false;
        /**
         * Removes end edge points on V 
         * @default false
         */
        removeEndEdgeV = false;
    }

    export class FaceSubdivisionToWiresDto<T> {
        /**
          * Provide options without default values
          */
        constructor(shape?: T, nrDivisions?: number, isU?: boolean, shiftHalfStep?: boolean, removeStart?: boolean, removeEnd?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (nrDivisions !== undefined) { this.nrDivisions = nrDivisions; }
            if (isU !== undefined) { this.isU = isU; }
            if (shiftHalfStep !== undefined) { this.shiftHalfStep = shiftHalfStep; }
            if (removeStart !== undefined) { this.removeStart = removeStart; }
            if (removeEnd !== undefined) { this.removeEnd = removeEnd; }
        }

        /**
         * Openascade Face
         * @default undefined
         */
        shape: T;
        /**
         * Number of points that will be added on U direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrDivisions = 10;
        /**
        * Linear subdivision direction true - U, false - V
        * @default true
        */
        isU = true;
        /**
         * Sometimes you want to shift your wires half way the step distance, especially on periodic surfaces
         * @default false
         */
        shiftHalfStep = false;
        /**
         * Removes start wire
         * @default false
         */
        removeStart = false;
        /**
         * Removes end wire
         * @default false
         */
        removeEnd = false;
    }
    export class FaceSubdivideToRectangleWiresDto<T> {
        /**
          * Provide options without default values
          */
        constructor(shape?: T, nrRectanglesU?: number, nrRectanglesV?: number, scalePatternU?: number[], scalePatternV?: number[], filletPattern?: number[], inclusionPattern?: boolean[], offsetFromBorderU?: number, offsetFromBorderV?: number) {
            if (shape !== undefined) { this.shape = shape; }
            if (nrRectanglesU !== undefined) { this.nrRectanglesU = nrRectanglesU; }
            if (nrRectanglesV !== undefined) { this.nrRectanglesU = nrRectanglesV; }
            if (scalePatternU !== undefined) { this.scalePatternU = scalePatternU; }
            if (scalePatternV !== undefined) { this.scalePatternV = scalePatternV; }
            if (filletPattern !== undefined) { this.filletPattern = filletPattern; }
            if (inclusionPattern !== undefined) { this.inclusionPattern = inclusionPattern; }
            if (offsetFromBorderU !== undefined) { this.offsetFromBorderU = offsetFromBorderU; }
            if (offsetFromBorderV !== undefined) { this.offsetFromBorderV = offsetFromBorderV; }
        }
        /**
         * Openascade Face
         * @default undefined
         */
        shape: T;
        /**
         * Number of rectangles on U direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrRectanglesU = 10;
        /**
         * Number of rectangles on V direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrRectanglesV = 10;
        /**
         * Rectangle scale pattern on u direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
         * @default undefined
         * @optional true
         */
        scalePatternU: number[];
        /**
         * Rectangle scale pattern on v direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
         * @default undefined
         * @optional true
         */
        scalePatternV: number[];
        /**
         * Rectangle fillet scale pattern - numbers between 0 and 1, if 0 is used, no fillet is applied, 
         * if 1 is used, the fillet will be exactly half of the length of the shorter side of the rectangle
         * @default undefined
         * @optional true
         */
        filletPattern: number[];
        /**
         * Rectangle inclusion pattern - true means that the rectangle will be included, 
         * false means that the rectangle will be removed from the face
         * @default undefined
         * @optional true
         */
        inclusionPattern: boolean[];
        /**
         * If offset on U is bigger then 0 we will use a smaller space for rectangles to be placed. This means that even rectangle of U param 1 will be offset from the face border
         * That is often required to create a pattern that is not too close to the face border
         * It should not be bigger then half of the total width of the face as that will create problems
         * @default 0
         * @minimum 0
         * @maximum 0.5
         * @step 0.01
         */
        offsetFromBorderU = 0;
        /**
         * If offset on V is bigger then 0 we will use a smaller space for rectangles to be placed. This means that even rectangle of V param 1 will be offset from the face border
         * That is often required to create a pattern that is not too close to the face border
         * It should not be bigger then half of the total width of the face as that will create problems
         * @default 0
         * @minimum 0
         * @maximum 0.5
         * @step 0.01
         */
        offsetFromBorderV = 0;
    }

    export class FaceSubdivideToRectangleHolesDto<T> {
        /**
          * Provide options without default values
          */
        constructor(shape?: T, nrRectanglesU?: number, nrRectanglesV?: number, scalePatternU?: number[], scalePatternV?: number[], filletPattern?: number[], inclusionPattern?: boolean[], holesToFaces?: boolean, offsetFromBorderU?: number, offsetFromBorderV?: number) {
            if (shape !== undefined) { this.shape = shape; }
            if (nrRectanglesU !== undefined) { this.nrRectanglesU = nrRectanglesU; }
            if (nrRectanglesV !== undefined) { this.nrRectanglesU = nrRectanglesV; }
            if (scalePatternU !== undefined) { this.scalePatternU = scalePatternU; }
            if (scalePatternV !== undefined) { this.scalePatternV = scalePatternV; }
            if (filletPattern !== undefined) { this.filletPattern = filletPattern; }
            if (inclusionPattern !== undefined) { this.inclusionPattern = inclusionPattern; }
            if (holesToFaces !== undefined) { this.holesToFaces = holesToFaces; }
            if (offsetFromBorderU !== undefined) { this.offsetFromBorderU = offsetFromBorderU; }
            if (offsetFromBorderV !== undefined) { this.offsetFromBorderV = offsetFromBorderV; }
        }
        /**
         * Openascade Face
         * @default undefined
         */
        shape: T;
        /**
         * Number of rectangles on U direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrRectanglesU = 10;
        /**
         * Number of rectangles on V direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrRectanglesV = 10;
        /**
         * Rectangle scale pattern on u direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
         * @default undefined
         * @optional true
         */
        scalePatternU: number[];
        /**
         * Rectangle scale pattern on v direction - numbers between 0 and 1, if 1 or undefined is used, no scaling is applied
         * @default undefined
         * @optional true
         */
        scalePatternV: number[];
        /**
         * Rectangle fillet scale pattern - numbers between 0 and 1, if 0 is used, no fillet is applied, 
         * if 1 is used, the fillet will be exactly half of the length of the shorter side of the rectangle
         * @default undefined
         * @optional true
         */
        filletPattern: number[];
        /**
         * Rectangle inclusion pattern - true means that the rectangle will be included, 
         * false means that the rectangle will be removed from the face
         * @default undefined
         * @optional true
         */
        inclusionPattern: boolean[];
        /**
         * If true, we will also output the faces for all the rectangles. The first face in the result will be the original face with holes punched, while the rest will be the rectangles
         * @default false
         */
        holesToFaces = false;
        /**
         * If offset on U is bigger then 0 we will use a smaller space for rectangles to be placed. This means that even rectangle of U param 1 will be offset from the face border
         * That is often required to create a pattern that is not too close to the face border
         * It should not be bigger then half of the total width of the face as that will create problems
         * @default 0
         * @minimum 0
         * @maximum 0.5
         * @step 0.01
         */
        offsetFromBorderU = 0;
        /**
         * If offset on V is bigger then 0 we will use a smaller space for rectangles to be placed. This means that even rectangle of V param 1 will be offset from the face border
         * That is often required to create a pattern that is not too close to the face border
         * It should not be bigger then half of the total width of the face as that will create problems
         * @default 0
         * @minimum 0
         * @maximum 0.5
         * @step 0.01
         */
        offsetFromBorderV = 0;
    }
    export class FaceSubdivisionControlledDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T, nrDivisionsU?: number, nrDivisionsV?: number, shiftHalfStepNthU?: number, shiftHalfStepUOffsetN?: number, removeStartEdgeNthU?: number, removeStartEdgeUOffsetN?: number, removeEndEdgeNthU?: number, removeEndEdgeUOffsetN?: number, shiftHalfStepNthV?: number, shiftHalfStepVOffsetN?: number, removeStartEdgeNthV?: number, removeStartEdgeVOffsetN?: number, removeEndEdgeNthV?: number, removeEndEdgeVOffsetN?: number) {
            if (shape !== undefined) { this.shape = shape; }
            if (nrDivisionsU !== undefined) { this.nrDivisionsU = nrDivisionsU; }
            if (nrDivisionsV !== undefined) { this.nrDivisionsV = nrDivisionsV; }
            if (shiftHalfStepNthU !== undefined) { this.shiftHalfStepNthU = shiftHalfStepNthU; }
            if (shiftHalfStepUOffsetN !== undefined) { this.shiftHalfStepUOffsetN = shiftHalfStepUOffsetN; }
            if (removeStartEdgeNthU !== undefined) { this.removeStartEdgeNthU = removeStartEdgeNthU; }
            if (removeStartEdgeUOffsetN !== undefined) { this.removeStartEdgeUOffsetN = removeStartEdgeUOffsetN; }
            if (removeEndEdgeNthU !== undefined) { this.removeEndEdgeNthU = removeEndEdgeNthU; }
            if (removeEndEdgeUOffsetN !== undefined) { this.removeEndEdgeUOffsetN = removeEndEdgeUOffsetN; }
            if (shiftHalfStepNthV !== undefined) { this.shiftHalfStepNthV = shiftHalfStepNthV; }
            if (shiftHalfStepVOffsetN !== undefined) { this.shiftHalfStepVOffsetN = shiftHalfStepVOffsetN; }
            if (removeStartEdgeNthV !== undefined) { this.removeStartEdgeNthV = removeStartEdgeNthV; }
            if (removeStartEdgeVOffsetN !== undefined) { this.removeStartEdgeVOffsetN = removeStartEdgeVOffsetN; }
            if (removeEndEdgeNthV !== undefined) { this.removeEndEdgeNthV = removeEndEdgeNthV; }
            if (removeEndEdgeVOffsetN !== undefined) { this.removeEndEdgeVOffsetN = removeEndEdgeVOffsetN; }
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape: T;
        /**
         * Number of subdivisions on U direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrDivisionsU = 10;
        /**
         * Number of subdivisions on V direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrDivisionsV = 10;
        /**
         * Shift half step every nth U row
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shiftHalfStepNthU = 0;
        /**
         * Offset for shift half step every nth U row
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shiftHalfStepUOffsetN = 0;
        /**
         * Removes start edge points on U
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeStartEdgeNthU = 0;
        /**
         * Offset for remove start edge points on U
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeStartEdgeUOffsetN = 0;
        /**
         * Removes end edge points on U 
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeEndEdgeNthU = 0;
        /**
         * Offset for remove end edge points on U
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeEndEdgeUOffsetN = 0;
        /**
         * Shift half step every nth V row
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shiftHalfStepNthV = 0;
        /**
         * Offset for shift half step every nth V row
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shiftHalfStepVOffsetN = 0;
        /**
         * Removes start edge points on V
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeStartEdgeNthV = 0;
        /**
         * Offset for remove start edge points on V
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeStartEdgeVOffsetN = 0;
        /**
         * Removes end edge points on V 
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeEndEdgeNthV = 0;
        /**
         * Offset for remove end edge points on V
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeEndEdgeVOffsetN = 0;
    }
    export class FaceLinearSubdivisionDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T, isU?: boolean, param?: number, nrPoints?: number, shiftHalfStep?: boolean, removeStartPoint?: boolean, removeEndPoint?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (isU !== undefined) { this.isU = isU; }
            if (param !== undefined) { this.param = param; }
            if (nrPoints !== undefined) { this.nrPoints = nrPoints; }
            if (shiftHalfStep !== undefined) { this.shiftHalfStep = shiftHalfStep; }
            if (removeStartPoint !== undefined) { this.removeStartPoint = removeStartPoint; }
            if (removeEndPoint !== undefined) { this.removeEndPoint = removeEndPoint; }
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape: T;
        /**
         * Linear subdivision direction true - U, false - V
         * @default true
         */
        isU = true;
        /**
         * Param on direction 0 - 1
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        param = 0.5;
        /**
         * Number of subdivisions on opposite direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrPoints = 10;
        /**
         * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
         * @default false
         */
        shiftHalfStep = false;
        /**
         * Removes first point
         * @default false
         */
        removeStartPoint = false;
        /**
         * Removes last point
         * @default false
         */
        removeEndPoint = false;
    }
    export class WireAlongParamDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T, isU?: boolean, param?: number) {
            if (shape !== undefined) { this.shape = shape; }
            if (isU !== undefined) { this.isU = isU; }
            if (param !== undefined) { this.param = param; }
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape: T;
        /**
         * Linear subdivision direction true - U, false - V
         * @default true
         */
        isU = true;
        /**
         * Param on direction 0 - 1
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        param = 0.5;
    }

    export class WiresAlongParamsDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T, isU?: boolean, params?: number[]) {
            if (shape !== undefined) { this.shape = shape; }
            if (isU !== undefined) { this.isU = isU; }
            if (params !== undefined) { this.params = params; }
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape: T;
        /**
         * Linear subdivision direction true - U, false - V
         * @default true
         */
        isU = true;
        /**
         * Params on direction 0 - 1
         * @default undefined
         */
        params: number[];
    }

    export class DataOnUVDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T, paramU?: number, paramV?: number) {
            if (shape !== undefined) { this.shape = shape; }
            if (paramU !== undefined) { this.paramU = paramU; }
            if (paramV !== undefined) { this.paramV = paramV; }
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape: T;
        /**
         * Param on U direction 0 to 1
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        paramU = 0.5;
        /**
         * Param on V direction 0 to 1
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        paramV = 0.5;
    }
    export class DataOnUVsDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T, paramsUV?: [number, number][]) {
            if (shape !== undefined) { this.shape = shape; }
            if (paramsUV !== undefined) { this.paramsUV = paramsUV; }
        }
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape: T;
        /**
         * Params uv
         * @default [[0.5, 0.5]]
         */
        paramsUV: [number, number][] = [[0.5, 0.5]];
    }
    export class PolygonDto {
        constructor(points?: Base.Point3[]) {
            if (points !== undefined) { this.points = points; }
        }
        /**
         * Points points
         * @default undefined
         */
        points: Base.Point3[];
    }
    export class PolygonsDto {
        constructor(polygons?: PolygonDto[], returnCompound?: boolean) {
            if (polygons !== undefined) { this.polygons = polygons; }
            if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
        }
        /**
         * Polygons
         * @default undefined
         */
        polygons: PolygonDto[];
        /**
         * Indicates whether the shapes should be returned as a compound
         */
        returnCompound = false;
    }
    export class PolylineDto {
        constructor(points?: Base.Point3[]) {
            if (points !== undefined) { this.points = points; }
        }
        /**
         * Points points
         * @default undefined
         */
        points: Base.Point3[];
    }
    export class PolylinesDto {
        constructor(polylines?: PolylineDto[], returnCompound?: boolean) {
            if (polylines !== undefined) { this.polylines = polylines; }
            if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
        }
        /**
         * Polylines
         * @default undefined
         */
        polylines: PolylineDto[];
        /**
         * Indicates whether the shapes should be returned as a compound
         */
        returnCompound = false;
    }
    export class SquareDto {
        constructor(size?: number, center?: Base.Point3, direction?: Base.Vector3) {
            if (size !== undefined) { this.size = size; }
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * size of square
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        size = 1;
        /**
         * Center of the square
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction of the square
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class RectangleDto {
        constructor(width?: number, length?: number, center?: Base.Point3, direction?: Base.Vector3) {
            if (width !== undefined) { this.width = width; }
            if (length !== undefined) { this.length = length; }
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * width of the rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        width = 1;
        /**
         * Height of the rectangle
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        length = 2;
        /**
         * Center of the rectangle
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction of the rectangle
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class LPolygonDto {
        constructor(widthFirst?: number, lengthFirst?: number, widthSecond?: number, lengthSecond?: number, align?: directionEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3) {
            if (widthFirst !== undefined) { this.widthFirst = widthFirst; }
            if (lengthFirst !== undefined) { this.lengthFirst = lengthFirst; }
            if (widthSecond !== undefined) { this.widthSecond = widthSecond; }
            if (lengthSecond !== undefined) { this.lengthSecond = lengthSecond; }
            if (align !== undefined) { this.align = align; }
            if (rotation !== undefined) { this.rotation = rotation; }
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * Width of the first side of L polygon
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        widthFirst = 1;
        /**
         * Length of the first side of L polygon
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        lengthFirst = 2;
        /**
         * Width of the second side of L polygon
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        widthSecond = 0.5;
        /**
         * Length of the second side of L polygon
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        lengthSecond = 2;
        /**
         * Indicates if the L polygon should be aligned inside/outside or middle
         * @default outside
         */
        align = directionEnum.outside;
        /**
         * Rotation of the L polygon
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 15
         */
        rotation = 0;
        /**
         * Center of the L polygon
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction of the  L polygon
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class BoxDto {
        constructor(width?: number, length?: number, height?: number, center?: Base.Point3, originOnCenter?: boolean) {
            if (width !== undefined) { this.width = width; }
            if (length !== undefined) { this.length = length; }
            if (height !== undefined) { this.height = height; }
            if (center !== undefined) { this.center = center; }
            if (originOnCenter !== undefined) { this.originOnCenter = originOnCenter; }
        }
        /**
         * Width of the box
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width = 1;
        /**
         * Length of the box
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length = 2;
        /**
         * Height of the box
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 3;
        /**
         * Center of the box
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Force origin to be on the center of the cube
         * @default true
         */
        originOnCenter? = true;
    }
    export class CubeDto {
        constructor(size?: number, center?: Base.Point3, originOnCenter?: boolean) {
            if (size !== undefined) { this.size = size; }
            if (center !== undefined) { this.center = center; }
            if (originOnCenter !== undefined) { this.originOnCenter = originOnCenter; }
        }
        /**
         * Size of the cube
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 1;
        /**
         * Center of the box
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Force origin to be on the center of the cube
         * @default true
         */
        originOnCenter? = true;
    }
    export class BoxFromCornerDto {
        constructor(width?: number, length?: number, height?: number, corner?: Base.Point3) {
            if (width !== undefined) { this.width = width; }
            if (length !== undefined) { this.length = length; }
            if (height !== undefined) { this.height = height; }
            if (corner !== undefined) { this.corner = corner; }
        }
        /**
         * Width of the box
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width = 1;
        /**
         * Length of the box
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length = 2;
        /**
         * Height of the box
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 3;
        /**
         * Corner of the box
         * @default [0, 0, 0]
         */
        corner: Base.Point3 = [0, 0, 0];
    }
    export class SphereDto {
        constructor(radius?: number, center?: Base.Point3) {
            if (radius !== undefined) { this.radius = radius; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * Radius of the sphere
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Center of the sphere
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    export class ConeDto {
        constructor(radius1?: number, radius2?: number, height?: number, angle?: number, center?: Base.Point3, direction?: Base.Vector3) {
            if (radius1 !== undefined) { this.radius1 = radius1; }
            if (radius2 !== undefined) { this.radius2 = radius2; }
            if (height !== undefined) { this.height = height; }
            if (angle !== undefined) { this.angle = angle; }
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * First radius of the cone
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius1 = 2;
        /**
         * Second radius of the cone
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius2 = 1;
        /**
         * Height of the cone
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 2;
        /**
         * Angle of the cone
         * @default 360
         * @minimum 0
         * @maximum 360
         * @step 1
         */
        angle = 360;
        /**
         * Center of the cone
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction of the cone
         * @default [0, 1, 0]
         */
        direction: Base.Point3 = [0, 1, 0];

    }
    export class LineDto {
        constructor(start?: Base.Point3, end?: Base.Point3) {
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
        }
        /**
         * Start of the line
         * @default [0, 0, 0]
         */
        start: Base.Point3 = [0, 0, 0];
        /**
         * End of the line
         * @default [0, 1, 0]
         */
        end: Base.Point3 = [0, 1, 0];
    }

    export class LineWithExtensionsDto {
        constructor(start?: Base.Point3, end?: Base.Point3, extensionStart?: number, extensionEnd?: number) {
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
            if (extensionStart !== undefined) { this.extensionStart = extensionStart; }
            if (extensionEnd !== undefined) { this.extensionEnd = extensionEnd; }
        }
        /**
         * Start of the line
         * @default [0, 0, 0]
         */
        start: Base.Point3 = [0, 0, 0];
        /**
         * End of the line
         * @default [0, 1, 0]
         */
        end: Base.Point3 = [0, 1, 0];
        /**
         * Extension of the line on the start
         * @default 0.1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extensionStart = 0.1;
        /**
         * Extension of the line on the end
         * @default 0.1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extensionEnd = 0.1;
    }
    export class LinesDto {
        constructor(lines?: LineDto[], returnCompound?: boolean) {
            if (lines !== undefined) { this.lines = lines; }
            if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
        }
        /**
         * Lines
         * @default undefined
         */
        lines: LineDto[];
        /**
         * Indicates whether the shapes should be returned as a compound
         */
        returnCompound = false;
    }
    export class ArcEdgeTwoPointsTangentDto {
        constructor(start?: Base.Point3, tangentVec?: Base.Vector3, end?: Base.Point3) {
            if (start !== undefined) { this.start = start; }
            if (tangentVec !== undefined) { this.tangentVec = tangentVec; }
            if (end !== undefined) { this.end = end; }
        }
        /**
         * Start of the arc
         * @default [0, 0, 0]
         */
        start: Base.Point3 = [0, 0, 0];
        /**
        * Tangent vector on first point of the edge
        * @default [0, 1, 0]
        */
        tangentVec: Base.Vector3 = [0, 1, 0];
        /**
         * End of the arc
         * @default [0, 0, 1]
         */
        end: Base.Point3 = [0, 0, 1];
    }
    export class ArcEdgeCircleTwoPointsDto<T> {
        constructor(circle?: T, start?: Base.Point3, end?: Base.Point3, sense?: boolean) {
            if (circle !== undefined) { this.circle = circle; }
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
            if (sense !== undefined) { this.sense = sense; }
        }
        /**
         * Circular edge
         * @default undefined
         */
        circle: T;
        /**
         * Start of the arc on the circle
         * @default [0, 0, 0]
         */
        start: Base.Point3 = [0, 0, 0];
        /**
         * End of the arc on the circle
         * @default [0, 0, 1]
         */
        end: Base.Point3 = [0, 0, 1];
        /**
         * If true will sense the direction
         * @default true
         */
        sense = true;
    }
    export class ArcEdgeCircleTwoAnglesDto<T> {
        constructor(circle?: T, alphaAngle1?: number, alphaAngle2?: number, sense?: boolean) {
            if (circle !== undefined) { this.circle = circle; }
            if (alphaAngle1 !== undefined) { this.alphaAngle1 = alphaAngle1; }
            if (alphaAngle2 !== undefined) { this.alphaAngle2 = alphaAngle2; }
            if (sense !== undefined) { this.sense = sense; }
        }
        /**
         * Circular edge
         * @default undefined
         */
        circle: T;
        /**
         * First angle
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        alphaAngle1 = 0;
        /**
         * End angle
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        alphaAngle2 = 90;
        /**
         * If true will sense the direction
         * @default true
         */
        sense = true;
    }
    export class ArcEdgeCirclePointAngleDto<T> {
        constructor(circle?: T, alphaAngle?: number, alphaAngle2?: number, sense?: boolean) {
            if (circle !== undefined) { this.circle = circle; }
            if (alphaAngle !== undefined) { this.alphaAngle = alphaAngle; }
            if (sense !== undefined) { this.sense = sense; }
        }
        /**
         * Circular edge
         * @default undefined
         */
        circle: T;
        /**
         * Point on the circle from where to start the arc
         * @default undefined
         */
        point: Base.Point3;
        /**
         * Angle from point
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        alphaAngle = 90;
        /**
         * If true will sense the direction
         * @default true
         */
        sense = true;
    }
    export class ArcEdgeThreePointsDto {
        constructor(start?: Base.Point3, middle?: Base.Point3, end?: Base.Point3) {
            if (start !== undefined) { this.start = start; }
            if (middle !== undefined) { this.middle = middle; }
            if (end !== undefined) { this.end = end; }
        }
        /**
         * Start of the arc
         * @default [0, 0, 0]
         */
        start: Base.Point3 = [0, 0, 0];
        /**
        * Middle of the arc
        * @default [0, 1, 0]
        */
        middle: Base.Point3 = [0, 1, 0];
        /**
         * End of the arc
         * @default [0, 0, 1]
         */
        end: Base.Point3 = [0, 0, 1];
    }
    export class CylinderDto {
        constructor(radius?: number, height?: number, center?: Base.Point3, direction?: Base.Vector3, angle?: number, originOnCenter?: boolean) {
            if (radius !== undefined) { this.radius = radius; }
            if (height !== undefined) { this.height = height; }
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
            if (angle !== undefined) { this.angle = angle; }
            if (originOnCenter !== undefined) { this.originOnCenter = originOnCenter; }
        }
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Height of the cylinder
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 2;
        /**
         * Center of the cylinder
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction for the cylinder
         * @default [0, 1, 0]
         */
        direction?: Base.Vector3 = [0, 1, 0];
        /**
         * Angle of the cylinder pie
         * @default 360
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        angle? = 360;
        /**
         * Force origin to be on the center of cylinder
         * @default false
         */
        originOnCenter? = false;
    }
    export class CylindersOnLinesDto {
        constructor(radius?: number, lines?: Base.Line3[]) {
            if (radius !== undefined) { this.radius = radius; }
            if (lines !== undefined) { this.lines = lines; }
        }
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Lines between which to span cylinders
         * @default undefined
         */
        lines: Base.Line3[];
    }
    export class FilletDto<T> {
        constructor(shape?: T, radius?: number, radiusList?: number[], indexes?: number[]) {
            if (shape !== undefined) { this.shape = shape; }
            if (radius !== undefined) { this.radius = radius; }
            if (radiusList !== undefined) { this.radiusList = radiusList; }
            if (indexes !== undefined) { this.indexes = indexes; }
        }
        /**
         * Shape to apply the fillets
         * @default undefined
         */
        shape: T;
        /**
         * Radius of the fillets
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         * @optional true
         */
        radius? = 0.1;
        /**
         * Radius list
         * @default undefined
         * @optional true
         */
        radiusList?: number[];
        /**
         * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
         * @default undefined
         * @optional true
         */
        indexes?: number[];
    }
    export class FilletShapesDto<T> {
        constructor(shapes?: T[], radius?: number, radiusList?: number[], indexes?: number[]) {
            if (shapes !== undefined) { this.shapes = shapes; }
            if (radius !== undefined) { this.radius = radius; }
            if (radiusList !== undefined) { this.radiusList = radiusList; }
            if (indexes !== undefined) { this.indexes = indexes; }
        }
        /**
         * Shapes to apply the fillets
         * @default undefined
         */
        shapes: T[];
        /**
         * Radius of the fillets
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         * @optional true
         */
        radius? = 0.1;
        /**
         * Radius list
         * @default undefined
         * @optional true
         */
        radiusList?: number[];
        /**
         * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
         * @default undefined
         * @optional true
         */
        indexes?: number[];
    }
    export class FilletEdgesListDto<T, U> {
        constructor(shape?: T, edges?: U[], radiusList?: number[]) {
            if (shape !== undefined) { this.shape = shape; }
            if (edges !== undefined) { this.edges = edges; }
            if (radiusList !== undefined) { this.radiusList = radiusList; }
        }
        /**
         * Shape to apply the fillet
         * @default undefined
         */
        shape: T;
        /**
         * Edges to use for the fillet
         * @default undefined
         */
        edges: U[];
        /**
         * Radius list for the fillets. The length of this array must match the length of the edges array. Each index corresponds to fillet on the edge at the same index.
         * @default undefined
         */
        radiusList: number[];
    }
    export class FilletEdgesListOneRadiusDto<T, U> {
        constructor(shape?: T, edges?: U[], radius?: number) {
            if (shape !== undefined) { this.shape = shape; }
            if (edges !== undefined) { this.edges = edges; }
            if (radius !== undefined) { this.radius = radius; }
        }
        /**
         * Shape to apply the fillet
         * @default undefined
         */
        shape: T;
        /**
         * Edges to use for the fillet
         * @default undefined
         */
        edges: U[];
        /**
         * Radius of the fillets
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         * @optional true
         */
        radius = 0.1;
    }
    export class FilletEdgeVariableRadiusDto<T, U> {
        constructor(shape?: T, edge?: U, radiusList?: number[], paramsU?: number[]) {
            if (shape !== undefined) { this.shape = shape; }
            if (edge !== undefined) { this.edge = edge; }
            if (radiusList !== undefined) { this.radiusList = radiusList; }
            if (paramsU !== undefined) { this.paramsU = paramsU; }
        }
        /**
         * Shape to apply the fillet
         * @default undefined
         */
        shape: T;
        /**
         * Edge to use for the fillet
         * @default undefined
         */
        edge: U;
        /**
         * Radius list for the fillets that has to match the paramsU list
         * @default undefined
         */
        radiusList: number[];
        /**
         * List of parameters on the edge to which apply the fillet. Each param must be between 0 and 1.
         * @default undefined
         */
        paramsU: number[];
    }
    export class FilletEdgesVariableRadiusDto<T, U> {
        constructor(shape?: T, edges?: U[], radiusLists?: number[][], paramsULists?: number[][]) {
            if (shape !== undefined) { this.shape = shape; }
            if (edges !== undefined) { this.edges = edges; }
            if (radiusLists !== undefined) { this.radiusLists = radiusLists; }
            if (paramsULists !== undefined) { this.paramsULists = paramsULists; }
        }
        /**
         * Shape to apply the fillet
         * @default undefined
         */
        shape: T;
        /**
         * Edges to use for the fillet
         * @default undefined
         */
        edges: U[];
        /**
         * Lists of radius lists for the fillets. Top level array length needs to match the nr of edges used and each second level array needs to match paramsU length array at the same index.
         * @default undefined
         */
        radiusLists: number[][];
        /**
         * Lists of parameter lists on the edges to which apply the fillet. Each param must be between 0 and 1. Top level array length needs to match the nr of edges used and each second level array needs to match radius length array at the same index.
         * @default undefined
         */
        paramsULists: number[][];
    }
    export class FilletEdgesSameVariableRadiusDto<T, U> {
        constructor(shape?: T, edges?: U[], radiusList?: number[], paramsU?: number[]) {
            if (shape !== undefined) { this.shape = shape; }
            if (edges !== undefined) { this.edges = edges; }
            if (radiusList !== undefined) { this.radiusList = radiusList; }
            if (paramsU !== undefined) { this.paramsU = paramsU; }
        }
        /**
         * Shape to apply the fillet
         * @default undefined
         */
        shape: T;
        /**
         * Edges to use for the fillet
         * @default undefined
         */
        edges: U[];

        /**
         * Radius list for the fillets that has to match the paramsU list
         * @default undefined
         */
        radiusList: number[];
        /**
         * List of parameters on the edges to which apply the fillet. Each param must be between 0 and 1.
         * @default undefined
         */
        paramsU: number[];
    }

    export class Fillet3DWiresDto<T> {
        constructor(shapes?: T[], radius?: number, direction?: Base.Vector3, radiusList?: number[], indexes?: number[],) {
            if (shapes !== undefined) { this.shapes = shapes; }
            if (radius !== undefined) { this.radius = radius; }
            if (direction !== undefined) { this.direction = direction; }
            if (radiusList !== undefined) { this.radiusList = radiusList; }
            if (indexes !== undefined) { this.indexes = indexes; }
        }
        /**
         * Shapes to apply the fillets on
         * @default undefined
         */
        shapes: T[];
        /**
         * Radius of the fillets
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         * @optional true
         */
        radius? = 0.1;
        /**
         * Radius list
         * @default undefined
         * @optional true
         */
        radiusList?: number[];
        /**
         * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
         * @default undefined
         * @optional true
         */
        indexes?: number[];
        /**
         * Orientation direction for the fillet
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class Fillet3DWireDto<T> {
        constructor(shape?: T, radius?: number, direction?: Base.Vector3, radiusList?: number[], indexes?: number[],) {
            if (shape !== undefined) { this.shape = shape; }
            if (radius !== undefined) { this.radius = radius; }
            if (direction !== undefined) { this.direction = direction; }
            if (radiusList !== undefined) { this.radiusList = radiusList; }
            if (indexes !== undefined) { this.indexes = indexes; }
        }
        /**
         * Shape to apply the fillets
         * @default undefined
         */
        shape: T;
        /**
         * Radius of the fillets
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         * @optional true
         */
        radius? = 0.1;
        /**
         * Radius list
         * @default undefined
         * @optional true
         */
        radiusList?: number[];
        /**
         * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
         * @default undefined
         * @optional true
         */
        indexes?: number[];
        /**
         * Orientation direction for the fillet
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class ChamferDto<T> {
        constructor(shape?: T, distance?: number, distanceList?: number[], indexes?: number[]) {
            if (shape !== undefined) { this.shape = shape; }
            if (distance !== undefined) { this.distance = distance; }
            if (distanceList !== undefined) { this.distanceList = distanceList; }
            if (indexes !== undefined) { this.indexes = indexes; }
        }
        /**
         * Shape to apply the chamfer
         * @default undefined
         */
        shape: T;
        /**
         * Distance for the chamfer
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @optional true
         * @step 0.1
         */
        distance? = 0.1;
        /**
         * Distance for the chamfer
         * @default undefined
         * @optional true
         */
        distanceList?: number[];
        /**
         * List of edge indexes to which apply the chamfer, if left empty all edges will be chamfered
         * @default undefined
         * @optional true
         */
        indexes?: number[];
    }
    export class ChamferEdgesListDto<T, U> {
        constructor(shape?: T, edges?: U[], distanceList?: number[]) {
            if (shape !== undefined) { this.shape = shape; }
            if (edges !== undefined) { this.edges = edges; }
            if (distanceList !== undefined) { this.distanceList = distanceList; }
        }
        /**
         * Shape to apply the chamfer
         * @default undefined
         */
        shape: T;
        /**
         * Edges to apply the chamfer to
         * @default undefined
         */
        edges: U[];
        /**
         * Distance for the chamfer
         * @default undefined
         */
        distanceList: number[];
    }
    export class ChamferEdgeDistAngleDto<T, U, F> {
        constructor(shape?: T, edge?: U, face?: F, distance?: number, angle?: number) {
            if (shape !== undefined) { this.shape = shape; }
            if (edge !== undefined) { this.edge = edge; }
            if (face !== undefined) { this.face = face; }
            if (distance !== undefined) { this.distance = distance; }
            if (angle !== undefined) { this.angle = angle; }
        }
        /**
         * Shape to apply the chamfer
         * @default undefined
         */
        shape: T;
        /**
         * Edge to apply the chamfer to
         * @default undefined
         */
        edge: U;
        /**
         * Face from which to apply the angle
         * @default undefined
         */
        face: F;
        /**
         * Distance for the chamfer
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        distance = 0.1;
        /**
         * Angle for the chamfer
         * @default 45
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        angle = 45;
    }

    export class ChamferEdgeTwoDistancesDto<T, U, F> {
        constructor(shape?: T, edge?: U, face?: F, distance1?: number, distance2?: number) {
            if (shape !== undefined) { this.shape = shape; }
            if (edge !== undefined) { this.edge = edge; }
            if (face !== undefined) { this.face = face; }
            if (distance1 !== undefined) { this.distance1 = distance1; }
            if (distance2 !== undefined) { this.distance2 = distance2; }
        }
        /**
         * Shape to apply the chamfer
         * @default undefined
         */
        shape: T;
        /**
         * Edge to apply the chamfer to
         * @default undefined
         */
        edge: U;
        /**
         * Face from which to apply the first distance
         * @default undefined
         */
        face: F;
        /**
         * First distance from the face for the chamfer
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        distance1 = 0.1;
        /**
         * Second distance for the chamfer
         * @default 0.2
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        distance2 = 0.2;
    }
    export class ChamferEdgesTwoDistancesListsDto<T, U, F> {
        constructor(shape?: T, edges?: U[], faces?: F[], distances1?: number[], distances2?: number[]) {
            if (shape !== undefined) { this.shape = shape; }
            if (edges !== undefined) { this.edges = edges; }
            if (faces !== undefined) { this.faces = faces; }
            if (distances1 !== undefined) { this.distances1 = distances1; }
            if (distances2 !== undefined) { this.distances2 = distances2; }
        }
        /**
         * Shape to apply the chamfer
         * @default undefined
         */
        shape: T;
        /**
         * Edges to apply the chamfers to
         * @default undefined
         */
        edges: U[];
        /**
         * Faces from which to apply the angle of the chamfers
         * @default undefined
         */
        faces: F[];
        /**
         * Distance 1 list for the chamfers
         * @default undefined
         */
        distances1: number[];
        /**
         * Distance 2 list for the chamfers
         * @default undefined
         */
        distances2: number[];
    }
    export class ChamferEdgesTwoDistancesDto<T, U, F> {
        constructor(shape?: T, edges?: U[], faces?: F[], distance1?: number, distance2?: number) {
            if (shape !== undefined) { this.shape = shape; }
            if (edges !== undefined) { this.edges = edges; }
            if (faces !== undefined) { this.faces = faces; }
            if (distance1 !== undefined) { this.distance1 = distance1; }
            if (distance2 !== undefined) { this.distance2 = distance2; }
        }
        /**
         * Shape to apply the chamfer
         * @default undefined
         */
        shape: T;
        /**
         * Edges to apply the chamfers to
         * @default undefined
         */
        edges: U[];
        /**
         * Faces from which to apply the angle of the chamfers
         * @default undefined
         */
        faces: F[];
        /**
         * First distance from the face for the chamfer
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        distance1 = 0.1;
        /**
         * Second distance for the chamfer
         * @default 0.2
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        distance2 = 0.2;
    }
    export class ChamferEdgesDistsAnglesDto<T, U, F> {
        constructor(shape?: T, edges?: U[], faces?: F[], distances?: number[], angles?: number[]) {
            if (shape !== undefined) { this.shape = shape; }
            if (edges !== undefined) { this.edges = edges; }
            if (faces !== undefined) { this.faces = faces; }
            if (distances !== undefined) { this.distances = distances; }
            if (angles !== undefined) { this.angles = angles; }
        }
        /**
         * Shape to apply the chamfer
         * @default undefined
         */
        shape: T;
        /**
         * Edges to apply the chamfers to
         * @default undefined
         */
        edges: U[];
        /**
         * Faces from which to apply the angle of the chamfers
         * @default undefined
         */
        faces: F[];
        /**
         * Distance list for the chamfers
         * @default undefined
         */
        distances: number[];
        /**
         * Angles for the chamfers
         * @default undefined
         */
        angles: number[];
    }

    export class ChamferEdgesDistAngleDto<T, U, F> {
        constructor(shape?: T, edges?: U[], faces?: F[], distance?: number, angle?: number) {
            if (shape !== undefined) { this.shape = shape; }
            if (edges !== undefined) { this.edges = edges; }
            if (faces !== undefined) { this.faces = faces; }
            if (distance !== undefined) { this.distance = distance; }
            if (angle !== undefined) { this.angle = angle; }
        }
        /**
         * Shape to apply the chamfer
         * @default undefined
         */
        shape: T;
        /**
         * Edges to apply the chamfers to
         * @default undefined
         */
        edges: U[];
        /**
         * Faces from which to apply the angle of the chamfers
         * @default undefined
         */
        faces: F[];
        /**
         * Distance from the face
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        distance = 0.1;
        /**
         * Angle for the chamfers
         * @default 45
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        angle = 45;
    }
    export class BSplineDto {
        constructor(points?: Base.Point3[], closed?: boolean) {
            if (points !== undefined) { this.points = points; }
            if (closed !== undefined) { this.closed = closed; }
        }
        /**
         * Points through which the BSpline will be created
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Indicates wether BSpline will be cloed
         * @default false
         */
        closed = false;
    }
    export class BSplinesDto {
        constructor(bSplines?: BSplineDto[], returnCompound?: boolean) {
            if (bSplines !== undefined) { this.bSplines = bSplines; }
            if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
        }
        /**
         * BSpline definitions
         * @default undefined
         */
        bSplines: BSplineDto[];
        /**
         * Indicates whether the shapes should be returned as a compound
         */
        returnCompound = false;
    }
    export class WireFromTwoCirclesTanDto<T> {
        constructor(circle1?: T, circle2?: T, keepLines?: twoSidesStrictEnum, circleRemainders?: fourSidesStrictEnum, tolerance?: number) {
            if (circle1 !== undefined) { this.circle1 = circle1; }
            if (circle2 !== undefined) { this.circle2 = circle2; }
            if (keepLines !== undefined) { this.keepLines = keepLines; }
            if (circleRemainders !== undefined) { this.circleRemainders = circleRemainders; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The first circle to be encloed with tangential lines
         * @default undefined
         */
        circle1: T;
        /**
         * The second circle to be encloed with tangential lines
         * @default undefined
         */
        circle2: T;
        /**
         * Choose which side to keep for the wire. Outside gives non-intersecting solution.
         * @default outside
         */
        keepLines: twoSidesStrictEnum = twoSidesStrictEnum.outside;
        /**
         * Choose which side to keep for the wire. Outside gives non-intersecting solution.
         * @default outside
         */
        circleRemainders: fourSidesStrictEnum = fourSidesStrictEnum.outside;
        /**
         * tolerance
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         * @step 0.00001
         */
        tolerance = 1e-7;
    }
    export class FaceFromMultipleCircleTanWiresDto<T> {
        constructor(circles?: T[], combination?: combinationCirclesForFaceEnum, unify?: boolean, tolerance?: number) {
            if (circles !== undefined) { this.circles = circles; }
            if (combination !== undefined) { this.combination = combination; }
            if (unify !== undefined) { this.unify = unify; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The circles that will all be joined into a single face through tangential lines
         * @default undefined
         */
        circles: T[];
        /**
         * Indicates how circles should be joined together. Users can choose to join all circles with each other. Alternatively it is possible to respect the order of circles and only join consecutive circles. It is also possible to respect order and close the shape with first circle in the list.
         * @default allWithAll
         */
        combination: combinationCirclesForFaceEnum = combinationCirclesForFaceEnum.allWithAll;
        /**
         * Choose whether you want faces to be unifided into a single face or not. Sometimes if you want to get faster result you can set this to false, but in this case faces will be returned as compound.
         * @default true
         */
        unify = true;
        /**
         * tolerance
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         * @step 0.00001
         */
        tolerance = 1e-7;
    }
    export class FaceFromMultipleCircleTanWireCollectionsDto<T> {
        constructor(listsOfCircles?: T[][], combination?: combinationCirclesForFaceEnum, unify?: boolean, tolerance?: number) {
            if (listsOfCircles !== undefined) { this.listsOfCircles = listsOfCircles; }
            if (combination !== undefined) { this.combination = combination; }
            if (unify !== undefined) { this.unify = unify; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The two dimensional circle array that can host multiple circle collections.
         * @default undefined
         */
        listsOfCircles: T[][];
        /**
         * Indicates how circles should be joined together. Users can choose to join all circles with each other. Alternatively it is possible to respect the order of circles and only join consecutive circles. It is also possible to respect order and close the shape with first circle in the list.
         * @default allWithAll
         */
        combination: combinationCirclesForFaceEnum = combinationCirclesForFaceEnum.allWithAll;
        /**
         * Choose whether you want faces to be unifided into a single face or not. Sometimes if you want to get faster result you can set this to false, but in this case faces will be returned as compound.
         * @default true
         */
        unify = true;
        /**
         * tolerance
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         * @step 0.00001
         */
        tolerance = 1e-7;
    }
    export class ZigZagBetweenTwoWiresDto<T> {
        constructor(wire1?: T, wire2?: T, nrZigZags?: number, inverse?: boolean, divideByEqualDistance?: boolean, zigZagsPerEdge?: boolean) {
            if (wire1 !== undefined) { this.wire1 = wire1; }
            if (wire2 !== undefined) { this.wire2 = wire2; }
            if (nrZigZags !== undefined) { this.nrZigZags = nrZigZags; }
            if (inverse !== undefined) { this.inverse = inverse; }
            if (divideByEqualDistance !== undefined) { this.divideByEqualDistance = divideByEqualDistance; }
            if (zigZagsPerEdge !== undefined) { this.zigZagsPerEdge = zigZagsPerEdge; }
        }
        /**
         * The first wire for zig zag
         * @default undefined
         */
        wire1: T;
        /**
         * The second wire for zig zag
         * @default undefined
         */
        wire2: T;
        /**
         * How many zig zags to create between the two wires on each edge. The number of edges should match. Edges will be joined by zigzags in order. One zig zag means two edges forming a corner.
         * @default 20
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrZigZags = 20;
        /**
         * Inverse the the zig zag to go from wire2 to wire1
         * @default false
         */
        inverse: boolean;
        /**
         * If true, the zig zags will be spaced equally on each edge. By default we follow parametric subdivision of the edges, which is not always equal to distance based subdivisions.
         * @default false
         */
        divideByEqualDistance = false;

        /**
         * By default the number of zig zags is applied to each edge. If this is set to false, the number of zig zags will be applied to the whole wire. This could then skip some corners where edges meet.
         * @default true
         */
        zigZagsPerEdge = true;
    }
    export class InterpolationDto {
        constructor(points?: Base.Point3[], periodic?: boolean, tolerance?: number) {
            if (points !== undefined) { this.points = points; }
            if (periodic !== undefined) { this.periodic = periodic; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * Points through which the BSpline will be created
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Indicates wether BSpline will be periodic
         * @default false
         */
        periodic = false;
        /**
         * tolerance
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         * @step 0.00001
         */
        tolerance = 1e-7;
    }
    export class InterpolateWiresDto {
        constructor(interpolations?: InterpolationDto[], returnCompound?: boolean) {
            if (interpolations !== undefined) { this.interpolations = interpolations; }
            if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
        }
        /**
         * Interpolation definitions
         * @default undefined
         */
        interpolations: InterpolationDto[];
        /**
         * Indicates whether the shapes should be returned as a compound
         */
        returnCompound = false;
    }
    export class BezierDto {
        constructor(points?: Base.Point3[], closed?: boolean) {
            if (points !== undefined) { this.points = points; }
            if (closed !== undefined) { this.closed = closed; }
        }
        /**
         * Points through which the Bezier curve will be created
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Indicates wether Bezier will be cloed
         * @default false
         */
        closed = false;
    }
    export class BezierWeightsDto {
        constructor(points?: Base.Point3[], weights?: number[], closed?: boolean) {
            if (points !== undefined) { this.points = points; }
            if (weights !== undefined) { this.weights = weights; }
            if (closed !== undefined) { this.closed = closed; }
        }
        /**
         * Points through which the Bezier curve will be created
         * @default undefined
         */
        points: Base.Point3[];
        /**
        * Weights for beziers that will be used, values should be between 0 and 1
        * @default undefined
        */
        weights: number[];
        /**
         * Indicates wether Bezier will be cloed
         * @default false
         */
        closed = false;
    }
    export class BezierWiresDto {
        constructor(bezierWires?: BezierDto[], returnCompound?: boolean) {
            if (bezierWires !== undefined) { this.bezierWires = bezierWires; }
            if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
        }
        /**
         * Bezier wires
         * @default undefined
         */
        bezierWires: BezierDto[];
        /**
         * Indicates whether the shapes should be returned as a compound
         */
        returnCompound = false;
    }
    export class DivideDto<T> {
        constructor(shape: T, nrOfDivisions?: number, removeStartPoint?: boolean, removeEndPoint?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (nrOfDivisions !== undefined) { this.nrOfDivisions = nrOfDivisions; }
            if (removeStartPoint !== undefined) { this.removeStartPoint = removeStartPoint; }
            if (removeEndPoint !== undefined) { this.removeEndPoint = removeEndPoint; }
        }
        /**
         * Shape representing a wire
         * @default undefined
         */
        shape: T;
        /**
         * The number of divisions that will be performed on the curve
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrOfDivisions = 10;
        /**
         * Indicates if algorithm should remove start point
         * @default false
         */
        removeStartPoint = false;
        /**
         * Indicates if algorithm should remove end point
         * @default false
         */
        removeEndPoint = false;
    }

    export class ProjectWireDto<T, U> {
        constructor(wire?: T, shape?: U, direction?: Base.Vector3) {
            if (wire !== undefined) { this.wire = wire; }
            if (shape !== undefined) { this.shape = shape; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * Wire to project
         * @default undefined
         */
        wire: T;
        /**
         * Shape to use for projection
         * @default undefined
         */
        shape: U;
        /**
         * Direction vector for projection
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class ProjectPointsOnShapeDto<T> {
        constructor(points?: Base.Point3[], shape?: T, direction?: Base.Vector3, projectionType?: pointProjectionTypeEnum) {
            if (points !== undefined) { this.points = points; }
            if (shape !== undefined) { this.shape = shape; }
            if (direction !== undefined) { this.direction = direction; }
            if (projectionType !== undefined) { this.projectionType = projectionType; }
        }
        /**
         * Points to project
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Shape to use for projection
         * @default undefined
         */
        shape: T;
        /**
         * Direction vector for projection - this must take the length into account as well, because algorithm looks for intresections with the shape in this direction. It will not find solutions outside the given length of this vector.
         * @default [0, 10, 0]
         */
        direction: Base.Vector3 = [0, 10, 0];
        /**
         * Allows user to choose what solutions are being returned by this operation.
         * @default all
         */
        projectionType: pointProjectionTypeEnum;
    }
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
         * Shape to use for parsing edges
         * @default undefined
         */
        shape: T;
        /**
         * The angular deflection
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        angularDeflection = 0.1;
        /**
         * The curvature deflection
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.001
         */
        curvatureDeflection = 0.1;
        /**
         * Minimum of points
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        minimumOfPoints = 2;
        /**
         * U tolerance
         * @default 1.0e-9
         * @minimum 0
         * @maximum Infinity
         * @step 1.0e-9
         */
        uTolerance = 1.0e-9;
        /**
         * Minimum length
         * @default 1.0e-7
         * @minimum 0
         * @maximum Infinity
         * @step 1.0e-7
         */
        minimumLength = 1.0e-7;
    }
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
         * Shape to use for parsing edges
         * @default undefined
         */
        shape: T;
        /**
         * The angular deflection
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        angularDeflection = 0.1;
        /**
         * The curvature deflection
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.001
         */
        curvatureDeflection = 0.1;
        /**
         * Minimum of points
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        minimumOfPoints = 2;
        /**
         * U tolerance
         * @default 1.0e-9
         * @minimum 0
         * @maximum Infinity
         * @step 1.0e-9
         */
        uTolerance = 1.0e-9;
        /**
         * Minimum length
         * @default 1.0e-7
         * @minimum 0
         * @maximum Infinity
         * @step 1.0e-7
         */
        minimumLength = 1.0e-7;
    }
    export class ProjectWiresDto<T, U> {
        constructor(wires?: T[], shape?: U, direction?: Base.Vector3) {
            if (wires !== undefined) { this.wires = wires; }
            if (shape !== undefined) { this.shape = shape; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * Wire to project
         * @default undefined
         */
        wires: T[];
        /**
         * Shape to use for projection
         * @default undefined
         */
        shape: U;
        /**
         * Direction vector for projection
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class DivideShapesDto<T> {
        constructor(shapes: T[], nrOfDivisions?: number, removeStartPoint?: boolean, removeEndPoint?: boolean) {
            if (shapes !== undefined) { this.shapes = shapes; }
            if (nrOfDivisions !== undefined) { this.nrOfDivisions = nrOfDivisions; }
            if (removeStartPoint !== undefined) { this.removeStartPoint = removeStartPoint; }
            if (removeEndPoint !== undefined) { this.removeEndPoint = removeEndPoint; }
        }
        /**
         * Shapes
         * @default undefined
         */
        shapes: T[];
        /**
         * The number of divisions that will be performed on the curve
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrOfDivisions = 10;
        /**
         * Indicates if algorithm should remove start point
         * @default false
         */
        removeStartPoint = false;
        /**
         * Indicates if algorithm should remove end point
         * @default false
         */
        removeEndPoint = false;
    }
    export class DataOnGeometryAtParamDto<T> {
        constructor(shape: T, param?: number) {
            if (shape !== undefined) { this.shape = shape; }
            if (param !== undefined) { this.param = param; }
        }
        /**
         * Shape representing a geometry
         * @default undefined
         */
        shape: T;
        /**
         * 0 - 1 value
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        param = 0.5;
    }
    export class DataOnGeometryesAtParamDto<T> {
        constructor(shapes: T[], param?: number) {
            if (shapes !== undefined) { this.shapes = shapes; }
            if (param !== undefined) { this.param = param; }
        }
        /**
         * Shapes representing a geometry
         * @default undefined
         */
        shapes: T[];
        /**
         * 0 - 1 value
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        param = 0.5;
    }
    export class PointInFaceDto<T> {
        constructor(face: T, edge: T, tEdgeParam?: number, distance2DParam?: number) {
            if (face !== undefined) { this.face = face; }
            if (edge !== undefined) { this.edge = edge; }
            if (tEdgeParam !== undefined) { this.tEdgeParam = tEdgeParam; }
            if (distance2DParam !== undefined) { this.distance2DParam = distance2DParam; }
        }
        /** 
         * OCCT face to be used for calculation 
         * @default undefined
         */
        face: T;
        /**
         * OCCT edge to be used for calculation
         * @default undefined
         */
        edge: T;
        /**
         * 0 - 1 value
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        tEdgeParam = 0.5;
        /**
         * The point will be distanced on <distance2DParam> from the 2d curve.
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        distance2DParam = 0.5;
    }

    export class PointsOnWireAtEqualLengthDto<T> {
        constructor(shape: T, length?: number, tryNext?: boolean, includeFirst?: boolean, includeLast?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (length !== undefined) { this.length = length; }
            if (tryNext !== undefined) { this.tryNext = tryNext; }
            if (includeFirst !== undefined) { this.includeFirst = includeFirst; }
            if (includeLast !== undefined) { this.includeLast = includeLast; }
        }
        /**
         * Shape representing a wire
         * @default undefined
         */
        shape: T;
        /**
         * length at which to evaluate the point
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        length = 0.5;
        /**
         * Try next point if the point is not found
         * @default false
         */
        tryNext = false;
        /**
         * Include first point
         * @default false
         */
        includeFirst = false;
        /**
         * Include last point
         * @default false
         */
        includeLast = false;
    }


    export class PointsOnWireAtPatternOfLengthsDto<T> {
        constructor(shape: T, lengths?: number[], tryNext?: boolean, includeFirst?: boolean, includeLast?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (lengths !== undefined) { this.lengths = lengths; }
            if (tryNext !== undefined) { this.tryNext = tryNext; }
            if (includeFirst !== undefined) { this.includeLast = includeFirst; }
            if (includeLast !== undefined) { this.includeLast = includeLast; }
        }
        /**
         * Shape representing a wire
         * @default undefined
         */
        shape: T;
        /**
         * length at which to evaluate the point
         * @default undefined
         */
        lengths: number[];
        /**
         * Try next point if the point is not found
         * @default false
         */
        tryNext = false;
        /**
         * Include first point
         * @default false
         */
        includeFirst = false;
        /**
         * Include last point
         * @default false
         */
        includeLast = false;
    }
    export class DataOnGeometryAtLengthDto<T> {
        constructor(shape: T, length?: number) {
            if (shape !== undefined) { this.shape = shape; }
            if (length !== undefined) { this.length = length; }
        }
        /**
         * Shape
         * @default undefined
         */
        shape: T;
        /**
         * length at which to evaluate the point
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        length = 0.5;
    }

    export class DataOnGeometryesAtLengthDto<T> {
        constructor(shapes: T[], length?: number) {
            if (shapes !== undefined) { this.shapes = shapes; }
            if (length !== undefined) { this.length = length; }
        }
        /**
         * Shapes
         * @default undefined
         */
        shapes: T[];
        /**
         * length at which to evaluate the point
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        length = 0.5;
    }

    export class DataOnGeometryAtLengthsDto<T> {
        constructor(shape: T, lengths?: number[]) {
            if (shape !== undefined) { this.shape = shape; }
            if (lengths !== undefined) { this.lengths = lengths; }
        }
        /**
         * Shape representing a wire
         * @default undefined
         */
        shape: T;
        /**
         * lengths at which to evaluate the points
         * @default undefined
         */
        lengths: number[];
    }
    export class CircleDto {
        constructor(radius?: number, center?: Base.Point3, direction?: Base.Vector3) {
            if (radius !== undefined) { this.radius = radius; }
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * Radius of the circle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Center of the circle
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction vector for circle
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class LoftDto<T> {
        constructor(shapes?: T[], makeSolid?: boolean) {
            if (shapes !== undefined) { this.shapes = shapes; }
            if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
        }
        /**
         * Wires through which the loft passes
         * @default undefined
         */
        shapes: T[];
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
        shapes: T[];
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
        startVertex?: Base.Point3;
        /**
         * Optional if loft should end with a vertex
         * @default undefined
         * @optional true
         */
        endVertex?: Base.Point3;
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
        shape: T;
        /**
         * Optionally provide face for the offset
         * @default undefined
         * @optional true
         */
        face?: U;
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
        shape: T;
        /**
         * Optionally provide face for the offset
         * @default undefined
         * @optional true
         */
        face?: U;
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
        shape: T;
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
        shape: T;
        /**
         * Shapes along the path to be piped
         * @default undefined
         */
        shapes: U[];
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
        wires: T[];
        /**
         * Face shape
         * @default undefined
         */
        face: U;
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
        shapes: T[];
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
        shape: T;
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
        shape: T;
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
        shape: T;
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
        shapes: T[];
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
        shape: T;
        /**
         * Shapes to split from main shape
         * @default undefined
         */
        shapes: T[];
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
        shapes: T[];
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
        shape: T;
        /**
         * Objects to subtract
         * @default undefined
         */
        shapes: T[];
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
        shapes: T[];
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
        shape: T;
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
        shape: T;
        /**
         * Shape to be compared against
         * @default undefined
         */
        otherShape: T;
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
        shape: T;
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
        shape: T;
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
        shape: T;
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
        shapes: T[];
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
        shape: T;
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
        shape: T;
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
        shape: T;
        /**
         * Index of the entity
         * @default 1
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        index = 1;
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
        shape: T;
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
        shape: T;
        /**
         * closing faces
         * @default undefined
         */
        shapes: T[];
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
        shape: T;
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
        shapes: T[];
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
        shape: T;
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
        shapes: T[];
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
        shape: T;
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
        shape: T;
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
        shapes: T[];
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
        shape: T;
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
        shapes: T[];
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
        shape: T;
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
        shapes: T[];
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
        shape: T;
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
        shape: T;
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
        shapes: T[];
        /**
         * Points to filter
         * @default undefined
         */
        points: Base.Point3[];
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
        shape: T;
        /**
         * Points to filter
         * @default undefined
         */
        points: Base.Point3[];
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
        shape: T;
        /**
         * Points to filter
         * @default undefined
         */
        points: Base.Point3[];
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
        shapes: T[];
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
        shape: T;
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
        shape: T;
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
        shapes: T[];
        /**
         * Axis on which to rotate
         * @default [[0, 0, 1]]
         */
        axes: Base.Vector3[];
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
        shapes: T[];
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
        shape: T;
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
        shapes: T[];
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
        shape: T;
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
        shapes: T[];
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
    export class ShapeToMeshDto<T> {
        constructor(shape?: T, precision?: number, adjustYtoZ?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (precision !== undefined) { this.precision = precision; }
            if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        }
        /**
         * Shape to save
         * @default undefined
         */
        shape: T;
        /**
         * Precision of the mesh
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         * @step 0.001
         */
        precision = 0.01;
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         * @default false
         */
        adjustYtoZ = false;
    }
    export class ShapeFacesToPolygonPointsDto<T> {
        constructor(shape?: T, precision?: number, adjustYtoZ?: boolean, reversedPoints?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (precision !== undefined) { this.precision = precision; }
            if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
            if (reversedPoints !== undefined) { this.reversedPoints = reversedPoints; }
        }
        /**
         * Shape to save
         * @default undefined
         */
        shape: T;
        /**
         * Precision of the mesh
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         * @step 0.001
         */
        precision = 0.01;
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         * @default false
         */
        adjustYtoZ = false;
        /**
         * Reverse the order of the points describing the polygon because some CAD kernels use the opposite order
         * @default false
         */
        reversedPoints = false;
    }
    export class ShapesToMeshesDto<T> {
        constructor(shapes?: T[], precision?: number, adjustYtoZ?: boolean) {
            if (shapes !== undefined) { this.shapes = shapes; }
            if (precision !== undefined) { this.precision = precision; }
            if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        }
        /**
         * Shapes to transform
         * @default undefined
         */
        shapes: T[];
        /**
         * Precision of the mesh
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         * @step 0.001
         */
        precision = 0.01;
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         * @default false
         */
        adjustYtoZ = false;
    }
    export class SaveStepDto<T> {
        constructor(shape?: T, fileName?: string, adjustYtoZ?: boolean, tryDownload?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (fileName !== undefined) { this.fileName = fileName; }
            if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
            if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
        }
        /**
         * Shape to save
         * @default undefined
         */
        shape: T;
        /**
         * File name
         * @default shape.step
         */
        fileName = "shape.step";
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         * @default false
         */
        adjustYtoZ = false;
        /**
         * Will attempt to downlaod the file if that is possible
         * @default true
         */
        tryDownload? = true;
    }
    export class SaveStlDto<T> {
        constructor(shape?: T, fileName?: string, precision?: number, adjustYtoZ?: boolean, tryDownload?: boolean, binary?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (fileName !== undefined) { this.fileName = fileName; }
            if (precision !== undefined) { this.precision = precision; }
            if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
            if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
            if (binary !== undefined) { this.binary = binary; }
        }
        /**
         * Shape to save
         * @default undefined
         */
        shape: T;
        /**
         * File name
         * @default shape.stl
         */
        fileName = "shape.stl";
        /**
         * Precision of the mesh - lower means higher res
         * @default 0.01
         */
        precision = 0.01;
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         * @default false
         */
        adjustYtoZ = false;
        /**
         * Try download the file if that is possible
         * @default true
         */
        tryDownload? = true;
        /**
         * Generate binary STL file
         * @default true
         */
        binary? = true;
    }
    export class ImportStepIgesFromTextDto {
        constructor(text?: string, fileType?: fileTypeEnum, adjustZtoY?: boolean) {
            if (text !== undefined) { this.text = text; }
            if (fileType !== undefined) { this.fileType = fileType; }
            if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
        }
        /**
         * The text that represents step or iges contents
         * @default undefined
         */
        text: string;
        /**
         * Identify the import type
         */
        fileType: fileTypeEnum = fileTypeEnum.step;
        /**
         * Adjusts models that use Z coordinate as up to Y up system.
         * @default true
         */
        adjustZtoY = true;
    }
    export class ImportStepIgesDto {
        constructor(assetFile?: File, adjustZtoY?: boolean) {
            if (assetFile !== undefined) { this.assetFile = assetFile; }
            if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
        }
        /**
         * The name of the asset to store in the cache.
         * This allows to store the imported objects for multiple run cycles in the cache
         * @default undefined
         */
        assetFile: File;
        /**
         * Adjusts models that use Z coordinate as up to Y up system.
         * @default true
         */
        adjustZtoY = true;
    }
    export class LoadStepOrIgesDto {
        constructor(filetext?: string | ArrayBuffer, fileName?: string, adjustZtoY?: boolean) {
            if (filetext !== undefined) { this.filetext = filetext; }
            if (fileName !== undefined) { this.fileName = fileName; }
            if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
        }
        /**
         * File text
         * @default undefined
         */
        filetext: string | ArrayBuffer;
        /**
         * File name
         * @default shape.igs
         */
        fileName = "shape.igs";
        /**
         * Adjusts models that use Z coordinate as up to Y up system.
         * @default true
         */
        adjustZtoY = true;
    }
    export class CompoundShapesDto<T> {
        constructor(shapes?: T[]) {
            if (shapes !== undefined) { this.shapes = shapes; }
        }
        /**
         * Shapes to add to compound
         * @default undefined
         */
        shapes: T[];
    }
    export class ThisckSolidSimpleDto<T> {
        constructor(shape?: T, offset?: number) {
            if (shape !== undefined) { this.shape = shape; }
            if (offset !== undefined) { this.offset = offset; }
        }
        /**
         * Shape to make thick
         * @default undefined
         */
        shape: T;
        /**
         * Offset distance
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        offset = 1;
    }
    export class Offset3DWireDto<T> {
        constructor(shape?: T, offset?: number, direction?: Base.Vector3) {
            if (shape !== undefined) { this.shape = shape; }
            if (offset !== undefined) { this.offset = offset; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * Shape to make thick
         * @default undefined
         */
        shape: T;
        /**
         * Offset distance
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        offset = 1;
        /**
         * Direction normal of the plane for the offset
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class FaceFromWireDto<T> {
        constructor(shape?: T, planar?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (planar !== undefined) { this.planar = planar; }
        }
        /**
         * Wire shape to convert into a face
         * @default undefined
         */
        shape: T;
        /**
         * Should plane be planar
         * @default false
         */
        planar = false;
    }
    export class FaceFromWireOnFaceDto<T, U> {
        constructor(wire?: T, face?: U, inside?: boolean) {
            if (wire !== undefined) { this.wire = wire; }
            if (face !== undefined) { this.face = face; }
            if (inside !== undefined) { this.inside = inside; }
        }
        /**
         * Wire shape to convert into a face
         * @default undefined
         */
        wire: T;
        /**
         * Face to attach the wire to
         * @default undefined
         */
        face: U;
        /**
         * Indication if wire is inside the surface or outside
         * @default true
         */
        inside = true;
    }
    export class FacesFromWiresOnFaceDto<T, U> {
        constructor(wires?: T[], face?: U, inside?: boolean) {
            if (wires !== undefined) { this.wires = wires; }
            if (face !== undefined) { this.face = face; }
            if (inside !== undefined) { this.inside = inside; }
        }
        /**
         * Wire shape to convert into a face
         * @default undefined
         */
        wires: T[];
        /**
         * Face to attach the wires to
         * @default undefined
         */
        face: U;
        /**
         * Indication if wire is inside the surface or outside
         * @default true
         */
        inside = true;
    }
    export class FaceFromWiresDto<T> {
        constructor(shapes?: T[], planar?: boolean) {
            if (shapes !== undefined) { this.shapes = shapes; }
            if (planar !== undefined) { this.planar = planar; }
        }
        /**
         * Wire shapes to convert into a faces
         * @default undefined
         */
        shapes: T[];
        /**
         * Should plane be planar
         * @default false
         */
        planar = false;
    }
    export class FacesFromWiresDto<T> {
        constructor(shapes?: T[], planar?: boolean) {
            if (shapes !== undefined) { this.shapes = shapes; }
            if (planar !== undefined) { this.planar = planar; }
        }
        /**
         * Wire shapes to convert into a faces
         * @default undefined
         */
        shapes: T[];
        /**
         * Should plane be planar
         * @default false
         */
        planar = false;
    }
    export class FaceFromWiresOnFaceDto<T, U> {
        constructor(wires?: T[], face?: U, inside?: boolean) {
            if (wires !== undefined) { this.wires = wires; }
            if (face !== undefined) { this.face = face; }
            if (inside !== undefined) { this.inside = inside; }
        }
        /**
         * Wire shapes to convert into a faces
         * @default undefined
         */
        wires: T[];
        /**
         * Guide face to use as a base
         * @default undefined
         */
        face: U;
        /**
         * Indication if wire is inside the surface or outside
         * @default true
         */
        inside = true;
    }
    export class SewDto<T> {
        constructor(shapes: T[], tolerance?: number) {
            if (shapes !== undefined) { this.shapes = shapes; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * Faces to construct a shell from
         * @default undefined
         */
        shapes: T[];
        /**
         * Tolerance of sewing
         * @default 1.0e-7
         * @minimum 0
         * @maximum Infinity
         * @step 0.00001
         */
        tolerance = 1.0e-7;
    }

    export class FaceIsoCurveAtParamDto<T> {
        constructor(shape?: T, param?: number, dir?: "u" | "v") {
            if (shape !== undefined) { this.shape = shape; }
            if (param !== undefined) { this.param = param; }
            if (dir !== undefined) { this.dir = dir; }
        }
        /**
         * Face shape
         * @default undefined
         */
        shape: T;
        /**
         * Param at which to find isocurve
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        param: number;
        /**
         * Direction to find the isocurve
         * @default u
         */
        dir: "u" | "v" = "u";
    }

    export class DivideFaceToUVPointsDto<T> {
        constructor(shape?: T, nrOfPointsU?: number, nrOfPointsV?: number, flat?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (nrOfPointsU !== undefined) { this.nrOfPointsU = nrOfPointsU; }
            if (nrOfPointsV !== undefined) { this.nrOfPointsV = nrOfPointsV; }
            if (flat !== undefined) { this.flat = flat; }
        }
        /**
         * Face shape
         * @default undefined
         */
        shape: T;
        /**
         * Number of points on U direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrOfPointsU = 10;
        /**
         * Number of points on V direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrOfPointsV = 10;
        /**
         * Flatten the output
         * @default false
         */
        flat = false;
    }

    export class Geom2dEllipseDto {
        constructor(center?: Base.Point2, direction?: Base.Vector2, radiusMinor?: number, radiusMajor?: number, sense?: boolean) {
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
            if (radiusMinor !== undefined) { this.radiusMinor = radiusMinor; }
            if (radiusMajor !== undefined) { this.radiusMajor = radiusMajor; }
            if (sense !== undefined) { this.sense = sense; }
        }
        /**
         * Center of the ellipse
         * @default [0,0]
         */
        center: Base.Point2 = [0, 0];
        /**
         * Direction of the vector
         * @default [1,0]
         */
        direction: Base.Vector2 = [1, 0];
        /**
         * Minor radius of an ellipse
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusMinor = 1;
        /**
         * Major radius of an ellipse
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusMajor = 2;
        /**
         * If true will sense the direction
         * @default false
         */
        sense = false;
    }
    export class Geom2dCircleDto {
        constructor(center?: Base.Point2, direction?: Base.Vector2, radius?: number, sense?: boolean) {
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
            if (radius !== undefined) { this.radius = radius; }
            if (sense !== undefined) { this.sense = sense; }
        }
        /**
         * Center of the circle
         * @default [0,0]
         */
        center: Base.Point2 = [0, 0];
        /**
         * Direction of the vector
         * @default [1,0]
         */
        direction: Base.Vector2 = [1, 0];
        /**
         * Radius of the circle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * If true will sense the direction
         * @default false
         */
        sense = false;
    }
    export class ChristmasTreeDto {
        constructor(height?: number, innerDist?: number, outerDist?: number, nrSkirts?: number, trunkHeight?: number, trunkWidth?: number, half?: boolean, rotation?: number, origin?: Base.Point3, direction?: Base.Vector3) {
            if (height !== undefined) { this.height = height; }
            if (innerDist !== undefined) { this.innerDist = innerDist; }
            if (outerDist !== undefined) { this.outerDist = outerDist; }
            if (nrSkirts !== undefined) { this.nrSkirts = nrSkirts; }
            if (trunkHeight !== undefined) { this.trunkHeight = trunkHeight; }
            if (trunkWidth !== undefined) { this.trunkWidth = trunkWidth; }
            if (half !== undefined) { this.half = half; }
            if (rotation !== undefined) { this.rotation = rotation; }
            if (origin !== undefined) { this.origin = origin; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * Height of the tree
         * @default 6
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 6;
        /**
         * Inner distance of the branches on the bottom of the tree
         * @default 1.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        innerDist = 1.5;
        /**
         * Outer distance of the branches on the bottom of the tree
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        outerDist = 3;
        /**
         * Number of skirts on the tree (triangle like shapes)
         * @default 5
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrSkirts = 5;
        /**
         * Trunk height
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        trunkHeight = 1;
        /**
         * Trunk width only applies if trunk height is more than 0
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        trunkWidth = 1;
        /**
         * Indicates wether only a half of the tree should be created
         * @default false
         */
        half = false;
        /**
         * Rotation of the tree
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 15
         */
        rotation = 0;
        /**
         * Origin of the tree
         * @default [0, 0, 0]
         */
        origin: Base.Point3 = [0, 0, 0];
        /**
         * Direction of the tree
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class StarDto {
        constructor(outerRadius?: number, innerRadius?: number, numRays?: number, center?: Base.Point3, direction?: Base.Vector3, offsetOuterEdges?: number, half?: boolean) {
            if (outerRadius !== undefined) { this.outerRadius = outerRadius; }
            if (innerRadius !== undefined) { this.innerRadius = innerRadius; }
            if (numRays !== undefined) { this.numRays = numRays; }
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
            if (offsetOuterEdges !== undefined) { this.offsetOuterEdges = offsetOuterEdges; }
            if (half !== undefined) { this.half = half; }
        }
        /**
         * Center of the circle
         * @default [0,0,0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
        /**
         * Direction of the vector
         * @default 7
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        numRays = 7;
        /**
         * Angle of the rays
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        outerRadius: number;
        /**
         * Angle of the rays
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        innerRadius: number;
        /**
         * Offsets outer edge cornerners along the direction vector
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        offsetOuterEdges?: number;
        /**
         * Construct half of the star
         * @default false
         */
        half = false;
    }
    export class ParallelogramDto {
        constructor(center?: Base.Point3, direction?: Base.Vector3, aroundCenter?: boolean, width?: number, height?: number, angle?: number) {
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
            if (aroundCenter !== undefined) { this.aroundCenter = aroundCenter; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
            if (angle !== undefined) { this.angle = angle; }
        }
        /**
         * Center of the circle
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
        /**
         * Indicates whether to draw the parallelogram around the center point or start from corner.
         * @default true
         */
        aroundCenter = true;
        /**
         * Width of bounding rectangle
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width = 2;
        /**
         * Height of bounding rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Sharp angle of the parallelogram
         * @default 15
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        angle = 15;
    }
    export class Heart2DDto {
        constructor(center?: Base.Point3, direction?: Base.Vector3, rotation?: number, sizeApprox?: number) {
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
            if (rotation !== undefined) { this.rotation = rotation; }
            if (sizeApprox !== undefined) { this.sizeApprox = sizeApprox; }
        }
        /**
         * Center of the circle
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
        /**
         * Rotation of the hear
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 15
         */
        rotation = 0;
        /**
         * Size of the bounding box within which the heart gets drawn
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeApprox = 2;
    }
    export class NGonWireDto {
        constructor(center?: Base.Point3, direction?: Base.Vector3, nrCorners?: number, radius?: number) {
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
            if (nrCorners !== undefined) { this.nrCorners = nrCorners; }
            if (radius !== undefined) { this.radius = radius; }
        }
        /**
         * Center of the circle
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
        /**
         * How many corners to create.
         * @default 6
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        nrCorners = 6;
        /**
         * Radius of nGon
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
    }
    export class EllipseDto {
        constructor(center?: Base.Point3, direction?: Base.Vector3, radiusMinor?: number, radiusMajor?: number) {
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
            if (radiusMinor !== undefined) { this.radiusMinor = radiusMinor; }
            if (radiusMajor !== undefined) { this.radiusMajor = radiusMajor; }
        }
        /**
         * Center of the ellipse
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction of the vector
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
        /**
         * Minor radius of an ellipse
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusMinor = 1;
        /**
         * Major radius of an ellipse
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusMajor = 2;
    }
    export class TextWiresDto {
        constructor(text?: string, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: Base.horizontalAlignEnum, extrudeOffset?: number, origin?: Base.Point3, rotation?: number, direction?: Base.Vector3, centerOnOrigin?: boolean) {
            if (text !== undefined) { this.text = text; }
            if (xOffset !== undefined) { this.xOffset = xOffset; }
            if (yOffset !== undefined) { this.yOffset = yOffset; }
            if (height !== undefined) { this.height = height; }
            if (lineSpacing !== undefined) { this.lineSpacing = lineSpacing; }
            if (letterSpacing !== undefined) { this.letterSpacing = letterSpacing; }
            if (align !== undefined) { this.align = align; }
            if (extrudeOffset !== undefined) { this.extrudeOffset = extrudeOffset; }
            if (centerOnOrigin !== undefined) { this.centerOnOrigin = centerOnOrigin; }
        }
        /**
         * The text
         * @default Hello World
         */
        text? = "Hello World";
        /**
         * The x offset
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        xOffset? = 0;
        /**
         * The y offset
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        yOffset? = 0;
        /**
         * The height of the text
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        height? = 1;
        /**
         * The line spacing
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        lineSpacing? = 2;
        /**
         * The letter spacing offset
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        letterSpacing? = 0;
        /**
         * The extrude offset
         * @default left
         */
        align?: Base.horizontalAlignEnum;
        /**
         * The extrude offset
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extrudeOffset? = 0;
        /**
         * Indicates whether to center text on origin
         * @default false
         */
        centerOnOrigin = false;
    }
    export class GeomCylindricalSurfaceDto {
        constructor(radius?: number, center?: Base.Point3, direction?: Base.Vector3) {
            if (radius !== undefined) { this.radius = radius; }
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * Radius of the cylindrical surface
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Center of the cylindrical surface
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Axis of direction for cylindrical surface
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class Geom2dTrimmedCurveDto<T> {
        constructor(shape?: T, u1?: number, u2?: number, sense?: boolean, adjustPeriodic?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (u1 !== undefined) { this.u1 = u1; }
            if (u2 !== undefined) { this.u2 = u2; }
            if (sense !== undefined) { this.sense = sense; }
            if (adjustPeriodic !== undefined) { this.adjustPeriodic = adjustPeriodic; }
        }
        /**
         * 2D Curve to trim
         * @default undefined
         */
        shape: T;
        /**
         * First param on the curve for trimming. U1 can be greater or lower than U2. The returned curve is oriented from U1 to U2.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        u1 = 0;
        /**
         * Second parameter on the curve for trimming
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        u2 = 1;
        /**
         *  If the basis curve C is periodic there is an ambiguity because two parts are available. 
         *  In this case by default the trimmed curve has the same orientation as the basis curve (Sense = True). 
         * If Sense = False then the orientation of the trimmed curve is opposite to the orientation of the basis curve C.
         * @default true
         */
        sense = true;
        /**
         * If the curve is closed but not periodic it is not possible to keep the part of the curve including the
         * junction point (except if the junction point is at the beginning or at the end of the trimmed curve)
         * because you could lose the fundamental characteristics of the basis curve which are used for example
         * to compute the derivatives of the trimmed curve. So for a closed curve the rules are the same as for a open curve.
         * @default true
         */
        adjustPeriodic = true;
    }
    export class Geom2dSegmentDto {
        constructor(start?: Base.Point2, end?: Base.Point2) {
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
        }
        /**
         * Start 2d point for segment
         * @default [0, 0]
         */
        start: Base.Point2 = [0, 0];
        /**
         * End 2d point for segment
         * @default [1, 0]
         */
        end: Base.Point2 = [1, 0];
    }
    export class SliceDto<T> {
        constructor(shape?: T, step?: number, direction?: Base.Vector3) {
            if (shape !== undefined) { this.shape = shape; }
            if (step !== undefined) { this.step = step; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * The shape to slice
         * @default undefined
         */
        shape: T;
        /**
         * Step at which to divide the shape
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        step = 0.1;
        /**
         * Direction vector
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class SliceInStepPatternDto<T> {
        constructor(shape?: T, steps?: number[], direction?: Base.Vector3) {
            if (shape !== undefined) { this.shape = shape; }
            if (steps !== undefined) { this.steps = steps; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * The shape to slice
         * @default undefined
         */
        shape: T;
        /**
         * Steps that should be used for slicing. This array is going to be treated as a pattern - 
         * this menas that if the actual number of steps is lower than the number of steps in the pattern, the pattern will be repeated.
         * @default [0.1, 0.2]
         */
        steps = [0.1, 0.2];
        /**
         * Direction vector
         * @default [0, 1, 0]
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
    export class SimpleLinearLengthDimensionDto {
        constructor(start?: Base.Point3, end?: Base.Point3, direction?: Base.Vector3, offsetFromPoints?: number, crossingSize?: number, labelSuffix?: string, labelSize?: number, labelOffset?: number) {
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
            if (direction !== undefined) { this.direction = direction; }
            if (offsetFromPoints !== undefined) { this.offsetFromPoints = offsetFromPoints; }
            if (crossingSize !== undefined) { this.crossingSize = crossingSize; }
            if (labelSuffix !== undefined) { this.labelSuffix = labelSuffix; }
            if (labelSize !== undefined) { this.labelSize = labelSize; }
            if (labelOffset !== undefined) { this.labelOffset = labelOffset; }
        }
        /**
         * The start point for dimension
         * @default undefined
         */
        start: Base.Point3;
        /**
         * The end point for dimension
         * @default undefined
         */
        end?: Base.Point3;
        /**
         * The dimension direction (must include length)
         * @default undefined
         */
        direction?: Base.Vector3;
        /**
         * The dimension label
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        offsetFromPoints? = 0;
        /**
         * The dimension crossing size
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        crossingSize? = 0.2;
        /**
         * The dimension label decimal places
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        decimalPlaces? = 2;
        /**
         * The dimension label suffix
         * @default (cm)
         */
        labelSuffix? = "(cm)";
        /**
         * The dimension label size
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        labelSize? = 0.1;
        /**
         * The dimension label offset
         * @default 0.3
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        labelOffset? = 0.3;
    }
    export class SimpleAngularDimensionDto {
        constructor(direction1?: Base.Point3, direction2?: Base.Point3, center?: Base.Point3, radius?: number, offsetFromCenter?: number, crossingSize?: number, radians?: boolean, labelSuffix?: string, labelSize?: number, labelOffset?: number) {
            if (direction1 !== undefined) { this.direction1 = direction1; }
            if (direction2 !== undefined) { this.direction2 = direction2; }
            if (center !== undefined) { this.center = center; }
            if (radius !== undefined) { this.radius = radius; }
            if (offsetFromCenter !== undefined) { this.offsetFromCenter = offsetFromCenter; }
            if (crossingSize !== undefined) { this.extraSize = crossingSize; }
            if (radians !== undefined) { this.radians = radians; }
            if (labelSuffix !== undefined) { this.labelSuffix = labelSuffix; }
            if (labelSize !== undefined) { this.labelSize = labelSize; }
            if (labelOffset !== undefined) { this.labelOffset = labelOffset; }
        }

        /**
         * The first direction for dimension
         * @default [1, 0, 0]
         */
        direction1: Base.Point3 = [1, 0, 0];
        /**
         * The second direction for dimension
         * @default [0, 0, 1]
         */
        direction2: Base.Point3 = [0, 0, 1];
        /**
         * The center point for dimension
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * The dimension radius
         * @default 4
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 4;
        /**
         * Offset from center
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        offsetFromCenter = 0.5;
        /**
         * The dimension crossing size
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        extraSize = 0;
        /**
         * The dimension label decimal places
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        decimalPlaces = 2;
        /**
         * The dimension label suffix
         * @default (deg)
         */
        labelSuffix = "(deg)";
        /**
         * The dimension label size
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        labelSize = 0.1;
        /**
         * The dimension label offset
         * @default 0.3
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        labelOffset = 0.3;
        /**
         * If true the angle is in radians
         * @default false
         */
        radians = false;
    }
    export class PinWithLabelDto {
        constructor(startPoint?: Base.Point3, endPoint?: Base.Point3, direction?: Base.Vector3, offsetFromStart?: number, label?: string, labelOffset?: number, labelSize?: number) {
            if (startPoint !== undefined) { this.startPoint = startPoint; }
            if (endPoint !== undefined) { this.endPoint = endPoint; }
            if (direction !== undefined) { this.direction = direction; }
            if (offsetFromStart !== undefined) { this.offsetFromStart = offsetFromStart; }
            if (label !== undefined) { this.label = label; }
            if (labelOffset !== undefined) { this.labelOffset = labelOffset; }
            if (labelSize !== undefined) { this.labelSize = labelSize; }
        }
        /**
         * The start point for dimension
         * @default [0, 0, 0]
         */
        startPoint: Base.Point3 = [0, 0, 0];
        /**
         * The end point for dimension
         * @default [0, 5, 2]
         */
        endPoint?: Base.Point3 = [0, 5, 2];
        /**
         * The dimension direction (must include length)
         * @default [0, 0, 1]
         */
        direction?: Base.Vector3 = [0, 0, 1];
        /**
         * Offset from the start point
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        offsetFromStart? = 0;
        /**
         * The dimension label
         * @default Pin
         */
        label? = "Pin";
        /**
         * The dimension label offset
         * @default 0.3
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        labelOffset? = 0.3;
        /**
         * The dimension label size
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        labelSize? = 0.1;
    }
}
