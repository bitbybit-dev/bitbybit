export const inputOCCTDeclarations = `declare namespace Base {
    type Point2 = [number, number];
    type Vector2 = [number, number];
    type Point3 = [number, number, number];
    type Vector3 = [number, number, number];
    type Line2 = {
        start: Base.Point2;
        end: Base.Point2;
    };
    type Line3 = {
        start: Base.Point3;
        end: Base.Point3;
    };
    enum skyboxEnum {
        default = "default",
        clearSky = "clearSky",
        city = "city"
    }
}// tslint:disable-next-line: no-namespace
var Base;
(function (Base) {
    // tslint:disable-next-line: no-namespace
    let skyboxEnum;
    (function (skyboxEnum) {
        skyboxEnum["default"] = "default";
        skyboxEnum["clearSky"] = "clearSky";
        skyboxEnum["city"] = "city";
    })(skyboxEnum = Base.skyboxEnum || (Base.skyboxEnum = {}));
})(Base || (Base = {}));* from './occ-inputs';
* from './base-inputs';* from './occ-inputs';
* from './base-inputs';* from './occ-inputs';
* from './base-inputs';* from './occ-inputs';
* from './base-inputs';declare namespace OCCT {
    type GeomCurvePointer = {
        hash: number;
        type: string;
    };
    type Geom2dCurvePointer = {
        hash: number;
        type: string;
    };
    type GeomSurfacePointer = {
        hash: number;
        type: string;
    };
    type TopoDSVertexPointer = {
        hash: number;
        type: string;
    };
    type TopoDSEdgePointer = {
        hash: number;
        type: string;
    };
    type TopoDSWirePointer = {
        hash: number;
        type: string;
    };
    type TopoDSFacePointer = {
        hash: number;
        type: string;
    };
    type TopoDSShellPointer = {
        hash: number;
        type: string;
    };
    type TopoDSSolidPointer = {
        hash: number;
        type: string;
    };
    type TopoDSCompSolidPointer = {
        hash: number;
        type: string;
    };
    type TopoDSCompoundPointer = {
        hash: number;
        type: string;
    };
    type TopoDSShapePointer = TopoDSVertexPointer | TopoDSEdgePointer | TopoDSWirePointer | TopoDSFacePointer | TopoDSShellPointer | TopoDSSolidPointer | TopoDSCompoundPointer;
    enum JoinTypeEnum {
        arc = "arc",
        intersection = "intersection",
        tangent = "tangent"
    }
    enum ApproxParametrizationTypeEnum {
        approxChordLength = "approxChordLength",
        approxCentripetal = "approxCentripetal",
        approxIsoParametric = "approxIsoParametric"
    }
    type DecomposedMeshDto = {
        faceList: {
            face_index: number;
            normal_coord: Base.Vector3;
            number_of_triangles: number;
            tri_indexes: number[];
            vertex_coord: Base.Point3;
            vertex_coord_vec: Base.Vector3[];
        }[];
        edgeList: {
            edge_index: number;
            vertex_coord: Base.Point3[];
        }[];
    };
    class ShapesDto<T> {
        constructor(shapes?: T[]);
        /**
         * The shapes
         */
        shapes?: T[];
    }
    class FilletTwoEdgesInPlaneDto<T> extends ShapesDto<T> {
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
        planeOrigin: Base.Point3;
        /**
         * Plane direction for fillet
         */
        planeDirection: Base.Vector3;
        /**
         * Radius of the fillet
         */
        radius: number;
        /**
         * if solution is -1 planeOrigin chooses a particular fillet in case of several fillets may be constructed (for example, a circle intersecting a segment in 2 points). Put the intersecting (or common) point of the edges
         */
        solution?: number;
    }
    class FaceFromSurfaceAndWireDto<T, U> extends ShapesDto<T> {
        /**
         * Surface from which to create a face
         */
        surface?: T;
        /**
         * Wire that represents a boundary on the surface to delimit the face
         */
        wire?: U;
        /**
         * Indicates wether face should be created inside or outside the wire
         */
        inside: boolean;
    }
    class EdgeFromGeom2dCurveAndSurfaceDto<T, U> extends ShapesDto<T> {
        /**
         * Curve 2d
         */
        curve: T;
        /**
         * Surface on which 2d curve will be evaluated
         */
        surface: U;
    }
    class WireOnFaceDto<T, U> extends ShapesDto<T> {
        /**
         * Wire to place on face
         */
        wire: T;
        /**
         * Face on which the wire will be placed
         */
        face: U;
    }
    class DrawShapeDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T);
        /**
         * Brep OpenCascade geometry
         */
        shape?: T;
        /**
         * Face opacity value between 0 and 1
         */
        faceOpacity: number;
        /**
         * Edge opacity value between 0 and 1
         */
        edgeOpacity: number;
        /**
         * Hex colour string for the edges
         */
        edgeColour: string;
        /**
         * Face material
         */
        faceMaterial?: any;
        /**
         * Hex colour string for face colour
         */
        faceColour: string;
        /**
         * Edge width
         */
        edgeWidth: number;
        /**
         * You can turn off drawing of edges via this property
         */
        drawEdges: boolean;
        /**
         * You can turn off drawing of faces via this property
         */
        drawFaces: boolean;
        /**
         * Precision
         */
        precision: number;
        /**
         * Draw index of edges in space
         */
        drawEdgeIndexes: boolean;
        /**
         * Indicates the edge index height if they are drawn
         */
        edgeIndexHeight: number;
        /**
         * Edge index colour if the edges are drawn
         */
        edgeIndexColour: string;
        /**
         * Draw indexes of faces in space
         */
        drawFaceIndexes: boolean;
        /**
         * Indicates the edge index height if they are drawn
         */
        faceIndexHeight: number;
        /**
         * Edge index colour if the edges are drawn
         */
        faceIndexColour: string;
    }
    class FaceSubdivisionDto<T> {
        /**
          * Provide options without default values
          */
        constructor(shape?: T);
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
        shiftHalfStepU: boolean;
        /**
         * Removes start edge points on U
         */
        removeStartEdgeU: boolean;
        /**
         * Removes end edge points on U
         */
        removeEndEdgeU: boolean;
        /**
         * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
         */
        shiftHalfStepV: boolean;
        /**
         * Removes start edge points on V
         */
        removeStartEdgeV: boolean;
        /**
         * Removes end edge points on V
         */
        removeEndEdgeV: boolean;
    }
    class FaceSubdivisionControlledDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T);
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
         * Shift half step every nth U row
         */
        shiftHalfStepNthU: number;
        /**
         * Offset for shift half step every nth U row
         */
        shiftHalfStepUOffsetN: number;
        /**
         * Removes start edge points on U
         */
        removeStartEdgeNthU: number;
        /**
         * Offset for remove start edge points on U
         */
        removeStartEdgeUOffsetN: number;
        /**
         * Removes end edge points on U
         */
        removeEndEdgeNthU: number;
        /**
         * Offset for remove end edge points on U
         */
        removeEndEdgeUOffsetN: number;
        /**
         * Shift half step every nth V row
         */
        shiftHalfStepNthV: number;
        /**
         * Offset for shift half step every nth V row
         */
        shiftHalfStepVOffsetN: number;
        /**
         * Removes start edge points on V
         */
        removeStartEdgeNthV: number;
        /**
         * Offset for remove start edge points on V
         */
        removeStartEdgeVOffsetN: number;
        /**
         * Removes end edge points on V
         */
        removeEndEdgeNthV: number;
        /**
         * Offset for remove end edge points on V
         */
        removeEndEdgeVOffsetN: number;
    }
    class FaceLinearSubdivisionDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T);
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
        shiftHalfStep: boolean;
        /**
         * Removes first point
         */
        removeStartPoint: boolean;
        /**
         * Removes last point
         */
        removeEndPoint: boolean;
    }
    class DataOnUVDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T);
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
    class DataOnUVsDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T);
        /**
         * Brep OpenCascade geometry
         */
        shape?: T;
        /**
         * Params uv
         */
        paramsUV: [number, number][];
    }
    class PolygonDto {
        constructor(points?: Base.Point3[]);
        /**
         * Points points
         */
        points?: Base.Point3[];
    }
    class SquareDto {
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
    class RectangleDto {
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
    class BoxDto {
        constructor(width?: number, length?: number, height?: number, center?: Base.Point3);
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
        center: Base.Point3;
    }
    class BoxFromCornerDto {
        constructor(width?: number, length?: number, height?: number, corner?: Base.Point3);
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
        corner: Base.Point3;
    }
    class SphereDto {
        constructor(radius?: number, center?: Base.Point3);
        /**
         * Radius of the sphere
         */
        radius: number;
        /**
         * Center of the sphere
         */
        center: Base.Point3;
    }
    class ConeDto {
        constructor(radius1?: number, radius2?: number, height?: number, angle?: number, center?: Base.Point3, direction?: Base.Point3);
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
        center: Base.Point3;
        /**
         * Direction of the cone
         */
        direction: Base.Point3;
    }
    class LineDto {
        /**
         * Start of the line
         */
        start: Base.Point3;
        /**
         * End of the line
         */
        end: Base.Point3;
    }
    class ArcEdgeThreePointsDto {
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
    class CylinderDto {
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
        center: Base.Point3;
        /**
         * Direction for the cylinder
         */
        direction?: Base.Vector3;
    }
    class CylindersOnLinesDto {
        /**
         * Radius of the cylinder
         */
        radius: number;
        /**
         * Lines between which to span cylinders
         */
        lines: {
            start: Base.Point3;
            end: Base.Point3;
        }[];
    }
    class FilletDto<T> {
        constructor(shape?: T, radius?: number, indexes?: number[], all?: boolean);
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
        indexes?: any[];
    }
    class ChamferDto<T> {
        constructor(shape?: T, distance?: number, indexes?: number[], all?: boolean);
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
        indexes?: any[];
    }
    class BSplineDto {
        constructor(points?: Base.Point3[], closed?: boolean);
        /**
         * Points through which the BSpline will be created
         */
        points: Base.Point3[];
        /**
         * Indicates wether BSpline will be cloed
         */
        closed: boolean;
    }
    class InterpolationDto {
        constructor(points?: Base.Point3[], periodic?: boolean);
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
    class BezierDto {
        constructor(points?: Base.Point3[], closed?: boolean);
        /**
         * Points through which the Bezier curve will be created
         */
        points: Base.Point3[];
        /**
         * Indicates wether Bezier will be cloed
         */
        closed: boolean;
    }
    class DivideDto<T> {
        constructor(shape: T, nrOfDivisions?: number, removeStartPoint?: boolean, removeEndPoint?: boolean);
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
    class DataOnGeometryAtParamDto<T> {
        constructor(shape: T, param?: number);
        /**
         * Shape representing a geometry
         */
        shape: T;
        /**
         * 0 - 1 value
         */
        param: any;
    }
    class PointInFaceDto<T> extends ShapesDto<T> {
        constructor(face: any, edge: any, tEdgeParam?: number, distance2DParam?: number);
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
    class DataOnGeometryAtLengthDto<T> {
        constructor(shape: T, length?: number);
        /**
         * Shape representing a wire
         */
        shape: T;
        /**
         * length at which to evaluate the point
         */
        length: number;
    }
    class CircleDto {
        constructor(radius?: number, center?: Base.Point3, direction?: Base.Vector3);
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
        direction: Base.Vector3;
    }
    class LoftDto<T> {
        constructor(shapes?: T[], makeSolid?: boolean);
        /**
         * Wires through which the loft passes
         */
        shapes: T[];
        /**
         * Tries to make a solid when lofting
         */
        makeSolid: boolean;
    }
    class LoftAdvancedDto<T> {
        constructor(shapes?: T[]);
        /**
         * Wires through which the loft passes
         */
        shapes: T[];
        /**
         * Tries to make a solid when lofting
         */
        makeSolid: boolean;
        /**
         * Will make a closed loft.
         */
        closed: boolean;
        /**
         * Will make a periodic loft.
         */
        periodic: boolean;
        /**
         * Indicates whether straight sections should be made out of the loft
         */
        straight: boolean;
        /**
         * This number only is used when closed non straight lofting is used
         */
        nrPeriodicSections: number;
        /**
         * Tell algorithm to use smoothing
         */
        useSmoothing: boolean;
        /**
         * Maximum u degree
         */
        maxUDegree: number;
        /**
         * Tolerance
         */
        tolerance: number;
        /**
         * Approximation parametrization type
         */
        parType: ApproxParametrizationTypeEnum;
        /**
         * Optional if loft should start with a vertex
         */
        startVertex: Base.Point3;
        /**
         * Optional if loft should end with a vertex
         */
        endVertex: Base.Point3;
    }
    class OffsetDto<T> {
        constructor(shape?: T, distance?: number, tolerance?: number);
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
        tolerance: number;
    }
    class RevolveDto<T> {
        constructor(shape?: T, degrees?: number, direction?: Base.Vector3, copy?: boolean);
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
        copy: boolean;
    }
    class ShapeShapesDto<T, U> {
        constructor(shape?: T, shapes?: U[]);
        /**
         * The wire path
         */
        shape: T;
        /**
         * Shapes along the path to be piped
         */
        shapes: U[];
    }
    class ExtrudeDto<T> {
        constructor(shape?: T, direction?: Base.Vector3);
        /**
         * Face to extrude
         */
        shape: T;
        /**
         * Direction vector for extrusion
         */
        direction: Base.Vector3;
    }
    class ExtrudeShapesDto<T> {
        constructor(shapes?: T[], direction?: Base.Vector3);
        /**
         * Shapes to extrude
         */
        shapes: T[];
        /**
         * Direction vector for extrusion
         */
        direction: Base.Vector3;
    }
    class SplitDto<T> {
        constructor(shape?: T, shapes?: T[]);
        /**
         * Shape to split
         */
        shape: T;
        /**
         * Shapes to split from main shape
         */
        shapes: T[];
    }
    class UnionDto<T> {
        constructor(shapes?: T[], keepEdges?: boolean);
        /**
         * Objects to be joined together
         */
        shapes: T[];
        /**
         * Keeps edges
         */
        keepEdges: boolean;
    }
    class DifferenceDto<T> {
        constructor(shape?: T, shapes?: T[], keepEdges?: boolean);
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
        keepEdges: boolean;
    }
    class IntersectionDto<T> {
        constructor(shapes?: T[], keepEdges?: boolean);
        /**
         * Shapes to intersect
         */
        shapes: T[];
        /**
         * Keep the edges
         */
        keepEdges: boolean;
    }
    class ShapeDto<T> {
        constructor(shape?: T);
        /**
         * Shape on which action should be performed
         */
        shape: T;
    }
    class ShapesWithToleranceDto<T> {
        constructor(shapes?: T[]);
        /**
         * The shapes
         */
        shapes: T[];
        /**
         * Tolerance used for intersections
         */
        tolerance: number;
    }
    class ShapeWithToleranceDto<T> {
        constructor(shape?: T);
        /**
         * The shape
         */
        shape: T;
        /**
         * Tolerance used for intersections
         */
        tolerance: number;
    }
    class ShapeIndexDto<T> {
        constructor(shape?: T, index?: number);
        /**
         * Shape
         */
        shape: T;
        /**
         * Index of the entity
         */
        index: number;
    }
    class RotationExtrudeDto<T> {
        constructor(shape?: T, height?: number, degrees?: number);
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
    class ThickSolidByJoinDto<T> {
        constructor(shape?: T, shapes?: T[], offset?: number);
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
        tolerance: number;
        /**
         * if Intersection is false (default value), the intersection is calculated with the parallels to the two adjacent shapes
         */
        intersection: boolean;
        /**
         * SelfInter tells the algorithm whether a computation to eliminate self-intersections needs to be applied to the resulting shape. However, as this functionality is not yet implemented, you should use the default value (false)
         */
        selfIntersection: boolean;
        /**
         * Join defines how to fill the holes that may appear between parallels to the two adjacent faces. It may take values GeomAbs_Arc or GeomAbs_Intersection:
         * if Join is equal to GeomAbs_Arc, then pipes are generated between two free edges of two adjacent parallels, and spheres are generated on "images" of vertices; it is the default value
        */
        joinType: JoinTypeEnum;
        /**
         * if Join is equal to GeomAbs_Intersection, then the parallels to the two adjacent faces are enlarged and intersected, so that there are no free edges on parallels to faces. RemoveIntEdges flag defines whether to remove the INTERNAL edges from the result or not. Warnings Since the algorithm of MakeThickSolid is based on MakeOffsetShape algorithm, the warnings are the same as for MakeOffsetShape.
         */
        removeIntEdges: boolean;
    }
    class TransformDto<T> {
        constructor(shape?: T, translation?: Base.Vector3, rotationAxis?: Base.Vector3, rotationDegrees?: number, scaleFactor?: number);
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
    class TransformShapesDto<T> {
        constructor(shapes?: T[], translation?: Base.Vector3[], rotationAxes?: Base.Vector3[], rotationDegrees?: number[], scaleFactors?: number[]);
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
    class TranslateDto<T> {
        constructor(shape?: T, translation?: Base.Vector3);
        /**
         * Shape for translation
         */
        shape: T;
        /**
         * Translation vector
         */
        translation: Base.Vector3;
    }
    class TranslateShapesDto<T> {
        constructor(shapes?: T[], translations?: Base.Vector3[]);
        /**
         * Shape for translation
         */
        shapes: T[];
        /**
         * Translation vector
         */
        translations: Base.Vector3[];
    }
    class AlignDto<T> {
        constructor(shape?: T, fromOrigin?: Base.Point3, fromDirection?: Base.Vector3, toOrigin?: Base.Point3, toDirection?: Base.Vector3);
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
    class AlignShapesDto<T> {
        constructor(shapes?: T[], fromOrigins?: Base.Vector3[], fromDirections?: Base.Vector3[], toOrigins?: Base.Vector3[], toDirections?: Base.Vector3[]);
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
    class MirrorDto<T> {
        constructor(shape?: T, origin?: Base.Point3, direction?: Base.Vector3);
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
    class MirrorShapesDto<T> {
        constructor(shapes?: T[], origins?: Base.Point3[], directions?: Base.Vector3[]);
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
    class MirrorAlongNormalDto<T> {
        constructor(shape?: T, origin?: Base.Point3, normal?: Base.Vector3);
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
    class MirrorAlongNormalShapesDto<T> {
        constructor(shapes?: T[], origins?: Base.Point3[], normals?: Base.Vector3[]);
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
    class RotateDto<T> {
        constructor(shape?: T, axis?: Base.Vector3, degrees?: number);
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
    class RotateShapesDto<T> {
        constructor(shapes?: T[], axes?: Base.Vector3[], angles?: number[]);
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
    class ScaleDto<T> {
        constructor(shape?: T, scale?: number);
        /**
         * Shape to scale
         */
        shape: T;
        /**
         * Scale factor to apply
         */
        factor: number;
    }
    class ScaleShapesDto<T> {
        constructor(shapes?: T[], factors?: number[]);
        /**
         * Shape to scale
         */
        shapes: T[];
        /**
         * Scale factor to apply
         */
        factors: number[];
    }
    class Scale3DDto<T> {
        constructor(shape?: T, scale?: Base.Vector3, center?: Base.Point3);
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
    class Scale3DShapesDto<T> {
        constructor(shapes?: T[], scales?: Base.Vector3[], centers?: Base.Point3[]);
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
    class ShapeToMeshDto<T> {
        constructor(shape?: T, precision?: number, adjustYtoZ?: boolean);
        /**
         * Shape to save
         */
        shape: T;
        /**
         * File name
         */
        precision: number;
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         */
        adjustYtoZ: boolean;
    }
    class SaveStepDto<T> {
        constructor(shape?: T, filename?: string, adjustYtoZ?: boolean);
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
    class SaveStlDto<T> {
        constructor(shape?: T, filename?: string, precision?: number, adjustYtoZ?: boolean);
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
    class ImportStepIgesDto<T> {
        constructor(assetFile?: File, adjustZtoY?: boolean);
        /**
         * The name of the asset to store in the cache.
         */
        assetFile: File;
        /**
         * Adjusts models that use Z coordinate as up to Y up system.
         */
        adjustZtoY: boolean;
    }
    class LoadStepOrIgesDto<T> {
        constructor(filetext?: any, filename?: string, adjustZtoY?: boolean);
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
        adjustZtoY: boolean;
    }
    class CompoundShapesDto<T> {
        constructor(shapes?: T[]);
        /**
         * Shapes to add to compound
         */
        shapes: T[];
    }
    class ThisckSolidSimpleDto<T> {
        constructor(shape?: T, offset?: number);
        /**
         * Shape to make thick
         */
        shape: T;
        /**
         * Offset distance
         */
        offset: number;
    }
    class FaceFromWireDto<T> {
        constructor(shape?: T, planar?: boolean);
        /**
         * Wire shape to convert into a face
         */
        shape: T;
        /**
         * Should plane be planar
         */
        planar: boolean;
    }
    class FacesFromWiresDto<T> {
        constructor(shapes?: T[], planar?: boolean);
        /**
         * Wire shapes to convert into a faces
         */
        shapes: T[];
        /**
         * Should plane be planar
         */
        planar: boolean;
    }
    class SewDto<T> {
        constructor(shapes: T[], tolerance?: number);
        /**
         * Faces to construct a shell from
         */
        shapes: T[];
        /**
         *
         */
        tolerance: number;
    }
    class FaceIsoCurveAtParamDto<T> {
        constructor(shape?: T, param?: number);
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
        dir: 'u' | 'v';
    }
    class DivideFaceToUVPointsDto<T> {
        constructor(shape?: T);
        /**
         * Face shape
         */
        shape: T;
        /**
         * Number of points on U direction
         */
        nrOfPointsU: number;
        /**
         * Number of points on V direction
         */
        nrOfPointsV: number;
        /**
         * Flatten the output
         */
        flat: boolean;
    }
    class Geom2dEllipseDto {
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
        sense: boolean;
    }
    class Geom2dCircleDto {
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
        sense: boolean;
    }
    class StarDto {
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
    class ParallelogramDto {
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
    class NGonWireDto {
        /**
         * Center of the circle
         */
        center: Base.Point3;
        /**
         * Direction
         */
        direction: Base.Vector3;
        /**
         * How many corners to create.
         */
        nrCorners: number;
        /**
         * Radius of nGon
         */
        radius: number;
    }
    class EllipseDto {
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
    class GeomCylindricalSurfaceDto {
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
    class Geom2dTrimmedCurveDto<T> {
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
        sense: boolean;
        /**
         * If the curve is closed but not periodic it is not possible to keep the part of the curve including the
         * junction point (except if the junction point is at the beginning or at the end of the trimmed curve)
         * because you could lose the fundamental characteristics of the basis curve which are used for example
         * to compute the derivatives of the trimmed curve. So for a closed curve the rules are the same as for a open curve.
         */
        theAdjustPeriodic: boolean;
    }
    class Geom2dSegmentDto {
        /**
         * Start 2d point for segment
         */
        start: Base.Point2;
        /**
         * End 2d point for segment
         */
        end: Base.Point2;
    }
    class SliceDto<T> {
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
        direction: Base.Vector3;
    }
}// tslint:disable-next-line: no-namespace
var OCCT;
(function (OCCT) {
    let JoinTypeEnum;
    (function (JoinTypeEnum) {
        JoinTypeEnum["arc"] = "arc";
        JoinTypeEnum["intersection"] = "intersection";
        JoinTypeEnum["tangent"] = "tangent";
    })(JoinTypeEnum = OCCT.JoinTypeEnum || (OCCT.JoinTypeEnum = {}));
    let ApproxParametrizationTypeEnum;
    (function (ApproxParametrizationTypeEnum) {
        ApproxParametrizationTypeEnum["approxChordLength"] = "approxChordLength";
        ApproxParametrizationTypeEnum["approxCentripetal"] = "approxCentripetal";
        ApproxParametrizationTypeEnum["approxIsoParametric"] = "approxIsoParametric";
    })(ApproxParametrizationTypeEnum = OCCT.ApproxParametrizationTypeEnum || (OCCT.ApproxParametrizationTypeEnum = {}));
    class ShapesDto {
        constructor(shapes) {
            this.shapes = shapes;
        }
    }
    OCCT.ShapesDto = ShapesDto;
    class FilletTwoEdgesInPlaneDto extends ShapesDto {
        constructor() {
            super(...arguments);
            /**
             * Plane origin that is also used to find the closest solution if two solutions exist.
             */
            this.planeOrigin = [0, 0, 0];
            /**
             * Plane direction for fillet
             */
            this.planeDirection = [0, 1, 0];
            /**
             * Radius of the fillet
             */
            this.radius = 0.3;
            /**
             * if solution is -1 planeOrigin chooses a particular fillet in case of several fillets may be constructed (for example, a circle intersecting a segment in 2 points). Put the intersecting (or common) point of the edges
             */
            this.solution = -1;
        }
    }
    OCCT.FilletTwoEdgesInPlaneDto = FilletTwoEdgesInPlaneDto;
    class FaceFromSurfaceAndWireDto extends ShapesDto {
        constructor() {
            super(...arguments);
            /**
             * Indicates wether face should be created inside or outside the wire
             */
            this.inside = true;
        }
    }
    OCCT.FaceFromSurfaceAndWireDto = FaceFromSurfaceAndWireDto;
    class EdgeFromGeom2dCurveAndSurfaceDto extends ShapesDto {
    }
    OCCT.EdgeFromGeom2dCurveAndSurfaceDto = EdgeFromGeom2dCurveAndSurfaceDto;
    class WireOnFaceDto extends ShapesDto {
    }
    OCCT.WireOnFaceDto = WireOnFaceDto;
    class DrawShapeDto {
        /**
         * Provide options without default values
         */
        constructor(shape) {
            /**
             * Face opacity value between 0 and 1
             */
            this.faceOpacity = 1;
            /**
             * Edge opacity value between 0 and 1
             */
            this.edgeOpacity = 1;
            /**
             * Hex colour string for the edges
             */
            this.edgeColour = '#ffffff';
            /**
             * Hex colour string for face colour
             */
            this.faceColour = '#ff0000';
            /**
             * Edge width
             */
            this.edgeWidth = 2;
            /**
             * You can turn off drawing of edges via this property
             */
            this.drawEdges = true;
            /**
             * You can turn off drawing of faces via this property
             */
            this.drawFaces = true;
            /**
             * Precision
             */
            this.precision = 0.01;
            /**
             * Draw index of edges in space
             */
            this.drawEdgeIndexes = false;
            /**
             * Indicates the edge index height if they are drawn
             */
            this.edgeIndexHeight = 0.06;
            /**
             * Edge index colour if the edges are drawn
             */
            this.edgeIndexColour = '#ff00ff';
            /**
             * Draw indexes of faces in space
             */
            this.drawFaceIndexes = false;
            /**
             * Indicates the edge index height if they are drawn
             */
            this.faceIndexHeight = 0.06;
            /**
             * Edge index colour if the edges are drawn
             */
            this.faceIndexColour = '#0000ff';
            this.shape = shape;
        }
    }
    OCCT.DrawShapeDto = DrawShapeDto;
    class FaceSubdivisionDto {
        /**
          * Provide options without default values
          */
        constructor(shape) {
            /**
             * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
             */
            this.shiftHalfStepU = false;
            /**
             * Removes start edge points on U
             */
            this.removeStartEdgeU = false;
            /**
             * Removes end edge points on U
             */
            this.removeEndEdgeU = false;
            /**
             * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
             */
            this.shiftHalfStepV = false;
            /**
             * Removes start edge points on V
             */
            this.removeStartEdgeV = false;
            /**
             * Removes end edge points on V
             */
            this.removeEndEdgeV = false;
            this.shape = shape;
        }
    }
    OCCT.FaceSubdivisionDto = FaceSubdivisionDto;
    class FaceSubdivisionControlledDto {
        /**
         * Provide options without default values
         */
        constructor(shape) {
            /**
             * Offset for shift half step every nth U row
             */
            this.shiftHalfStepUOffsetN = 0;
            /**
             * Offset for remove start edge points on U
             */
            this.removeStartEdgeUOffsetN = 0;
            /**
             * Offset for remove end edge points on U
             */
            this.removeEndEdgeUOffsetN = 0;
            /**
             * Offset for shift half step every nth V row
             */
            this.shiftHalfStepVOffsetN = 0;
            /**
             * Offset for remove start edge points on V
             */
            this.removeStartEdgeVOffsetN = 0;
            /**
             * Offset for remove end edge points on V
             */
            this.removeEndEdgeVOffsetN = 0;
            this.shape = shape;
        }
    }
    OCCT.FaceSubdivisionControlledDto = FaceSubdivisionControlledDto;
    class FaceLinearSubdivisionDto {
        /**
         * Provide options without default values
         */
        constructor(shape) {
            /**
             * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
             */
            this.shiftHalfStep = false;
            /**
             * Removes first point
             */
            this.removeStartPoint = false;
            /**
             * Removes last point
             */
            this.removeEndPoint = false;
            this.shape = shape;
        }
    }
    OCCT.FaceLinearSubdivisionDto = FaceLinearSubdivisionDto;
    class DataOnUVDto {
        /**
         * Provide options without default values
         */
        constructor(shape) {
            this.shape = shape;
        }
    }
    OCCT.DataOnUVDto = DataOnUVDto;
    class DataOnUVsDto {
        /**
         * Provide options without default values
         */
        constructor(shape) {
            this.shape = shape;
        }
    }
    OCCT.DataOnUVsDto = DataOnUVsDto;
    class PolygonDto {
        constructor(points) {
            this.points = points;
        }
    }
    OCCT.PolygonDto = PolygonDto;
    class SquareDto {
    }
    OCCT.SquareDto = SquareDto;
    class RectangleDto {
    }
    OCCT.RectangleDto = RectangleDto;
    class BoxDto {
        constructor(width, length, height, center) {
            /**
             * Center of the box
             */
            this.center = [0, 0, 0];
            this.width = width;
            this.length = length;
            this.height = height;
            if (center) {
                this.center = center;
            }
        }
    }
    OCCT.BoxDto = BoxDto;
    class BoxFromCornerDto {
        constructor(width, length, height, corner) {
            /**
             * Corner of the box
             */
            this.corner = [0, 0, 0];
            this.width = width;
            this.length = length;
            this.height = height;
            if (corner) {
                this.corner = corner;
            }
        }
    }
    OCCT.BoxFromCornerDto = BoxFromCornerDto;
    class SphereDto {
        constructor(radius, center) {
            /**
             * Center of the sphere
             */
            this.center = [0, 0, 0];
            this.radius = radius;
            if (center) {
                this.center = center;
            }
        }
    }
    OCCT.SphereDto = SphereDto;
    class ConeDto {
        constructor(radius1, radius2, height, angle, center, direction) {
            /**
             * Center of the cone
             */
            this.center = [0, 0, 0];
            /**
             * Direction of the cone
             */
            this.direction = [0, 1, 0];
            this.radius1 = radius1;
            this.radius2 = radius2;
            this.height = height;
            this.angle = angle;
            this.center = center;
            this.direction = direction;
        }
    }
    OCCT.ConeDto = ConeDto;
    class LineDto {
    }
    OCCT.LineDto = LineDto;
    class ArcEdgeThreePointsDto {
    }
    OCCT.ArcEdgeThreePointsDto = ArcEdgeThreePointsDto;
    class CylinderDto {
        constructor() {
            /**
             * Center of the cylinder
             */
            this.center = [0, 0, 0];
            /**
             * Direction for the cylinder
             */
            this.direction = [0, 1, 0];
        }
    }
    OCCT.CylinderDto = CylinderDto;
    class CylindersOnLinesDto {
    }
    OCCT.CylindersOnLinesDto = CylindersOnLinesDto;
    class FilletDto {
        constructor(shape, radius, indexes, all) {
            /**
             * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
             */
            this.indexes = [];
            this.shape = shape;
            this.radius = radius;
            this.indexes = indexes;
        }
    }
    OCCT.FilletDto = FilletDto;
    class ChamferDto {
        constructor(shape, distance, indexes, all) {
            /**
             * List of edge indexes to which apply the chamfer, if left empty all edges will be chamfered
             */
            this.indexes = [];
            this.shape = shape;
            this.distance = distance;
            this.indexes = indexes;
        }
    }
    OCCT.ChamferDto = ChamferDto;
    class BSplineDto {
        constructor(points, closed) {
            this.points = points;
            this.closed = closed;
        }
    }
    OCCT.BSplineDto = BSplineDto;
    class InterpolationDto {
        constructor(points, periodic) {
            this.points = points;
            this.periodic = periodic;
        }
    }
    OCCT.InterpolationDto = InterpolationDto;
    class BezierDto {
        constructor(points, closed) {
            this.points = points;
            this.closed = closed;
        }
    }
    OCCT.BezierDto = BezierDto;
    class DivideDto {
        constructor(shape, nrOfDivisions, removeStartPoint, removeEndPoint) {
            this.shape = shape;
            this.nrOfDivisions = nrOfDivisions;
            this.removeStartPoint = removeStartPoint;
            this.removeEndPoint = removeEndPoint;
        }
    }
    OCCT.DivideDto = DivideDto;
    class DataOnGeometryAtParamDto {
        constructor(shape, param) {
            this.shape = shape;
            this.param = param;
        }
    }
    OCCT.DataOnGeometryAtParamDto = DataOnGeometryAtParamDto;
    class PointInFaceDto extends ShapesDto {
        constructor(face, edge, tEdgeParam, distance2DParam) {
            super();
            this.face = face;
            this.edge = edge;
            this.tEdgeParam = tEdgeParam;
            this.distance2DParam = distance2DParam;
        }
    }
    OCCT.PointInFaceDto = PointInFaceDto;
    class DataOnGeometryAtLengthDto {
        constructor(shape, length) {
            this.shape = shape;
            this.length = length;
        }
    }
    OCCT.DataOnGeometryAtLengthDto = DataOnGeometryAtLengthDto;
    class CircleDto {
        constructor(radius, center, direction) {
            this.radius = radius;
            this.center = center;
            this.direction = direction;
        }
    }
    OCCT.CircleDto = CircleDto;
    class LoftDto {
        constructor(shapes, makeSolid) {
            /**
             * Tries to make a solid when lofting
             */
            this.makeSolid = false;
            this.shapes = shapes;
            this.makeSolid = makeSolid;
        }
    }
    OCCT.LoftDto = LoftDto;
    class LoftAdvancedDto {
        constructor(shapes) {
            /**
             * Tries to make a solid when lofting
             */
            this.makeSolid = false;
            /**
             * Will make a closed loft.
             */
            this.closed = false;
            /**
             * Will make a periodic loft.
             */
            this.periodic = false;
            /**
             * Indicates whether straight sections should be made out of the loft
             */
            this.straight = false;
            /**
             * This number only is used when closed non straight lofting is used
             */
            this.nrPeriodicSections = 10;
            /**
             * Tell algorithm to use smoothing
             */
            this.useSmoothing = false;
            /**
             * Maximum u degree
             */
            this.maxUDegree = 3;
            /**
             * Tolerance
             */
            this.tolerance = 1.0e-7;
            /**
             * Approximation parametrization type
             */
            this.parType = ApproxParametrizationTypeEnum.approxCentripetal;
            this.shapes = shapes;
        }
    }
    OCCT.LoftAdvancedDto = LoftAdvancedDto;
    class OffsetDto {
        constructor(shape, distance, tolerance) {
            /**
             * Offset tolerance
             */
            this.tolerance = 0.1;
            this.shape = shape;
            this.distance = distance;
            if (tolerance) {
                this.tolerance = tolerance;
            }
        }
    }
    OCCT.OffsetDto = OffsetDto;
    class RevolveDto {
        constructor(shape, degrees, direction, copy) {
            /**
             * Copy original shape
             */
            this.copy = false;
            this.shape = shape;
            this.angle = degrees;
            this.direction = direction;
            if (this.copy) {
                this.copy = copy;
            }
        }
    }
    OCCT.RevolveDto = RevolveDto;
    class ShapeShapesDto {
        constructor(shape, shapes) {
            this.shape = shape;
            this.shapes = shapes;
        }
    }
    OCCT.ShapeShapesDto = ShapeShapesDto;
    class ExtrudeDto {
        constructor(shape, direction) {
            this.shape = shape;
            this.direction = direction;
        }
    }
    OCCT.ExtrudeDto = ExtrudeDto;
    class ExtrudeShapesDto {
        constructor(shapes, direction) {
            this.shapes = shapes;
            this.direction = direction;
        }
    }
    OCCT.ExtrudeShapesDto = ExtrudeShapesDto;
    class SplitDto {
        constructor(shape, shapes) {
            this.shape = shape;
            this.shapes = shapes;
        }
    }
    OCCT.SplitDto = SplitDto;
    class UnionDto {
        constructor(shapes, keepEdges) {
            /**
             * Keeps edges
             */
            this.keepEdges = false;
            this.shapes = shapes;
            this.keepEdges = keepEdges;
        }
    }
    OCCT.UnionDto = UnionDto;
    class DifferenceDto {
        constructor(shape, shapes, keepEdges) {
            /**
             * Keeps edges unaffected
             */
            this.keepEdges = false;
            this.shape = shape;
            this.shapes = shapes;
            this.keepEdges = keepEdges;
        }
    }
    OCCT.DifferenceDto = DifferenceDto;
    class IntersectionDto {
        constructor(shapes, keepEdges) {
            /**
             * Keep the edges
             */
            this.keepEdges = false;
            this.shapes = shapes;
            this.keepEdges = keepEdges;
        }
    }
    OCCT.IntersectionDto = IntersectionDto;
    class ShapeDto {
        constructor(shape) {
            this.shape = shape;
        }
    }
    OCCT.ShapeDto = ShapeDto;
    class ShapesWithToleranceDto {
        constructor(shapes) {
            /**
             * Tolerance used for intersections
             */
            this.tolerance = 1.0e-7;
            this.shapes = shapes;
        }
    }
    OCCT.ShapesWithToleranceDto = ShapesWithToleranceDto;
    class ShapeWithToleranceDto {
        constructor(shape) {
            /**
             * Tolerance used for intersections
             */
            this.tolerance = 1.0e-7;
            this.shape = shape;
        }
    }
    OCCT.ShapeWithToleranceDto = ShapeWithToleranceDto;
    class ShapeIndexDto {
        constructor(shape, index) {
            this.shape = shape;
            this.index = index;
        }
    }
    OCCT.ShapeIndexDto = ShapeIndexDto;
    class RotationExtrudeDto {
        constructor(shape, height, degrees) {
            this.shape = shape;
            this.height = height;
            this.angle = degrees;
        }
    }
    OCCT.RotationExtrudeDto = RotationExtrudeDto;
    // Threading : Create Surfaces
    class ThickSolidByJoinDto {
        constructor(shape, shapes, offset) {
            /**
             * Tolerance defines the tolerance criterion for coincidence in generated shapes
             */
            this.tolerance = 1.e-3;
            /**
             * if Intersection is false (default value), the intersection is calculated with the parallels to the two adjacent shapes
             */
            this.intersection = false;
            /**
             * SelfInter tells the algorithm whether a computation to eliminate self-intersections needs to be applied to the resulting shape. However, as this functionality is not yet implemented, you should use the default value (false)
             */
            this.selfIntersection = false;
            /**
             * Join defines how to fill the holes that may appear between parallels to the two adjacent faces. It may take values GeomAbs_Arc or GeomAbs_Intersection:
             * if Join is equal to GeomAbs_Arc, then pipes are generated between two free edges of two adjacent parallels, and spheres are generated on "images" of vertices; it is the default value
            */
            this.joinType = JoinTypeEnum.arc;
            /**
             * if Join is equal to GeomAbs_Intersection, then the parallels to the two adjacent faces are enlarged and intersected, so that there are no free edges on parallels to faces. RemoveIntEdges flag defines whether to remove the INTERNAL edges from the result or not. Warnings Since the algorithm of MakeThickSolid is based on MakeOffsetShape algorithm, the warnings are the same as for MakeOffsetShape.
             */
            this.removeIntEdges = false;
            this.shape = shape;
            this.shapes = shapes;
            this.offset = offset;
        }
    }
    OCCT.ThickSolidByJoinDto = ThickSolidByJoinDto;
    class TransformDto {
        constructor(shape, translation, rotationAxis, rotationDegrees, scaleFactor) {
            this.shape = shape;
            this.translation = translation;
            this.rotationAxis = rotationAxis;
            this.rotationAngle = rotationDegrees;
            this.scaleFactor = scaleFactor;
        }
    }
    OCCT.TransformDto = TransformDto;
    class TransformShapesDto {
        constructor(shapes, translation, rotationAxes, rotationDegrees, scaleFactors) {
            this.shapes = shapes;
            this.translations = translation;
            this.rotationAxes = rotationAxes;
            this.rotationAngles = rotationDegrees;
            this.scaleFactors = scaleFactors;
        }
    }
    OCCT.TransformShapesDto = TransformShapesDto;
    class TranslateDto {
        constructor(shape, translation) {
            this.shape = shape;
            this.translation = translation;
        }
    }
    OCCT.TranslateDto = TranslateDto;
    class TranslateShapesDto {
        constructor(shapes, translations) {
            this.shapes = shapes;
            this.translations = translations;
        }
    }
    OCCT.TranslateShapesDto = TranslateShapesDto;
    class AlignDto {
        constructor(shape, fromOrigin, fromDirection, toOrigin, toDirection) {
            this.shape = shape;
            this.fromOrigin = fromOrigin;
            this.fromDirection = fromDirection;
            this.toOrigin = toOrigin;
            this.toDirection = toDirection;
        }
    }
    OCCT.AlignDto = AlignDto;
    class AlignShapesDto {
        constructor(shapes, fromOrigins, fromDirections, toOrigins, toDirections) {
            this.shapes = shapes;
            this.fromOrigins = fromOrigins;
            this.fromDirections = fromDirections;
            this.toOrigins = toOrigins;
            this.toDirections = toDirections;
        }
    }
    OCCT.AlignShapesDto = AlignShapesDto;
    class MirrorDto {
        constructor(shape, origin, direction) {
            this.shape = shape;
            this.direction = direction;
            this.origin = origin;
        }
    }
    OCCT.MirrorDto = MirrorDto;
    class MirrorShapesDto {
        constructor(shapes, origins, directions) {
            this.shapes = shapes;
            this.directions = directions;
            this.origins = origins;
        }
    }
    OCCT.MirrorShapesDto = MirrorShapesDto;
    class MirrorAlongNormalDto {
        constructor(shape, origin, normal) {
            this.shape = shape;
            this.normal = normal;
            this.origin = origin;
        }
    }
    OCCT.MirrorAlongNormalDto = MirrorAlongNormalDto;
    class MirrorAlongNormalShapesDto {
        constructor(shapes, origins, normals) {
            this.shapes = shapes;
            this.normals = normals;
            this.origins = origins;
        }
    }
    OCCT.MirrorAlongNormalShapesDto = MirrorAlongNormalShapesDto;
    class RotateDto {
        constructor(shape, axis, degrees) {
            this.shape = shape;
            this.axis = axis;
            this.angle = degrees;
        }
    }
    OCCT.RotateDto = RotateDto;
    class RotateShapesDto {
        constructor(shapes, axes, angles) {
            this.shapes = shapes;
            this.axes = axes;
            this.angles = angles;
        }
    }
    OCCT.RotateShapesDto = RotateShapesDto;
    class ScaleDto {
        constructor(shape, scale) {
            this.shape = shape;
            this.factor = scale;
        }
    }
    OCCT.ScaleDto = ScaleDto;
    class ScaleShapesDto {
        constructor(shapes, factors) {
            this.shapes = shapes;
            this.factors = factors;
        }
    }
    OCCT.ScaleShapesDto = ScaleShapesDto;
    class Scale3DDto {
        constructor(shape, scale, center) {
            this.shape = shape;
            this.scale = scale;
            this.center = center;
        }
    }
    OCCT.Scale3DDto = Scale3DDto;
    class Scale3DShapesDto {
        constructor(shapes, scales, centers) {
            this.shapes = shapes;
            this.scales = scales;
            this.centers = centers;
        }
    }
    OCCT.Scale3DShapesDto = Scale3DShapesDto;
    class ShapeToMeshDto {
        constructor(shape, precision, adjustYtoZ) {
            /**
             * File name
             */
            this.precision = 0.01;
            /**
             * Adjust Y (up) coordinate system to Z (up) coordinate system
             */
            this.adjustYtoZ = false;
            this.shape = shape;
            if (precision) {
                this.precision = precision;
            }
            if (adjustYtoZ) {
                this.adjustYtoZ = adjustYtoZ;
            }
        }
    }
    OCCT.ShapeToMeshDto = ShapeToMeshDto;
    class SaveStepDto {
        constructor(shape, filename, adjustYtoZ) {
            this.shape = shape;
            this.filename = filename;
            this.adjustYtoZ = adjustYtoZ;
        }
    }
    OCCT.SaveStepDto = SaveStepDto;
    class SaveStlDto {
        constructor(shape, filename, precision, adjustYtoZ) {
            this.shape = shape;
            this.filename = filename;
            this.precision = precision;
            this.adjustYtoZ = adjustYtoZ;
        }
    }
    OCCT.SaveStlDto = SaveStlDto;
    class ImportStepIgesDto {
        constructor(assetFile, adjustZtoY) {
            /**
             * Adjusts models that use Z coordinate as up to Y up system.
             */
            this.adjustZtoY = true;
            this.assetFile = assetFile;
            this.adjustZtoY = adjustZtoY;
        }
    }
    OCCT.ImportStepIgesDto = ImportStepIgesDto;
    class LoadStepOrIgesDto {
        constructor(filetext, filename, adjustZtoY) {
            /**
             * Adjusts models that use Z coordinate as up to Y up system.
             */
            this.adjustZtoY = true;
            this.filetext = filetext;
            this.filename = filename;
            this.adjustZtoY = adjustZtoY;
        }
    }
    OCCT.LoadStepOrIgesDto = LoadStepOrIgesDto;
    class CompoundShapesDto {
        constructor(shapes) {
            this.shapes = shapes;
        }
    }
    OCCT.CompoundShapesDto = CompoundShapesDto;
    class ThisckSolidSimpleDto {
        constructor(shape, offset) {
            this.shape = shape;
            this.offset = offset;
        }
    }
    OCCT.ThisckSolidSimpleDto = ThisckSolidSimpleDto;
    class FaceFromWireDto {
        constructor(shape, planar) {
            this.shape = shape;
            this.planar = planar;
        }
    }
    OCCT.FaceFromWireDto = FaceFromWireDto;
    class FacesFromWiresDto {
        constructor(shapes, planar) {
            this.shapes = shapes;
            this.planar = planar;
        }
    }
    OCCT.FacesFromWiresDto = FacesFromWiresDto;
    class SewDto {
        constructor(shapes, tolerance) {
            /**
             *
             */
            this.tolerance = 1.0e-7;
            this.shapes = shapes;
            this.tolerance = tolerance;
        }
    }
    OCCT.SewDto = SewDto;
    class FaceIsoCurveAtParamDto {
        constructor(shape, param) {
            /**
             * Direction to find the isocurve
             */
            this.dir = 'u';
            this.shape = shape;
            this.param = param;
        }
    }
    OCCT.FaceIsoCurveAtParamDto = FaceIsoCurveAtParamDto;
    class DivideFaceToUVPointsDto {
        constructor(shape) {
            /**
             * Number of points on U direction
             */
            this.nrOfPointsU = 10;
            /**
             * Number of points on V direction
             */
            this.nrOfPointsV = 10;
            /**
             * Flatten the output
             */
            this.flat = false;
            this.shape = shape;
        }
    }
    OCCT.DivideFaceToUVPointsDto = DivideFaceToUVPointsDto;
    class Geom2dEllipseDto {
        constructor() {
            /**
             * If true will sense the direction
             */
            this.sense = false;
        }
    }
    OCCT.Geom2dEllipseDto = Geom2dEllipseDto;
    class Geom2dCircleDto {
        constructor() {
            /**
             * If true will sense the direction
             */
            this.sense = false;
        }
    }
    OCCT.Geom2dCircleDto = Geom2dCircleDto;
    class StarDto {
    }
    OCCT.StarDto = StarDto;
    class ParallelogramDto {
    }
    OCCT.ParallelogramDto = ParallelogramDto;
    class NGonWireDto {
    }
    OCCT.NGonWireDto = NGonWireDto;
    class EllipseDto {
    }
    OCCT.EllipseDto = EllipseDto;
    class GeomCylindricalSurfaceDto {
    }
    OCCT.GeomCylindricalSurfaceDto = GeomCylindricalSurfaceDto;
    class Geom2dTrimmedCurveDto {
        constructor() {
            /**
             *  If the basis curve C is periodic there is an ambiguity because two parts are available.
             *  In this case by default the trimmed curve has the same orientation as the basis curve (Sense = True).
             * If Sense = False then the orientation of the trimmed curve is opposite to the orientation of the basis curve C.
             */
            this.sense = true;
            /**
             * If the curve is closed but not periodic it is not possible to keep the part of the curve including the
             * junction point (except if the junction point is at the beginning or at the end of the trimmed curve)
             * because you could lose the fundamental characteristics of the basis curve which are used for example
             * to compute the derivatives of the trimmed curve. So for a closed curve the rules are the same as for a open curve.
             */
            this.theAdjustPeriodic = true;
        }
    }
    OCCT.Geom2dTrimmedCurveDto = Geom2dTrimmedCurveDto;
    class Geom2dSegmentDto {
    }
    OCCT.Geom2dSegmentDto = Geom2dSegmentDto;
    class SliceDto {
        constructor() {
            /**
             * Direction vector
             */
            this.direction = [0, 1, 0];
        }
    }
    OCCT.SliceDto = SliceDto;
})(OCCT || (OCCT = {}));`;
        