import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

/**
 * One handle of a scale gizmo, stretching along a single axis; reach it through
 * `scaleGizmo.getXGizmo` and its siblings to switch that axis on or off.
 */
export class BabylonGizmoAxisScaleGizmo {


    constructor(
        _context: Context,
    ) {
    }

    /**
     * Shows or hides one axis handle of a scale gizmo, so the mesh can be locked against scaling
     * along that axis.
     * @param inputs - The axis scale gizmo and the flag
     * @returns The same axis scale gizmo
     * @group set
     * @shortname set is axis enabled
     * @example
     * ```typescript
     * const yHandle = bitbybit.babylon.gizmo.scaleGizmo.getYGizmo({ scaleGizmo });
     * bitbybit.babylon.gizmo.axisScaleGizmo.setIsEnabled({ axisScaleGizmo: yHandle, isEnabled: false });
     * ```
     */
    setIsEnabled(inputs: Inputs.BabylonGizmo.SetIsEnabledAxisScaleGizmoDto): BABYLON.IAxisScaleGizmo {
        inputs.axisScaleGizmo.isEnabled = inputs.isEnabled;
        return inputs.axisScaleGizmo;
    }

    /**
     * Reads whether one axis handle of a scale gizmo is shown.
     * @param inputs - The axis scale gizmo
     * @returns True when the handle is shown
     * @group get
     * @shortname is axis enabled
     */
    getIsEnabled(inputs: Inputs.BabylonGizmo.AxisScaleGizmoDto): boolean {
        return inputs.axisScaleGizmo.isEnabled;
    }
}
