---
sidebar_position: 1
title: Measuring and Analysing Shapes
sidebar_label: Analysis
description: The OCCT analysis functions answer questions about shapes with numbers and points - bounding boxes, distances and angles, clashes between parts, the kind and curvature of curves and surfaces - with an example in Rete, Blockly and TypeScript.
topic: code.occt.analysis
type: explanation
tags: [code, occt]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Measuring and analysing shapes

`bitbybit.occt.analysis` asks questions of shapes and answers with numbers, points and lists, not new shapes. Use it to size a part, check a fit, find where to put the next feature, or make sure parts do not collide.

## Measure

`analysis.measure` holds the measurements a designer reaches for:

- `tightBoundingBox`, `orientedBoundingBox` and `boundingBoxInFrame`: the box around a shape, aligned with the world, turned to fit it as closely as possible, or in a frame of your own;
- `extrema`: the nearest points between two shapes, and their distance;
- `angleBetween` and `dihedralAngle`: angles between directions and between faces;
- `principalFrame`: a shape's centre of mass and principal axes;
- `minCurvatureRadius`: the tightest bend of a shape, and where it is.

Volume and area are with the shapes themselves: `bitbybit.occt.shapes.solid.getSolidVolume` and `getSolidSurfaceArea`.

## Clashes

`analysis.clashes.betweenShapes` checks a list of parts against each other and names every pair that overlaps, touches or comes within a clearance, with their distance and the volume two solids share. `selfIntersections` finds a shape that cuts through itself, and `facesWithin` the faces of one shape that come within a clearance of the faces of another.

Here two blocks overlap. The clash names the pair by their places in the list, 0 and 1, with a distance of 0 and the volume they share:

{/* example:clashing-parts:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"first\":{\"id\":\"first\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":3,\"length\":3,\"height\":3,\"center\":[0,0,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,40]},\"second\":{\"id\":\"second\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":3,\"length\":3,\"height\":3,\"center\":[2,1,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,460]},\"parts\":{\"id\":\"parts\",\"name\":\"bitbybit.lists.createList\",\"customName\":\"create list\",\"async\":false,\"drawable\":false,\"data\":{},\"inputs\":{\"listElements\":{\"connections\":[{\"node\":\"first\",\"output\":\"result\",\"data\":{}},{\"node\":\"second\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,260]},\"clashes\":{\"id\":\"clashes\",\"name\":\"bitbybit.occt.analysis.clashes.betweenShapes\",\"customName\":\"clashes between shapes\",\"async\":true,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"clearance\":0,\"prefilter\":true},\"inputs\":{\"shapes\":{\"connections\":[{\"node\":\"parts\",\"output\":\"list\",\"data\":{}}]}},\"position\":[880,260]}},\"modules\":{}}","type":"rete"}}
  title="Do two parts collide? in Rete"
  description="Two blocks that overlap, checked for clashes: the answer names the pair, their distance and the volume they share."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"first\">first</variable><variable id=\"second\">second</variable><variable id=\"parts\">parts</variable><variable id=\"clashes\">clashes</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"first\">first</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><next><block type=\"variables_set\"><field name=\"VAR\" id=\"second\">second</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><next><block type=\"variables_set\"><field name=\"VAR\" id=\"parts\">parts</field><value name=\"VALUE\"><block type=\"bitbybit.lists.addItem\"><value name=\"List\"><block type=\"bitbybit.lists.addItem\"><value name=\"List\"><block type=\"bitbybit.lists.createEmptyList\"></block></value><value name=\"Item\"><block type=\"variables_get\"><field name=\"VAR\" id=\"first\">first</field></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"Item\"><block type=\"variables_get\"><field name=\"VAR\" id=\"second\">second</field></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><next><block type=\"variables_set\"><field name=\"VAR\" id=\"clashes\">clashes</field><value name=\"VALUE\"><block type=\"bitbybit.occt.analysis.clashes.betweenShapes\"><value name=\"Shapes\"><block type=\"variables_get\"><field name=\"VAR\" id=\"parts\">parts</field></block></value><value name=\"Clearance\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Prefilter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"variables_get\"><field name=\"VAR\" id=\"parts\">parts</field></block></value></block></next></block></next></block></next></block></next></block></xml>","type":"blockly"}}
  title="Do two parts collide? in Blockly"
  description="Two blocks that overlap, checked for clashes: the answer names the pair, their distance and the volume they share."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const first = await bitbybit.occt.shapes.solid.createBox({ width: 3, length: 3, height: 3, center: [0, 0, 0] });\nconst second = await bitbybit.occt.shapes.solid.createBox({ width: 3, length: 3, height: 3, center: [2, 1, 0] });\n\nconst clashes = await bitbybit.occt.analysis.clashes.betweenShapes({ shapes: [first, second], clearance: 0 });\nconsole.log(JSON.stringify(clashes));\n\nawait bitbybit.draw.drawAnyAsync({ entity: [first, second] });","type":"typescript"}}
  title="Do two parts collide? in TypeScript"
  description="Two blocks that overlap, checked for clashes: the answer names the pair, their distance and the volume they share."
/>

</TabItem>
</Tabs>

{/* example:clashing-parts:end */}

