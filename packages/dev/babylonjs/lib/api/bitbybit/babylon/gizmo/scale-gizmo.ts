import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

export class BabylonGizmoScaleGizmo {


    constructor(
        private readonly context: Context,
    ) {
    }

    /**
     * Get x gizmo
     * @param inputs scale gizmo
     * @returns x scale gizmo
     * @group get
     * @shortname get x gizmo
     */
    getXGizmo(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): BABYLON.IAxisScaleGizmo {
        return inputs.scaleGizmo?.xGizmo;
    }

    /**
     * Get y gizmo
     * @param inputs position gizmo
     * @returns y scale gizmo
     * @group get
     * @shortname get y gizmo
     */
    getYGizmo(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): BABYLON.IAxisScaleGizmo {
        return inputs.scaleGizmo?.yGizmo;
    }

    /**
     * Get z gizmo
     * @param inputs scale gizmo
     * @returns z scale gizmo
     * @group get
     * @shortname get z gizmo
     */
    getZGizmo(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): BABYLON.IAxisScaleGizmo {
        return inputs.scaleGizmo?.zGizmo;
    }

    /**
     * Set scale gizmo snap distance
     * @param inputs scale gizmo
     * @returns scale gizmo
     * @group set
     * @shortname set snap distance
     */
    snapDistance(inputs: Inputs.BabylonGizmo.SetScaleGizmoSnapDistanceDto): BABYLON.IScaleGizmo {
        inputs.scaleGizmo.snapDistance = inputs.snapDistance;
        return inputs.scaleGizmo;
    }

    /**
     * Set scale gizmo incremental snap
     * @param inputs scale gizmo
     * @returns scale gizmo
     * @group set
     * @shortname set incremental snap
     */
    setIncrementalSnap(inputs: Inputs.BabylonGizmo.SetScaleGizmoIncrementalSnapDto): BABYLON.IScaleGizmo {
        inputs.scaleGizmo.incrementalSnap = inputs.incrementalSnap;
        return inputs.scaleGizmo;
    }

    /**
     * Set scale gizmo sensitivity
     * @param inputs scale gizmo
     * @returns scale gizmo
     * @group set
     * @shortname set sensitivity
     */
    sensitivity(inputs: Inputs.BabylonGizmo.SetScaleGizmoSensitivityDto): BABYLON.IScaleGizmo {
        inputs.scaleGizmo.sensitivity = inputs.sensitivity;
        return inputs.scaleGizmo;
    }

    /**
     * Get incremental snap
     * @param inputs scale gizmo
     * @returns incremental snap
     * @group get
     * @shortname get incremental snap
     */
    getIncrementalSnap(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): boolean {
        return inputs.scaleGizmo.incrementalSnap;
    }

    /**
     * Get snap distance
     * @param inputs scale gizmo
     * @returns snap distance
     * @group get
     * @shortname get snap distance
     */
    getSnapDistance(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): number {
        return inputs.scaleGizmo.snapDistance;
    }

    /**
     * Get sensitivity
     * @param inputs scale gizmo
     * @returns sensitivity
     * @group get
     * @shortname get sensitivity
     */
    getSensitivity(inputs: Inputs.BabylonGizmo.ScaleGizmoDto): number {
        return inputs.scaleGizmo.sensitivity;
    }

    /**
     * Creates the selector of an observable for a scale gizmo
     * @param inputs observable name
     * @returns scale gizmo observable selector
     * @group create
     * @shortname scale gizmo observable selector
     */
    createScaleGizmoObservableSelector(inputs: Inputs.BabylonGizmo.ScaleGizmoObservableSelectorDto): Inputs.BabylonGizmo.scaleGizmoObservableSelectorEnum {
        return inputs.selector;
    }
}
