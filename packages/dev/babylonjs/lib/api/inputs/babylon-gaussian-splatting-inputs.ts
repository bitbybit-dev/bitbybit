/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";

/**
 * Parameters for 3D Gaussian Splatting scenes: the splat file to load and the options that control how
 * it is positioned, scaled and rendered. This is how photographic scans of real objects are shown
 * alongside modelled geometry.
 */
export namespace BabylonGaussianSplatting {


    /**
     * Feeds `babylon.gaussianSplatting.create` with the address of the `.ply` file to load.
     */
    export class CreateGaussianSplattingMeshDto {
        constructor(url?: string) {
            if (url !== undefined) { this.url = url; }
        }
        /**
         * Address of the Gaussian splatting `.ply` file
         * @default undefined
         */
        url!: string;
    }
    /**
     * Feeds `babylon.gaussianSplatting.clone` and `getSplatPositions` with the loaded splatting
     * mesh to work on.
     */
    export class GaussianSplattingMeshDto {
        constructor(babylonMesh?: BABYLON.GaussianSplattingMesh) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
        }
        /**
         * The loaded Gaussian splatting mesh
         */
        babylonMesh!: BABYLON.GaussianSplattingMesh;
    }
}
