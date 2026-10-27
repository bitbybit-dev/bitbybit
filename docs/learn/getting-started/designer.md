---
sidebar_position: 4
title: "The Designer"
sidebar_label: The Designer
description: The Designer is bitbybit.dev's parametric CAD modeller on the Gold plan - parts and assemblies made by clicking instead of code - and where its own documentation starts.
topic: platform.start.designer
type: explanation
verified: 2026-10-09
tags: [getting-started, designer]
---

# The Designer

The Designer is the fourth editor on bitbybit.dev, and the one without code. You model parts and assemblies the way a CAD program works: draw a sketch, extrude or revolve it, round its edges, drill holes, then put parts together with joints. Every step is kept in order, so changing a size later rebuilds everything that depends on it. The Bitbybit OCCT Kernel builds the model in your browser, the same kernel the coding editors call.

Making and changing designs is part of the Gold plan, and a design someone shares opens for everyone to view. Open it from <Ui>Apps</Ui> > <Ui>Designer</Ui>, or choose <Ui>Designer</Ui> as a script's editor in <Ui>My Projects</Ui>.

## How it differs from the coding editors

| | Rete, Blockly and TypeScript | The Designer |
|---|---|---|
| You build by | connecting nodes, snapping blocks or writing code | clicking: sketches, features and joints |
| A script holds | one program that draws a scene | a whole design: every part and assembly document |
| Changing it | edit the program and run it again | edit a feature or a parameter; what depends on it rebuilds |
| You get out | what your program draws, and the files it exports | parts and assemblies to export as STEP, GLB, BREP or STL, with a bill of materials |
| AI agents | write the program with you | work in the same document, and you keep or undo each change |

A design is saved as [design documents](/learn/using-ai-with-bitbybit/design-documents): plain JSON that the `@bitbybit-dev/occt` package builds in code too, so a model made in the Designer can also be built in your own app or by a TypeScript script.

## A Designer script is a script

A Designer project is saved like any other: in the cloud or in this browser, with its history and cloud backups, shared by its project's visibility. [Projects](/learn/getting-started/basics/projects/intro) and [scripts](/learn/getting-started/basics/scripts/intro) cover all of that, and the Designer's own [Get started](/learn/designer/get-started) pages show it from inside the Designer.

## Where to go next

The Designer has its own section:
- [The Designer: parametric CAD by clicking](/learn/designer/intro), its window and how to find your way around;
- [Make your first part](/learn/designer/tutorials/first-part), a plate driven by parameters;
- [Model a desk robot arm](/learn/designer/tutorials/desk-arm), parts, an assembly and joints;
- [Working with agents](/learn/designer/working-with-agents).
