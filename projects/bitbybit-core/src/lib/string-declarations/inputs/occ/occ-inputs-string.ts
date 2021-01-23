import { simplifyDeclaration } from '../../simplify-declaration';

export const occInputsString = simplifyDeclaration(`import { LinesMesh, Mesh } from '@babylonjs/core';
export declare namespace OCC {
    class DrawBrepDto {
        /**
         * Provide options without default values
         */
        constructor(brep?: any);
        /**
         * Brep OpenCascade geometry
         */
        brep: any;
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
        brepMesh?: Mesh;
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
         * Value between 0 and 1
         */
        opacity: number;
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
        shapeMesh?: Mesh;
        linesMesh?: LinesMesh;
    }
    class PolygonDto {
        /**
         * Polygon points
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
        face: any;
        /**
         * Direction vector for extrusion
         */
        direction: number[];
    }
}


`);
