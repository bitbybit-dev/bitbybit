import * as BABYLON from "@babylonjs/core";

/* eslint-disable @typescript-eslint/no-namespace */

export namespace BabylonPick {
    export class RayDto {
        constructor(ray?: BABYLON.Ray) {
            if (ray !== undefined) { this.ray = ray; }
        }
        /**
         * Ray
         */
        ray: BABYLON.Ray;
    }
    export class PickInfo {
        constructor(pickInfo?: BABYLON.PickingInfo) {
            if (pickInfo !== undefined) { this.pickInfo = pickInfo; }
        }
        /**
         * Information about picking result
         */
        pickInfo: BABYLON.PickingInfo;
    }
}
