---
sidebar_position: 5
title: Meshes and Nodes
sidebar_label: Meshes and Nodes
description: The bitbybit.babylon functions for what is already in the scene - moving, turning, scaling, hiding and cloning drawn meshes, parenting them to transform nodes, BabylonJS's own mesh primitives, and transformation matrices - with a table of every function.
topic: code.babylon.meshes
type: reference
tags: [code, babylonjs]
---

# Meshes and nodes

What `draw` gives back is a BabylonJS mesh, and these functions work on it, without going back to the kernel. Moving a drawn mesh is instant, so animate and arrange with them, and rebuild geometry only when its form changes.

- **Meshes** (`babylon.mesh`): position, rotation and scale; visibility and pickability; cloning, instancing and merging; materials; collisions and intersection tests; and reading a mesh's vertices.
- **Nodes** (`babylon.node`): invisible transform nodes that meshes are parented to, so moving one node moves everything under it, the way a door's hinge carries the door.
- **Mesh primitives** (`babylon.meshBuilder`): BabylonJS's own boxes, spheres, cylinders, planes and more, built straight into the scene as meshes, for helpers and effects that need no CAD kernel.
- **Matrices** (`babylon.transforms`): transformation matrices built with BabylonJS's maths.

## Every function

### Meshes

{/* api:babylon.mesh:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`clone`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#clone) | Makes a copy of a mesh, with its children, that shares the geometry of the original and is placed at the same spot; the copy casts and receives shadows like the original. |
| [`cloneToPositions`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#cloneToPositions) | Makes one copy of a mesh at every given position, in the same order; the copies share the geometry of the original. |
| [`convertToFlatShadedMesh`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#convertToFlatShadedMesh) | Gives every triangle of a mesh its own vertices and normals, so faces show as flat facets instead of being smoothed across edges; the mesh is changed in place and given back. |
| [`createMeshInstance`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#createMeshInstance) | Creates an instance of a mesh, a lightweight copy that shares its geometry and draws cheaply when many alike are needed, placed where the original is. |
| [`createMeshInstanceAndTransform`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#createMeshInstanceAndTransform) | Creates an instance of a mesh, a lightweight copy that shares its geometry and draws cheaply, and places it at the given position, rotation in degrees and scaling. |
| [`createMeshInstanceAndTransformNoReturn`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#createMeshInstanceAndTransformNoReturn) | Creates a placed instance of a mesh, as `createMeshInstanceAndTransform` does, without giving it back; for scripts that only need the copy to appear. |
| [`disablePointerMoveEvents`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#disablePointerMoveEvents) | Stops a mesh, and its children when `includeChildren` is true, from reacting to pointer moves, back to the default. |
| [`dispose`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#dispose) | Removes a mesh from the scene and frees its GPU resources; the mesh cannot be used afterwards. |
| [`enablePointerMoveEvents`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#enablePointerMoveEvents) | Lets a mesh, and its children when `includeChildren` is true, react to the pointer merely moving over it, which is off by default because it costs a pick on every pointer move. |
| [`getAbsolutePosition`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getAbsolutePosition) | Reads the position of a mesh in world coordinates, with every parent's transform applied. |
| [`getCheckCollisions`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getCheckCollisions) | Reads whether a mesh takes part in collision checking. |
| [`getChildMeshes`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getChildMeshes) | Lists the meshes parented under a mesh: all descendants, or only the direct children when `directDescendantsOnly` is true. |
| [`getId`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getId) | Reads the id of a mesh, the label set by `setId` or by the loader that created it. |
| [`getMaterial`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getMaterial) | Reads the material of a mesh, the surface description its faces are drawn with. |
| [`getMeshesOfId`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getMeshesOfId) | Finds every mesh in the scene with exactly the given id; ids need not be unique, so several may match. |
| [`getMeshesWhereNameContains`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getMeshesWhereNameContains) | Finds every mesh in the scene whose name contains the given text, case-sensitive, in scene order. |
| [`getMeshOfId`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getMeshOfId) | Finds the first mesh in the scene with exactly the given id; use `getMeshesOfId` when several share it. |
| [`getMeshOfUniqueId`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getMeshOfUniqueId) | Finds the mesh with the given unique id, the number the scene assigns to every mesh once, as `getUniqueId` reads it. |
| [`getName`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getName) | Reads the name of a mesh, as set by `setName` or by whatever created it. |
| [`getParent`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getParent) | Reads the node a mesh is parented to, which is what it moves with; a mesh at the top level has none. |
| [`getPickable`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getPickable) | Reads whether the mesh can be picked with the pointer. |
| [`getPosition`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getPosition) | Reads the position of a mesh relative to its parent, as a point. |
| [`getRotation`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getRotation) | Reads the rotation of a mesh around X, Y and Z, in radians, as its rotation property holds it. |
| [`getScale`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getScale) | Reads the scale factors of a mesh along X, Y and Z; 1 is unscaled. |
| [`getSideOrientation`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getSideOrientation) | Turns a side orientation choice into the number the engine uses for it, for building meshes by hand. |
| [`getUniqueId`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getUniqueId) | Reads the unique id of a mesh, the number the scene gives every mesh once and never reuses. |
| [`getVerticesAsPolygonPoints`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#getVerticesAsPolygonPoints) | Reads the triangles of a mesh as lists of three points in the mesh's own coordinates, the form `jscad.shapes.fromPolygonPoints` and similar builders take. |
| [`hide`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#hide) | Hides a mesh without removing it from the scene, and its child meshes too when `includeChildren` is true; `show` brings it back. |
| [`intersectsMesh`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#intersectsMesh) | Tells whether two meshes overlap, judged by their bounding boxes: axis-aligned ones by default, or boxes that follow each mesh's rotation when `precise` is true; `includeDescendants` tests their children too. |
| [`intersectsPoint`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#intersectsPoint) | Tells whether a point lies inside the bounding box of a mesh. |
| [`mergeMeshes`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#mergeMeshes) | Joins several meshes into one new mesh, which draws faster than many separate ones. |
| [`moveBackward`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#moveBackward) | Moves a mesh against its own forward direction, the local Z axis, by `distance` scene units. |
| [`moveDown`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#moveDown) | Moves a mesh against its own up direction, the local Y axis, by `distance` scene units. |
| [`moveForward`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#moveForward) | Moves a mesh along its own forward direction, the local Z axis, by `distance` scene units; a turned mesh moves the way it faces. |
| [`moveLeft`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#moveLeft) | Moves a mesh against its own right direction, the local X axis, by `distance` scene units. |
| [`moveRight`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#moveRight) | Moves a mesh along its own right direction, the local X axis, by `distance` scene units. |
| [`moveUp`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#moveUp) | Moves a mesh along its own up direction, the local Y axis, by `distance` scene units. |
| [`pitch`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#pitch) | Turns a mesh around its own X axis by `rotate` degrees, on top of its current rotation, the way a nose tips up or down. |
| [`roll`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#roll) | Turns a mesh around its own Z axis by `rotate` degrees, on top of its current rotation, the way a wing banks. |
| [`rotateAroundAxisWithPosition`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#rotateAroundAxisWithPosition) | Turns a mesh by `angle` degrees around an axis that passes through `position`, so the mesh orbits that point rather than spinning in place. |
| [`setCheckCollisions`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#setCheckCollisions) | Turns collision checking on or off for a mesh, and its children when `includeChildren` is true, so a camera or another collider with collisions enabled cannot pass through it. |
| [`setId`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#setId) | Sets the id of a mesh, a label that `getMeshOfId` finds it by and that need not be unique. |
| [`setLocalScale`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#setLocalScale) | Multiplies the current scale of a mesh, or an instance of one, by one factor on all axes, so 2 doubles whatever size it has. |
| [`setMaterial`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#setMaterial) | Gives a mesh a material, and its children too when `includeChildren` is true; the material decides the color, shininess and transparency of its surface. |
| [`setName`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#setName) | Sets the name of a mesh, and of its children too when `includeChildren` is true; names are what `getMeshesWhereNameContains` searches. |
| [`setParent`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#setParent) | Makes one mesh the child of another, so it moves, turns and scales together with its parent from then on; its position becomes relative to the parent. |
| [`setPickable`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#setPickable) | Sets whether a mesh answers to pointer picking, and its children too when `includeChildren` is true; an unpickable mesh is skipped by clicks and rays that pick. |
| [`setPosition`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#setPosition) | Places a mesh, or an instance of one, at a point relative to its parent. |
| [`setRotation`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#setRotation) | Sets the rotation of a mesh, or an instance of one, as angles in degrees around X, Y and Z, replacing its current rotation. |
| [`setScale`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#setScale) | Sets the scale factors of a mesh, or an instance of one, along X, Y and Z, replacing its current scale; 1 is unscaled. |
| [`setVisibility`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#setVisibility) | Sets how visible a mesh is, from 0 for fully transparent to 1 for fully shown, with the values between fading it; `includeChildren` applies the same value to its child meshes. |
| [`show`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#show) | Shows a mesh that `hide` or a hidden draw made invisible, and its child meshes too when `includeChildren` is true. |
| [`updateDrawn`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#updateDrawn) | Moves, rotates, scales and recolors a drawn mesh in place, without drawing it again, which is faster when only the placement or the color changes. |
| [`yaw`](https://docs.bitbybit.dev/classes/Bit.BabylonMesh#yaw) | Turns a mesh around its own Y axis by `rotate` degrees, on top of its current rotation, the way a car turns left or right. |

{/* api:babylon.mesh:end */}

