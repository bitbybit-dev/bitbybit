# Bitbybit Monorepo

Open-source 3D CAD algorithms for the web - MIT licensed. This monorepo contains all Bitbybit NPM packages plus example applications.

## License

Source code in `packages/`, `languages/`, and `examples/` is [MIT licensed](./LICENSE). Documentation text in `docs/` is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Logos, trademarks, and media assets are **not** open-source — see [CONTENT-LICENSE.md](./CONTENT-LICENSE.md) for details.

# [FULL PLATFORM AT BITBYBIT.DEV](https://bitbybit.dev)   
# [LEARN BITBYBIT](https://learn.bitbybit.dev)   

Essential introduction by Matas   
[![Introduction by Matas Ubarevicius](https://img.youtube.com/vi/noc6Rg6tMe0/maxresdefault.jpg)](https://www.youtube.com/watch?v=noc6Rg6tMe0)

<img src="https://app.bitbybit.dev/assets/git-cover.png" alt="Picture showing bitbybit.dev platform">

## Quick Start

Scaffold a fully-configured 3D CAD project in seconds:

```bash
npx @bitbybit-dev/create-app my-project
```

The CLI first asks you to pick an **app type**:

- **Frontend** - Browser-based 3D/CAD app. Choose a game engine (Three.js, Babylon.js, or PlayCanvas) and OCCT architecture (32-bit, 64-bit, or 64-bit MT). You get a Vite + TypeScript project with all three CAD kernels (OCCT, JSCAD, Manifold) pre-configured.
- **CAD Cloud** - Full-stack project with server-side CAD via our [CAD Cloud API](https://learn.bitbybit.dev/api/cloud-api). Choose a backend template (Hono + SDK, Hono + REST, Node.js + SDK, Node.js + REST, or .NET + REST). You get a React + Three.js frontend that proxies requests through your backend - your API key never leaves the server.

```bash
cd my-project
npm install
npm run dev
```

## Support the Mission

⭐ **[Subscribe - Silver or Gold plan](https://bitbybit.dev/auth/pick-plan)** | **[Get API Key for CAD Cloud](https://bitbybit.dev/auth/pick-plan?api-keys=true)**

Check out [3D Bits app for Shopify](https://apps.shopify.com/3d-bits-1) - interactive 3D product configurators for e-commerce.

Your subscription directly funds continued open-source development of these packages.

## Important Topics

| Topic | Link |
|-------|------|
| Getting Started | https://learn.bitbybit.dev/learn/getting-started/overview |
| NPM Packages Intro | https://learn.bitbybit.dev/learn/npm-packages/intro |
| Integrate with Three.js | https://learn.bitbybit.dev/learn/npm-packages/threejs/start-with-three-js |
| Integrate with BabylonJS | https://learn.bitbybit.dev/learn/npm-packages/babylonjs/start-with-babylon-js |
| Integrate with PlayCanvas | https://learn.bitbybit.dev/learn/npm-packages/playcanvas/start-with-playcanvas |
| CAD Cloud API | https://learn.bitbybit.dev/api/cloud-api |
| Script Runners | https://learn.bitbybit.dev/learn/runners/intro |
| 3D Bits for Shopify | https://learn.bitbybit.dev/learn/3d-bits/intro |
| AI-Assisted Development | https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/intro |
| Unit Testing Approach | https://learn.bitbybit.dev/learn/github/unit-tests |
| Live Unit Test Coverage | https://learn.bitbybit.dev/learn/github/live-unit-test-coverage |
| Blog | https://learn.bitbybit.dev/blog |

## NPM Packages

| Package | Description |
|---------|-------------|
| [@bitbybit-dev/babylonjs](https://www.npmjs.com/package/@bitbybit-dev/babylonjs) | BabylonJS engine integration for drawing CAD geometry |
| [@bitbybit-dev/threejs](https://www.npmjs.com/package/@bitbybit-dev/threejs) | Three.js engine integration for drawing CAD geometry |
| [@bitbybit-dev/playcanvas](https://www.npmjs.com/package/@bitbybit-dev/playcanvas) | PlayCanvas engine integration for drawing CAD geometry |
| [@bitbybit-dev/core](https://www.npmjs.com/package/@bitbybit-dev/core) | Core assembly layer combining all CAD kernels |
| [@bitbybit-dev/occt](https://www.npmjs.com/package/@bitbybit-dev/occt) | OpenCascade CAD kernel (works in Node.js & browser) |
| [@bitbybit-dev/occt-worker](https://www.npmjs.com/package/@bitbybit-dev/occt-worker) | OCCT via WebWorker (non-blocking, browser only) |
| [@bitbybit-dev/manifold](https://www.npmjs.com/package/@bitbybit-dev/manifold) | Manifold fast mesh booleans (works in Node.js & browser) |
| [@bitbybit-dev/manifold-worker](https://www.npmjs.com/package/@bitbybit-dev/manifold-worker) | Manifold via WebWorker (non-blocking, browser only) |
| [@bitbybit-dev/jscad](https://www.npmjs.com/package/@bitbybit-dev/jscad) | JSCAD solid modeling (works in Node.js & browser) |
| [@bitbybit-dev/jscad-worker](https://www.npmjs.com/package/@bitbybit-dev/jscad-worker) | JSCAD via WebWorker (non-blocking, browser only) |
| [@bitbybit-dev/base](https://www.npmjs.com/package/@bitbybit-dev/base) | Base math/vector/matrix algorithms used by all packages |
| [@bitbybit-dev/create-app](https://www.npmjs.com/package/@bitbybit-dev/create-app) | CLI tool to scaffold 3D/CAD projects |
| [@bitbybit-dev/cad-cloud-sdk](https://www.npmjs.com/package/@bitbybit-dev/cad-cloud-sdk) | TypeScript SDK for the CAD Cloud API |

## NPM Package Architecture

<img src="https://app.bitbybit.dev/assets/npm-package-architecture.jpeg" alt="Schematic diagram showing the architecture of all NPM packages">

## Example Applications

All examples live in the [`examples/`](https://github.com/bitbybit-dev/bitbybit/tree/master/examples) directory of this monorepo:

| App | Engine | Source Code |
|-----|--------|-------------|
| [Hex Shell](https://learn.bitbybit.dev/learn/npm-packages/threejs/advanced-parametric-3d-model) | Three.js | [GitHub](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/threejs/hex-shell) |
| [Cup Configurator](https://app-store.bitbybit.dev/cup) | Three.js | [GitHub](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/threejs/cup) |
| [Hex House Concept](https://learn.bitbybit.dev/learn/npm-packages/threejs/hex-house-concept) | Three.js | [GitHub](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/threejs/hex-house-concept) |
| Starter Template | BabylonJS | [GitHub](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/babylonjs/starter-template) |
| Starter Template | Three.js | [GitHub](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/threejs/starter-template) |
| Starter Template | PlayCanvas | [GitHub](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/playcanvas/starter-template) |
| [Terrace Furniture](https://app-store.bitbybit.dev/terrace-furniture) | BabylonJS | Closed source |

## Bitbybit Platform

Beyond these open-source NPM packages, the Bitbybit platform includes:

- **[Visual Programming Editors](https://bitbybit.dev)** - Rete & Blockly drag-and-drop 3D modeling, plus a Monaco TypeScript editor with full IntelliSense  
- **[CAD Cloud API](https://learn.bitbybit.dev/api/cloud-api)** - Build full [pipelines](https://learn.bitbybit.dev/api/sdk/typescript/pipelines) that compose all Bitbybit algorithms, where each step can reference outputs of previous steps. Supports parametric model generation, STEP-to-glTF conversion, and complex CAD workflows via HTTP. [TypeScript SDK available](https://www.npmjs.com/package/@bitbybit-dev/cad-cloud-sdk).  
- **[Bitbybit Studio](https://studio.bitbybit.dev)** - A growing visual dashboard where API Key users can generate models, convert files, build [pipelines with a GUI](https://learn.bitbybit.dev/api/studio/intro), inspect tasks, and preview 3D results  
- **[3D Bits for Shopify](https://apps.shopify.com/3d-bits-1)** - Interactive 3D product configurators for your Shopify store. [Documentation](https://learn.bitbybit.dev/learn/3d-bits/intro).  
- **[Script Runners](https://learn.bitbybit.dev/learn/runners/intro)** - Execute Rete/Blockly/TypeScript scripts directly on your website without writing code  
- **[AI-Assisted Development](https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/intro)** - Context files for GitHub Copilot, Claude, and ChatGPT. [MCP integration](https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/mcp/context-7) available.  
- **[Business & Enterprise](https://bitbybit.dev/b2b)** - We help businesses and enterprises develop custom applications and spin up optimized CAD tenant workflows on our managed servers  

## Community

- [Discord](https://discord.gg/GSe3VMe)  
- [YouTube](https://www.youtube.com/@bitbybitdev?sub_confirmation=1)  
- [LinkedIn](https://www.linkedin.com/company/bitbybit-dev)  
- [X (Twitter)](https://x.com/bitbybit_dev)  
- [Instagram](https://www.instagram.com/bitbybit.dev)  
- [Facebook](https://www.facebook.com/bitbybitdev)  
- [Blog](https://learn.bitbybit.dev/blog)  

# Development Setup

## Contributions

If you're interested in contributing please check our [Contribution guidelines](https://github.com/bitbybit-dev/bitbybit/blob/master/CONTRIBUTING.md) & [code of conduct](https://github.com/bitbybit-dev/bitbybit/blob/master/CODE_OF_CONDUCT.md)

## First Time Setup and Testing

For first-time developers working on this project, follow these steps to set up the development environment and run all unit tests:

### Prerequisites
- Node.js (v16 or higher recommended)
- npm (comes with Node.js)
- Git

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/bitbybit-dev/bitbybit.git
   cd bitbybit
   ```

2. Run the complete first-time setup (this will install all dependencies, build all packages, and run all unit tests):
   ```bash
   npm run first-time-setup
   ```

### Available Commands

- `npm run first-time-setup` - Complete setup for new developers (installs dependencies, builds packages, runs tests)
- `npm run setup` - Install dependencies and build all packages without running tests
- `npm run setup-and-test` - Install dependencies, build packages, and run all unit tests
- `npm run test` - Run all unit tests (requires packages to be built first)
- `npm run ci-packages` - Install dependencies for all packages
- `npm run build-packages` - Build all packages
- `npm run rebuild-all-packages` - Clean and rebuild all packages

### Running Individual Package Tests
You can also run tests for individual packages:
- `npm run test-base` - Test base package
- `npm run test-occt` - Test OCCT package  
- `npm run test-core` - Test core package
- `npm run test-jscad` - Test JSCAD package
- `npm run test-manifold` - Test Manifold package
- `npm run test-threejs` - Test ThreeJS package
- `npm run test-playcanvas` - Test PlayCanvas package
- `npm run test-babylonjs` - Test BabylonJS package

### Troubleshooting
If you encounter issues during setup:
1. Make sure you have Node.js v16+ installed
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and package-lock.json, then run `npm install`

## Major Dependencies
BabylonJS, ThreeJS, PlayCanvas, OpenCascade, Manifold, JSCAD, Verbnurbs