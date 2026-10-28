---
sidebar_position: 3
title: "Gears: Spur, Helical, Bevel, Ring and Rack"
sidebar_label: Gears
description: Involute spur, helical, bevel and ring gears and racks as solids, and the tables that say how gears mesh - centre distance, contact ratio and interference for a pair, a gear inside a ring and a planetary set - with two spur gears meshed from them.
topic: code.occt.parts.gears
type: explanation
tags: [code, occt]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gears

`bitbybit.occt.parts.mechanical.gears` builds involute gears and racks as solids, and `bitbybit.engineering.mechanical.gears` works out how they mesh and draws their outlines as points. [Standard parts](./intro) explains the frames and roles they share.

Two numbers decide whether gears mesh. The **module** is the size of the teeth, the pitch circle's diameter divided by the number of teeth, and the **pressure angle**, 20 degrees by default, is the angle at which meshing teeth push on each other. Gears mesh only with gears of the same module and pressure angle.

## Two spur gears that mesh

{/* example:meshing-gears:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"pinion\":{\"id\":\"pinion\",\"name\":\"bitbybit.occt.parts.mechanical.gears.spurGear\",\"customName\":\"spur gear\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":10,\"bore\":10,\"hub\":0,\"hubLength\":0,\"keyway\":false,\"unit\":\"mm\",\"keyStandard\":\"din\",\"module\":2,\"teeth\":20,\"pressureAngle\":20,\"profileShift\":0,\"backlash\":0,\"addendum\":1,\"dedendum\":1.25,\"rootFillet\":0.38,\"rotation\":0},\"inputs\":{},\"position\":[40,40]},\"pair\":{\"id\":\"pair\",\"name\":\"bitbybit.engineering.mechanical.gears.gearPair\",\"customName\":\"gear pair\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"module\":2,\"teethA\":20,\"teethB\":30,\"pressureAngle\":20,\"profileShiftA\":0,\"profileShiftB\":0,\"addendum\":1,\"dedendum\":1.25},\"inputs\":{},\"position\":[40,760]},\"distance\":{\"id\":\"distance\",\"name\":\"bitbybit.json.getValueOnProp\",\"customName\":\"get value on prop\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"property\":\"centreDistance\"},\"inputs\":{\"json\":{\"connections\":[{\"node\":\"pair\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,760]},\"wheelCentre\":{\"id\":\"wheelCentre\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":0,\"y\":0,\"z\":0},\"inputs\":{\"x\":{\"connections\":[{\"node\":\"distance\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,760]},\"wheelFrame\":{\"id\":\"wheelFrame\",\"name\":\"bitbybit.frame.create\",\"customName\":\"frame\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"origin\":[0,0,0],\"normal\":[0,1,0],\"direction\":[1,0,0]},\"inputs\":{\"origin\":{\"connections\":[{\"node\":\"wheelCentre\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1300,760]},\"wheel\":{\"id\":\"wheel\",\"name\":\"bitbybit.occt.parts.mechanical.gears.spurGear\",\"customName\":\"spur gear\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":10,\"bore\":16,\"hub\":0,\"hubLength\":0,\"keyway\":false,\"unit\":\"mm\",\"keyStandard\":\"din\",\"module\":2,\"teeth\":30,\"pressureAngle\":20,\"profileShift\":0,\"backlash\":0,\"addendum\":1,\"dedendum\":1.25,\"rootFillet\":0.38,\"rotation\":6},\"inputs\":{\"frame\":{\"connections\":[{\"node\":\"wheelFrame\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1720,40]}},\"modules\":{}}","type":"rete"}}
  title="Two spur gears that mesh in Rete"
  description="A 20 tooth pinion and a 30 tooth wheel of module 2, placed the centre distance gearPair gives apart, the wheel turned half a tooth so a gap meets the pinion's tooth."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.point.pointXYZ\" x=\"0\" y=\"0\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block><block type=\"math_number\" x=\"0\" y=\"0\"><field name=\"NUM\">0</field></block><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.parts.mechanical.gears.spurGear\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">10</field></block></value><value name=\"Bore\"><block type=\"math_number\"><field name=\"NUM\">10</field></block></value><value name=\"Hub\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"HubLength\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Keyway\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"Unit\"><block type=\"bitbybit.base.enums.unitOfLengthEnum\"><field name=\"bitbybit.base.enums.unitOfLengthEnum\">'mm'</field></block></value><value name=\"KeyStandard\"><block type=\"bitbybit.engineering.enums.keyStandardEnum\"><field name=\"bitbybit.engineering.enums.keyStandardEnum\">'din'</field></block></value><value name=\"Module\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Teeth\"><block type=\"math_number\"><field name=\"NUM\">20</field></block></value><value name=\"PressureAngle\"><block type=\"math_number\"><field name=\"NUM\">20</field></block></value><value name=\"ProfileShift\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Backlash\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Addendum\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Dedendum\"><block type=\"math_number\"><field name=\"NUM\">1.25</field></block></value><value name=\"RootFillet\"><block type=\"math_number\"><field name=\"NUM\">0.38</field></block></value><value name=\"Rotation\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.parts.mechanical.gears.spurGear\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">10</field></block></value><value name=\"Bore\"><block type=\"math_number\"><field name=\"NUM\">16</field></block></value><value name=\"Hub\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"HubLength\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Keyway\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"Unit\"><block type=\"bitbybit.base.enums.unitOfLengthEnum\"><field name=\"bitbybit.base.enums.unitOfLengthEnum\">'mm'</field></block></value><value name=\"KeyStandard\"><block type=\"bitbybit.engineering.enums.keyStandardEnum\"><field name=\"bitbybit.engineering.enums.keyStandardEnum\">'din'</field></block></value><value name=\"Module\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Teeth\"><block type=\"math_number\"><field name=\"NUM\">30</field></block></value><value name=\"PressureAngle\"><block type=\"math_number\"><field name=\"NUM\">20</field></block></value><value name=\"ProfileShift\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Backlash\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Addendum\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Dedendum\"><block type=\"math_number\"><field name=\"NUM\">1.25</field></block></value><value name=\"RootFillet\"><block type=\"math_number\"><field name=\"NUM\">0.38</field></block></value><value name=\"Rotation\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"Frame\"><block type=\"bitbybit.frame.create\"><value name=\"Origin\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"bitbybit.json.getValueOnProp\"><value name=\"Json\"><block type=\"bitbybit.engineering.mechanical.gears.gearPair\"><value name=\"Module\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"TeethA\"><block type=\"math_number\"><field name=\"NUM\">20</field></block></value><value name=\"TeethB\"><block type=\"math_number\"><field name=\"NUM\">30</field></block></value><value name=\"PressureAngle\"><block type=\"math_number\"><field name=\"NUM\">20</field></block></value><value name=\"ProfileShiftA\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"ProfileShiftB\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Addendum\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Dedendum\"><block type=\"math_number\"><field name=\"NUM\">1.25</field></block></value></block></value><value name=\"Property\"><block type=\"text\"><field name=\"TEXT\">centreDistance</field></block></value></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Normal\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></value></block></next></block></xml>","type":"blockly"}}
  title="Two spur gears that mesh in Blockly"
  description="A 20 tooth pinion and a 30 tooth wheel of module 2, placed the centre distance gearPair gives apart, the wheel turned half a tooth so a gap meets the pinion's tooth."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const pair = bitbybit.engineering.mechanical.gears.gearPair({ module: 2, teethA: 20, teethB: 30 });\nconst pinion = await bitbybit.occt.parts.mechanical.gears.spurGear({ module: 2, teeth: 20, width: 10, bore: 10 });\nconst wheel = await bitbybit.occt.parts.mechanical.gears.spurGear({\n    module: 2, teeth: 30, width: 10, bore: 16, rotation: 180 / 30,\n    frame: { origin: [pair.centreDistance, 0, 0], normal: [0, 1, 0], direction: [1, 0, 0] },\n});\nawait bitbybit.draw.drawAnyAsync({ entity: [pinion, wheel] });","type":"typescript"}}
  title="Two spur gears that mesh in TypeScript"
  description="A 20 tooth pinion and a 30 tooth wheel of module 2, placed the centre distance gearPair gives apart, the wheel turned half a tooth so a gap meets the pinion's tooth."
/>

</TabItem>
</Tabs>

{/* example:meshing-gears:end */}

