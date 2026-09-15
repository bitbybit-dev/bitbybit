import * as BABYLON from "@babylonjs/core";

/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Parameters for picking: turning a pointer position into the object, face and point under it, with
 * control over which objects are pickable and what the result reports.
 */
export namespace BabylonPick {
    /**
     * Feeds `babylon.pick.pickWithRay` with the ray to shoot into the scene to find what it hits.
     */
    export class RayDto {
        constructor(ray?: BABYLON.Ray) {
            if (ray !== undefined) { this.ray = ray; }
        }
        /**
         * The ray shot into the scene, as the `babylon.ray` methods build it
         */
        ray!: BABYLON.Ray;
    }
    /**
     * Feeds the `babylon.pick` getters with a picking result, as `pickWithRay` or
     * `pickWithPickingRay` give it.
     */
    export class PickInfo {
        constructor(pickInfo?: BABYLON.PickingInfo) {
            if (pickInfo !== undefined) { this.pickInfo = pickInfo; }
        }
        /**
         * The picking result to read from; check `hit` before reading the mesh, point or distance
         */
        pickInfo!: BABYLON.PickingInfo;
    }
}
