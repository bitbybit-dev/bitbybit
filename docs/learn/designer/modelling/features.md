---
sidebar_position: 2
title: "Features and their dialogs"
sidebar_label: Features and dialogs
description: Every feature the Designer adds to a part - solids, extrudes, revolves, sweeps and lofts, fillets, chamfers, shells, holes, bosses and pockets, keyways, threads and other machining, booleans and patterns - and how their dialogs take values, picks and expressions.
topic: designer.modelling.features
type: how-to
verified: 2026-10-19
tags: [designer]
---

# Features and their dialogs

A part is a list of features, built in order. You add one from <Ui>Insert</Ui> or the toolbar, fill in its dialog, and <Ui>OK</Ui> adds it after the features already there.

<Shot id="designer.modelling.features/insert" />

## How a dialog works

<Shot id="designer.modelling.features/extrude" />

A feature's dialog opens in <Ui>Properties</Ui>, with a line on what the feature does and its fields under it. The picture shows the desk arm link's extrude.

- **Numbers take expressions.** Type a number, or an expression of the part's parameters such as `width` or `length / 2 - 8`. The field keeps the expression, so the feature follows the parameter.
- **Picks come from the view.** A field that needs faces or edges, such as a fillet's <Ui>Edges</Ui>, asks you to click them in the view, then says how many are picked; <Ui>Clear</Ui> starts again. You can also pick first: the <Ui>Selection</Ui> panel then offers the commands that take what you picked, and their dialogs start with it.
- **What it still needs** is written in the dialog in orange, and <Ui>OK</Ui> waits until nothing is missing.
- **The view previews** the feature as you change it, and shows handles you can drag where a value is a distance or a position.
- <Ui>More options</Ui> holds the fields most features leave as they are.
- <Ui>OK</Ui> (<kbd>Enter</kbd>) adds the feature; <Ui>Cancel</Ui> drops it.

To change a feature later, right-click it in the <Ui>Features</Ui> panel and choose <Ui>Edit feature</Ui>. The same dialog opens as you left it, and <Ui>OK</Ui> rebuilds everything after it.

## Bodies

The features that make shape start a new body, named after the feature, unless you choose one in <Ui>Body</Ui>. With a body chosen, <Ui>Join</Ui> says what happens to it: the new shape is added to it (<Ui>Add</Ui>), cut from it (<Ui>Cut</Ui>) or intersected with it (<Ui>Intersect</Ui>). The features that change shape, such as a fillet, always work on the body you name.

## Solids

<Ui>Box</Ui>, <Ui>Cylinder</Ui>, <Ui>Prism</Ui>, <Ui>Sphere</Ui> and <Ui>Cone</Ui> make a whole solid from one dialog, standing on a plane or rising from a flat face you picked. Each is a sketch and an extrude or a revolve underneath, so its faces have the same names as if you had drawn it. A part with no features yet offers them in the middle of the view, beside <Ui>Start a sketch on the ground</Ui>.

