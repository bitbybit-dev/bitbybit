# @bitbybit-dev/base

Base algorithms for [Bitbybit](https://bitbybit.dev) CAD platform - math, vectors, matrices, lists, text utilities, and shared types used across all higher-level packages.

<img src="https://app.bitbybit.dev/assets/git-cover.png" alt="Picture showing bitbybit.dev platform">

## Overview

This package provides the foundational layer for all Bitbybit CAD packages. It includes helper functions for math, text, lists, vectors, and matrix operations, along with base types used throughout the platform. This layer is kept lightweight with zero third-party dependencies.

Works in both **Node.js** and **browser** environments.

## Used By

This package is a dependency of all higher-level Bitbybit packages:

- [@bitbybit-dev/occt](https://www.npmjs.com/package/@bitbybit-dev/occt) - OpenCascade CAD kernel  
- [@bitbybit-dev/occt-worker](https://www.npmjs.com/package/@bitbybit-dev/occt-worker) - OCCT via WebWorker  
- [@bitbybit-dev/manifold](https://www.npmjs.com/package/@bitbybit-dev/manifold) - Manifold mesh booleans  
- [@bitbybit-dev/manifold-worker](https://www.npmjs.com/package/@bitbybit-dev/manifold-worker) - Manifold via WebWorker  
- [@bitbybit-dev/jscad](https://www.npmjs.com/package/@bitbybit-dev/jscad) - JSCAD solid modeling  
- [@bitbybit-dev/jscad-worker](https://www.npmjs.com/package/@bitbybit-dev/jscad-worker) - JSCAD via WebWorker  
- [@bitbybit-dev/core](https://www.npmjs.com/package/@bitbybit-dev/core) - Core assembly layer  
- [@bitbybit-dev/babylonjs](https://www.npmjs.com/package/@bitbybit-dev/babylonjs) - BabylonJS integration  
- [@bitbybit-dev/threejs](https://www.npmjs.com/package/@bitbybit-dev/threejs) - Three.js integration  
- [@bitbybit-dev/playcanvas](https://www.npmjs.com/package/@bitbybit-dev/playcanvas) - PlayCanvas integration  

## Quick Start

The fastest way to start a project using Bitbybit packages:

```bash
npx @bitbybit-dev/create-app my-project
```

This scaffolds a complete Vite + TypeScript project with all CAD kernels pre-configured. [Learn more about the CLI](https://learn.bitbybit.dev/learn/npm-packages/intro).

## Links

| Resource | URL |
|----------|-----|
| **GitHub** | https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/base |
| **Monorepo** | https://github.com/bitbybit-dev/bitbybit |
| **NPM** | https://www.npmjs.com/package/@bitbybit-dev/base |
| **Documentation** | https://learn.bitbybit.dev/learn/npm-packages/intro |
| **Unit Test Coverage** | https://tests.bitbybit.dev/base |

## Example Applications

| App | Source Code |
|-----|-------------|
| [Hex Shell](https://learn.bitbybit.dev/learn/npm-packages/threejs/advanced-parametric-3d-model) | [GitHub](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/threejs/hex-shell) |
| [Cup Configurator](https://app-store.bitbybit.dev/cup) | [GitHub](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/threejs/cup) |
| [Terrace Furniture](https://app-store.bitbybit.dev/terrace-furniture) (BabylonJS) | Closed source |

## Development

```bash
# Build package
npm run build-p

# Run unit tests with coverage
npm run test-c

# Run live unit tests with coverage on save
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

## License

MIT © [Bit By Bit Developers](https://bitbybit.dev)