### Nodes

{/* api:babylon.node:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`createNodeFromRotation`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#createNodeFromRotation) | Creates a node at `origin` turned by the three `rotation` angles in degrees around X, Y and Z, inside the coordinate system of `parent` when one is given. |
| [`createWorldNode`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#createWorldNode) | Creates a node parented to the root node of the scene, a fresh starting point for building a hierarchy at the world origin. |
| [`drawNode`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#drawNode) | Draws the three axes of a node as colored lines of the given length, parented to it, so its position and orientation can be seen; the default colors are red for X, green for Y and blue for Z. |
| [`drawNodes`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#drawNodes) | Draws the three axes of several nodes as colored lines of the given length, each set parented to its node, as `drawNode` does for one, replacing the axes drawn on a node before. |
| [`getAbsoluteForwardVector`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getAbsoluteForwardVector) | Reads the direction a node's local Z axis points in world space, with every parent's rotation applied. |
| [`getAbsolutePosition`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getAbsolutePosition) | Reads where a node's origin is in world space, with every parent's transform applied. |
| [`getAbsoluteRightVector`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getAbsoluteRightVector) | Reads the direction a node's local X axis points in world space, with every parent's rotation applied. |
| [`getAbsoluteRotationTransformation`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getAbsoluteRotationTransformation) | Reads the rotation of a node in world space, with every parent's rotation applied, as a 4x4 matrix of 16 numbers. |
| [`getAbsoluteUpVector`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getAbsoluteUpVector) | Reads the direction a node's local Y axis points in world space, with every parent's rotation applied. |
| [`getChildren`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getChildren) | Lists the nodes and meshes parented directly under a node, the ones that move with it. |
| [`getParent`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getParent) | Reads the node a node is parented to, the one it moves with; a top-level node has none. |
| [`getPositionExpressedInLocalSpace`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getPositionExpressedInLocalSpace) | Reads a node's position measured in its own local axes rather than its parent's, which differs once the node is rotated. |
| [`getRootNode`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getRootNode) | Gives the root node of the scene, the top of the hierarchy that `createWorldNode` parents to. |
| [`getRotation`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getRotation) | Reads a node's rotation relative to its parent as three angles in degrees around X, Y and Z. |
| [`getRotationTransformation`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getRotationTransformation) | Reads the rotation of a node relative to its parent as a 4x4 matrix of 16 numbers; the node must carry a rotation quaternion, which `rotate` and `setDirection` give it. |
| [`rotate`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#rotate) | Turns a node by `angle` degrees around an axis through its own origin, on top of its current rotation; its children follow. |
| [`rotateAroundAxisWithPosition`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#rotateAroundAxisWithPosition) | Turns a node by `angle` degrees around an axis that passes through `position`, so the node orbits that point rather than spinning in place; its children follow. |
| [`setAbsolutePosition`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#setAbsolutePosition) | Moves a node to a point in world space, whatever its parents are; its children follow. |
| [`setDirection`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#setDirection) | Turns a node so its local Z axis points along `direction`; its children follow. |
| [`setParent`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#setParent) | Parents a node to another so it moves with it from then on, keeping its current place in the world; a null parent detaches it. |
| [`translate`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#translate) | Moves a node by `distance` scene units along `direction`, given in the node's own local axes; its children follow. |

{/* api:babylon.node:end */}

