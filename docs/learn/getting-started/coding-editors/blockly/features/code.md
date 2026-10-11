---
sidebar_position: 4
slug: /getting-started/blockly/code
title: The Code Behind the Blocks
sidebar_label: The Code Behind the Blocks
description: How to see the JavaScript a Blockly script turns into, with Export to runner, and copy or download it to run the script in your own web app.
topic: blockly.blocks.code
type: how-to
verified: 2026-10-10
tags: [getting-started, blockly]
---

# The code behind the blocks

Blockly is a visual layer over JavaScript: every block turns into code when the script runs. To see that code, open <Ui>More</Ui> > <Ui>Export to runner</Ui>.

<Shot id="blockly.blocks.code/runner" />

<Ui>Runner Code Preview</Ui> shows the script's type, its version and its code:

- <Ui>Copy code</Ui> copies the code itself, to read or to paste into a [TypeScript](../../typescript/intro.md) script as a starting point.
- <Ui>Copy</Ui> and <Ui>Download</Ui> give the export as a string for the Bitbybit runner, and <Ui>Copy minified</Ui> and <Ui>Download minified</Ui> a smaller one.

The runner runs a script inside your own web page, without the editor: [the runner with Blockly](../../../../runners/intro-blockly.mdx) shows how.
