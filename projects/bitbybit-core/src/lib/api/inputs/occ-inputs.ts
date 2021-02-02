
// tslint:disable-next-line: no-namespace
export namespace OCC {
    // Can't use BabylonJS types here as that crashes worker, which tries to include them
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
        edgeColour = '#000000';
        /**
         * Hex colour string for face colour
         */
        faceColour = '#ffffff';
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
        precision = 0.05;
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
        constructor(points?: number[][]) {
            this.points = points;
        }
        /**
         * Points points
         */
        points: number[][];
    }

    export class BoxDto {
        constructor(width?: number, length?: number, height?: number, center?: number[]) {
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
        center = [0, 0, 0];
    }
    export class SphereDto {
        constructor(radius?: number, center?: number[]) {
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
        center = [0, 0, 0];
    }
    export class ConeDto {
        constructor(radius1?: number, radius2?: number, height?: number) {
            this.radius1 = radius1;
            this.radius2 = radius2;
            this.height = height;
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
        center = [0, 0, 0];
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
        edgeList = [];
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
        edgeList: number[];
    }
    export class BSplineDto {
        constructor(points?: number[][], closed?: boolean) {
            this.points = points;
            this.closed = closed;
        }
        /**
         * Points through which the BSpline will be created
         */
        points: number[][];
        /**
         * Indicates wether BSpline will be cloed
         */
        closed: boolean;
    }

    export class BezierDto {
        constructor(points?: number[][], closed?: boolean) {
            this.points = points;
            this.closed = closed;
        }
        /**
         * Points through which the Bezier curve will be created
         */
        points: number[][];
        /**
         * Indicates wether Bezier will be cloed
         */
        closed: boolean;
    }
    export class CircleDto {
        constructor(radius?: number, center?: number[]) {
            this.radius = radius;
            this.center = center;
        }
        /**
         * Radius of the circle
         */
        radius: number;
        /**
         * Center of the circle
         */
        center: number[];
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
        constructor(shape?: any, degrees?: number, direction?: number[], copy?: boolean) {
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
        direction: number[];
        /**
         * Copy original shape
         */
        copy = false;
    }
    export class PipeDto {
        constructor(shape?: any, shapes?: number[]) {
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
        shapes: any;
    }
    export class ExtrudeDto {
        constructor(shape?: any, direction?: number[]) {
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
        direction: number[];
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
    export class TransformDto {
        constructor(shape?: any, translation?: number[], rotationAxis?: number[], rotationDegrees?: number, scale?: number) {
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
        translation: number[];
        /**
         * Rotation to apply
         */
        rotationAxis: number[];
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
        constructor(shape?: any, translation?: number[]) {
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
        translation: number[];
    }
    export class RotateDto {
        constructor(shape?: any, axis?: number[], degrees?: number) {
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
        axis: number[];
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
        constructor(assetName?: any) {
            this.assetName = assetName;
        }
        /**
         * The name of the asset to store in the cache.
         * This allows to store the imported objects for multiple run cycles in the cache
         */
        assetName: string;
    }
    export class ImportStepOrIgesDto {
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
}
