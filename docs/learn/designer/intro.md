---
sidebar_position: 1
title: "The Designer: parametric CAD by clicking"
sidebar_label: Introduction
description: The Designer is Bitbybit's interactive CAD modeller. Make parametric parts and assemblies by clicking, work beside an AI agent in the same document, and export STEP, GLB or STL.
topic: designer.start
type: landing
verified: 2026-10-09
tags: [designer]
---

# The Designer: parametric CAD by clicking

The Designer is where you model parts and assemblies the way a CAD program works: draw a sketch, extrude it, round its edges, drill holes, then put parts together with joints. Every step is kept, so changing a size later rebuilds everything that depends on it. The OpenCascade kernel does the modelling in your browser, so there is nothing to install.

{/* shot: designer.tour/window */}

The Designer is made for two kinds of author at once. You work with the mouse and the keyboard, and an AI agent can work in the same document through the tools the Designer offers it. You see what the agent changes as it happens, and you keep or undo each change.

## What you can make

{/* shot: designer.start/features designer.start/parameters designer.start/parts designer.start/joints designer.start/bom designer.start/export */}

- **[Parts from features](./modelling/features.md).** [Sketch](./modelling/sketches.md) an outline, then extrude, revolve, loft or sweep it, and round, chamfer, shell, drill and pattern the result. Each feature keeps its dialog, so you edit it later as you made it.
- **[Parameters and configurations](./modelling/parameters.md).** Name the sizes that matter, write others as expressions of them, and drag a slider to see the part follow. A configuration keeps a set of values under a name.
- **[Parts with materials](./modelling/parts.md).** A part has a name, a material and a colour, and the Designer works out its volume and mass.
- **[Assemblies with joints](./assemblies/joints.md).** Place parts as [components](./assemblies/components.md), join them at [connectors](./assemblies/connectors.md) with joints that turn or slide within limits, and pose the whole assembly.
- **[Checks](./assemblies/inspect.md).** The bill of materials counts every part, and the clash check finds parts that overlap.
- **[Files for other programs](./get-started/export-import.md).** Export STEP with the assembly tree, names and colours, or GLB, BREP and STL; keep the whole project as one file.

[How the Designer works](./concepts.md) explains the ideas behind all of it.

## Showcases

{/* shot: designer.showcases/robot-arm-cover designer.showcases/jet-engine-cover designer.showcases/desk-arm-cover */}

A six-axis robot arm, a turbofan engine and the desk arm of the tutorial, each modelled in the Designer. [The showcases](./showcases.md) say what each one shows, and offer them to download and open.

## Open the Designer

Making and changing designs is part of the Gold plan; a design someone shares opens for everyone to view. On bitbybit.dev:

- open <Ui>Apps</Ui> > <Ui>Designer</Ui> in the header, or
- press <Ui>Launch Designer</Ui> on the Designer's card, where bitbybit.dev asks which editor to start and on its homepage, or
- in <Ui>My Projects</Ui>, make a <Ui>New project</Ui> and pick <Ui>Designer</Ui> as the editor of its first script.

A Designer project is one script that holds all of its documents, and it always opens in the Designer. It is saved with the project like any other script; [Get started](./get-started/open.md) shows each step.

## Find your way around

Menus and a toolbar along the top, the <Ui>Features</Ui> panel on the left, the view in the middle, <Ui>Properties</Ui> and the dock on the right, and a status bar along the bottom. [The tour](./tour.md) goes through the window part by part.

## Get help while you work

- <Ui>Help</Ui> > <Ui>Tutorials</Ui> plays a tutorial in the Designer. A card shows each step and rings the control to use; make the step yourself or press <Ui>Do it</Ui>.
- <Ui>Help</Ui> > <Ui>Find a command</Ui> (<kbd>Ctrl+K</kbd>, <kbd>⌘K</kbd> on macOS) finds any command by name and runs it.
- Hover over a button to see what it does and its key. A command that cannot run yet says why.

## Where to go next

- [Make your first part](./tutorials/first-part.md): a plate with rounded edges and holes, driven by parameters. Start here.
- [Model a desk robot arm](./tutorials/desk-arm.md): nine parts, an assembly, joints with limits, and fasteners on every hole.
- [How the Designer works](./concepts.md): documents, features, references, parameters, parts and assemblies.
- [Working with agents](./working-with-agents.md): how an agent works beside you, and how you review what it does.
- The reference: every [command](./reference/commands.md), every [keyboard shortcut](./reference/shortcuts.md), and every [tool for agents](./reference/agent-tools.md).

The Designer saves your work as [design documents](../using-ai-with-bitbybit/design-documents.md), plain JSON that the `@bitbybit-dev/occt` package builds in code too, so a model made here can also be built in your own app.
