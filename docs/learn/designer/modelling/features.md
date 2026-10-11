---
sidebar_position: 2
title: "Features and their dialogs"
sidebar_label: Features and dialogs
description: Every feature the Designer adds to a part - solids, extrudes, revolves, sweeps and lofts, fillets, chamfers, shells, holes, bosses and pockets, booleans and patterns - and how their dialogs take values, picks and expressions.
topic: designer.modelling.features
type: how-to
verified: 2026-10-09
tags: [designer]
---

# Features and their dialogs

A part is a list of features, built in order. You add one from <Ui>Insert</Ui> or the toolbar, fill in its dialog, and <Ui>OK</Ui> adds it after the features already there.

{/* shot: designer.modelling.features/insert */}

## How a dialog works

{/* shot: designer.modelling.features/extrude */}

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

<Ui>Box</Ui>, <Ui>Cylinder</Ui>, <Ui>Prism</Ui>, <Ui>Sphere</Ui> and <Ui>Cone</Ui> make a whole solid from one dialog, standing on a plane or rising from a flat face you picked. Each is a sketch and an extrude or a revolve underneath, so its faces have the same names as if you had drawn it.

## Features that make shape

| Feature | What it does |
|---|---|
| [<Ui>Extrude</Ui>](../reference/commands.md#designer-part-extrude) | sweeps a sketch's face straight out by a <Ui>Distance</Ui>; <kbd>E</kbd> |
| [<Ui>Revolve</Ui>](../reference/commands.md#designer-part-revolve) | turns a sketch's face about an axis, a whole turn or by an <Ui>Angle</Ui> |
| [<Ui>Sweep</Ui>](../reference/commands.md#designer-part-sweep) | sweeps a closed sketch along an open one, its <Ui>Path</Ui> |
| [<Ui>Loft</Ui>](../reference/commands.md#designer-part-loft) | skins a solid through two or more sketches, in order |
| [<Ui>Import</Ui>](../reference/commands.md#designer-part-import) | starts a body from a STEP, IGES or BREP file the document carries |

## Features that change shape

{/* shot: designer.modelling.features/hole */}

| Feature | What it does |
|---|---|
| [<Ui>Fillet</Ui>](../reference/commands.md#designer-part-fillet) | rounds the <Ui>Edges</Ui> you pick to a <Ui>Radius</Ui> |
| [<Ui>Chamfer</Ui>](../reference/commands.md#designer-part-chamfer) | bevels the edges you pick by a <Ui>Distance</Ui> |
| [<Ui>Shell</Ui>](../reference/commands.md#designer-part-shell) | hollows a body to a wall <Ui>Thickness</Ui>, leaving the faces you pick open |
| [<Ui>Hole</Ui>](../reference/commands.md#designer-part-hole) | drills holes into a flat <Ui>Face</Ui> at <Ui>Positions</Ui> on it, through or to a <Ui>Depth</Ui>, with a counterbore or a countersink if you like |
| [<Ui>Boss</Ui>](../reference/commands.md#designer-part-boss) | raises a sketch drawn on a face out of it |
| [<Ui>Pocket</Ui>](../reference/commands.md#designer-part-pocket) | sinks a sketch drawn on a face into the body, by a depth or through it |
| [<Ui>Push/pull</Ui>](../reference/commands.md#designer-part-push-pull) | moves a face out or in, the faces around it following |
| [<Ui>Delete face</Ui>](../reference/commands.md#designer-part-remove-faces) | removes faces, such as a round or a hole, and closes the gap |
| [<Ui>Move</Ui>](../reference/commands.md#designer-part-transform) | moves and turns a body as one piece |

A hole shows a marker for each position. Click the face to move the last hole there, <kbd>Shift</kbd>+click to add another, or drag a marker; the picture shows the hole at the end of the desk arm's link, whose position is written in its `length` parameter.

## Combining bodies and patterns

- [<Ui>Boolean</Ui>](../reference/commands.md#designer-part-boolean) combines a body with others, its <Ui>Tools</Ui>, by <Ui>Union</Ui>, <Ui>Difference</Ui> or <Ui>Intersection</Ui>. The tools are used up.
- [<Ui>Linear pattern</Ui>](../reference/commands.md#designer-part-linear-pattern) repeats a body in a row, [<Ui>Polar pattern</Ui>](../reference/commands.md#designer-part-polar-pattern) around an axis, and [<Ui>Mirror</Ui>](../reference/commands.md#designer-part-mirror) across a plane; the copies are fused with it. To repeat whole parts in an assembly instead, see [component patterns](../assemblies/patterns.md).

## Anything else the kernel can do

[<Ui>Operation</Ui>](../reference/commands.md#designer-part-operation) runs any operation of the [CAD API](https://docs.bitbybit.dev) by its dotted path, such as `occt.operations.offset`, with its inputs, and keeps the result as a feature. [<Ui>Script</Ui>](../reference/commands.md#designer-part-script) runs a script the document carries on the part's geometry. Both are rebuilt like any other feature.