### Mesh primitives

{/* api:babylon.meshBuilder:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`createBox`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createBox) | Builds a box centered on the origin with `width` along X, `height` along Y and `depth` along Z. |
| [`createCapsule`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createCapsule) | Builds a capsule, a cylinder with rounded ends, of the given `height` and `radius` along `orientation`; `radiusTop` and `radiusBottom` size the two ends separately. |
| [`createCube`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createCube) | Builds a cube centered on the origin with every edge `size` long. |
| [`createCylinder`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createCylinder) | Builds a cylinder standing along Y, centered on the origin; different top and bottom diameters make a cone or a taper, and 0 closes an end to a point. |
| [`createDisc`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createDisc) | Builds a flat disc of the given `radius` centered on the origin in the XY plane; `arc` below 1 leaves a pie slice, so 0.5 is a half disc. |
| [`createExtrudedSahpe`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createExtrudedSahpe) | Sweeps a profile along a path: `shape` is the profile as points in the XY plane and `path` the points it travels through, with `scale` and `rotation` in radians applied step by step along the way. |
| [`createGeodesic`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createGeodesic) | Builds a geodesic sphere, an icosahedron whose faces are subdivided into triangles as `m` and `n` say, so the surface is made of near-equal triangles. |
| [`createGoldberg`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createGoldberg) | Builds a Goldberg polyhedron, a ball made of hexagons and twelve pentagons like a football, with `m` and `n` setting how many hexagons there are. |
| [`createGround`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createGround) | Builds a flat ground plane centered on the origin in the XZ plane, `width` along X and `height` along Z, divided into a grid of `subdivisionsX` by `subdivisionsY` cells. |
| [`createIcoSphere`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createIcoSphere) | Builds a sphere from evenly sized triangles, subdivided from an icosahedron, which shades more evenly than `createSphere`. |
| [`createLathe`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createLathe) | Revolves a profile around the Y axis, the way a lathe turns wood: `shape` is the profile as points in the XY plane with X as the distance from the axis, `radius` pushes it outward, and `arc` below 1 leaves the revolution open. |
| [`createPolygon`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createPolygon) | Builds a flat filled polygon from its outline points, with optional holes, lying in the XZ plane; a `depth` above 0 gives it thickness downward. |
| [`createPolyhedron`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createPolyhedron) | Builds one of the fifteen built-in polyhedra by `type`, from tetrahedron (0) to elongated pentagonal cupola (14), or your own from `custom` data. |
| [`createRectanglePlane`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createRectanglePlane) | Builds a flat rectangle centered on the origin in the XY plane, `width` along X and `height` along Y, facing the Z axis. |
| [`createRibbon`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createRibbon) | Builds a surface through several paths of points, joining neighboring paths with triangles, like cloth stretched over a set of lines. |
| [`createSphere`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createSphere) | Builds a sphere of the given `diameter` centered on the origin; `segments` sets how finely it is divided, more being rounder and heavier. |
| [`createSquarePlane`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createSquarePlane) | Builds a flat square of side `size` centered on the origin in the XY plane, facing the Z axis; a single-sided plane is invisible from behind unless `sideOrientation` is double-sided. |
| [`createTorus`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createTorus) | Builds a ring lying in the XZ plane around the origin: `diameter` is the ring's overall diameter and `thickness` the diameter of its tube. |
| [`createTorusKnot`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createTorusKnot) | Builds a tube wound into a knot around the origin: `p` and `q` are how many times it winds around the ring and through its hole, so 2 and 3 give the classic trefoil. |
| [`createTube`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#createTube) | Builds a tube of the given `radius` along a path of points; `cap` closes neither, one or both ends, and `arc` below 1 leaves the tube open along its length. |
| [`extrudePolygon`](https://docs.bitbybit.dev/classes/Bit.BabylonMeshBuilder#extrudePolygon) | Builds a solid by extruding a flat polygon, given by its outline points in the XZ plane with optional holes, downward by `depth`. |

{/* api:babylon.meshBuilder:end */}

