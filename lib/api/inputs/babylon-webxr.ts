import { Camera, FreeCamera, Mesh, TargetCamera } from "@babylonjs/core";
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
export namespace BabylonWebXR {
    export class DefaultWebXRWithTeleportationDto {
        /**
         * Create XR experience with ground meshes
         */
        groundMeshes: Mesh[];
    }
}
