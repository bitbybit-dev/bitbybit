---
sidebar_position: 1
title: OCCT Vertices
sidebar_label: Vertices
description: Vertices, OCCT's own points - making them from plain points, reading them back, bundling a point cloud into one shape to draw, and casting points onto a shape to find where they land - with an example in Rete, Blockly and TypeScript and a table of every function.
topic: code.occt.shapes.vertex
type: explanation
tags: [code, occt]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OCCT vertices

A vertex is OpenCascade's own point: the smallest piece of a shape, where edges start and end. A plain point, `[x, y, z]`, is just three numbers in your script; a vertex is a shape that lives in the kernel (see [Shapes live in a worker](/learn/code/common/concepts/shapes-live-in-a-worker)) and can be drawn, put in a compound, measured against other shapes or exported with them.

Most of the time you work with plain points and let the kernel make vertices where it needs them. The `bitbybit.occt.shapes.vertex` functions are for the moments in between: turning points into vertices and back, and finding where points land on a shape.

Here a honeycomb of points on the ground is cast straight down onto a sphere sunk below it. Each point that hits the sphere lands on its top, and the landing points become one compound of vertices, a dome of yellow dots under the flat grid:

{/* example:points-onto-a-dome:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"grid\":{\"id\":\"grid\",\"name\":\"bitbybit.point.hexGrid\",\"customName\":\"hex grid\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"nrHexagonsY\":16,\"nrHexagonsX\":16,\"radiusHexagon\":0.25,\"orientOnCenter\":true,\"pointsOnGround\":true},\"inputs\":{},\"position\":[40,40]},\"dome\":{\"id\":\"dome\",\"name\":\"bitbybit.occt.shapes.solid.createSphere\",\"customName\":\"sphere\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":3.5,\"center\":[0,-4,0]},\"inputs\":{},\"position\":[40,560]},\"landed\":{\"id\":\"landed\",\"name\":\"bitbybit.occt.shapes.vertex.projectPoints\",\"customName\":\"project points\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"direction\":[0,-10,0],\"projectionType\":\"closest\"},\"inputs\":{\"points\":{\"connections\":[{\"node\":\"grid\",\"output\":\"result\",\"data\":{}}]},\"shape\":{\"connections\":[{\"node\":\"dome\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"vertices\":{\"id\":\"vertices\",\"name\":\"bitbybit.occt.shapes.vertex.verticesCompoundFromPoints\",\"customName\":\"vertices compound from points\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"points\":{\"connections\":[{\"node\":\"landed\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]},\"dots\":{\"id\":\"dots\",\"name\":\"bitbybit.draw.optionsOcctShape\",\"customName\":\"options occt shape\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"faceOpacity\":1,\"edgeOpacity\":1,\"edgeColour\":\"#ffffff\",\"faceColour\":\"#ff0000\",\"vertexColour\":\"#ffc845\",\"edgeWidth\":2,\"vertexSize\":0.08,\"drawEdges\":true,\"drawFaces\":true,\"drawVertices\":true,\"precision\":0.01,\"angularDeflection\":0.5,\"relativeDeflection\":false,\"drawEdgeIndexes\":false,\"edgeIndexHeight\":0.06,\"edgeIndexColour\":\"#ff00ff\",\"drawFaceIndexes\":false,\"faceIndexHeight\":0.06,\"faceIndexColour\":\"#0000ff\",\"drawTwoSided\":true,\"backFaceColour\":\"#0000ff\",\"backFaceOpacity\":1,\"edgeArrowSize\":0,\"edgeArrowAngle\":15,\"keepMeshData\":false,\"allowQualityDecrease\":true,\"forceFaceDeflection\":false,\"drawIsoCurves\":false,\"isoCurvesU\":5,\"isoCurvesV\":5,\"isoCurvesColour\":\"#808080\",\"surfaceAnalysis\":\"none\",\"draftDirection\":[0,1,0]},\"inputs\":{},\"position\":[880,400]},\"drawVertices\":{\"id\":\"drawVertices\",\"name\":\"bitbybit.draw.drawAnyAsync\",\"customName\":\"draw any async\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"entity\":{\"connections\":[{\"node\":\"vertices\",\"output\":\"result\",\"data\":{}}]},\"options\":{\"connections\":[{\"node\":\"dots\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1300,40]}},\"modules\":{}}","type":"rete"}}
  title="A grid of points cast onto a dome in Rete"
  description="A honeycomb of points on the ground cast straight down onto a sphere sunk below it; the points that land become vertices covering its top."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"grid\">grid</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"grid\">grid</field><value name=\"VALUE\"><block type=\"bitbybit.point.hexGrid\"><value name=\"NrHexagonsY\"><block type=\"math_number\"><field name=\"NUM\">16</field></block></value><value name=\"NrHexagonsX\"><block type=\"math_number\"><field name=\"NUM\">16</field></block></value><value name=\"RadiusHexagon\"><block type=\"math_number\"><field name=\"NUM\">0.25</field></block></value><value name=\"OrientOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"PointsOnGround\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"variables_get\"><field name=\"VAR\" id=\"grid\">grid</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.vertex.verticesCompoundFromPoints\"><value name=\"Points\"><block type=\"bitbybit.occt.shapes.vertex.projectPoints\"><value name=\"Points\"><block type=\"variables_get\"><field name=\"VAR\" id=\"grid\">grid</field></block></value><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.solid.createSphere\"><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">3.5</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">-4</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">-10</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"ProjectionType\"><block type=\"bitbybit.occt.enums.pointProjectionTypeEnum\"><field name=\"bitbybit.occt.enums.pointProjectionTypeEnum\">'closest'</field></block></value></block></value></block></value><value name=\"Options\"><block type=\"bitbybit.draw.optionsOcctShape\"><value name=\"FaceOpacity\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"EdgeOpacity\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"EdgeColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#ffffff</field></block></value><value name=\"FaceColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#ff0000</field></block></value><value name=\"VertexColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#ffc845</field></block></value><value name=\"EdgeWidth\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"VertexSize\"><block type=\"math_number\"><field name=\"NUM\">0.08</field></block></value><value name=\"DrawEdges\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"DrawFaces\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"DrawVertices\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"Precision\"><block type=\"math_number\"><field name=\"NUM\">0.01</field></block></value><value name=\"AngularDeflection\"><block type=\"math_number\"><field name=\"NUM\">0.5</field></block></value><value name=\"RelativeDeflection\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"DrawEdgeIndexes\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"EdgeIndexHeight\"><block type=\"math_number\"><field name=\"NUM\">0.06</field></block></value><value name=\"EdgeIndexColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#ff00ff</field></block></value><value name=\"DrawFaceIndexes\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"FaceIndexHeight\"><block type=\"math_number\"><field name=\"NUM\">0.06</field></block></value><value name=\"FaceIndexColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#0000ff</field></block></value><value name=\"DrawTwoSided\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"BackFaceColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#0000ff</field></block></value><value name=\"BackFaceOpacity\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"EdgeArrowSize\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"EdgeArrowAngle\"><block type=\"math_number\"><field name=\"NUM\">15</field></block></value><value name=\"KeepMeshData\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"AllowQualityDecrease\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"ForceFaceDeflection\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"DrawIsoCurves\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"IsoCurvesU\"><block type=\"math_number\"><field name=\"NUM\">5</field></block></value><value name=\"IsoCurvesV\"><block type=\"math_number\"><field name=\"NUM\">5</field></block></value><value name=\"IsoCurvesColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#808080</field></block></value><value name=\"SurfaceAnalysis\"><block type=\"bitbybit.occt.enums.surfaceAnalysisEnum\"><field name=\"bitbybit.occt.enums.surfaceAnalysisEnum\">'none'</field></block></value><value name=\"DraftDirection\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></next></block></next></block></xml>","type":"blockly"}}
  title="A grid of points cast onto a dome in Blockly"
  description="A honeycomb of points on the ground cast straight down onto a sphere sunk below it; the points that land become vertices covering its top."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const dome = await bitbybit.occt.shapes.solid.createSphere({ radius: 3.5, center: [0, -4, 0] });\nconst grid = bitbybit.point.hexGrid({ nrHexagonsX: 16, nrHexagonsY: 16, radiusHexagon: 0.25, orientOnCenter: true, pointsOnGround: true });\n\nconst landed = await bitbybit.occt.shapes.vertex.projectPoints({ points: grid, shape: dome, direction: [0, -10, 0], projectionType: Bit.Inputs.OCCT.pointProjectionTypeEnum.closest });\nconst vertices = await bitbybit.occt.shapes.vertex.verticesCompoundFromPoints({ points: landed });\n\nconst dots = new Bit.Inputs.Draw.DrawOcctShapeOptions();\ndots.drawVertices = true;\ndots.vertexSize = 0.08;\ndots.vertexColour = \"#ffc845\";\n\nawait bitbybit.draw.drawAnyAsync({ entity: grid });\nawait bitbybit.draw.drawAnyAsync({ entity: vertices, options: dots });","type":"typescript"}}
  title="A grid of points cast onto a dome in TypeScript"
  description="A honeycomb of points on the ground cast straight down onto a sphere sunk below it; the points that land become vertices covering its top."
/>

</TabItem>
</Tabs>

{/* example:points-onto-a-dome:end */}

