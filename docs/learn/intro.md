---
sidebar_position: 1
title: Start Your Journey
sidebar_label: Welcome
description: Bitbybit is a platform for parametric 3D on the web - CAD kernels in the browser and on servers, four editors, runners, npm packages, CAD Cloud, AI agents and 3D Bits for Shopify. Find what it offers and where to start.
topic: platform.start.welcome
type: landing
verified: 2026-10-11
tags: [getting-started, overview, architecture]
---

import PlatformMap from '@site/src/components/PlatformMap';
import ImageGallery from '@site/src/components/ImageGallery';

# Welcome to Bitbybit

Bitbybit is a platform for **parametric 3D on the web**. You describe a shape by its rules - its sizes, its steps, how one part follows another - and changing a rule rebuilds it. Underneath sit real CAD kernels, OpenCascade, Manifold, JSCAD and an IFC library, compiled to run in a browser, in Node or on our servers.

<ImageGallery
  images={['/img/blog/bitbybit-mcp-jet-engine/hero.webp']}
  columns={1}
  altPrefix="A two-spool turbofan engine built with Bitbybit, exploded, its upper casing lifted and see-through"
/>

You can reach them in the way that suits you:

- **Wire nodes** in [Rete](/learn/getting-started/rete), **snap blocks** in [Blockly](/learn/getting-started/blockly) or **write code** in the [TypeScript editor](/learn/getting-started/typescript), all free and in the browser.
- **Model by clicking** in [the Designer](/learn/designer/intro), a parametric CAD modeller of the Gold plan.
- **Build it into your own product** with the free [npm packages](/learn/npm-packages/intro), a one-file [runner](/learn/runners/intro), or the [CAD Cloud API](/api/cloud-api) on our servers.
- **Let an AI agent do it**, with the exact API from the [Bitbybit CAD MCP](/learn/using-ai-with-bitbybit/mcp/bitbybit-mcp).
- **Sell it**: [3D Bits](/learn/3d-bits/intro) puts 3D viewers and product configurators on Shopify stores.

## Built with Bitbybit

Every model on this page is parametric: change a number and it is built again, exactly, ready to export to STEP or glTF.

### A jet engine, written by an AI agent

A two-spool turbofan with 130 unique parts placed 4,853 times: blades seated in slotted disks, bolted flanges, a casing that opens, an exploded view and a transport stand. An AI coding agent wrote it in TypeScript, looking up the exact API through the [Bitbybit CAD MCP](/learn/using-ai-with-bitbybit/mcp/bitbybit-mcp), and it now opens as a multi-file project in the TypeScript editor, with sliders for the fan blades, the stages and the throttle, labels, a bill of materials and STEP and GLB downloads. [Read how it was made](/blog/bitbybit-mcp-ai-ready-jet-engine).

<ImageGallery
  images={[
    '/img/blog/bitbybit-mcp-jet-engine/editor-project.webp',
    '/img/blog/bitbybit-mcp-jet-engine/labelled.webp',
    '/img/blog/bitbybit-mcp-jet-engine/core-detail.webp',
    '/img/blog/bitbybit-mcp-jet-engine/exploded-transparent.webp',
  ]}
  columns={2}
  altPrefix="The turbofan engine: in the TypeScript editor with its controls, labelled on its stand, the compressor and turbine stages close up, and exploded"
/>

### A drone, three ways

A quadcopter with its frame, arms, motors, propellers, canopy, landing gear and camera, built step by step in each of the three coding editors: as a graph of nodes and modules in [Rete](/learn/getting-started/rete/tutorials/drone), as blocks in [Blockly](/learn/getting-started/blockly/showcases) and as code in [TypeScript](/learn/getting-started/typescript/showcases). The same model, the same API, whichever way of working suits you.

<ImageGallery
  images={['/img/blog/coding-editors-revamp/hero.webp']}
  columns={1}
  altPrefix="The drone built in the Rete editor: the node graph on the left, organised in groups, and the finished quadcopter on the right"
/>

<Shot ids={["rete.start.showcases/drone", "blockly.start.showcases/drone", "typescript.start.showcases/drone"]} columns={3} />

### Assemblies in the Designer

A robot arm of 77 components and 73 joints, the same jet engine as design documents with its casing that opens, and a desk arm built step by step: modelled by clicking in [the Designer](/learn/designer/intro), where every sketch, feature and joint stays editable. [Open the showcases](/learn/designer/showcases).

<Shot id="designer.tour/window" />

<Shot ids={["designer.showcases/robot-arm-cover", "designer.showcases/jet-engine-cover", "designer.showcases/desk-arm-cover"]} columns={3} />

### A house as BIM

A two-storey family house written as an IFC building model, the open format architects' tools share: walls with their layers, floors, windows and doors, a flat roof with a solar array, a carport and a garden, each part knowing what it is. It is a TypeScript project you can open and change, drawn under a sky whose sun follows a slider. [Open the family house](/learn/code/common/ifc/family-house).

<Shot id="code.ifc.family-house/editor" />

<Shot ids={["code.ifc.family-house/afternoon", "code.ifc.family-house/dusk"]} columns={2} />

## Designing with AI

We think AI will be a large part of how things are designed, and that it fits parametric design better than anything before it. A parametric model is a set of rules, sizes, steps and relations, and rules are what a language model reads and writes well. An agent that writes rules gives you a model you can still open, measure, change and export to STEP, not a mesh you can only look at. You stay the designer: you say what you want, judge what comes back, and change a parameter rather than start again.

