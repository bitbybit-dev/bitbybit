---
sidebar_position: 5
title: "Machining: Threads, Keyways, Grooves, Splines, Knurls and Flats"
sidebar_label: Machining
description: Threads, keyways, retaining ring grooves, splines, knurls and flats cut into shafts, holes and hubs to ISO, ANSI and DIN, each with a tool that is the material it removes, and the thread, spline and knurl tables behind them.
topic: code.occt.parts.machining
type: explanation
tags: [code, occt]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Machining

`bitbybit.occt.parts.mechanical.machining` cuts the features a part needs to take standard parts: a thread for a screw, a keyway for a key, a groove for a retaining ring, a spline or a knurl, a flat for a set screw. [Standard parts](./intro) explains the standards, units and frames they share.

## A cut, or the tool that makes it

Each feature comes in two forms. `keyway` cuts a keyway into the shaft you give it and returns a new solid, leaving the one you gave as it was; `keywayTool` makes the solid a keyway removes, without cutting anything. Subtracting the tool with `bitbybit.occt.booleans.difference` gives the same result as the cut, so use the tool to cut several bodies at once, to show the material a feature takes away, or to cut through a boolean of your own:

```typescript
const shaft = await bitbybit.occt.shapes.solid.createCylinder({ radius: 10, height: 60, center: [0, 0, 0], direction: [0, 1, 0] });
const tool = await bitbybit.occt.parts.mechanical.machining.din.keywayTool({ diameter: 20, length: 20, frame: { origin: [0, 30, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });
const cut = await bitbybit.occt.booleans.difference({ shape: shaft, shapes: [tool], keepEdges: false });
```

## A tapped hole

Here an M8 thread is tapped into a block, its hole drilled through at the tap drill size the thread table gives; in Rete and Blockly, `bitbybit.json.getValueOnProp` reads the `tapDrill` out of the table's answer:

{/* example:tapped-hole:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"mouth\":{\"id\":\"mouth\",\"name\":\"bitbybit.frame.create\",\"customName\":\"frame\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"origin\":[0,12,0],\"normal\":[0,1,0],\"direction\":[1,0,0]},\"inputs\":{},\"position\":[40,40]},\"mouths\":{\"id\":\"mouths\",\"name\":\"bitbybit.lists.createList\",\"customName\":\"create list\",\"async\":false,\"drawable\":false,\"data\":{},\"inputs\":{\"listElements\":{\"connections\":[{\"node\":\"mouth\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"threadSizes\":{\"id\":\"threadSizes\",\"name\":\"bitbybit.engineering.mechanical.threads.iso.thread\",\"customName\":\"thread\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"size\":\"M8\",\"unit\":\"mm\"},\"inputs\":{},\"position\":[40,460]},\"tapDrill\":{\"id\":\"tapDrill\",\"name\":\"bitbybit.json.getValueOnProp\",\"customName\":\"get value on prop\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"property\":\"tapDrill\"},\"inputs\":{\"json\":{\"connections\":[{\"node\":\"threadSizes\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,460]},\"block\":{\"id\":\"block\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":20,\"length\":20,\"height\":12,\"center\":[0,6,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,860]},\"drilled\":{\"id\":\"drilled\",\"name\":\"bitbybit.occt.features.holes\",\"customName\":\"holes\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"diameter\":1,\"depth\":0,\"tipAngle\":0},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"block\",\"output\":\"result\",\"data\":{}}]},\"frames\":{\"connections\":[{\"node\":\"mouths\",\"output\":\"list\",\"data\":{}}]},\"diameter\":{\"connections\":[{\"node\":\"tapDrill\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,460]},\"tapped\":{\"id\":\"tapped\",\"name\":\"bitbybit.occt.parts.mechanical.machining.iso.thread\",\"customName\":\"thread\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"size\":\"M8\",\"length\":12,\"internal\":true,\"unit\":\"mm\"},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"drilled\",\"output\":\"result\",\"data\":{}}]},\"frame\":{\"connections\":[{\"node\":\"mouth\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1300,40]}},\"modules\":{}}","type":"rete"}}
  title="A tapped M8 hole in Rete"
  description="A block drilled through at the tap drill size the M8 thread table gives, then threaded inside with a modelled ISO thread."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"math_number\" x=\"0\" y=\"0\"><field name=\"NUM\">1</field></block><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.parts.mechanical.machining.iso.thread\"><value name=\"Size\"><block type=\"bitbybit.engineering.enums.isoThreadSizeEnum\"><field name=\"bitbybit.engineering.enums.isoThreadSizeEnum\">'M8'</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">12</field></block></value><value name=\"Internal\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"Unit\"><block type=\"bitbybit.base.enums.unitOfLengthEnum\"><field name=\"bitbybit.base.enums.unitOfLengthEnum\">'mm'</field></block></value><value name=\"Frame\"><block type=\"bitbybit.frame.create\"><value name=\"Origin\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">12</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Normal\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"Shape\"><block type=\"bitbybit.occt.features.holes\"><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">20</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">20</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">12</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Frames\"><block type=\"bitbybit.lists.addItem\"><value name=\"List\"><block type=\"bitbybit.lists.createEmptyList\"></block></value><value name=\"Item\"><block type=\"bitbybit.frame.create\"><value name=\"Origin\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">12</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Normal\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"Diameter\"><block type=\"bitbybit.json.getValueOnProp\"><value name=\"Json\"><block type=\"bitbybit.engineering.mechanical.threads.iso.thread\"><value name=\"Size\"><block type=\"bitbybit.engineering.enums.isoThreadSizeEnum\"><field name=\"bitbybit.engineering.enums.isoThreadSizeEnum\">'M8'</field></block></value><value name=\"Unit\"><block type=\"bitbybit.base.enums.unitOfLengthEnum\"><field name=\"bitbybit.base.enums.unitOfLengthEnum\">'mm'</field></block></value></block></value><value name=\"Property\"><block type=\"text\"><field name=\"TEXT\">tapDrill</field></block></value></block></value><value name=\"Depth\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"TipAngle\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></xml>","type":"blockly"}}
  title="A tapped M8 hole in Blockly"
  description="A block drilled through at the tap drill size the M8 thread table gives, then threaded inside with a modelled ISO thread."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const M8 = Bit.Inputs.Engineering.isoThreadSizeEnum.m8;\nconst top: Bit.Inputs.Base.Frame = { origin: [0, 12, 0], normal: [0, 1, 0], direction: [1, 0, 0] };\nconst { tapDrill } = bitbybit.engineering.mechanical.threads.iso.thread({ size: M8 });\n\nconst block = await bitbybit.occt.shapes.solid.createBox({ width: 20, length: 20, height: 12, center: [0, 6, 0] });\nconst drilled = await bitbybit.occt.features.holes({ shape: block, frames: [top], diameter: tapDrill, depth: 0 });\nconst tapped = await bitbybit.occt.parts.mechanical.machining.iso.thread({ shape: drilled, size: M8, length: 12, internal: true, frame: top });\n\nawait bitbybit.draw.drawAnyAsync({ entity: tapped });","type":"typescript"}}
  title="A tapped M8 hole in TypeScript"
  description="A block drilled through at the tap drill size the M8 thread table gives, then threaded inside with a modelled ISO thread."
/>

</TabItem>
</Tabs>

{/* example:tapped-hole:end */}

An M8 thread has a coarse pitch of 1.25 millimetres and a tap drill of 6.8. The thread's frame sits at the hole's mouth with its normal pointing out of the part, and the thread runs into the part against it.

## Threads

`bitbybit.occt.parts.mechanical.machining.iso.thread` models an ISO metric thread and `bitbybit.occt.parts.mechanical.machining.ansi.thread` a Unified inch thread, instead of the plain face a cosmetic thread leaves. On a shank, turned to the thread's nominal diameter, it cuts the outside thread; with `internal` on, in a hole drilled to the minor diameter, it cuts the thread of a nut. The thread starts at its frame, at a hole's mouth or under a head, and runs `length` into the part, at most 400 turns of the pitch. `iso.thread` takes the size's coarse pitch unless `pitch` names a fine one, and `ansi.thread` takes `series`, coarse (UNC) or fine (UNF). `threadTool`, in both standards, is the 60 degree groove a thread removes, swept along a right-hand helix.

