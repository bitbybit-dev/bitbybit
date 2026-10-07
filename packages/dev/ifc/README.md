# @bitbybit-dev/ifc

Write, read and author [IFC](https://technical.buildingsmart.org/standards/ifc/) building models in TypeScript, with no WebAssembly and no geometry kernel: walls joined at their corners, slabs, openings, doors and windows from types, columns, beams, materials, layer sets and property sets, written as IFC4 files that BIM tools open and edit.

<img src="https://bitbybit.dev/files/site/git-cover.png" alt="Picture showing bitbybit.dev platform">

> **Beta.** The API's names and inputs may still change before the first stable version.

## Overview

IFC (Industry Foundation Classes, ISO 16739) is the open exchange format for building information models. This package reads and writes IFC's text encoding (ISO 10303-21) itself, against a table generated from buildingSMART's IFC4 ADD2 TC1 schema, and builds standard elements the way IFC defines them: a wall is an axis, a material layer set and a height, written as a parametric extrusion; a door cuts its own opening and shares its type's geometry.

Works in **Node.js** and in the **browser**. It depends only on [@bitbybit-dev/base](https://www.npmjs.com/package/@bitbybit-dev/base).

## Quick start

```bash
npm install @bitbybit-dev/ifc
```

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

Run it with `npx tsx house.ts`. Compiled to JavaScript, run it as `node --import=extensionless/register house.js` with the [extensionless](https://www.npmjs.com/package/extensionless) package installed: the package's own imports leave out file extensions, which plain `node` does not resolve.

## How it works

- **A model is a value.** Every method that changes a model returns a new one and leaves the one it was given as it was, so keep the result and pass it on. Earlier models stay valid, which is undo for free.
- **Ids of your own.** Give an element an `id` such as `"north-wall"` and refer to it by that id later; the model derives the element's GlobalId from it and the project's GlobalId, so it is unique to the model. Wherever an existing object is named, its 22-character GlobalId works as well as its id. With a `seed` on `model.create` and a fixed `timeStamp` on `model.write`, the same calls always write the same file.
- **Units and axes.** Lengths are in the model's unit: millimetres unless the model was created with another `lengthUnit`. A length left out takes its default in that unit, so a wall is 3000 mm high in a model in millimetres and 3 m high in one in metres. Positions on a storey are given in its plan, `[x, y]`, with Z up from the storey's floor, as IFC has it.
- **Standard elements.** Walls keep their axis (`Plan/Axis`), layer set usage and a swept-solid body, and joins are recorded as `IfcRelConnectsPathElements`, so tools that edit IFC walls edit them as walls. Joins and roof clippings are worked out again from those whenever a wall changes.
- **Reading and writing.** `model.read` takes the file's text, a `Uint8Array` or an `ArrayBuffer`, indexes it without decoding it and decodes an entity only when asked, so a file of hundreds of megabytes opens in seconds. Entities left unchanged are written back as they were, with the line breaks and comments between them: `model.writeBytes` copies them byte for byte at any size, and `model.write` gives the same file as text, up to the length one JavaScript string holds. A file that breaks the encoding, holds an entity id twice or names a type or schema this library does not read fails with a `StepSyntaxError` naming the byte offset, when the broken part is first read. A value given to a model that its schema does not accept fails at once with an `IfcValueError` naming the entity and the attribute.
- **Geometry as data.** `geometry.recipe` describes the elements' solids as a recipe (`Base.Recipe`): polygons, extrusions, cuts by planes, openings and shared type geometry, every number resolved. `manifold.recipes.build` in [@bitbybit-dev/manifold](https://www.npmjs.com/package/@bitbybit-dev/manifold) builds it into one solid per element, which the renderer packages draw; `geometry.unsupported` says which elements it could not describe, and why. In a browser, [@bitbybit-dev/ifc-worker](https://www.npmjs.com/package/@bitbybit-dev/ifc-worker) runs this library in a web worker.

## What version 1 covers

| Area | Supported |
|---|---|
| Schema | IFC4 ADD2 TC1, read and written; IFC2X3 files read through IFC4 to show and query, and upgraded to IFC4 to edit |
| Spatial structure | project, site, one building, storeys raised or lowered with everything on them, spaces with their areas |
| Walls | straight walls from an axis, by thickness, layer set or wall type; centred, left or right aligned; L joins (mitred) and T joins (butt); clipping by planes and under roofs; read back as parameters and edited, also when another tool wrote them |
| Openings, doors, windows | rectangular openings in walls, moved or resized; any outline through a slab; door and window types with a lining or frame and one panel or pane, placed many times through mapped geometry |
| Slabs and roofs | outlines with holes, by thickness or layer set; flat, mono-pitch, gable and hip roofs over a rectangle |
| Columns, beams and members | rectangle, circle and I sections; braces, rafters, studs, mullions and other members |
| Editing | removing elements with what only they use, moving and turning them |
| Data | materials with colours, layer sets, property sets on elements and types set and removed value by value, any attribute read and any simple one set |
| Quantities | the base quantity sets of walls, slabs, columns, beams, members, doors, windows, openings, spaces and roofs, measured from their geometry |
| Geometry recipes | extrusions of arbitrary, rectangle, circle and I profiles, outlines of polylines, arcs and composite curves, half-space clippings (polygonal bounded ones too), boolean differences, mapped items (mirrored and scaled too), triangulated and polygonal face sets, faceted breps, surface models, openings |

## Use It With an AI Agent

The free **[Bitbybit CAD MCP](https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/mcp/bitbybit-mcp)** server lets your agent look up the exact signatures, defaults and examples of this package for the version you have installed.

## Licence

The package is MIT-licensed. Its schema table is a translation of buildingSMART International's IFC4 ADD2 TC1 EXPRESS schema, used with attribution under the notice the schema carries; see `NOTICE`. IFC and Industry Foundation Classes are names of buildingSMART International; this package is not certified by or affiliated with it.

## Links

| Resource | URL |
|----------|-----|
| **GitHub** | https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/ifc |
| **Monorepo** | https://github.com/bitbybit-dev/bitbybit |
| **NPM** | https://www.npmjs.com/package/@bitbybit-dev/ifc |
| **Documentation** | https://learn.bitbybit.dev/learn/npm-packages/ifc |
