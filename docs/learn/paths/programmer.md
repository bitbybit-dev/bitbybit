---
sidebar_position: 1
title: Software Developers
sidebar_label: Programmer
description: How to integrate Bitbybit's geometry engine into your web application, backend service, or development workflow.
tags: [developer, npm, api, integration]
---

# For Software Developers

You want to integrate 3D geometry into your stack. Here is how to get started, depending on your architecture.

## Try It First

Open the [TypeScript editor](https://bitbybit.dev/app?editor=typescript) and this [Monaco Tutorial](/learn/getting-started/typescript/how-to-code-in-monaco) to start writing code immediately. Full autocomplete, zero setup - the fastest way to test algorithms before committing to an integration approach.

## Client-Side: Run Geometry in the Browser

If your 3D logic should execute on the user's device, you have two options.

### NPM Packages (Recommended for production apps)

Install our open-source packages into your existing frontend project. They run geometry kernels via WebAssembly and integrate directly with your rendering engine of choice.

- [NPM Packages Introduction](../npm-packages/intro)
- Renderer guides: [Three.js](../npm-packages/threejs) · [Babylon.js](../npm-packages/babylonjs) · [PlayCanvas](../npm-packages/playcanvas)

### Runners (Fastest path to deployment)

Load a single JavaScript file from our CDN - no bundlers, no build step. For production applications, you can also [host the Runner and all Bitbybit assets on your own CDN](../hosting-and-cdn). Runners can execute scripts exported from our visual editors or custom JavaScript you write yourself - set them up against our type definition files for full IntelliSense. Ideal for prototypes, demos, configurators, and lightweight production deployments.

- [Runners Introduction](../runners/intro)

## Server-Side: Offload Heavy Compute

When geometry jobs are too large for a browser - batch file conversions, parametric generation at scale, backend automation - use our managed CAD Cloud API. Prototype operations and manage API keys through [Bitbybit Studio](https://studio.bitbybit.dev), then automate via code.

- [CAD Cloud API Documentation](/api/cloud-api)
- [Bitbybit Studio](/api/studio/intro)
- [TypeScript SDK on NPM](https://www.npmjs.com/package/@bitbybit-dev/cad-cloud-sdk)

## Using AI With Bitbybit

We provide MCP integrations and prompt context files to help AI assistants generate Bitbybit code more effectively.

- [AI Integration Guide](../using-ai-with-bitbybit/intro)

## Level Up

- [Introduction To Programming 3D In TypeScript](https://bitbybit.dev/school/courses/introduction-to-programming-3d-in-typescript)
- [Bitbybit For BabylonJS Developers](https://bitbybit.dev/school/courses/bitbybit-for-babylonjs-developers)
