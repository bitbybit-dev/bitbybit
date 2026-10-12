---
sidebar_position: 5
title: Platform & Products
sidebar_label: Platform & Products
description: A complete guide to Bitbybit's products - npm packages, runners, the coding editors, the Designer, CAD Cloud and Studio, the plans, the converter and inspector, 3D Bits and the MCP servers - with what each costs and when to choose it.
topic: platform.start.products
type: explanation
verified: 2026-10-11
tags: [getting-started, products, pricing, architecture]
---

import Admonition from '@theme/Admonition';
import ImageGallery from '@site/src/components/ImageGallery';

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

Runners are the bridge between our geometry engine and the rest of the web. You can execute scripts exported from the coding editors (Rete, Blockly, TypeScript), or write custom JavaScript directly - set up against our type definition files for full IntelliSense during development.

**Use when:** You want to deploy a 3D experience quickly. You are working in CodePen, StackBlitz, or a simple HTML page. You want to run geometry code on any website without a full NPM build pipeline.

[Runners Documentation →](./runners/intro)

---

## 3. The Coding Editors - Rete, Blockly and TypeScript

**Free to use · No account required**

Three browser-based editors call the same API and show the result in 3D as you work.

| Editor | Style | Best for |
| :--- | :--- | :--- |
| **Rete** | Nodes wired into a graph that reruns as you change it | Parametric design, people who know Grasshopper or Blender's nodes, large scripts in groups and modules |
| **Blockly** | Blocks snapped together | Beginners, education, learning to program |
| **TypeScript** | Code in many files, with IntelliSense over the whole API | Developers, and anything a loop or a formula says best |

Projects can be kept in the browser without an account; an account keeps them in the cloud, where they can be shared and published.

<ImageGallery
  images={['/img/blog/coding-editors-revamp/hero.webp']}
  columns={1}
  altPrefix="A drone built in the Rete editor: the node graph in groups on the left and the quadcopter on the right"
/>

A drone built step by step in all three editors is the tutorial of each: [Rete](./getting-started/rete/tutorials/drone), [Blockly](./getting-started/blockly/showcases), [TypeScript](./getting-started/typescript/showcases).

[The coding editors →](./getting-started/coding-editors)

---

## 4. The Designer - Parametric CAD by Clicking

**Gold plan · Free to view what is shared with you**

The Designer is a parametric CAD modeller in the browser: sketches, features, parts and assemblies with joints, every step kept and editable, built on the same OpenCascade kernel. Its documents are JSON that AI agents can read and write, and it exports STEP, GLB, STL and BREP. Anyone a Designer project is shared with opens it to view; creating and editing is part of Gold.

**Use when:** You want to model parts and assemblies the way CAD programs do, without writing code.

<Shot ids={["designer.showcases/robot-arm-cover", "designer.showcases/jet-engine-cover"]} columns={2} />

[The Designer →](./designer/intro)

---

## 5. CAD Cloud API - Server-Side Compute

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

## 7. Platform Plans (Silver & Gold)

**Paid · Monthly or Annual**