`bitbybit.engineering.mechanical.threads.iso.thread` gives a metric thread's nominal, pitch and minor diameters, its pitch, the minor diameter of the internal thread and the drill for tapping it: M8 has a pitch of 1.25 and a 6.8 tap drill. `bitbybit.engineering.mechanical.threads.ansi.thread` does the same for inch threads, 1/4 UNC having 20 threads per inch and a 0.201 inch tap drill; `threadsPerInch` gives a pitch of its own, a UN thread. The [fasteners](./fasteners) cut the same thread when `modelledThread` is on.

## Keyways

`bitbybit.occt.parts.mechanical.machining.din.keyway` cuts a DIN 6885 keyway and `bitbybit.occt.parts.mechanical.machining.ansi.keyway` an ANSI B17.1 keyseat, sized for a shaft or bore of `diameter`. Into a shaft it is the round-ended pocket a key sits in, `length` from end to end; with `inHub` on, it is the straight keyway cut through a hub's bore. It starts on the axis at the frame's origin, runs `length` along the normal and faces the frame's direction. `keywayTool`, in both standards, is the solid it removes. The [keys](./bearings-keys-rings-springs#parallel-keys) that fit them, and the depths they sit at, are on their own page.

## Retaining ring grooves

`bitbybit.occt.parts.mechanical.machining.din.ringGroove` cuts the groove of a DIN 471 ring into a shaft or of a DIN 472 ring into a bore, by `kind`, and `bitbybit.occt.parts.mechanical.machining.ansi.ringGroove` the groove of an inch tapered ring. The groove starts on the axis at the frame's origin and runs its width along the normal, so a [retaining ring](./bearings-keys-rings-springs#retaining-rings) given the same frame sits in it. `ringGrooveTool`, in both standards, is the solid the groove removes.

## Splines

- `bitbybit.occt.parts.mechanical.machining.din.splinedShaft` makes a DIN 5480 involute splined shaft, its teeth at 30 degrees, from the `referenceDiameter` the spline is named by and its `module`, both in millimetres as the standard names them: W 25x1.25x18 is a reference diameter of 25 and a module of 1.25.
- `bitbybit.occt.parts.mechanical.machining.ansi.splinedShaft` makes an ANSI B92.1 splined shaft from its `teeth`, 6 to 60, and its `pitch`, such as 16/32, its teeth at 30 degrees with a flat root.
- `splinedHub`, in both standards, cuts the matching spline through a hub, and `splinedHubTool` is the solid it removes. A shaft starts at its frame's origin and runs along the normal, a tooth pointing along the frame's direction.

`bitbybit.engineering.mechanical.splines.din.involuteSplineSizes` gives a DIN 5480 spline's teeth, profile shift and the shaft's and hub's tip and root diameters: 25 by 1.25 has 18 teeth, the shaft 24.75 across its tips and the hub 22.5 across its own. `bitbybit.engineering.mechanical.splines.ansi.involuteSplineSizes` gives an ANSI B92.1 spline's pitch diameter, module, and the shaft's and hub's major and minor diameters: 24 teeth of 16/32 have a 1.5 inch pitch diameter.

## Knurls

`bitbybit.occt.parts.mechanical.machining.din.knurl` knurls a round shaft to DIN 82, its `pitch` 0.5 to 1.6 millimetres, and `bitbybit.occt.parts.mechanical.machining.ansi.knurl` to ASME B94.6, by `diametralPitch`, 64, 96, 128 or 160 teeth to an inch of diameter. `pattern` is `straight`, `left` or `right` (diagonal) or `diamond`, where the grooves cross; a diagonal or diamond knurl's grooves twist through at most 1000 degrees along its `length`, and a diamond on a long knurl is heavy to build. The crests sit on the diameter nearest the one given that the pitch divides into whole teeth. `knurlTool`, in both standards, is the solid the knurl removes.

