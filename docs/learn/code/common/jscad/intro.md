---
sidebar_position: 1
title: The JSCAD Kernel
sidebar_label: JSCAD
description: JSCAD, Bitbybit's polygon kernel for quick solids - primitives, flat polygons and paths, extrusions with a twist, hulls, booleans, expansions and stroke-font text - with examples in Rete, Blockly and TypeScript and a table of every function.
topic: code.jscad.intro
type: explanation
tags: [code, jscad]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# The JSCAD kernel

[JSCAD](https://openjscad.xyz) builds solids from polygons. It is the quickest of the three kernels to get something on screen: a few primitives, booleans, extrusions and hulls make most simple objects, and it writes text with a stroke font of its own. It is not a precise CAD kernel: curves are divided into a fixed number of `segments`, and there is no fillet operation, though cuboids and cylinders come in rounded variants. [Choosing a kernel](../concepts/choosing-a-kernel) compares it with OpenCascade and Manifold.

## What it has

- **Solids** (`jscad.shapes`): cubes, cuboids, spheres, geodesic spheres, ellipsoids, cylinders and a torus, rounded cuboids and cylinders, each with a variant that places one on every point of a list.
- **Flat shapes and paths** (`jscad.polygon`, `jscad.path`): circles, rectangles, stars and polygons, and the open polylines walls follow.
- **Extrusions** (`jscad.extrusions`): straight along Z with a twist, a wall along an outline, and a revolution around Z.
- **Hulls** (`jscad.hulls`): the convex hull of shapes, or a chain of hulls between consecutive ones, which joins a row of spheres into a rounded tube.
- **Booleans and expansions**: union, subtract and intersect; grow or shrink a shape by a distance.
- **Text** (`jscad.text`): a stroke font, as pen paths, or as solid letters of hulled spheres or cylinders.

JSCAD builds along **Z**, like Manifold: an extrusion rises along Z, which lies flat in Bitbybit's Y-up scene.

## A twisted star

A seven-pointed star is extruded four units along Z, turning a quarter of the way as it rises:

{/* example:twisted-star:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"star\":{\"id\":\"star\",\"name\":\"bitbybit.jscad.polygon.star\",\"customName\":\"star\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"center\":[0,0],\"vertices\":7,\"density\":1,\"outerRadius\":3,\"innerRadius\":1.5,\"startAngle\":0},\"inputs\":{},\"position\":[40,40]},\"extrude\":{\"id\":\"extrude\",\"name\":\"bitbybit.jscad.extrusions.extrudeLinear\",\"customName\":\"extrude linear\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"height\":4,\"twistAngle\":90,\"twistSteps\":30},\"inputs\":{\"geometry\":{\"connections\":[{\"node\":\"star\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]}},\"modules\":{}}","type":"rete"}}
  title="A star extruded with a twist in Rete"
  description="A flat seven-pointed star extruded along Z, turning a quarter of the way as it rises."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.jscad.extrusions.extrudeLinear\"><value name=\"Geometry\"><block type=\"bitbybit.jscad.polygon.star\"><value name=\"Center\"><block type=\"bitbybit.point.pointXY\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Vertices\"><block type=\"math_number\"><field name=\"NUM\">7</field></block></value><value name=\"Density\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"OuterRadius\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"InnerRadius\"><block type=\"math_number\"><field name=\"NUM\">1.5</field></block></value><value name=\"StartAngle\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"TwistAngle\"><block type=\"math_number\"><field name=\"NUM\">90</field></block></value><value name=\"TwistSteps\"><block type=\"math_number\"><field name=\"NUM\">30</field></block></value></block></value></block></xml>","type":"blockly"}}
  title="A star extruded with a twist in Blockly"
  description="A flat seven-pointed star extruded along Z, turning a quarter of the way as it rises."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const star = await bitbybit.jscad.polygon.star({ center: [0, 0], vertices: 7, outerRadius: 3, innerRadius: 1.5 });\nconst twisted = await bitbybit.jscad.extrusions.extrudeLinear({ geometry: star, height: 4, twistAngle: 90, twistSteps: 30 });\n\nawait bitbybit.draw.drawAnyAsync({ entity: twisted });","type":"typescript"}}
  title="A star extruded with a twist in TypeScript"
  description="A flat seven-pointed star extruded along Z, turning a quarter of the way as it rises."
/>

</TabItem>
</Tabs>

{/* example:twisted-star:end */}

## Rounded text

`sphericalText` writes a word with JSCAD's stroke font, every stroke a chain of spheres hulled into a tube:

{/* example:rounded-text:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"text\":{\"id\":\"text\",\"name\":\"bitbybit.jscad.text.sphericalText\",\"customName\":\"spherical text\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"text\":\"bitbybit\",\"radius\":0.12,\"segments\":24,\"xOffset\":0,\"yOffset\":0,\"height\":2,\"lineSpacing\":1.4,\"letterSpacing\":1,\"align\":\"center\",\"extrudeOffset\":0},\"inputs\":{},\"position\":[40,40]}},\"modules\":{}}","type":"rete"}}
  title="Text written in rounded strokes in Rete"
  description="A word written with JSCAD's stroke font, every stroke a chain of spheres hulled into a rounded tube."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.jscad.text.sphericalText\"><value name=\"Text\"><block type=\"text\"><field name=\"TEXT\">bitbybit</field></block></value><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">0.12</field></block></value><value name=\"Segments\"><block type=\"math_number\"><field name=\"NUM\">24</field></block></value><value name=\"XOffset\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"YOffset\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"LineSpacing\"><block type=\"math_number\"><field name=\"NUM\">1.4</field></block></value><value name=\"LetterSpacing\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Align\"><block type=\"bitbybit.jscad.enums.jscadTextAlignEnum\"><field name=\"bitbybit.jscad.enums.jscadTextAlignEnum\">'center'</field></block></value><value name=\"ExtrudeOffset\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></xml>","type":"blockly"}}
  title="Text written in rounded strokes in Blockly"
  description="A word written with JSCAD's stroke font, every stroke a chain of spheres hulled into a rounded tube."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const word = await bitbybit.jscad.text.sphericalText({ text: \"bitbybit\", radius: 0.12, height: 2 });\n\nawait bitbybit.draw.drawAnyAsync({ entity: word });","type":"typescript"}}
  title="Text written in rounded strokes in TypeScript"
  description="A word written with JSCAD's stroke font, every stroke a chain of spheres hulled into a rounded tube."
/>

</TabItem>
</Tabs>

{/* example:rounded-text:end */}

A JSCAD shape can carry a colour of its own (`jscad.colors`), and that colour wins over the one in the drawing options, as [Conventions](../conventions) explains.

## Every function

{/* api:jscad:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`booleans.intersect`](https://docs.bitbybit.dev/classes/Bit.JSCADBooleans#intersect) | Keeps only the volume or area that all the inputs share, dropping everything else. |
| [`booleans.intersectTwo`](https://docs.bitbybit.dev/classes/Bit.JSCADBooleans#intersectTwo) | Keeps only the volume or area that `first` and `second` share, the two-input form of `intersect`. |
| [`booleans.minkowskiSum`](https://docs.bitbybit.dev/classes/Bit.JSCADBooleans#minkowskiSum) | Sweeps each later solid over the whole surface of the running result and fuses everything it passes through, so the first solid grows by the shape of the others - the Minkowski sum, which is how a solid is rounded or padded by a sphere. |
| [`booleans.subtract`](https://docs.bitbybit.dev/classes/Bit.JSCADBooleans#subtract) | Cuts every later input out of the first one, leaving what remains of the first. |
| [`booleans.subtractFrom`](https://docs.bitbybit.dev/classes/Bit.JSCADBooleans#subtractFrom) | Cuts every entry of `meshes` out of `from`, leaving what remains of `from`; the same as `subtract` with the base geometry named separately. |
| [`booleans.subtractTwo`](https://docs.bitbybit.dev/classes/Bit.JSCADBooleans#subtractTwo) | Cuts `second` out of `first`, the two-input form of `subtract`. |
| [`booleans.union`](https://docs.bitbybit.dev/classes/Bit.JSCADBooleans#union) | Fuses all the inputs into one solid or one 2D shape, merging where they overlap and keeping separate parts as one entity. |
| [`booleans.unionTwo`](https://docs.bitbybit.dev/classes/Bit.JSCADBooleans#unionTwo) | Fuses `first` and `second` into one, the two-input form of `union`. |
| [`colors.colorize`](https://docs.bitbybit.dev/classes/Bit.JSCADColors#colorize) | Gives a solid, a 2D shape or a path a fixed color from a hex string, returning a colored copy; a list gives a list of colored copies in the same order. |
| [`downloadGeometry3MF`](https://docs.bitbybit.dev/classes/Bit.JSCAD#downloadGeometry3MF) | Writes a solid, a 2D shape, a path or a list of them as a 3MF file, a modern 3D printing format, and downloads it in the browser as `fileName` plus `.3mf`. |
| [`downloadGeometryDxf`](https://docs.bitbybit.dev/classes/Bit.JSCAD#downloadGeometryDxf) | Writes a solid, a 2D shape, a path or a list of them as a DXF drawing file and downloads it in the browser as `fileName` plus `.dxf`. |
| [`downloadSolidsSTL`](https://docs.bitbybit.dev/classes/Bit.JSCAD#downloadSolidsSTL) | Writes several solids into one binary STL file and downloads it in the browser as `fileName` plus `.stl`. |
| [`downloadSolidSTL`](https://docs.bitbybit.dev/classes/Bit.JSCAD#downloadSolidSTL) | Writes a solid as a binary STL file, the common format for 3D printing, and downloads it in the browser as `fileName` plus `.stl`. |
| [`expansions.expand`](https://docs.bitbybit.dev/classes/Bit.JSCADExpansions#expand) | Grows geometry by moving its whole boundary outward by `delta`, or shrinks it when `delta` is negative. |
| [`expansions.offset`](https://docs.bitbybit.dev/classes/Bit.JSCADExpansions#offset) | Builds the outline of a 2D shape or path at distance `delta` from the original, outward for positive and inward for negative. |
| [`extrusions.extrudeLinear`](https://docs.bitbybit.dev/classes/Bit.JSCADExtrusions#extrudeLinear) | Extrudes a flat 2D shape straight along Z by `height` into a solid, twisting it on the way when `twistAngle` is not zero. |
| [`extrusions.extrudeRectangular`](https://docs.bitbybit.dev/classes/Bit.JSCADExtrusions#extrudeRectangular) | Builds a wall along the outline of a 2D shape or path: the outline is thickened by `size` on each side and raised by `height` along Z. |
| [`extrusions.extrudeRectangularPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADExtrusions#extrudeRectangularPoints) | Builds a wall along a polyline of points, as `extrudeRectangular` does for a path: the line is thickened by `size` on each side and raised by `height` along Z. |
| [`extrusions.extrudeRotate`](https://docs.bitbybit.dev/classes/Bit.JSCADExtrusions#extrudeRotate) | Revolves a flat 2D shape around the Z axis into a solid. |
| [`hulls.hull`](https://docs.bitbybit.dev/classes/Bit.JSCADHulls#hull) | Wraps all the inputs in one convex hull, the smallest shape without dents that contains them all, regardless of their order. |
| [`hulls.hullChain`](https://docs.bitbybit.dev/classes/Bit.JSCADHulls#hullChain) | Wraps each consecutive pair of inputs in a convex hull and fuses the hulls, so a row of shapes becomes a continuous strand that follows their order. |
| [`hulls.isConvex`](https://docs.bitbybit.dev/classes/Bit.JSCADHulls#isConvex) | Tells whether a solid is convex, meaning it already equals its own hull: every straight line between two of its points stays inside it. |
| [`path.appendArc`](https://docs.bitbybit.dev/classes/Bit.JSCADPath#appendArc) | Adds an elliptical arc from the last point of an open 2D path to `endPoint`, giving a longer copy. |
| [`path.appendPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADPath#appendPoints) | Adds points to the end of an open 2D path, giving a longer copy. |
| [`path.appendPolyline`](https://docs.bitbybit.dev/classes/Bit.JSCADPath#appendPolyline) | Adds the points of a polyline to the end of an open 2D path, giving a longer copy. |
| [`path.close`](https://docs.bitbybit.dev/classes/Bit.JSCADPath#close) | Closes an open 2D path by joining its last point back to its first, giving a closed copy; a path that is already closed comes back closed. |
| [`path.createEmpty`](https://docs.bitbybit.dev/classes/Bit.JSCADPath#createEmpty) | Makes an empty open 2D path with no points, a starting point for `appendPoints`, `appendPolyline` and `appendArc`. |
| [`path.createFromPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADPath#createFromPoints) | Builds a 2D path through the points in order, open or closed back to the first point as `closed` says. |
| [`path.createFromPolyline`](https://docs.bitbybit.dev/classes/Bit.JSCADPath#createFromPolyline) | Builds a 2D path through the points of a polyline, open or closed back to the first point as `closed` says, whatever the polyline's own flag holds. |
| [`path.createPathsFromPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADPath#createPathsFromPoints) | Builds one 2D path per list of points, in the same order; a list whose last point coincides with its first becomes a closed path, any other stays open. |
| [`polygon.circle`](https://docs.bitbybit.dev/classes/Bit.JSCADPolygon#circle) | Builds a filled circle of the given `radius` around a 2D `center`; `segments` is the number of straight sides that approximate it. |
| [`polygon.createFromCurve`](https://docs.bitbybit.dev/classes/Bit.JSCADPolygon#createFromCurve) | Builds a filled 2D shape from a NURBS curve by sampling it into points and closing the outline. |
| [`polygon.createFromPath`](https://docs.bitbybit.dev/classes/Bit.JSCADPolygon#createFromPath) | Builds a filled 2D shape from the points of a 2D path, closed back to the first point. |
| [`polygon.createFromPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADPolygon#createFromPoints) | Builds a filled 2D shape from the outline points, taken in order and closed back to the first. |
| [`polygon.createFromPolyline`](https://docs.bitbybit.dev/classes/Bit.JSCADPolygon#createFromPolyline) | Builds a filled 2D shape from the points of a polyline, closed back to the first point whatever the polyline says. |
| [`polygon.ellipse`](https://docs.bitbybit.dev/classes/Bit.JSCADPolygon#ellipse) | Builds a filled ellipse around a 2D `center`, with `radius` holding the X and Y half-sizes; `segments` is the number of straight sides that approximate it. |
| [`polygon.rectangle`](https://docs.bitbybit.dev/classes/Bit.JSCADPolygon#rectangle) | Builds a filled rectangle around a 2D `center`, with `width` along X and `length` along Y. |
| [`polygon.roundedRectangle`](https://docs.bitbybit.dev/classes/Bit.JSCADPolygon#roundedRectangle) | Builds a filled rectangle with its four corners rounded by `roundRadius`, around a 2D `center` with `width` along X and `length` along Y. |
| [`polygon.square`](https://docs.bitbybit.dev/classes/Bit.JSCADPolygon#square) | Builds a filled square of side `size` around a 2D `center`, with its sides parallel to the axes. |
| [`polygon.star`](https://docs.bitbybit.dev/classes/Bit.JSCADPolygon#star) | Builds a filled star with `vertices` tips around a 2D `center`, the tips at `outerRadius` and the notches between them at `innerRadius`. |
| [`shapes.cube`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#cube) | Builds a cube of edge length `size` centered on `center`, with its faces parallel to the axes. |
| [`shapes.cubesOnCenterPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#cubesOnCenterPoints) | Builds one cube of edge length `size` on every point of `centers`, in the same order. |
| [`shapes.cuboid`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#cuboid) | Builds a box centered on `center` with `width` along X, `height` along Y and `length` along Z, its faces parallel to the axes. |
| [`shapes.cuboidsOnCenterPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#cuboidsOnCenterPoints) | Builds one box of the given `width`, `height` and `length` on every point of `centers`, in the same order. |
| [`shapes.cylinder`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#cylinder) | Builds a round cylinder of the given `radius` standing along Z, with `height` split evenly above and below `center`. |
| [`shapes.cylinderElliptic`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#cylinderElliptic) | Builds a cylinder with an elliptical cross-section whose radii can differ at the two ends, standing along Z and centered on `center`. |
| [`shapes.cylinderEllipticOnCenterPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#cylinderEllipticOnCenterPoints) | Builds one elliptic cylinder with the given radii and height on every point of `centers`, in the same order, as `cylinderElliptic` does for one. |
| [`shapes.cylindersOnCenterPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#cylindersOnCenterPoints) | Builds one cylinder of the given `radius` and `height` on every point of `centers`, in the same order, as `cylinder` does for one. |
| [`shapes.ellipsoid`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#ellipsoid) | Builds an ellipsoid, a sphere stretched separately along X, Y and Z, centered on `center`. |
| [`shapes.ellipsoidsOnCenterPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#ellipsoidsOnCenterPoints) | Builds one ellipsoid with the given radii on every point of `centers`, in the same order, as `ellipsoid` does for one. |
| [`shapes.fromPolygonPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#fromPolygonPoints) | Builds a solid from its faces, each given as a list of points that go around the face. |
| [`shapes.geodesicSphere`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#geodesicSphere) | Builds a sphere from evenly sized triangles, the way a geodesic dome is built, centered on `center`. |
| [`shapes.geodesicSpheresOnCenterPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#geodesicSpheresOnCenterPoints) | Builds one geodesic sphere of the given `radius` on every point of `centers`, in the same order, as `geodesicSphere` does for one. |
| [`shapes.roundedCuboid`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#roundedCuboid) | Builds a box with all its edges and corners rounded by `roundRadius`, centered on `center` with `width` along X, `height` along Y and `length` along Z. |
| [`shapes.roundedCuboidsOnCenterPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#roundedCuboidsOnCenterPoints) | Builds one rounded box with the given sides and rounding on every point of `centers`, in the same order, as `roundedCuboid` does for one. |
| [`shapes.roundedCylinder`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#roundedCylinder) | Builds a cylinder standing along Z whose two rims are rounded by `roundRadius`, with `height` split evenly above and below `center`. |
| [`shapes.roundedCylindersOnCenterPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#roundedCylindersOnCenterPoints) | Builds one rounded cylinder with the given size and rounding on every point of `centers`, in the same order, as `roundedCylinder` does for one. |
| [`shapes.sphere`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#sphere) | Builds a sphere of the given `radius` centered on `center`; `segments` is the number of facets around it, so more makes it rounder. |
| [`shapes.spheresOnCenterPoints`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#spheresOnCenterPoints) | Builds one sphere of the given `radius` on every point of `centers`, in the same order, as `sphere` does for one. |
| [`shapes.torus`](https://docs.bitbybit.dev/classes/Bit.JSCADShapes#torus) | Builds a torus, a ring with a round cross-section, lying flat in the XY plane around `center` with Z through its hole. |
| [`text.createVectorText`](https://docs.bitbybit.dev/classes/Bit.JSCADText#createVectorText) | Writes text as pen strokes: each stroke is a list of 2D points in the XY plane, and a letter may take several. |
| [`text.cylindricalText`](https://docs.bitbybit.dev/classes/Bit.JSCADText#cylindricalText) | Writes text as solids: every pen stroke becomes a chain of cylinders standing along Z, hulled together into one smooth solid, so a letter like A gives several solids. |
| [`text.sphericalText`](https://docs.bitbybit.dev/classes/Bit.JSCADText#sphericalText) | Writes text as solids: every pen stroke becomes a chain of spheres hulled together into one rounded solid, so a letter like A gives several solids. |
| [`toPolygonPoints`](https://docs.bitbybit.dev/classes/Bit.JSCAD#toPolygonPoints) | Turns a solid into a list of triangles, each given as three points, with the solid's own transform already applied. |
| [`transformSolid`](https://docs.bitbybit.dev/classes/Bit.JSCAD#transformSolid) | Moves, rotates or scales a solid with a transformation, giving a new solid. |
| [`transformSolids`](https://docs.bitbybit.dev/classes/Bit.JSCAD#transformSolids) | Moves, rotates or scales several solids with the same transformation, giving new solids in the same order. |

{/* api:jscad:end */}
