import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

export class BabylonGizmoManager {


    constructor(
        private readonly context: Context,
    ) {
    }

    /**
     * Create gizmo manager
     * @param inputs gizmo manager options
     * @group create
     * @shortname create gizmo manager
     * @disposableOutput true
     */
    createGizmoManager(inputs: Inputs.BabylonGizmo.CreateGizmoDto): BABYLON.GizmoManager {
        const gizmoManager = new BABYLON.GizmoManager(this.context.scene);
        gizmoManager.positionGizmoEnabled = inputs.positionGizmoEnabled;
        gizmoManager.rotationGizmoEnabled = inputs.rotationGizmoEnabled;
        gizmoManager.scaleGizmoEnabled = inputs.scaleGizmoEnabled;
        gizmoManager.boundingBoxGizmoEnabled = inputs.boundingBoxGizmoEnabled;
        if (inputs.attachableMeshes && inputs.attachableMeshes.length > 0) {
            gizmoManager.attachableMeshes = inputs.attachableMeshes;
        }
        gizmoManager.clearGizmoOnEmptyPointerEvent = inputs.clearGizmoOnEmptyPointerEvent;
        gizmoManager.scaleRatio = inputs.scaleRatio;
        gizmoManager.usePointerToAttachGizmos = inputs.usePointerToAttachGizmos;
        return gizmoManager;
    }

    /**
     * Get position gizmo
     * @param inputs gizmo manager
     * @returns position gizmo
     * @group get
     * @shortname get position gizmo
     */
    getPositionGizmo(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.IPositionGizmo {
        return inputs.gizmoManager.gizmos.positionGizmo;
    }

    /**
     * Get rotation gizmo
     * @param inputs gizmo manager
     * @returns rotation gizmo
     * @group get
     * @shortname get rotation gizmo
     */
    getRotationGizmo(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.IRotationGizmo {
        return inputs.gizmoManager.gizmos.rotationGizmo;
    }

    /**
     * Get scale gizmo
     * @param inputs gizmo manager
     * @returns scale gizmo
     * @group get
     * @shortname get scale gizmo
     */
    getScaleGizmo(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.IScaleGizmo {
        return inputs.gizmoManager.gizmos.scaleGizmo;
    }

    /**
     * Get bounding box gizmo
     * @param inputs gizmo manager
     * @returns bounding box gizmo
     * @group get
     * @shortname get bounding box gizmo
     */
    getBoundingBoxGizmo(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.IBoundingBoxGizmo {
        return inputs.gizmoManager.gizmos.boundingBoxGizmo;
    }

    /**
     * Attach gizmo manager to mesh
     * @param inputs gizmo manager, mesh
     * @returns gizmo manager
     * @group update
     * @shortname attach to mesh
     */
    attachToMesh(inputs: Inputs.BabylonGizmo.AttachToMeshDto): BABYLON.GizmoManager {
        inputs.gizmoManager.attachToMesh(inputs.mesh);
        return inputs.gizmoManager;
    }

    /**
     * Detach gizmo manager from mesh
     * @param inputs gizmo manager, mesh
     * @returns gizmo manager
     * @group update
     * @shortname detach mesh
     */
    detachMesh(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.GizmoManager {
        inputs.gizmoManager.attachToMesh(null);
        return inputs.gizmoManager;
    }
}
