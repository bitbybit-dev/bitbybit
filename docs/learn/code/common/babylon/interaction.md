---
sidebar_position: 6
title: Picking, Gizmos and XR
sidebar_label: Picking, Gizmos and XR
description: The bitbybit.babylon functions that let a person interact with the scene - picking what is under the pointer or along a ray, gizmos that move, rotate and scale objects by dragging, and entering virtual or augmented reality - with a table of every function.
topic: code.babylon.interaction
type: reference
tags: [code, babylonjs]
---

# Picking, gizmos and XR

- **Picking** (`babylon.pick`, `babylon.ray`): shoot a ray into the scene, from the pointer or from any point in any direction, and learn the first mesh it hits, where and at what distance. It is how a click selects a part.
- **Gizmos** (`babylon.gizmo`): the handles a person drags to move, rotate and scale an object, singly or all together through a gizmo manager, with their own events for when a drag starts, moves and ends.
- **XR** (`babylon.webXr`): enter virtual or augmented reality from the browser, with controllers, teleportation and hit tests against the real world.

To react to the pointer, set a function with `babylon.scene.onPointerDown`, `onPointerMove` or `onPointerUp`, and pick inside it.

## Every function

### Picking

{/* api:babylon.pick:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`getBU`](https://docs.bitbybit.dev/classes/Bit.BabylonPick#getBU) | Reads the first barycentric coordinate of the hit inside its triangle, the weight of the triangle's second vertex, used to work out texture coordinates. |
| [`getBV`](https://docs.bitbybit.dev/classes/Bit.BabylonPick#getBV) | Reads the second barycentric coordinate of the hit inside its triangle, the weight of the triangle's third vertex, used to work out texture coordinates. |
| [`getDistance`](https://docs.bitbybit.dev/classes/Bit.BabylonPick#getDistance) | Reads how far along the ray the hit was, in scene units; meaningful only when `hit` is true. |
| [`getPickedMesh`](https://docs.bitbybit.dev/classes/Bit.BabylonPick#getPickedMesh) | Reads the mesh a pick hit; meaningful only when `hit` is true. |
| [`getPickedPoint`](https://docs.bitbybit.dev/classes/Bit.BabylonPick#getPickedPoint) | Reads the point in the scene where a pick hit the mesh; meaningful only when `hit` is true. |
| [`getPickedSprite`](https://docs.bitbybit.dev/classes/Bit.BabylonPick#getPickedSprite) | Reads the sprite a pick hit, when sprites rather than meshes were picked. |
| [`getSubMeshFaceId`](https://docs.bitbybit.dev/classes/Bit.BabylonPick#getSubMeshFaceId) | Reads the index of the triangle that was hit within its sub-mesh. |
| [`getSubMeshId`](https://docs.bitbybit.dev/classes/Bit.BabylonPick#getSubMeshId) | Reads the index of the sub-mesh that was hit, for meshes split into several material sections. |
| [`hit`](https://docs.bitbybit.dev/classes/Bit.BabylonPick#hit) | Tells whether a pick hit anything at all; check it before reading the mesh, point or distance. |
| [`pickWithPickingRay`](https://docs.bitbybit.dev/classes/Bit.BabylonPick#pickWithPickingRay) | Shoots a ray from the active camera through the pointer's current position and reports the first pickable mesh it hits, the way a click selects. |
| [`pickWithRay`](https://docs.bitbybit.dev/classes/Bit.BabylonPick#pickWithRay) | Shoots a ray into the scene and reports the first pickable mesh it hits, with the hit point and distance; read the parts with the other methods here. |

{/* api:babylon.pick:end */}

### Rays

