---
sidebar_position: 2
slug: /getting-started/rete/tour
title: A Tour of the Rete Editor
sidebar_label: A tour
description: The Rete editor's window part by part - the palette, the toolbar, a node and its parts, a wire, the 3D view, Run The Code and the More menu - numbered as in the picture.
topic: rete.start.tour
type: explanation
verified: 2026-10-10
tags: [getting-started, rete]
---

# A tour of the Rete editor

{/* shot: rete.start.tour/window */}

The numbers match the picture, which shows the script [Hello World](./tutorials/hello-world.mdx) builds.

1. **The palette.** One icon per top category of the API: draw, occt, math, lists and the rest. Click one to open its subcategories and components; [Adding components](./features/add-components.md) shows the way down.
2. **The toolbar.** <Ui>Clear all cache and components</Ui>, <Ui>Clears cache and recomputes</Ui>, <Ui>Fit the whole script to screen</Ui>, <Ui>Editor settings</Ui>, <Ui>Auto-arrange the graph</Ui>, <Ui>Add a group</Ui> and <Ui>Add a comment</Ui>. More buttons appear when you select nodes or a group, as [Organising a script](./features/organise.md) shows.
3. **A node.** One component on the canvas, with its fields and sockets. The next picture shows its parts.
4. **A wire.** It carries the output of one node into an input of another. The input's field hides, because the wire now gives its value.
5. **The 3D view.** What the script draws. Turn it with the left mouse button, pan with the right, zoom with the wheel.
6. **<Ui>Run The Code</Ui>.** Runs the script once. After that Rete runs again by itself whenever you change a value or a wire.
7. **<Ui>More</Ui>.** Import, export, copy and paste the script, settings, and links to the documentation.

The console sits under the canvas; [Running code](../../basics/running-code.md) explains it and the split between the canvas and the 3D view.

## The parts of a node

{/* shot: rete.start.tour/node */}

1. **The name.** Click it to rename the node; empty it to get the component's own name back.
2. **Help, copy and delete.** The question mark shows what the component does and opens its page in the API documentation; copy puts a duplicate with the same values beside your pointer; the cross deletes the node and its wires.
3. **The path**, such as `occt.shapes.solid.createCube`: where the component sits in the palette and what you would call in [TypeScript](../typescript/intro.md).
4. **A field.** The value of an input that has no wire.
5. **An input's socket**, on the left. Drop a wire here.
6. **The output's socket**, on the right. Drag a wire from here. Hover a socket to see its type and the value it holds after a run.
7. **<Ui>Visible</Ui>.** Whether the node draws its result in the 3D view. Beside it, the focus button turns the camera to the node's geometry; double-clicking the node does the same.
8. **The node options**, opened with ⌄: <Ui>force exec</Ui>, <Ui>1:1</Ui> and <Ui>flatten out.</Ui>, which [Lists and node options](./features/lists.md) explains.