## Points and vertices

- `vertexFromPoint` and `vertexFromXYZ` make one vertex; `verticesFromPoints` makes one per point.
- `verticesCompoundFromPoints` makes one vertex per point and bundles them into a single compound, so a whole point cloud is one shape to draw, translate or export. A shape's vertices are not drawn unless the draw options say `drawVertices: true`, so a compound of vertices alone draws nothing without it; `vertexSize` and `vertexColour` set how they look.
- `vertexToPoint` and `verticesToPoints` read vertices back as plain points.
- `getVertices` lists the vertices of any shape as the kernel walks it, and `getVerticesAsPoints` gives them as plain points straight away. A closed wire's first vertex is also its last, so it is listed once.

## Casting points onto a shape

`projectPoints` casts each point along `direction` and keeps where it lands on the shape. The direction is also the reach: `[0, -10, 0]` casts down, as far as 10 units, so a point farther than that from the shape lands nowhere. A point that crosses the shape more than once, through a sphere for instance, lands where `projectionType` says: `all` keeps every hit, `closest` the first one, `furthest` the last, and `closestAndFurthest` both ends. Points that miss are left out, so the result can be shorter than the list you gave.

To lay a whole wire onto a shape rather than single points, `bitbybit.occt.shapes.wire.project` casts it along a direction in the same way.

