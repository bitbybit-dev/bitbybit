---
sidebar_position: 6
title: Checking a Shape
sidebar_label: Checking a Shape
description: Why an operation can return a shape that is not what you meant without failing, and how to check a result - its volume, its validity, its size - and repair what came from a file.
topic: code.concepts.checking-a-shape
type: explanation
tags: [code, occt]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Checking a shape

Most mistakes in modelling announce themselves: a function stops with an error, and the [errors](/learn/getting-started/basics/errors) page explains how to read it. A few do not. An operation can finish and return a shape that is not the one you meant:

- **A cut that misses** leaves the shape as it was, with no error.
- **A fillet too large** for the faces beside an edge can return a solid that is not valid.
- **A face made from several wires** keeps a hole only when the hole's wire runs against the outline.
- **Extruding a wire** gives a shell, not a solid.

So it pays to check a result, especially one the rest of a model builds on.

## Ask the kernel

The kernel answers questions about a shape with numbers and yes or no, rather than new shapes:

| Question | Function |
|---|---|
| How much material is there? | `bitbybit.occt.shapes.solid.getSolidVolume`, `getSolidSurfaceArea` |
| Is it a valid shape? | `bitbybit.occt.shapeFix.isValid` |
| How big is it, and where? | `bitbybit.occt.analysis.measure.tightBoundingBox` |
| How close are two shapes, and where? | `bitbybit.occt.analysis.measure.extrema` |
| Do parts collide? | `bitbybit.occt.analysis.clashes.betweenShapes` |
| What is it made of? | `bitbybit.occt.shapes.solid.debugInfo` and the `get*` functions of each shape type |

Here a cylinder is cut through a box, and the result's volume and validity are read back. A volume smaller than the box's 64 says the cut happened:

{/* example:cut-and-check:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"box\":{\"id\":\"box\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":4,\"length\":4,\"height\":4,\"center\":[0,0,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,40]},\"hole\":{\"id\":\"hole\",\"name\":\"bitbybit.occt.shapes.solid.createCylinder\",\"customName\":\"cylinder\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":1,\"height\":6,\"center\":[0,-3,0],\"direction\":[0,1,0],\"angle\":360,\"originOnCenter\":false},\"inputs\":{},\"position\":[40,460]},\"tools\":{\"id\":\"tools\",\"name\":\"bitbybit.lists.createList\",\"customName\":\"create list\",\"async\":false,\"drawable\":false,\"data\":{},\"inputs\":{\"listElements\":{\"connections\":[{\"node\":\"hole\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,460]},\"cut\":{\"id\":\"cut\",\"name\":\"bitbybit.occt.booleans.difference\",\"customName\":\"difference\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"keepEdges\":false,\"strategy\":\"oneAfterAnother\"},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"box\",\"output\":\"result\",\"data\":{}}]},\"shapes\":{\"connections\":[{\"node\":\"tools\",\"output\":\"list\",\"data\":{}}]}},\"position\":[460,40]},\"volume\":{\"id\":\"volume\",\"name\":\"bitbybit.occt.shapes.solid.getSolidVolume\",\"customName\":\"get solid volume\",\"async\":true,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"cut\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]},\"valid\":{\"id\":\"valid\",\"name\":\"bitbybit.occt.shapeFix.isValid\",\"customName\":\"is valid\",\"async\":true,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"cut\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,300]}},\"modules\":{}}","type":"rete"}}
  title="Cut a hole, then check the result in Rete"
  description="A cylinder is cut from a box; the result's volume and validity are read back from the kernel."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"cut\">cut</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"cut\">cut</field><value name=\"VALUE\"><block type=\"bitbybit.occt.booleans.difference\"><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Shapes\"><block type=\"bitbybit.lists.addItem\"><value name=\"List\"><block type=\"bitbybit.lists.createEmptyList\"></block></value><value name=\"Item\"><block type=\"bitbybit.occt.shapes.solid.createCylinder\"><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">-3</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Angle\"><block type=\"math_number\"><field name=\"NUM\">360</field></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"KeepEdges\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"Strategy\"><block type=\"bitbybit.occt.enums.booleanStrategyEnum\"><field name=\"bitbybit.occt.enums.booleanStrategyEnum\">'oneAfterAnother'</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"variables_get\"><field name=\"VAR\" id=\"cut\">cut</field></block></value></block></next></block></xml>","type":"blockly"}}
  title="Cut a hole, then check the result in Blockly"
  description="A cylinder is cut from a box; the result's volume and validity are read back from the kernel."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const box = await bitbybit.occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, 0] });\nconst hole = await bitbybit.occt.shapes.solid.createCylinder({ radius: 1, height: 6, center: [0, -3, 0] });\nconst cut = await bitbybit.occt.booleans.difference({ shape: box, shapes: [hole], keepEdges: false });\n\nconst volume = await bitbybit.occt.shapes.solid.getSolidVolume({ shape: cut });\nconst valid = await bitbybit.occt.shapeFix.isValid({ shape: cut });\nconsole.log(`Volume ${volume.toFixed(2)}, valid: ${valid}`);\n\nawait bitbybit.draw.drawAnyAsync({ entity: cut });","type":"typescript"}}
  title="Cut a hole, then check the result in TypeScript"
  description="A cylinder is cut from a box; the result's volume and validity are read back from the kernel."
/>

</TabItem>
</Tabs>

{/* example:cut-and-check:end */}

