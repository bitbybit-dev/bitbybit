---
sidebar_position: 1
title: "Introduction to ThreeJS"
sidebar_label: "ThreeJS Overview"
description: "An overview of ThreeJS, a powerful JavaScript library for creating and displaying 3D graphics in web browsers, and how it's integrated with Bitbybit."
tags: [npm-packages, threejs]
---

import Admonition from '@theme/Admonition';

# Introduction to ThreeJS: Powering 3D on the Web

ThreeJS is a cross-browser JavaScript library used to create and display animated 3D computer graphics in a web browser using WebGL. If you're looking to bring interactive 3D experiences to your web projects, ThreeJS is one of the most popular and powerful tools available.

**Visit the official ThreeJS homepage:** <a href="https://threejs.org/" target="_blank" rel="noopener noreferrer">threejs.org</a>

<img 
  src="https://bitbybit.dev/assets/threejs-logo.png" 
  width="150"
  alt="ThreeJS Logo" 
  title="ThreeJS Logo" />


## What is ThreeJS Capable Of?

At its core, ThreeJS provides a high-level abstraction over WebGL (Web Graphics Library), which is a low-level JavaScript API for rendering 2D and 3D graphics within any compatible web browser without the use of plug-ins. This abstraction makes it significantly easier to work with 3D graphics on the web.

Key capabilities and features include:

*   **Scene Management:** Organizes all 3D objects, lights, and cameras into a hierarchical scene graph, making it easy to manage complex environments.
*   **Cameras:** Offers various camera types (Perspective, Orthographic) to control how the scene is viewed.
*   **Geometry:** Provides a wide range of built-in primitive geometries (cubes, spheres, planes, cylinders, tori, etc.) and supports loading custom geometries from various 3D file formats (like GLTF, OBJ, FBX).
*   **Materials & Textures:** A rich material system allows for defining the appearance of objects, including support for physically-based rendering (PBR) materials, textures, bump maps, normal maps, environment maps, and more.
*   **Lights & Shadows:** Supports different types of lights (Ambient, Directional, Point, Spot, Hemisphere) and various shadow mapping techniques to create realistic lighting and shadows.
*   **Animation:** Includes systems for animating objects, skeletons (for character animation), and morph targets.
*   **Loaders:** A comprehensive set of loaders for importing 3D models, textures, and other assets from popular 3D software.
*   **Raycasting:** Allows for picking objects in the scene by casting rays (e.g., to detect mouse clicks on 3D objects).
*   **Shaders:** Supports custom GLSL shaders for advanced visual effects and rendering techniques.
*   **Post-processing:** A framework for applying full-screen visual effects to the rendered scene (e.g., bloom, depth of field, SSAO).
*   **Renderers:** Primarily uses a WebGL renderer, but also has experimental support for other renderers like WebGPU (via compute Piplelines) and CSS3DRenderer.
*   **Extensibility:** Designed to be modular, allowing developers to easily extend its functionality.

## Why is ThreeJS So Popular?

ThreeJS has gained immense popularity for several reasons:

*   **Accessibility:** It significantly lowers the barrier to entry for WebGL development.
*   **Large and Active Community:** A vast and vibrant community means:
    *   Abundant tutorials, articles, and examples.
    *   Quick help and support through forums and Q&A sites.
    *   A wealth of open-source projects built with ThreeJS.
*   **Extensive Ecosystem:** Numerous third-party libraries, tools, and extensions are available to augment ThreeJS capabilities (e.g., physics engines, UI libraries, advanced controls).
*   **Flexibility:** It's a library, not a restrictive framework, giving developers a lot of control over their application structure.
*   **Performance:** While WebGL itself can be complex to optimize, ThreeJS provides many tools and best practices to achieve good performance.

## Learning Resources & Community

If you're interested in diving deeper into ThreeJS, here are some valuable resources:

*   **Official Documentation:** <a href="https://threejs.org/docs/" target="_blank" rel="noopener noreferrer">ThreeJS Documentation</a> - The primary source for API references and guides.
*   **Official Examples:** <a href="https://threejs.org/examples/" target="_blank" rel="noopener noreferrer">ThreeJS Examples</a> - A huge collection of live examples showcasing various features.
*   **ThreeJS Journey:** <a href="https://threejs-journey.com/" target="_blank" rel="noopener noreferrer">ThreeJS Journey</a> - A highly recommended, comprehensive course by Bruno Simon.
*   **Discover ThreeJS:** <a href="https://discoverthreejs.com/" target="_blank" rel="noopener noreferrer">Discover ThreeJS (Book)</a> - A detailed online book.
*   **ThreeJS Forum (Official):** <a href="https://discourse.threejs.org/" target="_blank" rel="noopener noreferrer">discourse.threejs.org</a> - The best place to ask questions and engage with the community.
*   **Stack Overflow:** Many ThreeJS questions are asked and answered on <a href="https://stackoverflow.com/questions/tagged/three.js" target="_blank" rel="noopener noreferrer">Stack Overflow (tagged 'three.js')</a>.
*   **GitHub Repository:** <a href="https://github.com/mrdoob/three.js/" target="_blank" rel="noopener noreferrer">mrdoob/three.js</a> - Explore the source code and contribute.

## How Bitbybit Uses ThreeJS

Bitbybit's core architecture is designed to be game engine agnostic, meaning its fundamental geometry processing and CAD algorithms are independent of any specific rendering engine. However, to display 3D content in a web browser, a rendering engine is essential.

ThreeJS is one of the rendering engines for which Bitbybit provides an official integration layer.

*   **Integration Package:** We offer the <a href="https://www.npmjs.com/package/@bitbybit-dev/threejs" target="_blank" rel="noopener noreferrer">`@bitbybit-dev/threejs`</a> NPM package. This package acts as a bridge, taking the geometric data generated by Bitbybit's core (which might originate from OCCT, JSCAD, or other kernels) and translating it into ThreeJS specific objects like `THREE.Group`, `THREE.Mesh`, `THREE.BufferGeometry`, and `THREE.Material`.
*   **Drawing Logic:** Functions within this package, notably `drawAnyAsync`, are responsible for efficiently creating and rendering these ThreeJS objects within your ThreeJS scene.

<Admonition type="info" title="ThreeJS is not used on our visual programming editors">
    ThreeJS support is only offered via our npm package. Due to historical reasons for our visual programming editors we use BabylonJS game engine - another great open-source WebGL engine.
</Admonition>

By using `@bitbybit-dev/threejs`, developers can leverage Bitbybit's powerful CAD and computational geometry features while working within the familiar and extensive ThreeJS ecosystem.

**Source Code for Bitbybit's ThreeJS Integration:**
You can find the source code for our ThreeJS integration package in our main GitHub repository, typically within a path like:
<a href="https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/threejs" target="_blank" rel="noopener noreferrer">bitbybit-dev/bitbybit/tree/master/packages/dev/threejs</a>

---

Whether you're building complex CAD tools, interactive product configurators, data visualizations, or artistic 3D experiences, understanding ThreeJS can significantly enhance your capabilities as a web developer. Bitbybit's integration aims to make it easier to combine powerful geometry generation with this versatile rendering library.