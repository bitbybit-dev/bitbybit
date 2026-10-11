---
sidebar_position: 1.2
title: "A tour of the Designer"
sidebar_label: A tour
description: The Designer's window part by part - the menus, the toolbar, the Features panel, the view with its view bar and cube, Properties, the dock and the status bar - and where to find a command, a tutorial or a realistic look.
topic: designer.tour
type: explanation
verified: 2026-10-09
tags: [designer]
---

# A tour of the Designer

{/* shot: designer.tour/window */}

The numbers match the picture, which shows the robot arm from [the showcases](./showcases.md).

1. **The menus.** <Ui>File</Ui>, <Ui>Edit</Ui>, <Ui>View</Ui>, <Ui>Insert</Ui>, <Ui>Inspect</Ui> and <Ui>Help</Ui> hold every command. A command that cannot run yet is greyed out, and its tip says why.
2. **The toolbar.** The commands you use most. What does not fit the window folds into <Ui>More</Ui>.
3. **The <Ui>Features</Ui> panel.** The project's documents at the top; under them, the open document's tree. A part lists its <Ui>Parameters</Ui> and its <Ui>Features</Ui> in the order they are built; an assembly lists its <Ui>Components</Ui>, <Ui>Joints</Ui> and <Ui>Configurations</Ui>. Right-click a row to edit, suppress, delete or roll back to it.
4. **The view bar.** <Ui>Fit all</Ui>, <Ui>Look at</Ui>, <Ui>Perspective</Ui>, <Ui>Show or hide the grid</Ui> and <Ui>Lock rotation</Ui>, and how the model is drawn: <Ui>Faces</Ui>, <Ui>Edges</Ui>, <Ui>Triangles</Ui> and <Ui>Realistic</Ui>.
5. **The view cube.** Click a face, an edge or a corner to look from there.
6. **The <Ui>Properties</Ui> panel.** What you selected: a feature, a parameter, a part with its material and mass, a component or a joint.
7. **The dock.** <Ui>Problems</Ui> lists what a build could not do and <Ui>History</Ui> the changes of this session. An assembly adds <Ui>Bill of materials</Ui> and <Ui>Clashes</Ui>, and <Ui>Review</Ui> appears when an agent has changed something.
8. **The status bar.** What the pointer is over, whether a click picks faces, edges or both (keys <kbd>1</kbd>, <kbd>2</kbd> and <kbd>3</kbd>), the progress of a long build, and whether an agent is working.

Each panel can dock on either side or float: use its placement buttons, or drag it by its grip. Drag the edges between panels to resize them. The Designer remembers the layout in this browser.

## Select, then change

{/* shot: designer.tour/parameter designer.tour/part */}

Click a row of the tree or a face in the view, and <Ui>Properties</Ui> shows it. A parameter has a value and a slider: drag it and the part rebuilds as you go. A part has its name, material and colour, with the volume and mass worked out.

{/* shot: designer.tour/feature-dialog */}

To change a feature, right-click it and choose <Ui>Edit feature</Ui>. Its dialog opens as you left it, the view shows handles to drag, and <Ui>OK</Ui> rebuilds everything after it.

## Assemblies at a glance

{/* shot: designer.tour/joint designer.tour/configuration designer.tour/bom */}

Select a joint to see what it joins and how far it may move. A configuration poses the whole assembly at once, and the bill of materials counts every part it places.

## How the model is drawn

{/* shot: designer.tour/realistic */}

<Ui>Realistic</Ui> lights the parts as their materials look, with reflections and soft shadows; off, the view is the matte CAD look that is easier to model in. <Ui>Edges</Ui> draws the edges in either.

## Find a command

{/* shot: designer.tour/palette */}

<Ui>Find a command</Ui> (<kbd>Ctrl+K</kbd>, <kbd>⌘K</kbd> on macOS) lists every command that matches what you type, with its key, and runs the one you choose.

## Learn by doing

{/* shot: designer.tour/tutorials */}

<Ui>Help</Ui> > <Ui>Tutorials</Ui> plays a tutorial in the Designer, step by step. [Make your first part](./tutorials/first-part.md) is the place to start.