{/* api:babylon.ray:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`createPickingRay`](https://docs.bitbybit.dev/classes/Bit.BabylonRay#createPickingRay) | Builds a ray from the active camera through the pointer's current position on the canvas, the ray a click would pick with. |
| [`createRay`](https://docs.bitbybit.dev/classes/Bit.BabylonRay#createRay) | Builds a ray starting at `origin` and pointing along `direction`; `length` limits how far it reaches, and 0 or nothing leaves it unlimited. |
| [`createRayFromTo`](https://docs.bitbybit.dev/classes/Bit.BabylonRay#createRayFromTo) | Builds a ray that starts at `from`, points toward `to` and is exactly as long as the distance between them. |
| [`getDirection`](https://docs.bitbybit.dev/classes/Bit.BabylonRay#getDirection) | Reads the direction a ray points in, as a unit vector. |
| [`getLength`](https://docs.bitbybit.dev/classes/Bit.BabylonRay#getLength) | Reads how far a ray reaches; an unlimited ray reports a very large number. |
| [`getOrigin`](https://docs.bitbybit.dev/classes/Bit.BabylonRay#getOrigin) | Reads the point a ray starts from, as a point in the scene. |

{/* api:babylon.ray:end */}

### Gizmos

{/* api:babylon.gizmo:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`axisDragGizmo.getIsEnabled`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoAxisDragGizmo#getIsEnabled) | Reads whether one axis arrow of a position gizmo is shown. |
| [`axisDragGizmo.setIsEnabled`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoAxisDragGizmo#setIsEnabled) | Shows or hides one axis arrow of a position gizmo, so the mesh can be locked against moving along that axis. |
| [`axisScaleGizmo.getIsEnabled`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoAxisScaleGizmo#getIsEnabled) | Reads whether one axis handle of a scale gizmo is shown. |
| [`axisScaleGizmo.setIsEnabled`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoAxisScaleGizmo#setIsEnabled) | Shows or hides one axis handle of a scale gizmo, so the mesh can be locked against scaling along that axis. |
| [`base.getScaleRatio`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBase#getScaleRatio) | Reads how large a gizmo's handles are drawn relative to the default size. |
| [`base.scaleRatio`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBase#scaleRatio) | Sets how large a gizmo's handles are drawn; 1 is the default size and 2 doubles it, whatever the attached mesh's size. |
| [`boundingBoxGizmo.createBoundingBoxGizmoObservableSelector`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#createBoundingBoxGizmoObservableSelector) | Passes through the name of a bounding box gizmo event as a typed selector for code that subscribes to gizmo events by name. |
| [`boundingBoxGizmo.getAxisFactor`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#getAxisFactor) | Reads the drag sensitivity per axis of a bounding box gizmo. |
| [`boundingBoxGizmo.getFixedDragMeshBoundsSize`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#getFixedDragMeshBoundsSize) | Reads whether the handles of a bounding box gizmo are sized relative to the mesh bounds. |
| [`boundingBoxGizmo.getFixedDragMeshScreenSize`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#getFixedDragMeshScreenSize) | Reads whether the handles of a bounding box gizmo keep a constant screen size. |
| [`boundingBoxGizmo.getFixedDragMeshScreenSizeDistanceFactor`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#getFixedDragMeshScreenSizeDistanceFactor) | Reads the camera distance at which a bounding box gizmo's handles appear at their world size. |
| [`boundingBoxGizmo.getIncrementalSnap`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#getIncrementalSnap) | Reads whether a bounding box gizmo's scale snapping steps add up rather than multiply. |
| [`boundingBoxGizmo.getRotationSnapDistance`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#getRotationSnapDistance) | Reads the angle step in radians a bounding box gizmo snaps rotation to, 0 meaning smooth rotation. |
| [`boundingBoxGizmo.getRotationSphereSize`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#getRotationSphereSize) | Reads the size of the rotation handles of a bounding box gizmo. |
| [`boundingBoxGizmo.getScaleBoxSize`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#getScaleBoxSize) | Reads the size of the scale handles of a bounding box gizmo. |
| [`boundingBoxGizmo.getScaleDragSpeed`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#getScaleDragSpeed) | Reads how fast a bounding box gizmo scales the mesh for a given drag. |
| [`boundingBoxGizmo.getScalePivot`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#getScalePivot) | Reads the pivot fractions a bounding box gizmo scales around. |
| [`boundingBoxGizmo.getScalingSnapDistance`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#getScalingSnapDistance) | Reads the drag step a bounding box gizmo snaps scaling to, 0 meaning smooth scaling. |
| [`boundingBoxGizmo.setAxisFactor`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#setAxisFactor) | Sets a separate drag sensitivity per axis for a bounding box gizmo, so scaling along one axis can respond faster or slower than the others. |
| [`boundingBoxGizmo.setFixedDragMeshBoundsSize`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#setFixedDragMeshBoundsSize) | When true, the handles of a bounding box gizmo are sized relative to the bounds of the attached mesh instead of a fixed world size. |
| [`boundingBoxGizmo.setFixedDragMeshScreenSize`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#setFixedDragMeshScreenSize) | When true, the rotation spheres and scale boxes of a bounding box gizmo keep the same size on screen whatever the distance to the camera; it takes precedence over `fixedDragMeshBoundsSize`. |
| [`boundingBoxGizmo.setFixedDragMeshScreenSizeDistanceFactor`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#setFixedDragMeshScreenSizeDistanceFactor) | Sets the camera distance at which a bounding box gizmo's handles appear at their world size when `fixedDragMeshScreenSize` is on; the default is 10. |
| [`boundingBoxGizmo.setIncrementalSnap`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#setIncrementalSnap) | Chooses how a bounding box gizmo's scale snapping steps combine: incremental steps add up, 1.1 then 1.2 then 1.3 for a step of 0.1, while the default multiplies, 1.1 then 1.21 then 1.33. |
| [`boundingBoxGizmo.setRotationSnapDistance`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#setRotationSnapDistance) | Makes a bounding box gizmo rotate the mesh in steps of `rotationSnapDistance` radians instead of smoothly; 0 turns snapping off. |
| [`boundingBoxGizmo.setRotationSphereSize`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#setRotationSphereSize) | Sets the size of the round rotation handles on a bounding box gizmo's edges. |
| [`boundingBoxGizmo.setScaleBoxSize`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#setScaleBoxSize) | Sets the size of the square scale handles on a bounding box gizmo's corners. |
| [`boundingBoxGizmo.setScaleDragSpeed`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#setScaleDragSpeed) | Sets how fast a bounding box gizmo scales the mesh for a given drag; 1 is the default. |
| [`boundingBoxGizmo.setScalePivot`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#setScalePivot) | Sets the point a bounding box gizmo scales the mesh around, as fractions of its bounds: `[0.5, 0.5, 0.5]` is the center and `[0.5, 0, 0.5]` the bottom; by default it scales from the opposite corner. |
| [`boundingBoxGizmo.setScalingSnapDistance`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoBoundingBoxGizmo#setScalingSnapDistance) | Makes a bounding box gizmo scale the mesh in steps of `scalingSnapDistance` scene units of drag instead of smoothly; 0 turns snapping off. |
| [`manager.attachToMesh`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoManager#attachToMesh) | Shows the manager's enabled gizmos on a mesh so the user can manipulate it; any mesh attached before is released. |
| [`manager.createGizmoManager`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoManager#createGizmoManager) | Creates a gizmo manager with the chosen gizmos enabled: position arrows, rotation rings, scale handles and a bounding box. |
| [`manager.detachMesh`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoManager#detachMesh) | Hides the manager's gizmos by releasing the mesh they were attached to. |
| [`manager.getBoundingBoxGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoManager#getBoundingBoxGizmo) | Reads the bounding box gizmo of a manager, the frame with corner handles for scaling and rotating, for tuning its handles and snapping; it exists only when bounding box gizmos are enabled. |
| [`manager.getPositionGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoManager#getPositionGizmo) | Reads the position gizmo of a manager, the arrows that drag the mesh along an axis, for tuning its snapping and planes; it exists only when position gizmos are enabled. |
| [`manager.getRotationGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoManager#getRotationGizmo) | Reads the rotation gizmo of a manager, the rings that turn the mesh around an axis, for tuning its snapping and sensitivity; it exists only when rotation gizmos are enabled. |
| [`manager.getScaleGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoManager#getScaleGizmo) | Reads the scale gizmo of a manager, the handles that stretch the mesh along an axis, for tuning its snapping and sensitivity; it exists only when scale gizmos are enabled. |
| [`planeDragGizmo.getIsEnabled`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPlaneDragGizmo#getIsEnabled) | Reads whether one plane handle of a position gizmo is shown. |
| [`planeDragGizmo.setIsEnabled`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPlaneDragGizmo#setIsEnabled) | Shows or hides one plane handle of a position gizmo, so the mesh can be locked against sliding in that plane. |
| [`planeRotationGizmo.getIsEnabled`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPlaneRotationGizmo#getIsEnabled) | Reads whether one ring of a rotation gizmo is shown. |
| [`planeRotationGizmo.setIsEnabled`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPlaneRotationGizmo#setIsEnabled) | Shows or hides one ring of a rotation gizmo, so the mesh can be locked against turning around that axis. |
| [`positionGizmo.createPositionGizmoObservableSelector`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#createPositionGizmoObservableSelector) | Passes through the name of a position gizmo event, drag start, drag or drag end, as a typed selector for code that subscribes to gizmo events by name. |
| [`positionGizmo.getAttachedMesh`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#getAttachedMesh) | Reads the mesh a position gizmo is currently attached to. |
| [`positionGizmo.getAttachedNode`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#getAttachedNode) | Reads the node a position gizmo is currently attached to, which may be a transform node rather than a mesh. |
| [`positionGizmo.getIsDragging`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#getIsDragging) | Tells whether the user is dragging a position gizmo right now. |
| [`positionGizmo.getPlanarGizmoEnabled`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#getPlanarGizmoEnabled) | Reads whether a position gizmo shows its plane handles. |
| [`positionGizmo.getSnapDistance`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#getSnapDistance) | Reads the step size a position gizmo snaps to, 0 meaning smooth movement. |
| [`positionGizmo.getXGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#getXGizmo) | Reads the arrow of a position gizmo that drags along X, to enable or disable it on its own. |
| [`positionGizmo.getXPlaneGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#getXPlaneGizmo) | Reads the handle of a position gizmo that drags within the plane facing X, the YZ plane, to enable or disable it on its own. |
| [`positionGizmo.getYGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#getYGizmo) | Reads the arrow of a position gizmo that drags along Y, to enable or disable it on its own. |
| [`positionGizmo.getYPlaneGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#getYPlaneGizmo) | Reads the handle of a position gizmo that drags within the plane facing Y, the XZ plane, to enable or disable it on its own. |
| [`positionGizmo.getZGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#getZGizmo) | Reads the arrow of a position gizmo that drags along Z, to enable or disable it on its own. |
| [`positionGizmo.getZPlaneGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#getZPlaneGizmo) | Reads the handle of a position gizmo that drags within the plane facing Z, the XY plane, to enable or disable it on its own. |
| [`positionGizmo.planarGizmoEnabled`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#planarGizmoEnabled) | Shows or hides the square handles of a position gizmo that drag the mesh within the XY, YZ and XZ planes, in addition to the axis arrows. |
| [`positionGizmo.snapDistance`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoPositionGizmo#snapDistance) | Makes a position gizmo move the mesh in steps of `snapDistance` scene units instead of smoothly; 0 turns snapping off. |
| [`rotationGizmo.createRotationGizmoObservableSelector`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoRotationGizmo#createRotationGizmoObservableSelector) | Passes through the name of a rotation gizmo event, drag start, drag or drag end, as a typed selector for code that subscribes to gizmo events by name. |
| [`rotationGizmo.getAttachedMesh`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoRotationGizmo#getAttachedMesh) | Reads the mesh a rotation gizmo is currently attached to, or null when none is. |
| [`rotationGizmo.getAttachedNode`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoRotationGizmo#getAttachedNode) | Reads the node a rotation gizmo is currently attached to, which may be a transform node rather than a mesh. |
| [`rotationGizmo.getSensitivity`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoRotationGizmo#getSensitivity) | Reads how far a rotation gizmo turns the mesh for a given drag. |
| [`rotationGizmo.getSnapDistance`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoRotationGizmo#getSnapDistance) | Reads the angle step in radians a rotation gizmo snaps to, 0 meaning smooth rotation. |
| [`rotationGizmo.getXGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoRotationGizmo#getXGizmo) | Reads the ring of a rotation gizmo that turns around X, to enable or disable it on its own. |
| [`rotationGizmo.getYGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoRotationGizmo#getYGizmo) | Reads the ring of a rotation gizmo that turns around Y, to enable or disable it on its own. |
| [`rotationGizmo.getZGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoRotationGizmo#getZGizmo) | Reads the ring of a rotation gizmo that turns around Z, to enable or disable it on its own. |
| [`rotationGizmo.sensitivity`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoRotationGizmo#sensitivity) | Sets how far a rotation gizmo turns the mesh for a given drag; 1 is the default and higher values turn it faster. |
| [`rotationGizmo.snapDistance`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoRotationGizmo#snapDistance) | Makes a rotation gizmo turn the mesh in steps of `snapDistance` radians instead of smoothly; 0 turns snapping off. |
| [`scaleGizmo.createScaleGizmoObservableSelector`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoScaleGizmo#createScaleGizmoObservableSelector) | Passes through the name of a scale gizmo event, drag start, drag or drag end, as a typed selector for code that subscribes to gizmo events by name. |
| [`scaleGizmo.getIncrementalSnap`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoScaleGizmo#getIncrementalSnap) | Reads whether a scale gizmo's snapping steps add up rather than multiply. |
| [`scaleGizmo.getSensitivity`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoScaleGizmo#getSensitivity) | Reads how much a scale gizmo changes the scale for a given drag. |
| [`scaleGizmo.getSnapDistance`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoScaleGizmo#getSnapDistance) | Reads the step size a scale gizmo snaps to, 0 meaning smooth scaling. |
| [`scaleGizmo.getXGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoScaleGizmo#getXGizmo) | Reads the handle of a scale gizmo that stretches along X, to enable or disable it on its own. |
| [`scaleGizmo.getYGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoScaleGizmo#getYGizmo) | Reads the handle of a scale gizmo that stretches along Y, to enable or disable it on its own. |
| [`scaleGizmo.getZGizmo`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoScaleGizmo#getZGizmo) | Reads the handle of a scale gizmo that stretches along Z, to enable or disable it on its own. |
| [`scaleGizmo.sensitivity`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoScaleGizmo#sensitivity) | Sets how much a scale gizmo changes the scale for a given drag; 1 is the default and higher values scale faster. |
| [`scaleGizmo.setIncrementalSnap`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoScaleGizmo#setIncrementalSnap) | Chooses how a scale gizmo's snapping steps combine: incremental steps add up, 1.1 then 1.2 then 1.3 for a step of 0.1, while the default multiplies, 1.1 then 1.21 then 1.33. |
| [`scaleGizmo.snapDistance`](https://docs.bitbybit.dev/classes/Bit.BabylonGizmoScaleGizmo#snapDistance) | Makes a scale gizmo change the scale in steps of `snapDistance` instead of smoothly; 0 turns snapping off. |

{/* api:babylon.gizmo:end */}

### XR

{/* api:babylon.webXr:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`simple.createDefaultXRExperienceWithTeleportation`](https://docs.bitbybit.dev/classes/Bit.BabylonWebXRSimple#createDefaultXRExperienceWithTeleportation) | Starts a default WebXR experience in VR with teleportation over the given ground meshes, enough for simple walkthroughs; nothing is given back. |
| [`simple.createDefaultXRExperienceWithTeleportationReturn`](https://docs.bitbybit.dev/classes/Bit.BabylonWebXRSimple#createDefaultXRExperienceWithTeleportationReturn) | Starts a default WebXR experience in VR with teleportation over the given ground meshes, as `createDefaultXRExperienceWithTeleportation` does, and gives back the experience with the near menu, button and text it created plus a `dispose` function to end it. |
| [`simple.createImmersiveARExperience`](https://docs.bitbybit.dev/classes/Bit.BabylonWebXRSimple#createImmersiveARExperience) | Starts a default WebXR experience in immersive AR mode, showing the scene over the camera view of the room on a device that supports it. |

{/* api:babylon.webXr:end */}
