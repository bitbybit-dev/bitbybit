import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

/**
 * The gizmo manager owns the on-screen manipulators for one attached mesh at a time and, by
 * default, attaches them to whatever the pointer clicks. Create it with the gizmos you want
 * enabled, then read the individual position, rotation, scale and bounding box gizmos from it to
 * tune them.
 */
export class BabylonGizmoManager {


    constructor(
        private readonly context: Context,
    ) {
    }

    /**
     * Creates a gizmo manager with the chosen gizmos enabled: position arrows, rotation rings,
     * scale handles and a bounding box.
     *
     * With `usePointerToAttachGizmos` true the gizmos attach to the mesh the user clicks, limited
     * to `attachableMeshes` when that list is given; `clearGizmoOnEmptyPointerEvent` detaches them
     * on a click into empty space.
     * @param inputs - Which gizmos to enable, the attachable meshes, the pointer behavior and the scale ratio
     * @returns The gizmo manager
     * @group create
     * @shortname create gizmo manager
     * @disposableOutput true
     * @example
     * ```typescript
     * const manager = bitbybit.babylon.gizmo.manager.createGizmoManager({ positionGizmoEnabled: true, rotationGizmoEnabled: true, scaleGizmoEnabled: false, boundingBoxGizmoEnabled: false, attachableMeshes: [], usePointerToAttachGizmos: false, clearGizmoOnEmptyPointerEvent: false, scaleRatio: 1 });
     * bitbybit.babylon.gizmo.manager.attachToMesh({ gizmoManager: manager, mesh });
     * ```
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
     * Reads the position gizmo of a manager, the arrows that drag the mesh along an axis, for
     * tuning its snapping and planes; it exists only when position gizmos are enabled.
     * @param inputs - The gizmo manager
     * @returns The position gizmo
     * @group get
     * @shortname get position gizmo
     * @example
     * ```typescript
     * const positionGizmo = bitbybit.babylon.gizmo.manager.getPositionGizmo({ gizmoManager: manager });
     * bitbybit.babylon.gizmo.positionGizmo.snapDistance({ positionGizmo, snapDistance: 1 });
     * ```
     */
    getPositionGizmo(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.IPositionGizmo {
        return inputs.gizmoManager.gizmos.positionGizmo!;
    }

    /**
     * Reads the rotation gizmo of a manager, the rings that turn the mesh around an axis, for
     * tuning its snapping and sensitivity; it exists only when rotation gizmos are enabled.
     * @param inputs - The gizmo manager
     * @returns The rotation gizmo
     * @group get
     * @shortname get rotation gizmo
     * @example
     * ```typescript
     * const rotationGizmo = bitbybit.babylon.gizmo.manager.getRotationGizmo({ gizmoManager: manager });
     * bitbybit.babylon.gizmo.rotationGizmo.snapDistance({ rotationGizmo, snapDistance: 0.2 });
     * ```
     */
    getRotationGizmo(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.IRotationGizmo {
        return inputs.gizmoManager.gizmos.rotationGizmo!;
    }

    /**
     * Reads the scale gizmo of a manager, the handles that stretch the mesh along an axis, for
     * tuning its snapping and sensitivity; it exists only when scale gizmos are enabled.
     * @param inputs - The gizmo manager
     * @returns The scale gizmo
     * @group get
     * @shortname get scale gizmo
     */
    getScaleGizmo(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.IScaleGizmo {
        return inputs.gizmoManager.gizmos.scaleGizmo!;
    }

    /**
     * Reads the bounding box gizmo of a manager, the frame with corner handles for scaling and
     * rotating, for tuning its handles and snapping; it exists only when bounding box gizmos are
     * enabled.
     * @param inputs - The gizmo manager
     * @returns The bounding box gizmo
     * @group get
     * @shortname get bounding box gizmo
     */
    getBoundingBoxGizmo(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.IBoundingBoxGizmo {
        return inputs.gizmoManager.gizmos.boundingBoxGizmo!;
    }

    /**
     * Shows the manager's enabled gizmos on a mesh so the user can manipulate it; any mesh attached
     * before is released.
     * @param inputs - The gizmo manager and the mesh
     * @returns The same gizmo manager
     * @group update
     * @shortname attach to mesh
     * @example
     * ```typescript
     * bitbybit.babylon.gizmo.manager.attachToMesh({ gizmoManager: manager, mesh });
     * ```
     */
    attachToMesh(inputs: Inputs.BabylonGizmo.AttachToMeshDto): BABYLON.GizmoManager {
        inputs.gizmoManager.attachToMesh(inputs.mesh);
        return inputs.gizmoManager;
    }

    /**
     * Hides the manager's gizmos by releasing the mesh they were attached to.
     * @param inputs - The gizmo manager
     * @returns The same gizmo manager
     * @group update
     * @shortname detach mesh
     * @example
     * ```typescript
     * bitbybit.babylon.gizmo.manager.detachMesh({ gizmoManager: manager });
     * ```
     */
    detachMesh(inputs: Inputs.BabylonGizmo.GizmoManagerDto): BABYLON.GizmoManager {
        inputs.gizmoManager.attachToMesh(null);
        return inputs.gizmoManager;
    }
}
