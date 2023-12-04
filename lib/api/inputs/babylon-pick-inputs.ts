import { PickingInfo, Ray } from "@babylonjs/core";

/* eslint-disable @typescript-eslint/no-namespace */

export namespace BabylonPick {
    export class RayDto {
        /**
         * Ray
         */
        ray: Ray;
    }
    export class PickInfo {
        /**
         * Information about picking result
         */
        pickInfo: PickingInfo;
    }
}
