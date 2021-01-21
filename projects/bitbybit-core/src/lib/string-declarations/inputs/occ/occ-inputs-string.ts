import { simplifyDeclaration } from '../../simplify-declaration';

export const occInputsString = simplifyDeclaration(`
import { Mesh } from '@babylonjs/core';
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
    class PolygonDto {
        /**
         * Polygon points
         */
        polygon: number[][];
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
        center: [0, 0, 0];
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
}

`);
