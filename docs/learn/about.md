---
sidebar_position: 2
title: About Bitbybit
sidebar_label: About Us
description: Learn about our mission to create a generic, frictionless platform for programming geometry on the browser, democratizing 3D creation, and its applications in STEM and custom web integrations.
tags: [getting-started]
---

import Admonition from '@theme/Admonition';

# About Bitbybit

We've created a generic, frictionless platform for programming geometry directly in the browser. This section explains our vision, what that means for you, and how our tools can be leveraged across education, creative industries, and custom web development.

## The Need for a New Approach

For too long, the world of 3D creation has been dominated by proprietary software packages, each tailored to specific industries. This fragmentation has historically made sharing projects and 3D experiences difficult, often involving cumbersome import/export processes across countless file formats.

Proprietary formats also created barriers to learning, obscuring the underlying concepts. Most importantly, the majority of 3D experiences remained locked behind the closed doors of engineering, architecture, or gaming companies. This limited access meant that only "experts" could understand how CAD, CAE, AEC, or Game Engine software truly functioned, hindering broader learning and innovation.

## The Spirit of the Web: Openness, Accessibility & Integration

The World Wide Web was built on a foundation of openness. From its inception, anyone could inspect the source code of a web page, fostering a culture of learning, sharing, and rapid progress across innumerable industries. This free flow of information continues to fuel global economies.

We believe that for a true 3D metaverse to flourish, and for 3D literacy to become widespread, people need tools that allow them to "inspect" 3D scenes and learn 3D concepts without friction. This accessibility is key not only for aspiring creators but also for **educators and students in STEM (Science, Technology, Engineering, and Mathematics) fields**, where understanding and manipulating 3D geometry is increasingly vital.

**Our Mission:**
We strongly believe that educated users of 3D experiences will become the next wave of creators and innovators. The knowledge of 3D programming needs to spread, and that's why "Bit By Bit Developers" exists. Our mission is to build the fundamental blocks of code that empower you to easily create 3D worlds with your own rules and forces of nature.

We don't aim to reinvent the web but to leverage its best parts and standards. This includes providing **open-source NPM packages and runners** that allow developers to integrate our powerful geometry engine directly into their own websites and custom applications, truly embodying the web's spirit of interoperability and pushing 3D education and creativity forward. We also provide managed **CAD Cloud infrastructure** so teams can run geometry operations server-side without maintaining their own compute, and a **3D Bits app for Shopify** that brings interactive 3D product experiences to e-commerce.

## Our Platform Components

Our platform is designed to provide a comprehensive environment for 3D creation, learning, and integration. It consists of:

1.  **3D Model Configurators & Parametric Editors**
2.  **Cloud Services for Collaboration and Sharing**
3.  **Online School for Structured Learning**
4.  **NPM Packages & Runners for Custom Integration**
5.  **CAD Cloud API for Server-Side Geometry**
6.  **3D Bits App for Shopify**

### 1. 3D Model Configurators & Parametric Editors

These are the core tools for creation on our platform, acting as Integrated Development Environments (IDEs) for 3D design.

