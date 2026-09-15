import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

/**
 * The bounding box gizmo: a frame around the attached mesh with corner boxes that scale it and
 * spheres that rotate it. The handles can keep a constant screen size, snap in steps, scale from a
 * chosen pivot and respond with a different speed per axis.
 */
export class BabylonGizmoBoundingBoxGizmo {


    constructor(
        _context: Context,
    ) {
    }

    /**
     * Sets the size of the round rotation handles on a bounding box gizmo's edges.
     * @param inputs - The bounding box gizmo and the sphere size
     * @returns The same bounding box gizmo
     * @group set
     * @shortname set rotation sphere size
     */
    setRotationSphereSize(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoRotationSphereSizeDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.rotationSphereSize = inputs.rotationSphereSize;
        return inputs.boundingBoxGizmo;
    }

    /**
     * When true, the rotation spheres and scale boxes of a bounding box gizmo keep the same size on
     * screen whatever the distance to the camera; it takes precedence over
     * `fixedDragMeshBoundsSize`.
     * @param inputs - The bounding box gizmo and the flag
     * @returns The same bounding box gizmo
     * @group set
     * @shortname set fixed drag mesh screen size
     * @example
     * ```typescript
     * bitbybit.babylon.gizmo.boundingBoxGizmo.setFixedDragMeshScreenSize({ boundingBoxGizmo, fixedDragMeshScreenSize: true });
     * ```
     */
    setFixedDragMeshScreenSize(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshScreenSizeDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.fixedDragMeshScreenSize = inputs.fixedDragMeshScreenSize;
        return inputs.boundingBoxGizmo;
    }

