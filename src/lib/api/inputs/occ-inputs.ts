// import { TopoDS_Face } from "projects/bitbybit-core/src/bitbybit-dev-occt/bitbybit-dev-occt";
import { Base, Line } from "./inputs";
// tslint:disable-next-line: no-namespace
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

    export enum JoinTypeEnum {
        arc = 'arc',
        intersection = 'intersection',
        tangent = 'tangent'
    }
    export enum ApproxParametrizationTypeEnum {
        approxChordLength = 'approxChordLength',
        approxCentripetal = 'approxCentripetal',
        approxIsoParametric = 'approxIsoParametric'
    }

    export type DecomposedMeshDto = {
        faceList: {
            face_index: number;
            normal_coord: Base.Vector3;
            number_of_triangles: number;
            tri_indexes: number[];
            vertex_coord: Base.Point3;
            vertex_coord_vec: Base.Vector3[];
        }[],
        edgeList: {
            edge_index: number;
            vertex_coord: Base.Point3[];
        }[]
    }
    export class ShapesDto<T> {
        constructor(shapes?: T[]) {
            this.shapes = shapes;
        }
        /**
         * The shapes
         */
        shapes?: T[];
    }
    export class FilletTwoEdgesInPlaneDto<T> extends ShapesDto<T> {
        /**
         * First edge to fillet
         */
        edge1: any;
        /**
         * Second edge to fillet
         */
        edge2: any;
        /**
         * Plane origin that is also used to find the closest solution if two solutions exist.
         */
        planeOrigin: Base.Point3 = [0, 0, 0];
        /**
         * Plane direction for fillet
         */
        planeDirection: Base.Vector3 = [0, 1, 0];
        /**
         * Radius of the fillet
         */
        radius: number = 0.3;
        /**
         * if solution is -1 planeOrigin chooses a particular fillet in case of several fillets may be constructed (for example, a circle intersecting a segment in 2 points). Put the intersecting (or common) point of the edges
         */
        solution?= -1;
    }

    export class FaceFromSurfaceAndWireDto<T, U> extends ShapesDto<T> {
        /**
         * Surface from which to create a face
         */
        surface: T;
        /**
         * Wire that represents a boundary on the surface to delimit the face
         */
        wire: U;
        /**
         * Indicates wether face should be created inside or outside the wire
         */
        inside = true;
    }
    export class EdgeFromGeom2dCurveAndSurfaceDto<T, U> extends ShapesDto<T> {
        /**
         * Curve 2d
         */
        curve: T;
        /**
         * Surface on which 2d curve will be evaluated
         */
        surface: U;
    }
    export class WireOnFaceDto<T, U> extends ShapesDto<T> {
        /**
         * Wire to place on face
         */
        wire: T;
        /**
         * Face on which the wire will be placed
         */
        face: U;
    }
    export class DrawShapeDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Brep OpenCascade geometry
         */
        shape?: T;
        /**
         * Face opacity value between 0 and 1
         */
        faceOpacity = 1;
        /**
         * Edge opacity value between 0 and 1
         */
        edgeOpacity = 1;
        /**
         * Hex colour string for the edges
         */
        edgeColour = '#ffffff';
        /**
         * Face material
         */
        faceMaterial?;
        /**
         * Hex colour string for face colour
         */
        faceColour = '#ff0000';
        /**
         * Edge width
         */
        edgeWidth = 2;
        /**
         * You can turn off drawing of edges via this property
         */
        drawEdges = true;
        /**
         * You can turn off drawing of faces via this property
         */
        drawFaces = true;
        /**
         * Precision
         */
        precision = 0.01;
        /**
         * Draw index of edges in space
         */
        drawEdgeIndexes = false;
        /**
         * Indicates the edge index height if they are drawn
         */
        edgeIndexHeight = 0.06;
        /**
         * Edge index colour if the edges are drawn
         */
        edgeIndexColour = '#ff00ff';
        /**
         * Draw indexes of faces in space
         */
        drawFaceIndexes = false;
        /**
         * Indicates the edge index height if they are drawn
         */
        faceIndexHeight = 0.06;
        /**
         * Edge index colour if the edges are drawn
         */
        faceIndexColour = '#0000ff';
    }
    export class FaceSubdivisionDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Brep OpenCascade geometry
         */
        shape?: T;
        /**
         * Number of subdivisions on U direction
         */
        nrDivisionsU: number;
        /**
         * Number of subdivisions on V direction
         */
        nrDivisionsV: number;
        /**
         * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
         */
        shiftHalfStepU = false;
        /**
         * Removes start edge points on U
         */
        removeStartEdgeU = false;
        /**
         * Removes end edge points on U 
         */
        removeEndEdgeU = false;
        /**
         * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
         */
        shiftHalfStepV = false;
        /**
         * Removes start edge points on V
         */
        removeStartEdgeV = false;
        /**
         * Removes end edge points on V 
         */
        removeEndEdgeV = false;

    }
    export class FaceLinearSubdivisionDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Brep OpenCascade geometry
         */
        shape?: T;
        /**
         * Linear subdivision direction true - U, false - V
         */
        isU: boolean;
        /**
         * Param on direction 0 - 1
         */
        param?: number;
        /**
         * Number of subdivisions on opposite direction
         */
        nrPoints: number;
        /**
         * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
         */
        shiftHalfStep = false;
        /**
         * Removes first point
         */
        removeStartPoint = false;
        /**
         * Removes last point
         */
        removeEndPoint = false;
    }

    export class DataOnUVDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Brep OpenCascade geometry
         */
        shape?: T;
        /**
         * Param on U direction 0 to 1
         */
        paramU: number;
        /**
         * Param on V direction 0 to 1
         */
        paramV: number;
    }
    export class DataOnUVsDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Brep OpenCascade geometry
         */
        shape?: T;
        /**
         * Params uv
         */
        paramsUV: [number, number][];
    }
    export class PolygonDto {
        constructor(points?: Base.Point3[]) {
            this.points = points;
        }
        /**
         * Points points
         */
        points?: Base.Point3[];
    }
    export class SquareDto {
        /**
         * size of square
         */
        size: number;
        /**
         * Center of the square
         */
        center: Base.Point3;
        /**
         * Direction of the square
         */
        direction: Base.Vector3;
    }
    export class RectangleDto {
        /**
         * width of the rectangle
         */
        width: number;
        /**
         * Height of the rectangle
         */
        length: number;
        /**
         * Center of the rectangle
         */
        center: Base.Point3;
        /**
         * Direction of the rectangle
         */
        direction: Base.Vector3;
    }
    export class BoxDto {
        constructor(width?: number, length?: number, height?: number, center?: Base.Point3) {
            this.width = width;
            this.length = length;
            this.height = height;
            if (center) {
                this.center = center;
            }
        }
        /**
         * Width of the box
         */
        width?: number;
        /**
         * Length of the box
         */
        length?: number;
        /**
         * Height of the box
         */
        height?: number;
        /**
         * Center of the box
         */
        center: Base.Point3 = [0, 0, 0];
    }
    export class BoxFromCornerDto {
        constructor(width?: number, length?: number, height?: number, corner?: Base.Point3) {
            this.width = width;
            this.length = length;
            this.height = height;
            if (corner) {
                this.corner = corner;
            }
        }
        /**
         * Width of the box
         */
        width?: number;
        /**
         * Length of the box
         */
        length?: number;
        /**
         * Height of the box
         */
        height?: number;
        /**
         * Corner of the box
         */
        corner: Base.Point3 = [0, 0, 0];
    }
    export class SphereDto {
        constructor(radius?: number, center?: Base.Point3) {
            this.radius = radius;
            if (center) {
                this.center = center;
            }
        }
        /**
         * Radius of the sphere
         */
        radius: number;
        /**
         * Center of the sphere
         */
        center: Base.Point3 = [0, 0, 0];
    }
    export class ConeDto {
        constructor(radius1?: number, radius2?: number, height?: number, angle?: number, center?: Base.Point3, direction?: Base.Point3) {
            this.radius1 = radius1;
            this.radius2 = radius2;
            this.height = height;
            this.angle = angle;
            this.center = center;
            this.direction = direction
        }
        /**
         * First radius of the cone
         */
        radius1: number;
        /**
         * Second radius of the cone
         */
        radius2: number;
        /**
         * Height of the cone
         */
        height: number;
        /**
         * Angle of the cone
         */
        angle: number;
        /**
         * Center of the cone
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction of the cone
         */
        direction: Base.Point3 = [0, 1, 0];

    }
    export class LineDto {
        /**
         * Start of the line
         */
        start: Base.Point3;
        /**
         * End of the line
         */
        end: Base.Point3;
    }

    export class ArcEdgeThreePointsDto {
        /**
         * Start of the arc
         */
        start: Base.Point3;
        /**
        * Middle of the arc
        */
        middle: Base.Point3;
        /**
         * End of the arc
         */
        end: Base.Point3;
    }
    export class CylinderDto {
        /**
         * Radius of the cylinder
         */
        radius: number;
        /**
         * Height of the cylinder
         */
        height: number;
        /**
         * Center of the cylinder
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Direction for the cylinder
         */
        direction?: Base.Vector3 = [0, 1, 0];
    }
    export class CylindersOnLinesDto {
        /**
         * Radius of the cylinder
         */
        radius: number;
        /**
         * Lines between which to span cylinders
         */
        lines: Line.LinePointsDto[];
    }
    export class FilletDto<T> {
        constructor(shape?: T, radius?: number, indexes?: number[], all?: boolean) {
            this.shape = shape;
            this.radius = radius;
            this.indexes = indexes;
        }
        /**
         * Shape to apply the fillets
         */
        shape: T;
        /**
         * Radius of the fillets
         */
        radius?: number;
        /**
         * Radius list
         */
        radiusList?: number[];
        /**
         * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
         */
        indexes?= [];
    }
    export class ChamferDto<T> {
        constructor(shape?: T, distance?: number, indexes?: number[], all?: boolean) {
            this.shape = shape;
            this.distance = distance;
            this.indexes = indexes;
        }
        /**
         * Shape to apply the chamfer
         */
        shape: T;
        /**
         * Distance for the chamfer
         */
        distance?: number;
        /**
         * Distance for the chamfer
         */
        distanceList?: number[];
        /**
         * List of edge indexes to which apply the chamfer, if left empty all edges will be chamfered
         */
        indexes?= [];
    }
    export class BSplineDto {
        constructor(points?: Base.Point3[], closed?: boolean) {
            this.points = points;
            this.closed = closed;
        }
        /**
         * Points through which the BSpline will be created
         */
        points: Base.Point3[];
        /**
         * Indicates wether BSpline will be cloed
         */
        closed: boolean;
    }
    export class InterpolationDto {
        constructor(points?: Base.Point3[], periodic?: boolean) {
            this.points = points;
            this.periodic = periodic;
        }
        /**
         * Points through which the BSpline will be created
         */
        points: Base.Point3[];
        /**
         * Indicates wether BSpline will be periodic
         */
        periodic: boolean;
        /**
         * tolerance
         */
        tolerance: number;
    }

    export class BezierDto {
        constructor(points?: Base.Point3[], closed?: boolean) {
            this.points = points;
            this.closed = closed;
        }
        /**
         * Points through which the Bezier curve will be created
         */
        points: Base.Point3[];
        /**
         * Indicates wether Bezier will be cloed
         */
        closed: boolean;
    }

    export class DivideDto<T> {
        constructor(shape: T, nrOfDivisions?: number, removeStartPoint?: boolean, removeEndPoint?: boolean) {
            this.shape = shape;
            this.nrOfDivisions = nrOfDivisions;
            this.removeStartPoint = removeStartPoint;
            this.removeEndPoint = removeEndPoint;
        }
        /**
         * Shape representing a wire
         */
        shape: T;
        /**
         * The number of divisions that will be performed on the curve
         */
        nrOfDivisions: number;
        /**
         * Indicates if algorithm should remove start point
         */
        removeStartPoint: boolean;
        /**
         * Indicates if algorithm should remove end point
         */
        removeEndPoint: boolean;
    }

    export class DataOnGeometryAtParamDto<T> {
        constructor(shape: T, param?: number) {
            this.shape = shape;
            this.param = param;
        }
        /**
         * Shape representing a geometry
         */
        shape: T;
        /**
         * 0 - 1 value
         */
        param: any;
    }
    export class PointInFaceDto<T> extends ShapesDto<T> {
        constructor(face: any, edge: any, tEdgeParam?: number, distance2DParam?: number) {
            super();
            this.face = face;
            this.edge = edge;
            this.tEdgeParam = tEdgeParam;
            this.distance2DParam = distance2DParam;
        }
        /** 
         * OCCT face to be used for calculation 
         */
        face: any;
        /**
         * OCCT edge to be used for calculation
         */
        edge: any;
        /**
         * 0 - 1 value
         */
        tEdgeParam: number;
        /**
         * The point will be distanced on <distance2DParam> from the 2d curve.
         */
        distance2DParam: number;
    }

    export class DataOnGeometryAtLengthDto<T> {
        constructor(shape: T, length?: number) {
            this.shape = shape;
            this.length = length;
        }
        /**
         * Shape representing a wire
         */
        shape: T;
        /**
         * length at which to evaluate the point
         */
        length: number;
    }
    export class CircleDto {
        constructor(radius?: number, center?: Base.Point3, direction?: Base.Vector3) {
            this.radius = radius;
            this.center = center;
            this.direction = direction;
        }
        /**
         * Radius of the circle
         */
        radius: number;
        /**
         * Center of the circle
         */
        center: Base.Point3;
        /**
         * Direction vector for circle
         */
        direction: Base.Vector3
    }
    export class LoftDto<T> {
        constructor(shapes?: T[], makeSolid?: boolean) {
            this.shapes = shapes;
            this.makeSolid = makeSolid;
        }
        /**
         * Wires through which the loft passes
         */
        shapes: T[];
        /**
         * Tries to make a solid when lofting
         */
        makeSolid: boolean = false;
    }
    export class LoftAdvancedDto<T> {
        constructor(
            shapes?: T[],
            makeSolid?: boolean,
            closed?: boolean,
            periodic?: boolean,
            straight?: boolean,
            nrPerpendicularSections?: number,
            useSmoothing?: boolean,
            maxUDegree?: number,
            parType?: ApproxParametrizationTypeEnum,
            tolerance?: number,
            startVertex?: Base.Point3,
            endVertex?: Base.Point3,
        ) {
            this.shapes = shapes;
            this.makeSolid = makeSolid;
            this.closed = closed;
            this.periodic = periodic;
            this.straight = straight;
            this.nrPeriodicSections = nrPerpendicularSections;
            this.useSmoothing = useSmoothing;
            this.maxUDegree = maxUDegree;
            this.parType = parType;
            this.tolerance = tolerance;
            this.startVertex = startVertex;
            this.endVertex = endVertex;
        }
        /**
         * Wires through which the loft passes
         */
        shapes: T[];
        /**
         * Tries to make a solid when lofting
         */
        makeSolid = false;
        /**
         * Will make a closed loft.
         */
        closed = false;
        /**
         * Will make a periodic loft.
         */
        periodic = false;
        /**
         * Indicates whether straight sections should be made out of the loft
         */
        straight = false;
        /**
         * This number only is used when closed non straight lofting is used
         */
        nrPeriodicSections = 10;
        /**
         * Tell algorithm to use smoothing
         */
        useSmoothing = false;
        /** 
         * Maximum u degree 
         */
        maxUDegree = 3;
        /**
         * Tolerance
         */
        tolerance = 1.0e-7;
        /**
         * Approximation parametrization type
         */
        parType: ApproxParametrizationTypeEnum = ApproxParametrizationTypeEnum.approxCentripetal;
        /**
         * Optional if loft should start with a vertex
         */
        startVertex: Base.Point3;
        /**
         * Optional if loft should end with a vertex
         */
        endVertex: Base.Point3;
    }
    export class OffsetDto<T> {
        constructor(shape?: T, distance?: number, tolerance?: number) {
            this.shape = shape;
            this.distance = distance;
            if (tolerance) {
                this.tolerance = tolerance;
            }
        }
        /**
         * Shape to offset
         */
        shape: T;
        /**
         * Distance of offset
         */
        distance: number;
        /**
         * Offset tolerance
         */
        tolerance = 0.1;
    }
    export class RevolveDto<T> {
        constructor(shape?: T, degrees?: number, direction?: Base.Vector3, copy?: boolean) {
            this.shape = shape;
            this.angle = degrees;
            this.direction = direction;
            if (this.copy) {
                this.copy = copy;
            }
        }
        /**
         * Shape to revolve
         */
        shape: T;
        /**
         * Angle degrees
         */
        angle: number;
        /**
         * Direction vector
         */
        direction: Base.Vector3;
        /**
         * Copy original shape
         */
        copy = false;
    }
    export class ShapeShapesDto<T, U> {
        constructor(shape?: T, shapes?: U[]) {
            this.shape = shape;
            this.shapes = shapes;
        }
        /**
         * The wire path
         */
        shape: T;
        /**
         * Shapes along the path to be piped
         */
        shapes: U[];
    }
    export class ExtrudeDto<T> {
        constructor(shape?: T, direction?: Base.Vector3) {
            this.shape = shape;
            this.direction = direction;
        }
        /**
         * Face to extrude
         */
        shape: T;
        /**
         * Direction vector for extrusion
         */
        direction: Base.Vector3;
    }

    export class ExtrudeShapesDto<T> {
        constructor(shapes?: T[], direction?: Base.Vector3) {
            this.shapes = shapes;
            this.direction = direction;
        }
        /**
         * Shapes to extrude
         */
        shapes: T[];
        /**
         * Direction vector for extrusion
         */
        direction: Base.Vector3;
    }

    export class SplitDto<T> {
        constructor(shape?: T, shapes?: T[]) {
            this.shape = shape;
            this.shapes = shapes;
        }
        /**
         * Shape to split
         */
        shape: T;
        /**
         * Shapes to split from main shape
         */
        shapes: T[];
    }
    export class UnionDto<T> {
        constructor(shapes?: T[], keepEdges?: boolean) {
            this.shapes = shapes;
            this.keepEdges = keepEdges;
        }
        /**
         * Objects to be joined together
         */
        shapes: T[];
        /**
         * Keeps edges
         */
        keepEdges = false;
    }
    export class DifferenceDto<T> {
        constructor(shape?: T, shapes?: T[], keepEdges?: boolean) {
            this.shape = shape;
            this.shapes = shapes;
            this.keepEdges = keepEdges;
        }
        /**
         * Object to subtract from
         */
        shape: T;
        /**
         * Objects to subtract
         */
        shapes: T[];
        /**
         * Keeps edges unaffected
         */
        keepEdges = false;
    }

    export class IntersectionDto<T> {
        constructor(shapes?: T[], keepEdges?: boolean) {
            this.shapes = shapes;
            this.keepEdges = keepEdges;
        }
        /**
         * Shapes to intersect
         */
        shapes: T[];
        /**
         * Keep the edges
         */
        keepEdges = false;
    }
    export class ShapeDto<T> {
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Shape on which action should be performed
         */
        shape: T;
    }

    export class ShapesWithToleranceDto<T> {
        constructor(shapes?: T[]) {
            this.shapes = shapes;
        }
        /**
         * The shapes
         */
        shapes: T[];
        /**
         * Tolerance used for intersections
         */
        tolerance = 1.0e-7;
    }
    export class ShapeWithToleranceDto<T> {
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * The shape
         */
        shape: T;
        /**
         * Tolerance used for intersections
         */
        tolerance = 1.0e-7;
    }

    export class ShapeIndexDto<T> {
        constructor(shape?: T, index?: number) {
            this.shape = shape;
            this.index = index;
        }
        /**
         * Shape
         */
        shape: T;
        /**
         * Index of the entity
         */
        index: number;
    }
    export class RotationExtrudeDto<T> {
        constructor(shape?: T, height?: number, degrees?: number) {
            this.shape = shape;
            this.height = height;
            this.angle = degrees;
        }
        /**
         * Wire to extrude by rotating
         */
        shape: T;
        /**
         * Height of rotation
         */
        height: number;
        /**
         * Rotation in degrees
         */
        angle: number;
    }

    // Threading : Create Surfaces
    export class ThickSolidByJoinDto<T> {
        constructor(shape?: T, shapes?: T[], offset?: number) {
            this.shape = shape;
            this.shapes = shapes;
            this.offset = offset;
        }
        /**
         * Shape to make thick
         */
        shape: T;
        /**
         * closing faces
         */
        shapes: T[];
        /**
         * Offset to apply
         */
        offset: number;
        /**
         * Tolerance defines the tolerance criterion for coincidence in generated shapes
         */
        tolerance = 1.e-3;
        /**
         * if Intersection is false (default value), the intersection is calculated with the parallels to the two adjacent shapes
         */
        intersection = false;
        /**
         * SelfInter tells the algorithm whether a computation to eliminate self-intersections needs to be applied to the resulting shape. However, as this functionality is not yet implemented, you should use the default value (false)
         */
        selfIntersection = false;
        /**
         * Join defines how to fill the holes that may appear between parallels to the two adjacent faces. It may take values GeomAbs_Arc or GeomAbs_Intersection:
         * if Join is equal to GeomAbs_Arc, then pipes are generated between two free edges of two adjacent parallels, and spheres are generated on "images" of vertices; it is the default value
        */
        joinType = JoinTypeEnum.arc;
        /**
         * if Join is equal to GeomAbs_Intersection, then the parallels to the two adjacent faces are enlarged and intersected, so that there are no free edges on parallels to faces. RemoveIntEdges flag defines whether to remove the INTERNAL edges from the result or not. Warnings Since the algorithm of MakeThickSolid is based on MakeOffsetShape algorithm, the warnings are the same as for MakeOffsetShape.
         */
        removeIntEdges = false;
    }
    export class TransformDto<T> {
        constructor(shape?: T, translation?: Base.Vector3, rotationAxis?: Base.Vector3, rotationDegrees?: number, scaleFactor?: number) {
            this.shape = shape;
            this.translation = translation;
            this.rotationAxis = rotationAxis;
            this.rotationAngle = rotationDegrees;
            this.scaleFactor = scaleFactor;
        }
        /**
         * Shape to transform
         */
        shape: T;
        /**
         * Translation to apply
         */
        translation: Base.Vector3;
        /**
         * Rotation to apply
         */
        rotationAxis: Base.Vector3;
        /**
         * Rotation degrees
         */
        rotationAngle: number;
        /**
         * Scale factor to apply
         */
        scaleFactor: number;
    }
    export class TransformShapesDto<T> {
        constructor(shapes?: T[], translation?: Base.Vector3[], rotationAxes?: Base.Vector3[], rotationDegrees?: number[], scaleFactors?: number[]) {
            this.shapes = shapes;
            this.translations = translation;
            this.rotationAxes = rotationAxes;
            this.rotationAngles = rotationDegrees;
            this.scaleFactors = scaleFactors;
        }
        /**
         * Shape to transform
         */
        shapes: T[];
        /**
         * Translation to apply
         */
        translations: Base.Vector3[];
        /**
         * Rotation to apply
         */
        rotationAxes: Base.Vector3[];
        /**
         * Rotation degrees
         */
        rotationAngles: number[];
        /**
         * Scale factor to apply
         */
        scaleFactors: number[];
    }
    export class TranslateDto<T> {
        constructor(shape?: T, translation?: Base.Vector3) {
            this.shape = shape;
            this.translation = translation;
        }
        /**
         * Shape for translation
         */
        shape: T;
        /**
         * Translation vector
         */
        translation: Base.Vector3;
    }
    export class TranslateShapesDto<T> {
        constructor(shapes?: T[], translations?: Base.Vector3[]) {
            this.shapes = shapes;
            this.translations = translations;
        }
        /**
         * Shape for translation
         */
        shapes: T[];
        /**
         * Translation vector
         */
        translations: Base.Vector3[];
    }

    export class AlignDto<T>{
        constructor(shape?: T, fromOrigin?: Base.Point3, fromDirection?: Base.Vector3, toOrigin?: Base.Point3, toDirection?: Base.Vector3) {
            this.shape = shape;
            this.fromOrigin = fromOrigin;
            this.fromDirection = fromDirection;
            this.toOrigin = toOrigin;
            this.toDirection = toDirection;
        }
        /**
         * Shape for translation
         */
        shape: T;
        /**
         * from origin
         */
        fromOrigin: Base.Point3;
        /**
         * From direction
         */
        fromDirection: Base.Vector3;
        /**
         * To origin
         */
        toOrigin: Base.Point3;
        /**
         * To direction
         */
        toDirection: Base.Vector3;
    }
    export class AlignShapesDto<T> {
        constructor(shapes?: T[], fromOrigins?: Base.Vector3[], fromDirections?: Base.Vector3[], toOrigins?: Base.Vector3[], toDirections?: Base.Vector3[]) {
            this.shapes = shapes;
            this.fromOrigins = fromOrigins;
            this.fromDirections = fromDirections;
            this.toOrigins = toOrigins;
            this.toDirections = toDirections;
        }
        /**
         * Shape for translation
         */
        shapes: T[];
        /**
         * from origin
         */
        fromOrigins: Base.Point3[];
        /**
         * From direction
         */
        fromDirections: Base.Vector3[];
        /**
         * To origin
         */
        toOrigins: Base.Point3[];
        /**
         * To direction
         */
        toDirections: Base.Vector3[];
    }

    export class MirrorDto<T> {
        constructor(shape?: T, origin?: Base.Point3, direction?: Base.Vector3) {
            this.shape = shape;
            this.direction = direction;
            this.origin = origin;
        }
        /**
         * Shape to mirror
         */
        shape: T;
        /**
         * Axis origin point
         */
        origin: Base.Point3;
        /**
         * Axis direction vector
         */
        direction: Base.Vector3;
    }
    export class MirrorShapesDto<T> {
        constructor(shapes?: T[], origins?: Base.Point3[], directions?: Base.Vector3[]) {
            this.shapes = shapes;
            this.directions = directions;
            this.origins = origins;
        }
        /**
         * Shape to mirror
         */
        shapes: T[];
        /**
         * Axis origin point
         */
        origins: Base.Point3[];
        /**
         * Axis direction vector
         */
        directions: Base.Vector3[];
    }
    export class MirrorAlongNormalDto<T> {
        constructor(shape?: T, origin?: Base.Point3, normal?: Base.Vector3) {
            this.shape = shape;
            this.normal = normal;
            this.origin = origin;
        }
        /**
         * Shape to mirror
         */
        shape: T;
        /**
         * Axis origin point
         */
        origin: Base.Point3;
        /**
         * First normal axis direction vector
         */
        normal: Base.Vector3;
    }
    export class MirrorAlongNormalShapesDto<T> {
        constructor(shapes?: T[], origins?: Base.Point3[], normals?: Base.Vector3[]) {
            this.shapes = shapes;
            this.normals = normals;
            this.origins = origins;
        }
        /**
         * Shape to mirror
         */
        shapes: T[];
        /**
         * Axis origin point
         */
        origins: Base.Point3[];
        /**
         * First normal axis direction vector
         */
        normals: Base.Vector3[];
    }
    export class RotateDto<T> {
        constructor(shape?: T, axis?: Base.Vector3, degrees?: number) {
            this.shape = shape;
            this.axis = axis;
            this.angle = degrees;
        }
        /**
         * Shape to rotate
         */
        shape: T;
        /**
         * Axis on which to rotate
         */
        axis: Base.Vector3;
        /**
         * Rotation degrees
         */
        angle: number;
    }
    export class RotateShapesDto<T> {
        constructor(shapes?: T[], axes?: Base.Vector3[], angles?: number[]) {
            this.shapes = shapes;
            this.axes = axes;
            this.angles = angles;
        }
        /**
         * Shape to rotate
         */
        shapes: T[];
        /**
         * Axis on which to rotate
         */
        axes: Base.Vector3[];
        /**
         * Rotation degrees
         */
        angles: number[];
    }
    export class ScaleDto<T> {
        constructor(shape?: T, scale?: number) {
            this.shape = shape;
            this.factor = scale;
        }
        /**
         * Shape to scale
         */
        shape: T;
        /**
         * Scale factor to apply
         */
        factor: number;
    }
    export class ScaleShapesDto<T> {
        constructor(shapes?: T[], factors?: number[]) {
            this.shapes = shapes;
            this.factors = factors;
        }
        /**
         * Shape to scale
         */
        shapes: T[];
        /**
         * Scale factor to apply
         */
        factors: number[];
    }
    export class Scale3DDto<T> {
        constructor(shape?: T, scale?: Base.Vector3, center?: Base.Point3) {
            this.shape = shape;
            this.scale = scale;
            this.center = center;
        }
        /**
         * Shape to scale
         */
        shape: T;
        /**
         * Scale factor to apply
         */
        scale: Base.Vector3;
        /**
         * Scale from the center
         */
        center: Base.Point3;
    }
    export class Scale3DShapesDto<T> {
        constructor(shapes?: T[], scales?: Base.Vector3[], centers?: Base.Point3[]) {
            this.shapes = shapes;
            this.scales = scales;
            this.centers = centers;
        }
        /**
         * Shape to scale
         */
        shapes: T[];
        /**
         * Scale factor to apply
         */
        scales: Base.Vector3[];
        /**
         * Scale from the center
         */
        centers: Base.Point3[];
    }
    export class SaveStepDto<T> {
        constructor(shape?: T, filename?: string, adjustYtoZ?: boolean) {
            this.shape = shape;
            this.filename = filename;
            this.adjustYtoZ = adjustYtoZ;
        }
        /**
         * Shape to save
         */
        shape: T;
        /**
         * File name
         */
        filename: string;
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         */
        adjustYtoZ: boolean;
    }
    export class SaveStlDto<T> {
        constructor(shape?: T, filename?: string, precision?: number, adjustYtoZ?: boolean) {
            this.shape = shape;
            this.filename = filename;
            this.precision = precision;
            this.adjustYtoZ = adjustYtoZ;
        }
        /**
         * Shape to save
         */
        shape: T;
        /**
         * File name
         */
        filename: string;
        /**
         * Precision of the mesh - lower means higher res
         */
        precision: number;
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         */
        adjustYtoZ: boolean;
    }
    export class ImportStepIgesDto<T> {
        constructor(assetFile?: File, adjustZtoY?: boolean) {
            this.assetFile = assetFile;
            this.adjustZtoY = adjustZtoY;
        }
        /**
         * The name of the asset to store in the cache.
         * This allows to store the imported objects for multiple run cycles in the cache
         */
        assetFile: File;
        /**
         * Adjusts models that use Z coordinate as up to Y up system.
         */
        adjustZtoY = true;
    }
    export class LoadStepOrIgesDto<T> {
        constructor(filetext?: any, filename?: string, adjustZtoY?: boolean) {
            this.filetext = filetext;
            this.filename = filename;
            this.adjustZtoY = adjustZtoY;
        }
        /**
         * Shape to save
         */
        filetext: any;
        /**
         * File name
         */
        filename: string;
        /**
         * Adjusts models that use Z coordinate as up to Y up system.
         */
        adjustZtoY = true;
    }
    export class CompoundShapesDto<T> {
        constructor(shapes?: T[]) {
            this.shapes = shapes;
        }
        /**
         * Shapes to add to compound
         */
        shapes: T[];
    }
    export class ThisckSolidSimpleDto<T> {
        constructor(shape?: T, offset?: number) {
            this.shape = shape;
            this.offset = offset;
        }
        /**
         * Shape to make thick
         */
        shape: T;
        /**
         * Offset distance
         */
        offset: number;
    }
    export class FaceFromWireDto<T> {
        constructor(shape?: T, planar?: boolean) {
            this.shape = shape;
            this.planar = planar;
        }
        /**
         * Wire shape to convert into a face
         */
        shape: T;
        /**
         * Should plane be planar
         */
        planar: boolean;
    }
    export class FacesFromWiresDto<T> {
        constructor(shapes?: T[], planar?: boolean) {
            this.shapes = shapes;
            this.planar = planar;
        }
        /**
         * Wire shapes to convert into a faces
         */
        shapes: T[];
        /**
         * Should plane be planar
         */
        planar: boolean;
    }
    export class SewDto<T> {
        constructor(shapes: T[], tolerance?: number) {
            this.shapes = shapes;
            this.tolerance = tolerance;
        }
        /**
         * Faces to construct a shell from
         */
        shapes: T[];
        /**
         * 
         */
        tolerance = 1.0e-7;
    }

    export class FaceIsoCurveAtParamDto<T> {
        constructor(shape?: T, param?: number) {
            this.shape = shape;
            this.param = param;
        }
        /**
         * Face shape
         */
        shape: T;
        /**
         * Param at which to find isocurve
         */
        param: number;
        /**
         * Direction to find the isocurve
         */
        dir: 'u' | 'v' = 'u'
    }

    export class DivideFaceToUVPointsDto<T> {
        constructor(shape?: T) {
            this.shape = shape;
        }
        /**
         * Face shape
         */
        shape: T;
        /**
         * Number of points on U direction
         */
        nrOfPointsU = 10;
        /**
         * Number of points on V direction
         */
        nrOfPointsV = 10;
        /**
         * Flatten the output
         */
        flat = false;
    }

    export class Geom2dEllipseDto {
        /**
         * Center of the ellipse
         */
        center: Base.Point2;
        /**
         * Direction of the vector
         */
        direction: Base.Vector2;
        /**
         * Minor radius of an ellipse
         */
        radiusMinor: number;
        /**
         * Major radius of an ellipse
         */
        radiusMajor: number;
        /**
         * If true will sense the direction
         */
        sense = false;
    }
    export class Geom2dCircleDto {
        /**
         * Center of the circle
         */
        center: Base.Point2;
        /**
         * Direction of the vector
         */
        direction: Base.Vector2;
        /**
         * Radius of the circle
         */
        radius: number;
        /**
         * If true will sense the direction
         */
        sense = false;
    }

    export class StarDto {
        /**
         * Center of the circle
         */
        center: Base.Point3;
        /**
         * Direction
         */
        direction: Base.Vector3;
        /**
         * Direction of the vector
         */
        numRays: number;
        /**
         * Angle of the rays
         */
        outerRadius: number;
        /**
         * Angle of the rays
         */
        innerRadius: number;
        /**
         * Construct half of the star
         */
        half: boolean;
    }
    export class ParallelogramDto {
        /**
         * Center of the circle
         */
        center: Base.Point3;
        /**
         * Direction
         */
        direction: Base.Vector3;
        /**
         * Indicates whether to draw the parallelogram around the center point or start from corner.
         */
        aroundCenter: boolean;
        /**
         * Width of bounding rectangle
         */
        width: number;
        /**
         * Height of bounding rectangle
         */
        height: number;
        /**
         * Sharp angle of the parallelogram
         */
        angle: number;
    }

    export class EllipseDto {
        /**
         * Center of the ellipse
         */
        center: Base.Point3;
        /**
         * Direction of the vector
         */
        direction: Base.Vector3;
        /**
         * Minor radius of an ellipse
         */
        radiusMinor: number;
        /**
         * Major radius of an ellipse
         */
        radiusMajor: number;
    }
    export class GeomCylindricalSurfaceDto {
        /**
         * Radius of the cylindrical surface
         */
        radius: number;
        /**
         * Center of the cylindrical surface
         */
        center: Base.Point3;
        /**
         * Axis of direction for cylindrical surface
         */
        direction: Base.Vector3;
    }
    export class Geom2dTrimmedCurveDto<T>{
        /**
         * 2D Curve to trim
         */
        shape: T;
        /**
         * First param on the curve for trimming. U1 can be greater or lower than U2. The returned curve is oriented from U1 to U2.
         */
        u1: number;
        /**
         * Second parameter on the curve for trimming
         */
        u2: number;
        /**
         *  If the basis curve C is periodic there is an ambiguity because two parts are available. 
         *  In this case by default the trimmed curve has the same orientation as the basis curve (Sense = True). 
         * If Sense = False then the orientation of the trimmed curve is opposite to the orientation of the basis curve C.
         */
        sense = true;
        /**
         * If the curve is closed but not periodic it is not possible to keep the part of the curve including the
         * junction point (except if the junction point is at the beginning or at the end of the trimmed curve)
         * because you could lose the fundamental characteristics of the basis curve which are used for example
         * to compute the derivatives of the trimmed curve. So for a closed curve the rules are the same as for a open curve.
         */
        theAdjustPeriodic = true;
    }
    export class Geom2dSegmentDto {
        /**
         * Start 2d point for segment
         */
        start: Base.Point2;
        /**
         * End 2d point for segment
         */
        end: Base.Point2;
    }
    export class SliceDto<T> {
        /**
         * THe shape to slice
         */
        shape: T;
        /**
         * Step at which to divide the shape
         */
        step: number;
        /**
         * Direction vector
         */
        direction: Base.Vector3 = [0, 1, 0];
    }
}
