---
sidebar_position: 2
title: "Bitbybit's Engine-Agnostic Architecture"
sidebar_label: "Engine Agnosticism"
description: "Learn about Bitbybit's core architecture, designed to be game engine agnostic, its base layer of fundamental algorithms, and its current integrations with ThreeJS, BabylonJS, and PlayCanvas."
tags: [threejs, babylonjs, playcanvas, npm-packages]
---

import Admonition from '@theme/Admonition';

# Bitbybit's Engine-Agnostic Core Architecture

At the heart of the Bitbybit platform lies a powerful and flexible core designed with **game engine agnosticism** in mind. This means our fundamental geometry processing, Computer-Aided Design (CAD) algorithms, and data structures are developed independently of any specific 3D rendering engine.

## Why Engine Agnostic?

The decision to build an engine-agnostic core offers several key advantages:

1.  **Flexibility for Developers:** You are not locked into a single rendering solution. As new web-based 3D engines emerge or existing ones evolve, Bitbybit can adapt and provide integrations without needing to rewrite its core geometric functionalities.
2.  **Focus on Core Competencies:** Our primary focus is on providing robust and efficient algorithms for computational geometry, CAD operations, and parametric design. By separating this from the rendering layer, we can dedicate resources to what we do best.
3.  **Wider Reach and Integration:** Developers using different preferred 3D engines can still leverage Bitbybit's core capabilities by using the appropriate integration layer.
4.  **Future-Proofing:** The 3D web landscape is dynamic. An agnostic core ensures that Bitbybit remains relevant and adaptable to future trends in rendering technology.
5.  **Specialized Kernels:** Our core orchestrates powerful geometry kernels like OpenCascade (OCCT), JSCAD, and Manifold. These kernels handle the heavy lifting of geometric computations and are themselves independent of rendering.

## How It Works: The Layered Approach

Bitbybit's architecture can be visualized as a layered system:

1.  **Base Layer (`@bitbybit-dev/base`):** This foundational layer provides fundamental algorithms and data structures used throughout the Bitbybit ecosystem, including within our kernel code and higher-level packages. It contains utilities for:
    *   Vector mathematics (addition, subtraction, dot/cross products, etc.)
    *   General mathematical functions.
    *   List and array manipulations.
    *   Simple geometric entities and calculations (e.g., points, lines).
    *   More complex low-level geometric algorithms like triangle-triangle intersection tests, mesh-mesh intersection logic, and other computational geometry primitives.
    This layer is pure computation and has no dependency on rendering engines or specific CAD kernels.

2.  **Geometry Kernels (OCCT, JSCAD, Manifold):** At the next level, these specialized libraries perform complex geometric calculations (e.g., booleans, fillets, extrusions, transformations) using algorithms often built upon concepts from the Base Layer. They operate on pure geometric data.

3.  **Bitbybit Core Engine:** This layer sits on top of the geometry kernels (and also utilizes the Base Layer). It provides:
    *   A unified API to interact with the different kernels.
    *   Management of data flow and operations.
    *   Helper functions and utilities for common geometric tasks.
    *   Orchestration of asynchronous operations, often running kernels in Web Workers for performance.
    This core engine produces geometric data (like vertices, faces, normals) that is ready to be rendered but doesn't handle the rendering itself.

4.  **Rendering Engine Integration Layers (e.g., for ThreeJS, BabylonJS):** This is where the connection to specific 3D rendering engines happens. These layers:
    *   Take the geometric data output by the Bitbybit Core.
    *   Translate it into the specific mesh formats, materials, and scene graph structures required by the chosen engine (e.g., `THREE.Mesh` for ThreeJS, `BABYLON.Mesh` for BabylonJS).
    *   Crucially, they implement engine-specific drawing functions like `drawAnyAsync`. This function is responsible for taking a generic geometric entity (from OCCT, JSCAD, or even simple base geometry) and creating the appropriate, renderable mesh object for that particular game engine.
    *   Handle the rendering of these objects onto the screen using the engine's capabilities.


## Current Rendering Engine Integrations

As of now, Bitbybit provides official integration layers for three of the most popular and powerful WebGL-based 3D engines:

### 1. [ThreeJS](https://threejs.org/) Integration ([`@bitbybit-dev/threejs`](https://www.npmjs.com/package/@bitbybit-dev/threejs))

*   **Overview:** ThreeJS stands as one of the - if not the - most **popular and widely adopted** WebGL libraries for creating and displaying animated 3D computer graphics directly in a web browser. It's renowned for its lightweight nature, versatility, and extensive capabilities.
*   **Community and Ecosystem:** ThreeJS boasts a **large, active, and vibrant community** of developers. This translates into:
    *   A vast number of **open-source projects, examples, and tutorials** available online, making it easy to learn and find solutions.
    *   A rich **ecosystem of additional libraries and tools** built on top of or alongside ThreeJS, extending its functionality for specific needs like physics, post-processing effects, UI integrations, and more.