- `gearPair` gives the centre distance, 50 for module 2 with 20 and 30 teeth, so the wheel's frame stands that far along X. It also gives the ratio, 1.5, and the contact ratio, 1.61: on average 1.61 pairs of teeth are in contact, and anything over 1 keeps the drive smooth.
- At rotation 0 a gear has a tooth along its frame's direction. The pinion's tooth then points straight at the wheel, and so does one of the wheel's, so the wheel turns half a tooth, 180 degrees over its 30 teeth, to put a gap there. Left at 0 the two would overlap.

## The gears

- `spurGear` makes a spur gear: its outline swept `width` along the frame's normal, the first face in the frame's plane. A `bore` puts a hole through it, which must stay inside the root circle; a `hub` of a diameter between the bore and the root circle stands `hubLength` out from its end face; and `keyway` cuts a keyway along the bore, sized by `keyStandard` (DIN 6885 or ANSI B17.1) for a shaft of the bore's diameter in `unit`, toward the tooth at rotation 0.
- `helicalGear` makes the same gear with its teeth leaning `helixAngle` degrees from the axis, positive for a right hand and negative for a left. Two external helical gears of one module and helix angle in opposite hands mesh, the sum of their pitch radii apart. `herringbone` makes two halves of opposite hands that meet halfway across the width, cancelling the push along the axis that one helix makes.
- `bevelGear` makes a straight bevel gear, its teeth running straight to the apex (Tredgold's approximation), for turning a drive through `shaftAngle`, 90 degrees by default. It is sized for a mate of `mateTeeth`, and its teeth run `faceWidth` along the cone from the back. The mate is a bevel gear of `mateTeeth` sharing the frame's origin, the two normals at `shaftAngle`, turned half a tooth.
- `ringGear` makes a ring with its teeth pointing in, for a gear running inside it: a spur gear of the same module meshes inside with its centre half the module times the difference of their teeth from the ring's centre.
- `rack` makes a straight rack, its outline swept `width` along the frame's normal. A spur gear of the same module meshes with it, its centre its pitch radius from the pitch line, and turning the gear by an angle moves the rack its pitch radius times that angle in radians.

Every tooth form takes `backlash` (each tooth thinned by that much, leaving play between meshing teeth), `addendum` and `dedendum` (how far teeth reach above and gaps below the pitch circle, as shares of the module) and `rootFillet`, the radius at the bottom of each gap. The spur and helical gears also take `profileShift`, which moves the teeth out from the pitch circle as a share of the module, for the thicker teeth small gears need. A ring gear's `rim` is how thick the ring is outside the bottoms of its gaps, and a rack's `height` how far its back lies below the pitch line, beyond the gaps.

`spurGearProfile`, `ringGearProfile` and `rackProfile` draw the tooth outline in the frame's plane instead, as a face or, with `makeFace` off, a wire, to extrude, cut or sweep yourself; they are in `bitbybit.occt.parts.mechanical.gears` too.

## Roles

- `spurGearWithRoles` and `helicalGearWithRoles` name a gear's `tip`, `flank`, `root`, `bore`, `hub`, `keyway`, `start` (the face in the frame's plane) and `end`; their `axis` frame sits at the start face's centre, toward the first tooth.
- `bevelGearWithRoles` names `tip`, `flank`, `root`, `back` (the back cone and the flat back face), `front` and `bore`; its `apex` frame is your frame turned to the first tooth, and `back` sits at the back face's centre.
- `ringGearWithRoles` names `tip`, `flank`, `root`, `rim` (the outer face), `start` and `end`, with an `axis` frame.
- `rackWithRoles` names `tip`, `flank`, `root`, `back`, `side` (its two ends), `start` and `end`; its `pitch` frame sits on the first tooth's middle, on the pitch line, along the rack.

