---
sidebar_position: 1
slug: /getting-started/typescript/intro
title: TypeScript Editor
sidebar_label: Introduction
description: What the TypeScript editor on bitbybit.dev is and what you can build with it - the whole Bitbybit API in code, with IntelliSense, several files and imports - with a detailed drone written step by step, the showcase scripts and where to start.
topic: typescript.start.intro
type: landing
verified: 2026-10-10
tags: [getting-started, typescript, occt]
---

# TypeScript Editor

<Shot id="typescript.start.showcases/drone" />

The TypeScript editor gives you the whole Bitbybit API in code. It is Monaco, the editor of VS Code, set up for the API: it suggests what fits as you type, explains every function on hover, and marks a mistake before you run. If you already write code, it is the fastest and least constrained way to use the platform: loops, functions, classes and your own abstractions all work as they do anywhere.

<a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">TypeScript</a> is JavaScript with types. The types are what let the editor know the API so well, and they disappear when the script runs: the same code runs in a browser, in your own app through the [npm packages](/learn/npm-packages/intro), or on Node.

## What you can do

- **[Call the API](./features/how-to-code-in-monaco.md)** through the `bitbybit` constant, with option objects from the `Bit` namespace.
- **[Split a script into files](./features/files-and-imports.md)** and folders that import from one another, with `main.ts` as the file the run starts from.
- **[Let the editor help](./features/intellisense-and-errors.md):** suggestions at every dot, documentation on hover, and errors marked before you run.
- **[Let an agent build with you](../../../using-ai-with-bitbybit/editor-agents.md):** an AI agent in your browser can write the files, run the script and read its errors.

New to programming? [Rete](../rete/intro.md) and [Blockly](../blockly/intro.md) call the same functions without typing; what you learn there carries over.

## Where to start

1. [The tour](./tour.md) names every part of the window.
2. [Hello World](./tutorials/hello-world.mdx) writes a first script step by step, with a picture after every step.
3. [A parametric cube](./tutorials/parametric-cube.mdx) sizes a solid from one number.
4. [Build a drone](./tutorials/drone/frame.mdx), the one above, over seven chapters: a script of nineteen files, a function for every part and a folder for the arm.
5. [The showcases](./showcases.md) are larger scripts to open, run and take apart.

A script runs when you press <Ui>Run The Code</Ui>. [Running code](../../basics/running-code.md) explains the 3D view and the console, which every editor shares, and [the shortcuts](./shortcuts.md) list the keys. For a large project, the [npm packages](/learn/npm-packages/intro) let you work in your own editor with version control.
