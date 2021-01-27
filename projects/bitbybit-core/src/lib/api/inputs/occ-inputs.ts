
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
         * Indicates wether the position of this surface will change in time
         */
        updatable = false;
        /**
         * You can turn off drawing of edges via this property
         */
        drawEdges = true;
        /**
         * You can turn off drawing of faces via this property
         */
        drawFaces = true;
        /**
         * Brep mesh variable in case it already exists and needs updating
         */
        shapeMesh?: any;
        /**
         * Lines mesh
         */
        linesMesh?: any;
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
        /**
         * Points points
         */
        points: number[][];
    }

    export class BoxDto {
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
        /**
         * Radius of the sphere
         */
        radius: number;
        /**
         * Center of the sphere
         */
        center = [0, 0, 0];
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
        /**
         * Shape to apply the fillets
         */
        shape: any;
        /**
         * Radius of the fillets
         */
        radius: number;
        /**
         * List of edge indexes to which apply the fillet
         */
        edgeList: number[];
        /**
         * If this setting is set to true, edgeList will be ignored
         */
        filletAll = false;
    }
    export class BSplineDto {
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
        /**
         * Points through which the Bezier curve will be created
         */
        points: number[][];
        /**
         * Optional weight parameter
         */
        weights?: number[];
        /**
         * Indicates wether Bezier will be cloed
         */
        closed: boolean;
    }
    export class CircleDto {
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
        /**
         * Wires through which the loft passes
         */
        wires: any[];
        /**
         * Tries to make a solid when lofting
         */
        shape = false;
    }
    export class OffsetDto {
        /**
         * Shape to offset
         */
        shape: any;
        /**
         * Distance of offset
         */
        offsetDistance: number;
        /**
         * Offset tolerance
         */
        tolerance = 0.1;
    }
    export class ExtrudeDto {
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
        /**
         * Objects to be joined together
         */
        shapes: any[];
        /**
         * Keeps edges
         */
        keepEdges: boolean;
    }
    export class DifferenceDto {
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
        keepEdges: boolean;
    }

    export class IntersectionDto {
        /**
         * Shapes to intersect
         */
        shapes: any[];
        /**
         * Keep the edges
         */
        keepEdges: boolean;
    }
    export class ShapeDto {
        /**
         * Shape on which action should be performed
         */
        shape: any;
    }
    export class ShapeIndexDto {
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
        degrees: number;
    }
    export class TransformDto {
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
        rotationDegrees: number;
        /**
         * Scale factor to apply
         */
        scale: number;
    }
    export class TranslateDto {
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
        degrees: number;
    }
    export class ScaleDto {
        /**
         * Shape to scale
         */
        shape: any;
        /**
         * Scale factor to apply
         */
        scale: number;
    }
}