## How gears mesh

`bitbybit.engineering.mechanical.gears` answers the questions a gear train raises before anything is built:

- `gearPair` works out two external spur gears in mesh: their `centreDistance`, the working pressure angle, the `contactRatio` and `ratio`, profile shifts included. `interferes` flags a tip reaching below where the other gear's flank is an involute, and `tipShortening` and `clearance` show how shifts crowd tips into roots. Shifts that pull a tip inside its base circle, or work the pair past 45 degrees, are refused.
- `internalGearPair` does the same for a spur gear inside a ring: module 2, 20 teeth in 60, stand 40 apart at a ratio of 3. A gear of fewer than about 20 teeth interferes with a standard ring of any size.
- `planetarySet` lays out a sun, its planets and the ring around them: the ring's teeth, where each planet sits, how far each planet and the ring turn to mesh, the ratio with the ring held, and whether the planets mesh, keep clear of each other and interfere. They mesh when the sun's and the ring's teeth together divide by the number of planets.
- `moduleFromDiametralPitch` turns an inch gear's diametral pitch, its teeth per inch of pitch diameter, into the module the gear functions take: 10 DP is 0.1 inches, or 2.54 millimetres.

The sizes give a gear's circles: `spurGearSizes` the pitch, base, tip and root circles (module 1 with 20 teeth has a pitch radius of 10, a tip radius of 11 and a root radius of 8.75), `ringGearSizes` the same for a ring, whose tips lie inside, `helicalGearSizes` the section's circles and how many degrees the teeth turn per unit along the axis, `bevelGearSizes` the pitch, tip and root cones and the apex distance (20 teeth meshing 40 at 90 degrees have a pitch cone of 26.57 degrees), and `rackSizes` a rack's pitch and length.

