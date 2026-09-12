import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

/**
 * The scale gizmo: three handles that stretch the attached mesh along X, Y or Z and a center handle
 * that scales it evenly. Snapping scales in fixed steps, sensitivity sets how much a drag scales,
 * and each axis handle can be reached on its own.
 */
export class BabylonGizmoScaleGizmo {


    constructor(
        _context: Context,
    ) {
    }

    /**
     * Reads the handle of a scale gizmo that stretches along X, to enable or disable it on its own.
     * @param inputs - The scale gizmo
     * @returns The X axis scale gizmo
     * @group get
     * @shortname get x gizmo
     */
    getXGizmo(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): BABYLON.IAxisScaleGizmo {
        return inputs.scaleGizmo?.xGizmo;
    }

    /**
     * Reads the handle of a scale gizmo that stretches along Y, to enable or disable it on its own.
     * @param inputs - The scale gizmo
     * @returns The Y axis scale gizmo
     * @group get
     * @shortname get y gizmo
     */
    getYGizmo(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): BABYLON.IAxisScaleGizmo {
        return inputs.scaleGizmo?.yGizmo;
    }

    /**
     * Reads the handle of a scale gizmo that stretches along Z, to enable or disable it on its own.
     * @param inputs - The scale gizmo
     * @returns The Z axis scale gizmo
     * @group get
     * @shortname get z gizmo
     */
    getZGizmo(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): BABYLON.IAxisScaleGizmo {
        return inputs.scaleGizmo?.zGizmo;
    }

    /**
     * Makes a scale gizmo change the scale in steps of `snapDistance` instead of smoothly; 0 turns
     * snapping off. `setIncrementalSnap` chooses how the steps combine.
     * @param inputs - The scale gizmo and the step size
     * @returns The same scale gizmo
     * @group set
     * @shortname set snap distance
     * @example
     * ```typescript
     * bitbybit.babylon.gizmo.scaleGizmo.snapDistance({ scaleGizmo, snapDistance: 0.1 });
     * bitbybit.babylon.gizmo.scaleGizmo.setIncrementalSnap({ scaleGizmo, incrementalSnap: true });
     * ```
     */
    snapDistance(inputs: Inputs.BabylonGizmo.SetScaleGizmoSnapDistanceDto): BABYLON.IScaleGizmo {
        inputs.scaleGizmo.snapDistance = inputs.snapDistance;
        return inputs.scaleGizmo;
    }

    /**
     * Chooses how a scale gizmo's snapping steps combine: incremental steps add up, 1.1 then 1.2
     * then 1.3 for a step of 0.1, while the default multiplies, 1.1 then 1.21 then 1.33.
     * @param inputs - The scale gizmo and the flag
     * @returns The same scale gizmo
     * @group set
     * @shortname set incremental snap
     */
    setIncrementalSnap(inputs: Inputs.BabylonGizmo.SetScaleGizmoIncrementalSnapDto): BABYLON.IScaleGizmo {
        inputs.scaleGizmo.incrementalSnap = inputs.incrementalSnap;
        return inputs.scaleGizmo;
    }

    /**
     * Sets how much a scale gizmo changes the scale for a given drag; 1 is the default and higher
     * values scale faster.
     * @param inputs - The scale gizmo and the sensitivity
     * @returns The same scale gizmo
     * @group set
     * @shortname set sensitivity
     */
    sensitivity(inputs: Inputs.BabylonGizmo.SetScaleGizmoSensitivityDto): BABYLON.IScaleGizmo {
        inputs.scaleGizmo.sensitivity = inputs.sensitivity;
        return inputs.scaleGizmo;
    }

    /**
     * Reads whether a scale gizmo's snapping steps add up rather than multiply.
     * @param inputs - The scale gizmo
     * @returns True when snapping is incremental
     * @group get
     * @shortname get incremental snap
     */
    getIncrementalSnap(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): boolean {
        return inputs.scaleGizmo.incrementalSnap;
    }

    /**
     * Reads the step size a scale gizmo snaps to, 0 meaning smooth scaling.
     * @param inputs - The scale gizmo
     * @returns The snap distance
     * @group get
     * @shortname get snap distance
     */
    getSnapDistance(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): number {
        return inputs.scaleGizmo.snapDistance;
    }

    /**
     * Reads how much a scale gizmo changes the scale for a given drag.
     * @param inputs - The scale gizmo
     * @returns The sensitivity
     * @group get
     * @shortname get sensitivity
     */
    getSensitivity(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): number {
        return inputs.scaleGizmo.sensitivity;
    }

    /**
     * Passes through the name of a scale gizmo event, drag start, drag or drag end, as a typed
     * selector for code that subscribes to gizmo events by name.
     * @param inputs - The event selector
     * @returns The same selector
     * @group create
     * @shortname scale gizmo observable selector
     * @example
     * ```typescript
     * const selector = bitbybit.babylon.gizmo.scaleGizmo.createScaleGizmoObservableSelector({ selector: Bit.Inputs.BabylonGizmo.scaleGizmoObservableSelectorEnum.onDragEndObservable });
     * ```
     */
    createScaleGizmoObservableSelector(inputs: Inputs.BabylonGizmo.ScaleGizmoObservableSelectorDto): Inputs.BabylonGizmo.scaleGizmoObservableSelectorEnum {
        return inputs.selector;
    }
}
