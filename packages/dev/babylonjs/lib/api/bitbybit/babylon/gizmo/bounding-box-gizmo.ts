import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGizmoBoundingBoxGizmo {


    constructor(
        private readonly context: Context,
    ) {
    }

    /**
     * Set bounding box gizmo rotation sphere size
     * @param inputs bounding box gizmo
     * @returns bounding box gizmo
     * @group set
     * @shortname set rotation sphere size
     */
    setRotationSphereSize(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoRotationSphereSizeDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.rotationSphereSize = inputs.rotationSphereSize;
        return inputs.boundingBoxGizmo;
    }

    /**
     * If set, the rotation anchors and scale boxes will increase in size based on the distance away from the camera to have a consistent screen size (Default: false) Note : fixedDragMeshScreenSize takes precedence over fixedDragMeshBoundsSize if both are true
     * @param inputs bounding box gizmo
     * @returns bounding box gizmo
     * @group set
     * @shortname set fixed drag mesh screen size
     */
    setFixedDragMeshScreenSize(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshScreenSizeDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.fixedDragMeshScreenSize = inputs.fixedDragMeshScreenSize;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Set bounding box gizmo fixed drag mesh bounds size
     * @param inputs bounding box gizmo
     * @returns bounding box gizmo
     * @group set
     * @shortname set fixed drag mesh bounds size
     */
    setFixedDragMeshBoundsSize(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshBoundsSizeDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.fixedDragMeshBoundsSize = inputs.fixedDragMeshBoundsSize;
        return inputs.boundingBoxGizmo;
    }

    /**
     * The distance away from the object which the draggable meshes should appear world sized when fixedDragMeshScreenSize is set to true (default: 10)
     * @param inputs bounding box gizmo
     * @returns bounding box gizmo
     * @group set
     * @shortname set fixed drag mesh screen size dist factor
     */
    setFixedDragMeshScreenSizeDistanceFactor(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshScreenSizeDistanceFactorDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.fixedDragMeshScreenSizeDistanceFactor = inputs.fixedDragMeshScreenSizeDistanceFactor;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Set bounding box gizmo scaling snap distance. Drag distance in babylon units that the gizmo will snap scaling to when dragged.
     * @param inputs bounding box gizmo
     * @returns bounding box gizmo
     * @group set
     * @shortname set scaling snap dist.
     */
    setScalingSnapDistance(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoScalingSnapDistanceDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.scalingSnapDistance = inputs.scalingSnapDistance;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Set bounding box gizmo rotation snap distance. Drag distance in babylon units that the gizmo will snap rotation to when dragged.
     * @param inputs bounding box gizmo
     * @returns bounding box gizmo
     * @group set
     * @shortname set rotation snap dist.
     */
    setRotationSnapDistance(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoRotationSnapDistanceDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.rotationSnapDistance = inputs.rotationSnapDistance;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Set bounding box gizmo scale box size
     * @param inputs bounding box gizmo
     * @returns bounding box gizmo
     * @group set
     * @shortname set scale box size
     */
    setScaleBoxSize(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoScaleBoxSizeDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.scaleBoxSize = inputs.scaleBoxSize;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Set bounding box gizmo incremental snap. Incremental snap scaling (default is false). When true, with a snapDistance of 0.1, scaling will be 1.1,1.2,1.3 instead of, when false: 1.1,1.21,1.33,...
     * @param inputs bounding box gizmo
     * @returns bounding box gizmo
     * @group set
     * @shortname set incremental snap
     */
    setIncrementalSnap(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoIncrementalSnapDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.incrementalSnap = inputs.incrementalSnap;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Set bounding box gizmo scale pivot. Relative bounding box pivot used when scaling the attached node. When null object with scale from the opposite corner. 0.5,0.5,0.5 for center and 0.5,0,0.5 for bottom (Default: null)
     * @param inputs bounding box gizmo and scale pivot
     * @returns bounding box gizmo
     * @group set
     * @shortname set scale pivot
     */
    setScalePivot(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoScalePivotDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.scalePivot = new BABYLON.Vector3(...inputs.scalePivot);
        return inputs.boundingBoxGizmo;
    }

    /**
     * Set bounding box gizmo axis factor. Set custom sensitivity value for each axis
     * @param inputs bounding box gizmo and axis factor
     * @returns bounding box gizmo
     * @group set
     * @shortname set axis factor
     */
    setAxisFactor(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoAxisFactorDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.axisFactor = new BABYLON.Vector3(...inputs.axisFactor);
        return inputs.boundingBoxGizmo;
    }

    /**
     * Set bounding box gizmo scale drag speed
     * @param inputs bounding box gizmo and scale drag speed
     * @returns bounding box gizmo
     * @group set
     * @shortname set scale drag speed
     */
    setScaleDragSpeed(inputs: Inputs.BabylonGizmo.SetBoundingBoxGizmoScaleDragSpeedDto): BABYLON.BoundingBoxGizmo {
        inputs.boundingBoxGizmo.scaleDragSpeed = inputs.scaleDragSpeed;
        return inputs.boundingBoxGizmo;
    }

    /**
     * Get rotation sphere size
     * @param inputs bounding box gizmo
     * @returns rotation sphere size
     * @group get
     * @shortname get rotation sphere size
     */
    getRotationSphereSize(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number {
        return inputs.boundingBoxGizmo?.rotationSphereSize;
    }

    /**
     * Get scale box size
     * @param inputs bounding box gizmo
     * @returns scale box size
     * @group get
     * @shortname get scale box size
     */
    getScaleBoxSize(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number {
        return inputs.boundingBoxGizmo?.scaleBoxSize;
    }

    /**
     * Get fixed drag mesh screen size
     * @param inputs bounding box gizmo
     * @returns fixed drag mesh screen size
     * @group get
     * @shortname get fixed drag mesh screen size
     */
    getFixedDragMeshScreenSize(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): boolean {
        return inputs.boundingBoxGizmo?.fixedDragMeshScreenSize;
    }

    /**
     * Get fixed drag mesh bounds size
     * @param inputs bounding box gizmo
     * @returns fixed drag mesh bounds size
     * @group get
     * @shortname get fixed drag mesh bounds size
     */
    getFixedDragMeshBoundsSize(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): boolean {
        return inputs.boundingBoxGizmo?.fixedDragMeshBoundsSize;
    }

    /**
     * Get fixed drag mesh screen size distance factor
     * @param inputs bounding box gizmo
     * @returns fixed drag mesh screen size distance factor
     * @group get
     * @shortname get fixed drag mesh screen size distance factor
     */
    getFixedDragMeshScreenSizeDistanceFactor(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number {
        return inputs.boundingBoxGizmo?.fixedDragMeshScreenSizeDistanceFactor;
    }

    /**
     * Get scaling snap distance
     * @param inputs bounding box gizmo
     * @returns scaling snap distance
     * @group get
     * @shortname get scaling snap distance
     */
    getScalingSnapDistance(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number {
        return inputs.boundingBoxGizmo?.scalingSnapDistance;
    }

    /**
     * Get rotation snap distance
     * @param inputs bounding box gizmo
     * @returns rotation snap distance
     * @group get
     * @shortname get rotation snap distance
     */
    getRotationSnapDistance(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number {
        return inputs.boundingBoxGizmo?.rotationSnapDistance;
    }

    /**
     * Get incremental snap
     * @param inputs bounding box gizmo
     * @returns incremental snap
     * @group get
     * @shortname get incremental snap
     */
    getIncrementalSnap(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): boolean {
        return inputs.boundingBoxGizmo?.incrementalSnap;
    }

    /**
     * Get scale pivot
     * @param inputs bounding box gizmo
     * @returns scale pivot
     * @group get
     * @shortname get scale pivot
     */
    getScalePivot(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): Inputs.Base.Vector3 {
        return inputs.boundingBoxGizmo?.scalePivot?.asArray() as Inputs.Base.Vector3;
    }

    /**
     * Get axis factor
     * @param inputs bounding box gizmo
     * @returns axis factor
     * @group get
     * @shortname get axis factor
     */
    getAxisFactor(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): Inputs.Base.Vector3 {
        return inputs.boundingBoxGizmo?.axisFactor?.asArray() as Inputs.Base.Vector3;
    }

    /**
     * Get scale drag speed
     * @param inputs bounding box gizmo
     * @returns scale drag speed
     * @group get
     * @shortname get scale drag speed
     */
    getScaleDragSpeed(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoDto): number {
        return inputs.boundingBoxGizmo?.scaleDragSpeed;
    }

    /**
    * Creates the selector of an observable for a bounding box gizmo
    * @param inputs observable name
    * @returns bounding box gizmo observable selector
    * @group create
    * @shortname bounding box gizmo observable selector
    */
    createBoundingBoxGizmoObservableSelector(inputs: Inputs.BabylonGizmo.BoundingBoxGizmoObservableSelectorDto): Inputs.BabylonGizmo.boundingBoxGizmoObservableSelectorEnum {
        return inputs.selector;
    }
    
}
