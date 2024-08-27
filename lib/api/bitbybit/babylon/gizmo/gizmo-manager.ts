import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs/inputs";
import { Base } from "../../../inputs/inputs";

export class BabylonGizmoManager {


    constructor(
        private readonly context: Context,
    ) {
    }

    /**
     * Create gizmo manager
     * @param inputs camera to freeze
     * @group adjust
     * @shortname create gizmo manager
     */
    createGizmoManager(): BABYLON.GizmoManager {
        const gizmoManager = new BABYLON.GizmoManager(this.context.scene);
        gizmoManager.positionGizmoEnabled = true;
        return gizmoManager;
    }

    subscribeGizmo(inputs: Inputs.BabylonGizmo.GizmoDto): BABYLON.GizmoManager {
        if (inputs.gizmoManager === undefined) {
            throw new Error("Gizmo manager is not defined");
        }
        inputs.gizmoManager.gizmos.positionGizmo.onDragObservable.add(e => {

        });
        return inputs.gizmoManager;
    }
}
