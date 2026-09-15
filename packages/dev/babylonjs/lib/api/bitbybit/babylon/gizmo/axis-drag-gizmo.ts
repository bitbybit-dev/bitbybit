import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

/**
 * One arrow of a position gizmo, dragging along a single axis; reach it through
 * `positionGizmo.getXGizmo` and its siblings to switch that axis on or off.
 */
export class BabylonGizmoAxisDragGizmo {


    constructor(
        _context: Context,
    ) {
    }

    /**
     * Shows or hides one axis arrow of a position gizmo, so the mesh can be locked against moving
     * along that axis.
     * @param inputs - The axis drag gizmo and the flag
     * @returns The same axis drag gizmo
     * @group set
     * @shortname set is axis enabled
     * @example
     * ```typescript
     * const yArrow = bitbybit.babylon.gizmo.positionGizmo.getYGizmo({ positionGizmo });
     * bitbybit.babylon.gizmo.axisDragGizmo.setIsEnabled({ axisDragGizmo: yArrow, isEnabled: false });
     * ```
     */
    setIsEnabled(inputs: Inputs.BabylonGizmo.SetIsEnabledAxisDragGizmoDto): BABYLON.IAxisDragGizmo {
        inputs.axisDragGizmo.isEnabled = inputs.isEnabled;
        return inputs.axisDragGizmo;
    }

    /**
     * Reads whether one axis arrow of a position gizmo is shown.
     * @param inputs - The axis drag gizmo
     * @returns True when the arrow is shown
     * @group get
     * @shortname is axis enabled
     */
    getIsEnabled(inputs: Inputs.BabylonGizmo.AxisDragGizmoDto): boolean {
        return inputs.axisDragGizmo.isEnabled;
    }
}
