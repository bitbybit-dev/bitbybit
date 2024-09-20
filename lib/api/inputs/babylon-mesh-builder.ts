/* eslint-disable @typescript-eslint/no-namespace */
import { BabylonMesh } from "./babylon-mesh-inputs";

// tslint:disable-next-line: no-namespace
export namespace BabylonMeshBuilder {

    export class CreateBoxDto {
        constructor(width?: number, depth?: number, height?: number, sideOrientation?: BabylonMesh.sideOrientationEnum) {
            if (width !== undefined) { this.width = width; }
            if (depth !== undefined) { this.depth = depth; }
            if (height !== undefined) { this.height = height; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
        }
        /**
         * Width of the box
         * @default 1
         */
        width = 1;
        /**
        * Depth of the box
        * @default 1
        */
        depth = 1;
        /**
       * Height of the box
       * @default 1
       */
        height = 1;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }

    export class CreateCubeDto {
        constructor(size?: number, sideOrientation?: BabylonMesh.sideOrientationEnum) {
            if (size !== undefined) { this.size = size; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
        }
        /**
         * Size of the cube
         * @default 1
         */
        size = 1;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
    export class CreateSquarePlaneDto {
        constructor(size?: number, sideOrientation?: BabylonMesh.sideOrientationEnum) {
            if (size !== undefined) { this.size = size; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
        }
        /**
         * Size of the square plane
         * @default 1
         */
        size = 1;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }

    export class CreateRectanglePlaneDto {
        constructor(width?: number, height?: number, sideOrientation?: BabylonMesh.sideOrientationEnum) {
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
        }
        /**
         * Width of the rectangle plane
         * @default 1
         */
        width = 1;
        /**
         * Height of the rectangle plane
         * @default 1
         */
        height = 1;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
}
