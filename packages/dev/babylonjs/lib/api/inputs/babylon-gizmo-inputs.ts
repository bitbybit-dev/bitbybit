import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace BabylonGizmo {

    export enum positionGizmoObservableSelectorEnum {
        /** Fires an event when any of it's sub gizmos are dragged */
        onDragStartObservable = "onDragStartObservable",
        /** Fires an event when any of it's sub gizmos are being dragged */
        onDragObservable = "onDragObservable",
        /** Fires an event when any of it's sub gizmos are released from dragging */
        onDragEndObservable = "onDragEndObservable"
    }
    export enum rotationGizmoObservableSelectorEnum {
        /** Fires an event when any of it's sub gizmos are dragged */
        onDragStartObservable = "onDragStartObservable",
        /** Fires an event when any of it's sub gizmos are being dragged */
        onDragObservable = "onDragObservable",
        /** Fires an event when any of it's sub gizmos are released from dragging */
        onDragEndObservable = "onDragEndObservable"
    }
    export enum scaleGizmoObservableSelectorEnum {
        /** Fires an event when any of it's sub gizmos are dragged */
        onDragStartObservable = "onDragStartObservable",
        /** Fires an event when any of it's sub gizmos are being dragged */
        onDragObservable = "onDragObservable",
        /** Fires an event when any of it's sub gizmos are released from dragging */
        onDragEndObservable = "onDragEndObservable"
    }

    export enum boundingBoxGizmoObservableSelectorEnum {
        /**
         * Fired when a rotation anchor or scale box is dragged
         */
        onDragStartObservable = "onDragStartObservable",
        /**
         * Fired when a scale box is dragged
         */
        onScaleBoxDragObservable = "onScaleBoxDragObservable",
        /**
         * Fired when a scale box drag is ended
         */
        onScaleBoxDragEndObservable = "onScaleBoxDragEndObservable",
        /**
         * Fired when a rotation anchor is dragged
         */
        onRotationSphereDragObservable = "onRotationSphereDragObservable",
        /**
         * Fired when a rotation anchor drag is ended
         */
        onRotationSphereDragEndObservable = "onRotationSphereDragEndObservable"
    }
    export class CreateGizmoDto {
        constructor(positionGizmoEnabled?: boolean, rotationGizmoEnabled?: boolean, scaleGizmoEnabled?: boolean, boundingBoxGizmoEnabled?: boolean, attachableMeshes?: BABYLON.AbstractMesh[], clearGizmoOnEmptyPointerEvent?: boolean, scaleRatio?: number, usePointerToAttachGizmos?: boolean) {
            if (positionGizmoEnabled !== undefined) { this.positionGizmoEnabled = positionGizmoEnabled; }
            if (rotationGizmoEnabled !== undefined) { this.rotationGizmoEnabled = rotationGizmoEnabled; }
            if (scaleGizmoEnabled !== undefined) { this.scaleGizmoEnabled = scaleGizmoEnabled; }
            if (boundingBoxGizmoEnabled !== undefined) { this.boundingBoxGizmoEnabled = boundingBoxGizmoEnabled; }
            if (clearGizmoOnEmptyPointerEvent !== undefined) { this.clearGizmoOnEmptyPointerEvent = clearGizmoOnEmptyPointerEvent; }
            if (scaleRatio !== undefined) { this.scaleRatio = scaleRatio; }
            if (usePointerToAttachGizmos !== undefined) { this.usePointerToAttachGizmos = usePointerToAttachGizmos; }
            if (attachableMeshes !== undefined) { this.attachableMeshes = attachableMeshes; }
        }
        /**
         * Enable position gizmo
         * @default true
         */
        positionGizmoEnabled: boolean;
        /**
         * Enable rotation gizmo
         * @default false
         */
        rotationGizmoEnabled: boolean;
        /**
         * Enable scale gizmo
         * @default false
         */
        scaleGizmoEnabled: boolean;
        /**
         * Enable bounding box gizmo
         * @default false
         */
        boundingBoxGizmoEnabled: boolean;
        /**
         * Use pointer to attach gizmos
         * @default true
         */
        usePointerToAttachGizmos = true;
        /**
         * Clear gizmo on empty pointer event
         * @default false
         */
        clearGizmoOnEmptyPointerEvent = false;
        /**
         * Scale ratio
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scaleRatio = 1;
        /**
         * Attachable meshes
         * @default undefined
         */
        attachableMeshes: BABYLON.AbstractMesh[];
    }
    export class GizmoDto {
        constructor(gizmo?: BABYLON.IGizmo) {
            if (gizmo !== undefined) { this.gizmo = gizmo; }
        }
        /**
         * Gizmo to use
         * @default undefined
         */
        gizmo: BABYLON.IGizmo;
    }
    export class SetGizmoScaleRatioDto {
        constructor(gizmo?: BABYLON.IGizmo, scaleRatio?: number) {
            if (gizmo !== undefined) { this.gizmo = gizmo; }
            if (scaleRatio !== undefined) { this.scaleRatio = scaleRatio; }
        }
        /**
         * gizmo
         * @default undefined
         */
        gizmo: BABYLON.IGizmo;
        /**
         * Scale ratio
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scaleRatio = 1;
    }
    export class GizmoManagerDto {
        constructor(gizmoManager?: BABYLON.GizmoManager) {
            if (gizmoManager !== undefined) { this.gizmoManager = gizmoManager; }
        }
        /**
         * Gizmo manager to use
         * @default undefined
         */
        gizmoManager: BABYLON.GizmoManager;
    }

    export class PositionGizmoDto {
        constructor(gizmoManager?: BABYLON.IPositionGizmo) {
            if (gizmoManager !== undefined) { this.positionGizmo = gizmoManager; }
        }
        /**
         * Gizmo manager to use
         * @default undefined
         */
        positionGizmo: BABYLON.IPositionGizmo;
    }
    export class SetPlanarGizmoEnabled {
        constructor(positionGizmo?: BABYLON.IPositionGizmo, planarGizmoEnabled?: boolean) {
            if (positionGizmo !== undefined) { this.positionGizmo = positionGizmo; }
            if (planarGizmoEnabled !== undefined) { this.planarGizmoEnabled = planarGizmoEnabled; }
        }
        /**
         * Position gizmo
         * @default undefined
         */
        positionGizmo: BABYLON.IPositionGizmo;
        /**
         * Planar gizmo enabled
         * @default true
         */
        planarGizmoEnabled = true;
    }
    export class SetScaleGizmoSnapDistanceDto {
        constructor(scaleGizmo?: BABYLON.IScaleGizmo, snapDistance?: number) {
            if (scaleGizmo !== undefined) { this.scaleGizmo = scaleGizmo; }
            if (snapDistance !== undefined) { this.snapDistance = snapDistance; }
        }
        /**
         * Scale gizmo
         * @default undefined
         */
        scaleGizmo: BABYLON.IScaleGizmo;
        /**
         * Snap distance
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        snapDistance = 0;
    }
    export class SetScaleGizmoIncrementalSnapDto {
        constructor(scaleGizmo?: BABYLON.IScaleGizmo, incrementalSnap?: boolean) {
            if (scaleGizmo !== undefined) { this.scaleGizmo = scaleGizmo; }
            if (incrementalSnap !== undefined) { this.incrementalSnap = incrementalSnap; }
        }
        /**
         * Scale gizmo
         * @default undefined
         */
        scaleGizmo: BABYLON.IScaleGizmo;
        /**
         * Incremental snap
         * @default false
         */
        incrementalSnap = false;
    }
    export class SetScaleGizmoSensitivityDto {
        constructor(scaleGizmo?: BABYLON.IScaleGizmo, sensitivity?: number) {
            if (scaleGizmo !== undefined) { this.scaleGizmo = scaleGizmo; }
            if (sensitivity !== undefined) { this.sensitivity = sensitivity; }
        }
        /**
         * Scale gizmo
         * @default undefined
         */
        scaleGizmo: BABYLON.IScaleGizmo;
        /**
         * Sensitivity
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sensitivity = 1;
    }
    export class ScaleGizmoDto {
        constructor(scaleGizmo?: BABYLON.IScaleGizmo) {
            if (scaleGizmo !== undefined) { this.scaleGizmo = scaleGizmo; }
        }
        /**
         * Scale gizmo
         * @default undefined
         */
        scaleGizmo: BABYLON.IScaleGizmo;
    }
    export class BoundingBoxGizmoDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
        }
        /**
         * Bounding box gizmo
         * @default undefined
         */
        boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
    }
    export class SetBoundingBoxGizmoRotationSphereSizeDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, rotationSphereSize?: number) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (rotationSphereSize !== undefined) { this.rotationSphereSize = rotationSphereSize; }
        }
        /**
         * Bounding box gizmo
         * @default undefined
         */
        boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
        /**
         * The size of the rotation anchors attached to the bounding box (Default: 0.1)
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        rotationSphereSize = 0.1;
    }
    export class SetBoundingBoxGizmoFixedDragMeshScreenSizeDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, fixedDragMeshScreenSize?: boolean) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (fixedDragMeshScreenSize !== undefined) { this.fixedDragMeshScreenSize = fixedDragMeshScreenSize; }
        }
        /**
         * Bounding box gizmo
         * @default undefined
         */
        boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
        /**
         * fiex drag mesh screen size
         * @default false
         */
        fixedDragMeshScreenSize = false;
    }
    export class SetBoundingBoxGizmoFixedDragMeshBoundsSizeDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, fixedDragMeshBoundsSize?: boolean) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (fixedDragMeshBoundsSize !== undefined) { this.fixedDragMeshBoundsSize = fixedDragMeshBoundsSize; }
        }
        /**
         * Bounding box gizmo
         * @default undefined
         */
        boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
        /**
         * fixed drag mesh bounds size
         * @default false
         */
        fixedDragMeshBoundsSize = false;
    }
    export class SetBoundingBoxGizmoFixedDragMeshScreenSizeDistanceFactorDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, fixedDragMeshScreenSizeDistanceFactor?: number) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (fixedDragMeshScreenSizeDistanceFactor !== undefined) { this.fixedDragMeshScreenSizeDistanceFactor = fixedDragMeshScreenSizeDistanceFactor; }
        }
        /**
         * Bounding box gizmo
         * @default undefined
         */
        boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
        /**
         * fixed drag mesh screen size distance factor
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        fixedDragMeshScreenSizeDistanceFactor = 10;
    }
    export class SetBoundingBoxGizmoScalingSnapDistanceDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, scalingSnapDistance?: number) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (scalingSnapDistance !== undefined) { this.scalingSnapDistance = scalingSnapDistance; }
        }
        /**
         * Bounding box gizmo
         * @default undefined
         */
        boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
        /**
         * Scaling snap distance
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scalingSnapDistance = 0;
    }
    export class SetBoundingBoxGizmoRotationSnapDistanceDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, rotationSnapDistance?: number) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (rotationSnapDistance !== undefined) { this.rotationSnapDistance = rotationSnapDistance; }
        }
        /**
         * Bounding box gizmo
         * @default undefined
         */
        boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
        /**
         * Rotation snap distance
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        rotationSnapDistance = 0;
    }
    export class SetBoundingBoxGizmoScaleBoxSizeDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, scaleBoxSize?: number) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (scaleBoxSize !== undefined) { this.scaleBoxSize = scaleBoxSize; }
        }
        /**
         * Bounding box gizmo
         * @default undefined
         */
        boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
        /**
         * The size of the scale boxes attached to the bounding box (Default: 0.1)
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scaleBoxSize = 0.1;
    }
    export class SetBoundingBoxGizmoIncrementalSnapDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, incrementalSnap?: boolean) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (incrementalSnap !== undefined) { this.incrementalSnap = incrementalSnap; }
        }
        /**
         * Bounding box gizmo
         * @default undefined
         */
        boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
        /**
         * Incremental snap
         * @default false
         */
        incrementalSnap = false;
    }
    export class SetBoundingBoxGizmoScalePivotDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, scalePivot?: Base.Vector3) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (scalePivot !== undefined) { this.scalePivot = scalePivot; }
        }
        /**
         * Bounding box gizmo
         * @default undefined
         */
        boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
        /**
         * Scale pivot
         * @default undefined
         */
        scalePivot: Base.Vector3;
    }
    export class SetBoundingBoxGizmoAxisFactorDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, axisFactor?: Base.Vector3) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (axisFactor !== undefined) { this.axisFactor = axisFactor; }
        }
        /**
         * Bounding box gizmo
         * @default undefined
         */
        boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
        /**
         * Axis factor
         * @default undefined
         */
        axisFactor: Base.Vector3;
    }
    export class SetBoundingBoxGizmoScaleDragSpeedDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, scaleDragSpeed?: number) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (scaleDragSpeed !== undefined) { this.scaleDragSpeed = scaleDragSpeed; }
        }
        /**
         * Bounding box gizmo
         * @default undefined
         */
        boundingBoxGizmo: BABYLON.BoundingBoxGizmo;
        /**
         * Scale drag speed
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scaleDragSpeed = 1;
    }
    export class SetPositionGizmoSnapDistanceDto {
        constructor(positionGizmo?: BABYLON.IPositionGizmo, snapDistance?: number) {
            if (positionGizmo !== undefined) { this.positionGizmo = positionGizmo; }
            if (snapDistance !== undefined) { this.snapDistance = snapDistance; }
        }
        /**
         * Position gizmo
         * @default undefined
         */
        positionGizmo: BABYLON.IPositionGizmo;
        /**
         * Snap distance
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        snapDistance = 0;
    }
    export class SetRotationGizmoSnapDistanceDto {
        constructor(rotationGizmo?: BABYLON.IRotationGizmo, snapDistance?: number) {
            if (rotationGizmo !== undefined) { this.rotationGizmo = rotationGizmo; }
            if (snapDistance !== undefined) { this.snapDistance = snapDistance; }
        }
        /**
         * Position gizmo
         * @default undefined
         */
        rotationGizmo: BABYLON.IRotationGizmo;
        /**
         * Snap distance
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        snapDistance = 0;
    }
    export class SetRotationGizmoSensitivityDto {
        constructor(rotationGizmo?: BABYLON.IRotationGizmo, sensitivity?: number) {
            if (rotationGizmo !== undefined) { this.rotationGizmo = rotationGizmo; }
            if (sensitivity !== undefined) { this.sensitivity = sensitivity; }
        }
        /**
         * Position gizmo
         * @default undefined
         */
        rotationGizmo: BABYLON.IRotationGizmo;
        /**
         * Sensitivity
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sensitivity = 1;
    }
    export class RotationGizmoDto {
        constructor(rotationGizmo?: BABYLON.IRotationGizmo) {
            if (rotationGizmo !== undefined) { this.rotationGizmo = rotationGizmo; }
        }
        /**
         * Rotation gizmo
         * @default undefined
         */
        rotationGizmo: BABYLON.IRotationGizmo;
    }
    export class AxisScaleGizmoDto {
        constructor(axisScaleGizmo?: BABYLON.IAxisScaleGizmo) {
            if (axisScaleGizmo !== undefined) { this.axisScaleGizmo = axisScaleGizmo; }
        }
        /**
         * axis scale gizmo
         * @default undefined
         */
        axisScaleGizmo: BABYLON.IAxisScaleGizmo;
    }
    export class SetIsEnabledAxisScaleGizmoDto {
        constructor(gizmoManager?: BABYLON.IAxisScaleGizmo, isEnabled?: boolean) {
            if (gizmoManager !== undefined) { this.axisScaleGizmo = gizmoManager; }
            if (isEnabled !== undefined) { this.isEnabled = isEnabled; }
        }
        /**
         * axis scale gizmo
         * @default undefined
         */
        axisScaleGizmo: BABYLON.IAxisScaleGizmo;
        /**
         * Is enabled
         * @default true
         */
        isEnabled = true;
    }

    export class AxisDragGizmoDto {
        constructor(axisDragGizmo?: BABYLON.IAxisDragGizmo) {
            if (axisDragGizmo !== undefined) { this.axisDragGizmo = axisDragGizmo; }
        }
        /**
         * axis drag gizmo
         * @default undefined
         */
        axisDragGizmo: BABYLON.IAxisDragGizmo;
    }
    export class SetIsEnabledAxisDragGizmoDto {
        constructor(gizmoManager?: BABYLON.IAxisDragGizmo, isEnabled?: boolean) {
            if (gizmoManager !== undefined) { this.axisDragGizmo = gizmoManager; }
            if (isEnabled !== undefined) { this.isEnabled = isEnabled; }
        }
        /**
         * axis drag gizmo
         * @default undefined
         */
        axisDragGizmo: BABYLON.IAxisDragGizmo;
        /**
         * Is enabled
         * @default true
         */
        isEnabled = true;
    }
    export class SetIsEnabledPlaneRotationGizmoDto {
        constructor(planeRotationGizmo?: BABYLON.IPlaneRotationGizmo, isEnabled?: boolean) {
            if (planeRotationGizmo !== undefined) { this.planeRotationGizmo = planeRotationGizmo; }
            if (isEnabled !== undefined) { this.isEnabled = isEnabled; }
        }
        /**
         * plane drag gizmo
         * @default undefined
         */
        planeRotationGizmo: BABYLON.IPlaneRotationGizmo;
        /**
         * Is enabled
         * @default true
         */
        isEnabled = true;
    }
    export class SetIsEnabledPlaneDragGizmoDto {
        constructor(planeDragGizmo?: BABYLON.IPlaneDragGizmo, isEnabled?: boolean) {
            if (planeDragGizmo !== undefined) { this.planeDragGizmo = planeDragGizmo; }
            if (isEnabled !== undefined) { this.isEnabled = isEnabled; }
        }
        /**
         * plane drag gizmo
         * @default undefined
         */
        planeDragGizmo: BABYLON.IPlaneDragGizmo;
        /**
         * Is enabled
         * @default true
         */
        isEnabled = true;
    }
    export class PlaneDragGizmoDto {
        constructor(planeDragGizmo?: BABYLON.IPlaneDragGizmo) {
            if (planeDragGizmo !== undefined) { this.planeDragGizmo = planeDragGizmo; }
        }
        /**
         * plane drag gizmo
         * @default undefined
         */
        planeDragGizmo: BABYLON.IPlaneDragGizmo;
    }
    export class PlaneRotationGizmoDto {
        constructor(planeRotationGizmo?: BABYLON.IPlaneRotationGizmo) {
            if (planeRotationGizmo !== undefined) { this.planeRotationGizmo = planeRotationGizmo; }
        }
        /**
         * plane drag gizmo
         * @default undefined
         */
        planeRotationGizmo: BABYLON.IPlaneRotationGizmo;
    }
    export class AttachToMeshDto {
        constructor(mesh: BABYLON.AbstractMesh, gizmoManager: BABYLON.GizmoManager) {
            this.mesh = mesh;
            this.gizmoManager = gizmoManager;
        }
        /**
         * Mesh to attach gizmo manager to
         */
        mesh: BABYLON.AbstractMesh;
        /**
         * Gizmo manager to attach
         */
        gizmoManager: BABYLON.GizmoManager;
    }

    export class PositionGizmoObservableSelectorDto {
        constructor(selector: positionGizmoObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Selector
         */
        selector: positionGizmoObservableSelectorEnum;
    }
    export class BoundingBoxGizmoObservableSelectorDto {
        constructor(selector: boundingBoxGizmoObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Selector
         */
        selector: boundingBoxGizmoObservableSelectorEnum;
    }
    export class RotationGizmoObservableSelectorDto {
        constructor(selector: rotationGizmoObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Selector
         */
        selector: rotationGizmoObservableSelectorEnum;
    }

    export class ScaleGizmoObservableSelectorDto {
        constructor(selector: scaleGizmoObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Selector
         */
        selector: scaleGizmoObservableSelectorEnum;
    }
}
