import { simplifyDeclaration } from '../../simplify-declaration';

export const occInputsString = simplifyDeclaration(`
export declare namespace OCC {
    class DrawShapeDto {
        /**
         * Provide options without default values
         */
        constructor(shape?: any);
        /**
         * Brep OpenCascade geometry
         */
        shape: any;
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
         * Hex colour string for face colour
         */
        faceColour: string;
        /**
         * Edge width
         */
        edgeWidth: number;
        /**
         * Indicates wether the position of this surface will change in time
         */
        updatable: boolean;
        /**
         * You can turn off drawing of edges via this property
         */
        drawEdges: boolean;
        /**
         * You can turn off drawing of faces via this property
         */
        drawFaces: boolean;
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
    class PolygonDto {
        constructor(points?: number[][]);
        /**
         * Points points
         */
        points: number[][];
    }
    class BoxDto {
        constructor(width?: number, length?: number, height?: number, center?: number[]);
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
        center: number[];
    }
    class SphereDto {
        constructor(radius?: number, center?: number[]);
        /**
         * Radius of the sphere
         */
        radius: number;
        /**
         * Center of the sphere
         */
        center: number[];
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
        center: number[];
    }
    class FilletDto {
        constructor(shape?: any, radius?: number, edgeList?: number[], all?: boolean);
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
        edgeList: any[];
        /**
         * If this setting is set to true, edgeList will be ignored
         */
        all: boolean;
    }
    class ChamferDto {
        constructor(shape?: any, distance?: number, edgeList?: number[], all?: boolean);
        /**
         * Shape to apply the chamfer
         */
        shape: any;
        /**
         * Distance for the chamfer
         */
        distance: number;
        /**
         * List of edge indexes to which apply the chamfer
         */
        edgeList: number[];
        /**
         * If this setting is set to true, edgeList will be ignored
         */
        all: boolean;
    }
    class BSplineDto {
        constructor(points?: number[][], closed?: boolean);
        /**
         * Points through which the BSpline will be created
         */
        points: number[][];
        /**
         * Indicates wether BSpline will be cloed
         */
        closed: boolean;
    }
    class BezierDto {
        constructor(points?: number[][], weights?: number[], closed?: boolean);
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
    class CircleDto {
        constructor(radius?: number, center?: number[]);
        /**
         * Radius of the circle
         */
        radius: number;
        /**
         * Center of the circle
         */
        center: number[];
    }
    class LoftDto {
        constructor(shapes?: any[], makeSolid?: boolean);
        /**
         * Wires through which the loft passes
         */
        shapes: any[];
        /**
         * Tries to make a solid when lofting
         */
        makeSolid: boolean;
    }
    class OffsetDto {
        constructor(shape?: any, distance?: number, tolerance?: number);
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
        tolerance: number;
    }
    class ExtrudeDto {
        constructor(shape?: any, direction?: number[]);
        /**
         * Face to extrude
         */
        shape: any;
        /**
         * Direction vector for extrusion
         */
        direction: number[];
    }
    class UnionDto {
        constructor(shapes?: any[], keepEdges?: boolean);
        /**
         * Objects to be joined together
         */
        shapes: any[];
        /**
         * Keeps edges
         */
        keepEdges: boolean;
    }
    class DifferenceDto {
        constructor(shape?: any[], shapes?: any[], keepEdges?: boolean);
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
    class IntersectionDto {
        constructor(shapes?: any[], keepEdges?: boolean);
        /**
         * Shapes to intersect
         */
        shapes: any[];
        /**
         * Keep the edges
         */
        keepEdges: boolean;
    }
    class ShapeDto {
        constructor(shape?: any[]);
        /**
         * Shape on which action should be performed
         */
        shape: any;
    }
    class ShapeIndexDto {
        constructor(shape?: any, index?: number);
        /**
         * Shape
         */
        shape: any;
        /**
         * Index of the entity
         */
        index: number;
    }
    class RotationExtrudeDto {
        constructor(shape?: any, height?: number, degrees?: number);
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
    class TransformDto {
        constructor(shape?: any, translation?: number[], rotationAxis?: number[], rotationDegrees?: number, scale?: number);
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
    class TranslateDto {
        constructor(shape?: any, translation?: number[]);
        /**
         * Shape for translation
         */
        shape: any;
        /**
         * Translation vector
         */
        translation: number[];
    }
    class RotateDto {
        constructor(shape?: any, axis?: number[], degrees?: number);
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
    class ScaleDto {
        constructor(shape?: any, scale?: number);
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

`);
