export const inputOCCTDeclarations = `declare namespace Base {
    type Color = string;
    type ColorRGB = {
        r: number;
        g: number;
        b: number;
    };
    type Material = any;
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
}declare namespace OCCT {
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
    enum BRepOffsetModeEnum {
        skin = "skin",
        pipe = "pipe",
        rectoVerso = "rectoVerso"
    }
    enum ApproxParametrizationTypeEnum {
        approxChordLength = "approxChordLength",
        approxCentripetal = "approxCentripetal",
        approxIsoParametric = "approxIsoParametric"
    }
    class DecomposedMeshDto {
        /**
         * Face list
         */
        faceList: {
            face_index: number;
            normal_coord: Base.Vector3;
            number_of_triangles: number;
            tri_indexes: number[];
            vertex_coord: Base.Point3;
            vertex_coord_vec: Base.Vector3[];
        }[];
        /**
         * Edge list
         */
        edgeList: {
            edge_index: number;
            vertex_coord: Base.Point3[];
        }[];
    }
    class ShapesDto<T> {
        constructor(shapes?: T[]);
        /**
         * The OCCT shapes
         * @default undefined
         */
        shapes?: T[];
    }
    class FilletTwoEdgesInPlaneDto<T> extends ShapesDto<T> {
        /**
         * First OCCT edge to fillet
         * @default undefined
         */
        edge1: any;
        /**
         * Second OCCT edge to fillet
         * @default undefined
         */
        edge2: any;
        /**
         * Plane origin that is also used to find the closest solution if two solutions exist.
         * @default [0, 0, 0]
         */
        planeOrigin: Base.Point3;
        /**
         * Plane direction for fillet
         * @default [0, 1, 0]
         */
        planeDirection: Base.Vector3;
        /**
         * Radius of the fillet
         * @default 0.3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * if solution is -1 planeOrigin chooses a particular fillet in case of several fillets may be constructed (for example, a circle intersecting a segment in 2 points). Put the intersecting (or common) point of the edges
         * @default -1
         * @optional true
         */
        solution?: number;
    }
    class ClosestPointsOnShapeFromPointsDto<T> {
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
    class ClosestPointsOnShapesFromPointsDto<T> {
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
    class ClosestPointsBetweenTwoShapesDto<T> extends ShapesDto<T> {
        /**
         * The OCCT shapes
         * @default undefined
         */
        shape1?: T;
        /**
        * The OCCT shapes
        * @default undefined
        */
        shape2?: T;
    }
    class FaceFromSurfaceAndWireDto<T, U> extends ShapesDto<T> {
        /**
         * Surface from which to create a face
         * @default undefined
         */
        surface?: T;
        /**
         * Wire that represents a boundary on the surface to delimit the face
         * @default undefined
         */
        wire?: U;
        /**
         * Indicates wether face should be created inside or outside the wire
         * @default true
         */
        inside: boolean;
    }
    class EdgeFromGeom2dCurveAndSurfaceDto<T, U> extends ShapesDto<T> {
        /**
         * Curve 2d
         * @default undefined
         */
        curve: T;
        /**
         * Surface on which 2d curve will be evaluated
         * @default undefined
         */
        surface: U;
    }
    class WireOnFaceDto<T, U> extends ShapesDto<T> {
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
    class DrawShapeDto<T> {
        /**
         * Provide options without default values
         */
        constructor(shape?: T);
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
        faceOpacity: number;
        /**
         * Edge opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        edgeOpacity: number;
        /**
         * Hex colour string for the edges
         * @default #ffffff
         */
        edgeColour: Base.Color;
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
        faceColour: Base.Color;
        /**
         * Edge width
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        edgeWidth: number;
        /**
         * You can turn off drawing of edges via this property
         * @default true
         */
        drawEdges: boolean;
        /**
         * You can turn off drawing of faces via this property
         * @default true
         */
        drawFaces: boolean;
        /**
         * Precision of the mesh that will be generated for the shape, lower number will mean more triangles
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        precision: number;
        /**
         * Draw index of edges in space
         * @default false
         */
        drawEdgeIndexes: boolean;
        /**
         * Indicates the edge index height if they are drawn
         * @default 0.06
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        edgeIndexHeight: number;
        /**
         * Edge index colour if the edges are drawn
         * @default #ff00ff
         */
        edgeIndexColour: Base.Color;
        /**
         * Draw indexes of faces in space
         * @default false
         */
        drawFaceIndexes: boolean;
        /**
         * Indicates the edge index height if they are drawn
         * @default 0.06
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        faceIndexHeight: number;
        /**
         * Edge index colour if the edges are drawn
         * @default #0000ff
         */
        faceIndexColour: Base.Color;
    }
    class FaceSubdivisionDto<T> {
        /**
          * Provide options without default values
          */
        constructor(shape?: T);
        /**
         * Brep OpenCascade geometry
         * @default undefined
         */
        shape?: T;
        /**
         * Number of subdivisions on U direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrDivisionsU: number;
        /**
         * Number of subdivisions on V direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrDivisionsV: number;
        /**
         * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
         * @default false
         */
        shiftHalfStepU: boolean;
        /**
         * Removes start edge points on U
         * @default false
         */
        removeStartEdgeU: boolean;
        /**
         * Removes end edge points on U
         * @default false
         */
        removeEndEdgeU: boolean;
        /**
         * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
         * @default false
         */
        shiftHalfStepV: boolean;
        /**
         * Removes start edge points on V
         * @default false
         */
        removeStartEdgeV: boolean;
        /**
         * Removes end edge points on V
         * @default false
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
         * @default undefined
         */
        shape?: T;
        /**
         * Number of subdivisions on U direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrDivisionsU: number;
        /**
         * Number of subdivisions on V direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrDivisionsV: number;
        /**
         * Shift half step every nth U row
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shiftHalfStepNthU: number;
        /**
         * Offset for shift half step every nth U row
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shiftHalfStepUOffsetN: number;
        /**
         * Removes start edge points on U
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeStartEdgeNthU: number;
        /**
         * Offset for remove start edge points on U
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeStartEdgeUOffsetN: number;
        /**
         * Removes end edge points on U
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeEndEdgeNthU: number;
        /**
         * Offset for remove end edge points on U
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeEndEdgeUOffsetN: number;
        /**
         * Shift half step every nth V row
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shiftHalfStepNthV: number;
        /**
         * Offset for shift half step every nth V row
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shiftHalfStepVOffsetN: number;
        /**
         * Removes start edge points on V
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeStartEdgeNthV: number;
        /**
         * Offset for remove start edge points on V
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeStartEdgeVOffsetN: number;
        /**
         * Removes end edge points on V
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        removeEndEdgeNthV: number;
        /**
         * Offset for remove end edge points on V
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
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
         * @default undefined
         */
        shape?: T;
        /**
         * Linear subdivision direction true - U, false - V
         * @default true
         */
        isU: boolean;
        /**
         * Param on direction 0 - 1
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        param: number;
        /**
         * Number of subdivisions on opposite direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrPoints: number;
        /**
         * Sometimes you want to shift your points half way the step distance, especially on periodic surfaces
         * @default false
         */
        shiftHalfStep: boolean;
        /**
         * Removes first point
         * @default false
         */
        removeStartPoint: boolean;
        /**
         * Removes last point
         * @default false
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
         * @default undefined
         */
        shape?: T;
        /**
         * Param on U direction 0 to 1
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        paramU: number;
        /**
         * Param on V direction 0 to 1
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
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
         * @default undefined
         */
        shape?: T;
        /**
         * Params uv
         * @default [[0.5, 0.5]]
         */
        paramsUV: [number, number][];
    }
    class PolygonDto {
        constructor(points?: Base.Point3[]);
        /**
         * Points points
         * @default undefined
         */
        points: Base.Point3[];
    }
    class PolylineDto {
        constructor(points?: Base.Point3[]);
        /**
         * Points points
         * @default undefined
         */
        points: Base.Point3[];
    }
    class SquareDto {
        /**
         * size of square
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        size: number;
        /**
         * Center of the square
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Direction of the square
         * @default [0, 1, 0]
         */
        direction: Base.Vector3;
    }
    class RectangleDto {
        /**
         * width of the rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        width: number;
        /**
         * Height of the rectangle
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        length: number;
        /**
         * Center of the rectangle
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Direction of the rectangle
         * @default [0, 1, 0]
         */
        direction: Base.Vector3;
    }
    class BoxDto {
        constructor(width?: number, length?: number, height?: number, center?: Base.Point3);
        /**
         * Width of the box
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width: number;
        /**
         * Length of the box
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length: number;
        /**
         * Height of the box
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Center of the box
         * @default [0, 0, 0]
         */
        center: Base.Point3;
    }
    class BoxFromCornerDto {
        constructor(width?: number, length?: number, height?: number, corner?: Base.Point3);
        /**
         * Width of the box
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width: number;
        /**
         * Length of the box
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length: number;
        /**
         * Height of the box
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Corner of the box
         * @default [0, 0, 0]
         */
        corner: Base.Point3;
    }
    class SphereDto {
        constructor(radius?: number, center?: Base.Point3);
        /**
         * Radius of the sphere
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Center of the sphere
         * @default [0, 0, 0]
         */
        center: Base.Point3;
    }
    class ConeDto {
        constructor(radius1?: number, radius2?: number, height?: number, angle?: number, center?: Base.Point3, direction?: Base.Point3);
        /**
         * First radius of the cone
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius1: number;
        /**
         * Second radius of the cone
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius2: number;
        /**
         * Height of the cone
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Angle of the cone
         * @default 360
         * @minimum 0
         * @maximum 360
         * @step 1
         */
        angle: number;
        /**
         * Center of the cone
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Direction of the cone
         * @default [0, 1, 0]
         */
        direction: Base.Point3;
    }
    class LineDto {
        /**
         * Start of the line
         * @default [0, 0, 0]
         */
        start: Base.Point3;
        /**
         * End of the line
         * @default [0, 1, 0]
         */
        end: Base.Point3;
    }
    class ArcEdgeThreePointsDto {
        /**
         * Start of the arc
         * @default [0, 0, 0]
         */
        start: Base.Point3;
        /**
        * Middle of the arc
        * @default [0, 1, 0]
        */
        middle: Base.Point3;
        /**
         * End of the arc
         * @default [0, 0, 1]
         */
        end: Base.Point3;
    }
    class CylinderDto {
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Height of the cylinder
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Center of the cylinder
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Direction for the cylinder
         * @default [0, 1, 0]
         */
        direction?: Base.Vector3;
    }
    class CylindersOnLinesDto {
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
    class FilletDto<T> {
        constructor(shape?: T, radius?: number, indexes?: number[], all?: boolean);
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
        radius?: number;
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
    class Fillet3DWireDto<T> {
        constructor(shape?: T);
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
        radius?: number;
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
        direction: Base.Vector3;
    }
    class ChamferDto<T> {
        constructor(shape?: T, distance?: number, indexes?: number[], all?: boolean);
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
        distance?: number;
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
    class BSplineDto {
        constructor(points?: Base.Point3[], closed?: boolean);
        /**
         * Points through which the BSpline will be created
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Indicates wether BSpline will be cloed
         * @default false
         */
        closed: boolean;
    }
    class InterpolationDto {
        constructor(points?: Base.Point3[], periodic?: boolean);
        /**
         * Points through which the BSpline will be created
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Indicates wether BSpline will be periodic
         * @default false
         */
        periodic: boolean;
        /**
         * tolerance
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         * @step 0.00001
         */
        tolerance: number;
    }
    class BezierDto {
        constructor(points?: Base.Point3[], closed?: boolean);
        /**
         * Points through which the Bezier curve will be created
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Indicates wether Bezier will be cloed
         * @default false
         */
        closed: boolean;
    }
    class DivideDto<T> {
        constructor(shape: T, nrOfDivisions?: number, removeStartPoint?: boolean, removeEndPoint?: boolean);
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
        nrOfDivisions: number;
        /**
         * Indicates if algorithm should remove start point
         * @default false
         */
        removeStartPoint: boolean;
        /**
         * Indicates if algorithm should remove end point
         * @default false
         */
        removeEndPoint: boolean;
    }
    class DataOnGeometryAtParamDto<T> {
        constructor(shape: T, param?: number);
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
        param: number;
    }
    class PointInFaceDto<T> extends ShapesDto<T> {
        constructor(face: any, edge: any, tEdgeParam?: number, distance2DParam?: number);
        /**
         * OCCT face to be used for calculation
         * @default undefined
         */
        face: any;
        /**
         * OCCT edge to be used for calculation
         * @default undefined
         */
        edge: any;
        /**
         * 0 - 1 value
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        tEdgeParam: number;
        /**
         * The point will be distanced on <distance2DParam> from the 2d curve.
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        distance2DParam: number;
    }
    class DataOnGeometryAtLengthDto<T> {
        constructor(shape: T, length?: number);
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
        length: number;
    }
    class CircleDto {
        constructor(radius?: number, center?: Base.Point3, direction?: Base.Vector3);
        /**
         * Radius of the circle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Center of the circle
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Direction vector for circle
         * @default [0, 1, 0]
         */
        direction: Base.Vector3;
    }
    class LoftDto<T> {
        constructor(shapes?: T[], makeSolid?: boolean);
        /**
         * Wires through which the loft passes
         * @default undefined
         */
        shapes: T[];
        /**
         * Tries to make a solid when lofting
         * @default false
         */
        makeSolid: boolean;
    }
    class LoftAdvancedDto<T> {
        constructor(shapes?: T[]);
        /**
         * Wires through which the loft passes
         * @default undefined
         */
        shapes: T[];
        /**
         * Tries to make a solid when lofting
         * @default false
         */
        makeSolid: boolean;
        /**
         * Will make a closed loft.
         * @default false
         */
        closed: boolean;
        /**
         * Will make a periodic loft.
         * @default false
         */
        periodic: boolean;
        /**
         * Indicates whether straight sections should be made out of the loft
         * @default false
         */
        straight: boolean;
        /**
         * This number only is used when closed non straight lofting is used
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrPeriodicSections: number;
        /**
         * Tell algorithm to use smoothing
         * @default false
         */
        useSmoothing: boolean;
        /**
         * Maximum u degree
         * @default 3
         */
        maxUDegree: number;
        /**
         * Tolerance
         * @default 1.0e-7
         * @minimum 0
         * @maximum Infinity
         * @step 0.000001
         */
        tolerance: number;
        /**
         * Approximation parametrization type
         * @default approxCentripetal
         */
        parType: ApproxParametrizationTypeEnum;
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
    class OffsetDto<T> {
        constructor(shape?: T, distance?: number, tolerance?: number);
        /**
         * Shape to offset
         * @default undefined
         */
        shape: T;
        /**
         * Distance of offset
         * @default 0.2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        distance: number;
        /**
         * Offset tolerance
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        tolerance: number;
    }
    class OffsetAdvancedDto<T> {
        constructor(shape?: T, distance?: number, tolerance?: number);
        /**
         * Shape to offset
         * @default undefined
         */
        shape: T;
        /**
         * Distance of offset
         * @default 0.2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        distance: number;
        /**
         * Offset tolerance
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        tolerance: number;
        /**
         * Join defines how to fill the holes that may appear between parallels to the two adjacent faces. It may take values GeomAbs_Arc or GeomAbs_Intersection:
         * if Join is equal to GeomAbs_Arc, then pipes are generated between two free edges of two adjacent parallels, and spheres are generated on "images" of vertices; it is the default value
         * @default arc
        */
        joinType: JoinTypeEnum;
        /**
         * Removes internal edges
         * @default false
         */
        removeIntEdges: boolean;
    }
    class RevolveDto<T> {
        constructor(shape?: T, degrees?: number, direction?: Base.Vector3, copy?: boolean);
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
        angle: number;
        /**
         * Direction vector
         * @default [0, 1, 0]
         */
        direction: Base.Vector3;
        /**
         * Copy original shape
         * @default false
         */
        copy: boolean;
    }
    class ShapeShapesDto<T, U> {
        constructor(shape?: T, shapes?: U[]);
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
    class PipeWiresCylindricalDto<T> {
        constructor(shapes?: T[]);
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
        radius: number;
    }
    class PipeWireCylindricalDto<T> {
        constructor(shapes?: T);
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
        radius: number;
    }
    class PipePolygonWireNGonDto<T> {
        constructor(shapes?: T);
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
        radius: number;
        /**
         * Nr of ngon corners to be used
         * @default 6
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        nrCorners: number;
    }
    class ExtrudeDto<T> {
        constructor(shape?: T, direction?: Base.Vector3);
        /**
         * Face to extrude
         * @default undefined
         */
        shape: T;
        /**
         * Direction vector for extrusion
         * @default [0, 1, 0]
         */
        direction: Base.Vector3;
    }
    class ExtrudeShapesDto<T> {
        constructor(shapes?: T[], direction?: Base.Vector3);
        /**
         * Shapes to extrude
         * @default undefined
         */
        shapes: T[];
        /**
         * Direction vector for extrusion
         * @default [0, 1, 0]
         */
        direction: Base.Vector3;
    }
    class SplitDto<T> {
        constructor(shape?: T, shapes?: T[]);
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
    }
    class UnionDto<T> {
        constructor(shapes?: T[], keepEdges?: boolean);
        /**
         * Objects to be joined together
         * @default undefined
         */
        shapes: T[];
        /**
         * Keeps edges
         * @default false
         */
        keepEdges: boolean;
    }
    class DifferenceDto<T> {
        constructor(shape?: T, shapes?: T[], keepEdges?: boolean);
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
        keepEdges: boolean;
    }
    class IntersectionDto<T> {
        constructor(shapes?: T[], keepEdges?: boolean);
        /**
         * Shapes to intersect
         * @default undefined
         */
        shapes: T[];
        /**
         * Keep the edges
         * @default false
         */
        keepEdges: boolean;
    }
    class ShapeDto<T> {
        constructor(shape?: T);
        /**
         * Shape on which action should be performed
         * @default undefined
         */
        shape: T;
    }
    class ShapesWithToleranceDto<T> {
        constructor(shapes?: T[]);
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
        tolerance: number;
    }
    class ShapeWithToleranceDto<T> {
        constructor(shape?: T);
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
        tolerance: number;
    }
    class ShapeIndexDto<T> {
        constructor(shape?: T, index?: number);
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
        index: number;
    }
    class RotationExtrudeDto<T> {
        constructor(shape?: T, height?: number, degrees?: number);
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
        height: number;
        /**
         * Rotation in degrees
         * @default 360
         * @minimum 0
         * @maximum 360
         * @step 1
         */
        angle: number;
    }
    class ThickSolidByJoinDto<T> {
        constructor(shape?: T, shapes?: T[], offset?: number);
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
        offset: number;
        /**
         * Tolerance defines the tolerance criterion for coincidence in generated shapes
         * @default 1.0e-3
         * @minimum 0
         * @maximum Infinity
         * @step 0.000001
         */
        tolerance: number;
        /**
         * if Intersection is false (default value), the intersection is calculated with the parallels to the two adjacent shapes
         * @default false
         */
        intersection: boolean;
        /**
         * SelfInter tells the algorithm whether a computation to eliminate self-intersections needs to be applied to the resulting shape. However, as this functionality is not yet implemented, you should use the default value (false)
         * @default false
         */
        selfIntersection: boolean;
        /**
         * Join defines how to fill the holes that may appear between parallels to the two adjacent faces. It may take values GeomAbs_Arc or GeomAbs_Intersection:
         * if Join is equal to GeomAbs_Arc, then pipes are generated between two free edges of two adjacent parallels, and spheres are generated on "images" of vertices; it is the default value
         * @default arc
        */
        joinType: JoinTypeEnum;
        /**
         * if Join is equal to GeomAbs_Intersection, then the parallels to the two adjacent faces are enlarged and intersected, so that there are no free edges on parallels to faces. RemoveIntEdges flag defines whether to remove the INTERNAL edges from the result or not. Warnings Since the algorithm of MakeThickSolid is based on MakeOffsetShape algorithm, the warnings are the same as for MakeOffsetShape.
         * @default false
         */
        removeIntEdges: boolean;
    }
    class TransformDto<T> {
        constructor(shape?: T, translation?: Base.Vector3, rotationAxis?: Base.Vector3, rotationDegrees?: number, scaleFactor?: number);
        /**
         * Shape to transform
         * @default undefined
         */
        shape: T;
        /**
         * Translation to apply
         * @default [0,0,0]
         */
        translation: Base.Vector3;
        /**
         * Rotation to apply
         * @default [0,1,0]
         */
        rotationAxis: Base.Vector3;
        /**
         * Rotation degrees
         * @default 0
         * @minimum 0
         * @maximum 360
         * @step 1
         */
        rotationAngle: number;
        /**
         * Scale factor to apply
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scaleFactor: number;
    }
    class TransformShapesDto<T> {
        constructor(shapes?: T[], translation?: Base.Vector3[], rotationAxes?: Base.Vector3[], rotationDegrees?: number[], scaleFactors?: number[]);
        /**
         * Shape to transform
         * @default undefined
         */
        shapes: T[];
        /**
         * Translation to apply
         * @default [[0,0,0]]
         */
        translations: Base.Vector3[];
        /**
         * Rotation to apply
         * @default [[0,1,0]]
         */
        rotationAxes: Base.Vector3[];
        /**
         * Rotation degrees
         * @default [0]
         */
        rotationAngles: number[];
        /**
         * Scale factor to apply
         * @default [1]
         */
        scaleFactors: number[];
    }
    class TranslateDto<T> {
        constructor(shape?: T, translation?: Base.Vector3);
        /**
         * Shape for translation
         * @default undefined
         */
        shape: T;
        /**
         * Translation vector
         * @default [0, 0, 0]
         */
        translation: Base.Vector3;
    }
    class TranslateShapesDto<T> {
        constructor(shapes?: T[], translations?: Base.Vector3[]);
        /**
         * Shape for translation
         * @default undefined
         */
        shapes: T[];
        /**
         * Translation vector
         * @default [[0, 0, 0]]
         */
        translations: Base.Vector3[];
    }
    class AlignDto<T> {
        constructor(shape?: T, fromOrigin?: Base.Point3, fromDirection?: Base.Vector3, toOrigin?: Base.Point3, toDirection?: Base.Vector3);
        /**
         * Shape for translation
         * @default undefined
         */
        shape: T;
        /**
         * @default [0, 0, 0]
         */
        fromOrigin: Base.Point3;
        /**
         * From direction
         * @default [0, 0, 1]
         */
        fromDirection: Base.Vector3;
        /**
         * To origin
         * @default [0, 1, 0]
         */
        toOrigin: Base.Point3;
        /**
         * To direction
         * @default [0, 1, 0]
         */
        toDirection: Base.Vector3;
    }
    class AlignShapesDto<T> {
        constructor(shapes?: T[], fromOrigins?: Base.Vector3[], fromDirections?: Base.Vector3[], toOrigins?: Base.Vector3[], toDirections?: Base.Vector3[]);
        /**
         * Shape for translation
         * @default undefined
         */
        shapes: T[];
        /**
         * @default [[0, 0, 0]]
         */
        fromOrigins: Base.Point3[];
        /**
         * From direction
         * @default [[0, 0, 1]]
         */
        fromDirections: Base.Vector3[];
        /**
         * To origin
         * @default [[0, 1, 0]]
         */
        toOrigins: Base.Point3[];
        /**
         * To direction
         * @default [[0, 1, 0]]
         */
        toDirections: Base.Vector3[];
    }
    class MirrorDto<T> {
        constructor(shape?: T, origin?: Base.Point3, direction?: Base.Vector3);
        /**
         * Shape to mirror
         * @default undefined
         */
        shape: T;
        /**
         * Axis origin point
         * @default [0, 0, 0]
         */
        origin: Base.Point3;
        /**
         * Axis direction vector
         * @default [0, 0, 1]
         */
        direction: Base.Vector3;
    }
    class MirrorShapesDto<T> {
        constructor(shapes?: T[], origins?: Base.Point3[], directions?: Base.Vector3[]);
        /**
         * Shape to mirror
         * @default undefined
         */
        shapes: T[];
        /**
         * Axis origin point
         * @default [[0, 0, 0]]
         */
        origins: Base.Point3[];
        /**
         * Axis direction vector
         * @default [[0, 0, 1]]
         */
        directions: Base.Vector3[];
    }
    class MirrorAlongNormalDto<T> {
        constructor(shape?: T, origin?: Base.Point3, normal?: Base.Vector3);
        /**
         * Shape to mirror
         * @default undefined
         */
        shape: T;
        /**
         * Axis origin point
         * @default [0, 0, 0]
         */
        origin: Base.Point3;
        /**
         * First normal axis direction vector
         * @default [0, 0, 1]
         */
        normal: Base.Vector3;
    }
    class MirrorAlongNormalShapesDto<T> {
        constructor(shapes?: T[], origins?: Base.Point3[], normals?: Base.Vector3[]);
        /**
         * Shape to mirror
         * @default undefined
         */
        shapes: T[];
        /**
         * Axis origin point
         * @default [[0, 0, 0]]
         */
        origins: Base.Point3[];
        /**
         * First normal axis direction vector
         * @default [[0, 0, 1]]
         */
        normals: Base.Vector3[];
    }
    class RotateDto<T> {
        constructor(shape?: T, axis?: Base.Vector3, degrees?: number);
        /**
         * Shape to rotate
         * @default undefined
         */
        shape: T;
        /**
         * Axis on which to rotate
         * @default [0, 0, 1]
         */
        axis: Base.Vector3;
        /**
         * Rotation degrees
         * @default 0
         * @minimum 0
         * @maximum 360
         * @step 1
         */
        angle: number;
    }
    class RotateShapesDto<T> {
        constructor(shapes?: T[], axes?: Base.Vector3[], angles?: number[]);
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
        angles: number[];
    }
    class ScaleDto<T> {
        constructor(shape?: T, scale?: number);
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
        factor: number;
    }
    class ScaleShapesDto<T> {
        constructor(shapes?: T[], factors?: number[]);
        /**
         * Shape to scale
         * @default undefined
         */
        shapes: T[];
        /**
         * Scale factor to apply
         * @default [1]
         */
        factors: number[];
    }
    class Scale3DDto<T> {
        constructor(shape?: T, scale?: Base.Vector3, center?: Base.Point3);
        /**
         * Shape to scale
         * @default undefined
         */
        shape: T;
        /**
         * Scale factor to apply
         * @default [1, 1, 1]
         */
        scale: Base.Vector3;
        /**
         * Scale from the center
         * @default [0, 0, 0]
         */
        center: Base.Point3;
    }
    class Scale3DShapesDto<T> {
        constructor(shapes?: T[], scales?: Base.Vector3[], centers?: Base.Point3[]);
        /**
         * Shape to scale
         * @default undefined
         */
        shapes: T[];
        /**
         * Scale factor to apply
         * @default [[1, 1, 1]]
         */
        scales: Base.Vector3[];
        /**
         * Scale from the center
         * @default [[0, 0, 0]]
         */
        centers: Base.Point3[];
    }
    class ShapeToMeshDto<T> {
        constructor(shape?: T, precision?: number, adjustYtoZ?: boolean);
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
        precision: number;
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         * @default false
         */
        adjustYtoZ: boolean;
    }
    class SaveStepDto<T> {
        constructor(shape?: T, filename?: string, adjustYtoZ?: boolean);
        /**
         * Shape to save
         * @default undefined
         */
        shape: T;
        /**
         * File name
         * @default shape.step
         */
        filename: string;
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         * @default false
         */
        adjustYtoZ: boolean;
    }
    class SaveStlDto<T> {
        constructor(shape?: T, filename?: string, precision?: number, adjustYtoZ?: boolean);
        /**
         * Shape to save
         * @default undefined
         */
        shape: T;
        /**
         * File name
         * @default shape.stl
         */
        filename: string;
        /**
         * Precision of the mesh - lower means higher res
         * @default 0.01
         */
        precision: number;
        /**
         * Adjust Y (up) coordinate system to Z (up) coordinate system
         * @default false
         */
        adjustYtoZ: boolean;
    }
    class ImportStepIgesDto<T> {
        constructor(assetFile?: File, adjustZtoY?: boolean);
        /**
         * The name of the asset to store in the cache.
         * @default undefined
         */
        assetFile: File;
        /**
         * Adjusts models that use Z coordinate as up to Y up system.
         * @default true
         */
        adjustZtoY: boolean;
    }
    class LoadStepOrIgesDto<T> {
        constructor(filetext?: any, filename?: string, adjustZtoY?: boolean);
        /**
         * File text
         * @default undefined
         */
        filetext: any;
        /**
         * File name
         * @default shape.igs
         */
        filename: string;
        /**
         * Adjusts models that use Z coordinate as up to Y up system.
         * @default true
         */
        adjustZtoY: boolean;
    }
    class CompoundShapesDto<T> {
        constructor(shapes?: T[]);
        /**
         * Shapes to add to compound
         * @default undefined
         */
        shapes: T[];
    }
    class ThisckSolidSimpleDto<T> {
        constructor(shape?: T, offset?: number);
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
        offset: number;
    }
    class FaceFromWireDto<T> {
        constructor(shape?: T, planar?: boolean);
        /**
         * Wire shape to convert into a face
         * @default undefined
         */
        shape: T;
        /**
         * Should plane be planar
         * @default false
         */
        planar: boolean;
    }
    class FacesFromWiresDto<T> {
        constructor(shapes?: T[], planar?: boolean);
        /**
         * Wire shapes to convert into a faces
         * @default undefined
         */
        shapes: T[];
        /**
         * Should plane be planar
         * @default false
         */
        planar: boolean;
    }
    class SewDto<T> {
        constructor(shapes: T[], tolerance?: number);
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
        tolerance: number;
    }
    class FaceIsoCurveAtParamDto<T> {
        constructor(shape?: T, param?: number);
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
        dir: 'u' | 'v';
    }
    class DivideFaceToUVPointsDto<T> {
        constructor(shape?: T);
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
        nrOfPointsU: number;
        /**
         * Number of points on V direction
         * @default 10
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        nrOfPointsV: number;
        /**
         * Flatten the output
         * @default false
         */
        flat: boolean;
    }
    class Geom2dEllipseDto {
        /**
         * Center of the ellipse
         * @default [0,0]
         */
        center: Base.Point2;
        /**
         * Direction of the vector
         * @default [1,0]
         */
        direction: Base.Vector2;
        /**
         * Minor radius of an ellipse
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusMinor: number;
        /**
         * Major radius of an ellipse
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusMajor: number;
        /**
         * If true will sense the direction
         * @default false
         */
        sense: boolean;
    }
    class Geom2dCircleDto {
        /**
         * Center of the circle
         * @default [0,0]
         */
        center: Base.Point2;
        /**
         * Direction of the vector
         * @default [1,0]
         */
        direction: Base.Vector2;
        /**
         * Radius of the circle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * If true will sense the direction
         * @default false
         */
        sense: boolean;
    }
    class StarDto {
        /**
         * Center of the circle
         * @default [0,0,0]
         */
        center: Base.Point3;
        /**
         * Direction
         * @default [0, 1, 0]
         */
        direction: Base.Vector3;
        /**
         * Direction of the vector
         * @default 7
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        numRays: number;
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
         * Construct half of the star
         * @default false
         */
        half: boolean;
    }
    class ParallelogramDto {
        /**
         * Center of the circle
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Direction
         * @default [0, 1, 0]
         */
        direction: Base.Vector3;
        /**
         * Indicates whether to draw the parallelogram around the center point or start from corner.
         * @default true
         */
        aroundCenter: boolean;
        /**
         * Width of bounding rectangle
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width: number;
        /**
         * Height of bounding rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Sharp angle of the parallelogram
         * @default 15
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        angle: number;
    }
    class NGonWireDto {
        /**
         * Center of the circle
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Direction
         * @default [0, 1, 0]
         */
        direction: Base.Vector3;
        /**
         * How many corners to create.
         * @default 6
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        nrCorners: number;
        /**
         * Radius of nGon
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
    }
    class EllipseDto {
        /**
         * Center of the ellipse
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Direction of the vector
         * @default [0, 1, 0]
         */
        direction: Base.Vector3;
        /**
         * Minor radius of an ellipse
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusMinor: number;
        /**
         * Major radius of an ellipse
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusMajor: number;
    }
    class GeomCylindricalSurfaceDto {
        /**
         * Radius of the cylindrical surface
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Center of the cylindrical surface
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Axis of direction for cylindrical surface
         * @default [0, 1, 0]
         */
        direction: Base.Vector3;
    }
    class Geom2dTrimmedCurveDto<T> {
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
        u1: number;
        /**
         * Second parameter on the curve for trimming
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        u2: number;
        /**
         *  If the basis curve C is periodic there is an ambiguity because two parts are available.
         *  In this case by default the trimmed curve has the same orientation as the basis curve (Sense = True).
         * If Sense = False then the orientation of the trimmed curve is opposite to the orientation of the basis curve C.
         * @default true
         */
        sense: boolean;
        /**
         * If the curve is closed but not periodic it is not possible to keep the part of the curve including the
         * junction point (except if the junction point is at the beginning or at the end of the trimmed curve)
         * because you could lose the fundamental characteristics of the basis curve which are used for example
         * to compute the derivatives of the trimmed curve. So for a closed curve the rules are the same as for a open curve.
         * @default true
         */
        theAdjustPeriodic: boolean;
    }
    class Geom2dSegmentDto {
        /**
         * Start 2d point for segment
         * @default [0, 0]
         */
        start: Base.Point2;
        /**
         * End 2d point for segment
         * @default [1, 0]
         */
        end: Base.Point2;
    }
    class SliceDto<T> {
        /**
         * THe shape to slice
         * @default undefined
         */
        shape: T;
        /**
         * Step at which to divide the shape
         * @default 2
         * @minimum 1
         * @maximum Infinity
         * @step 0.1
         */
        step: number;
        /**
         * Direction vector
         * @default [0, 1, 0]
         */
        direction: Base.Vector3;
    }
}`;
        