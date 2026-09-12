import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

/**
 * The rotation gizmo: three rings that turn the attached mesh around X, Y or Z. Snapping turns it
 * in fixed angle steps, sensitivity sets how far a drag turns it, and each ring can be reached on
 * its own to enable or disable it.
 */
export class BabylonGizmoRotationGizmo {


    constructor(
        _context: Context,
    ) {
    }

    /**
     * Makes a rotation gizmo turn the mesh in steps of `snapDistance` radians instead of smoothly;
     * 0 turns snapping off.
     * @param inputs - The rotation gizmo and the step in radians
     * @returns The same rotation gizmo
     * @group set
     * @shortname set snap distance
     * @example
     * ```typescript
     * bitbybit.babylon.gizmo.rotationGizmo.snapDistance({ rotationGizmo, snapDistance: Math.PI / 12 });
     * ```
     */
    snapDistance(inputs: Inputs.BabylonGizmo.SetRotationGizmoSnapDistanceDto): BABYLON.IRotationGizmo {
        inputs.rotationGizmo.snapDistance = inputs.snapDistance;
        return inputs.rotationGizmo;
    }

    /**
     * Sets how far a rotation gizmo turns the mesh for a given drag; 1 is the default and higher
     * values turn it faster.
     * @param inputs - The rotation gizmo and the sensitivity
     * @returns The same rotation gizmo
     * @group set
     * @shortname set sensitivity
     */
    sensitivity(inputs: Inputs.BabylonGizmo.SetRotationGizmoSensitivityDto): BABYLON.IRotationGizmo {
        inputs.rotationGizmo.sensitivity = inputs.sensitivity;
        return inputs.rotationGizmo;
    }
    
    /**
     * Reads the mesh a rotation gizmo is currently attached to, or null when none is.
     * @param inputs - The rotation gizmo
     * @returns The attached mesh, or null
     * @group get
     * @shortname get attached mesh
     */
    getAttachedMesh(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.Nullable<BABYLON.AbstractMesh> {
        return inputs.rotationGizmo?.attachedMesh;
    }

    /**
     * Reads the node a rotation gizmo is currently attached to, which may be a transform node
     * rather than a mesh.
     * @param inputs - The rotation gizmo
     * @returns The attached node
     * @group get
     * @shortname get attached node
     */
    getAttachedNode(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.Node {
        return inputs.rotationGizmo?.attachedNode as BABYLON.Node;
    }

    /**
     * Reads the ring of a rotation gizmo that turns around X, to enable or disable it on its own.
     * @param inputs - The rotation gizmo
     * @returns The X plane rotation gizmo
     * @group get
     * @shortname get x gizmo
     */
    getXGizmo(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.IPlaneRotationGizmo {
        return inputs.rotationGizmo?.xGizmo;
    }

    /**
     * Reads the ring of a rotation gizmo that turns around Y, to enable or disable it on its own.
     * @param inputs - The rotation gizmo
     * @returns The Y plane rotation gizmo
     * @group get
     * @shortname get y gizmo
     */
    getYGizmo(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.IPlaneRotationGizmo {
        return inputs.rotationGizmo?.yGizmo;
    }

    /**
     * Reads the ring of a rotation gizmo that turns around Z, to enable or disable it on its own.
     * @param inputs - The rotation gizmo
     * @returns The Z plane rotation gizmo
     * @group get
     * @shortname get z gizmo
     */
    getZGizmo(inputs: Inputs.BabylonGizmo.RotationGizmoDto): BABYLON.IPlaneRotationGizmo {
        return inputs.rotationGizmo?.zGizmo;
    }

    /**
     * Reads the angle step in radians a rotation gizmo snaps to, 0 meaning smooth rotation.
     * @param inputs - The rotation gizmo
     * @returns The snap distance in radians
     * @group get
     * @shortname get snap distance
     */
    getSnapDistance(inputs: Inputs.BabylonGizmo.RotationGizmoDto): number {
        return inputs.rotationGizmo?.snapDistance;
    }

    /**
     * Reads how far a rotation gizmo turns the mesh for a given drag.
     * @param inputs - The rotation gizmo
     * @returns The sensitivity
     * @group get
     * @shortname get sensitivity
     */
    getSensitivity(inputs: Inputs.BabylonGizmo.RotationGizmoDto): number {
        return inputs.rotationGizmo?.sensitivity;
    }

    /**
     * Passes through the name of a rotation gizmo event, drag start, drag or drag end, as a typed
     * selector for code that subscribes to gizmo events by name.
     * @param inputs - The event selector
     * @returns The same selector
     * @group create
     * @shortname rotation gizmo observable selector
     * @example
     * ```typescript
     * const selector = bitbybit.babylon.gizmo.rotationGizmo.createRotationGizmoObservableSelector({ selector: Bit.Inputs.BabylonGizmo.rotationGizmoObservableSelectorEnum.onDragEndObservable });
     * ```
     */
    createRotationGizmoObservableSelector(inputs: Inputs.BabylonGizmo.RotationGizmoObservableSelectorDto): Inputs.BabylonGizmo.rotationGizmoObservableSelectorEnum {
        return inputs.selector;
    }
}