In TypeScript the answer is written to the console. In Rete, point at the output of <Ui>get solid volume</Ui> or <Ui>is valid</Ui> to read the value it gave.

## Repair what came from elsewhere

Shapes read from STEP or IGES files, or made from imported meshes, sometimes arrive with gaps or faces that do not quite meet. `bitbybit.occt.shapeFix` checks and repairs them:

- `validityReport` says which parts of a shape are faulty and why;
- `freeBoundaries` finds the edges that bound only one face, the rims of the gaps;
- `basicShapeRepair` closes small gaps and fixes wire and face defects, and `fixShell` and `fixSolid` repair shells and solids;
- `sewWithReport` sews loose faces together into a shell and says what it joined.

Check with `isValid`, repair, and check again.

## Every function

{/* api:occt.shapeFix:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`basicShapeRepair`](https://docs.bitbybit.dev/classes/Bit.OCCTShapeFix#basicShapeRepair) | Runs the kernel's general repair over a shape: closes small gaps, fixes wire and face defects and brings tolerances into the given range. |
| [`fixEdgeOrientationsAlongWire`](https://docs.bitbybit.dev/classes/Bit.OCCTShapeFix#fixEdgeOrientationsAlongWire) | Rebuilds a wire so its edges run head to tail in one direction along it. |
| [`fixShell`](https://docs.bitbybit.dev/classes/Bit.OCCTShapeFix#fixShell) | Repairs a shell: turns its faces so they all face the same way and fixes its faces and edges. |
| [`fixSmallEdgeOnWire`](https://docs.bitbybit.dev/classes/Bit.OCCTShapeFix#fixSmallEdgeOnWire) | Removes edges shorter than `precsmall` from a wire and closes the gaps they leave, so a tiny sliver no longer breaks a fillet or a face. |
| [`fixSolid`](https://docs.bitbybit.dev/classes/Bit.OCCTShapeFix#fixSolid) | Repairs a solid, or makes one from a closed shell, with its shells fixed and turned so the material is inside. |
| [`freeBoundaries`](https://docs.bitbybit.dev/classes/Bit.OCCTShapeFix#freeBoundaries) | Finds the edges of a shape that bound only one face, joined into wires: the rims of an open shell's openings, or a lone face's outline and holes. |
| [`isValid`](https://docs.bitbybit.dev/classes/Bit.OCCTShapeFix#isValid) | Tells whether the shape is well formed, which a successful operation does not always guarantee. |
| [`orientClosedSolid`](https://docs.bitbybit.dev/classes/Bit.OCCTShapeFix#orientClosedSolid) | Turns a closed solid so its material is inside, which gives an inside-out solid its positive volume back; only the orientation changes. |
| [`sewWithReport`](https://docs.bitbybit.dev/classes/Bit.OCCTShapeFix#sewWithReport) | Sews the faces of shapes together along edges that lie within `tolerance` of each other, as `shapes.shell.sewFaces` does, and reports what it joined and what it left open. |
| [`validityReport`](https://docs.bitbybit.dev/classes/Bit.OCCTShapeFix#validityReport) | Checks a shape as `isValid` does and reports each faulty sub-shape with the checks it fails, and the spread of its tolerances. |

{/* api:occt.shapeFix:end */}
