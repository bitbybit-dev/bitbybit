import type * as BABYLON from "@babylonjs/core";
import type { Context } from "../../../context";
import * as Inputs from "../../../inputs";
import { resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../../../resolved-inputs";

/**
 * One ring of a rotation gizmo, turning around a single axis; reach it through
 * `rotationGizmo.getXGizmo` and its siblings to switch that ring on or off.
 */
export class BabylonGizmoPlaneRotationGizmo {

    constructor(
        _context: Context,
    ) {
    }

    /**
     * Shows or hides one ring of a rotation gizmo, so the mesh can be locked against turning around
     * that axis.
     * @param inputs - The plane rotation gizmo and the flag
     * @returns The same plane rotation gizmo
     * @group set
     * @shortname set is plane enabled
     * @example
     * ```typescript
     * const xRing = bitbybit.babylon.gizmo.rotationGizmo.getXGizmo({ rotationGizmo });
     * bitbybit.babylon.gizmo.planeRotationGizmo.setIsEnabled({ planeRotationGizmo: xRing, isEnabled: false });
     * ```
     */
    setIsEnabled(inputs: Inputs.BabylonGizmo.SetIsEnabledPlaneRotationGizmoDto): BABYLON.IPlaneRotationGizmo {
        const resolved = resolveDto(Inputs.BabylonGizmo.SetIsEnabledPlaneRotationGizmoDto, inputs) as Resolved.BabylonGizmo.SetIsEnabledPlaneRotationGizmoDto;
        resolved.planeRotationGizmo.isEnabled = resolved.isEnabled;
        return resolved.planeRotationGizmo;
    }

    /**
     * Reads whether one ring of a rotation gizmo is shown.
     * @param inputs - The plane rotation gizmo
     * @returns True when the ring is shown
     * @group get
     * @shortname is plane enabled
     */
    getIsEnabled(inputs: Inputs.BabylonGizmo.PlaneRotationGizmoDto): boolean {
        return inputs.planeRotationGizmo.isEnabled;
    }
}