`bitbybit.engineering.mechanical.knurls.din.knurlSizes` works out how many grooves fit, the diameter that makes them divide the circumference evenly, their depth and their angle to the axis: 19.6 millimetres at a pitch of 0.8 takes 77 grooves on 19.608, so turn the shaft to 19.608 before knurling. `bitbybit.engineering.mechanical.knurls.ansi.knurlSizes` does the same to B94.6: 1/2 inch at 96 DP takes 48 grooves, 0.016 deep.

## Flats

`bitbybit.occt.parts.mechanical.machining.flat` cuts a flat into a round shaft of `diameter`, such as the D flat a [set screw](./fasteners) bears on: everything beyond a plane `depth` in from the surface, for `length` along the axis. It starts on the axis at the frame's origin, runs along the normal and faces the frame's direction. `bitbybit.occt.parts.mechanical.machining.flatTool` is the solid the flat removes.

{/* api:occt.parts.mechanical.machining:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`ansi.keyway`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningAnsi#keyway) | Cuts an ANSI B17.1 keyseat into a shaft or through a hub, as `keywayTool` places it. |
| [`ansi.keywayTool`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningAnsi#keywayTool) | Makes the solid an ANSI B17.1 keyseat removes: the round-ended pocket milled into a shaft, or the straight keyseat cut through a hub's bore, sized for the diameter. |
| [`ansi.knurl`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningAnsi#knurl) | Knurls a round shaft, as `knurlTool` places the knurl. |
| [`ansi.knurlTool`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningAnsi#knurlTool) | Makes the solid an ASME B94.6 knurl removes from a round shaft: diametral pitch teeth at the standard's depth, straight, diagonal at 30 degrees or crossing in a raised diamond. |
| [`ansi.ringGroove`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningAnsi#ringGroove) | Cuts the groove of an inch tapered retaining ring into a shaft or a bore, as `ringGrooveTool` places it; `parts.mechanical.retainingRings.ansi.retainingRing` at the same frame sits in it. |
| [`ansi.ringGrooveTool`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningAnsi#ringGrooveTool) | Makes the solid the groove of an inch tapered retaining ring removes from a shaft or a bore: as wide as the groove, down to its diameter. |
| [`ansi.splinedHub`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningAnsi#splinedHub) | Cuts an ANSI B92.1 spline through a hub, as `splinedHubTool` places it. |
| [`ansi.splinedHubTool`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningAnsi#splinedHubTool) | Makes the solid an ANSI B92.1 hub spline removes: the shaft's flanks, with the hub's tip and root diameters, so the shaft of the same size slides into the cut. |
| [`ansi.splinedShaft`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningAnsi#splinedShaft) | Makes an ANSI B92.1 involute splined shaft: its teeth at 30 degrees with a flat root, sized from the number of teeth and the pitch, `length` long. |
| [`ansi.thread`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningAnsi#thread) | Models a Unified inch thread on a shank or in a hole, as `threadTool` places it, instead of the cosmetic thread `parts.mechanical.fasteners.ansi` draws. |
| [`ansi.threadTool`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningAnsi#threadTool) | Makes the solid a Unified inch thread removes: the 60 degree groove swept along a right-hand helix. |
| [`din.keyway`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningDin#keyway) | Cuts a DIN 6885 keyway into a shaft or through a hub, as `keywayTool` places it. |
| [`din.keywayTool`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningDin#keywayTool) | Makes the solid a DIN 6885 keyway removes: the round-ended pocket milled into a shaft, or the straight keyway cut through a hub's bore, sized for the diameter. |
| [`din.knurl`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningDin#knurl) | Knurls a round shaft, as `knurlTool` places the knurl. |
| [`din.knurlTool`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningDin#knurlTool) | Makes the solid a DIN 82 knurl removes from a round shaft: 90 degree grooves half the pitch deep, straight, helical at 30 degrees or crossing in a raised diamond. |
| [`din.ringGroove`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningDin#ringGroove) | Cuts the groove of a DIN 471 or DIN 472 retaining ring into a shaft or a bore, as `ringGrooveTool` places it; `parts.mechanical.retainingRings.din.retainingRing` at the same frame sits in it. |
| [`din.ringGrooveTool`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningDin#ringGrooveTool) | Makes the solid the groove of a DIN 471 or DIN 472 retaining ring removes from a shaft or a bore: as wide as the groove, down to its diameter. |
| [`din.splinedHub`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningDin#splinedHub) | Cuts a DIN 5480 spline through a hub, as `splinedHubTool` places it. |
| [`din.splinedHubTool`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningDin#splinedHubTool) | Makes the solid a DIN 5480 hub spline removes: the shaft's flanks, with the hub's tip and root diameters, so the shaft of the same size slides into the cut. |
| [`din.splinedShaft`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningDin#splinedShaft) | Makes a DIN 5480 involute splined shaft: its teeth at 30 degrees, sized from the reference diameter and the module, `length` long. |
| [`flat`](https://docs.bitbybit.dev/classes/Bit.OCCTMachining#flat) | Cuts a flat into a round shaft, as `flatTool` places it, such as the D flat a set screw bears on. |
| [`flatTool`](https://docs.bitbybit.dev/classes/Bit.OCCTMachining#flatTool) | Makes the solid a flat on a round shaft removes: everything beyond a plane `depth` in from the surface, along `length`. |
| [`iso.thread`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningIso#thread) | Models an ISO metric thread on a shank or in a hole, as `threadTool` places it, instead of the cosmetic thread `parts.mechanical.fasteners.iso` draws. |
| [`iso.threadTool`](https://docs.bitbybit.dev/classes/Bit.OCCTMachiningIso#threadTool) | Makes the solid an ISO metric thread removes: the 60 degree groove swept along a right-hand helix. |

{/* api:occt.parts.mechanical.machining:end */}

