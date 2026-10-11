---
sidebar_position: 8
title: Understanding and handling errors
sidebar_label: Dealing with Errors
description: Where Rete, Blockly and TypeScript scripts on bitbybit.dev tell you what went wrong - the console, the node or block marked in red, the underlined code - and how to find and fix the cause.
topic: platform.basics.errors
type: how-to
verified: 2026-10-09
tags: [getting-started, typescript, blockly, rete]
---

# Understanding and handling errors

Mistakes are part of programming, and a computer never overlooks one: it stops, or it does something you did not mean. The editors on bitbybit.dev tell you what went wrong in the same few places.

## The console says what failed

Every error a script meets at run time goes to the <Ui>Console</Ui> under the editor, in red, with a count beside the console's title. An error from the geometry kernels names the operation that failed and the values it was given, which is usually enough to find the cause. The Rete and Blockly examples below both ask for a box of width 0, and the kernel answers that every size must be more than 1e-7.

## Rete: the node turns red

{/* shot: platform.basics.errors/rete */}

Rete runs as you change the graph, so an error shows as soon as you make it: the node that failed turns red, and the console says why. Change the input that caused it, and the node runs again at once; when it succeeds, it takes its normal colour back.

## Blockly: after you run it

{/* shot: platform.basics.errors/blockly */}

Blockly shows errors after you press <Ui>Run The Code</Ui>. The block that failed is marked, and the console lists every error of the run, often several: the box that could not be made, then the draw block that had nothing to draw.

## TypeScript: before you run it

{/* shot: platform.basics.errors/typescript */}

TypeScript checks your code as you type. A mistake it can see, such as a name that does not exist or text where a number belongs, is underlined in red; point at it to read what is wrong. In the picture, a misspelled `box` is caught before anything runs. Fix those first: they are the cheapest errors to find.

Code with underlines still runs, and what it gets wrong at run time goes to the console like any other error.

## When nothing tells you

If a script does not do what you expect and no error appears, check its result step by step: draw what a step makes, or print a value with `console.log` in TypeScript. As a last resort, the browser's own developer tools (<kbd>F12</kbd> in most browsers) show messages from the page that the editor's console does not.
