# {{PROJECT_NAME}}

A finger-jointed box generator for laser cutting, built on the open-source [Bitbybit](https://bitbybit.dev) CAD packages and Three.js. Set the outer dimensions, the sheet thickness, your laser's kerf and the finger width, toggle the lid (it gets a finger-hole handle when it has room), and download the cutting layout as DXF or SVG or the assembled box as STEP. Everything runs in the browser; no account, key or server is involved.

```bash
npm install
npm run dev      # http://localhost:5173
npm run smoke    # typecheck, lint, then four boxes built headlessly in Node with the joints checked
npm run lint     # the lint rules, at error
npm run build    # typecheck and bundle for production
```

## How it is put together

| File | Role |
|---|---|
| `src/panels.ts` | the panels, their joints, the finger outlines with kerf compensation, and the sheet layout; pure functions, no kernel |
| `src/model.ts` | `buildModel(occt, params)`: every outline as a planar face, laid out on the sheet, and as a solid in the assembled box |
| `src/exports.ts` | the layout as SVG, written from the outlines |
| `src/ui.ts` | the panel: sliders, the lid toggle, the two views, the facts, the export buttons |
| `src/main.ts` | the wiring: scene, kernel, debounced rebuilds, DXF and STEP through the kernel |
| `scripts/smoke.ts` | the headless check: part counts, planar parts, DXF paths, no overlaps on the sheet, the box's extents, and that the panels tile the hollow box exactly, so every finger fills its slot |

The outline of a panel is computed once, in plain TypeScript, and used three times: as the face the laser cuts, positioned on the sheet for the layout, and extruded and placed for the 3D preview. The smoke's tiling check is the proof that the joint arithmetic is right: with the kerf at zero, panels that interlock perfectly add up to exactly the hollow box's volume and share none of it.

## Make it your product

Change the joint rule in `src/panels.ts` (`panelSpecs` decides which edges get fingers and which get slots; `outlineFor` draws them), add dividers or holes as further panels or as cuts in `src/model.ts`, and adjust the fields in `src/ui.ts`. Keep the smoke green while you do: it fails the moment the joints stop closing.

## Working with an AI agent

`AGENTS.md` explains the project to a coding agent, and the free Bitbybit CAD MCP server is configured for Claude Code, Cursor and VS Code, so the agent looks the API up instead of guessing it. Ask it for a divider or a hinge slot, then let it run `npm run smoke`.

Scaffolded by `@bitbybit-dev/create-app` {{CLI_VERSION}}. [Documentation](https://learn.bitbybit.dev), [the packages](https://github.com/bitbybit-dev/bitbybit), [Discord](https://discord.gg/GSe3VMe).