The outlines draw the tooth forms as points on the XY plane, a closed loop running counterclockwise that does not repeat its start, for a mesh, another kernel or a drawing: `spurGearOutline`, `helicalGearOutline` (extrude it with the twist `helicalGearSizes` gives), `bevelGearOutline` (the back, as seen from the apex), `ringGearOutline` (the edge of the hole, to cut from a larger circle) and `rackOutline`.

{/* api:occt.parts.mechanical.gears:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`bevelGear`](https://docs.bitbybit.dev/classes/Bit.OCCTGears#bevelGear) | Makes a straight bevel gear as a solid by Tredgold's approximation: teeth that run straight to the apex, between a back cone and a front cone `faceWidth` nearer the apex, on a body with flat ends. |
| [`bevelGearWithRoles`](https://docs.bitbybit.dev/classes/Bit.OCCTGears#bevelGearWithRoles) | Makes a bevel gear as `bevelGear` does and names the role each face plays. |
| [`helicalGear`](https://docs.bitbybit.dev/classes/Bit.OCCTGears#helicalGear) | Makes an involute helical gear as a solid: its section square to the axis turned steadily along `width`, with a `bore`, a hub and a keyway as `spurGear` has them. |
| [`helicalGearWithRoles`](https://docs.bitbybit.dev/classes/Bit.OCCTGears#helicalGearWithRoles) | Makes a helical gear as `helicalGear` does and names the role each face plays. |
| [`rack`](https://docs.bitbybit.dev/classes/Bit.OCCTGears#rack) | Makes an involute rack as a solid: its outline swept `width` along the frame's normal. |
| [`rackProfile`](https://docs.bitbybit.dev/classes/Bit.OCCTGears#rackProfile) | Draws an involute rack in the frame's plane: its pitch line along the frame's direction, its straight-flanked teeth pointing across it, the first tooth's middle on the origin. |
| [`rackWithRoles`](https://docs.bitbybit.dev/classes/Bit.OCCTGears#rackWithRoles) | Makes a rack as `rack` does and names the role each face plays. |
| [`ringGear`](https://docs.bitbybit.dev/classes/Bit.OCCTGears#ringGear) | Makes an involute ring gear as a solid: the ring between its outer circle and its teeth, swept `width` along the frame's normal. |
| [`ringGearProfile`](https://docs.bitbybit.dev/classes/Bit.OCCTGears#ringGearProfile) | Draws an involute ring gear in the frame's plane, its teeth pointing in toward the frame's origin. |
| [`ringGearWithRoles`](https://docs.bitbybit.dev/classes/Bit.OCCTGears#ringGearWithRoles) | Makes a ring gear as `ringGear` does and names the role each face plays. |
| [`spurGear`](https://docs.bitbybit.dev/classes/Bit.OCCTGears#spurGear) | Makes an involute spur gear as a solid: its outline swept `width` along the frame's normal, with a `bore`, a hub standing out from its end face and a keyway. |
| [`spurGearProfile`](https://docs.bitbybit.dev/classes/Bit.OCCTGears#spurGearProfile) | Draws the outline of an involute spur gear around a frame's origin, in the frame's plane. |
| [`spurGearWithRoles`](https://docs.bitbybit.dev/classes/Bit.OCCTGears#spurGearWithRoles) | Makes a spur gear as `spurGear` does and names the role each face plays. |

{/* api:occt.parts.mechanical.gears:end */}

