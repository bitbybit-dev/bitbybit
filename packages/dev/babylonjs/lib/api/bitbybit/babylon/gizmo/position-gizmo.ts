import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

/**
 * The position gizmo: three arrows that drag the attached mesh along X, Y or Z, plus optional
 * square handles that drag it within a plane. Snapping moves the mesh in fixed steps, and the axis
 * and plane parts can be reached one by one to enable or disable them.
 */
export class BabylonGizmoPositionGizmo {


    constructor(
        _context: Context,
    ) {
    }

    /**
     * Shows or hides the square handles of a position gizmo that drag the mesh within the XY, YZ
     * and XZ planes, in addition to the axis arrows.
     * @param inputs - The position gizmo and the flag
     * @returns The same position gizmo
     * @group set
     * @shortname set planar gizmo enabled
     * @example
     * ```typescript
     * bitbybit.babylon.gizmo.positionGizmo.planarGizmoEnabled({ positionGizmo, planarGizmoEnabled: true });
     * ```
     */
    planarGizmoEnabled(inputs: Inputs.BabylonGizmo.SetPlanarGizmoEnabled): BABYLON.IPositionGizmo {
        inputs.positionGizmo.planarGizmoEnabled = inputs.planarGizmoEnabled;
        return inputs.positionGizmo;
    }

    /**
     * Makes a position gizmo move the mesh in steps of `snapDistance` scene units instead of
     * smoothly; 0 turns snapping off.
     * @param inputs - The position gizmo and the step size
     * @returns The same position gizmo
     * @group set
     * @shortname set snap distance
     * @example
     * ```typescript
     * bitbybit.babylon.gizmo.positionGizmo.snapDistance({ positionGizmo, snapDistance: 0.5 });
     * ```
     */
    snapDistance(inputs: Inputs.BabylonGizmo.SetPositionGizmoSnapDistanceDto): BABYLON.IPositionGizmo {
        inputs.positionGizmo.snapDistance = inputs.snapDistance;
        return inputs.positionGizmo;
    }

    /**
     * Reads the mesh a position gizmo is currently attached to.
     * @param inputs - The position gizmo
     * @returns The attached mesh
     * @group get
     * @shortname get attached mesh
     */
    getAttachedMesh(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.AbstractMesh {
        return inputs.positionGizmo?.attachedMesh as BABYLON.AbstractMesh;
    }

    /**
     * Reads the node a position gizmo is currently attached to, which may be a transform node
     * rather than a mesh.
     * @param inputs - The position gizmo
     * @returns The attached node
     * @group get
     * @shortname get attached node
     */
    getAttachedNode(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.Node {
        return inputs.positionGizmo?.attachedNode as BABYLON.Node;
    }

    /**
     * Reads the arrow of a position gizmo that drags along X, to enable or disable it on its own.
     * @param inputs - The position gizmo
     * @returns The X axis drag gizmo
     * @group get
     * @shortname get x gizmo
     */
    getXGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IAxisDragGizmo {
        return inputs.positionGizmo?.xGizmo;
    }

    /**
     * Reads the arrow of a position gizmo that drags along Y, to enable or disable it on its own.
     * @param inputs - The position gizmo
     * @returns The Y axis drag gizmo
     * @group get
     * @shortname get y gizmo
     */
    getYGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IAxisDragGizmo {
        return inputs.positionGizmo?.yGizmo;
    }

    /**
     * Reads the arrow of a position gizmo that drags along Z, to enable or disable it on its own.
     * @param inputs - The position gizmo
     * @returns The Z axis drag gizmo
     * @group get
     * @shortname get z gizmo
     */
    getZGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IAxisDragGizmo {
        return inputs.positionGizmo?.zGizmo;
    }

    /**
     * Reads the handle of a position gizmo that drags within the plane facing X, the YZ plane, to
     * enable or disable it on its own.
     * @param inputs - The position gizmo
     * @returns The X plane drag gizmo
     * @group get
     * @shortname get x plane gizmo
     */
    getXPlaneGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IPlaneDragGizmo {
        return inputs.positionGizmo?.xPlaneGizmo;
    }

    /**
     * Reads the handle of a position gizmo that drags within the plane facing Y, the XZ plane, to
     * enable or disable it on its own.
     * @param inputs - The position gizmo
     * @returns The Y plane drag gizmo
     * @group get
     * @shortname get y plane gizmo
     */
    getYPlaneGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IPlaneDragGizmo {
        return inputs.positionGizmo?.yPlaneGizmo;
    }

    /**
     * Reads the handle of a position gizmo that drags within the plane facing Z, the XY plane, to
     * enable or disable it on its own.
     * @param inputs - The position gizmo
     * @returns The Z plane drag gizmo
     * @group get
     * @shortname get z plane gizmo
     */
    getZPlaneGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IPlaneDragGizmo {
        return inputs.positionGizmo?.zPlaneGizmo;
    }

    /**
     * Reads whether a position gizmo shows its plane handles.
     * @param inputs - The position gizmo
     * @returns True when the plane handles are shown
     * @group get
     * @shortname get planar gizmo enabled
     */
    getPlanarGizmoEnabled(inputs: Inputs.BabylonGizmo.PositionGizmoDto): boolean {
        return inputs.positionGizmo?.planarGizmoEnabled;
    }

    /**
     * Reads the step size a position gizmo snaps to, 0 meaning smooth movement.
     * @param inputs - The position gizmo
     * @returns The snap distance
     * @group get
     * @shortname get snap distance
     */
    getSnapDistance(inputs: Inputs.BabylonGizmo.PositionGizmoDto): number {
        return inputs.positionGizmo?.snapDistance;
    }

    /**
     * Tells whether the user is dragging a position gizmo right now.
     * @param inputs - The position gizmo
     * @returns True while a drag is in progress
     * @group get
     * @shortname get is dragging
     */
    getIsDragging(inputs: Inputs.BabylonGizmo.PositionGizmoDto): boolean {
        return inputs.positionGizmo?.isDragging;
    }

    /**
     * Passes through the name of a position gizmo event, drag start, drag or drag end, as a typed
     * selector for code that subscribes to gizmo events by name.
     * @param inputs - The event selector
     * @returns The same selector
     * @group create
     * @shortname position gizmo observable selector
     * @example
     * ```typescript
     * const selector = bitbybit.babylon.gizmo.positionGizmo.createPositionGizmoObservableSelector({ selector: Bit.Inputs.BabylonGizmo.positionGizmoObservableSelectorEnum.onDragEndObservable });
     * ```
     */
    createPositionGizmoObservableSelector(inputs: Inputs.BabylonGizmo.PositionGizmoObservableSelectorDto): Inputs.BabylonGizmo.positionGizmoObservableSelectorEnum {
        return inputs.selector;
    }
}
