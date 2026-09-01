import * as BABYLON from "@babylonjs/core";

/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Parameters for picking: turning a pointer position into the object, face and point under it, with
 * control over which objects are pickable and what the result reports.
 */
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
