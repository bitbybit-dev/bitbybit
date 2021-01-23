import { LinesMesh, Mesh } from '@babylonjs/core';

// tslint:disable-next-line: no-namespace
export namespace OCC {
    export class DrawBrepDto {
        /**
         * Provide options without default values
         */
        constructor(brep?: any) {
            this.brep = brep;
        }
        /**
         * Brep OpenCascade geometry
         */
        brep: any;
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colour = '#444444';
        /**
         * Indicates wether the position of this surface will change in time
         */
        updatable = false;
        /**
         * Brep mesh variable in case it already exists and needs updating
         */
        brepMesh?: Mesh;
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
         * Value between 0 and 1
         */
        opacity = 1;
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
        shapeMesh?: Mesh;
        linesMesh?: LinesMesh;

    }

    export class PolygonDto {
        /**
         * Polygon points
         */
        polygon: number[][];
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
}
