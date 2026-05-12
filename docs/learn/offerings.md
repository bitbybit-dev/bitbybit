---
sidebar_position: 3
title: Platform & Products
sidebar_label: Platform & Products
description: A complete guide to Bitbybit's products, pricing tiers, and how to choose the right integration path.
tags: [getting-started, products, pricing, architecture]
---

import Admonition from '@theme/Admonition';

# Platform & Products

Bitbybit combines open-source geometry libraries with managed services and business applications. This page explains each product, who it is for, and its pricing strategy.

---

## 1. NPM Packages - The Open-Source Core

**Free · MIT License**

Our NPM packages are the foundation of everything we build. They wrap powerful geometry kernels - OpenCASCADE, JSCAD, and Manifold - in a clean TypeScript API and run them entirely in the browser via WebAssembly. No server calls, no latency. All packages authored by Bitbybit in our [GitHub monorepo](https://github.com/bitbybit-dev/bitbybit) are published under the MIT license. Note that these packages depend on third-party libraries (such as OpenCASCADE under LGPL or BabylonJS under Apache 2.0) which retain their own licenses.

**Use when:** You are building a custom web application and want full control over your geometry pipeline. You are comfortable with modern JavaScript tooling and want to integrate with Three.js, Babylon.js, or PlayCanvas.

[NPM Packages Documentation →](./npm-packages/intro)

---

## 2. Bitbybit Runners - Zero-Setup Deployment

**Free to use · [Bitbybit Runner License](./runners/licensing)**

A Runner is a single bundled JavaScript file you can load from our CDN or [host on your own infrastructure](./hosting-and-cdn). Add it to a page with a `<script>` tag and you can execute any Bitbybit script - no Node.js, no bundlers, no build step. For production applications, we recommend self-hosting the Runner and all related Bitbybit assets on your own CDN for maximum reliability.

The Runner bundle is governed by the proprietary Bitbybit Runner License - you can use and embed it freely (including commercially), but you cannot reverse-engineer or redistribute it as a standalone product. Open-source components bundled within (OCCT, Three.js, BabylonJS, etc.) retain their original licenses.

Runners are the bridge between our geometry engine and the rest of the web. You can execute scripts exported from our visual editors (Blockly, Rete, Monaco), or write custom JavaScript directly - set up against our type definition files for full IntelliSense during development.

**Use when:** You want to deploy a 3D experience quickly. You are working in CodePen, StackBlitz, or a simple HTML page. You want to run geometry code on any website without a full NPM build pipeline.

[Runners Documentation →](./runners/intro)

---

## 3. Visual IDEs - Build Without Writing Code

**Free to use · No account required**

Our browser-based editors let you create geometry logic visually and see results in real time.

| Editor | Style | Best for |
| :--- | :--- | :--- |
| **Blockly** | Drag-and-drop blocks | Beginners, education, rapid prototyping |
| **Rete** | Node-based visual programming | Experienced designers, parametric workflows |
| **Monaco** | Full TypeScript editor | Developers who want code with autocomplete |

All editors are free. Saving projects to the cloud requires an account, but you can always export and import scripts locally.

[Getting Started with Editors →](./getting-started/overview)

---

## 4. CAD Cloud API - Server-Side Compute

**Paid · API Keys · Usage-based pricing**

Not every geometry job belongs in a browser. The CAD Cloud API provides managed, scalable server infrastructure for heavy CAD operations.

Typical use cases:

- Running parametric models too large for client-side WASM
- Executing custom pipelines that compose, call and execute Bitbybit algorithms
- Generating 3D assets from backend services (Node.js, Python, or any HTTP client)
- Automating STEP to glTF file conversions

API keys are purchased and managed through [**Bitbybit Studio**](https://studio.bitbybit.dev) - the same dashboard where you can prototype CAD operations visually, monitor tasks, preview results in 3D, and track usage. API keys come in their own pricing tiers - see [Studio](https://studio.bitbybit.dev) for current plans and rates.

**Use when:** You need server-side CAD processing, batch automation, or your geometry jobs exceed what a browser can handle.

[CAD Cloud API Documentation →](/api/cloud-api)

---

## 5. Platform Subscriptions (Silver & Gold)

**Paid · Monthly or Annual**

The [bitbybit.dev](https://bitbybit.dev) platform offers **Silver** and **Gold** subscription plans for users who want to go beyond the free tier. These subscriptions unlock:

- **Private projects** - Save unlimited private projects to the cloud (free accounts have limits).
- **Assets** - upload asset files to our cloud storage and use them in your 3D projects.
- **Advanced algorithms** - Access proprietary algorithm namespaces (`bitbybit.advanced`, `bitbybit.things`, `bitbybit.asset`) within the online editors.
- **Community content** - Silver and Gold subscribers can access scripts published by other community members at their respective tier levels.

You can choose a plan at [bitbybit.dev/auth/pick-plan](https://bitbybit.dev/auth/pick-plan).

**Use when:** You are actively using the online editors and want cloud project storage, access to advanced algorithms, or community content.

---

## 6. Bitbybit Studio - CAD Cloud Dashboard & Playground

**Free to sign up · Connects to paid API plans**

[**Bitbybit Studio**](https://studio.bitbybit.dev) is your homepage for the CAD Cloud API. It is both a management dashboard and a hands-on playground where you can experiment with CAD operations before automating them via code.

**Generate parametric models.** Browse a catalog of registered parametric models, fill in typed parameters via a form, and submit a generation task with a single click.

**Convert STEP files.** Drag and drop a STEP/STP file and convert it to glTF. A simple mode sets a single precision value; an advanced mode gives you full control over 19+ options covering mesh deflection, texture embedding, coordinate transforms, scale, and more.

**Build CAD pipelines visually.** The CAD Playground lets you chain primitive operations (booleans, fillets, transforms) into a DAG-style pipeline where steps reference each other's outputs - a visual way to learn how the API's pipeline feature works before building real pipelines in code.

**Manage tasks.** All operations run asynchronously. Studio shows a live, filterable task list with real-time status polling, execution timelines, sub-task breakdowns for compound operations, and the ability to cancel or retry. Download results in any available format (STEP, glTF, STL) or preview them directly in the built-in 3D viewer.

**Monitor usage and keys.** Track compute consumption against your plan allowance, create and rotate API keys, and manage your subscription through the integrated billing portal.

Everything you prototype in Studio maps directly to the [API endpoints](/api/openapi-docs/bitbybit-cad-cloud-api) and the [TypeScript SDK](https://www.npmjs.com/package/@bitbybit-dev/cad-cloud-sdk) - so workflows you test visually can be automated programmatically without changes.

[Open Bitbybit Studio →](https://studio.bitbybit.dev) · [Studio Documentation →](/api/studio/intro)

---

## 7. 3D Bits for Shopify - E-Commerce Ready

**Paid · Subscription (Base / Standard / Pro)**

An end-to-end Shopify application that adds interactive 3D viewers, parametric product configurators, and Gaussian Splatting scans to your product pages. It connects directly to Shopify Variants for seamless checkout. 3D Bits has its own subscription tiers - separate from the platform Silver/Gold plans.

The app includes the **[Viewer Editor](./getting-started/viewer-editor/intro)** - a no-code tool for building 3D product configurators visually. Import your GLTF or 3DGS assets, set up variant matching, configure lighting and camera controls, and export a ready-to-use configuration without writing a single line of code.

**Use when:** You are a Shopify merchant who wants to offer 3D product customization without hiring a development team.

[3D Bits Documentation →](./3d-bits/intro)

---

## 8. Bitbybit School - Structured Learning

**Free & Paid courses**

Comprehensive modules covering 3D programming, mathematics, parametric design, and virtual reality concepts. Suitable for beginners through advanced practitioners.

[Bitbybit School →](https://bitbybit.dev/school)

---

## Quick Decision Matrix

| Your goal | Recommended product | Cost |
| :--- | :--- | :--- |
| Build a custom 3D web app | NPM Packages | Free (MIT) |
| Embed a 3D experience on any webpage | Runners | Free |
| Learn geometry programming visually | Blockly / Rete Editors | Free |
| Write TypeScript geometry code | Monaco Editor | Free |
| Use advanced algorithms in online editors | Silver / Gold Subscription | Paid (monthly/annual) |
| Automate CAD processing on a server | CAD Cloud API + Studio | Paid (usage-based) |
| Add 3D products to a Shopify store | 3D Bits App | Paid (Base/Standard/Pro) |
| Get a custom CAD solution built for you | Enterprise Services | Custom pricing |

---

## Open-Source vs. Proprietary

All packages authored by Bitbybit in our [GitHub monorepo](https://github.com/bitbybit-dev/bitbybit) are MIT-licensed. These packages depend on third-party libraries that retain their own licenses (LGPL for OpenCASCADE, Apache 2.0 for BabylonJS, MIT for Three.js, etc.). This includes all core geometry algorithms, rendering integrations, and utility libraries available as NPM packages.

Proprietary components include the visual editors' UI, the Runner bundle (governed by the [Bitbybit Runner License](./runners/licensing) - free to use and deploy, but source is closed), the platform infrastructure, certain advanced algorithm namespaces (`bitbybit.advanced`, `bitbybit.things`, `bitbybit.asset`), and the 3D Bits Shopify app.

For the full technical breakdown, see [Our Approach to Open Source](./open-source-approach).
