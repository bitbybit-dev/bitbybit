# @bitbybit-dev/create-app

**Scaffold a Bit By Bit Developers 3D/CAD project: a browser app on one of three game engines, a complete app template ready for a coding agent, or a CAD Cloud backend with its frontend.**

Every project it creates runs on the open-source [Bitbybit](https://bitbybit.dev) CAD packages (OpenCascade, JSCAD and Manifold compiled to WebAssembly, MIT licensed), ships with a headless smoke test behind a strict TypeScript configuration and the ESLint rules the Bitbybit code base is held to, and comes configured for AI coding agents: an `AGENTS.md` that explains the project, and the free [Bitbybit CAD MCP](https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/mcp/bitbybit-mcp) server set up for Claude Code, Cursor and VS Code, so the agent looks the API up instead of guessing it.

## Quick start

```bash
npm init @bitbybit-dev/app my-project              # interactive
npm init @bitbybit-dev/app my-project -- -T laser-cut-box
npx @bitbybit-dev/create-app my-project --type frontend --engine threejs
```

Then:

```bash
cd my-project
npm install
npm run dev      # the app
npm run smoke    # builds the geometry headlessly in Node and prints a JSON summary
```

## Three kinds of project

| `--type` | What you get | Runs on |
|---|---|---|
| `frontend` | A Vite + TypeScript app on Three.js, Babylon.js or PlayCanvas with all three kernels wired up, a starter model in `src/model.ts` and a smoke that builds it in Node | your users' browsers, free |
| `app` | A complete product on the packages, chosen with `--template` (below): its own UI, real exports, a smoke with domain assertions | the browser, free; one template adds CAD Cloud for a Pro algorithm and says so |
| `cloud` | A backend that calls the CAD Cloud REST API with your key (Hono on Cloudflare Workers, Express on Node, or ASP.NET Core) and a React + Three.js frontend that proxies to it | CAD Cloud, metered on your key |

### App templates (`--type app --template <id>`, or `-T <id>`)

| Template | What it does | Exports | Needs CAD Cloud? |
|---|---|---|---|
| `product-configurator` | A parametric planter with a form, presets, and a price computed from the solid's measured volume and surface area | STEP, STL, GLB | no |
| `laser-cut-box` | A finger-jointed box from one sheet: thickness, kerf and finger width; the assembled box and the cutting layout | DXF, SVG, STEP | no |
| `sheet-metal-unfold` | A channel built in the browser and unfolded on CAD Cloud, a Pro algorithm; flat pattern with bend lines and a bend table; a forty-line backend keeps the key | DXF, STEP | yes, for the unfold only |
| `step-to-gltf-cli` | Batch STEP and IGES to GLB and STL in-process, with a JSON of facts per file; `--cloud` for serverless or volume | GLB, STL, JSON | optional |
| `drone-assembly` | A multirotor as a real assembly: twenty-seven parts placed through sub-assemblies (four, six or eight arms change only the placements), physically based materials, spinning propellers, a bill of materials | STEP assembly, GLB | no |

Every scaffold ships bitbybit.dev's favicon and logo in `public/`, linked from its page; replace them with your own. Every app template is MIT code you own. Its `README.md` explains the product, its `AGENTS.md` explains it to an agent, and its smoke pins facts about the geometry (face counts, volumes, extents, that a box's joints close) so an agent has something to iterate against. `--engine` and `--occt-architecture` do not apply to app templates: each ships its own engine (Three.js) and kernel.

### Frontend options

```bash
npm init @bitbybit-dev/app my-project -- --type frontend --engine babylonjs --occt-architecture 32
```

- `--engine`: `threejs`, `babylonjs` or `playcanvas`
- `--occt-architecture`: `32` (default, every browser), `64` (WebAssembly Memory64, larger models), `64-mt` (multi-threaded; needs `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy` headers, which the generated `vite.config.ts` sets for the dev server)

### Cloud options

```bash
npm init @bitbybit-dev/app my-project -- --type cloud --backend hono-sdk
```

- `--backend`: `hono-sdk`, `hono-rest`, `nodejs-sdk`, `nodejs-rest` or `dotnet-rest`

The generated README says what needs CAD Cloud and where to get a key; the key goes in the backend's own secret file (`.dev.vars`, `.env` or `appsettings.Development.json`), never in the frontend.

## Where geometry runs

The packages, in your own process, are the complete answer for everything they can do: they are free, and nothing of ours sits in the loop. [CAD Cloud](https://bitbybit.dev/cad-cloud) exists for Pro algorithms that are available nowhere else (the sheet-metal unfold, for one) and for compute you cannot provide, such as an edge function or file conversion at volume. Every template that touches the cloud explains this in its README and its `AGENTS.md`, keeps working without a key, and links to the [plans](https://bitbybit.dev/cad-cloud) and to [Bitbybit Studio](https://studio.bitbybit.dev/keys/billing), where keys are made.

## Every project is agent-ready

Each scaffold contains:

- `AGENTS.md`, written for the agent: what the project is, the look-the-API-up rule, where geometry runs, the smoke loop, and what never to do. `CLAUDE.md` points at it.
- `.mcp.json`, `.cursor/mcp.json` and `.vscode/mcp.json`, all pointing at `https://mcp.bitbybit.dev/mcp`, the free docs server. Open the project in Claude Code, Cursor or VS Code and the agent can `describe` any function of the version you installed. Other hosts: [every configuration](https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/mcp/bitbybit-mcp).
- `tsconfig.json` and `eslint.config.js`: the strict compiler flags and the type-aware lint rules every Bitbybit project is held to, at error; `npm run typecheck` and `npm run lint` run them alone.
- `npm run smoke`: the typecheck, the lint, then the geometry built headlessly in Node on the in-process kernel, printed as one JSON line, with assertions that fail loudly. Ask the agent for a change; it runs the smoke and reads the counts.

For offline or exact-version answers, `npx -y @bitbybit-dev/mcp` runs the same server locally, pinned to the packages in the project's `node_modules`.

## Links

- [Documentation](https://learn.bitbybit.dev) and [the npm packages](https://learn.bitbybit.dev/learn/npm-packages/intro)
- [Using AI with Bitbybit](https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/intro)
- [CAD Cloud](https://bitbybit.dev/cad-cloud) and the [REST API](https://learn.bitbybit.dev/api/cloud-api)
- [Discord](https://discord.gg/GSe3VMe), [issues](https://github.com/bitbybit-dev/bitbybit/issues), [the monorepo](https://github.com/bitbybit-dev/bitbybit)

## License

MIT © [Bit By Bit Developers](https://bitbybit.dev)