{/* api:engineering.mechanical.gears:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`bevelGearOutline`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#bevelGearOutline) | Draws a straight bevel gear's teeth as points on the XY plane around the origin, as seen from the apex on the plane of the outer pitch circle, by Tredgold's approximation. |
| [`bevelGearSizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#bevelGearSizes) | Works out the cones and outer circles of a straight bevel gear meshing a mate at a shaft angle: its pitch, tip and root cones, back radii and apex distance. |
| [`gearPair`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#gearPair) | Works out how two external spur gears mesh: centre distance, working pressure angle, contact ratio and ratio, profile shifts included. |
| [`helicalGearOutline`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#helicalGearOutline) | Draws a helical gear's section square to its axis as points on the XY plane around the origin, a closed loop counterclockwise that does not repeat its start. |
| [`helicalGearSizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#helicalGearSizes) | Works out the circles of an involute helical gear's section square to its axis, with that section's module and pressure angle, and how many degrees the teeth turn per model unit along the axis. |
| [`internalGearPair`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#internalGearPair) | Works out a spur gear meshing inside a ring gear: centre distance, contact ratio, ratio and interference. |
| [`moduleFromDiametralPitch`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#moduleFromDiametralPitch) | Gives the module of an inch gear from its diametral pitch, in the model's unit, so the gear methods can size it. |
| [`planetarySet`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#planetarySet) | Lays out a planetary gear set around a sun at rotation 0: the ring's teeth, where the planets sit, how far each planet and the ring turn to mesh, the ratio with the ring held, and whether the planets mesh, keep clear of each other and interfere. |
| [`rackOutline`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#rackOutline) | Draws an involute rack's outline as points on the XY plane, a closed counterclockwise loop not repeating its start: pitch line on the x axis, teeth along +y, the first tooth's middle on the origin. |
| [`rackSizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#rackSizes) | Works out the lines of an involute rack: its pitch, its length, how far its tips stand above the pitch line, how deep its gaps reach below it and how thick each tooth is on it. |
| [`ringGearOutline`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#ringGearOutline) | Draws the teeth of an involute ring gear as points on the XY plane around the origin: the edge of the hole inside the ring, a closed loop counterclockwise that does not repeat its start. |
| [`ringGearSizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#ringGearSizes) | Works out the circles of an involute ring gear, whose teeth point in toward its centre: the pitch and base circles, the tip circle inside them, the root circle beyond, and half the angle a tooth spans at the pitch circle. |
| [`spurGearOutline`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#spurGearOutline) | Draws the outline of an involute spur gear as points on the XY plane, a closed counterclockwise loop that does not repeat its start, ready to extrude in any kernel. |
| [`spurGearSizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringGears#spurGearSizes) | Works out the circles of an involute spur gear: the pitch circle meshing gears roll on, the base circle its flanks unwind from, the tip and root circles, and half the angle a tooth spans at the pitch circle. |

{/* api:engineering.mechanical.gears:end */}