    /**
     * When true, the handles of a bounding box gizmo are sized relative to the bounds of the
     * attached mesh instead of a fixed world size.
     * @param inputs - The bounding box gizmo and the flag
     * @returns The same bounding box gizmo
     * @group set
     * @shortname set fixed drag mesh bounds size
     */
    setFixedDragMeshBoundsSize(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshBoundsSizeDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.fixedDragMeshBoundsSize = inputs.fixedDragMeshBoundsSize;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Sets the camera distance at which a bounding box gizmo's handles appear at their world size
     * when `fixedDragMeshScreenSize` is on; the default is 10.
     * @param inputs - The bounding box gizmo and the distance factor
     * @returns The same bounding box gizmo
     * @group set
     * @shortname set fixed drag mesh screen size dist factor
     */
    setFixedDragMeshScreenSizeDistanceFactor(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshScreenSizeDistanceFactorDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.fixedDragMeshScreenSizeDistanceFactor = inputs.fixedDragMeshScreenSizeDistanceFactor;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Makes a bounding box gizmo scale the mesh in steps of `scalingSnapDistance` scene units of
     * drag instead of smoothly; 0 turns snapping off.
     * @param inputs - The bounding box gizmo and the step size
     * @returns The same bounding box gizmo
     * @group set
     * @shortname set scaling snap dist.
     */
    setScalingSnapDistance(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoScalingSnapDistanceDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.scalingSnapDistance = inputs.scalingSnapDistance;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Makes a bounding box gizmo rotate the mesh in steps of `rotationSnapDistance` radians instead
     * of smoothly; 0 turns snapping off.
     * @param inputs - The bounding box gizmo and the step in radians
     * @returns The same bounding box gizmo
     * @group set
     * @shortname set rotation snap dist.
     */
    setRotationSnapDistance(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoRotationSnapDistanceDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.rotationSnapDistance = inputs.rotationSnapDistance;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Sets the size of the square scale handles on a bounding box gizmo's corners.
     * @param inputs - The bounding box gizmo and the box size
     * @returns The same bounding box gizmo
     * @group set
     * @shortname set scale box size
     */
    setScaleBoxSize(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoScaleBoxSizeDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.scaleBoxSize = inputs.scaleBoxSize;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Chooses how a bounding box gizmo's scale snapping steps combine: incremental steps add up,
     * 1.1 then 1.2 then 1.3 for a step of 0.1, while the default multiplies, 1.1 then 1.21 then
     * 1.33.
     * @param inputs - The bounding box gizmo and the flag
     * @returns The same bounding box gizmo
     * @group set
     * @shortname set incremental snap
     */
    setIncrementalSnap(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoIncrementalSnapDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.incrementalSnap = inputs.incrementalSnap;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Sets the point a bounding box gizmo scales the mesh around, as fractions of its bounds:
     * `[0.5, 0.5, 0.5]` is the center and `[0.5, 0, 0.5]` the bottom; by default it scales from the
     * opposite corner.
     * @param inputs - The bounding box gizmo and the pivot fractions
     * @returns The same bounding box gizmo
     * @group set
     * @shortname set scale pivot
     * @example
     * ```typescript
     * bitbybit.babylon.gizmo.boundingBoxGizmo.setScalePivot({ boundingBoxGizmo, scalePivot: [0.5, 0, 0.5] });
     * ```
     */
    setScalePivot(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoScalePivotDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.scalePivot = new BABYLON.Vector3(...inputs.scalePivot);
        return inputs.boundingBoxGizmo;
    }

    /**
     * Sets a separate drag sensitivity per axis for a bounding box gizmo, so scaling along one axis
     * can respond faster or slower than the others.
     * @param inputs - The bounding box gizmo and the factor per axis
     * @returns The same bounding box gizmo
     * @group set
     * @shortname set axis factor
     */
    setAxisFactor(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoAxisFactorDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.axisFactor = new BABYLON.Vector3(...inputs.axisFactor);
        return inputs.boundingBoxGizmo;
    }

    /**
     * Sets how fast a bounding box gizmo scales the mesh for a given drag; 1 is the default.
     * @param inputs - The bounding box gizmo and the drag speed
     * @returns The same bounding box gizmo
     * @group set
     * @shortname set scale drag speed
     */
    setScaleDragSpeed(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoScaleDragSpeedDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.scaleDragSpeed = inputs.scaleDragSpeed;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Reads the size of the rotation handles of a bounding box gizmo.
     * @param inputs - The bounding box gizmo
     * @returns The rotation sphere size
     * @group get
     * @shortname get rotation sphere size
     */
    getRotationSphereSize(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number {
        return inputs.boundingBoxGizmo?.rotationSphereSize;
    }

    /**
     * Reads the size of the scale handles of a bounding box gizmo.
     * @param inputs - The bounding box gizmo
     * @returns The scale box size
     * @group get
     * @shortname get scale box size
     */
    getScaleBoxSize(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number {
        return inputs.boundingBoxGizmo?.scaleBoxSize;
    }

    /**
     * Reads whether the handles of a bounding box gizmo keep a constant screen size.
     * @param inputs - The bounding box gizmo
     * @returns True when the handles keep their screen size
     * @group get
     * @shortname get fixed drag mesh screen size
     */
    getFixedDragMeshScreenSize(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): boolean {
        return inputs.boundingBoxGizmo?.fixedDragMeshScreenSize;
    }

    /**
     * Reads whether the handles of a bounding box gizmo are sized relative to the mesh bounds.
     * @param inputs - The bounding box gizmo
     * @returns True when the handles follow the bounds
     * @group get
     * @shortname get fixed drag mesh bounds size
     */
    getFixedDragMeshBoundsSize(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): boolean {
        return inputs.boundingBoxGizmo?.fixedDragMeshBoundsSize;
    }

    /**
     * Reads the camera distance at which a bounding box gizmo's handles appear at their world size.
     * @param inputs - The bounding box gizmo
     * @returns The distance factor
     * @group get
     * @shortname get fixed drag mesh screen size distance factor
     */
    getFixedDragMeshScreenSizeDistanceFactor(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number {
        return inputs.boundingBoxGizmo?.fixedDragMeshScreenSizeDistanceFactor;
    }

    /**
     * Reads the drag step a bounding box gizmo snaps scaling to, 0 meaning smooth scaling.
     * @param inputs - The bounding box gizmo
     * @returns The scaling snap distance
     * @group get
     * @shortname get scaling snap distance
     */
    getScalingSnapDistance(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number {
        return inputs.boundingBoxGizmo?.scalingSnapDistance;
    }

    /**
     * Reads the angle step in radians a bounding box gizmo snaps rotation to, 0 meaning smooth
     * rotation.
     * @param inputs - The bounding box gizmo
     * @returns The rotation snap distance in radians
     * @group get
     * @shortname get rotation snap distance
     */
    getRotationSnapDistance(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number {
        return inputs.boundingBoxGizmo?.rotationSnapDistance;
    }

    /**
     * Reads whether a bounding box gizmo's scale snapping steps add up rather than multiply.
     * @param inputs - The bounding box gizmo
     * @returns True when snapping is incremental
     * @group get
     * @shortname get incremental snap
     */
    getIncrementalSnap(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): boolean {
        return inputs.boundingBoxGizmo?.incrementalSnap;
    }

    /**
     * Reads the pivot fractions a bounding box gizmo scales around.
     * @param inputs - The bounding box gizmo
     * @returns The pivot as fractions of the bounds
     * @group get
     * @shortname get scale pivot
     */
    getScalePivot(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): Inputs.Base.Vector3 {
        return inputs.boundingBoxGizmo?.scalePivot?.asArray() as Inputs.Base.Vector3;
    }

    /**
     * Reads the drag sensitivity per axis of a bounding box gizmo.
     * @param inputs - The bounding box gizmo
     * @returns The factor per axis
     * @group get
     * @shortname get axis factor
     */
    getAxisFactor(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): Inputs.Base.Vector3 {
        return inputs.boundingBoxGizmo?.axisFactor?.asArray();
    }

    /**
     * Reads how fast a bounding box gizmo scales the mesh for a given drag.
     * @param inputs - The bounding box gizmo
     * @returns The scale drag speed
     * @group get
     * @shortname get scale drag speed
     */
    getScaleDragSpeed(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number {
        return inputs.boundingBoxGizmo?.scaleDragSpeed;
    }

    /**
     * Passes through the name of a bounding box gizmo event as a typed selector for code that
     * subscribes to gizmo events by name.
     * @param inputs - The event selector
     * @returns The same selector
     * @group create
     * @shortname bounding box gizmo observable selector
     * @example
     * ```typescript
     * const selector = bitbybit.babylon.gizmo.boundingBoxGizmo.createBoundingBoxGizmoObservableSelector({ selector: Bit.Inputs.BabylonGizmo.boundingBoxGizmoObservableSelectorEnum.onScaleBoxDragEndObservable });
     * ```
     */
    createBoundingBoxGizmoObservableSelector(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoObservableSelectorDto): Inputs.BabylonGizmo.boundingBoxGizmoObservableSelectorEnum {
        return inputs.selector;
    }
    
}
