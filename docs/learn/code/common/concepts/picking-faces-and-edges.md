---
sidebar_position: 5
title: Picking Faces and Edges
sidebar_label: Picking Faces and Edges
description: Three ways to tell a function which faces or edges of a shape to work on - by index, by a rule about where they lie and what they are, and by history - and why a rule survives changes an index does not.
topic: code.concepts.picking-faces-and-edges
type: explanation
tags: [code, occt]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Picking faces and edges

A fillet rounds edges, a shell removes faces, a draft tilts them. Each needs to know **which** ones. OpenCascade numbers the faces and edges of every shape, and many functions take a list of those numbers, `indexes`. There are three ways to come by them.

## By index

Draw the shape with its indexes shown (`drawEdgeIndexes` or `drawFaceIndexes` in the drawing options), read the numbers off the screen and type them in. [Edge indexes](../occt/shapes/edge/edge-indexes) shows how.

It is quick, and it is fragile: the numbers belong to this shape as it is now. Change a size, add a hole, and the edge you meant may get another number while your list now points at a different one.

## By rule

`bitbybit.occt.select` chooses faces and edges by **what they are and where they lie**: faces facing a direction, edges along an axis, circular edges of a radius, edges inside a box or on a plane, the edges where two sets of faces meet. Each function returns the indexes for you, so a rule keeps choosing the right ones however the model changes.

Here the faces that face up are chosen first, then the edges around them, and only those edges are filleted. Change the box's sizes and the top edges are still the ones rounded:

{/* example:edges-by-rule:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"box\":{\"id\":\"box\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":6,\"length\":4,\"height\":3,\"center\":[0,0,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,40]},\"up\":{\"id\":\"up\",\"name\":\"bitbybit.occt.select.faces.facing\",\"customName\":\"faces facing\",\"async\":true,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"direction\":[0,1,0],\"angle\":0},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"box\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"around\":{\"id\":\"around\",\"name\":\"bitbybit.occt.select.edges.ofFaces\",\"customName\":\"edges of faces\",\"async\":true,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"box\",\"output\":\"result\",\"data\":{}}]},\"indexes\":{\"connections\":[{\"node\":\"up\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]},\"fillet\":{\"id\":\"fillet\",\"name\":\"bitbybit.occt.fillets.filletEdges\",\"customName\":\"fillet edges\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":0.8},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"box\",\"output\":\"result\",\"data\":{}}]},\"indexes\":{\"connections\":[{\"node\":\"around\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1300,40]}},\"modules\":{}}","type":"rete"}}
  title="Round the top edges, whatever their numbers in Rete"
  description="The faces that face up are chosen by a rule, then the edges around them, then only those are filleted."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"box\">box</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"box\">box</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.fillets.filletEdges\"><value name=\"Shape\"><block type=\"variables_get\"><field name=\"VAR\" id=\"box\">box</field></block></value><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">0.8</field></block></value><value name=\"Indexes\"><block type=\"bitbybit.occt.select.edges.ofFaces\"><value name=\"Shape\"><block type=\"variables_get\"><field name=\"VAR\" id=\"box\">box</field></block></value><value name=\"Indexes\"><block type=\"bitbybit.occt.select.faces.facing\"><value name=\"Shape\"><block type=\"variables_get\"><field name=\"VAR\" id=\"box\">box</field></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Angle\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></value></block></next></block></xml>","type":"blockly"}}
  title="Round the top edges, whatever their numbers in Blockly"
  description="The faces that face up are chosen by a rule, then the edges around them, then only those are filleted."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const box = await bitbybit.occt.shapes.solid.createBox({ width: 6, length: 4, height: 3, center: [0, 0, 0] });\nconst up = await bitbybit.occt.select.faces.facing({ shape: box, direction: [0, 1, 0] });\nconst around = await bitbybit.occt.select.edges.ofFaces({ shape: box, indexes: up });\nconst rounded = await bitbybit.occt.fillets.filletEdges({ shape: box, radius: 0.8, indexes: around });\n\nawait bitbybit.draw.drawAnyAsync({ entity: rounded });","type":"typescript"}}
  title="Round the top edges, whatever their numbers in TypeScript"
  description="The faces that face up are chosen by a rule, then the edges around them, then only those are filleted."
/>

</TabItem>
</Tabs>

{/* example:edges-by-rule:end */}

Rules combine: pass the indexes one rule found to the next, as above, to narrow a choice step by step.

Mind an empty choice. A rule that matches nothing returns an empty list, and `filletEdges` given no indexes rounds **every** edge. If more is rounded than you meant, check what the rule found: a direction slightly off, such as `[0, 1, 1]` instead of `[0, 1, 0]`, with an angle of 0 finds no face at all.

## By history

Some operations can report what became of each face, edge and vertex: the `*WithHistory` booleans and features, such as `bitbybit.occt.booleans.differenceWithHistory`, return beside the new shape which of its faces came from which of the old ones, so a drill's side is known to be the wall of its hole. A step built on such a face keeps finding it even after the steps before it change.

## Corners by a point

`bitbybit.occt.corners` rounds or bevels a single corner chosen by a point near it, without any index at all.
