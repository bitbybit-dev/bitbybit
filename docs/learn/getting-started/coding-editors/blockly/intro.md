---
sidebar_position: 1
slug: /getting-started/blockly/intro
title: Blockly Editor
sidebar_label: Introduction
description: What the Blockly editor on bitbybit.dev is and what you can build with it - interlocking blocks that turn into a program - with a detailed drone built step by step, the showcase scripts and where to start.
topic: blockly.start.intro
type: landing
verified: 2026-10-10
tags: [getting-started, blockly, occt]
---

# Blockly Editor

<Shot id="blockly.start.showcases/drone" />

Blockly is the block editor of Bitbybit. You build a program by dragging blocks out of a toolbox and snapping them together: a block that does something stacks under another, and a block that gives a value plugs into an input. The blocks only fit where they make sense, so a whole kind of mistake cannot happen, which makes Blockly the gentlest way into programming 3D geometry. Every function of the Bitbybit API has its block, beside Blockly's own variables, loops, logic, lists and functions.

<a href="https://developers.google.com/blockly" target="_blank" rel="noopener noreferrer">Blockly</a> is the open-source framework by Google behind Scratch-like editors. Under the blocks is JavaScript, so a Blockly script can grow into a real program: events, conditions, loops and functions included.

## What you can do

- **[Build a script](./features/build-a-script.md)** from the toolbox, by category or by searching, stacking blocks and plugging values in.
- **[Work with blocks](./features/blocks.md):** duplicate, comment, collapse or disable them from their menu, and read what each one does from its tip.
- **[Use variables and functions](./features/variables-and-functions.md)** to name a value once and reuse it, or to wrap blocks into a function of your own.
- **[See the code](./features/code.md)** the blocks turn into, and take it into your own app.
- **[Let an agent build with you](../../../using-ai-with-bitbybit/editor-agents.md):** an AI agent in your browser can snap blocks together, run them and read which failed.

## Where to start

1. [The tour](./tour.md) names every part of the window.
2. [Hello World](./tutorials/hello-world.mdx) builds a first script step by step, with a picture after every step.
3. [A parametric cube](./tutorials/parametric-cube.mdx) sizes a solid with a variable.
4. [Build a drone](./tutorials/drone/frame.mdx), the one above, over seven chapters: variables, a function for every part, loops, and async functions that await what they measure.
5. [The showcases](./showcases.md) are larger scripts to open, run and take apart.

Blockly runs only when you press <Ui>Run The Code</Ui>, so run again after a change. [Running code](../../basics/running-code.md) explains the 3D view and the console, which every editor shares, and [the shortcuts](./shortcuts.md) list the keys.