In TypeScript the clashes are written to the console. In Rete, point at the output of <Ui>clashes between shapes</Ui> to read them.

## Curves and surfaces

`analysis.curves` and `analysis.surfaces` read the geometry under edges and faces: the kind of curve or surface, curvature along a curve or at points on a surface, the closest points, where a curve crosses a face or another curve, and the kinks where a wire turns sharply. They are the tools for checking smoothness and for placing things exactly on a surface.

## Every analysis

{/* api:occt.analysis:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`clashes.betweenShapes`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisClashes#betweenShapes) | Finds every pair among a list of shapes that overlap, touch or come within a clearance of each other, such as colliding parts. |
| [`clashes.facesWithin`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisClashes#facesWithin) | Finds the faces of one shape that come within a clearance of faces of another, each pair measured exactly. |
| [`clashes.selfIntersections`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisClashes#selfIntersections) | Finds the pairs of faces of one shape that cross each other anywhere but along an edge they share. |
| [`curves.closestPoints`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisCurves#closestPoints) | Finds the point of an edge or a wire nearest each given point, with where it lies along the curve. |
| [`curves.curvatureComb`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisCurves#curvatureComb) | Draws a curvature comb along an edge or a wire: teeth standing on the curve, as long as the curvature there, pointing away from its center. |
| [`curves.curvaturesAtLengths`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisCurves#curvaturesAtLengths) | Reads how an edge or a wire bends at places given as lengths along it from its start, in model units. |
| [`curves.curvaturesAtParams`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisCurves#curvaturesAtParams) | Reads how an edge or a wire bends at places given as fractions from 0 at its start to 1 at its end. |
| [`curves.curveType`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisCurves#curveType) | Tells what kind of curve an edge runs along: a line, a circle, an ellipse, a hyperbola, a parabola, a Bezier curve, a B-spline, an offset curve or another kind. |
| [`curves.extremesAlong`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisCurves#extremesAlong) | Finds the highest and lowest points of an edge or a wire along a direction, such as the crests of a wave. |
| [`curves.intersectCurves`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisCurves#intersectCurves) | Finds where two edges or wires cross or touch, with the parameter and the edge of each point on both curves. |
| [`curves.intersectCurveWithFace`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisCurves#intersectCurveWithFace) | Finds where an edge or a wire passes through a face or lies on it, within the face's edges. |
| [`curves.kinks`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisCurves#kinks) | Finds the corners of an edge or a wire where the tangent turns by more than an angle, such as the corners of a polyline. |
| [`measure.angleBetween`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisMeasure#angleBetween) | Measures the angle in degrees between two faces or edges where they come nearest each other. |
| [`measure.boundingBoxInFrame`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisMeasure#boundingBoxInFrame) | Finds the box that just holds a shape with its sides along a frame's axes instead of the world's. |
| [`measure.dihedralAngle`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisMeasure#dihedralAngle) | Measures the angle through the material between the two faces that meet at an edge. |
| [`measure.extrema`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisMeasure#extrema) | Finds every nearest pair of points between two shapes, with the vertex, edge or face each point lies on and where on it. |
| [`measure.minCurvatureRadius`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisMeasure#minCurvatureRadius) | Finds the tightest bend of a shape, sampled over its faces and edges, and where it is. |
| [`measure.orientedBoundingBox`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisMeasure#orientedBoundingBox) | Finds the smallest box that fits around a shape, turned to follow it rather than the axes: a frame at the box's centre, its direction along the longest side and its normal along the shortest, with half the box's size along each. |
| [`measure.principalFrame`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisMeasure#principalFrame) | Finds a shape's principal axes of inertia as a frame at its centre of mass: the direction is the axis it turns about most easily, the normal the one it resists most. |
| [`measure.tightBoundingBox`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisMeasure#tightBoundingBox) | Finds the box lined up with the axes that just holds a shape's exact geometry. |
| [`signatures`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysis#signatures) | Describes every face and edge of a shape in one pass: each face's surface kind, area, centre, outward normal and box, and each edge's curve kind, length, midpoint and direction there. |
| [`surfaces.closestPoints`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisSurfaces#closestPoints) | Finds the point of a face nearest each given point, with its (u, v) and the face's normal there. |
| [`surfaces.curvaturesOnUVs`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisSurfaces#curvaturesOnUVs) | Reads how a face bends at (u, v) pairs: its largest and smallest curvature with their directions, their mean and product, and the normal. |
| [`surfaces.surfaceType`](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysisSurfaces#surfaceType) | Tells what kind of surface a face lies on, such as a plane, a cylinder or a B-spline. |

{/* api:occt.analysis:end */}