*   **3D Model Configurators:** Allow quick customization of pre-defined parametric models.
    *   Access them here: [**3D Model Configurators**](https://bitbybit.dev/3d-models)
*   **Parametric Editors:**
    *   **Rete Editor:** Offers a unique visual, node-based programming experience, great for beginners and experts alike.
        *   Access it at: [**bitbybit.dev/app?editor=rete**](https://bitbybit.dev/app?editor=rete)
    *   **Blockly Editor:** Enables visual block-based programming, ideal for creating complex models or simulations without writing traditional code, and excellent for teaching programming.
        *   Access it at: [**bitbybit.dev/app?editor=blockly**](https://bitbybit.dev/app?editor=blockly)
    *   **Monaco (TypeScript) Editor:** Provides a full code-based environment using TypeScript for professional programmers seeking maximum control.
        *   Access it at: [**bitbybit.dev/app?editor=typescript**](https://bitbybit.dev/app?editor=typescript)

Below are glimpses of our editor interfaces:

![Image showing Bit By Bit Developers Blockly editor screen](https://ik.imagekit.io/bitbybit/app/assets/start/bitbybitdev-application.jpeg)
*Blockly Editor - Ideal for visual learners and STEM education.*

![Image showing Bit By Bit Developers TypeScript editor screen](https://ik.imagekit.io/bitbybit/app/assets/start/bitbybitdev-typescript-monaco-editor.jpeg)
*TypeScript (Monaco) Editor - For professional-grade development.*

![Image showing Bit By Bit Developers Rete editor screen](https://ik.imagekit.io/bitbybit/app/assets/start/bitbybitdev-rete-editor.jpeg)
*Rete Editor - Node-based parametric design.*

### 2. Cloud Services for Collaboration and Sharing

Our cloud services are crucial for enriching the platform, enabling users to save, share, and collaborate on their projects and 3D experiences.

*   **Account Creation:** To utilize cloud services, register at [**bitbybit.dev/auth/sign-up**](https://bitbybit.dev/auth/sign-up).
*   **Project Management:** Create private and public projects, persisting your scripts and assets on our cloud.
*   **Effortless Sharing:** Share your public projects with a simple link. Recipients don't need to install any software; they can open, run, and interact with your creations instantly.
*   **Learning and Adaptation:** Public projects allow others to access your scripts, learn from your work, and adapt your code for their own needs.

![Image showing project editor screen](https://miro.medium.com/max/1400/1*ynLahx1xmiSNlSdvn16oiA.png)
*Project Management Interface (Illustrative)*

### 3. Online School for Structured Learning

Our online school is dedicated to teaching programming, mathematics, virtual reality (VR), parametric design, and modern manufacturing techniques. We embrace a **STEAM (Science, Technology, Engineering, the Arts, and Mathematics)** approach in both our tools and our teaching methodology, making it a valuable resource for formal and informal education.

*   Explore our courses at: [**bitbybit.dev/school**](https://bitbybit.dev/school)

![Image showing Bit By Bit Developers school courses](https://ik.imagekit.io/bitbybit/app/assets/start/bitbybitdev-school.jpeg)
*Bit By Bit Developers School - Bridging creativity and STEM.*

### 4. NPM Packages & Runners for Custom Integration

Beyond our hosted platform, we empower developers to take our core technology into their own hands.

*   **Open-Source NPM Packages:** We provide a suite of MIT-licensed NPM packages that expose our underlying geometry kernels (OCCT, JSCAD, Manifold) and rendering integrations (e.g., for ThreeJS, BabylonJS, PlayCanvas). This allows you to build completely custom 3D applications, tools, or embed specific functionalities into your existing websites.
    *   Learn more: [**Our NPM Packages**](/learn/npm-packages/intro) {/* Link to your NPM packages page */}
*   **Runners:** For even simpler integration of pre-built Bitbybit scripts or functionalities into web pages, we offer runners that can execute these scripts within a defined context on your site.

This extensibility ensures that Bitbybit can be a foundational layer for a wide array of web-based 3D solutions, from educational tools in **STEM classrooms** to bespoke configurators on e-commerce sites.

### 5. CAD Cloud API for Server-Side Geometry

Not every 3D workflow belongs in the browser. Our **CAD Cloud API** provides fully managed compute infrastructure for running CAD kernel operations server-side. Submit a job via HTTP, poll for completion, and download the result — from any backend, in any programming language.

*   **Parametric Model Generation:** Generate 3D models on demand using our library of parametric templates.
*   **File Conversion:** Convert STEP files to glTF and other formats at scale.
*   **CAD Operations:** Run boolean operations, fillets, transforms, and full CAD pipelines without managing OCCT or WASM yourself.
*   **Bitbybit Studio:** A browser-based dashboard at [**studio.bitbybit.dev**](https://studio.bitbybit.dev) for managing API keys, testing models, converting files, and monitoring tasks.
*   **TypeScript SDK:** The [`@bitbybit-dev/cad-cloud-sdk`](https://www.npmjs.com/package/@bitbybit-dev/cad-cloud-sdk) package provides a convenient client for Node.js, Deno, Bun, and Cloudflare Workers.

Learn more in our [**CAD Cloud API documentation**](/api/cloud-api).

### 6. 3D Bits App for Shopify

For Shopify merchants, our [**3D Bits app**](https://apps.shopify.com/3d-bits-1) brings interactive 3D experiences directly to product pages without any coding.

*   **3D Product Viewers:** Display GLTF models, Gaussian Splatting scans, and other 3D assets on your storefront.
*   **Parametric Configurators:** Let customers customize products in real time using CAD-powered configurators you design in our editors.
*   **Theme App Extensions:** Drop pre-built blocks — **BITBYBIT RUNNER**, **BITBYBIT VIEWER**, and **BITBYBIT PREVIEW** — into your Shopify theme. No code changes to your theme are required.
*   **Variant Integration:** Connect 3D scene changes to Shopify product variants and custom option apps for a seamless shopping experience.

Get started with our [**3D Bits tutorials**](/learn/3d-bits/tutorials/videos-tutorials/set-up) or install the app from the [**Shopify App Store**](https://apps.shopify.com/3d-bits-1).

---

We are committed to building an open, accessible, and powerful platform for the next generation of 3D creators, educators, and developers. Join us in this journey!