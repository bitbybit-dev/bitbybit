import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Parameters for the on-screen manipulators that let a user drag, rotate and scale an object directly:
 * which axes are enabled, snapping increments, size and color.
 */
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
    /**
     * Feeds `babylon.gizmo.manager.createGizmoManager`: which gizmos to enable, which meshes they
     * may attach to, how the pointer attaches them and how large they are drawn.
     */
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
         * When true, the arrows that drag the mesh along an axis are shown
         * @default true
         */
        positionGizmoEnabled: boolean = true;
        /**
         * When true, the rings that turn the mesh around an axis are shown
         * @default false
         */
        rotationGizmoEnabled: boolean = false;
        /**
         * When true, the handles that stretch the mesh along an axis are shown
         * @default false
         */
        scaleGizmoEnabled: boolean = false;
        /**
         * When true, the frame with scale and rotate handles around the mesh is shown
         * @default false
         */
        boundingBoxGizmoEnabled: boolean = false;
        /**
         * When true, clicking a mesh attaches the gizmos to it; when false, attach them with
         * `attachToMesh`
         * @default true
         */
        usePointerToAttachGizmos = true;
        /**
         * When true, clicking into empty space detaches the gizmos
         * @default false
         */
        clearGizmoOnEmptyPointerEvent = false;
        /**
         * How large the gizmo handles are drawn; 1 is the default size and 2 doubles it
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scaleRatio = 1;
        /**
         * The only meshes the pointer may attach the gizmos to; left out or empty, any mesh
         * qualifies
         * @default undefined
         */
        attachableMeshes!: BABYLON.AbstractMesh[];
    }
    /**
     * Feeds `babylon.gizmo.base.getScaleRatio` with the one gizmo to read from, of any kind.
     */
    export class GizmoDto {
        constructor(gizmo?: BABYLON.IGizmo) {
            if (gizmo !== undefined) { this.gizmo = gizmo; }
        }
        /**
         * The gizmo to read from, of any kind
         * @default undefined
         */
        gizmo!: BABYLON.IGizmo;
    }
    /**
     * Feeds `babylon.gizmo.base.scaleRatio` with a gizmo and how large its handles are drawn.
     */
    export class SetGizmoScaleRatioDto {
        constructor(gizmo?: BABYLON.IGizmo, scaleRatio?: number) {
            if (gizmo !== undefined) { this.gizmo = gizmo; }
            if (scaleRatio !== undefined) { this.scaleRatio = scaleRatio; }
        }
        /**
         * The gizmo to change, of any kind
         * @default undefined
         */
        gizmo!: BABYLON.IGizmo;
        /**
         * How large the handles are drawn; 1 is the default size and 2 doubles it
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scaleRatio = 1;
    }
    /**
     * Feeds the `babylon.gizmo.manager` methods that take just the manager: the gizmo getters and
     * `detachMesh`.
     */
    export class GizmoManagerDto {
        constructor(gizmoManager?: BABYLON.GizmoManager) {
            if (gizmoManager !== undefined) { this.gizmoManager = gizmoManager; }
        }
        /**
         * The gizmo manager, as `createGizmoManager` gave it
         * @default undefined
         */
        gizmoManager!: BABYLON.GizmoManager;
    }

    /**
     * Feeds the `babylon.gizmo.positionGizmo` getters with the position gizmo to read from.
     */
    export class PositionGizmoDto {
        constructor(gizmoManager?: BABYLON.IPositionGizmo) {
            if (gizmoManager !== undefined) { this.positionGizmo = gizmoManager; }
        }
        /**
         * The position gizmo, as `gizmo.manager.getPositionGizmo` reads it
         * @default undefined
         */
        positionGizmo!: BABYLON.IPositionGizmo;
    }
    /**
     * Feeds `babylon.gizmo.positionGizmo.planarGizmoEnabled` with a position gizmo and whether its
     * plane handles show.
     */
    export class SetPlanarGizmoEnabled {
        constructor(positionGizmo?: BABYLON.IPositionGizmo, planarGizmoEnabled?: boolean) {
            if (positionGizmo !== undefined) { this.positionGizmo = positionGizmo; }
            if (planarGizmoEnabled !== undefined) { this.planarGizmoEnabled = planarGizmoEnabled; }
        }
        /**
         * The position gizmo, as `gizmo.manager.getPositionGizmo` reads it
         * @default undefined
         */
        positionGizmo!: BABYLON.IPositionGizmo;
        /**
         * When true, the square handles that drag within a plane are shown next to the axis arrows
         * @default true
         */
        planarGizmoEnabled = true;
    }
    /**
     * Feeds `babylon.gizmo.scaleGizmo.snapDistance` with a scale gizmo and the step it scales in.
     */
    export class SetScaleGizmoSnapDistanceDto {
        constructor(scaleGizmo?: BABYLON.IScaleGizmo, snapDistance?: number) {
            if (scaleGizmo !== undefined) { this.scaleGizmo = scaleGizmo; }
            if (snapDistance !== undefined) { this.snapDistance = snapDistance; }
        }
        /**
         * The scale gizmo, as `gizmo.manager.getScaleGizmo` reads it
         * @default undefined
         */
        scaleGizmo!: BABYLON.IScaleGizmo;
        /**
         * The step the scale changes in while dragged; 0 scales smoothly
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        snapDistance = 0;
    }
    /**
     * Feeds `babylon.gizmo.scaleGizmo.setIncrementalSnap` with a scale gizmo and how its snapping
     * steps combine.
     */
    export class SetScaleGizmoIncrementalSnapDto {
        constructor(scaleGizmo?: BABYLON.IScaleGizmo, incrementalSnap?: boolean) {
            if (scaleGizmo !== undefined) { this.scaleGizmo = scaleGizmo; }
            if (incrementalSnap !== undefined) { this.incrementalSnap = incrementalSnap; }
        }
        /**
         * The scale gizmo, as `gizmo.manager.getScaleGizmo` reads it
         * @default undefined
         */
        scaleGizmo!: BABYLON.IScaleGizmo;
        /**
         * When true, the steps add up, 1.1 then 1.2; when false, they multiply, 1.1 then 1.21
         * @default false
         */
        incrementalSnap = false;
    }
    /**
     * Feeds `babylon.gizmo.scaleGizmo.sensitivity` with a scale gizmo and how much a drag scales
     * the mesh.
     */
    export class SetScaleGizmoSensitivityDto {
        constructor(scaleGizmo?: BABYLON.IScaleGizmo, sensitivity?: number) {
            if (scaleGizmo !== undefined) { this.scaleGizmo = scaleGizmo; }
            if (sensitivity !== undefined) { this.sensitivity = sensitivity; }
        }
        /**
         * The scale gizmo, as `gizmo.manager.getScaleGizmo` reads it
         * @default undefined
         */
        scaleGizmo!: BABYLON.IScaleGizmo;
        /**
         * How much the scale changes for a given drag; 1 is the default and higher is faster
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sensitivity = 1;
    }
    /**
     * Feeds the `babylon.gizmo.scaleGizmo` getters with the scale gizmo to read from.
     */
    export class ScaleGizmoDto {
        constructor(scaleGizmo?: BABYLON.IScaleGizmo) {
            if (scaleGizmo !== undefined) { this.scaleGizmo = scaleGizmo; }
        }
        /**
         * The scale gizmo, as `gizmo.manager.getScaleGizmo` reads it
         * @default undefined
         */
        scaleGizmo!: BABYLON.IScaleGizmo;
    }
    /**
     * Feeds the `babylon.gizmo.boundingBoxGizmo` getters with the bounding box gizmo to read from.
     */
    export class BoundingBoxGizmoDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
        }
        /**
         * The bounding box gizmo, as `gizmo.manager.getBoundingBoxGizmo` reads it
         * @default undefined
         */
        boundingBoxGizmo!: BABYLON.BoundingBoxGizmo;
    }
    /**
     * Feeds `babylon.gizmo.boundingBoxGizmo.setRotationSphereSize` with a bounding box gizmo and
     * the size of its rotation handles.
     */
    export class SetBoundingBoxGizmoRotationSphereSizeDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, rotationSphereSize?: number) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (rotationSphereSize !== undefined) { this.rotationSphereSize = rotationSphereSize; }
        }
        /**
         * The bounding box gizmo, as `gizmo.manager.getBoundingBoxGizmo` reads it
         * @default undefined
         */
        boundingBoxGizmo!: BABYLON.BoundingBoxGizmo;
        /**
         * Size of the round rotation handles on the edges, in scene units unless a fixed screen
         * size is on
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        rotationSphereSize = 0.1;
    }
    /**
     * Feeds `babylon.gizmo.boundingBoxGizmo.setFixedDragMeshScreenSize` with a bounding box gizmo
     * and whether its handles keep a constant screen size.
     */
    export class SetBoundingBoxGizmoFixedDragMeshScreenSizeDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, fixedDragMeshScreenSize?: boolean) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (fixedDragMeshScreenSize !== undefined) { this.fixedDragMeshScreenSize = fixedDragMeshScreenSize; }
        }
        /**
         * The bounding box gizmo, as `gizmo.manager.getBoundingBoxGizmo` reads it
         * @default undefined
         */
        boundingBoxGizmo!: BABYLON.BoundingBoxGizmo;
        /**
         * When true, the handles keep the same size on screen whatever the camera distance; it wins
         * over the bounds size option
         * @default false
         */
        fixedDragMeshScreenSize = false;
    }
    /**
     * Feeds `babylon.gizmo.boundingBoxGizmo.setFixedDragMeshBoundsSize` with a bounding box gizmo
     * and whether its handles scale with the mesh bounds.
     */
    export class SetBoundingBoxGizmoFixedDragMeshBoundsSizeDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, fixedDragMeshBoundsSize?: boolean) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (fixedDragMeshBoundsSize !== undefined) { this.fixedDragMeshBoundsSize = fixedDragMeshBoundsSize; }
        }
        /**
         * The bounding box gizmo, as `gizmo.manager.getBoundingBoxGizmo` reads it
         * @default undefined
         */
        boundingBoxGizmo!: BABYLON.BoundingBoxGizmo;
        /**
         * When true, the handles are sized relative to the bounds of the attached mesh rather than
         * a fixed world size
         * @default false
         */
        fixedDragMeshBoundsSize = false;
    }
    /**
     * Feeds `babylon.gizmo.boundingBoxGizmo.setFixedDragMeshScreenSizeDistanceFactor` with a
     * bounding box gizmo and the camera distance its handles are sized for.
     */
    export class SetBoundingBoxGizmoFixedDragMeshScreenSizeDistanceFactorDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, fixedDragMeshScreenSizeDistanceFactor?: number) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (fixedDragMeshScreenSizeDistanceFactor !== undefined) { this.fixedDragMeshScreenSizeDistanceFactor = fixedDragMeshScreenSizeDistanceFactor; }
        }
        /**
         * The bounding box gizmo, as `gizmo.manager.getBoundingBoxGizmo` reads it
         * @default undefined
         */
        boundingBoxGizmo!: BABYLON.BoundingBoxGizmo;
        /**
         * The camera distance at which the handles appear at their world size when the fixed screen
         * size is on
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        fixedDragMeshScreenSizeDistanceFactor = 10;
    }
    /**
     * Feeds `babylon.gizmo.boundingBoxGizmo.setScalingSnapDistance` with a bounding box gizmo and
     * the drag step it scales in.
     */
    export class SetBoundingBoxGizmoScalingSnapDistanceDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, scalingSnapDistance?: number) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (scalingSnapDistance !== undefined) { this.scalingSnapDistance = scalingSnapDistance; }
        }
        /**
         * The bounding box gizmo, as `gizmo.manager.getBoundingBoxGizmo` reads it
         * @default undefined
         */
        boundingBoxGizmo!: BABYLON.BoundingBoxGizmo;
        /**
         * The drag distance in scene units between scale steps; 0 scales smoothly
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scalingSnapDistance = 0;
    }
    /**
     * Feeds `babylon.gizmo.boundingBoxGizmo.setRotationSnapDistance` with a bounding box gizmo and
     * the angle step it rotates in.
     */
    export class SetBoundingBoxGizmoRotationSnapDistanceDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, rotationSnapDistance?: number) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (rotationSnapDistance !== undefined) { this.rotationSnapDistance = rotationSnapDistance; }
        }
        /**
         * The bounding box gizmo, as `gizmo.manager.getBoundingBoxGizmo` reads it
         * @default undefined
         */
        boundingBoxGizmo!: BABYLON.BoundingBoxGizmo;
        /**
         * The step in radians the mesh turns in while dragged; 0 turns it smoothly
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        rotationSnapDistance = 0;
    }
    /**
     * Feeds `babylon.gizmo.boundingBoxGizmo.setScaleBoxSize` with a bounding box gizmo and the size
     * of its scale handles.
     */
    export class SetBoundingBoxGizmoScaleBoxSizeDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, scaleBoxSize?: number) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (scaleBoxSize !== undefined) { this.scaleBoxSize = scaleBoxSize; }
        }
        /**
         * The bounding box gizmo, as `gizmo.manager.getBoundingBoxGizmo` reads it
         * @default undefined
         */
        boundingBoxGizmo!: BABYLON.BoundingBoxGizmo;
        /**
         * Size of the square scale handles on the corners, in scene units unless a fixed screen
         * size is on
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scaleBoxSize = 0.1;
    }
    /**
     * Feeds `babylon.gizmo.boundingBoxGizmo.setIncrementalSnap` with a bounding box gizmo and how
     * its scale snapping steps combine.
     */
    export class SetBoundingBoxGizmoIncrementalSnapDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, incrementalSnap?: boolean) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (incrementalSnap !== undefined) { this.incrementalSnap = incrementalSnap; }
        }
        /**
         * The bounding box gizmo, as `gizmo.manager.getBoundingBoxGizmo` reads it
         * @default undefined
         */
        boundingBoxGizmo!: BABYLON.BoundingBoxGizmo;
        /**
         * When true, the steps add up, 1.1 then 1.2; when false, they multiply, 1.1 then 1.21
         * @default false
         */
        incrementalSnap = false;
    }
    /**
     * Feeds `babylon.gizmo.boundingBoxGizmo.setScalePivot` with a bounding box gizmo and the point
     * it scales the mesh around.
     */
    export class SetBoundingBoxGizmoScalePivotDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, scalePivot?: Base.Vector3) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (scalePivot !== undefined) { this.scalePivot = scalePivot; }
        }
        /**
         * The bounding box gizmo, as `gizmo.manager.getBoundingBoxGizmo` reads it
         * @default undefined
         */
        boundingBoxGizmo!: BABYLON.BoundingBoxGizmo;
        /**
         * The pivot as fractions of the bounds: `[0.5, 0.5, 0.5]` the center, `[0.5, 0, 0.5]` the
         * bottom; unset, the opposite corner
         * @default undefined
         */
        scalePivot!: Base.Vector3;
    }
    /**
     * Feeds `babylon.gizmo.boundingBoxGizmo.setAxisFactor` with a bounding box gizmo and a drag
     * sensitivity per axis.
     */
    export class SetBoundingBoxGizmoAxisFactorDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, axisFactor?: Base.Vector3) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (axisFactor !== undefined) { this.axisFactor = axisFactor; }
        }
        /**
         * The bounding box gizmo, as `gizmo.manager.getBoundingBoxGizmo` reads it
         * @default undefined
         */
        boundingBoxGizmo!: BABYLON.BoundingBoxGizmo;
        /**
         * A factor per axis as `[x, y, z]` that scales how fast dragging changes that axis; 1 is
         * normal
         * @default undefined
         */
        axisFactor!: Base.Vector3;
    }
    /**
     * Feeds `babylon.gizmo.boundingBoxGizmo.setScaleDragSpeed` with a bounding box gizmo and how
     * fast a drag scales the mesh.
     */
    export class SetBoundingBoxGizmoScaleDragSpeedDto {
        constructor(boundingBoxGizmo?: BABYLON.BoundingBoxGizmo, scaleDragSpeed?: number) {
            if (boundingBoxGizmo !== undefined) { this.boundingBoxGizmo = boundingBoxGizmo; }
            if (scaleDragSpeed !== undefined) { this.scaleDragSpeed = scaleDragSpeed; }
        }
        /**
         * The bounding box gizmo, as `gizmo.manager.getBoundingBoxGizmo` reads it
         * @default undefined
         */
        boundingBoxGizmo!: BABYLON.BoundingBoxGizmo;
        /**
         * How fast the scale changes for a given drag; 1 is the default and higher is faster
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scaleDragSpeed = 1;
    }
    /**
     * Feeds `babylon.gizmo.positionGizmo.snapDistance` with a position gizmo and the step it moves
     * the mesh in.
     */
    export class SetPositionGizmoSnapDistanceDto {
        constructor(positionGizmo?: BABYLON.IPositionGizmo, snapDistance?: number) {
            if (positionGizmo !== undefined) { this.positionGizmo = positionGizmo; }
            if (snapDistance !== undefined) { this.snapDistance = snapDistance; }
        }
        /**
         * The position gizmo, as `gizmo.manager.getPositionGizmo` reads it
         * @default undefined
         */
        positionGizmo!: BABYLON.IPositionGizmo;
        /**
         * The step in scene units the mesh moves in while dragged; 0 moves it smoothly
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        snapDistance = 0;
    }
    /**
     * Feeds `babylon.gizmo.rotationGizmo.snapDistance` with a rotation gizmo and the angle step it
     * turns in.
     */
    export class SetRotationGizmoSnapDistanceDto {
        constructor(rotationGizmo?: BABYLON.IRotationGizmo, snapDistance?: number) {
            if (rotationGizmo !== undefined) { this.rotationGizmo = rotationGizmo; }
            if (snapDistance !== undefined) { this.snapDistance = snapDistance; }
        }
        /**
         * The rotation gizmo, as `gizmo.manager.getRotationGizmo` reads it
         * @default undefined
         */
        rotationGizmo!: BABYLON.IRotationGizmo;
        /**
         * The step in radians the mesh turns in while dragged; 0 turns it smoothly
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        snapDistance = 0;
    }
    /**
     * Feeds `babylon.gizmo.rotationGizmo.sensitivity` with a rotation gizmo and how far a drag
     * turns the mesh.
     */
    export class SetRotationGizmoSensitivityDto {
        constructor(rotationGizmo?: BABYLON.IRotationGizmo, sensitivity?: number) {
            if (rotationGizmo !== undefined) { this.rotationGizmo = rotationGizmo; }
            if (sensitivity !== undefined) { this.sensitivity = sensitivity; }
        }
        /**
         * The rotation gizmo, as `gizmo.manager.getRotationGizmo` reads it
         * @default undefined
         */
        rotationGizmo!: BABYLON.IRotationGizmo;
        /**
         * How far the mesh turns for a given drag; 1 is the default and higher is faster
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sensitivity = 1;
    }
    /**
     * Feeds the `babylon.gizmo.rotationGizmo` getters with the rotation gizmo to read from.
     */
    export class RotationGizmoDto {
        constructor(rotationGizmo?: BABYLON.IRotationGizmo) {
            if (rotationGizmo !== undefined) { this.rotationGizmo = rotationGizmo; }
        }
        /**
         * The rotation gizmo, as `gizmo.manager.getRotationGizmo` reads it
         * @default undefined
         */
        rotationGizmo!: BABYLON.IRotationGizmo;
    }
    /**
     * Feeds `babylon.gizmo.axisScaleGizmo.getIsEnabled` with one axis handle of a scale gizmo.
     */
    export class AxisScaleGizmoDto {
        constructor(axisScaleGizmo?: BABYLON.IAxisScaleGizmo) {
            if (axisScaleGizmo !== undefined) { this.axisScaleGizmo = axisScaleGizmo; }
        }
        /**
         * One axis handle of a scale gizmo, as `scaleGizmo.getXGizmo` and its siblings read it
         * @default undefined
         */
        axisScaleGizmo!: BABYLON.IAxisScaleGizmo;
    }
    /**
     * Feeds `babylon.gizmo.axisScaleGizmo.setIsEnabled` with one axis handle of a scale gizmo and
     * whether it is shown.
     */
    export class SetIsEnabledAxisScaleGizmoDto {
        constructor(gizmoManager?: BABYLON.IAxisScaleGizmo, isEnabled?: boolean) {
            if (gizmoManager !== undefined) { this.axisScaleGizmo = gizmoManager; }
            if (isEnabled !== undefined) { this.isEnabled = isEnabled; }
        }
        /**
         * One axis handle of a scale gizmo, as `scaleGizmo.getXGizmo` and its siblings read it
         * @default undefined
         */
        axisScaleGizmo!: BABYLON.IAxisScaleGizmo;
        /**
         * When true, the handle is shown and usable; when false, that axis cannot be scaled
         * @default true
         */
        isEnabled = true;
    }

    /**
     * Feeds `babylon.gizmo.axisDragGizmo.getIsEnabled` with one arrow of a position gizmo.
     */
    export class AxisDragGizmoDto {
        constructor(axisDragGizmo?: BABYLON.IAxisDragGizmo) {
            if (axisDragGizmo !== undefined) { this.axisDragGizmo = axisDragGizmo; }
        }
        /**
         * One arrow of a position gizmo, as `positionGizmo.getXGizmo` and its siblings read it
         * @default undefined
         */
        axisDragGizmo!: BABYLON.IAxisDragGizmo;
    }
    /**
     * Feeds `babylon.gizmo.axisDragGizmo.setIsEnabled` with one arrow of a position gizmo and
     * whether it is shown.
     */
    export class SetIsEnabledAxisDragGizmoDto {
        constructor(gizmoManager?: BABYLON.IAxisDragGizmo, isEnabled?: boolean) {
            if (gizmoManager !== undefined) { this.axisDragGizmo = gizmoManager; }
            if (isEnabled !== undefined) { this.isEnabled = isEnabled; }
        }
        /**
         * One arrow of a position gizmo, as `positionGizmo.getXGizmo` and its siblings read it
         * @default undefined
         */
        axisDragGizmo!: BABYLON.IAxisDragGizmo;
        /**
         * When true, the arrow is shown and usable; when false, the mesh cannot be dragged along
         * that axis
         * @default true
         */
        isEnabled = true;
    }
    /**
     * Feeds `babylon.gizmo.planeRotationGizmo.setIsEnabled` with one ring of a rotation gizmo and
     * whether it is shown.
     */
    export class SetIsEnabledPlaneRotationGizmoDto {
        constructor(planeRotationGizmo?: BABYLON.IPlaneRotationGizmo, isEnabled?: boolean) {
            if (planeRotationGizmo !== undefined) { this.planeRotationGizmo = planeRotationGizmo; }
            if (isEnabled !== undefined) { this.isEnabled = isEnabled; }
        }
        /**
         * One ring of a rotation gizmo, as `rotationGizmo.getXGizmo` and its siblings read it
         * @default undefined
         */
        planeRotationGizmo!: BABYLON.IPlaneRotationGizmo;
        /**
         * When true, the ring is shown and usable; when false, the mesh cannot be turned around
         * that axis
         * @default true
         */
        isEnabled = true;
    }
    /**
     * Feeds `babylon.gizmo.planeDragGizmo.setIsEnabled` with one plane handle of a position gizmo
     * and whether it is shown.
     */
    export class SetIsEnabledPlaneDragGizmoDto {
        constructor(planeDragGizmo?: BABYLON.IPlaneDragGizmo, isEnabled?: boolean) {
            if (planeDragGizmo !== undefined) { this.planeDragGizmo = planeDragGizmo; }
            if (isEnabled !== undefined) { this.isEnabled = isEnabled; }
        }
        /**
         * One plane handle of a position gizmo, as `positionGizmo.getXPlaneGizmo` and its siblings
         * read it
         * @default undefined
         */
        planeDragGizmo!: BABYLON.IPlaneDragGizmo;
        /**
         * When true, the handle is shown and usable; when false, the mesh cannot slide in that
         * plane
         * @default true
         */
        isEnabled = true;
    }
    /**
     * Feeds `babylon.gizmo.planeDragGizmo.getIsEnabled` with one plane handle of a position gizmo.
     */
    export class PlaneDragGizmoDto {
        constructor(planeDragGizmo?: BABYLON.IPlaneDragGizmo) {
            if (planeDragGizmo !== undefined) { this.planeDragGizmo = planeDragGizmo; }
        }
        /**
         * One plane handle of a position gizmo, as `positionGizmo.getXPlaneGizmo` and its siblings
         * read it
         * @default undefined
         */
        planeDragGizmo!: BABYLON.IPlaneDragGizmo;
    }
    /**
     * Feeds `babylon.gizmo.planeRotationGizmo.getIsEnabled` with one ring of a rotation gizmo.
     */
    export class PlaneRotationGizmoDto {
        constructor(planeRotationGizmo?: BABYLON.IPlaneRotationGizmo) {
            if (planeRotationGizmo !== undefined) { this.planeRotationGizmo = planeRotationGizmo; }
        }
        /**
         * One ring of a rotation gizmo, as `rotationGizmo.getXGizmo` and its siblings read it
         * @default undefined
         */
        planeRotationGizmo!: BABYLON.IPlaneRotationGizmo;
    }
    /**
     * Feeds `babylon.gizmo.manager.attachToMesh` with the manager and the mesh its gizmos should
     * appear on.
     */
    export class AttachToMeshDto {
        constructor(mesh: BABYLON.AbstractMesh, gizmoManager: BABYLON.GizmoManager) {
            this.mesh = mesh;
            this.gizmoManager = gizmoManager;
        }
        /**
         * The mesh the gizmos attach to; the mesh attached before is released
         */
        mesh: BABYLON.AbstractMesh;
        /**
         * The gizmo manager, as `createGizmoManager` gave it
         */
        gizmoManager: BABYLON.GizmoManager;
    }

    /**
     * Feeds `babylon.gizmo.positionGizmo.createPositionGizmoObservableSelector` with the name of
     * the drag event to select.
     */
    export class PositionGizmoObservableSelectorDto {
        constructor(selector: positionGizmoObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Which event: drag start, drag or drag end
         */
        selector: positionGizmoObservableSelectorEnum;
    }
    /**
     * Feeds `babylon.gizmo.boundingBoxGizmo.createBoundingBoxGizmoObservableSelector` with the name
     * of the handle event to select.
     */
    export class BoundingBoxGizmoObservableSelectorDto {
        constructor(selector: boundingBoxGizmoObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Which event: a drag start, or a scale box or rotation sphere drag and its end
         */
        selector: boundingBoxGizmoObservableSelectorEnum;
    }
    /**
     * Feeds `babylon.gizmo.rotationGizmo.createRotationGizmoObservableSelector` with the name of
     * the drag event to select.
     */
    export class RotationGizmoObservableSelectorDto {
        constructor(selector: rotationGizmoObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Which event: drag start, drag or drag end
         */
        selector: rotationGizmoObservableSelectorEnum;
    }

    /**
     * Feeds `babylon.gizmo.scaleGizmo.createScaleGizmoObservableSelector` with the name of the drag
     * event to select.
     */
    export class ScaleGizmoObservableSelectorDto {
        constructor(selector: scaleGizmoObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Which event: drag start, drag or drag end
         */
        selector: scaleGizmoObservableSelectorEnum;
    }
}