[<Ui>Gear</Ui>](../reference/commands.md#designer-part-gear) makes an involute spur gear the same way: a <Ui>Module</Ui> for the size of its teeth, how many <Ui>Teeth</Ui>, a <Ui>Thickness</Ui> and a <Ui>Bore</Ui>, the hole through its middle. Two gears of the same module mesh when their centres are half the module times their teeth added together apart, so a 20-tooth and a 30-tooth gear of module 2 sit 50 apart. Its sketch keeps the teeth as one <Ui>Gear</Ui> pen command, where the pressure angle, the backlash and the rest of the tooth's shape can be changed, and its side faces are named by the part of a tooth they belong to: `tip`, `flank` or `root`. A feature that takes edges can name them by those parts, such as a chamfer on the edges round every tip and nothing else.

[<Ui>Ring gear</Ui>](../reference/commands.md#designer-part-ring-gear) makes a gear with its teeth on the inside, as in a planetary set: its <Ui>Module</Ui>, its <Ui>Teeth</Ui>, a <Ui>Thickness</Ui> and the <Ui>Rim</Ui> outside the teeth. A gear of the same module turns inside it with its centre half the module times the difference of their teeth from the ring's, so a 20-tooth gear sits 40 from the centre of a 60-tooth ring. A ring needs at least 34 teeth, so their tips stay outside the circle the involute starts from.

## Features that make shape

| Feature | What it does |
|---|---|
| [<Ui>Extrude</Ui>](../reference/commands.md#designer-part-extrude) | sweeps a sketch's face straight out by a <Ui>Distance</Ui>; <kbd>E</kbd> |
| [<Ui>Revolve</Ui>](../reference/commands.md#designer-part-revolve) | turns a sketch's face about an axis, a whole turn or by an <Ui>Angle</Ui> |
| [<Ui>Sweep</Ui>](../reference/commands.md#designer-part-sweep) | sweeps a closed sketch along an open one, its <Ui>Path</Ui> |
| [<Ui>Loft</Ui>](../reference/commands.md#designer-part-loft) | skins a solid through two or more sketches, in order |
| [<Ui>Import</Ui>](../reference/commands.md#designer-part-import) | starts a body from a STEP, IGES or BREP file the document carries |

## Features that change shape

<Shot id="designer.modelling.features/hole" />

| Feature | What it does |
|---|---|
| [<Ui>Fillet</Ui>](../reference/commands.md#designer-part-fillet) | rounds the <Ui>Edges</Ui> you pick to a <Ui>Radius</Ui> |
| [<Ui>Chamfer</Ui>](../reference/commands.md#designer-part-chamfer) | bevels the edges you pick by a <Ui>Distance</Ui> |
| [<Ui>Shell</Ui>](../reference/commands.md#designer-part-shell) | hollows a body to a wall <Ui>Thickness</Ui>, leaving the faces you pick open |
| [<Ui>Hole</Ui>](../reference/commands.md#designer-part-hole) | drills holes into a flat <Ui>Face</Ui> at <Ui>Positions</Ui> on it, through or to a <Ui>Depth</Ui>, with a counterbore or a countersink if you like; a <Ui>Fastener</Ui> sizes them for a screw instead of a <Ui>Diameter</Ui>: pick its <Ui>Standard</Ui>, ISO metric or ANSI inch, its <Ui>Size</Ui>, an inch screw's <Ui>Series</Ui> and the <Ui>Fit</Ui>, a close, normal or loose clearance or tapped for its thread; <Ui>Counterbore for a socket head</Ui> sinks a socket head cap screw, and [Fasten](../assemblies/replicate.md#fasten-a-screw-in-every-hole-at-once) then reads it all |
| [<Ui>Boss</Ui>](../reference/commands.md#designer-part-boss) | raises a sketch drawn on a face out of it |
| [<Ui>Pocket</Ui>](../reference/commands.md#designer-part-pocket) | sinks a sketch drawn on a face into the body, by a depth or through it |
| [<Ui>Push/pull</Ui>](../reference/commands.md#designer-part-push-pull) | moves a face out or in, the faces around it following |
| [<Ui>Delete face</Ui>](../reference/commands.md#designer-part-remove-faces) | removes faces, such as a round or a hole, and closes the gap |
| [<Ui>Move</Ui>](../reference/commands.md#designer-part-transform) | moves and turns a body as one piece |

A hole shows a marker for each position. Click the face to move the last hole there, <kbd>Shift</kbd>+click to add another, or drag a marker; the picture shows the hole at the end of the desk arm's link, whose position is written in its `length` parameter.

## Machining shafts and bores

{/* shot: designer.modelling.features/keyway */}

Six features in the <Ui>Insert</Ui> menu cut standard machining into a round face: pick a shaft's side or a bore's wall as the <Ui>Face</Ui>, and each sizes itself for that face's diameter.

| Feature | What it does | Its faces are named |
|---|---|---|
| [<Ui>Keyway</Ui>](../reference/commands.md#designer-part-keyway) | mills a DIN 6885 or ANSI B17.1 keyway into a shaft, or cuts one through a hub's bore, over a <Ui>Length</Ui> | `keyway` |
| [<Ui>Flat</Ui>](../reference/commands.md#designer-part-flat) | takes a flat a <Ui>Depth</Ui> deep off a shaft, such as the one a set screw bears on | `flat` |
| [<Ui>Ring groove</Ui>](../reference/commands.md#designer-part-ring-groove) | cuts the groove a DIN 471 or inch retaining ring sits in on a shaft, or a DIN 472 or inch ring in a bore | `groove` |
| [<Ui>Knurl</Ui>](../reference/commands.md#designer-part-knurl) | knurls a shaft in a straight, left, right or diamond <Ui>Pattern</Ui>, at a DIN 82 pitch or an ANSI B94.6 <Ui>Diametral pitch</Ui> | `knurl` |
| [<Ui>Spline</Ui>](../reference/commands.md#designer-part-spline) | cuts DIN 5480 involute spline teeth of a <Ui>Module</Ui> into a bore, or ANSI B92.1 ones of a <Ui>Pitch</Ui> such as 16/32 and a number of <Ui>Teeth</Ui>; drill the bore to where the hub's teeth end, or give the <Ui>Reference diameter</Ui> | `spline` |
| [<Ui>Thread</Ui>](../reference/commands.md#designer-part-thread) | models an ISO metric thread, or a Unified inch one, on a shaft of its size or in a bore drilled for its tap; the <Ui>Size</Ui>, such as `M8` or `1/4`, is found from the diameter when left empty | `thread` |

Each cut starts <Ui>From the end</Ui> its distance along the face's axis. The axis points along the world axis nearest it, and the end it starts from is the one it points away from, so a shaft standing on the ground is measured from its foot; <Ui>From the other end</Ui> measures from the far end. A keyway or a flat faces world X, or world Y on a shaft that lies along X, and its <Ui>Angle</Ui> turns it from there. Each of these has a <Ui>Standard</Ui>, and in an inch design it starts on the inch one ([Units and inches](./units.md#holes-threads-and-machining)); every length is in the design's unit, whichever standard it is. A face that is not round, a flat or knurl on a bore, a spline on a shaft and a thread on a diameter no size of its standard has are refused with the reason, so the feature turns red rather than cutting something else. A modelled thread is heavy to build and draw; keep it to the parts that need it, and leave the rest to the cosmetic threads of the [standard parts](../assemblies/components.md#standard-parts).

## Combining bodies and patterns

- [<Ui>Boolean</Ui>](../reference/commands.md#designer-part-boolean) combines a body with others, its <Ui>Tools</Ui>, by <Ui>Union</Ui>, <Ui>Difference</Ui> or <Ui>Intersection</Ui>. The tools are used up.
- [<Ui>Linear pattern</Ui>](../reference/commands.md#designer-part-linear-pattern) repeats a body in a row, [<Ui>Polar pattern</Ui>](../reference/commands.md#designer-part-polar-pattern) around an axis, and [<Ui>Mirror</Ui>](../reference/commands.md#designer-part-mirror) across a plane; the copies are fused with it. To repeat whole parts in an assembly instead, see [component patterns](../assemblies/patterns.md).

## Anything else the kernel can do

[<Ui>Operation</Ui>](../reference/commands.md#designer-part-operation) runs any operation of the [CAD API](https://docs.bitbybit.dev) by its dotted path, such as `occt.operations.offset`, with its inputs, and keeps the result as a feature. [<Ui>Script</Ui>](../reference/commands.md#designer-part-script) runs a script the document carries on the part's geometry. Both are rebuilt like any other feature.