*   **Bitbybit Integration:** Our `@bitbybit-dev/threejs` NPM package provides the necessary tools, including its version of `drawAnyAsync`, to take the geometric output from Bitbybit's core and render it efficiently within a ThreeJS scene. It handles the creation of `THREE.BufferGeometry`, `THREE.Mesh` and `THREE.Group`, and other ThreeJS specific objects from the kernel-generated data.
*   **Use Cases:** Ideal for developers already familiar with the ThreeJS ecosystem, those looking for a flexible and well-documented rendering library with a massive amount of community support, or projects that can benefit from its extensive array of third-party extensions.

### 2. [BabylonJS](https://babylonjs.com/) Integration ([`@bitbybit-dev/babylonjs`](https://www.npmjs.com/package/@bitbybit-dev/babylonjs))

*   **Overview:** BabylonJS is a powerful, free, and open-source 3D engine known for its comprehensive feature set, ease of use, and excellent performance. It is written in TypeScript, developed and maintained by Microsoft and a strong community, and prides itself on a **strong backward compatibility promise**, ensuring that code written for older versions generally continues to work with newer releases.
*   **Community and Ecosystem:** BabylonJS is backed by a highly active and supportive community, with a particularly vibrant official forum where developers of all levels can ask questions, share projects, and get direct assistance from both community members and the core BabylonJS team. This enthusiastic community also contributes to a growing number of external tools, extensions, and a wealth of learning resources, ensuring that users are well-supported in their development journey.
*   **Bitbybit Integration:** Our `@bitbybit-dev/babylonjs` NPM package serves the same purpose as the ThreeJS integration but targets the BabylonJS engine. Its implementation of `drawAnyAsync` translates Bitbybit's core geometric data into `BABYLON.Mesh` objects and integrates them into a BabylonJS scene.
*   **Use Cases:** A great choice for projects requiring a rich set of out-of-the-box features, physics integration, advanced rendering effects, or for developers who appreciate the stability and robust tooling offered by a TypeScript-first engine with strong corporate backing and community support.

### 3. [PlayCanvas](https://playcanvas.com/) Integration ([`@bitbybit-dev/playcanvas`](https://www.npmjs.com/package/@bitbybit-dev/playcanvas))

*   **Overview:** PlayCanvas is a high-performance WebGL game engine known for its exceptional **mobile optimization** and **cloud-based visual editor**. It uses an entity-component architecture and is built for speed, making it ideal for creating performant 3D applications that need to run smoothly across all devices.
*   **Community and Ecosystem:** PlayCanvas has a dedicated community of game developers and 3D creators. The engine is **open source** (MIT licensed) with strong commercial backing. Its focus on performance and professional game development has made it popular for web-based games, product configurators, and interactive experiences.
*   **Bitbybit Integration:** Our `@bitbybit-dev/playcanvas` NPM package provides the necessary tools, including its version of `drawAnyAsync`, to take the geometric output from Bitbybit's core and render it efficiently within a PlayCanvas application. It handles the creation of PlayCanvas entities and mesh instances from the kernel-generated data.
*   **Use Cases:** Ideal for high-performance applications, mobile-first experiences, game development, product configurators requiring smooth performance across devices, or projects where runtime efficiency and small bundle sizes are critical.

## Using the Integrations via NPM Packages

When you use Bitbybit through our [NPM packages](/learn/npm-packages/intro) in your own JavaScript/TypeScript projects, you'll choose one of these integration layers. The `BitByBitBase` class from the respective package (`@bitbybit-dev/threejs`, `@bitbybit-dev/babylonjs`, or `@bitbybit-dev/playcanvas`) is initialized with your chosen engine's scene object. From there, functions like `bitbybit.draw.drawAnyAsync()` will automatically use the correct engine-specific logic to create and render meshes.

Our visual editors (Rete, Blockly) and the Monaco TypeScript editor on the Bitbybit platform also utilize these integration layers, but they primarily use BabylonJS game engine for rendering under the hood to provide you with a seamless 3D modeling experience.

## The Future

This engine-agnostic approach, built upon a solid Base Layer and versatile Core Engine, means that as the landscape of web 3D rendering evolves, Bitbybit is well-positioned to support new engines and technologies. This ensures that your core geometric logic and creations remain portable and powerful. We are always evaluating opportunities to expand our official integrations.

---

By understanding this architecture, you can better appreciate the flexibility of the Bitbybit platform and make informed decisions when integrating our tools into your own projects.