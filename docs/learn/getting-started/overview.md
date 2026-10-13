---
sidebar_position: 1
title: Getting Started Overview
sidebar_label: Overview
description: What bitbybit.dev offers and where to begin - projects and scripts, the Rete, Blockly and TypeScript coding editors, the Designer, the free npm packages, CAD Cloud, 3D Bits for Shopify and the model configurators.
topic: platform.start.overview
type: landing
verified: 2026-10-09
tags: [getting-started, typescript, occt, jscad, manifold, rete, blockly, designer, cad-cloud, shopify]
---

import Admonition from '@theme/Admonition';

# Getting Started

bitbybit.dev is a platform for parametric 3D: you describe a shape by its rules, and changing a rule rebuilds it. Four editors build on one set of CAD kernels - OpenCascade, JSCAD and Manifold - and your work is kept in projects, in the cloud or in this browser.

## Where to begin

1. **[Basics](/learn/getting-started/basics/intro)** covers what every editor shares: projects and scripts, how your work is saved, assets, running your code, drawing and errors. Read it first.
2. **Pick an editor.** The three [coding editors](/learn/getting-started/coding-editors) build with nodes, blocks or code; [the Designer](/learn/getting-started/designer) builds by clicking.
3. **Take it further** with the free npm packages, CAD Cloud or 3D Bits, below.

## The editors

| Editor | How you build | Plan |
|---|---|---|
| [Rete](/learn/getting-started/rete) | connect nodes into a graph; the scene follows every change | every plan |
| [Blockly](/learn/getting-started/blockly) | snap blocks together, then run them | every plan |
| [TypeScript](/learn/getting-started/typescript) | write code in the Monaco editor, with IntelliSense over the whole API | every plan |
| [Designer](/learn/getting-started/designer) | click: sketches, features, parts and assemblies with joints | Gold |

**Rete** is a visual, node-based editor, familiar if you have used Grasshopper, Dynamo or Blender's nodes. It is reactive: change a node or a value and the scene updates on its own.

**Blockly** composes scripts from blocks that stand for values, loops and functions. It reads much like code, which makes it a good way to learn programming. Press <Ui>Run The Code</Ui> to see the result.

**TypeScript** gives you the whole platform in code: the `bitbybit` API, the BabylonJS engine, the Havok physics engine and BabylonJS GUI. Press <Ui>Run The Code</Ui> after a change.

**The Designer** is parametric CAD without code: every feature is kept in order and rebuilt when a parameter changes, and AI agents can work in the same document. It is part of the Gold plan.

All four call the same algorithms, so much of what one editor does can be done in another.

## npm packages (MIT)

The CAD algorithms behind the editors are free npm packages, with open-source TypeScript, that you can use in your own web app, with BabylonJS, ThreeJS or PlayCanvas:

- `@bitbybit-dev/babylonjs` - [getting started](/learn/getting-started/engines/babylonjs)
- `@bitbybit-dev/threejs` - [getting started](/learn/getting-started/engines/threejs)
- `@bitbybit-dev/playcanvas` - [getting started](/learn/getting-started/engines/playcanvas)

<Admonition type="tip" title="Quick start with any engine">
The fastest way to start is the scaffolding tool:

```bash
npx @bitbybit-dev/create-app my-project --engine babylonjs
# or --engine threejs
# or --engine playcanvas
```

Run it without arguments and choose the **cloud** app type to scaffold a CAD Cloud project instead: a backend (Hono, Node.js or .NET) and a React + ThreeJS frontend.
</Admonition>

The packages hold the algorithms and the engine integrations. The editors' user interface, the model configurators and the algorithms of the Silver and Gold plans are not in them. [NPM packages](/learn/npm-packages/intro) has the full list, and [runners](/learn/runners) run a script made in an editor on any website.

## CAD Cloud API

For CAD work on a server - models generated on demand by a backend, STEP converted to glTF at scale, booleans and fillets without shipping WASM to the browser - the **CAD Cloud API** runs it on managed infrastructure. Every request is a task: submit it, poll it, download the result as glTF, STEP or mesh JSON. Manage it in [Bitbybit Studio](https://studio.bitbybit.dev) or from code with the [TypeScript SDK](https://www.npmjs.com/package/@bitbybit-dev/cad-cloud-sdk); the [CAD Cloud API documentation](/api/cloud-api) has the details.

## 3D Bits for Shopify

[3D Bits](https://apps.shopify.com/3d-bits-1) puts interactive 3D viewers, product configurators and Gaussian splatting scans on Shopify product pages, through theme app blocks. The [quick start](/learn/3d-bits/quick-start) takes you from installing the app to a first product live.

## 3D model configurators

The [3D model configurators](/learn/getting-started/configurators) on bitbybit.dev shape ready-made parametric models by a few choices and export them as STEP, IGES, STL or glTF.

## API reference

Every editor builds on the same API, documented in full at [docs.bitbybit.dev](https://docs.bitbybit.dev).
