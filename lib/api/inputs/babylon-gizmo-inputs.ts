import * as BABYLON from "@babylonjs/core";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace BabylonGizmo {
    export class GizmoDto {
        constructor(gizmoManager?: BABYLON.GizmoManager) {
            if (gizmoManager !== undefined) { this.gizmoManager = gizmoManager; }
        }
        /**
         * Gizmo manager to use
         * @default undefined
         */
        gizmoManager: BABYLON.GizmoManager;
    }
}
