---
sidebar_position: 9
title: Text in 3D Compared
sidebar_label: Text in 3D
description: The ways to write text in Bitbybit side by side - OCCT stroke wires, plain stroke points, JSCAD stroke solids and real fonts with the Pro text3d - what each gives you, where it lands, which font it uses and how fonts load - with an example in Rete, Blockly and TypeScript.
topic: code.concepts.text-in-3d
type: explanation
tags: [code, occt, jscad, rete, blockly, typescript]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Text in 3D compared

Bitbybit writes text in four ways. They differ in what you get back (lines, solids or the outlines of a real font), where the text lands, and which font it uses.

| Way | Function | You get | Font | Plan |
|---|---|---|---|---|
| Stroke wires | `occt.shapes.wire.textWires` | One OCCT wire per pen stroke, lying on the ground | A single-line Hershey font, built in | Free |
| Stroke points | `text.vectorText` | The strokes as lists of points, plain data with no kernel | A simple stroke font, built in | Free |
| JSCAD strokes | `jscad.text.cylindricalText`, `sphericalText`, `createVectorText` | Strokes as rounded solids, or as 2D paths | A single-line font, built in | Free |
| Real fonts | `advanced.text3d.create` | Letter faces or extruded letter solids from the outlines of a font | Ten shipped fonts, or a font file from a URL | Silver and Gold |

The first three draw letters as pen strokes: each letter is one or more lines with no width, which is what a plotter, an engraver or a laser follows. Only `text3d` uses the filled outlines of a real typeface.

Here one word is written as OCCT stroke wires and another as JSCAD cylinder solids:

{/* example:text-wires-and-solids:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"wires\":{\"id\":\"wires\",\"name\":\"bitbybit.occt.shapes.wire.textWires\",\"customName\":\"text wires\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"text\":\"Wires\",\"xOffset\":0,\"yOffset\":0,\"height\":1,\"lineSpacing\":2,\"letterSpacing\":0,\"align\":\"left\",\"extrudeOffset\":0,\"centerOnOrigin\":true},\"inputs\":{},\"position\":[40,40]},\"solids\":{\"id\":\"solids\",\"name\":\"bitbybit.jscad.text.cylindricalText\",\"customName\":\"cylindrical text\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"text\":\"Solids\",\"extrusionHeight\":0.3,\"extrusionSize\":0.08,\"segments\":24,\"xOffset\":0,\"yOffset\":1.5,\"height\":1,\"lineSpacing\":1.4,\"letterSpacing\":1,\"align\":\"center\",\"extrudeOffset\":0},\"inputs\":{},\"position\":[460,40]}},\"modules\":{}}","type":"rete"}}
  title="Text as wires and text as solids in Rete"
  description="One word written as OCCT stroke wires lying flat on the ground, another as JSCAD cylinder solids standing up behind it."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.wire.textWires\"><value name=\"Text\"><block type=\"text\"><field name=\"TEXT\">Wires</field></block></value><value name=\"XOffset\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"YOffset\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"LineSpacing\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"LetterSpacing\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Align\"><block type=\"bitbybit.base.enums.horizontalAlignEnum\"><field name=\"bitbybit.base.enums.horizontalAlignEnum\">'left'</field></block></value><value name=\"ExtrudeOffset\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"CenterOnOrigin\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.jscad.text.cylindricalText\"><value name=\"Text\"><block type=\"text\"><field name=\"TEXT\">Solids</field></block></value><value name=\"ExtrusionHeight\"><block type=\"math_number\"><field name=\"NUM\">0.3</field></block></value><value name=\"ExtrusionSize\"><block type=\"math_number\"><field name=\"NUM\">0.08</field></block></value><value name=\"Segments\"><block type=\"math_number\"><field name=\"NUM\">24</field></block></value><value name=\"XOffset\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"YOffset\"><block type=\"math_number\"><field name=\"NUM\">1.5</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"LineSpacing\"><block type=\"math_number\"><field name=\"NUM\">1.4</field></block></value><value name=\"LetterSpacing\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Align\"><block type=\"bitbybit.jscad.enums.jscadTextAlignEnum\"><field name=\"bitbybit.jscad.enums.jscadTextAlignEnum\">'center'</field></block></value><value name=\"ExtrudeOffset\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></next></block></xml>","type":"blockly"}}
  title="Text as wires and text as solids in Blockly"
  description="One word written as OCCT stroke wires lying flat on the ground, another as JSCAD cylinder solids standing up behind it."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const wires = await bitbybit.occt.shapes.wire.textWires({ text: \"Wires\", height: 1, centerOnOrigin: true });\nconst solids = await bitbybit.jscad.text.cylindricalText({ text: \"Solids\", yOffset: 1.5, extrusionHeight: 0.3, extrusionSize: 0.08 });\n\nawait bitbybit.draw.drawAnyAsync({ entity: wires });\nawait bitbybit.draw.drawAnyAsync({ entity: solids });","type":"typescript"}}
  title="Text as wires and text as solids in TypeScript"
  description="One word written as OCCT stroke wires lying flat on the ground, another as JSCAD cylinder solids standing up behind it."
/>

</TabItem>
</Tabs>

{/* example:text-wires-and-solids:end */}

## Where the text lands

- **OCCT stroke wires and `text3d` lie on the ground**, the XZ plane, reading along X, since Y points up in the editors. `centerOnOrigin` moves the middle of the text block to the origin.
- **JSCAD text stands up**, in the XY plane, with the cylinders running along Z: JSCAD builds along Z (see [Choosing a kernel](./choosing-a-kernel)). To lay it flat, turn it with `jscad.transformSolids` and a rotation of -90 degrees about X from `babylon.transforms.rotationCenterAxis`.
- **Stroke points** are plain numbers on the ground plane, ready to turn into polylines, wires or anything else.

Every way takes `height`, the height of a capital letter in model units, and line and letter spacing; a line break in the text starts a new line.

## From strokes to something you can make

Stroke wires have no thickness. Sweep a circle along them with `occt.operations.pipeWiresCylindrical` for raised or engraved strokes of a given width (see [Pipes and sweeps](../occt/operations/pipes-and-sweeps)), cut those from a plate with a boolean for an engraving, or export the wires as they are to [DXF](../occt/io/dxf-file-format-for-2d-drawings) for a plotter or a laser. `textWiresWithData` returns the wires packed per line with the size of the text block, for placing it.

`jscad.text.cylindricalText` and `sphericalText` already give solids, rounded like a pen of the given `extrusionSize`, which suits 3D printing; `createVectorText` gives the 2D paths to build your own.

## Real fonts

`advanced.text3d.create` builds letters from the outlines of a font: flat letter faces, or solids extruded by `height`. `fontType` picks one of the ten shipped families and `fontVariant` its weight or style. `createTextOnFace` lays the letters onto a curved face, and `createWithUrl` takes a font file from a URL instead. [Advanced algorithms](../advanced/intro) has an example in all three editors.

The shipped fonts load with the OCCT worker. The editors on bitbybit.dev load all ten when they start; with the runners and the npm packages, the `loadFonts` init option lists the families to load, an empty list loads none, and leaving it out loads them all. A font that was not loaded cannot be used by `text3d`; a font from a URL is loaded when it is used.
