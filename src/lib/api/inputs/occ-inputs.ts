import { Base, Line } from "./inputs";
// tslint:disable-next-line: no-namespace
export namespace OCCT {
    export enum JoinTypeEnum {
        arc = 'arc',
        intersection = 'intersection',
        tangent = 'tangent'
    }
    export class ShapesDto {
        constructor(shapes?: any) {
            this.shapes = shapes;
        }
        /**
         * The shapes
         */
        shapes?: any;
    }
    export class FilletTwoEdgesInPlaneDto extends ShapesDto {
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

    export class FaceFromSurfaceAndWireDto extends ShapesDto {
        /**
         * Surface from which to create a face
         */
        surface: any;
        /**
         * Wire that represents a boundary on the surface to delimit the face
         */
        wire: any;
        /**
         * Indicates wether face should be created inside or outside the wire
         */
        inside = true;
    }
    export class DrawShapeDto {
        /**
         * Provide options without default values
         */
        constructor(shape?: any) {
            this.shape = shape;
        }
        /**
         * Brep OpenCascade geometry
         */
        shape: any;
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
    export class PolygonDto {
        constructor(points?: Base.Point3[]) {
            this.points = points;
        }
        /**
         * Points points
         */
        points: Base.Point3[];
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
        width: number;
        /**
         * Length of the box
         */
        length: number;
        /**
         * Height of the box
         */
        height: number;
        /**
         * Center of the box
         */
        center: Base.Point3 = [0, 0, 0];
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
    export class FilletDto {
        constructor(shape?: any, radius?: number, edgeList?: number[], all?: boolean) {
            this.shape = shape;
            this.radius = radius;
            this.edgeList = edgeList;
        }
        /**
         * Shape to apply the fillets
         */
        shape: any;
        /**
         * Radius of the fillets
         */
        radius: number;
        /**
         * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
         */
        edgeList?= [];
    }
    export class ChamferDto {
        constructor(shape?: any, distance?: number, edgeList?: number[], all?: boolean) {
            this.shape = shape;
            this.distance = distance;
            this.edgeList = edgeList;
        }
        /**
         * Shape to apply the chamfer
         */
        shape: any;
        /**
         * Distance for the chamfer
         */
        distance: number;
        /**
         * List of edge indexes to which apply the chamfer, if left empty all edges will be chamfered
         */
        edgeList?= [];
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

    export class DivideWireDto {
        constructor(shape: any, nrOfDivisions?: number, excludeEndPoints?: boolean) {
            this.shape = shape;
            this.nrOfDivisions = nrOfDivisions;
            this.excludeEndPoints = excludeEndPoints;
        }
        /**
         * Shape representing a wire
         */
        shape: any;
        /**
         * The number of divisions that will be performed on the curve
         */
        nrOfDivisions: number;
        /**
         * If true end points will not be given in the list
         */
        excludeEndPoints: boolean;
    }

    export class DataOnGeometryAtParamDto {
        constructor(shape: any, param?: number) {
            this.shape = shape;
            this.param = param;
        }
        /**
         * Shape representing a geometry
         */
        shape: any;
        /**
         * 0 - 1 value
         */
        param: any;
    }
    export class PointInFaceDto extends ShapesDto {
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

