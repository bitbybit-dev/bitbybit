import { Mesh } from '@babylonjs/core';

// tslint:disable-next-line: no-namespace
export namespace SolidMesh {
    export class DrawSolidMeshDto {
        /**
         * Solid Jscad mesh
         */
        mesh: any;
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colour = '#444444';
        /**
         * Indicates wether this solid will be transformed in time
         */
        updatable = false;
        /**
         * Solid mesh variable in case it already exists and needs updating
         */
        jscadMesh?: Mesh;
    }
    export class DrawSolidsMeshDto {
        /**
         * Solid Jscad meshes
         */
        meshes: any[];
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colour = '#444444';
        /**
         * Indicates wether this solid will be transformed in time
         */
        updatable = false;
        /**
         * Solid mesh variable in case it already exists and needs updating
         */
        jscadMesh?: Mesh;
    }
}
