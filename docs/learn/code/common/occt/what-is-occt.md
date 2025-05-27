---
sidebar_position: 1
title: "Understanding the OCCT (OpenCascade Technology) Category"
sidebar_label: OCCT Category
description: Learn about OpenCascade Technology (OCCT), its role as a powerful open-source 3D geometry kernel in Bitbybit, OpenCascade.js, and the @bitbybit-dev/occt NPM package.
tags: [occt]
---

# The OCCT (OpenCascade Technology) Category

<img 
  src="https://s.bitbybit.dev/assets/icons/white/occt-icon.svg" 
  alt="OCCT category icon with a stylized logo representation" 
  width="100"
  title="OCCT category icon" />

## What is OCCT?

[Open CASCADE Technology (OCCT)](https://dev.opencascade.org/) is a professional-grade, open-source software development platform for 3D CAD/CAM/CAE applications. At its core is a powerful **3D geometry kernel**, which is the only full-scale, open-source option of its kind.

In Bitbybit, we build various sophisticated 3D algorithms on top of this robust OCCT kernel and selectively expose its functionalities to our users through our editors and API. This means we utilize the most relevant and impactful parts of OCCT for web-based parametric design and 3D modeling, rather than the entire library. As Bitbybit evolves, we continuously expand the range of OCCT features available to our users.

## Why OCCT?

OCCT is our choice for advanced geometric modeling for several key reasons:
*   **Open-Source Leadership:** It is currently the best and arguably the only comprehensive open-source 3D [Boundary Representation (B-rep)](https://en.wikipedia.org/wiki/Boundary_representation) geometry kernel that can be effectively compiled for and used within a web browser environment.
*   **Power and Complexity:** OCCT is exceptionally powerful, capable of handling very complex 3D modeling scenarios, precision geometry, and advanced CAD operations like booleans, fillets, chamfers, and more.

## What is OpenCascade.js (OCJS)?

[OpenCascade.js (OCJS)](https://ocjs.org/) is an innovative project spearheaded by [Sebastian Alff (donalffons)](https://github.com/donalffons). He developed a Python-based toolchain that takes the original C++ library of OCCT and compiles it into **WebAssembly (WASM)**. This WASM code can then be executed efficiently in web browsers and NodeJS applications.

Bitbybit utilizes a **custom build of OCCT** that is compiled using the OpenCascade.js Docker package. This allows us to:
*   **Selectively Include Modules:** We carefully pick and choose which parts of the vast OCCT library are included in our WASM bundle.
*   **Optimize for Web:** Using the full OCCT build directly on the web is often impractical due to its very large size, which would significantly slow down the loading times of our platform and user applications. Our custom builds are optimized for web delivery.

## NPM Package: `@bitbybit-dev/occt`

Beyond just compiling OCCT to WASM, interacting directly with raw WASM code can be complex and requires specialized expertise. To address this, we have developed and maintain an NPM package called [**`@bitbybit-dev/occt`**](https://www.npmjs.com/package/@bitbybit-dev/occt).

This package:
*   **Wraps the OCCT WASM code:** It provides a higher-level, more JavaScript/TypeScript-friendly API over the underlying WASM functionalities.
*   **Simplifies Interaction:** It makes it much easier for our users and other JavaScript developers to leverage OCCT's power without needing to delve into the intricacies of WASM interoperation.
*   **Core of Bitbybit:** This package is used extensively within our own editors (TypeScript, Blockly, Rete).
*   **Open-Source and Available:** `@bitbybit-dev/occt` is open-source and readily available on the NPM package registry for you to use in your own web projects.

The OCCT category in our editors directly exposes the functionalities made accessible through this `@bitbybit-dev/occt` wrapper, allowing you to perform advanced CAD modeling operations visually or programmatically.