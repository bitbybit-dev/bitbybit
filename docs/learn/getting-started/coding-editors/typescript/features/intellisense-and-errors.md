---
sidebar_position: 3
slug: /getting-started/typescript/intellisense-and-errors
title: IntelliSense, Hovers and Errors
sidebar_label: IntelliSense and errors
description: How the TypeScript editor helps as you type - suggestions at every dot, a function's documentation on hover, mistakes underlined before the run with a count on the file - and where the errors of a run appear.
topic: typescript.code.checks
type: how-to
verified: 2026-10-10
tags: [getting-started, typescript]
---

# IntelliSense, hovers and errors

The editor knows every function of the Bitbybit API, every option it takes and every type it returns, so it can help before you run anything.

## Suggestions

Type a dot after `bitbybit` or any name the API holds, and a list of what can follow opens. Keep typing to narrow it, use <kbd>↑</kbd> and <kbd>↓</kbd> to choose, and press <kbd>Enter</kbd> or <kbd>Tab</kbd> to take one. <kbd>Ctrl+Space</kbd> opens the list wherever the cursor is. The [Hello World tutorial](../tutorials/hello-world.mdx) shows the list for `bitbybit.advanced.text3d.`.

## Hovers

{/* shot: typescript.code.checks/hover */}

Rest the pointer on a name to see what it is. For a function, the hover shows what it takes, what it gives back and what it does: the same text as [the API reference](https://docs.bitbybit.dev). The picture rests on `create` in `bitbybit.advanced.text3d.create`.

## Mistakes before the run

{/* shot: typescript.code.checks/error */}

A mistake the editor can see is underlined in red as you type: a misspelled name, a missing option, a number where text belongs. Rest the pointer on the underline for what is wrong; here the script draws `txt`, and the editor answers "Cannot find name 'txt'. Did you mean 'text'?". The file shows how many mistakes it has, in <Ui>Files</Ui> and on its tab (1), so you can find them in a script of many files.

The marks do not stop a run: <Ui>Run The Code</Ui> runs what you wrote, and a real mistake then fails when the run reaches it.

## Errors of a run

What fails while the script runs is written to the console, in red, with the file it happened in. When the console is not on screen, a <Ui>Code execution failed</Ui> message shows the error instead. [Errors](../../../basics/errors.md) lists what the common ones mean.
