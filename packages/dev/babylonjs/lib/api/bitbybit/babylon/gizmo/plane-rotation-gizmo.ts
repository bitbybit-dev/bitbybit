import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

export class BabylonGizmoPlaneRotationGizmo {

    constructor(
        private readonly context: Context,
    ) {
    }

    /**
    * Sets if plane is enabled or not
    * @param inputs plane rotation gizmo
    * @returns plane rotation gizmo
    * @group set
    * @shortname set is plane enabled
    */
    setIsEnabled(inputs: Inputs.BabylonGizmo.SetIsEnabledPlaneRotationGizmoDto): BABYLON.IPlaneRotationGizmo {
        inputs.planeRotationGizmo.isEnabled = inputs.isEnabled;
        return inputs.planeRotationGizmo;
    }

    /**
     * Checks if plane is enabled
     * @param inputs plane rotation gizmo
     * @returns is enabled
     * @group get
     * @shortname is plane enabled
     */
    getIsEnabled(inputs: Inputs.BabylonGizmo.PlaneRotationGizmoDto): boolean {
        return inputs.planeRotationGizmo.isEnabled;
    }
}
