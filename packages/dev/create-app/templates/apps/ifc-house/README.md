# {{PROJECT_NAME}}

A two-storey family house written as an IFC4 building model on the free [Bitbybit](https://bitbybit.dev) packages and Three.js. The house is plain data - storeys, layered walls, windows and doors, slabs, a flat roof behind a parapet, a carport, rooms, the garden's terrain and trees - and the IFC library turns it into a real BIM file in your browser: walls that keep their axis, layers and joins, doors and windows placed from shared types and cut into their walls, charred-larch cladding boards gathered into an assembly per facade, U-values and the base quantities of every element. Manifold builds the geometry the model describes and the viewer draws it in its materials; click any part to see its IFC type, name and GlobalId, turn storeys on and off, label the rooms, and download the model as `house.ifc` or, through OpenCascade, as `house.step` nested by site, building, storey and IFC class. Nothing runs on a server: every library runs in the browser, the IFC library as plain TypeScript and the kernels as WebAssembly.

```bash
npm install
npm run dev      # http://localhost:5173
npm run smoke    # typecheck, lint, then the house written headlessly in Node, its geometry and exports checked, a JSON summary
npm run lint     # the lint rules, at error
npm run build    # typecheck and bundle for production
```

## How it is put together

| File | Role |
|---|---|
| `src/house/house-plan.ts` | the house as data: materials and layer sets, door and window types, wall runs, windows and doors, slabs, the roof, rooms, the site and the property sets, in metres |
| `src/house/details.ts` | the details generated from the plan: cladding boards cut around the openings, flashings, sills, copings, the solar array, the stair, rainwater pipes, the canopy, the carport frame |
| `src/house/build-house.ts` | `HouseAuthor`, which writes the plan into an IFC model call by call, in the order IFC needs |
| `src/scene/` | the stage (renderer, camera, light, shadows) and the drawing: Manifold builds the model's recipe and each element is drawn in its material |
| `src/ui/` | the panel, the room schedule and the room labels |
| `src/export/step-export.ts` | the STEP download: OpenCascade starts on the first click and builds the model's elements as exact shapes |
| `src/workers/` | the IFC, Manifold and OpenCascade workers, so authoring and building never block the page |
| `scripts/smoke.ts` | the headless check an agent or a CI job runs after every change |

`HouseAuthor` is written once and runs in two places: in the browser it receives `bitbybit.ifc`, the IFC library in a worker, whose calls return promises; in the smoke it receives the same library in-process.

## Make it your house

Move a wall in `WALL_RUNS`, add a window to `WINDOWS`, change a layer set's materials or thicknesses in `LAYER_SETS`, or add a room to `ROOMS` in `src/house/house-plan.ts`, then run `npm run smoke`: it writes the house again, checks that every element can be built and tells you what changed. Open the downloaded `house.ifc` in any BIM tool - BIMvision, Bonsai in Blender, Solibri, Archicad or Revit - to see the walls, rooms and properties as a BIM tool reads them.

## Working with an AI agent

`AGENTS.md` explains the project to a coding agent, and the free Bitbybit CAD MCP server is configured for Claude Code, Cursor and VS Code, so the agent looks the IFC API up instead of guessing it; its IFC guide (`get_guide` with the topic `ifc`) gives the order of calls and the mistakes to avoid. Ask it to add a room or change the facade, then let it run `npm run smoke`.

Scaffolded by `@bitbybit-dev/create-app` {{CLI_VERSION}}. [Documentation](https://learn.bitbybit.dev), [the packages](https://github.com/bitbybit-dev/bitbybit), [Discord](https://discord.gg/GSe3VMe).
