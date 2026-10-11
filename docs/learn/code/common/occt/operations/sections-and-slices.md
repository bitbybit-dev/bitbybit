---
sidebar_position: 8
title: Sections, Slices and Drawings
sidebar_label: Sections and Slices
description: Cutting OCCT shapes for drawings and fabrication - slicing a solid into layers, cutting it with planes or frames, splitting it with other shapes, the outline where two shapes meet, and hidden-line views for technical drawings - with an example in Rete, Blockly and TypeScript.
topic: code.occt.operations.sections-and-slices
type: how-to
tags: [code, occt]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Sections, slices and drawings

Many uses of a 3D model are flat: the layers a 3D printer or a laser cutter makes, a cross-section through a part, a technical drawing with hidden edges dashed. `bitbybit.occt.operations` cuts shapes for all of them.

## Slices

`slice` cuts a solid into parallel layers along a direction, every `step` model units, like a loaf of bread. Each layer is the flat section where a cutting plane meets the solid, and all of them come back in one compound. `sliceInStepPattern` uses a repeating pattern of gaps, and `sliceByFrames` cuts with the plane of each frame you give it, at any angle.

Here a sphere is sliced every half unit along Y:

{/* example:sliced-sphere:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"sphere\":{\"id\":\"sphere\",\"name\":\"bitbybit.occt.shapes.solid.createSphere\",\"customName\":\"sphere\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":4,\"center\":[0,0,0]},\"inputs\":{},\"position\":[40,40]},\"slice\":{\"id\":\"slice\",\"name\":\"bitbybit.occt.operations.slice\",\"customName\":\"slice\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"step\":0.5,\"direction\":[0,1,0]},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"sphere\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]}},\"modules\":{}}","type":"rete"}}
  title="A sphere cut into layers in Rete"
  description="A sphere sliced every half unit along Y, as a 3D printer or a laser cutter would see it."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.operations.slice\"><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.solid.createSphere\"><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"Step\"><block type=\"math_number\"><field name=\"NUM\">0.5</field></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></xml>","type":"blockly"}}
  title="A sphere cut into layers in Blockly"
  description="A sphere sliced every half unit along Y, as a 3D printer or a laser cutter would see it."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const sphere = await bitbybit.occt.shapes.solid.createSphere({ radius: 4, center: [0, 0, 0] });\nconst slices = await bitbybit.occt.operations.slice({ shape: sphere, step: 0.5, direction: [0, 1, 0] });\n\nawait bitbybit.draw.drawAnyAsync({ entity: slices });","type":"typescript"}}
  title="A sphere cut into layers in TypeScript"
  description="A sphere sliced every half unit along Y, as a 3D printer or a laser cutter would see it."
/>

</TabItem>
</Tabs>

{/* example:sliced-sphere:end */}

Each slice is a face: extrude it by the thickness of your sheet and you have the parts of a stacked model to cut.

## Splitting

- `splitByFrame` cuts a shape in two with the plane of a frame and gives both halves.
- `splitShapeWithShapes` cuts a shape into pieces with other shapes, without removing material, as a knife would.
- `splitFaceByWires` scores a face along wires that lie on it, so each region can be coloured or extruded on its own.

## Where two shapes meet

`sectionWires` finds the curves where two shapes meet and joins them into wires: the outline a plane cuts through a part, or the seam where a pipe meets a wall.

## Drawings

`hiddenLines` draws a shape as a technical drawing does, seen from a view frame and flattened: the edges the eye sees, and those hidden behind faces, which a drawing dashes. Together with sections, the result goes to [DXF](../io/dxf-file-format-for-2d-drawings) or SVG for a drawing or a cutter.
