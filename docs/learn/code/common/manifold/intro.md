---
sidebar_position: 1
title: The Manifold Kernel
sidebar_label: Manifold
description: Manifold, Bitbybit's fast mesh kernel - solids that always stay closed, cross sections that extrude, revolve, loft and sweep, booleans in bulk, meshes, recipes, and moving shapes between OpenCascade and Manifold - with examples in Rete, Blockly and TypeScript and a table of every function.
topic: code.manifold.intro
type: explanation
tags: [code, manifold]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# The Manifold kernel

[Manifold](https://github.com/elalish/manifold) is a kernel for solids made of triangles. Its booleans are fast, and they always give a **closed solid**, a mesh with no holes or loose edges that a slicer or a game engine accepts as it is. Reach for it when a model needs hundreds or thousands of cuts, when it is a lattice or a pattern, or when the input is already a mesh, such as a scan. [Choosing a kernel](../concepts/choosing-a-kernel) compares it with OpenCascade and JSCAD.

What it does not have: true curves and fillets. A Manifold cylinder is a prism of `circularSegments` sides, and a round edge is a set of flat faces.

## Two kinds of shape

- **Solids**, under `bitbybit.manifold.manifold`: `shapes` makes cubes, spheres, cylinders and solids from meshes; `booleans` fuses, cuts and splits; `operations` hulls, slices, refines and smooths; `transforms` moves, turns, scales and warps; `evaluate` measures.
- **Cross sections**, under `bitbybit.manifold.crossSection`: flat outlines in the XY plane, from squares, rectangles, circles and polygons, with booleans and offsets of their own, which `operations` turns into solids by extruding, revolving, lofting or sweeping.

Manifold builds along **Z**. A shape extruded from a cross section rises along Z, which lies flat in Bitbybit's Y-up scene, so turn it -90 degrees about X to stand it up, as the example below does.

## A cross section extruded with a twist

A square is extruded eight units with a quarter twist and a top four tenths as wide, then turned to stand up:

{/* example:twisted-tower:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"square\":{\"id\":\"square\",\"name\":\"bitbybit.manifold.crossSection.shapes.square\",\"customName\":\"square\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"center\":true,\"size\":3},\"inputs\":{},\"position\":[40,40]},\"extrude\":{\"id\":\"extrude\",\"name\":\"bitbybit.manifold.crossSection.operations.extrude\",\"customName\":\"extrude\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"height\":8,\"nDivisions\":40,\"twistDegrees\":90,\"scaleTopX\":0.4,\"scaleTopY\":0.4,\"center\":false},\"inputs\":{\"crossSection\":{\"connections\":[{\"node\":\"square\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"standUp\":{\"id\":\"standUp\",\"name\":\"bitbybit.manifold.manifold.transforms.rotate\",\"customName\":\"rotate\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"manifold\":{\"connections\":[{\"node\":\"extrude\",\"output\":\"result\",\"data\":{}}]},\"vector\":{\"connections\":[{\"node\":\"turn\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]},\"turn\":{\"id\":\"turn\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":-90,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[460,520]}},\"modules\":{}}","type":"rete"}}
  title="A twisted tower from a square in Rete"
  description="A square cross section extruded along Z with a quarter twist and a narrower top, then turned to stand up along Y."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.vector.vectorXYZ\" x=\"0\" y=\"0\"></block><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.manifold.manifold.transforms.rotate\"><value name=\"Manifold\"><block type=\"bitbybit.manifold.crossSection.operations.extrude\"><value name=\"CrossSection\"><block type=\"bitbybit.manifold.crossSection.shapes.square\"><value name=\"Center\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"Size\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">8</field></block></value><value name=\"NDivisions\"><block type=\"math_number\"><field name=\"NUM\">40</field></block></value><value name=\"TwistDegrees\"><block type=\"math_number\"><field name=\"NUM\">90</field></block></value><value name=\"ScaleTopX\"><block type=\"math_number\"><field name=\"NUM\">0.4</field></block></value><value name=\"ScaleTopY\"><block type=\"math_number\"><field name=\"NUM\">0.4</field></block></value><value name=\"Center\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"Vector\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">-90</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></xml>","type":"blockly"}}
  title="A twisted tower from a square in Blockly"
  description="A square cross section extruded along Z with a quarter twist and a narrower top, then turned to stand up along Y."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const square = await bitbybit.manifold.crossSection.shapes.square({ size: 3, center: true });\nconst tower = await bitbybit.manifold.crossSection.operations.extrude({\n    crossSection: square,\n    height: 8,\n    nDivisions: 40,\n    twistDegrees: 90,\n    scaleTopX: 0.4,\n    scaleTopY: 0.4,\n    center: false,\n});\nconst standing = await bitbybit.manifold.manifold.transforms.rotate({ manifold: tower, vector: [-90, 0, 0] });\n\nawait bitbybit.draw.drawAnyAsync({ entity: standing });","type":"typescript"}}
  title="A twisted tower from a square in TypeScript"
  description="A square cross section extruded along Z with a quarter twist and a narrower top, then turned to stand up along Y."
/>

</TabItem>
</Tabs>

{/* example:twisted-tower:end */}

`nDivisions` is how many layers the extrusion is built from: a twist needs enough of them to look smooth.

## From OpenCascade into Manifold

A model can start exact and finish fast. `bitbybit.occt.shapeToManifoldMesh` meshes an OpenCascade shape into the form Manifold takes, and `manifold.manifold.shapes.manifoldFromMesh` makes a Manifold solid of it. Here a box is rounded in OpenCascade, where fillets are exact, then carried into Manifold and hollowed there by a sphere just large enough to break through each face:

{/* example:exact-then-mesh:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"box\":{\"id\":\"box\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":4,\"length\":4,\"height\":4,\"center\":[0,0,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,40]},\"fillet\":{\"id\":\"fillet\",\"name\":\"bitbybit.occt.fillets.filletEdges\",\"customName\":\"fillet edges\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":0.6},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"box\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"mesh\":{\"id\":\"mesh\",\"name\":\"bitbybit.occt.shapeToManifoldMesh\",\"customName\":\"shape to manifold mesh\",\"async\":true,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"precision\":0.01},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"fillet\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]},\"solid\":{\"id\":\"solid\",\"name\":\"bitbybit.manifold.manifold.shapes.manifoldFromMesh\",\"customName\":\"manifold from mesh\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"mesh\":{\"connections\":[{\"node\":\"mesh\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1300,40]},\"sphere\":{\"id\":\"sphere\",\"name\":\"bitbybit.manifold.manifold.shapes.sphere\",\"customName\":\"sphere\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":2.5,\"circularSegments\":64},\"inputs\":{},\"position\":[1300,420]},\"cut\":{\"id\":\"cut\",\"name\":\"bitbybit.manifold.manifold.booleans.differenceTwo\",\"customName\":\"difference two\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"manifold1\":{\"connections\":[{\"node\":\"solid\",\"output\":\"result\",\"data\":{}}]},\"manifold2\":{\"connections\":[{\"node\":\"sphere\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1720,40]}},\"modules\":{}}","type":"rete"}}
  title="A filleted OpenCascade box cut in Manifold in Rete"
  description="A box rounded in OpenCascade, meshed into Manifold and hollowed there by a sphere that breaks through each face."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.manifold.manifold.booleans.differenceTwo\"><value name=\"Manifold1\"><block type=\"bitbybit.manifold.manifold.shapes.manifoldFromMesh\"><value name=\"Mesh\"><block type=\"bitbybit.occt.shapeToManifoldMesh\"><value name=\"Shape\"><block type=\"bitbybit.occt.fillets.filletEdges\"><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">0.6</field></block></value></block></value><value name=\"Precision\"><block type=\"math_number\"><field name=\"NUM\">0.01</field></block></value></block></value></block></value><value name=\"Manifold2\"><block type=\"bitbybit.manifold.manifold.shapes.sphere\"><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">2.5</field></block></value><value name=\"CircularSegments\"><block type=\"math_number\"><field name=\"NUM\">64</field></block></value></block></value></block></value></block></xml>","type":"blockly"}}
  title="A filleted OpenCascade box cut in Manifold in Blockly"
  description="A box rounded in OpenCascade, meshed into Manifold and hollowed there by a sphere that breaks through each face."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const box = await bitbybit.occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, 0] });\nconst rounded = await bitbybit.occt.fillets.filletEdges({ shape: box, radius: 0.6 });\n\nconst mesh = await bitbybit.occt.shapeToManifoldMesh({ shape: rounded, precision: 0.01 });\nconst solid = await bitbybit.manifold.manifold.shapes.manifoldFromMesh({ mesh });\nconst sphere = await bitbybit.manifold.manifold.shapes.sphere({ radius: 2.5, circularSegments: 64 });\nconst corners = await bitbybit.manifold.manifold.booleans.differenceTwo({ manifold1: solid, manifold2: sphere });\n\nawait bitbybit.draw.drawAnyAsync({ entity: corners });","type":"typescript"}}
  title="A filleted OpenCascade box cut in Manifold in TypeScript"
  description="A box rounded in OpenCascade, meshed into Manifold and hollowed there by a sphere that breaks through each face."
/>

</TabItem>
</Tabs>

{/* example:exact-then-mesh:end */}

The way back gives only flat triangles: keep the OpenCascade shape if you need exact geometry again, for STEP or another fillet.

## Meshes and recipes

`manifold.manifold.manifoldToMesh` hands out a solid's triangles as plain data, which `bitbybit.manifold.mesh` reads, for your own processing or export. `bitbybit.manifold.recipes` builds whole solids described as data, polygons, extrusions, turns, lofts, cuts and unions, in one call, and draws thousands of repeated parts as instances.

## Freeing memory

Manifold keeps its shapes in a worker, like OpenCascade: `manifold.deleteManifoldOrCrossSection` and `deleteManifoldsOrCrossSections` free the ones a script no longer needs. [Shapes live in a worker](../concepts/shapes-live-in-a-worker) explains why.

## Every function

### Solids

{/* api:manifold.manifold:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`booleans.add`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#add) | Fuses two solids into one closed, watertight solid. |
| [`booleans.difference`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#difference) | Cuts every further solid in the list out of the first one. |
| [`booleans.differenceTwo`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#differenceTwo) | Cuts the second solid out of the first, the same as `subtract`. |
| [`booleans.intersect`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#intersect) | Keeps only the volume two solids share, dropping everything else. |
| [`booleans.intersection`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#intersection) | Keeps only the volume all the solids in a list share. |
| [`booleans.intersectionTwo`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#intersectionTwo) | Keeps only the volume two solids share, the same as `intersect`. |
| [`booleans.minkowskiDifference`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#minkowskiDifference) | Sweeps the second solid over the whole surface of the first and cuts away everything it passes through, shrinking the first solid by the shape of the second - the Minkowski difference, the erosion that undoes a Minkowski sum. |
| [`booleans.minkowskiSum`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#minkowskiSum) | Sweeps the second solid over the whole surface of the first and fuses everything it passes through, growing the first solid by the shape of the second - the Minkowski sum, which is how a solid is rounded or padded by a sphere. |
| [`booleans.split`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#split) | Cuts a solid with another solid and keeps both pieces: the part inside the cutter and the part outside it. |
| [`booleans.splitByPlane`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#splitByPlane) | Cuts a solid with a plane and keeps both pieces. |
| [`booleans.splitByPlaneOnOffsets`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#splitByPlaneOnOffsets) | Cuts a solid into slabs with several parallel planes, all with the same normal, at the given distances from the origin. |
| [`booleans.subtract`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#subtract) | Cuts the second solid out of the first, leaving what remains of the first. |
| [`booleans.trimByPlane`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#trimByPlane) | Cuts a solid with a plane and keeps only the part on the side the normal points to. |
| [`booleans.union`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#union) | Fuses all the solids in a list into one. |
| [`booleans.unionTwo`](https://docs.bitbybit.dev/classes/Bit.ManifoldBooleans#unionTwo) | Fuses two solids into one, the same as `add`. |
| [`evaluate.boundingBox`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#boundingBox) | Finds the axis-aligned box around every vertex of a solid. |
| [`evaluate.genus`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#genus) | Counts the holes through a solid, the way a ring has one and a sphere none. |
| [`evaluate.isEmpty`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#isEmpty) | Tells whether a solid has no triangles at all, as the result of an intersection of shapes that do not overlap would. |
| [`evaluate.minGap`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#minGap) | Measures the smallest distance between two solids, searching no farther than `searchLength`. |
| [`evaluate.numEdge`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#numEdge) | Counts the edges of a solid's mesh, each shared by two triangles. |
| [`evaluate.numProp`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#numProp) | Counts the property channels each vertex of a solid carries; the position alone takes three. |
| [`evaluate.numPropVert`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#numPropVert) | Counts the property vertices of a solid, which is at least `numVert`: a vertex whose neighboring triangles carry different properties, such as a sharp edge with two normals, is stored more than once. |
| [`evaluate.numTri`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#numTri) | Counts the triangles of a solid's mesh, which is its whole surface. |
| [`evaluate.numVert`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#numVert) | Counts the vertices of a solid's mesh, the corners its triangles share. |
| [`evaluate.originalID`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#originalID) | Reads the id of a solid that is an original, as `operations.asOriginal` or a freshly built solid makes it; a solid produced from others by an operation reports -1. |
| [`evaluate.rayCast`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#rayCast) | Shoots a ray segment from one point to another and lists every place it crosses the surface of a solid, nearest first; an empty list when it misses. |
| [`evaluate.status`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#status) | Tells why a solid came out empty: `NoError`, or a reason such as `NotManifold` or `InvalidConstruction` when the mesh it was built from was not a closed surface. |
| [`evaluate.surfaceArea`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#surfaceArea) | Measures the total surface area of a solid, in square model units. |
| [`evaluate.tolerance`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#tolerance) | Reads the tolerance of a solid, the rounding error that has built up over the transforms and operations that made it. |
| [`evaluate.volume`](https://docs.bitbybit.dev/classes/Bit.ManifoldEvaluate#volume) | Measures the volume of a solid, in cubic model units. |
| [`manifoldsToMeshes`](https://docs.bitbybit.dev/classes/Bit.Manifold#manifoldsToMeshes) | Turns several solids into plain mesh data, as `manifoldToMesh` does for one. |
| [`manifoldToMesh`](https://docs.bitbybit.dev/classes/Bit.Manifold#manifoldToMesh) | Turns a solid into plain mesh data: vertex properties, triangle indexes and the runs that group triangles by their original shape. |
| [`operations.asOriginal`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#asOriginal) | Makes a copy of a solid that counts as a new original, so the copy can carry its own vertex properties, such as a different UV mapping, and be told apart from what it was built from. |
| [`operations.calculateCurvature`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#calculateCurvature) | Computes how strongly the surface bends at every vertex and stores it in property channels: Gaussian curvature at `gaussianIdx`, mean curvature at `meanIdx`. |
| [`operations.calculateNormals`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#calculateNormals) | Computes a normal for every vertex from the mesh and stores it in three property channels starting at `normalIdx`. |
| [`operations.compose`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#compose) | Packs several solids into one, the inverse of `decompose`. |
| [`operations.decompose`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#decompose) | Splits a solid into its separate, unconnected pieces, the inverse of `compose`. |
| [`operations.hull`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#hull) | Wraps a solid in its convex hull, the smallest shape without dents that contains it, like shrink-wrap pulled tight over it. |
| [`operations.hullPoints`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#hullPoints) | Wraps points, solids or a mix of both in one convex hull, the smallest shape without dents that contains them all. |
| [`operations.project`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#project) | Flattens a solid onto the XY plane and returns its outline as a cross-section, like its shadow under a light straight above. |
| [`operations.refine`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#refine) | Adds triangles to a solid by splitting every edge into `number` pieces; with 2, each triangle becomes four. |
| [`operations.refineToLength`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#refineToLength) | Adds triangles to a solid by splitting every edge into pieces of roughly the given length, adding inner vertices to keep the triangles even. |
| [`operations.refineToTolerance`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#refineToTolerance) | Adds triangles to a smoothed solid until every point of its mesh lies within `tolerance` of the smooth surface, so tightly curved regions get more triangles than flat ones. |
| [`operations.reserveIds`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#reserveIds) | Reserves a run of `count` unique mesh ids and returns the first, for marking sets of triangles that can be found again after later operations. |
| [`operations.setProperties`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#setProperties) | Rewrites the vertex properties of a solid with a function that receives each vertex's position and old properties and fills in the new ones. |
| [`operations.setTolerance`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#setTolerance) | Gives a solid a new tolerance, the rounding error it is allowed to carry, and simplifies its mesh when the tolerance grows. |
| [`operations.simplify`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#simplify) | Removes vertices from a solid's mesh while keeping every surface within `tolerance` of where it was, to cut the triangle count. |
| [`operations.slice`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#slice) | Cuts a solid with a plane parallel to the XY plane at the given Z height and returns the flat section as a cross-section. |
| [`operations.smoothByNormals`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#smoothByNormals) | Marks a solid for smoothing using the normals stored in its vertex properties, so a later `refine` or `refineToLength` bends the new triangles into a smooth surface. |
| [`operations.smoothOut`](https://docs.bitbybit.dev/classes/Bit.ManifoldOperations#smoothOut) | Marks a solid for smoothing by working out tangents from its triangles, so a later `refine` or `refineToLength` bends the new triangles into a smooth surface. |
| [`shapes.cube`](https://docs.bitbybit.dev/classes/Bit.ManifoldShapes#cube) | Creates a cube solid with the given side length. |
| [`shapes.cylinder`](https://docs.bitbybit.dev/classes/Bit.ManifoldShapes#cylinder) | Creates a cylinder solid standing along Z, or a cone when the top radius differs from the bottom one. |
| [`shapes.fromPolygonPoints`](https://docs.bitbybit.dev/classes/Bit.ManifoldShapes#fromPolygonPoints) | Builds a solid from a list of triangles, each given as three points, merging points that coincide. |
| [`shapes.manifoldFromMesh`](https://docs.bitbybit.dev/classes/Bit.ManifoldShapes#manifoldFromMesh) | Builds a solid from plain mesh data, the form `manifoldToMesh` hands out, so a mesh can make a round trip through other tools. |
| [`shapes.sphere`](https://docs.bitbybit.dev/classes/Bit.ManifoldShapes#sphere) | Creates a sphere solid of the given radius, centered on the origin. |
| [`shapes.tetrahedron`](https://docs.bitbybit.dev/classes/Bit.ManifoldShapes#tetrahedron) | Creates a tetrahedron solid centered on the origin, with one corner at `[1, 1, 1]` and the others placed symmetrically. |
| [`transforms.mirror`](https://docs.bitbybit.dev/classes/Bit.ManifoldTransforms#mirror) | Mirrors a solid across the plane through the origin with the given normal. |
| [`transforms.rotate`](https://docs.bitbybit.dev/classes/Bit.ManifoldTransforms#rotate) | Rotates a solid about the origin by Euler angles in degrees: first about X, then Y, then Z. |
| [`transforms.rotateXYZ`](https://docs.bitbybit.dev/classes/Bit.ManifoldTransforms#rotateXYZ) | Rotates a solid about the origin by separate angles in degrees about X, then Y, then Z. |
| [`transforms.scale`](https://docs.bitbybit.dev/classes/Bit.ManifoldTransforms#scale) | Scales a solid by a factor per axis, about the origin; it takes the same inputs as `scale3D`, so use equal factors for a uniform scale. |
| [`transforms.scale3D`](https://docs.bitbybit.dev/classes/Bit.ManifoldTransforms#scale3D) | Scales a solid by a separate factor along X, Y and Z, about the origin. |
| [`transforms.transform`](https://docs.bitbybit.dev/classes/Bit.ManifoldTransforms#transform) | Applies a 4x4 matrix to a solid. |
| [`transforms.transforms`](https://docs.bitbybit.dev/classes/Bit.ManifoldTransforms#transforms) | Applies a list of 4x4 matrices to a solid one after another, first to last, and returns the final result. |
| [`transforms.translate`](https://docs.bitbybit.dev/classes/Bit.ManifoldTransforms#translate) | Moves a solid by a vector, in model units. |
| [`transforms.translateByVectors`](https://docs.bitbybit.dev/classes/Bit.ManifoldTransforms#translateByVectors) | Makes one moved copy of a solid per vector, for laying out repeats. |
| [`transforms.translateXYZ`](https://docs.bitbybit.dev/classes/Bit.ManifoldTransforms#translateXYZ) | Moves a solid by separate distances along X, Y and Z, in model units. |
| [`transforms.warp`](https://docs.bitbybit.dev/classes/Bit.ManifoldTransforms#warp) | Moves every vertex of a solid with a function of your own that changes the vertex position in place, for bends, tapers and other free deformations. |

{/* api:manifold.manifold:end */}

### Cross sections

{/* api:manifold.crossSection:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`booleans.add`](https://docs.bitbybit.dev/classes/Bit.CrossSectionBooleans#add) | Fuses two cross-sections into one outline, holes and all. |
| [`booleans.difference`](https://docs.bitbybit.dev/classes/Bit.CrossSectionBooleans#difference) | Cuts every further cross-section in the list out of the first one. |
| [`booleans.differenceTwo`](https://docs.bitbybit.dev/classes/Bit.CrossSectionBooleans#differenceTwo) | Cuts the second cross-section out of the first, the same as `subtract`. |
| [`booleans.intersect`](https://docs.bitbybit.dev/classes/Bit.CrossSectionBooleans#intersect) | Keeps only the area two cross-sections share, dropping everything else. |
| [`booleans.intersection`](https://docs.bitbybit.dev/classes/Bit.CrossSectionBooleans#intersection) | Keeps only the area all the cross-sections in a list share. |
| [`booleans.intersectionTwo`](https://docs.bitbybit.dev/classes/Bit.CrossSectionBooleans#intersectionTwo) | Keeps only the area two cross-sections share, the same as `intersect`. |
| [`booleans.subtract`](https://docs.bitbybit.dev/classes/Bit.CrossSectionBooleans#subtract) | Cuts the second cross-section out of the first, leaving what remains of the first. |
| [`booleans.union`](https://docs.bitbybit.dev/classes/Bit.CrossSectionBooleans#union) | Fuses all the cross-sections in a list into one. |
| [`booleans.unionTwo`](https://docs.bitbybit.dev/classes/Bit.CrossSectionBooleans#unionTwo) | Fuses two cross-sections into one, the same as `add`. |
| [`crossSectionFromPoints`](https://docs.bitbybit.dev/classes/Bit.ManifoldCrossSection#crossSectionFromPoints) | Builds a cross-section from one polygon given as points; only the X and Y of each point are used. |
| [`crossSectionFromPolygons`](https://docs.bitbybit.dev/classes/Bit.ManifoldCrossSection#crossSectionFromPolygons) | Builds a cross-section from several polygons given as points, for instance an outline and its holes; only the X and Y of each point are used. |
| [`crossSectionsToPoints`](https://docs.bitbybit.dev/classes/Bit.ManifoldCrossSection#crossSectionsToPoints) | Reads several cross-sections back as polygons with 3D points, as `crossSectionToPoints` does for one. |
| [`crossSectionsToPolygons`](https://docs.bitbybit.dev/classes/Bit.ManifoldCrossSection#crossSectionsToPolygons) | Reads several cross-sections back as their polygons, as `crossSectionToPolygons` does for one. |
| [`crossSectionToPoints`](https://docs.bitbybit.dev/classes/Bit.ManifoldCrossSection#crossSectionToPoints) | Reads a cross-section back as its polygons with 3D points, Z set to 0, ready for drawing as polylines. |
| [`crossSectionToPolygons`](https://docs.bitbybit.dev/classes/Bit.ManifoldCrossSection#crossSectionToPolygons) | Reads a cross-section back as its polygons, each a list of 2D points. |
| [`evaluate.area`](https://docs.bitbybit.dev/classes/Bit.CrossSectionEvaluate#area) | Measures the area of a cross-section, in square model units, holes excluded. |
| [`evaluate.bounds`](https://docs.bitbybit.dev/classes/Bit.CrossSectionEvaluate#bounds) | Finds the rectangle around a cross-section as two 2D points: the minimum corner, then the maximum corner. |
| [`evaluate.isEmpty`](https://docs.bitbybit.dev/classes/Bit.CrossSectionEvaluate#isEmpty) | Tells whether a cross-section has no contours at all. |
| [`evaluate.numContour`](https://docs.bitbybit.dev/classes/Bit.CrossSectionEvaluate#numContour) | Counts the contours of a cross-section: its outer outlines and its holes. |
| [`evaluate.numVert`](https://docs.bitbybit.dev/classes/Bit.CrossSectionEvaluate#numVert) | Counts the vertices of a cross-section over all its contours. |
| [`operations.compose`](https://docs.bitbybit.dev/classes/Bit.CrossSectionOperations#compose) | Packs several cross-sections or polygons into one cross-section without fusing them, the inverse of `decompose`. |
| [`operations.decompose`](https://docs.bitbybit.dev/classes/Bit.CrossSectionOperations#decompose) | Splits a cross-section into its separate, unconnected outlines, each with its own holes, the inverse of `compose`. |
| [`operations.extrude`](https://docs.bitbybit.dev/classes/Bit.CrossSectionOperations#extrude) | Sweeps a cross-section along Z into a solid of the given height. |
| [`operations.hull`](https://docs.bitbybit.dev/classes/Bit.CrossSectionOperations#hull) | Wraps a cross-section in its convex hull, the smallest outline without dents that contains it, like a rubber band stretched around it. |
| [`operations.loft`](https://docs.bitbybit.dev/classes/Bit.CrossSectionOperations#loft) | Joins cross-sections placed by frames into a solid, each section to the next by straight sides, closed at both ends: a taper from one outline to another, or one outline through many frames. |
| [`operations.offset`](https://docs.bitbybit.dev/classes/Bit.CrossSectionOperations#offset) | Moves the outline of a cross-section outward by `delta`, or inward for a negative delta, so an outer contour grows and a hole shrinks. |
| [`operations.revolve`](https://docs.bitbybit.dev/classes/Bit.CrossSectionOperations#revolve) | Spins a cross-section around the Y axis into a solid, like a lathe; only the part of the outline on the positive X side is used. |
| [`operations.simplify`](https://docs.bitbybit.dev/classes/Bit.CrossSectionOperations#simplify) | Removes points of a cross-section that lie within `epsilon` of the line between their neighbors, dropping near-duplicates and collinear points. |
| [`operations.sweep`](https://docs.bitbybit.dev/classes/Bit.CrossSectionOperations#sweep) | Carries a cross-section along a path of points into a solid, square to the path at every point and turning with it without twisting, like a pipe, a rail or a cable. |
| [`shapes.circle`](https://docs.bitbybit.dev/classes/Bit.CrossSectionShapes#circle) | Creates a circular cross-section of the given radius, centered on the origin and drawn with `circularSegments` straight sides. |
| [`shapes.create`](https://docs.bitbybit.dev/classes/Bit.CrossSectionShapes#create) | Builds a cross-section from polygons given as 2D points, fusing overlapping ones so the result has no crossings. |
| [`shapes.rectangle`](https://docs.bitbybit.dev/classes/Bit.CrossSectionShapes#rectangle) | Creates a rectangular cross-section with `length` along X and `height` along Y; with `center` true it is centered on the origin, otherwise its corner sits there. |
| [`shapes.square`](https://docs.bitbybit.dev/classes/Bit.CrossSectionShapes#square) | Creates a square cross-section of the given side; with `center` true it is centered on the origin, otherwise its corner sits there. |
| [`transforms.mirror`](https://docs.bitbybit.dev/classes/Bit.CrossSectionTransforms#mirror) | Mirrors a cross-section across the line through the origin that is perpendicular to the given normal. |
| [`transforms.rotate`](https://docs.bitbybit.dev/classes/Bit.CrossSectionTransforms#rotate) | Rotates a cross-section about the origin by an angle in degrees, counterclockwise. |
| [`transforms.scale`](https://docs.bitbybit.dev/classes/Bit.CrossSectionTransforms#scale) | Scales a cross-section uniformly about the origin by a factor. |
| [`transforms.scale2D`](https://docs.bitbybit.dev/classes/Bit.CrossSectionTransforms#scale2D) | Scales a cross-section by a separate factor along X and Y, about the origin. |
| [`transforms.transform`](https://docs.bitbybit.dev/classes/Bit.CrossSectionTransforms#transform) | Applies a 3x3 matrix to a cross-section, for any combination of move, turn, scale and shear in the plane. |
| [`transforms.translate`](https://docs.bitbybit.dev/classes/Bit.CrossSectionTransforms#translate) | Moves a cross-section by a 2D vector, in model units. |
| [`transforms.translateXY`](https://docs.bitbybit.dev/classes/Bit.CrossSectionTransforms#translateXY) | Moves a cross-section by separate distances along X and Y, in model units. |
| [`transforms.warp`](https://docs.bitbybit.dev/classes/Bit.CrossSectionTransforms#warp) | Moves every point of a cross-section with a function of your own that changes the point in place, then fuses the result so any crossings the move introduced are cleaned up. |

{/* api:manifold.crossSection:end */}

### Meshes

{/* api:manifold.mesh:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`evaluate.backside`](https://docs.bitbybit.dev/classes/Bit.MeshEvaluate#backside) | Tells whether one run of triangles faces the other way than the original mesh it came from, as the inner surface left by a subtraction does. |
| [`evaluate.extras`](https://docs.bitbybit.dev/classes/Bit.MeshEvaluate#extras) | Reads the properties of one vertex beyond its position, such as normals or colors stored in extra channels. |
| [`evaluate.hasNormals`](https://docs.bitbybit.dev/classes/Bit.MeshEvaluate#hasNormals) | Tells whether the first three extra property channels of one run of triangles hold vertex normals, which `manifold.operations.calculateNormals` writes there. |
| [`evaluate.numProp`](https://docs.bitbybit.dev/classes/Bit.MeshEvaluate#numProp) | Counts the property channels each vertex of a mesh carries; the position alone takes three. |
| [`evaluate.numRun`](https://docs.bitbybit.dev/classes/Bit.MeshEvaluate#numRun) | Counts the triangle runs of a mesh: each run is a stretch of consecutive triangles that came from the same instance of the same input shape. |
| [`evaluate.numTri`](https://docs.bitbybit.dev/classes/Bit.MeshEvaluate#numTri) | Counts the triangles of a mesh, which together make its whole surface. |
| [`evaluate.numVert`](https://docs.bitbybit.dev/classes/Bit.MeshEvaluate#numVert) | Counts the property vertices of a mesh, which can exceed the geometric vertices where neighboring triangles carry different properties. |
| [`evaluate.position`](https://docs.bitbybit.dev/classes/Bit.MeshEvaluate#position) | Reads the position of one vertex of a mesh. |
| [`evaluate.tangent`](https://docs.bitbybit.dev/classes/Bit.MeshEvaluate#tangent) | Reads the tangent of one half-edge of a smoothed mesh: the direction the surface leaves the edge's start vertex in, as three numbers plus a weight. |
| [`evaluate.transform`](https://docs.bitbybit.dev/classes/Bit.MeshEvaluate#transform) | Reads the column-major 4x4 matrix that carries the original mesh onto one run of triangles, the placement of that instance. |
| [`evaluate.verts`](https://docs.bitbybit.dev/classes/Bit.MeshEvaluate#verts) | Reads the three vertex indexes of one triangle of a mesh, in counterclockwise order. |
| [`operations.merge`](https://docs.bitbybit.dev/classes/Bit.MeshOperations#merge) | Fills in the mesh's merge information so it can become a solid again: vertices on open edges within the tolerance are merged, keeping existing entries. |

{/* api:manifold.mesh:end */}

### Recipes

{/* api:manifold.recipes:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`build`](https://docs.bitbybit.dev/classes/Bit.ManifoldRecipes#build) | Builds each root of a recipe as a solid placed by its matrix, in root order. |
| [`meshes`](https://docs.bitbybit.dev/classes/Bit.ManifoldRecipes#meshes) | Builds a recipe into the meshes its roots draw, each step several roots place meshed once in its own coordinates, and gives every root a placement: its mesh, its matrix and its tag. |
| [`surfaceMeshes`](https://docs.bitbybit.dev/classes/Bit.ManifoldRecipes#surfaceMeshes) | Gives the roots of a recipe made of triangle meshes alone as meshes, placed as `build` places its solids, without building anything. |

{/* api:manifold.recipes:end */}