Bitbybit is built for that way of working:

- **Agents know the exact API.** The free [Bitbybit CAD MCP](/learn/using-ai-with-bitbybit/mcp/bitbybit-mcp) lets Claude Code, Codex, Cursor, VS Code, claude.ai or ChatGPT look up every function, parameter and default while they write, instead of guessing from memory. The jet engine above was written this way.
- **Agents can run geometry.** With a key, the [CAD Cloud MCP](/learn/using-ai-with-bitbybit/mcp/cad-cloud-mcp) lets an agent build models on our servers and hand back STEP, glTF and mesh files.
- **Agents work beside you in the Designer.** An agent runs the same commands you do, you watch it sketch and extrude in the view, and each of its changes waits in a Review tab until you keep it or undo it. [Working with agents](/learn/designer/working-with-agents).
- **Designs are data an agent can write.** A [design document](/learn/using-ai-with-bitbybit/design-documents) holds a part or an assembly as parameters, sketches, features and joints in order; an agent writes one, you import it and keep editing it by hand.

Here an agent has changed a parameter of the desk arm in the Designer, and its change waits in the Review tab to be kept or undone:

<Shot id="designer.agents/working" />

[Using AI with Bitbybit](/learn/using-ai-with-bitbybit/intro) shows how to connect an agent, and the [AI path](./paths/ai-agent) where to start.

## The platform at a glance

From where you work, at the top, down to the kernels that compute. Every box links to its page; the packages under a box are what it ships as on npm.

<PlatformMap />

[How Bitbybit works](/learn/how-it-works) walks through these layers, and the [glossary](/learn/glossary) explains the words they use.

## See it in action

Our founder, Matas Ubarevičius, walks through the core ideas behind the platform:

<div className="responsive-video-container">
  <iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/noc6Rg6tMe0"
    title="Essential Introduction To BITBYBIT"
    frameBorder="0"
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
    allowFullScreen>
  </iframe>
</div>

## Choose your path

| You are... | What you need | Start here |
| :--- | :--- | :--- |
| **A software developer** | 3D geometry in your web app or backend | [Programmer path](./paths/programmer) |
| **An enterprise or B2B team** | CAD infrastructure, or a solution built for you | [Enterprise path](./paths/enterprise) |
| **A designer** | Parametric form, with nodes, blocks, code or clicks | [Designer path](./paths/designer) |
| **A Shopify merchant** | 3D products and configurators in your store | [Shopify merchant path](./paths/shopify-merchant) |
| **An educator** | Geometry and programming in the classroom | [Educator path](./paths/educator) |
| **An AI agent, or the person driving one** | The exact API and, with a key, hosted CAD compute | [AI path](./paths/ai-agent) |

New to all of it? Read [Getting Started](/learn/getting-started/overview): projects and scripts, then your first script in an editor.

## Into your own website

Most people who build with Bitbybit want 3D in a website of their own. There are five ways in, from no code to a full integration:

1. **Embed a published project.** Publish a project on bitbybit.dev and embed its preview with an `<iframe>`; no code at all. [Publishing](/learn/getting-started/basics/projects/publish).
2. **A runner.** One script file from our CDN, or [hosted by you](./hosting-and-cdn), runs a script exported from an editor, or your own JavaScript, on any page. [Runners](./runners/intro).
3. **npm packages.** The free packages in your React, Angular, Vue, Svelte or plain JavaScript app, with BabylonJS, ThreeJS or PlayCanvas; `npx @bitbybit-dev/create-app` sets one up. [npm packages](./npm-packages/intro).
4. **CAD Cloud.** Your backend asks our servers for STEP, glTF or mesh files, through the REST API or the TypeScript SDK. [CAD Cloud API](/api/cloud-api).
5. **An AI agent.** Claude Code, Codex, Cursor, VS Code, claude.ai or ChatGPT look up the exact API while they write, and with a key run geometry on CAD Cloud. [Using AI](./using-ai-with-bitbybit/intro).

In this walk-through, recorded for version 1.0, Matas explains these integration paths with live examples:

<div className="responsive-video-container">
  <iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/vz1v18qoxC0"
    title="Bitbybit v1.0.0 - New Base for Cloud and Web CAD"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
    allowFullScreen>
  </iframe>
</div>

## Free and paid

The core is free: the geometry packages are MIT-licensed, with open-source TypeScript (OpenCascade and the other libraries they use keep their own licenses, and the C++ layer of the Bitbybit OCCT Kernel they ship is closed source), the runners are free to deploy, and the three coding editors and the Bitbybit CAD MCP cost nothing.

- **Silver and Gold** add cloud space, the platform algorithms that need a plan, community projects, the converter and the 3D inspector; Gold adds the Designer. [Plans](./plans) compares them.
- **CAD Cloud** is sold as API keys with a monthly allowance of compute.
- **3D Bits** has its own Shopify plans.
- **Enterprise** work is custom development and managed infrastructure.

The paid products fund the free core. [Platform & Products](./offerings) describes each one, and [our approach to open source](./open-source-approach) says what is open.

## Next steps

- [How Bitbybit works](./how-it-works) - kernels, workers, drawing and where your code runs.
- [Getting Started](./getting-started/overview) - projects, scripts and the editors.
- [The Designer](./designer/intro) - parametric CAD by clicking.
- [Code](./code/intro) - the API, one namespace at a time.
- [Our vision](./about-us) - why Bitbybit exists.
