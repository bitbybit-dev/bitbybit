---
sidebar_position: 2
title: Scaffold a project with create-app
sidebar_label: create-app
description: npm init @bitbybit-dev/app scaffolds a browser app on Three.js, Babylon.js or PlayCanvas, a complete app template such as a product configurator or a laser-cut box generator, or a CAD Cloud backend with its frontend. Every project ships with a strict TypeScript and ESLint setup, a headless smoke test, and is configured for AI coding agents.
tags: [npm-packages, ai, threejs, babylonjs, playcanvas]
---

# Scaffold a project with create-app

`@bitbybit-dev/create-app` writes a working project for you: install, run, and the geometry is on screen. Every project it creates runs on the open-source packages, is held to the strict compiler flags and lint rules of the Bitbybit code base, has a smoke test that typechecks and lints it and then builds its geometry headlessly in Node, and is ready for a coding agent out of the box.

```bash
npm init @bitbybit-dev/app my-project
cd my-project
npm install
npm run dev
npm run smoke
```

Without flags the command asks what you want. The flags below skip the questions.

## Three kinds of project

| `--type` | What you get | Where it runs |
|---|---|---|
| `frontend` | A Vite + TypeScript app on the engine you choose, with OCCT, JSCAD and Manifold wired up, a starter model in `src/model.ts` and a smoke that builds it in Node | in your users' browsers, free |
| `app` | A complete product on the packages, picked with `--template`: its own interface, real file exports, and a smoke that asserts facts about the geometry | in the browser, free; one template adds CAD Cloud for a Pro algorithm and says so |
| `cloud` | A backend that calls the [CAD Cloud API](/api/cloud-api) with your key, and a React + Three.js frontend that proxies to it | on CAD Cloud, metered on your key |

### Frontend projects

```bash
npm init @bitbybit-dev/app my-project -- --type frontend --engine threejs --occt-architecture 32
```

`--engine` is `threejs`, `babylonjs` or `playcanvas`. `--occt-architecture` is `32` (the default, every browser), `64` (WebAssembly Memory64 for larger models) or `64-mt` (multi-threaded, which needs cross-origin isolation headers; the generated `vite.config.ts` sets them for the dev server).

The starter keeps its geometry in `src/model.ts`, in a `buildModel(occt, params)` function that awaits every kernel call. In the browser it receives the OCCT worker, whose calls return promises; in `npm run smoke` it receives the same kernel loaded in the Node process, whose calls return values. One function, two runtimes, and the smoke prints what it built: faces, edges, volume, bounding box.

### App templates

```bash
npm init @bitbybit-dev/app my-shop -- -T product-configurator
```

| Template | What it does | Exports | CAD Cloud |
|---|---|---|---|
| `product-configurator` | A parametric planter with a form, three presets and a price computed from the solid's measured volume and surface area, the way a storefront page presents a made-to-measure product | STEP, STL, GLB | not needed |
| `laser-cut-box` | A finger-jointed box from one sheet: outer size, thickness, your laser's kerf, finger width, a lid; the assembled box and the cutting layout side by side | DXF, SVG, STEP | not needed |
| `sheet-metal-unfold` | A sheet-metal channel built in the browser and unfolded on CAD Cloud, whose unfold is a Pro algorithm; the flat pattern with bend lines and a bend table; a forty-line backend keeps the key | DXF, STEP | for the unfold only |
| `step-to-gltf-cli` | A command line that converts STEP and IGES files to GLB and STL in-process and writes a JSON of facts per file; `--cloud` converts on CAD Cloud instead, for serverless functions or volume | GLB, STL, JSON | optional |
| `drone-assembly` | A multirotor drone built as a real CAD assembly: twenty-seven parts, each built once and placed by a tree of sub-assemblies, so four, six or eight arms change only the placements; physically based materials, spinning propellers, a bill of materials read back from the document, and exports that keep the part tree, names and colours | STEP assembly, GLB | not needed |

