# {{PROJECT_NAME}}

A multirotor drone built as a real CAD assembly on the open-source [Bitbybit](https://bitbybit.dev) packages and Three.js. Twenty-seven unique parts - carbon plates with hexagonal lightening holes, a lofted canopy wearing a honeycomb decal and a hatch with the logo cut through it, flat carbon arms with hexagonal cutouts, outrunner motors with their stators showing through the slots, twisted propellers, a gimbal and camera, a battery with its straps, landing legs on spring dampers with rubber pads, a GPS puck, antennas, standoffs, three sizes of socket-head bolts and the emblem inlay - are each built once on the OpenCascade kernel and then placed by an assembly tree: one sub-assembly per arm, laid out along one axis and turned into place, a landing leg defined once and placed four times, plus the airframe and the payload. Four, six or eight arms change only the placements. The viewer draws every part once and clones it per instance, spins the propellers at the speed you set and flies the drone higher the faster they turn (it floats, and lands when they stop), draws edges white on dark parts and black on light ones, colours the propellers in the finish's accent, and the downloads are the same assembly: a STEP file with the part tree, names and colours, or a GLB with the same hierarchy. Nothing runs on a server: the kernel runs in the browser as WebAssembly.

```bash
npm install
npm run dev      # http://localhost:5173
npm run smoke    # typecheck, lint, then the drone built headlessly in Node, its assembly and exports checked, a JSON summary
npm run lint     # the lint rules, at error
npm run build    # typecheck and bundle for production
```

## How it is put together

| File | Role |
|---|---|
| `src/parts.ts` | every unique part as a function of the kernel: plates, canopy, arm, motor, propeller, bolt, leg, gimbal and the rest, each in its own local frame |
| `src/model.ts` | the parameters and their limits, `layout(params)`, which places every instance without the kernel, and `buildModel`, which builds the parts and lays them out |
| `src/assembly.ts` | the assembly document (parts with colours, sub-assemblies with placements, instances) and the bill of materials read back from it |
| `src/materials.ts` | the finishes and the physically based look of every material, shared by the viewer and the exports |
| `src/kernel.ts` | the kernel types and the 4x4 matrix helpers both the document and Three.js read |
| `src/ui.ts`, `src/main.ts` | the panel and the wiring: scene, environment, prototypes and clones, spinning propellers, exports |
| `scripts/smoke.ts` | the headless check an agent or a CI job runs after every change |

The parts and the layout are written once and run in two places: in the browser they receive Bitbybit's OCCT worker, whose calls return promises; in the smoke they receive the same kernel loaded in-process. The layout is pure, so the smoke checks every arm count without building anything twice.

## Make it your product

Change a part in `src/parts.ts` and it changes everywhere it is placed. Add a part by writing its function, adding a row to `SPECS` in `src/model.ts` and placing it in `layout`. Add a parameter by giving it a range in `LIMITS`, a rule in `clampParams` and a slider in `src/ui.ts`. The finishes in `src/materials.ts` colour the viewer and the exported files alike.

## Working with an AI agent

`AGENTS.md` explains the project to a coding agent, and the free Bitbybit CAD MCP server is configured for Claude Code, Cursor and VS Code, so the agent looks the API up instead of guessing it. Ask it to change a part, then let it run `npm run smoke`.

Scaffolded by `@bitbybit-dev/create-app` {{CLI_VERSION}}. [Documentation](https://learn.bitbybit.dev), [the packages](https://github.com/bitbybit-dev/bitbybit), [Discord](https://discord.gg/GSe3VMe).
