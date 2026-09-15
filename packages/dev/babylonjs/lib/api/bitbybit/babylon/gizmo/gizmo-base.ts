import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

/**
 * Settings shared by every gizmo: the scale ratio that sets how large the handles are drawn on
 * screen, independent of the size of the mesh they are attached to.
 */
export class BabylonGizmoBase {


    constructor(
        _context: Context,
    ) {
    }

    /**
     * Sets how large a gizmo's handles are drawn; 1 is the default size and 2 doubles it, whatever
     * the attached mesh's size.
     * @param inputs - The gizmo and the scale ratio
     * @returns The same gizmo
     * @group set
     * @shortname set scale ratio
     * @example
     * ```typescript
     * bitbybit.babylon.gizmo.base.scaleRatio({ gizmo: positionGizmo, scaleRatio: 1.5 });
     * ```
     */
    scaleRatio(inputs: Inputs.BabylonGizmo.SetGizmoScaleRatioDto): BABYLON.IGizmo {
        inputs.gizmo.scaleRatio = inputs.scaleRatio;
        return inputs.gizmo;
    }

    /**
     * Reads how large a gizmo's handles are drawn relative to the default size.
     * @param inputs - The gizmo
     * @returns The scale ratio
     * @group get
     * @shortname get scale ratio
     */
    getScaleRatio(inputs: Inputs.BabylonGizmo.GizmoDto): number {
        return inputs.gizmo?.scaleRatio;
    }

}