### Matrices

{/* api:babylon.transforms:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`rotationCenterAxis`](https://docs.bitbybit.dev/classes/Bit.BabylonTransforms#rotationCenterAxis) | Builds a rotation about an axis that passes through a center point, as three matrices applied in order: move the center to the origin, rotate, move back. |
| [`rotationCenterX`](https://docs.bitbybit.dev/classes/Bit.BabylonTransforms#rotationCenterX) | Builds a rotation about a line parallel to the X axis through a center point, as three matrices applied in order: move the center to the origin, rotate, move back. |
| [`rotationCenterY`](https://docs.bitbybit.dev/classes/Bit.BabylonTransforms#rotationCenterY) | Builds a rotation about a line parallel to the Y axis through a center point, as three matrices applied in order: move the center to the origin, rotate, move back. |
| [`rotationCenterYawPitchRoll`](https://docs.bitbybit.dev/classes/Bit.BabylonTransforms#rotationCenterYawPitchRoll) | Builds a rotation from three angles about a center point: yaw turns about Y, pitch about X and roll about Z, in degrees. |
| [`rotationCenterZ`](https://docs.bitbybit.dev/classes/Bit.BabylonTransforms#rotationCenterZ) | Builds a rotation about a line parallel to the Z axis through a center point, as three matrices applied in order: move the center to the origin, rotate, move back. |
| [`scaleCenterXYZ`](https://docs.bitbybit.dev/classes/Bit.BabylonTransforms#scaleCenterXYZ) | Builds a scale with its own factor per axis, measured from a center point that stays in place, as three matrices applied in order: move the center to the origin, scale, move back. |
| [`scaleXYZ`](https://docs.bitbybit.dev/classes/Bit.BabylonTransforms#scaleXYZ) | Builds a scale with its own factor per axis, measured from the origin; `[2, 3, 1]` doubles X, triples Y and keeps Z. |
| [`translationsXYZ`](https://docs.bitbybit.dev/classes/Bit.BabylonTransforms#translationsXYZ) | Builds one move per vector, for transforming many objects each by its own vector, in the same order. |
| [`translationXYZ`](https://docs.bitbybit.dev/classes/Bit.BabylonTransforms#translationXYZ) | Builds a move by a vector; `[10, 5, 0]` moves 10 along X, 5 along Y and nothing along Z. |
| [`uniformScale`](https://docs.bitbybit.dev/classes/Bit.BabylonTransforms#uniformScale) | Builds a scale by the same factor on every axis, measured from the origin, so 2 makes everything twice as big and twice as far from the origin. |
| [`uniformScaleFromCenter`](https://docs.bitbybit.dev/classes/Bit.BabylonTransforms#uniformScaleFromCenter) | Builds a scale by the same factor on every axis, measured from a center point that stays in place, as three matrices applied in order: move the center to the origin, scale, move back. |

{/* api:babylon.transforms:end */}
