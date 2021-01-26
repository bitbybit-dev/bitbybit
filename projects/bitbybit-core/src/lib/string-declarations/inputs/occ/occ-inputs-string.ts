import { simplifyDeclaration } from '../../simplify-declaration';

export const occInputsString = simplifyDeclaration(`
export declare namespace OCC {
    class DrawBrepDto {
        /**
         * Provide options without default values
         */
        constructor(shape?: any);
        /**
         * Brep OpenCascade geometry
         */
        shape: any;
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Indicates wether the position of this surface will change in time
         */
        updatable: boolean;
        /**
         * Brep mesh variable in case it already exists and needs updating
         */
        brepMesh?: any;
    }
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
         * Draw indexes can be drawn as tags
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
    }
    class PolygonDto {
        /**
         * Points points
         */
        points: number[][];
    }
    class BoxDto {
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
        filletAll: boolean;
    }
    class BSplineDto {
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
        /**
         * Wires through which the loft passes
         */
        wires: any[];
        /**
         * Tries to make a solid when lofting
         */
        shape: boolean;
    }
    class OffsetDto {
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
        tolerance: number;
    }
    class ExtrudeDto {
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
        /**
         * Shapes to intersect
         */
        shapes: any[];
        /**
         * Keep the edges
         */
        keepEdges: boolean;
    }
}

`);
