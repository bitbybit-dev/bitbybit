---
sidebar_position: 9
title: Bitbybit's Open Source Approach
sidebar_label: Our Approach To Open Source
description: Understand which parts of the Bitbybit platform are open source and which parts are proprietary. We believe in transparency for our community.
tags: [open-source, licensing]
---

import Admonition from '@theme/Admonition';

# Bitbybit's Open Source Approach: What's Shared and Why

At Bitbybit, we believe in the power of open source and community collaboration. However, to sustain and grow the platform, some components remain proprietary. This page aims to clearly explain our approach so you know exactly what you can access, modify, and contribute to.

**Our Guiding Principle:** If it's in our main [Bitbybit GitHub Monorepo](https://github.com/bitbybit-dev/bitbybit), it's open source!

## What IS Open Source in Bitbybit?

We are committed to open-sourcing the foundational elements that empower developers and designers. This primarily includes:

1.  **Core Logic & Geometry Libraries (NPM Packages):**
    *   The powerful algorithms and utility functions that form the backbone of Bitbybit's capabilities. These are available as NPM packages (like `@bitbybit-dev/base`, `@bitbybit-dev/occt`, `@bitbybit-dev/babylonjs`, `@bitbybit-dev/threejs` etc.) for you to use in your own projects.
    *   If you're familiar with the `bitbybit` JavaScript namespace used in our editors, the following modules (and their sub-modules) are **open source**:
        *   `bitbybit.draw`
        *   `bitbybit.babylon`
        *   `bitbybit.vector`
        *   `bitbybit.point`
        *   `bitbybit.line`
        *   `bitbybit.polyline`
        *   `bitbybit.mesh`
        *   `bitbybit.logic`
        *   `bitbybit.math`
        *   `bitbybit.lists`
        *   `bitbybit.color`
        *   `bitbybit.text`
        *   `bitbybit.dates`
        *   `bitbybit.json`
        *   `bitbybit.csv`
        *   `bitbybit.verb`
        *   `bitbybit.tag`
        *   `bitbybit.time`
        *   `bitbybit.occt`
        *   `bitbybit.manifold`
        *   `bitbybit.jscad`

2.  **Official Documentation:**
    *   This Docusaurus-powered documentation site itself is open source. We encourage contributions to improve clarity and add examples!

3.  **Application Examples:**
    *   We provide example projects and snippets demonstrating how to use our open-source NPM packages.

<Admonition type="success" title="Key Takeaway">
    The code for all the core building blocks—the mathematical and geometric engines, and fundamental utilities—is available for you to inspect, use, and even contribute to via our main GitHub monorepo.
</Admonition>

## What is NOT Open Source (Proprietary Components)?

To support the development and hosting of the Bitbybit platform, certain components are proprietary and not open source. These include:

1.  **The Bitbybit.dev Platform & UI:**
    *   **Visual Programming Editors & TypeScript Editor:** The user interfaces & all related logic for our Rete, Blockly & Monaco programming environments.
    *   **Main Website & Cloud Infrastructure:** The [bitbybit.dev](https://bitbybit.dev) website, user account systems, cloud-based algorithms, and backend services.

2.  **Code Execution "Runners":**
    *   While you can freely embed and use our "Runners" (the components that execute Bitbybit scripts) in your own websites, their internal source code is not public.
    *   We provide built versions of these Runners under an MIT license via the [bitbybit-assets repository](https://github.com/bitbybit-dev/bitbybit-assets).
    *   These Runners enable the execution of some of our proprietary advanced algorithms (like certain 3D text/font features) free of charge within the context of the Runner, but the source code for those specific advanced algorithms will remain closed together with implementation details of Runners themselves.

3.  **Visual Editor to JavaScript Conversion Logic:**
    *   The internal mechanisms that convert Rete JSON or Blockly XML into executable JavaScript are proprietary.
    *   You are, of course, free to use the JavaScript *generated* by our editors in your projects.

<Admonition type="warning" title="Important: Closed-Source Features">
    Scripts using features from our closed-source categories (like `bitbybit.things`, `bitbybit.advanced`, or `bitbybit.asset`) will **not** run if you export them to your own website or use them outside of the Bitbybit platform. These advanced features are exclusive to our platform.
</Admonition>

4.  **Specific Advanced Algorithm Namespaces:**
    *   While our core libraries are open, certain higher-level and more complex algorithms are proprietary. In the `bitbybit` JavaScript namespace, these include:
        *   Everything under `bitbybit.advanced`
        *   Everything under `bitbybit.things`
        *   Everything under `bitbybit.asset`
    *   Some algorithms within these proprietary namespaces might be executable for free for users of our editors on [bitbybit.dev](https://bitbybit.dev) or via the Runners, but this does not mean their source code is open or freely available for all uses.

<Admonition type="info" title="Important Distinction">
    Being able to *use* a feature (e.g., running a script with an advanced algorithm via our platform or a Runner) is different from having access to its *source code*.
</Admonition>

4.  **[3D Bits](/learn/3d-bits/intro) app for Shopify:**
    *   This E-Commerce application is fully proprietary and is not shared as open-source project. It is meant to serve commercial B2B customers of Bit by bit developers company. 
    *   There are no plans to open-source any part of this application such as [Viewer Editor](/learn/getting-started/viewer-editor/intro) or other related tools.

## Our Commitment to Transparency

We aim to be as transparent as possible about our open source model.
*   **The Rule of Thumb:** If you can't find the source code within the main [Bitbybit GitHub Monorepo](https://github.com/bitbybit-dev/bitbybit), it's likely proprietary and part of our intellectual property. Everything you can install via NPM - is open-source.
*   **Why This Model?** This hybrid approach allows us to offer powerful core tools to the community while funding the ongoing development, maintenance, and innovation of the broader Bitbybit platform and its advanced features.

We appreciate your understanding and your engagement with both our open source contributions and the Bitbybit platform as a whole! If you have questions about specific components, feel free to reach out.