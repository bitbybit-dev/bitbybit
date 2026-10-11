---
sidebar_position: 8
title: "The view, picking and panels"
sidebar_label: View, selection and panels
description: Move around a model in the Designer, look from a named side, pick faces and edges with the right pick mode, use what the Selection panel offers for your picks, and arrange the panels to suit you.
topic: designer.modelling.views
type: how-to
verified: 2026-10-09
tags: [designer]
---

# The view, picking and panels

## Move around

- **Turn** with the left mouse button, **pan** with the right one, and **zoom** with the wheel. With <Ui>Lock rotation</Ui> on, the left button no longer turns the view.
- **The view cube** in the corner: click a face, an edge or a corner to look from there; the arrows around it turn the view a step.
- **<Ui>Fit all</Ui>** brings the whole model into view, and <Ui>Zoom to selection</Ui> just what you picked.
- **<Ui>Look at</Ui>** turns the view to face a picked flat face straight on.
- **<Ui>Perspective</Ui>** switches between perspective and a flat, measured-drawing look, **<Ui>Lock rotation</Ui>** stops a drag from turning the view, and **<Ui>Show or hide the grid</Ui>** does what it says.

{/* shot: designer.modelling.views/view-menu */}

<Ui>View</Ui> holds all of them with their keys, and the named views: <Ui>Iso view</Ui>, <Ui>Front view</Ui>, <Ui>Back view</Ui>, <Ui>Left view</Ui>, <Ui>Right view</Ui>, <Ui>Top view</Ui> and <Ui>Bottom view</Ui>, and <Ui>Turn up</Ui>, <Ui>Turn down</Ui>, <Ui>Turn left</Ui>, <Ui>Turn right</Ui>, <Ui>Roll left</Ui> and <Ui>Roll right</Ui> to step around.

## How the model is drawn

The view bar's last buttons choose the look: <Ui>Faces</Ui> and <Ui>Edges</Ui> on or off, <Ui>Triangles</Ui> to see the mesh the kernel made, and <Ui>Realistic</Ui> for materials, reflections and soft shadows.

## Pick faces and edges

{/* shot: designer.modelling.views/picked */}

Click a face or an edge in the view to pick it, and <kbd>Shift</kbd>+click to add more. What the pointer is over is named in the status bar before you click, such as "Face: link end".

- **Pick modes.** <Ui>Pick faces and edges</Ui> (<kbd>1</kbd>) picks whichever is under the pointer, <Ui>Pick faces only</Ui> (<kbd>2</kbd>) passes over the edges, and <Ui>Pick edges only</Ui> (<kbd>3</kbd>) passes over the faces, which helps when a fillet needs many small edges. The status bar shows the mode and switches it.
- **What to do with it.** The <Ui>Selection</Ui> panel lists the commands that take what you picked, such as <Ui>Hole</Ui> or <Ui>Push/pull</Ui> on a flat face, and a small bar beside the pick offers the same. A command chosen there starts with your picks.
- **Where it came from.** <Ui>Show in tree</Ui> selects the feature that made the picked face or edge.
- **In an assembly**, a click picks a whole component. <Ui>Select one level deeper</Ui> goes from the component to each sub-assembly in turn, then to the part.
- <Ui>Clear selection</Ui> (<kbd>Esc</kbd>) unpicks everything.

## Arrange the panels

The <Ui>Features</Ui> panel, <Ui>Properties</Ui> and the dock can each dock on the left or the right, or float over the view: use the buttons at a panel's top, or drag it by its grip. Drag the edge between a panel and the view to make it wider. The Designer keeps the layout in this browser.