    export class DataOnGeometryAtLengthDto {
        constructor(shape: any, length?: number) {
            this.shape = shape;
            this.length = length;
        }
        /**
         * Shape representing a wire
         */
        shape: any;
        /**
         * length at which to evaluate the point
         */
        length: any;
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
    export class LoftDto {
        constructor(shapes?: any[], makeSolid?: boolean) {
            this.shapes = shapes;
            this.makeSolid = makeSolid;
        }
        /**
         * Wires through which the loft passes
         */
        shapes: any[];
        /**
         * Tries to make a solid when lofting
         */
        makeSolid = false;
    }
    export class OffsetDto {
        constructor(shape?: any, distance?: number, tolerance?: number) {
            this.shape = shape;
            this.distance = distance;
            if (tolerance) {
                this.tolerance = tolerance;
            }
        }
        /**
         * Shape to offset
         */
        shape: any;
        /**
         * Distance of offset
         */
        distance: number;
        /**
         * Offset tolerance
         */
        tolerance = 0.1;
    }
    export class RevolveDto {
        constructor(shape?: any, degrees?: number, direction?: Base.Vector3, copy?: boolean) {
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
        shape: any;
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
    export class ShapeShapesDto {
        constructor(shape?: any, shapes?: any[]) {
            this.shape = shape;
            this.shapes = shapes;
        }
        /**
         * The wire path
         */
        shape: any;
        /**
         * Shapes along the path to be piped
         */
        shapes: any[];
    }
    export class ExtrudeDto {
        constructor(shape?: any, direction?: Base.Vector3) {
            this.shape = shape;
            this.direction = direction;
        }
        /**
         * Face to extrude
         */
        shape: any;
        /**
         * Direction vector for extrusion
         */
        direction: Base.Vector3;
    }
    export class UnionDto {
        constructor(shapes?: any[], keepEdges?: boolean) {
            this.shapes = shapes;
            this.keepEdges = keepEdges;
        }
        /**
         * Objects to be joined together
         */
        shapes: any[];
        /**
         * Keeps edges
         */
        keepEdges = false;
    }
    export class DifferenceDto {
        constructor(shape?: any[], shapes?: any[], keepEdges?: boolean) {
            this.shape = shape;
            this.shapes = shapes;
            this.keepEdges = keepEdges;
        }
        /**
         * Object to subtract from
         */
        shape: any;
        /**
         * Objects to subtract
         */
        shapes: any[];
        /**
         * Keeps edges unaffected
         */
        keepEdges = false;
    }

    export class IntersectionDto {
        constructor(shapes?: any[], keepEdges?: boolean) {
            this.shapes = shapes;
            this.keepEdges = keepEdges;
        }
        /**
         * Shapes to intersect
         */
        shapes: any[];
        /**
         * Keep the edges
         */
        keepEdges = false;
    }
    export class ShapeDto {
        constructor(shape?: any[]) {
            this.shape = shape;
        }
        /**
         * Shape on which action should be performed
         */
        shape: any;
    }

    export class ShapesWithToleranceDto {
        constructor(shapes?: any) {
            this.shapes = shapes;
        }
        /**
         * The shapes
         */
        shapes: any;
        /**
         * Tolerance used for intersections
         */
        tolerance = 1.0e-7;
    }
    export class ShapeWithToleranceDto {
        constructor(shape?: any) {
            this.shape = shape;
        }
        /**
         * The shape
         */
        shape: any;
        /**
         * Tolerance used for intersections
         */
        tolerance = 1.0e-7;
    }

    export class ShapeIndexDto {
        constructor(shape?: any, index?: number) {
            this.shape = shape;
            this.index = index;
        }
        /**
         * Shape
         */
        shape: any;
        /**
         * Index of the entity
         */
        index: number;
    }
    export class RotationExtrudeDto {
        constructor(shape?: any, height?: number, degrees?: number) {
            this.shape = shape;
            this.height = height;
            this.angle = degrees;
        }
        /**
         * Wire to extrude by rotating
         */
        shape: any;
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
    export class ThickSolidByJoinDto {
        constructor(shape?: any, shapes?: any[], offset?: number) {
            this.shape = shape;
            this.shapes = shapes;
            this.offset = offset;
        }
        /**
         * Shape to make thick
         */
        shape: any;
        /**
         * closing faces
         */
        shapes: any[];
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
    export class TransformDto {
        constructor(shape?: any, translation?: Base.Vector3, rotationAxis?: Base.Vector3, rotationDegrees?: number, scale?: number) {
            this.shape = shape;
            this.translation = translation;
            this.rotationAxis = rotationAxis;
            this.rotationAngle = rotationDegrees;
            this.scaleFactor = scale;
        }
        /**
         * Shape to transform
         */
        shape: any;
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
    export class TranslateDto {
        constructor(shape?: any, translation?: Base.Vector3) {
            this.shape = shape;
            this.translation = translation;
        }
        /**
         * Shape for translation
         */
        shape: any;
        /**
         * Translation vector
         */
        translation: Base.Vector3;
    }

    export class MirrorDto {
        constructor(shape?: any, origin?: Base.Point3, direction?: Base.Vector3) {
            this.shape = shape;
            this.direction = direction;
            this.origin = origin;
        }
        /**
         * Shape to mirror
         */
        shape: any;
        /**
         * Axis origin point
         */
        origin: Base.Point3;
        /**
         * Axis direction vector
         */
        direction: Base.Vector3;
    }
    export class RotateDto {
        constructor(shape?: any, axis?: Base.Vector3, degrees?: number) {
            this.shape = shape;
            this.axis = axis;
            this.angle = degrees;
        }
        /**
         * Shape to rotate
         */
        shape: any;
        /**
         * Axis on which to rotate
         */
        axis: Base.Vector3;
        /**
         * Rotation degrees
         */
        angle: number;
    }
    export class ScaleDto {
        constructor(shape?: any, scale?: number) {
            this.shape = shape;
            this.factor = scale;
        }
        /**
         * Shape to scale
         */
        shape: any;
        /**
         * Scale factor to apply
         */
        factor: number;
    }
    export class SaveStepDto {
        constructor(shape?: any, filename?: string) {
            this.shape = shape;
            this.filename = filename;
        }
        /**
         * Shape to save
         */
        shape: any;
        /**
         * File name
         */
        filename: string;
    }
    export class ImportStepIgesDto {
        constructor(assetFile?: File) {
            this.assetFile = assetFile;
        }
        /**
         * The name of the asset to store in the cache.
         * This allows to store the imported objects for multiple run cycles in the cache
         */
        assetFile: File;
    }
    export class LoadStepOrIgesDto {
        constructor(filetext?: any, filename?: string) {
            this.filetext = filetext;
            this.filename = filename;
        }
        /**
         * Shape to save
         */
        filetext: any;
        /**
         * File name
         */
        filename: string;
    }
    export class CompoundShapesDto {
        constructor(shapes?: any[]) {
            this.shapes = shapes;
        }
        /**
         * Shapes to add to compound
         */
        shapes: any[];
    }
    export class ThisckSolidSimpleDto {
        constructor(shape?: any, offset?: number) {
            this.shape = shape;
            this.offset = offset;
        }
        /**
         * Shape to make thick
         */
        shape: any;
        /**
         * Offset distance
         */
        offset: number;
    }
    export class FaceFromWireDto {
        constructor(shape?: any, planar?: boolean) {
            this.shape = shape;
            this.planar = planar;
        }
        /**
         * Wire shape to convert into a face
         */
        shape: any;
        /**
         * Should plane be planar
         */
        planar: boolean;
    }

    export class FaceIsoCurveAtParamDto {
        constructor(shape?: any, param?: number) {
            this.shape = shape;
            this.param = param;
        }
        /**
         * Face shape
         */
        shape: any;
        /**
         * Param at which to find isocurve
         */
        param: number;
        /**
         * Direction to find the isocurve
         */
        dir: 'u' | 'v' = 'u'
    }

    export class DivideFaceToUVPointsDto {
        constructor(shape?: any) {
            this.shape = shape;
        }
        /**
         * Face shape
         */
        shape: any;
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
    export class Geom2dTrimmedCurveDto {
        /**
         * 2D Curve to trim
         */
        shape: any;
        /**
         * First param on the curve for trimming. U1 can be greater or lower than U2. The returned curve is oriented from U1 to U2.
         */
        u1: number;
        /**
         * Second parameter on the curve for trimming
         */
        u2: number;
        /**
         *  If the basis curve C is periodic there is an ambiguity because two parts are available. In this case by default the trimmed curve has the same orientation as the basis curve (Sense = True). If Sense = False then the orientation of the trimmed curve is opposite to the orientation of the basis curve C.
         */
        sense = true;
        /**
         * If the curve is closed but not periodic it is not possible to keep the part of the curve including the junction point (except if the junction point is at the beginning or at the end of the trimmed curve) because you could lose the fundamental characteristics of the basis curve which are used for example to compute the derivatives of the trimmed curve. So for a closed curve the rules are the same as for a open curve.
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
}