## Every function

{/* api:occt.shapes.vertex:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`getVertices`](https://docs.bitbybit.dev/classes/Bit.OCCTVertex#getVertices) | Lists every vertex of a shape as the kernel walks it. |
| [`getVerticesAsPoints`](https://docs.bitbybit.dev/classes/Bit.OCCTVertex#getVerticesAsPoints) | Lists every vertex of a shape as a plain `[x, y, z]` point, as the kernel walks it. |
| [`projectPoints`](https://docs.bitbybit.dev/classes/Bit.OCCTVertex#projectPoints) | Projects points onto a shape along a direction and gives the points where they land. |
| [`vertexFromPoint`](https://docs.bitbybit.dev/classes/Bit.OCCTVertex#vertexFromPoint) | Makes a vertex, the kernel's own point, from a plain `[x, y, z]` point. |
| [`vertexFromXYZ`](https://docs.bitbybit.dev/classes/Bit.OCCTVertex#vertexFromXYZ) | Makes a vertex from x, y and z values. |
| [`vertexToPoint`](https://docs.bitbybit.dev/classes/Bit.OCCTVertex#vertexToPoint) | Reads the coordinates of a vertex as a plain `[x, y, z]` point. |
| [`verticesCompoundFromPoints`](https://docs.bitbybit.dev/classes/Bit.OCCTVertex#verticesCompoundFromPoints) | Makes one vertex per point and bundles them into a single compound, so a whole point cloud can be drawn or transformed as one shape. |
| [`verticesFromPoints`](https://docs.bitbybit.dev/classes/Bit.OCCTVertex#verticesFromPoints) | Makes one vertex, the kernel's own point, for each plain `[x, y, z]` point. |
| [`verticesToPoints`](https://docs.bitbybit.dev/classes/Bit.OCCTVertex#verticesToPoints) | Reads the coordinates of each vertex as a plain `[x, y, z]` point. |

{/* api:occt.shapes.vertex:end */}
