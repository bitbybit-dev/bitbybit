---
sidebar_position: 3
title: IFC Building Models
sidebar_label: IFC
description: Author, write and read IFC4 building models in TypeScript with @bitbybit-dev/ifc, and draw them in Three.js, Babylon.js or PlayCanvas through the Manifold kernel.
tags: [npm-packages, ifc, manifold, threejs]
---

# IFC Building Models

IFC (Industry Foundation Classes) is the open exchange format for building information models: walls, slabs, doors and windows with the storeys that contain them, their materials, types and properties. The `@bitbybit-dev/ifc` package reads and writes IFC4 files in TypeScript and builds standard elements the way IFC defines them, so BIM tools open the files it writes and edit the walls as walls.

:::caution Beta
The IFC API is new. Its names and inputs may still change before the first stable version.
:::

## Three packages, one each for a job

| Package | What it does |
|---|---|
| `@bitbybit-dev/ifc` | Creates, changes, reads and writes models. Plain TypeScript, no WebAssembly: it runs in Node and in the browser. |
| `@bitbybit-dev/ifc-worker` | The same API behind a web worker, so a large file never blocks the page. The renderer packages include it as `bitbybit.ifc`. |
| `@bitbybit-dev/manifold` | Builds the geometry a model describes (`manifold.recipes.build`), so the renderers can draw it. |

## Writing a house in Node

```typescript
import { writeFileSync } from "node:fs";
import { Base, IFC, IFCService } from "@bitbybit-dev/ifc";

const ifc = new IFCService();
let model = ifc.model.create({ name: "House", seed: "house-1" });
model = ifc.spatial.addStorey({ model, id: "ground", name: "Ground floor", elevation: 0 });

const corners: Base.Point2[] = [[0, 0], [10000, 0], [10000, 8000], [0, 8000]];
for (let i = 0; i < 4; i++) {
    model = ifc.walls.add({
        model, storey: "ground", id: `wall-${i}`,
        start: corners[i], end: corners[(i + 1) % 4],
        height: 3000, thickness: 250, alignment: IFC.wallAlignmentEnum.right,
    });
}
for (let i = 0; i < 4; i++) {
    model = ifc.walls.connect({ model, wall: `wall-${i}`, other: `wall-${(i + 1) % 4}` });
}
model = ifc.doors.addType({ model, id: "door-90", name: "Door 900", width: 900, height: 2100 });
model = ifc.doors.add({ model, wall: "wall-0", doorType: "door-90", offset: 2000 });
model = ifc.slabs.add({ model, storey: "ground", outline: corners, thickness: 250 });

writeFileSync("house.ifc", ifc.model.writeBytes({ model, fileName: "house.ifc" }));
```

The packages' own imports leave out file extensions, as bundlers expect, so plain `node house.js` cannot load them. Run the TypeScript with `tsx` (`npx tsx house.ts`), or compile it to JavaScript and start it with the [extensionless](https://www.npmjs.com/package/extensionless) loader, `node --import=extensionless/register house.js`.

The repository's `examples/node/ifc-house` goes further with only this package: two storeys of layered walls with windows and a door, a stairwell cut through the upper floor, a gable roof the upper walls are clipped under, rooms, and the base quantities of every element, written to `house.ifc`:

```typescript
model = ifc.roofs.add({ model, storey: "first", id: "roof", name: "Roof", outline: FOOTPRINT, kind: IFC.roofKindEnum.gable, pitch: 35, baseOffset: STOREY_HEIGHT, overhang: 400, layerSet: "Roof" });
for (let i = 0; i < FOOTPRINT.length; i++) {
    model = ifc.walls.clipByRoof({ model, wall: `first-wall-${i}`, roof: "roof" });
}

model = ifc.spaces.add({ model, storey: "ground", id: "living", name: "0.01", longName: "Living room", outline: [[250, 250], [6000, 250], [6000, 7750], [250, 7750]], height: 2700 });
model = ifc.quantities.compute({ model });
```

## How the API thinks

