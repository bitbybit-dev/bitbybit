---
sidebar_position: 4
slug: /getting-started/typescript/script-runtime
title: What a Script Runs In
sidebar_label: The Script Runtime
description: What a TypeScript or Blockly script can reach when it runs in the editor - bitbybit, Bit, BABYLON and its GUI - what it cannot, top-level await, the console, how runs start and end, and why imports are limited to the script's own files.
topic: typescript.code.runtime
type: reference
verified: 2026-10-11
tags: [getting-started, typescript, blockly]
---

# What a script runs in

A TypeScript script, and the code Blockly generates from its blocks, runs inside the editor's page, in the same browser tab. It does not run in the page as an ordinary web page script would: it gets the platform's own objects and nothing of the page around it.

## What a script can use

| Name | What it is |
|---|---|
| `bitbybit` | the whole [API](/learn/code/intro): `bitbybit.occt`, `bitbybit.draw`, `bitbybit.point` and the rest |
| `Bit` | the option classes and types: `Bit.Inputs` (such as `new Bit.Inputs.OCCT.BoxDto()`), `Bit.Models`, `Bit.Advanced` and `Bit.Things` |
| `BABYLON` | the BabylonJS engine, to build on the scene the editor shows |
| `BABYLON.GUI` | BabylonJS's 2D and 3D interface controls: buttons, sliders, text over the view |

IntelliSense knows all four, and so does the type check that marks errors.

## What it cannot use

`window`, `document` and `alert` are `undefined` inside a script. A script cannot change the editor's page, and is not meant to: it should draw into the 3D view and talk to the person through BabylonJS's GUI and the console. To show text or controls over the model, use `BABYLON.GUI`; to keep labels on points of the model, use `bitbybit.tag`.

## Await at the top

A script can `await` at its top level, outside any function:

```typescript
const box = await bitbybit.occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, 0] });
await bitbybit.draw.drawAnyAsync({ entity: box });
```

## The console

`console.log`, `console.info`, `console.warn` and `console.error` write to the console panel under the editor, as well as to the browser's own. Text appears as it is, an error as its message, and anything else as JSON. The console keeps the last 500 lines of a run, each up to 2,000 characters, and folds a line repeated many times into one with a count.

## How a run starts and ends

- **Each run starts fresh.** <Ui>Run The Code</Ui> clears the scene of the run before: its shapes, camera, lights, GUI, and the intervals, key listeners and render functions it registered through the API. A plain `setInterval` of your own is not cleared; prefer `bitbybit.time.registerRenderFunction` or Blockly's time blocks.
- **There is no time limit and no stop button.** A run ends when its code finishes. A loop that never ends keeps the tab busy; reload the page to stop it, after saving your script.
- **An error stops the run** and is written to the console as its message. In a script of several files, a mistake in the code itself, such as a missing bracket, is reported with its file and line before anything runs. The type check marks most mistakes before you press run: [IntelliSense, hovers and errors](./intellisense-and-errors).

## Files and imports

A script of [several files](./files-and-imports) is put together before it runs, starting from `main.ts`. Files import each other by relative path, such as `./parts/bracket`, and a `.json` file can be imported for its data. Packages from npm cannot be imported: everything a script needs is already on `bitbybit`, `Bit` and `BABYLON`. Write against the npm packages in your own app when you need more; [npm packages](/learn/npm-packages/intro) shows how.
