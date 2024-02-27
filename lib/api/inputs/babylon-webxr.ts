import * as BABYLON from "@babylonjs/core";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace BabylonWebXR {
    export class DefaultWebXRWithTeleportationDto {
        constructor(groundMeshes?: BABYLON.Mesh[]) {
            if (groundMeshes !== undefined) { this.groundMeshes = groundMeshes; }
        }
        /**
         * Create XR experience with ground meshes
         */
        groundMeshes: BABYLON.Mesh[];
    }
}