- **A model is a value.** Every method that changes a model returns a new one and leaves the one it was given as it was. Keep the result and pass it on; keeping an earlier model is undo.
- **Ids of your own.** Give an element an `id` such as `"north-wall"` and refer to it by that id later. The model derives the element's GlobalId from it and the project's own, so it is unique to the model; wherever an existing object is named, its GlobalId works as well. With a `seed` on `model.create` and a fixed `timeStamp` on `model.write`, the same calls always write the same file.
- **Units.** Lengths are millimetres unless the model is created with another `lengthUnit`. A length you leave out takes its default in the model's unit: a wall is 3000 mm high in a model in millimetres and 3 m high in one in metres.
- **Axes.** IFC is Z-up. Positions on a storey are given in its plan, `[x, y]`, with Z up from the storey's floor. Walls take an axis from `start` to `end`; `alignment` says which side of it the layers lie on.
- **Standard elements.** A wall keeps its axis, layers and height in the file, and joins are recorded as IFC path connections, so joins and roof clippings are worked out again from them whenever a wall changes. `walls.parameters` reads a wall back, also one another tool wrote that way, and `walls.edit` changes it: its joined walls are trimmed again and its openings, doors and windows move with it.
- **Editing.** `model.remove` takes an element away with what only it uses (a wall its openings, doors and windows), `model.move` moves and turns one, `openings.edit` moves an opening or the door or window in it, and `properties.setValues` changes one object's values, copying a set it shares with others first.
- **Large files.** `model.read` indexes a file without decoding it, so hundreds of megabytes open in seconds, and an element is decoded only when asked for. Write such a model with `model.writeBytes`, which copies untouched entities byte for byte; its text would not fit one JavaScript string, which holds about 512 MB.
- **Quantities.** `quantities.compute` writes IFC's base quantity sets, such as `Qto_WallBaseQuantities`, measured from the elements' geometry: a wall's volume follows its clippings and loses its openings. They are a snapshot, so compute them again after changing elements.

## Drawing a model

The IFC package describes geometry; it does not build it. `geometry.recipe` turns a model's elements into a recipe - polygons, extrusions, cuts by planes, openings and shared door and window types - and the Manifold kernel builds the recipe into solids:

```typescript
const recipe = await bitbybit.ifc.geometry.recipe({ model });
const solids = await bitbybit.manifold.recipes.build({ recipe, adjustZtoY: true });
await bitbybit.draw.drawAnyAsync({ entity: solids });
```

The solids come back in the order of the recipe's roots, one per element, and each root is tagged with its element's `globalId`, `type`, `name` and, when its material has a colour, `rgba` - read `recipe.roots[i].tag` to colour or pick `solids[i]`. `adjustZtoY` turns IFC's Z-up model a quarter turn about X so it stands up in a Y-up scene. It is a rotation, so three.js and PlayCanvas, which are right-handed as IFC is, draw the building as it stands. A Babylon.js scene is left-handed unless told otherwise and draws the same solids mirrored; set `scene.useRightHandedSystem = true` before drawing.

In the browser, start the IFC worker from a file of your own and hand it to `initBitByBit`:

```typescript
// workers/ifc.worker.ts
import { initializationComplete, onMessageInput } from "@bitbybit-dev/ifc-worker";

initializationComplete();
addEventListener("message", ({ data }) => onMessageInput(data, postMessage));
```

```typescript
await initBitByBit(scene, bitbybit, {
    enableManifold: true,
    enableIFC: true,
    workers: {
        manifoldWorker: new Worker(new URL("./workers/manifold.worker.ts", import.meta.url), { type: "module" }),
        ifcWorker: new Worker(new URL("./workers/ifc.worker.ts", import.meta.url), { type: "module" }),
    },
});
```

`initBitByBit` hands the IFC worker to `bitbybit.ifcWorkerManager.setIfcWorker` and waits for it to start; it rejects if the worker's script cannot load. Code that calls `bitbybit.init` itself instead hands the worker over with `bitbybit.ifcWorkerManager.setIfcWorker(worker)`.

The `vite/threejs/ifc-house` example in the repository authors a modern family house for a cold climate this way: insulated rendered masonry below and a timber frame clad in charred larch boards above, cut around every opening, with a cantilever over the garden terrace and an insulated soffit under it, a warm flat roof behind a parapet with copings and a solar array on mounting rails, flashings, sills, window surrounds, downpipes, an entrance canopy, an oak stair with a steel stringer and balusters, a roof terrace, a carport, the garden's ground and trees, U-values on the envelope and thirteen rooms with their areas. It draws every element in its materials' colours, shows and hides each storey, labels the rooms, identifies a clicked element by its GlobalId, and downloads the file.

## What version 1 covers

- IFC4 (ADD2 TC1), read and written; a file read and written back keeps every unchanged entity character for character.
- A project, its site, one building, its storeys and the rooms and areas of each storey.
- Straight walls by thickness, layer set or wall type, joined at corners and T junctions, clipped under planes and roofs, read back and edited.
- Rectangular openings in walls and any outline through a slab; door and window types placed many times through shared geometry, each part (frame and glass, lining, panel and handle) in a material of its own; doors with lever or pull-bar handles.
- Slabs with holes; flat, mono-pitch, gable and hip roofs over a rectangle; columns, beams and members with rectangle, circle and I sections.
- The site around the building: terrain with holes where the building and paving meet it, and trees, as IFC geographic elements.
- Materials with colours, layer sets, property sets set and removed value by value, any simple attribute, and the base quantities of every element it builds.
