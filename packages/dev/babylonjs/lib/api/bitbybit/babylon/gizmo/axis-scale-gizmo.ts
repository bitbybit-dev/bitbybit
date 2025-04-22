import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

export class BabylonGizmoAxisScaleGizmo {


    constructor(
        private readonly context: Context,
    ) {
    }

    /**
    * Sets if axis is enabled or not
    * @param inputs axis scale gizmo
    * @returns axis scale gizmo
    * @group set
    * @shortname set is axis enabled
    */
    setIsEnabled(inputs: Inputs.BabylonGizmo.SetIsEnabledAxisScaleGizmoDto): BABYLON.IAxisScaleGizmo {
        inputs.axisScaleGizmo.isEnabled = inputs.isEnabled;
        return inputs.axisScaleGizmo;
    }

    /**
     * Checks if axis is enabled
     * @param inputs axis scale gizmo
     * @returns is enabled
     * @group get
     * @shortname is axis enabled
     */
    getIsEnabled(inputs: Inputs.BabylonGizmo.AxisScaleGizmoDto): boolean {
        return inputs.axisScaleGizmo.isEnabled;
    }
}
