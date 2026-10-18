---
sidebar_position: 1
title: "Sketches"
sidebar_label: Sketches
description: Draw a sketch in the Designer - pick a plane or a flat face, draw with the sketch bar's lines, arcs, rectangles, circles and polygons, round or bevel corners, and edit every point later as an expression.
topic: designer.modelling.sketches
type: how-to
verified: 2026-10-15
tags: [designer]
---

# Sketches

A sketch is a flat outline that other features use: an extrude or a revolve takes a closed outline, a sweep travels along an open one, and a boss or a pocket raises or sinks one drawn on a face of the part. [How the Designer works](../concepts.md#sketches-are-flat-outlines) shows where sketches fit among the features.

## Start a sketch

<Shot id="designer.modelling.sketches/new" />

1. In a part document, choose <Ui>Insert</Ui> > <Ui>Sketch</Ui>, or <Ui>Sketch</Ui> on the toolbar. An empty part offers it in the middle of the view too.
2. Its dialog opens in <Ui>Properties</Ui>. Under <Ui>Placement</Ui>, choose the <Ui>Plane</Ui>, XY, XZ or YZ, and an <Ui>Offset</Ui> along it if you like. With Y up, XZ is the ground. To sketch on a flat face of the part instead, click that face in the view.
3. The view turns to look straight at the sketch, and the sketch bar appears along its top.

## Draw with the sketch bar

Pick a tool, then click in the view. Each tool has a key as well:

| Tool | Key | What it draws |
|---|---|---|
| <Ui>Line</Ui> | <kbd>L</kbd> | straight segments, point by point; click the start again to close the outline |
| <Ui>Arc</Ui> | <kbd>A</kbd> | an arc on from the last point: click where it ends, then a point it passes through |
| <Ui>Tangent arc</Ui> | <kbd>T</kbd> | an arc that leaves the last segment smoothly: click where it ends |
| <Ui>Rectangle</Ui> | <kbd>R</kbd> | a rectangle from two opposite corners |
| <Ui>Centre rectangle</Ui> | | a rectangle from its centre and a corner |
| <Ui>Circle</Ui> | <kbd>C</kbd> | a circle from its centre and a point on it |
| <Ui>Polygon</Ui> | <kbd>P</kbd> | a regular polygon from its centre and a corner |

- **Typed sizes.** While a tool waits for a size, type it, such as a circle's radius, and <kbd>Enter</kbd> uses it.
- <Ui>Round corner</Ui> and <Ui>Bevel corner</Ui> round or bevel a corner where two lines or arcs meet: click the corner. Type a radius or a distance to change the corners you just made.
- <Ui>Close outline</Ui> draws a straight segment back to where the outline started.
- <Ui>Snap</Ui> pulls the pointer to the sketch's points, to lines level or upright with them, and to the grid.
- <kbd>Enter</kbd> finishes the outline and leaves it open. <kbd>Esc</kbd> drops the point just placed, then stops the outline, then puts the tool down.

<Ui>OK</Ui> adds the sketch to the part's features, ready for a feature such as <Ui>Extrude</Ui> to use.

## Every point is a pen command

<Shot id="designer.modelling.sketches/pen" />

What you draw is kept as a list of pen commands, which the dialog shows under <Ui>Pen</Ui>: where the pen starts, then each line and arc and where it goes. Right-click a sketch and choose <Ui>Edit feature</Ui> to change any of them; while you do, the view shows the part only as far as the sketch. The picture shows the side outline of the desk arm's link, from [the showcases](../showcases.md).

- **Numbers can be expressions.** Every number may be written in the part's parameters, such as `length + tip` or `tip / 4`, so the outline follows when a parameter changes. [Parameters](./parameters.md) explains them.
- **Relative or absolute.** A point is measured from the one before it while <Ui>Relative</Ui> is ticked, or from the sketch's origin when it is not.
- **Commands have ids.** A feature made from the sketch names its side faces after the pen commands' ids. A fillet can then name "the side made by the belly arc", and finds it again after the outline changes. [References](./references.md) explains why that matters.
- **Circles and gears stand alone.** A <Ui>Circle</Ui> or a <Ui>Gear</Ui> command is a whole outline by itself, the only command of its loop. A gear draws every tooth from a module and a number of teeth; the faces made from it are named by the sketch, the gear's id and the part of a tooth, such as `gear1-sketch.teeth.tip`. Tick <Ui>Ring gear</Ui> and it draws a ring's teeth instead, pointing in, for a hole inside a larger circle.

## Closed outlines, holes and paths

- A **closed** outline makes a face, which an extrude, a revolve or a loft uses.
- An **open** outline is a path for a sweep. To keep a closed outline as a path, such as a ring to sweep along, untick <Ui>Face</Ui> under <Ui>More options</Ui>.
- **Holes.** Draw a closed outline inside another, such as a circle inside a rectangle, and the sketch keeps them as <Ui>Loops</Ui>: the first is the outside, each further one a hole in the face. The picture at the top shows one.
