/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";

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
