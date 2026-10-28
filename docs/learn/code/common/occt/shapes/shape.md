---
sidebar_position: 8
title: Asking a Shape About Itself
sidebar_label: Any Shape
description: What every OCCT shape can tell you and have done to it - its type and orientation, whether it is closed or empty, whether two handles are the same shape, merging the seams a boolean leaves with unifySameDomain and removing the edges a split leaves inside a face - with an example in Rete, Blockly and TypeScript and a table of every function.
topic: code.occt.shapes.shape
type: explanation
tags: [code, occt]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Asking a shape about itself

The functions in `bitbybit.occt.shapes.shape` work on a shape of any kind, a vertex, a wire or a whole compound alike. Most of them ask a question; two clean a shape up.

## Merging seams

A boolean leaves the faces of its inputs as they were cut, so two boxes fused into one keep a seam wherever their faces now lie on one plane. `unifySameDomain` merges faces that lie on the same surface into one face, and edges that continue each other on one curve into one edge. `booleans.union` does it for you unless `keepEdges` is true; after a difference, a fillet or an import with many small faces, calling it yourself gives a clean shape whose faces are easier to select and to fillet. `unifySameDomainWithHistory` merges the same way and also reports what each face, edge and vertex became, as a [history](../../concepts/picking-faces-and-edges#by-history): both halves of a face the fuse split name the one face they merge into, so a step that found a face before the merge still finds it after.

Here two crossing boxes are fused with their edges kept, so seams run across the top. Beside them is the same union after `unifySameDomain`, with one face per flat side:

{/* example:seams-merged:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"long\":{\"id\":\"long\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":4,\"length\":2,\"height\":2,\"center\":[0,1,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,40]},\"wide\":{\"id\":\"wide\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":2,\"length\":4,\"height\":2,\"center\":[1,1,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,520]},\"boxes\":{\"id\":\"boxes\",\"name\":\"bitbybit.lists.createList\",\"customName\":\"create list\",\"async\":false,\"drawable\":false,\"data\":{},\"inputs\":{\"listElements\":{\"connections\":[{\"node\":\"long\",\"output\":\"result\",\"data\":{}},{\"node\":\"wide\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"union\":{\"id\":\"union\",\"name\":\"bitbybit.occt.booleans.union\",\"customName\":\"union\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"keepEdges\":true,\"strategy\":\"oneAfterAnother\"},\"inputs\":{\"shapes\":{\"connections\":[{\"node\":\"boxes\",\"output\":\"list\",\"data\":{}}]}},\"position\":[880,40]},\"unified\":{\"id\":\"unified\",\"name\":\"bitbybit.occt.shapes.shape.unifySameDomain\",\"customName\":\"unify same domain\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"unifyEdges\":true,\"unifyFaces\":true,\"concatBSplines\":true},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"union\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1300,40]},\"beside\":{\"id\":\"beside\",\"name\":\"bitbybit.occt.transforms.translate\",\"customName\":\"translate\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"translation\":[7,0,0]},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"unified\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1720,40]}},\"modules\":{}}","type":"rete"}}
  title="A union's seams merged away in Rete"
  description="Two crossing boxes fused with their edges kept show seams across the top; the same union after unifySameDomain, beside it, has one face per flat side."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"union\">union</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"union\">union</field><value name=\"VALUE\"><block type=\"bitbybit.occt.booleans.union\"><value name=\"Shapes\"><block type=\"bitbybit.lists.addItem\"><value name=\"List\"><block type=\"bitbybit.lists.addItem\"><value name=\"List\"><block type=\"bitbybit.lists.createEmptyList\"></block></value><value name=\"Item\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"Item\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"KeepEdges\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"Strategy\"><block type=\"bitbybit.occt.enums.booleanStrategyEnum\"><field name=\"bitbybit.occt.enums.booleanStrategyEnum\">'oneAfterAnother'</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"variables_get\"><field name=\"VAR\" id=\"union\">union</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.transforms.translate\"><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.shape.unifySameDomain\"><value name=\"Shape\"><block type=\"variables_get\"><field name=\"VAR\" id=\"union\">union</field></block></value><value name=\"UnifyEdges\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"UnifyFaces\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"ConcatBSplines\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Translation\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">7</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></next></block></next></block></xml>","type":"blockly"}}
  title="A union's seams merged away in Blockly"
  description="Two crossing boxes fused with their edges kept show seams across the top; the same union after unifySameDomain, beside it, has one face per flat side."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const long = await bitbybit.occt.shapes.solid.createBox({ width: 4, length: 2, height: 2, center: [0, 1, 0] });\nconst wide = await bitbybit.occt.shapes.solid.createBox({ width: 2, length: 4, height: 2, center: [1, 1, 0] });\nconst union = await bitbybit.occt.booleans.union({ shapes: [long, wide], keepEdges: true });\n\nconst unified = await bitbybit.occt.shapes.shape.unifySameDomain({ shape: union });\nconst beside = await bitbybit.occt.transforms.translate({ shape: unified, translation: [7, 0, 0] });\n\nconst before = await bitbybit.occt.shapes.face.getFaces({ shape: union });\nconst after = await bitbybit.occt.shapes.face.getFaces({ shape: unified });\nconsole.log(`${before.length} faces before, ${after.length} after`);\n\nawait bitbybit.draw.drawAnyAsync({ entity: union });\nawait bitbybit.draw.drawAnyAsync({ entity: beside });","type":"typescript"}}
  title="A union's seams merged away in TypeScript"
  description="Two crossing boxes fused with their edges kept show seams across the top; the same union after unifySameDomain, beside it, has one face per flat side."
/>

</TabItem>
</Tabs>

{/* example:seams-merged:end */}

`unifyFaces` and `unifyEdges` choose what is merged, and `concatBSplines` joins neighboring B-spline edges into one where it can.

## Removing edges left inside a face

A split, or a general fuse, cuts a face only where a cutting edge crosses it. Where the edge lies inside the face and reaches none of its sides, the face keeps that piece of edge as an internal edge: it is drawn and selectable, but bounds nothing. `purgeInternalEdges` removes such edges and rebuilds the faces around them. An edge that bounds any face of the shape stays, and a shape with nothing to remove comes back as it was.

Here a box is split by a short segment lying on its top, which leaves the segment as an edge inside the top face. Beside it is the same box after `purgeInternalEdges`:

{/* example:internal-edges-purged:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"box\":{\"id\":\"box\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":4,\"length\":4,\"height\":2,\"center\":[0,1,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,40]},\"segment\":{\"id\":\"segment\",\"name\":\"bitbybit.occt.shapes.edge.line\",\"customName\":\"line\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"start\":[-1,2,0],\"end\":[1,2,0]},\"inputs\":{},\"position\":[40,520]},\"cutters\":{\"id\":\"cutters\",\"name\":\"bitbybit.lists.createList\",\"customName\":\"create list\",\"async\":false,\"drawable\":false,\"data\":{},\"inputs\":{\"listElements\":{\"connections\":[{\"node\":\"segment\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,520]},\"pieces\":{\"id\":\"pieces\",\"name\":\"bitbybit.occt.operations.splitShapeWithShapes\",\"customName\":\"split shape with shapes\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"localFuzzyTolerance\":0.0001,\"nonDestructive\":false},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"box\",\"output\":\"result\",\"data\":{}}]},\"shapes\":{\"connections\":[{\"node\":\"cutters\",\"output\":\"list\",\"data\":{}}]}},\"position\":[880,40]},\"split\":{\"id\":\"split\",\"name\":\"bitbybit.lists.getItem\",\"customName\":\"get item\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"index\":0,\"clone\":true},\"inputs\":{\"list\":{\"connections\":[{\"node\":\"pieces\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1300,40]},\"purged\":{\"id\":\"purged\",\"name\":\"bitbybit.occt.shapes.shape.purgeInternalEdges\",\"customName\":\"purge internal edges\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"split\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1720,40]},\"beside\":{\"id\":\"beside\",\"name\":\"bitbybit.occt.transforms.translate\",\"customName\":\"translate\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"translation\":[6,0,0]},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"purged\",\"output\":\"result\",\"data\":{}}]}},\"position\":[2140,40]}},\"modules\":{}}","type":"rete"}}
  title="A split's leftover edge purged in Rete"
  description="A box split by a short segment lying on its top keeps the segment as an edge inside the top face; beside it, the same box after purgeInternalEdges has a plain top again."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"split\">split</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"split\">split</field><value name=\"VALUE\"><block type=\"bitbybit.lists.getItem\"><value name=\"List\"><block type=\"base_time_await_return\"><value name=\"Promise\"><block type=\"bitbybit.occt.operations.splitShapeWithShapes\"><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Shapes\"><block type=\"bitbybit.lists.addItem\"><value name=\"List\"><block type=\"bitbybit.lists.createEmptyList\"></block></value><value name=\"Item\"><block type=\"bitbybit.occt.shapes.edge.line\"><value name=\"Start\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">-1</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"End\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"LocalFuzzyTolerance\"><block type=\"math_number\"><field name=\"NUM\">0.0001</field></block></value><value name=\"NonDestructive\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value></block></value><value name=\"Index\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"variables_get\"><field name=\"VAR\" id=\"split\">split</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.transforms.translate\"><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.shape.purgeInternalEdges\"><value name=\"Shape\"><block type=\"variables_get\"><field name=\"VAR\" id=\"split\">split</field></block></value></block></value><value name=\"Translation\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></next></block></next></block></xml>","type":"blockly"}}
  title="A split's leftover edge purged in Blockly"
  description="A box split by a short segment lying on its top keeps the segment as an edge inside the top face; beside it, the same box after purgeInternalEdges has a plain top again."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const box = await bitbybit.occt.shapes.solid.createBox({ width: 4, length: 4, height: 2, center: [0, 1, 0] });\nconst segment = await bitbybit.occt.shapes.edge.line({ start: [-1, 2, 0], end: [1, 2, 0] });\nconst [split] = await bitbybit.occt.operations.splitShapeWithShapes({ shape: box, shapes: [segment], nonDestructive: false });\n\nconst purged = await bitbybit.occt.shapes.shape.purgeInternalEdges({ shape: split });\nconst beside = await bitbybit.occt.transforms.translate({ shape: purged, translation: [6, 0, 0] });\n\nconst before = await bitbybit.occt.shapes.edge.getEdges({ shape: split });\nconst after = await bitbybit.occt.shapes.edge.getEdges({ shape: purged });\nconsole.log(`${before.length} edges before, ${after.length} after`);\n\nawait bitbybit.draw.drawAnyAsync({ entity: split });\nawait bitbybit.draw.drawAnyAsync({ entity: beside });","type":"typescript"}}
  title="A split's leftover edge purged in TypeScript"
  description="A box split by a short segment lying on its top keeps the segment as an edge inside the top face; beside it, the same box after purgeInternalEdges has a plain top again."
/>

</TabItem>
</Tabs>

{/* example:internal-edges-purged:end */}

`unifySameDomain` does not remove these edges: it merges faces and edges, while an internal edge has no neighbour to merge with.

## Questions a shape answers

- **What it is:** `getShapeType` says vertex, edge, wire, face, shell, solid or compound; `isNull` says the handle holds nothing, which a failed operation can return.
- **Which way it faces:** `getOrientation` reads forward, reversed, internal or external. For a face it decides which side its normal points to.
- **Whether two handles are one shape:** `isSame` is true when both share geometry and placement, whatever their orientation; `isEqual` also needs the same orientation; `isPartner` only needs the same geometry, however placed. A face you got back from `getFaces` is the same as the one you selected earlier when `isSame` says so.
- **Flags the kernel keeps:** `isClosed`, `isConvex`, `isInfinite`, `isFree`, `isLocked`, `isModified` and `isChecked` read flags OCCT stores on a shape. They are set by the operation that made it and are not checks of their own: to know whether a shape is valid, use `shapeFix.isValid` (see [Checking a shape](/learn/code/common/concepts/checking-a-shape)).


## Every function

{/* api:occt.shapes.shape:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`getOrientation`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#getOrientation) | Reads which way the shape is oriented: forward, reversed, internal or external, which for a face decides which side its normal points to. |
| [`getShapeType`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#getShapeType) | Reads what kind of shape this is: vertex, edge, wire, face, shell, solid, compound or another kernel type. |
| [`isChecked`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#isChecked) | Tells whether the kernel has already run its validity check on the shape. |
| [`isClosed`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#isClosed) | Tells whether the kernel has the shape flagged as closed, such as a wire that loops back to its start or a shell with no gaps. |
| [`isConvex`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#isConvex) | Tells whether the kernel has the shape flagged as convex. |
| [`isEqual`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#isEqual) | Tells whether two handles point at the same geometry with the same placement and orientation. |
| [`isFree`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#isFree) | Tells whether the kernel has the shape flagged as free, that is, not held inside another shape. |
| [`isInfinite`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#isInfinite) | Tells whether the kernel has the shape flagged as infinite, such as an unbounded plane or line. |
| [`isLocked`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#isLocked) | Tells whether the kernel has the shape flagged as locked against changes. |
| [`isModified`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#isModified) | Tells whether the kernel has the shape flagged as modified since it was last checked. |
| [`isNotEqual`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#isNotEqual) | Tells whether two handles differ in geometry, placement or orientation. |
| [`isNull`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#isNull) | Tells whether the shape is empty: a handle that holds no geometry, which an operation that failed can return. |
| [`isPartner`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#isPartner) | Tells whether two handles share the same underlying geometry, even if placed or oriented differently. |
| [`isSame`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#isSame) | Tells whether two handles share the same geometry and placement, ignoring orientation. |
| [`purgeInternalEdges`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#purgeInternalEdges) | Removes the edges that lie inside a face without bounding it, such as the segment a split leaves on a face, and rebuilds the faces around them. |
| [`unifySameDomain`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#unifySameDomain) | Merges faces that lie on the same surface and edges that lie on the same curve into single faces and edges, which cleans up the seams a boolean or a fuse leaves behind. |
| [`unifySameDomainWithHistory`](https://docs.bitbybit.dev/classes/Bit.OCCTShape#unifySameDomainWithHistory) | Merges faces and edges as `unifySameDomain` does, and reports what each face, edge and vertex of the shape became: both halves of a face a fuse split name the one face they merge into. |

{/* api:occt.shapes.shape:end */}
