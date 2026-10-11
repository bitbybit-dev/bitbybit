---
sidebar_position: 1
title: Selecting Faces and Edges by Rule
sidebar_label: Selecting Faces and Edges
description: The OCCT select functions choose faces and edges by what they are and where they lie - facing a direction, along an axis, on a plane, by radius or size, in a box, around chosen faces - and return the indexes fillets, chamfers and features take, with an example in Rete, Blockly and TypeScript.
topic: code.occt.select
type: explanation
tags: [code, occt]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Selecting faces and edges by rule

Fillets, chamfers, push-pull and face removal all work on chosen faces or edges, given as a list of indexes. `bitbybit.occt.select` finds those indexes for you from a rule, so the choice survives when the model changes. [Picking faces and edges](../../concepts/picking-faces-and-edges) explains why that matters; this page lists the rules.

## How the rules work

- Every rule takes the shape and returns a list of indexes, counted from 0 as `getFaces` and `getEdges` list them.
- Every rule can narrow an earlier choice: give it `indexes`, and it chooses only among those. Chain rules to say "the circular edges of the top face".
- A rule that matches nothing returns an empty list. Check before you pass it on: `filletEdges` given no indexes rounds every edge.

Here the edges that run along Y are chosen and only they are rounded, which is the rule for "round the upright corners of a box":

{/* example:vertical-edges:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"box\":{\"id\":\"box\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":4,\"length\":4,\"height\":4,\"center\":[0,0,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,40]},\"upright\":{\"id\":\"upright\",\"name\":\"bitbybit.occt.select.edges.along\",\"customName\":\"edges along\",\"async\":true,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"direction\":[0,1,0],\"angle\":0},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"box\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"fillet\":{\"id\":\"fillet\",\"name\":\"bitbybit.occt.fillets.filletEdges\",\"customName\":\"fillet edges\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":1},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"box\",\"output\":\"result\",\"data\":{}}]},\"indexes\":{\"connections\":[{\"node\":\"upright\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]}},\"modules\":{}}","type":"rete"}}
  title="Round only the upright edges in Rete"
  description="The edges that run along Y are chosen by a rule, and only they are filleted."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"box\">box</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"box\">box</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.fillets.filletEdges\"><value name=\"Shape\"><block type=\"variables_get\"><field name=\"VAR\" id=\"box\">box</field></block></value><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Indexes\"><block type=\"bitbybit.occt.select.edges.along\"><value name=\"Shape\"><block type=\"variables_get\"><field name=\"VAR\" id=\"box\">box</field></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Angle\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></next></block></xml>","type":"blockly"}}
  title="Round only the upright edges in Blockly"
  description="The edges that run along Y are chosen by a rule, and only they are filleted."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const box = await bitbybit.occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, 0] });\nconst upright = await bitbybit.occt.select.edges.along({ shape: box, direction: [0, 1, 0], angle: 0 });\nconst rounded = await bitbybit.occt.fillets.filletEdges({ shape: box, radius: 1, indexes: upright });\n\nawait bitbybit.draw.drawAnyAsync({ entity: rounded });","type":"typescript"}}
  title="Round only the upright edges in TypeScript"
  description="The edges that run along Y are chosen by a rule, and only they are filleted."
/>

</TabItem>
</Tabs>

{/* example:vertical-edges:end */}

## Faces

| Rule | Chooses the faces |
|---|---|
| `facing` | whose normal points within an angle of a direction |
| `onPlane` | lying in a plane |
| `ofType` | of a kind of surface: flat, cylindrical, conical, spherical and so on |
| `byRadius`, `bySize` | by the radius of a curved face, or by area |
| `inBox`, `inSphere`, `nearest` | by where they lie |
| `extreme` | furthest along a direction, such as the top or the bottom |
| `adjacentTo`, `ofEdges` | beside chosen faces, or around chosen edges |
| `sortAlong`, `groupAlong` | ordered, or grouped in layers, along a direction |

## Edges

| Rule | Chooses the edges |
|---|---|
| `along` | straight, running within an angle of a direction |
| `onPlane` | lying in a plane |
| `ofType` | of a kind of curve: line, circle, ellipse, B-spline |
| `byLength`, `byRadius` | by length, or by the radius of a circular edge |
| `convex`, `concave` | outside corners, or inside corners |
| `between`, `ofFaces` | where two sets of faces meet, or around chosen faces |
| `tangentChain` | an edge and every edge that continues it smoothly |
| `inBox`, `inSphere`, `nearest`, `extreme` | by where they lie |
| `sortAlong`, `groupAlong` | ordered, or grouped, along a direction |

## Every rule

