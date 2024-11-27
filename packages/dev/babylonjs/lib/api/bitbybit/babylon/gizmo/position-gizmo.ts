import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGizmoPositionGizmo {


    constructor(
        private readonly context: Context,
    ) {
    }

    /**
     * Set planar gizmo enabled
     * @param inputs position gizmo
     * @group set
     * @shortname set planar gizmo enabled
     */
    planarGizmoEnabled(inputs: Inputs.BabylonGizmo.SetPlanarGizmoEnabled): BABYLON.IPositionGizmo {
        inputs.positionGizmo.planarGizmoEnabled = inputs.planarGizmoEnabled;
        return inputs.positionGizmo;
    }

    /**
     * Set position gizmo snap distance
     * @param inputs position gizmo
     * @group set
     * @shortname set snap distance
     */
    snapDistance(inputs: Inputs.BabylonGizmo.SetPositionGizmoSnapDistanceDto): BABYLON.IPositionGizmo {
        inputs.positionGizmo.snapDistance = inputs.snapDistance;
        return inputs.positionGizmo;
    }

    /**
    * Get attached mesh
    * @param inputs position gizmo
    * @returns attached mesh
    * @group get
    * @shortname get attached mesh
    */
    getAttachedMesh(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.AbstractMesh {
        return inputs.positionGizmo?.attachedMesh;
    }

    /**
    * Get attached node
    * @param inputs position gizmo
    * @returns attached node
    * @group get
    * @shortname get attached node
    */
    getAttachedNode(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.Node {
        return inputs.positionGizmo?.attachedNode;
    }

    /**
     * Get x gizmo
     * @param inputs position gizmo
     * @returns x drag gizmo
     * @group get
     * @shortname get x gizmo
     */
    getXGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IAxisDragGizmo {
        return inputs.positionGizmo?.xGizmo;
    }

    /**
     * Get y gizmo
     * @param inputs position gizmo
     * @returns y drag gizmo
     * @group get
     * @shortname get y gizmo
     */
    getYGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IAxisDragGizmo {
        return inputs.positionGizmo?.yGizmo;
    }

    /**
     * Get z gizmo
     * @param inputs position gizmo
     * @returns z drag gizmo
     * @group get
     * @shortname get z gizmo
     */
    getZGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IAxisDragGizmo {
        return inputs.positionGizmo?.zGizmo;
    }

    /**
     * Get x plane gizmo
     * @param inputs position gizmo
     * @group get
     * @shortname get x plane gizmo
     */
    getXPlaneGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IPlaneDragGizmo {
        return inputs.positionGizmo?.xPlaneGizmo;
    }

    /**
     * Get y plane gizmo
     * @param inputs position gizmo
     * @group get
     * @shortname get y plane gizmo
     */
    getYPlaneGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IPlaneDragGizmo {
        return inputs.positionGizmo?.yPlaneGizmo;
    }

    /**
     * Get z plane gizmo
     * @param inputs position gizmo
     * @group get
     * @shortname get z plane gizmo
     */
    getZPlaneGizmo(inputs: Inputs.BabylonGizmo.PositionGizmoDto): BABYLON.IPlaneDragGizmo {
        return inputs.positionGizmo?.zPlaneGizmo;
    }

    /**
     * Get if planar gizmo enabled
     * @param inputs position gizmo
     * @returns is enabled
     * @group get
     * @shortname get planar gizmo enabled
     */
    getPlanarGizmoEnabled(inputs: Inputs.BabylonGizmo.PositionGizmoDto): boolean {
        return inputs.positionGizmo?.planarGizmoEnabled;
    }

    /**
     * Get snap distance
     * @param inputs position gizmo
     * @returns snap distance
     * @group get
     * @shortname get snap distance
     */
    getSnapDistance(inputs: Inputs.BabylonGizmo.PositionGizmoDto): number {
        return inputs.positionGizmo?.snapDistance;
    }

    /**
     * Get if is dragging
     * @param inputs position gizmo
     * @returns is dragging
     * @group get
     * @shortname get is dragging
     */
    getIsDragging(inputs: Inputs.BabylonGizmo.PositionGizmoDto): boolean {
        return inputs.positionGizmo?.isDragging;
    }

    /**
    * Creates the selector of an observable for a position gizmo
    * @param inputs observable name
    * @returns position gizmo observable selector
    * @group create
    * @shortname position gizmo observable selector
    */
    createPositionGizmoObservableSelector(inputs: Inputs.BabylonGizmo.PositionGizmoObservableSelectorDto): Inputs.BabylonGizmo.positionGizmoObservableSelectorEnum {
        return inputs.selector;
    }
}
