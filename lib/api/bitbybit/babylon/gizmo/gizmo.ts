
import { Context } from "../../../context";
import { BabylonGizmoManager } from "./manager";
import { BabylonGizmoPositionGizmo } from "./position-gizmo";
import { BabylonGizmoAxisDragGizmo } from "./axis-drag-gizmo";
import { BabylonGizmoPlaneDragGizmo } from "./plane-drag-gizmo";
import { BabylonGizmoRotationGizmo } from "./rotation-gizmo";
import { BabylonGizmoScaleGizmo } from "./scale-gizmo";
import { BabylonGizmoAxisScaleGizmo } from "./axis-scale-gizmo";
import { BabylonGizmoBoundingBoxGizmo } from "./bounding-box-gizmo";
import { BabylonGizmoPlaneRotationGizmo } from "./plane-rotation-gizmo";

export class BabylonGizmo {
    manager: BabylonGizmoManager;
    positionGizmo: BabylonGizmoPositionGizmo;
    rotationGizmo: BabylonGizmoRotationGizmo;
    scaleGizmo: BabylonGizmoScaleGizmo;
    boundingBoxGizmo: BabylonGizmoBoundingBoxGizmo;
    axisDragGizmo: BabylonGizmoAxisDragGizmo;
    axisScaleGizmo: BabylonGizmoAxisScaleGizmo;
    planeDragGizmo: BabylonGizmoPlaneDragGizmo;
    planeRotationGizmo: BabylonGizmoPlaneRotationGizmo;
    
    constructor(private readonly context: Context) {
        this.manager = new BabylonGizmoManager(context);
        this.positionGizmo = new BabylonGizmoPositionGizmo(context);
        this.rotationGizmo = new BabylonGizmoRotationGizmo(context);
        this.scaleGizmo = new BabylonGizmoScaleGizmo(context);
        this.boundingBoxGizmo = new BabylonGizmoBoundingBoxGizmo(context);
        this.axisDragGizmo = new BabylonGizmoAxisDragGizmo(context);
        this.axisScaleGizmo = new BabylonGizmoAxisScaleGizmo(context);
        this.planeDragGizmo = new BabylonGizmoPlaneDragGizmo(context);
        this.planeRotationGizmo = new BabylonGizmoPlaneRotationGizmo(context);
    }
}