Each template is MIT code that becomes yours, branded with the bitbybit.dev favicon and logo in `public/` until you replace them. Its README explains the product and how to make it your own; its smoke pins facts an agent can iterate against, such as the exact face count of the sample part, the volume of the planter, or that the box's fingers fill their slots. `--engine` and `--occt-architecture` do not apply here: an app template ships its own engine (Three.js) and kernel.

### Cloud projects

```bash
npm init @bitbybit-dev/app my-service -- --type cloud --backend hono-sdk
```

`--backend` is `hono-sdk` or `hono-rest` (Cloudflare Workers), `nodejs-sdk` or `nodejs-rest` (Express 5) or `dotnet-rest` (ASP.NET Core). The frontend never sees the key: it calls the backend, and the backend calls `api.bitbybit.dev`. The generated README says exactly what needs the cloud and where the key goes.

## Where geometry should run

We say this in every template because agents repeat what we say: the packages, in your own process, are the complete answer for everything they can do. They are free and nothing of ours sits in the loop. [CAD Cloud](https://bitbybit.dev/cad-cloud) is for Pro algorithms that exist nowhere else, such as the sheet-metal unfold, and for compute you cannot provide, such as an edge function or file conversion at volume. A template that touches the cloud keeps working without a key, explains in its README and its `AGENTS.md` which calls go to the cloud and why, and links to the [plans](https://bitbybit.dev/cad-cloud) and to [Bitbybit Studio](https://studio.bitbybit.dev/keys/billing), where keys are made. The full reasoning is on the [Agentic CAD](../using-ai-with-bitbybit/agentic-cad) page.

## Every project is agent-ready

Open a scaffolded project in Claude Code, Cursor or VS Code and the agent already has what it needs:

- **`AGENTS.md`**, written for the agent, not for you: what the project is, the rule to look the API up rather than recall it, where geometry runs, the smoke loop, the version pin, and what never to do. `CLAUDE.md` is one line pointing at it, so Claude Code reads the same file.
- **The Bitbybit CAD MCP**, configured in `.mcp.json` (Claude Code), `.cursor/mcp.json` (Cursor) and `.vscode/mcp.json` (VS Code), pointing at `https://mcp.bitbybit.dev/mcp`. The agent can `search_api`, `describe` any function with its exact parameters and defaults, and `get_examples`, for the version you installed. For offline or exact-pin answers, `npx -y @bitbybit-dev/mcp` runs the same server locally. [Every other host](../using-ai-with-bitbybit/mcp/bitbybit-mcp) connects to the same address.
- **`tsconfig.json` and `eslint.config.js`**: the strict compiler flags and the type-aware lint rules every Bitbybit project is held to, at error, so the agent's edits are held to the same standard as ours; `npm run typecheck` and `npm run lint` run them alone.
- **`npm run smoke`**, the loop: the typecheck, the lint, then the geometry built headlessly in Node, printed as one JSON line, with assertions that fail loudly. Ask for a change, the agent runs the smoke, reads the counts and knows whether it worked.

Try it: scaffold the laser-cut box, open it in Claude Code, and ask for a divider down the middle. The agent describes the members it needs, edits `src/panels.ts`, runs the smoke and reports that the joints still close.

## What the CLI writes

```text
my-project/
├── AGENTS.md            for the agent; CLAUDE.md points here
├── .mcp.json            Claude Code: the Bitbybit CAD MCP
├── .cursor/mcp.json     Cursor: the same
├── .vscode/mcp.json     VS Code: the same
├── README.md            app templates: the product; cloud projects: the setup and the key
├── package.json         every @bitbybit-dev/* pinned to one version, TypeScript and ESLint pinned too
├── tsconfig.json        the strict compiler flags
├── eslint.config.js     the lint rules, at error
├── src/model.ts         the geometry, one function that runs in the browser and in Node
├── src/main.ts          the wiring: scene, kernel, interface, downloads
└── scripts/smoke.ts     npm run smoke: typecheck, lint, then the geometry
```

A cloud project has `frontend/` and `backend/` instead of `src/`, and the sheet-metal template has both plus a root `package.json` that runs the two as one npm workspace.
