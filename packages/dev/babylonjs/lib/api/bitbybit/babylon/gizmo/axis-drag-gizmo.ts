import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

export class BabylonGizmoAxisDragGizmo {


    constructor(
        private readonly context: Context,
    ) {
    }

    /**
    * Sets if axis is enabled or not
    * @param inputs axis drag gizmo
    * @returns axis drag gizmo
    * @group set
    * @shortname set is axis enabled
    */
    setIsEnabled(inputs: Inputs.BabylonGizmo.SetIsEnabledAxisDragGizmoDto): BABYLON.IAxisDragGizmo {
        inputs.axisDragGizmo.isEnabled = inputs.isEnabled;
        return inputs.axisDragGizmo;
    }

    /**
     * Checks if axis is enabled
     * @param inputs axis drag gizmo
     * @returns is enabled
     * @group get
     * @shortname is axis enabled
     */
    getIsEnabled(inputs: Inputs.BabylonGizmo.AxisDragGizmoDto): boolean {
        return inputs.axisDragGizmo.isEnabled;
    }
}
