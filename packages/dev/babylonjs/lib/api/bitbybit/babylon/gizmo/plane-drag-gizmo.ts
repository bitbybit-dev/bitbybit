import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

export class BabylonGizmoPlaneDragGizmo {


    constructor(
        private readonly context: Context,
    ) {
    }

    /**
    * Sets if plane is enabled or not
    * @param inputs plane drag gizmo
    * @returns plane drag gizmo
    * @group set
    * @shortname set is plane enabled
    */
    setIsEnabled(inputs: Inputs.BabylonGizmo.SetIsEnabledPlaneDragGizmoDto): BABYLON.IPlaneDragGizmo {
        inputs.planeDragGizmo.isEnabled = inputs.isEnabled;
        return inputs.planeDragGizmo;
    }

    /**
     * Checks if plane is enabled
     * @param inputs plane drag gizmo
     * @returns is enabled
     * @group get
     * @shortname is plane enabled
     */
    getIsEnabled(inputs: Inputs.BabylonGizmo.PlaneDragGizmoDto): boolean {
        return inputs.planeDragGizmo.isEnabled;
    }
}
