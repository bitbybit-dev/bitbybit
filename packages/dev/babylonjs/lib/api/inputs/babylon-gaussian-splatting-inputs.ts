/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";

/**
 * Parameters for 3D Gaussian Splatting scenes: the splat file to load and the options that control how
 * it is positioned, scaled and rendered. This is how photographic scans of real objects are shown
 * alongside modelled geometry.
 */
export namespace BabylonGaussianSplatting {


    export class CreateGaussianSplattingMeshDto {
        constructor(url?: string) {
            if (url !== undefined) { this.url = url; }
        }
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        url: string;
    }
    export class GaussianSplattingMeshDto {
        constructor(babylonMesh?: BABYLON.GaussianSplattingMesh) {
            if (babylonMesh !== undefined) { this.babylonMesh = babylonMesh; }
        }
        /**
         * Gaussian Splatting Mesh that needs to be updated
         */
        babylonMesh: BABYLON.GaussianSplattingMesh;
    }
}
