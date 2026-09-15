import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

/**
 * One plane handle of a position gizmo, dragging within a single plane; reach it through
 * `positionGizmo.getXPlaneGizmo` and its siblings to switch that plane on or off.
 */
export class BabylonGizmoPlaneDragGizmo {


    constructor(
        _context: Context,
    ) {
    }

    /**
     * Shows or hides one plane handle of a position gizmo, so the mesh can be locked against
     * sliding in that plane.
     * @param inputs - The plane drag gizmo and the flag
     * @returns The same plane drag gizmo
     * @group set
     * @shortname set is plane enabled
     * @example
     * ```typescript
     * const xzHandle = bitbybit.babylon.gizmo.positionGizmo.getYPlaneGizmo({ positionGizmo });
     * bitbybit.babylon.gizmo.planeDragGizmo.setIsEnabled({ planeDragGizmo: xzHandle, isEnabled: true });
     * ```
     */
    setIsEnabled(inputs: Inputs.BabylonGizmo.SetIsEnabledPlaneDragGizmoDto): BABYLON.IPlaneDragGizmo {
        inputs.planeDragGizmo.isEnabled = inputs.isEnabled;
        return inputs.planeDragGizmo;
    }

    /**
     * Reads whether one plane handle of a position gizmo is shown.
     * @param inputs - The plane drag gizmo
     * @returns True when the handle is shown
     * @group get
     * @shortname is plane enabled
     */
    getIsEnabled(inputs: Inputs.BabylonGizmo.PlaneDragGizmoDto): boolean {
        return inputs.planeDragGizmo.isEnabled;
    }
}
