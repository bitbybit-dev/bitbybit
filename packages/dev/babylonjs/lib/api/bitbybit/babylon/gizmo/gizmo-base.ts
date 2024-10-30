import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGizmoBase {


    constructor(
        private readonly context: Context,
    ) {
    }

    /**
     * Set gizmo scale ratio
     * @param inputs gizmo
     * @group set
     * @shortname set scale ratio
     */
    scaleRatio(inputs: Inputs.BabylonGizmo.SetGizmoScaleRatioDto): BABYLON.IGizmo {
        inputs.gizmo.scaleRatio = inputs.scaleRatio;
        return inputs.gizmo;
    }

    /**
     * Gets scale ratio
     * @param inputs gizmo
     * @returns scale ratio
     * @group get
     * @shortname get scale ratio
     */
    getScaleRatio(inputs: Inputs.BabylonGizmo.GizmoDto): number {
        return inputs.gizmo?.scaleRatio;
    }

}
