/* eslint-disable @typescript-eslint/no-namespace */
import { BabylonMesh } from "./babylon-mesh-inputs";

// tslint:disable-next-line: no-namespace
export namespace BabylonMeshBuilder {

    export class CreateBoxDto {
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
    }

    export class CreateCubeDto {
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
    }
    export class CreateSquarePlaneDto {
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
    }

    export class CreateRectanglePlaneDto {
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
    }
}
