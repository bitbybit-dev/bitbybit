import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGizmoRotationGizmo {


    constructor(
        private readonly context: Context,
    ) {
    }

    /**
     * Set rotation gizmo snap distance
     * @param inputs rotation gizmo
     * @returns rotation gizmo
     * @group set
     * @shortname set snap distance
     */
    snapDistance(inputs: Inputs.BabylonGizmo.SetRotationGizmoSnapDistanceDto): BABYLON.IRotationGizmo {
        inputs.rotationGizmo.snapDistance = inputs.snapDistance;
        return inputs.rotationGizmo;
    }

    /**
     * Set rotation gizmo sensitivity
     * @param inputs rotation gizmo
     * @returns rotation gizmo
     * @group set
     * @shortname set sensitivity
     */
    sensitivity(inputs: Inputs.BabylonGizmo.SetRotationGizmoSensitivityDto): BABYLON.IRotationGizmo {
        inputs.rotationGizmo.sensitivity = inputs.sensitivity;
        return inputs.rotationGizmo;
    }
    
    /**
    * Get attached mesh
    * @param inputs rotation gizmo
    * @returns attached mesh
    * @group get
    * @shortname get attached mesh
    */
    getAttachedMesh(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.Nullable<BABYLON.AbstractMesh> {
        return inputs.rotationGizmo?.attachedMesh;
    }

    /**
    * Get attached node
    * @param inputs rotation gizmo
    * @returns attached node
    * @group get
    * @shortname get attached node
    */
    getAttachedNode(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.Node {
        return inputs.rotationGizmo?.attachedNode;
    }

    /**
     * Get x gizmo
     * @param inputs rotation gizmo
     * @returns x drag gizmo
     * @group get
     * @shortname get x gizmo
     */
    getXGizmo(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.IPlaneRotationGizmo {
        return inputs.rotationGizmo?.xGizmo;
    }

    /**
     * Get y gizmo
     * @param inputs rotation gizmo
     * @returns y drag gizmo
     * @group get
     * @shortname get y gizmo
     */
    getYGizmo(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.IPlaneRotationGizmo {
        return inputs.rotationGizmo?.yGizmo;
    }

    /**
     * Get z gizmo
     * @param inputs rotation gizmo
     * @returns z drag gizmo
     * @group get
     * @shortname get z gizmo
     */
    getZGizmo(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.IPlaneRotationGizmo {
        return inputs.rotationGizmo?.zGizmo;
    }

    /**
     * Get snap distance
     * @param inputs rotation gizmo
     * @returns snap distance
     * @group get
     * @shortname get snap distance
     */
    getSnapDistance(inputs: Inputs.BabylonGizmo.RotationGizmoDto): number {
        return inputs.rotationGizmo?.snapDistance;
    }

    /**
     * Get sensitivity
     * @param inputs rotation gizmo
     * @returns sensitivity
     * @group get
     * @shortname get sensitivity
     */
    getSensitivity(inputs: Inputs.BabylonGizmo.RotationGizmoDto): number {
        return inputs.rotationGizmo?.sensitivity;
    }

    /**
    * Creates the selector of an observable for a rotation gizmo
    * @param inputs observable name
    * @returns rotation gizmo observable selector
    * @group create
    * @shortname rotation gizmo observable selector
    */
    createRotationGizmoObservableSelector(inputs: Inputs.BabylonGizmo.RotationGizmoObservableSelectorDto): Inputs.BabylonGizmo.rotationGizmoObservableSelectorEnum {
        return inputs.selector;
    }
}
