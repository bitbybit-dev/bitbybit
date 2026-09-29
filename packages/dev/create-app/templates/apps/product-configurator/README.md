# {{PROJECT_NAME}}

A parametric product configurator built on the open-source [Bitbybit](https://bitbybit.dev) CAD packages and Three.js. The product is a planter with leaning walls, a stepped lip, a rounded rim and a foot rim: the customer sets its dimensions, wall thickness, corner radius, drainage holes and material, sees it rebuilt live in a physically based material, gets a price computed from the measured solid, and downloads it as STEP, STL or GLB. Nothing runs on a server: the OpenCascade kernel runs in the browser as WebAssembly, and there is no account, key or service in the loop.

```bash
npm install
npm run dev      # http://localhost:5173
npm run smoke    # typecheck, lint, then every preset built headlessly in Node with a JSON summary
npm run lint     # the lint rules, at error
npm run build    # typecheck and bundle for production
```

## How it is put together

| File | Role |
|---|---|
| `src/model.ts` | the geometry: `buildModel(occt, params)` returns the planter with its volume and surface area; parameter ranges and the rule that keeps them buildable |
| `src/catalog.ts` | the shop side: materials, presets and the price formula over the model's measurements |
| `src/ui.ts` | the panel: presets, sliders, material, quote and export buttons, in plain DOM |
| `src/main.ts` | the wiring: scene, kernel, debounced rebuilds, drawing, downloads |
| `scripts/smoke.ts` | the headless check an agent or a CI job runs after every change |

The geometry function is written once and runs in two places: in the browser it receives Bitbybit's OCCT worker, whose calls return promises; in the smoke it receives the same kernel loaded in-process. That is what makes the price honest and the smoke cheap: both read the same solid.

## Make it your product

Replace the planter in `src/model.ts` with your own part and its parameters, put your rates and presets in `src/catalog.ts`, and adjust the fields in `src/ui.ts`. The form is deliberately plain DOM so it drops into any page or framework; the price formula is deliberately pure so it can be tested and reused server-side. The downloads need no changes: STEP and STL come from the kernel, GLB from Three.js.

## Working with an AI agent

`AGENTS.md` explains the project to a coding agent, and the free Bitbybit CAD MCP server is configured for Claude Code, Cursor and VS Code, so the agent looks the API up instead of guessing it. Ask it to change the model, then let it run `npm run smoke`.

Scaffolded by `@bitbybit-dev/create-app` {{CLI_VERSION}}. [Documentation](https://learn.bitbybit.dev), [the packages](https://github.com/bitbybit-dev/bitbybit), [Discord](https://discord.gg/GSe3VMe).
