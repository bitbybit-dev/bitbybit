---
sidebar_position: 1
title: Getting Started Overview
sidebar_label: Overview
description: Learn about the different ways to use our platform, including 3D Model Configurators, Rete, Blockly, and Monaco (TypeScript) editors.
tags: [getting-started, typescript, occt, jscad, manifold, rete, blockly]
---

import Admonition from '@theme/Admonition';

# Getting Started

This section introduces the different ways you can use our platform. We'll explore our **3D Model Configurators** and our three distinct creative editors: **Rete**, **Blockly**, and **Monaco (TypeScript)**. We'll also cover their strengths, weaknesses, and typical use cases. Information common across editors or relevant to the platform itself is integrated within these descriptions.

## 3D Model Configurators

Our 3D Model Configurators provide access to a variety of pre-defined 3D models, allowing you to create unique parametric representations with just a few button clicks.

**Key Features:**
*   **Intuitive:** Each configurator is specifically tuned for its model.
*   **Interactive:** Often include model-specific 3D interactions to help you shape your designs intuitively.

**Export Capabilities:**
You can export your configured models into industry-standard file types for use in third-party software. Supported formats include:
*   STEP
*   IGES
*   STL
*   GLTF

<Admonition type="caution" title="Important Limitations">
  <ul>
    <li>You <strong>cannot</strong> import other models directly into a configurator.</li>
    <li>You <strong>cannot</strong> combine multiple parametric models within the same configurator space.</li>
  </ul>
  <p>If you need to combine multiple parametric models in a single 3D environment, consider using our parametric editors: Rete, Blockly, or Monaco (TypeScript).</p>
</Admonition>

## [Rete Editor](https://bitbybit.dev/app?editor=rete)

The Rete editor offers a visual, node-based approach to parametric design. It's simple enough for beginners yet powerful and versatile enough for professional computational designers.

**Key Features:**
*   **Familiar Interface:** If you've used tools like Grasshopper, Dynamo, or Blender Nodes, Rete's visual scripting will feel familiar.
*   **Linear Flow:** Define parametric relationships by connecting components (nodes) through inputs and outputs, creating a clear data flow.
*   **Reactive Engine:** This is a **reactive editor**. Changes you make to the script (e.g., adding a node, modifying a parameter) automatically trigger an update in the 3D scene. You see results immediately without needing to click a "Run" button. This makes it easy to iterate and understand the modeling process.

## [Blockly Editor](https://bitbybit.dev/app?editor=blockly)

Blockly is designed for users who want to create complex 3D models, time-based simulations, or even games, using a visual block-based programming approach without writing traditional code.

**Key Features:**
*   **Visual Programming:** Compose scripts by connecting blocks that represent variables, inputs, outputs, and functions.
*   **Educational Tool:** Great for teaching programming concepts to children and beginners due to its intuitive nature and resemblance to actual code structures (more so than Rete scripts).

<Admonition type="note" title="Non-Reactive Editor">
  <p>Blockly is <strong>not</strong> a reactive editor. Scripts do not re-compute automatically when you add new components or change configuration inputs. You must click the <strong>"Run"</strong> button to see a preview of your creation in the 3D space.</p>
</Admonition>

## [Monaco (TypeScript) Editor](https://bitbybit.dev/app?editor=typescript)

The Monaco editor provides a full code-based environment using TypeScript, aimed at professional programmers.

**Key Features:**
*   **Maximum Freedom:** Fully exposes the capabilities of:
    *   BabylonJS game engine
    *   Havok physics engine
    *   BabylonJS GUI
*   **Platform API:** All platform capabilities are accessible via the global `bitbybit` variable.
*   **Versatile:** Create your own 3D experiences from scratch or even build custom editors.

<Admonition type="note" title="Non-Reactive Editor">
  <p>Similar to Blockly, Monaco is <strong>not</strong> a reactive editor. You need to click the <strong>"Run"</strong> button for your 3D scene to update after making changes to your code.</p>
</Admonition>


## Open-Source NPM Packages (MIT Licensed)

For developers who want to integrate our core geometric algorithms and functionalities directly into their own web applications, we offer a suite of **open-source NPM packages**. Our game engine-based libraries include:

*   `@bitbybit-dev/babylonjs` - [Getting Started Guide](/learn/getting-started/engines/babylonjs)
*   `@bitbybit-dev/threejs` - [Getting Started Guide](/learn/getting-started/engines/threejs)
*   `@bitbybit-dev/playcanvas` - [Getting Started Guide](/learn/getting-started/engines/playcanvas)

These allow you to leverage our CAD capabilities within your preferred 3D rendering environment.

**Key Features & Benefits:**
*   **Flexibility:** Build custom 3D tools, viewers, or applications tailored to your specific needs.
*   **Integration:** Seamlessly incorporate our computational geometry capabilities into your existing JavaScript or TypeScript projects.
*   **Community & Control:** Leverage the power of open-source, contribute, or fork as needed.
*   **MIT Licensed:** All our core NPM packages are licensed under the permissive MIT license, granting you broad freedom to use, modify, and distribute your projects.

<Admonition type="tip" title="Quick Start with Any Engine">
The fastest way to get started is using our NPX scaffolding tool:
```bash
npx @bitbybit-dev/create-app my-project --engine babylonjs
# or --engine threejs
# or --engine playcanvas
```
</Admonition>

<Admonition type="info" title="What's Included (and Not Included)">
  <p>Our NPM packages provide the foundational geometric algorithms and data structures that power our platform, along with rendering integrations for ThreeJS and BabylonJS.</p>
  <p>They generally **do not** include:</p>
  <ul>
    <li>The pre-built 3D Model Configurators (those are part of our online platform services).</li>
    <li>The proprietary advanced algorithms or specific models found in the "3D Models" section of our platform that require a subscription.</li>
    <li>The UI of our online editors (Rete, Blockly, Monaco).</li>
  </ul>
  <p>The packages offer the core engine, empowering you to build your own UIs and applications on top.</p>
</Admonition>

For a comprehensive list of available NPM packages and more detailed guides, please visit our [**NPM Packages documentation page**](/learn/npm-packages/intro).

## API Documentation

All our editors (Rete, Blockly, Monaco) are built upon the same core set of algorithms. This means that much of the underlying functionality overlaps between them. While each editor excels in its specific use cases, it's often possible to implement similar features across any of the editors.

For a comprehensive explanation of our entire API surface, which powers all these tools, please visit our dedicated API documentation site:

➡️ **[docs.bitbybit.dev](https://docs.bitbybit.dev)**

---
