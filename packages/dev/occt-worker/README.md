# @bitbybit-dev/occt-worker

Non-blocking WebWorker wrapper for [@bitbybit-dev/occt](https://www.npmjs.com/package/@bitbybit-dev/occt) - run OpenCascade CAD operations asynchronously without freezing the UI.

<img src="https://app.bitbybit.dev/assets/git-cover.png" alt="Picture showing bitbybit.dev platform">

## Overview

This package exposes the OCCT 3D algorithms from Bitbybit via a WebWorker, making all CAD operations asynchronous and non-blocking. It is **independent of rendering frameworks** - use it with BabylonJS, Three.js, PlayCanvas, or your own WebGL/WebGPU pipeline.

Designed for **browser environments**. For Node.js, use [@bitbybit-dev/occt](https://www.npmjs.com/package/@bitbybit-dev/occt) directly.

## Quick Start

The fastest way to scaffold a project with OCCT pre-configured:

```bash
npx @bitbybit-dev/create-app my-project --engine babylonjs
cd my-project
npm install
npm run dev
```

This creates a complete Vite + TypeScript project with OCCT (via WebWorker), JSCAD, and Manifold kernels ready to use. [Learn more about the CLI](https://learn.bitbybit.dev/learn/npm-packages/intro).

### Need Server-Side CAD?

The CLI first asks you to choose between a **Frontend** app or a **CAD Cloud** app. Select "cloud" to scaffold a full-stack project with a backend (Hono on Cloudflare Workers, Node.js Express, or ASP.NET Core) and a React + Three.js frontend. Your API key stays on the server and the frontend proxies requests through your backend:

```bash
npx @bitbybit-dev/create-app my-cloud-project --type cloud
```

Choose from 5 backend templates: Hono + SDK, Hono + REST, Node.js + SDK, Node.js + REST, or .NET + REST. Each includes ready-to-run examples with model generation, batch operations, and [CAD pipelines](https://learn.bitbybit.dev/api/sdk/typescript/pipelines). [Learn more](https://learn.bitbybit.dev/api/cloud-api).

## Links

| Resource | URL |
|----------|-----|
| **GitHub** | https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/occt-worker |
| **Monorepo** | https://github.com/bitbybit-dev/bitbybit |
| **NPM** | https://www.npmjs.com/package/@bitbybit-dev/occt-worker |
| **Documentation** | https://learn.bitbybit.dev/learn/code/common/occt/what-is-occt |
| **Unit Test Coverage** | https://tests.bitbybit.dev/occt |

## Example Applications

| App | Source Code |
|-----|-------------|
| [Hex Shell](https://learn.bitbybit.dev/learn/npm-packages/threejs/advanced-parametric-3d-model) | [GitHub](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/threejs/hex-shell) |
| [Cup Configurator](https://app-store.bitbybit.dev/cup) | [GitHub](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/threejs/cup) |
| [Hex House Concept](https://learn.bitbybit.dev/learn/npm-packages/threejs/hex-house-concept) | [GitHub](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/threejs/hex-house-concept) |
| [Terrace Furniture](https://app-store.bitbybit.dev/terrace-furniture) (BabylonJS) | Closed source |

## Development

```bash
# Build package
tsc -p tsconfig.bitbybit.json

# Run live unit tests
npm run test

# Run live unit tests with coverage
npm run test-c-l
```

## Bitbybit Platform

Beyond NPM packages, Bitbybit offers:

- **[Visual Programming Editors](https://bitbybit.dev)** - Rete & Blockly drag-and-drop 3D modeling, plus a Monaco TypeScript editor  
- **[CAD Cloud API](https://learn.bitbybit.dev/api/cloud-api)** - Build full [pipelines](https://learn.bitbybit.dev/api/sdk/typescript/pipelines) that compose all Bitbybit algorithms, where each step can reference outputs of previous steps. Supports parametric model generation, STEP-to-glTF conversion, and complex CAD workflows via HTTP  
- **[Bitbybit Studio](https://studio.bitbybit.dev)** - A growing visual dashboard where API Key users can generate models, convert files, build [pipelines with a GUI](https://learn.bitbybit.dev/api/studio/intro), inspect tasks, and preview 3D results  
- **[3D Bits for Shopify](https://apps.shopify.com/3d-bits-1)** - Interactive 3D product configurators for e-commerce  
- **[Script Runners](https://learn.bitbybit.dev/learn/runners/intro)** - Execute visual scripts directly on your website  
- **[AI-Assisted Development](https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/intro)** - Context files for GitHub Copilot, Claude, and ChatGPT  
- **[Business & Enterprise](https://bitbybit.dev/b2b)** - We help businesses and enterprises develop custom applications and spin up optimized CAD tenant workflows on our managed servers  

## Support the Project

This package is part of the open-source Bitbybit ecosystem. Your subscription helps fund continued development.

⭐ **[Subscribe - Silver or Gold plan](https://bitbybit.dev/auth/pick-plan)** | **[Get API Key for CAD Cloud](https://bitbybit.dev/auth/pick-plan?api-keys=true)**

## Community

- [Discord](https://discord.gg/GSe3VMe)  
- [YouTube](https://www.youtube.com/@bitbybitdev?sub_confirmation=1)  
- [LinkedIn](https://www.linkedin.com/company/bitbybit-dev)  
- [X (Twitter)](https://x.com/bitbybit_dev)  
- [Blog](https://learn.bitbybit.dev/blog)  

## Major Dependencies

[OpenCascade Technology (OCCT)](https://github.com/Open-Cascade-SAS/OCCT)

## License

MIT © [Bit By Bit Developers](https://bitbybit.dev)