---
sidebar_position: 9
title: Pipes and Sweeps
sidebar_label: Pipes and Sweeps
description: Sweeping a profile along a path with OCCT - round tubes and polygon bars along any wire, your own profiles with pipe, profiles that grow or shrink on the way, and mouldings that follow a flat outline - with an example in Rete, Blockly and TypeScript.
topic: code.occt.operations.pipes-and-sweeps
type: how-to
tags: [code, occt]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Pipes and sweeps

A sweep moves a profile, a flat outline, along a path and keeps the surface it traces: a circle along a curve becomes a tube, a square along a polyline becomes a bar, the cross-section of a moulding along the outline of a room becomes the moulding. The path is a wire; the result is a solid when the profile is closed.

Here a circle swept along a helix makes a coil spring, and the same circle swept along a star whose corners are rounded first makes a smooth frame:

{/* example:spring-and-frame:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"helix\":{\"id\":\"helix\",\"name\":\"bitbybit.occt.shapes.wire.createHelixWire\",\"customName\":\"create helix wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":1.5,\"pitch\":0.8,\"height\":5,\"center\":[0,0,0],\"direction\":[0,1,0],\"clockwise\":false,\"tolerance\":0.0001},\"inputs\":{},\"position\":[40,40]},\"spring\":{\"id\":\"spring\",\"name\":\"bitbybit.occt.operations.pipeWireCylindrical\",\"customName\":\"pipe wire cylindrical\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":0.15,\"makeSolid\":true,\"trihedronEnum\":\"isConstantNormal\",\"forceApproxC1\":false,\"bendRadius\":0},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"helix\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"star\":{\"id\":\"star\",\"name\":\"bitbybit.occt.shapes.wire.createStarWire\",\"customName\":\"star wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"center\":[6,0,0],\"direction\":[0,1,0],\"numRays\":5,\"outerRadius\":2.5,\"innerRadius\":1.2,\"offsetOuterEdges\":0,\"half\":false},\"inputs\":{},\"position\":[40,560]},\"rounded\":{\"id\":\"rounded\",\"name\":\"bitbybit.occt.fillets.fillet2d\",\"customName\":\"fillet 2d\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":0.4},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"star\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,560]},\"frame\":{\"id\":\"frame\",\"name\":\"bitbybit.occt.operations.pipeWireCylindrical\",\"customName\":\"pipe wire cylindrical\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":0.2,\"makeSolid\":true,\"trihedronEnum\":\"isConstantNormal\",\"forceApproxC1\":false,\"bendRadius\":0},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"rounded\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,560]}},\"modules\":{}}","type":"rete"}}
  title="A spring and a star frame swept along wires in Rete"
  description="A circle swept along a helix makes a coil spring; the same circle swept along a star whose corners are rounded first makes a smooth frame."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.operations.pipeWireCylindrical\"><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.wire.createHelixWire\"><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">1.5</field></block></value><value name=\"Pitch\"><block type=\"math_number\"><field name=\"NUM\">0.8</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">5</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Clockwise\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"Tolerance\"><block type=\"math_number\"><field name=\"NUM\">0.0001</field></block></value></block></value><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">0.15</field></block></value><value name=\"MakeSolid\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"TrihedronEnum\"><block type=\"bitbybit.occt.enums.geomFillTrihedronEnum\"><field name=\"bitbybit.occt.enums.geomFillTrihedronEnum\">'isConstantNormal'</field></block></value><value name=\"ForceApproxC1\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"BendRadius\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.operations.pipeWireCylindrical\"><value name=\"Shape\"><block type=\"bitbybit.occt.fillets.fillet2d\"><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.wire.createStarWire\"><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"NumRays\"><block type=\"math_number\"><field name=\"NUM\">5</field></block></value><value name=\"OuterRadius\"><block type=\"math_number\"><field name=\"NUM\">2.5</field></block></value><value name=\"InnerRadius\"><block type=\"math_number\"><field name=\"NUM\">1.2</field></block></value><value name=\"OffsetOuterEdges\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Half\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">0.4</field></block></value></block></value><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">0.2</field></block></value><value name=\"MakeSolid\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"TrihedronEnum\"><block type=\"bitbybit.occt.enums.geomFillTrihedronEnum\"><field name=\"bitbybit.occt.enums.geomFillTrihedronEnum\">'isConstantNormal'</field></block></value><value name=\"ForceApproxC1\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"BendRadius\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></next></block></xml>","type":"blockly"}}
  title="A spring and a star frame swept along wires in Blockly"
  description="A circle swept along a helix makes a coil spring; the same circle swept along a star whose corners are rounded first makes a smooth frame."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const helix = await bitbybit.occt.shapes.wire.createHelixWire({ radius: 1.5, pitch: 0.8, height: 5, center: [0, 0, 0], direction: [0, 1, 0] });\nconst spring = await bitbybit.occt.operations.pipeWireCylindrical({ shape: helix, radius: 0.15 });\n\nconst star = await bitbybit.occt.shapes.wire.createStarWire({ center: [6, 0, 0], direction: [0, 1, 0], numRays: 5, outerRadius: 2.5, innerRadius: 1.2, offsetOuterEdges: 0, half: false });\nconst rounded = await bitbybit.occt.fillets.fillet2d({ shape: star, radius: 0.4 });\nconst frame = await bitbybit.occt.operations.pipeWireCylindrical({ shape: rounded, radius: 0.2 });\n\nawait bitbybit.draw.drawAnyAsync({ entity: spring });\nawait bitbybit.draw.drawAnyAsync({ entity: frame });","type":"typescript"}}
  title="A spring and a star frame swept along wires in TypeScript"
  description="A circle swept along a helix makes a coil spring; the same circle swept along a star whose corners are rounded first makes a smooth frame."
/>

</TabItem>
</Tabs>

{/* example:spring-and-frame:end */}