The [bitbybit.dev](https://bitbybit.dev) platform offers **Silver** and **Gold** plans on top of the free one. They unlock:

- **Cloud space** - practically unlimited private projects, more scripts and files per project, larger files, more storage and more backups of each script.
- **Platform algorithms** - the closed-source `bitbybit.advanced` and `bitbybit.things` algorithms that need a plan, most of the ready-made `things` models among them.
- **Community content** - projects shared with the Silver or Gold community.
- **The converter and the 3D inspector** - below.
- **The Designer** - with Gold.

[Plans](./plans) compares them line by line. You can choose a plan at [bitbybit.dev/auth/pick-plan](https://bitbybit.dev/auth/pick-plan).

**Use when:** You are actively using the online editors and want cloud project storage, the platform algorithms, community content or the Designer.

---

## 8. Converter and 3D Inspector

**Silver and Gold**

Two tools on bitbybit.dev for files that come from elsewhere. The [converter](https://bitbybit.dev/converter) turns STEP files into glTF in the browser, and the [3D inspector](https://bitbybit.dev/3d-inspector) opens glTF, GLB and STL files to look inside them. For conversions at scale, from a backend, use CAD Cloud.

**Use when:** You have a STEP model to show on the web, or a mesh file to check before you use it.

[Converter →](./tools/converter) · [3D Inspector →](./tools/3d-inspector)

---

## 9. 3D Bits for Shopify - E-Commerce Ready

**Paid · Subscription (Base / Standard / Pro)**

An end-to-end Shopify application that adds interactive 3D viewers, parametric product configurators, and Gaussian Splatting scans to your product pages. It connects directly to Shopify Variants for seamless checkout. 3D Bits has its own subscription tiers, billed through Shopify and separate from the platform Silver and Gold plans.

The app includes the **[Composer](/learn/3d-bits/composer/intro)** - a no-code tool for building 3D product configurators visually. Import your GLTF or 3DGS assets, set up variant matching, configure lighting and camera controls, and export a ready-to-use configuration without writing a single line of code.

**Use when:** You are a Shopify merchant who wants to offer 3D product customization without hiring a development team.

[3D Bits Documentation →](./3d-bits/intro)

---

## 10. MCP Servers - Bitbybit for AI Coding Agents

**Free docs server · CAD Cloud server included with any CAD Cloud plan**

AI coding agents are a first-class audience for Bitbybit. Two Model Context Protocol servers give them what they need at the moment they need it:

- **[Bitbybit CAD MCP](./using-ai-with-bitbybit/mcp/bitbybit-mcp)** - free, no account. Every function, parameter, default and example of the exact version you use, answered live to Claude Code, Codex, Cursor, VS Code, claude.ai, ChatGPT or the Claude API.
- **[Bitbybit CAD Cloud MCP](./using-ai-with-bitbybit/mcp/cad-cloud-mcp)** - with an API key, the agent runs operations, pipelines, parametric models and STEP conversions on CAD Cloud and hands you the files. It can answer "what is the volume of this STEP file" without you hosting anything.

In [the Designer](./designer/working-with-agents), an agent works beside you with the same commands you use, and each of its changes waits for your review.

An agent wrote this turbofan engine of 130 parts placed 4,853 times, looking up the API through the Bitbybit CAD MCP ([how it was made](/blog/bitbybit-mcp-ai-ready-jet-engine)):

<ImageGallery
  images={[
    '/img/blog/bitbybit-mcp-jet-engine/labelled.webp',
    '/img/blog/bitbybit-mcp-jet-engine/exploded.webp',
  ]}
  columns={2}
  altPrefix="The turbofan engine an AI agent wrote with Bitbybit: labelled on its transport stand, and exploded"
/>

**Use when:** An agent writes your Bitbybit code, or you want an agent to produce geometry and files for you directly.

[AI section →](./using-ai-with-bitbybit/intro)

---

## Quick Decision Matrix

| Your goal | Recommended product | Cost |
| :--- | :--- | :--- |
| Build a custom 3D web app | NPM Packages | Free (MIT) |
| Embed a 3D experience on any webpage | Runners | Free |
| Learn geometry programming visually | Blockly / Rete Editors | Free |
| Write TypeScript geometry code | TypeScript Editor | Free |
| Model parts and assemblies by clicking | The Designer | Gold plan |
| Use the platform algorithms in the editors | Silver / Gold plan | Paid (monthly/annual) |
| Turn a STEP file into glTF in the browser | Converter | Silver / Gold plan |
| Automate CAD processing on a server | CAD Cloud API + Studio | Paid (usage-based) |
| Add 3D products to a Shopify store | 3D Bits App | Paid (Base/Standard/Pro) |
| Get a custom CAD solution built for you | Enterprise Services | Custom pricing |
| Let an AI agent write Bitbybit code | Bitbybit CAD MCP | Free |
| Let an AI agent run geometry and hand you files | Bitbybit CAD Cloud MCP | Paid (a CAD Cloud plan) |

---

## Open-Source vs. Proprietary

All packages authored by Bitbybit in our [GitHub monorepo](https://github.com/bitbybit-dev/bitbybit) are MIT-licensed. These packages depend on third-party libraries that retain their own licenses (LGPL for OpenCASCADE, Apache 2.0 for BabylonJS, MIT for Three.js, etc.). This includes all core geometry algorithms, rendering integrations, and utility libraries available as NPM packages.

Proprietary components include the editors' user interfaces and the Designer, the Runner bundle (governed by the [Bitbybit Runner License](./runners/licensing) - free to use and deploy, but source is closed), the platform infrastructure, the platform algorithm namespaces (`bitbybit.advanced` and `bitbybit.things`), and the 3D Bits Shopify app.

For the full technical breakdown, see [Our Approach to Open Source](./open-source-approach).
