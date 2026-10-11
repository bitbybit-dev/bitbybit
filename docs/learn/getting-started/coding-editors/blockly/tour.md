---
sidebar_position: 2
slug: /getting-started/blockly/tour
title: A Tour of the Blockly Editor
sidebar_label: A tour
description: The Blockly editor's window part by part - the toolbox and its search, the blocks on the workspace, the trash can, the 3D view, Run The Code, the toolbox button and the More menu - numbered as in the picture.
topic: blockly.start.tour
type: explanation
verified: 2026-10-10
tags: [getting-started, blockly]
---

# A tour of the Blockly editor

<Shot id="blockly.start.tour/window" />

The numbers match the picture, which shows the script [Hello World](./tutorials/hello-world.mdx) builds.

1. **The toolbox.** The blocks by category: the Bitbybit API first (draw, babylon, occt, advanced and the rest), Blockly's own (variables, functions, loops, logic, math, lists, colour and text) at the bottom. A category that holds others opens below itself when clicked; the last one shows its blocks in a flyout beside the toolbox.
2. **The search.** Type part of a block's name, and the flyout lists every block that matches.
3. **A block.** Its inputs come with blocks plugged in, holding values to start from. A clock in its title means the block waits for its result, such as a solid the CAD kernel makes.
4. **The trash can.** Drop a block on it to delete it.
5. **The 3D view.** What the script draws. Turn it with the left mouse button, pan with the right, zoom with the wheel.
6. **<Ui>Run The Code</Ui>.** Runs the script. Blockly runs only when you press it.
7. **The toolbox button.** Hides the toolbox, to give the workspace more room, and shows it again.
8. **<Ui>More</Ui>.** Import, export, copy and paste the script, <Ui>Export to runner</Ui>, <Ui>Clean Canvas</Ui>, settings, and links to the documentation.

Drag the empty workspace to move around it, and use the wheel to zoom. The console sits under the workspace; [Running code](../../basics/running-code.md) explains it and the split between the workspace and the 3D view.