## Tubes and bars, the profile made for you

- `bitbybit.occt.operations.pipeWireCylindrical` sweeps a circle of `radius` along a wire: a round tube, a cable, a handrail, a spring. `pipeWiresCylindrical` does the same for several wires at once. Give it `bendRadius` and every corner of the path is bent round that radius first, as a pipe bender would bend it, so a polyline becomes a tube of straight runs and bends. Along lines and arcs that join smoothly the tube is exact, cylinders and tori, which fuses cleanly with fittings of the same radius.
- `bitbybit.occt.operations.pipePolylineWireNGon` sweeps a regular polygon with `nrCorners` corners: a square bar with 4, a hexagonal one with 6.

Both take `makeSolid` (true for a solid, false for an open shell) and `trihedronEnum`, which decides how the profile turns as it travels. The default, `isConstantNormal`, keeps it steady; the Frenet modes turn it with the curve's bending, which can twist a profile along a path that bends one way and then the other.

## Your own profile

`bitbybit.occt.operations.pipe` takes the path as `shape` and one or more profiles as `shapes`. A profile is swept from where it stands and is not moved, so draw it across the start of the path, at a right angle to it. Several profiles, each placed where it belongs along the path, make the sweep blend from one shape into the next; the result is closed into a solid. `pipeWithHistory` does the same and reports which face each profile edge became, for selecting the caps or the sides afterwards.

## Profiles that change on the way

`bitbybit.occt.operations.pipeWithScaling` sweeps one `profile` along a `spine` and scales it as it goes: `params` are places along the spine from 0 at its start to 1 at its end, and `scales` the size of the profile at each, 1 being its own size. A tube that narrows toward one end takes `params: [0, 1]` and `scales: [1, 0.5]`.

## Mouldings along a flat outline

`bitbybit.occt.operations.sweepEvolved` sweeps a `profile` along a flat `spine` and keeps it beside the spine rather than across it, the way a skirting board follows the walls of a room. The profile is drawn about the origin, with x along the spine, y to the left of travel and z up from the spine's plane; a closed spine gives a closed ring.

## When a sweep fails

- **The profile is wider than the path's tightest bend.** A tube whose radius is larger than the radius of a curve folds over itself there. Use a smaller profile or a gentler path.
- **The profile is not at the start of the path.** `pipe` sweeps the profile from where it is, so a profile drawn at the origin sweeps a shape somewhere else entirely.
- **The path has a sharp corner.** A profile swept round a sharp corner of a polyline comes out kinked or broken at the corner. For a round tube, give `pipeWireCylindrical` a `bendRadius`; for other profiles, round the corners first with `bitbybit.occt.fillets.fillet2d` (flat paths) or `fillet3DWire`, as the example does with the star, and `forceApproxC1` smooths a tube that still came out with kinks. A bend radius the edges at a corner are too short for is refused with the corners it does not fit, and every bend must be wider than the tube, or the tube would fold through itself.

Extrusions and lofts, the other ways to make a solid from outlines, are on [Extrusions](./extrusions) and [Simple loft](./simple-loft).
