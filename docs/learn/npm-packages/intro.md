---
sidebar_position: 1
title: Our NPM Packages
sidebar_label: Intro
description: Discover the open-source NPM packages that power Bitbybit, allowing you to integrate our 3D CAD algorithms into your own applications.
tags: [npm-packages, threejs, babylonjs, occt, manifold, jscad]
---

# Our NPM Packages

When developing standalone applications in TypeScript or JavaScript, you often use third-party libraries and frameworks. We've developed several open-source NPM packages (MIT Licensed) to help you integrate our powerful 3D CAD algorithms directly into your applications.

## Architecture of NPM Packages

The following diagram illustrates the architecture of our NPM packages. Each game engine-specific package (`@bitbybit-dev/threejs`, `@bitbybit-dev/babylonjs`) connects through the `@bitbybit-dev/core` layer. This creates a streamlined, extensible structure that supports a range of integrations with various geometry kernels like OCCT, JSCAD, and Manifold.

![Architecture of Bitbybit NPM packages](https://ik.imagekit.io/bitbybit/app/assets/npm-package-architecture.jpeg)
*Architecture of Bitbybit NPM packages*

## Available Packages

Here's a list of our core NPM packages. Each provides distinct functionalities for your 3D development needs.

---

## Rendering & Integration Packages

These packages provide the bridge between our core geometry libraries and popular 3D rendering engines.

### @bitbybit-dev/babylonjs

-   [NPM Package](https://www.npmjs.com/package/@bitbybit-dev/babylonjs)
-   [GitHub Source](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/babylonjs)

Allows users of the [BabylonJS](https://babylonjs.com) game engine to use our core 3D CAD algorithms. It helps you build 3D model configurators or other 3D applications by providing tools to construct meshes and groups from OpenCascade or JSCAD geometry kernels.

### @bitbybit-dev/threejs

-   [NPM Package](https://www.npmjs.com/package/@bitbybit-dev/threejs)
-   [GitHub Source](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/threejs)

Enables users of the [ThreeJS](https://threejs.org) library to utilize our core 3D CAD algorithms. Similar to the BabylonJS package, it assists in building 3D applications by providing algorithms for constructing meshes from OpenCascade or JSCAD geometry.

---

## Core & Kernel Packages

These packages form the foundation of our geometry processing capabilities.

### @bitbybit-dev/core

-   [NPM Package](https://www.npmjs.com/package/@bitbybit-dev/core)
-   [GitHub Source](https://github.com/bitbybit-dev/bitbybit) {/* Consider linking to specific core package if deeply nested */}

Contains the core 3D algorithms of the Bitbybit platform. It's independent of UI and specific game engines but is designed for browser environments. This package integrates various 3D kernels (OCCT, JSCAD, Manifold) by leveraging our other specialized kernel packages.

### @bitbybit-dev/occt-worker

-   [NPM Package](https://www.npmjs.com/package/@bitbybit-dev/occt-worker)
-   [GitHub Source](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/occt-worker)

Exposes core OpenCascade (OCCT) 3D algorithms via a Web Worker for browser environments. This package is independent of rendering frameworks, allowing you to build custom rendering pipelines (WebGL, WebGPU). For Node.js environments, consider the `@bitbybit-dev/occt` library.

### @bitbybit-dev/occt

-   [NPM Package](https://www.npmjs.com/package/@bitbybit-dev/occt)
-   [GitHub Source](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/occt)

Contains core OpenCascade (OCCT) 3D algorithms. This package can be deployed in both browser and backend (Node.js) contexts, allowing you to build custom caching or Web Worker pipelines. It can potentially be used alongside other opencascade.js libraries.

### @bitbybit-dev/jscad-worker

-   [NPM Package](https://www.npmjs.com/package/@bitbybit-dev/jscad-worker)
-   [GitHub Source](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/jscad-worker)

Exposes core JSCAD 3D algorithms via a Web Worker for browser environments. Independent of rendering frameworks. For Node.js environments, consider the `@bitbybit-dev/jscad` library.

### @bitbybit-dev/jscad

-   [NPM Package](https://www.npmjs.com/package/@bitbybit-dev/jscad)
-   [GitHub Source](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/jscad)

Contains core JSCAD 3D algorithms. JSCAD is developed by an amazing community, which you can find [here](https://github.com/jscad/OpenJSCAD.org).

### @bitbybit-dev/manifold-worker

-   [NPM Package](https://www.npmjs.com/package/@bitbybit-dev/manifold-worker)
-   [GitHub Source](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/manifold-worker)

Exposes core Manifold 3D algorithms via a Web Worker for browser environments. Independent of rendering frameworks. For Node.js environments, consider the `@bitbybit-dev/manifold` library.

### @bitbybit-dev/manifold

-   [NPM Package](https://www.npmjs.com/package/@bitbybit-dev/manifold)
-   [GitHub Source](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/manifold)

Contains Manifold 3D algorithms. The Manifold geometry kernel was started by Emmet Lalish. Learn more about the [Manifold 3D project here](https://github.com/elalish/manifold).

### @bitbybit-dev/base

-   [NPM Package](https://www.npmjs.com/package/@bitbybit-dev/base)
-   [GitHub Source](https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/base)

Contains foundational algorithms for the Bitbybit platform, used in all higher-level NPM packages. Includes utilities for vectors, math, text manipulation, and other basic operations.