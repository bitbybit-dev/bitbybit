---
sidebar_position: 1
slug: /getting-started/blockly/build-a-script
title: Building a Script in Blockly
sidebar_label: Building a Script
description: How to find a Blockly block in the toolbox by category or by search, drag it onto the workspace, stack blocks that do something, plug in blocks that give a value, and change the values they start with.
topic: blockly.blocks.build
type: how-to
verified: 2026-10-10
tags: [getting-started, blockly]
---

# Building a script

A Blockly script is a set of blocks snapped together on the workspace. [Hello World](../tutorials/hello-world.mdx) builds one step by step; this page explains each move.

## Find a block

**By category.** The toolbox follows the API: <Ui>occt</Ui> opens into shapes, then solid, then primitives, where the cube waits, as `bitbybit.occt.shapes.solid.createCube` does in [TypeScript](../../typescript/intro.md). Click a category that holds others to open it below itself; click the last one to show its blocks in a flyout.

**By search.**

<Shot id="blockly.blocks.build/search" />

Type part of a block's name into the search field at the top of the toolbox. The flyout lists every block that matches, from every category. Clear the field with its cross.

## Put it on the workspace

Drag a block out of the flyout and drop it on the workspace. The flyout closes as you drag. To get rid of a block, drop it on the trash can, or select it and press <kbd>Delete</kbd>.

## Two shapes of block

- **A block that does something**, such as drawing, has a notch at its top and a tab at its bottom. Drag one under another until it snaps on: stacked blocks run from top to bottom.
- **A block that gives a value**, such as a solid, a number or a point, has a tab on its left. Drag it by that edge onto an input of another block until it snaps in. A block plugs only into an input that takes its kind of value.

## Change a value

Every input of a block from the toolbox starts with a block plugged in, holding a value to begin with. Click a number or a text to type a new one; click a choice to pick from its list. To feed an input from somewhere else, drag the starting block out to the trash can and plug in your own.

Blockly runs only when you press <Ui>Run The Code</Ui>, so run again to see a change.