{/* api:occt.select:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`edges.along`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#along) | Chooses the straight edges that run within `angle` degrees of `direction`, either way along it: an angle of 0 finds the edges parallel to it. |
| [`edges.between`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#between) | Chooses the edges where a face of `indexes` meets a different face of `otherIndexes`, such as the edges round a top face where it meets the sides. |
| [`edges.byLength`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#byLength) | Chooses the edges whose length lies between `min` and `max`, both included. |
| [`edges.byRadius`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#byRadius) | Chooses the circular edges whose radius lies between `min` and `max`, both included. |
| [`edges.concave`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#concave) | Chooses the edges where two faces meet at an inside corner, the valleys a fillet fills; faces meeting within `tangentAngle` degrees of smooth count as neither. |
| [`edges.convex`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#convex) | Chooses the edges where two faces meet at an outside corner, the ridges a fillet rounds off; faces meeting within `tangentAngle` degrees of smooth count as neither. |
| [`edges.extreme`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#extreme) | Chooses the edges whose centres lie furthest along `direction`, with any others within `tolerance` of them: the edges round the top along z. |
| [`edges.groupAlong`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#groupAlong) | Sorts edges along `direction` and groups them by level: a group ends where the next centre lies more than `tolerance` beyond the group's first. |
| [`edges.inBox`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#inBox) | Chooses the edges whose centres lie inside a box lined up with the axes, given by two opposite corners in either order. |
| [`edges.inSphere`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#inSphere) | Chooses the edges whose centres lie within `radius` of `center`. |
| [`edges.nearest`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#nearest) | Chooses the `count` edges whose centres lie nearest `point`, nearest first; edges as near as each other keep their order. |
| [`edges.ofFaces`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#ofFaces) | Chooses the edges that bound any of the given faces, counted as `shapes.face.getFaces` counts them. |
| [`edges.ofType`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#ofType) | Chooses the edges that run along one kind of curve, such as the straight edges of a part or the circular rims of its holes. |
| [`edges.onPlane`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#onPlane) | Chooses the edges that lie in a plane, given by a point on it and its normal: every point of an edge within `tolerance` of the plane. |
| [`edges.sortAlong`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#sortAlong) | Orders edges by how far along `direction` their centres lie, from the lowest to the highest; edges level with each other keep their order. |
| [`edges.tangentChain`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectEdges#tangentChain) | Grows the given edges into the chains they continue smoothly: two edges meeting where their tangents turn by no more than `angle` degrees are one chain, as a fillet runs along. |
| [`faces.adjacentTo`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectFaces#adjacentTo) | Chooses the faces that share an edge with any of the given faces, leaving out the given faces themselves. |
| [`faces.byRadius`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectFaces#byRadius) | Chooses the faces on cylinders and spheres whose radius lies between `min` and `max`, and the faces on tori whose tube radius does, the rounds a fillet makes along a curved edge. |
| [`faces.bySize`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectFaces#bySize) | Chooses the faces whose area lies between `min` and `max`, both included. |
| [`faces.extreme`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectFaces#extreme) | Chooses the faces whose centres lie furthest along `direction`, with any others within `tolerance` of them: the top faces along z, the lowest along minus z. |
| [`faces.facing`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectFaces#facing) | Chooses the faces whose normal, read at the middle of each face, points within `angle` degrees of `direction`: an angle of 0 finds the faces looking straight that way. |
| [`faces.groupAlong`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectFaces#groupAlong) | Sorts faces along `direction` and groups them by level: a group ends where the next centre lies more than `tolerance` beyond the group's first. |
| [`faces.inBox`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectFaces#inBox) | Chooses the faces whose centres lie inside a box lined up with the axes, given by two opposite corners in either order. |
| [`faces.inSphere`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectFaces#inSphere) | Chooses the faces whose centres lie within `radius` of `center`. |
| [`faces.nearest`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectFaces#nearest) | Chooses the `count` faces whose centres lie nearest `point`, nearest first; faces as near as each other keep their order. |
| [`faces.ofEdges`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectFaces#ofEdges) | Chooses the faces bounded by any of the given edges, counted as `shapes.edge.getEdges` counts them: the two faces that meet along each. |
| [`faces.ofType`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectFaces#ofType) | Chooses the faces that lie on one kind of surface, such as the planar faces of a part or the cylindrical walls of its holes. |
| [`faces.onPlane`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectFaces#onPlane) | Chooses the planar faces that lie in a plane, given by a point on it and its normal; a face counts from either side, within `tolerance`. |
| [`faces.sortAlong`](https://docs.bitbybit.dev/classes/Bit.OCCTSelectFaces#sortAlong) | Orders faces by how far along `direction` their centres lie, from the lowest to the highest; faces level with each other keep their order. |

{/* api:occt.select:end */}
