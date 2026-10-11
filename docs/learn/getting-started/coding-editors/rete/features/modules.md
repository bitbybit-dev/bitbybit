---
sidebar_position: 5
slug: /getting-started/rete/modules
title: Modules in Rete
sidebar_label: Modules
description: How to make a Rete module - a graph of its own with inputs and outputs - use it as a component through a module instance, and save it to a file to bring into other scripts.
topic: rete.canvas.modules
type: how-to
verified: 2026-10-10
tags: [getting-started, rete]
---

# Modules

A module is a graph you can use as a single component: it takes values through its inputs, gives results through its outputs, and hides how it does it. Build a bracket, a pattern or a tidy-up once, then use it wherever you need it.

## Define a module

{/* shot: rete.canvas.modules/definition */}

Search for `module definition` and add <Ui>Module Definition</Ui>. The node is the module: name it in its title, here *My Module*. Its download button saves it to a file, and its cross deletes it.

## Build its graph

{/* shot: rete.canvas.modules/inside */}

Double-click the definition to go inside. The canvas now holds the module's own graph, and a bar at its foot shows where you are: *Main › My Module*. A new module starts with a <Ui>Module Input</Ui> and a <Ui>Module Output</Ui>, named *input* and *output*.

- **A module input** is a value the module takes. Wire it into whatever needs it, here a cube's size.
- **A module output** is a result the module gives. Wire into it what the module should hand back, here the cube.
- **Add more** of either for more inputs or outputs, and rename them: their names become the sockets of every instance.

Press the back arrow in the bar, <Ui>Back to parent</Ui>, to return to the main canvas.

## Use it

{/* shot: rete.canvas.modules/instance */}

Search for `module instance`, add <Ui>Module Instance</Ui>, and choose the module in its list. The instance takes the module's inputs and outputs as its sockets, under their names. Wire values into it and its results onwards, like any other component. A module draws nothing by itself: wire its output into a component that draws, such as <Ui>draw any async</Ui>, to see the result.

Use as many instances as you like; changing the module inside its definition changes every one of them.

## Share it

The download button on the definition, or <Ui>Save module to file</Ui> in the toolbar while you are inside the module or have its definition selected, saves the module to a file. In another script, <Ui>More</Ui> > <Ui>Import</Ui> brings it in as a new module definition, ready for instances.