{/* api:engineering.mechanical.threads:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`ansi.sizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringThreadsAnsi#sizes) | Lists the Unified inch thread sizes the tables hold, from #0 to 1 inch. |
| [`ansi.thread`](https://docs.bitbybit.dev/classes/Bit.EngineeringThreadsAnsi#thread) | Gives a Unified inch thread by its size and series: the nominal, pitch and minor diameters, the pitch, the internal thread's minor diameter and the drill for tapping it. |
| [`iso.sizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringThreadsIso#sizes) | Lists the ISO metric thread sizes the tables hold, from M1.6 to M24. |
| [`iso.thread`](https://docs.bitbybit.dev/classes/Bit.EngineeringThreadsIso#thread) | Gives an ISO metric thread by its size: the nominal, pitch and minor diameters, the pitch, the internal thread's minor diameter and the drill for tapping it. |

{/* api:engineering.mechanical.threads:end */}

{/* api:engineering.mechanical.splines:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`ansi.involuteSplineSizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringSplinesAnsi#involuteSplineSizes) | Works out an ANSI B92.1 involute spline from its teeth and pitch: its pitch diameter and module, and the major and minor diameters of the shaft and the hub. |
| [`din.involuteSplineSizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringSplinesDin#involuteSplineSizes) | Works out a DIN 5480 involute spline from its reference diameter and module: its teeth, profile shift, and the shaft's and the hub's tip and root diameters. |

{/* api:engineering.mechanical.splines:end */}

{/* api:engineering.mechanical.knurls:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`ansi.knurlSizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringKnurlsAnsi#knurlSizes) | Works out a diametral pitch knurl's grooves on a cylinder: how many, the diameter they track on, how deep B94.6 presses them and their angle to the axis. |
| [`din.knurlSizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringKnurlsDin#knurlSizes) | Works out a knurl's grooves on a cylinder: how many fit at the pitch, the diameter that makes them divide it evenly, their depth and their angle to the axis. |

{/* api:engineering.mechanical.knurls:end */}
