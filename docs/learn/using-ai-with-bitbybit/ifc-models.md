---
sidebar_position: 6
title: "IFC building models: writing BIM with an agent"
sidebar_label: IFC building models
description: How an agent writes IFC4 building models with Bitbybit - storeys, layered walls with their joins, doors, windows, slabs, roofs, rooms, properties and quantities - in Node or in the browser, how it checks them, and the mistakes to avoid.
tags: [ai, ifc]
---

# IFC building models: writing BIM with an agent

IFC is the open exchange format for building information models: storeys with the walls, slabs, doors and windows they contain, their materials, types, properties and quantities. Bitbybit writes IFC4 files that other BIM tools open as buildings, not as loose geometry. This page is written for agents as much as for people: the [Bitbybit CAD MCP](./mcp/bitbybit-mcp) returns its sections through `get_guide`, and its `describe` and `get_examples` tools answer for every `ifc` method by its dotted path, such as `ifc.walls.add`. The [IFC package page](../npm-packages/ifc) covers drawing and STEP export in more depth.

## IFC models in Bitbybit

- **`@bitbybit-dev/ifc` is plain TypeScript.** It needs no WebAssembly, no worker and no CAD kernel, so it runs in Node, in a serverless function and in the browser alike. It creates, reads, changes and writes models.
- **A building is made from standard elements.** A wall keeps its axis, height and layers in the file, and its joins are recorded as IFC connections, so a tool that understands IFC edits it as a wall. The same is true of slabs, openings, doors and windows, roofs, columns, beams and members.
- **Geometry is described, not built.** `ifc.geometry.recipe` turns a model into data a kernel builds: Manifold for fast meshes to draw, OpenCascade for exact shapes and STEP files.
- **The API is beta.** Names and inputs may still change before the first stable version. Look every method up with `describe` rather than from memory.
- **It runs locally.** Everything here is in the MIT npm packages; nothing about IFC needs CAD Cloud.
- **Not yet.** There is no stair element (a stairwell is an opening in a slab, and flights can be built from members), no curved wall or arched opening, and no building services (ducts, pipes, cables).

## Two ways to call the IFC API

The methods have the same paths and the same inputs everywhere. What differs is how they answer.

- **In Node, or anywhere with the package alone**, the methods are synchronous and a model is a value you hold:

  ```typescript
  import { IFC, IFCService } from "@bitbybit-dev/ifc";

  const ifc = new IFCService();
  let model = ifc.model.create({ name: "House", seed: "house-1" });
  model = ifc.spatial.addStorey({ model, id: "ground", name: "Ground floor", elevation: 0 });
  ```

  Run the TypeScript with `tsx` (`npx tsx house.ts`): the package's own imports leave out file extensions, as bundlers expect, so plain `node` cannot load them. Write the file with `writeFileSync("house.ifc", ifc.model.writeBytes({ model, fileName: "house.ifc" }))`.
- **In the browser, through the renderer packages, and in scripts in the Bitbybit editors**, the same methods run in the IFC worker as `bitbybit.ifc`. Every call is asynchronous, and a model is a handle to the model the worker holds:

  ```typescript
  let model = await bitbybit.ifc.model.create({ name: "House", seed: "house-1" });
  model = await bitbybit.ifc.spatial.addStorey({ model, id: "ground", name: "Ground floor", elevation: 0 });
  ```

`describe` shows the worker form: `add(inputs: Inputs.IFC.AddWallDto<Inputs.IFC.IfcModelPointer>): Promise<Inputs.IFC.IfcModelPointer>`. In Node read it as `add(inputs: AddWallDto<IfcModel>): IfcModel`. Enumerations are `IFC.wallAlignmentEnum.left` in Node and `Bit.Inputs.IFC.wallAlignmentEnum.left` in the editors; as plain values they are the enum's value, which is camelCase for the library's own enums (`"left"`, `"gable"`, `"iShape"`) and IFC's own token for IFC's (`"STANDARD"`, `"USERDEFINED"`, `"SINGLE_SWING_LEFT"`). `describe` lists such an enum as `one of standard = "STANDARD", solidWall = "SOLIDWALL", ...`: the key you write after the enum's name, and the value it stands for; its `default` names the key. A method's answer also names the types it returns, such as `Inputs.IFC.SpaceInfoDto` for `spaces.list`; `describe` with that name lists their fields.

## How the IFC API thinks

- **A model is a value.** Every method that changes a model returns a new one and leaves the one it was given as it was. Assign the result each time: `model = ifc.walls.add({ model, ... })`. A call whose result is dropped changes nothing.
- **Your own ids.** Give elements, storeys and types an `id` such as `"north-wall"` and refer to them by it in later calls; the model derives each GlobalId from it. `model.globalIdOf` turns an id into its GlobalId. Ids must be unique in a model.
- **The same file every run.** A `seed` on `model.create` and a fixed `timeStamp` on `model.write` or `model.writeBytes` make the same calls write the same bytes, so a change shows as a diff.
- **Units.** Lengths are millimetres unless `model.create` is given another `lengthUnit` (`centimetre`, `metre`). A length left out takes its default in the model's unit: a wall is 3000 mm high in a millimetre model and 3 m high in a metre one. Angles are in degrees.
- **Axes.** IFC is Z up. Positions on a storey are its plan, `[x, y]`, and heights go up from the storey's floor; a storey's `elevation` sets where that floor is. Beams and members take `[x, y, z]` points in the same frame. Never swap Y and Z for a Y-up viewer in the model: drawing does that (`adjustZtoY`).
- **Outlines** are lists of `[x, y]` corners without the first repeated at the end. Either winding works for slabs, spaces and holes.
- **Layer order.** A layer set lists its layers from a wall's right face, looking from its start to its end, so walls drawn counterclockwise around a plan list them outside first; a slab's and a roof's from the top down.

## The order to write a building in

Later calls refer to what earlier calls made, so this order avoids every "not found" error:

1. **The model and its storeys**: `model.create`, then `spatial.addStorey` per floor with its `elevation`.
2. **Materials and layer sets**: `materials.add` (a name, an optional `color` such as `"#b5651d"`), then `materials.addLayerSet` with `layers: [{ material: "Brick", thickness: 235 }, { material: "Plaster", thickness: 15 }]`. Walls, wall types, slabs and roofs refer to a layer set by its name; a layer set's thicknesses add up to the element's thickness.
3. **Types**: `walls.addType`, `doors.addType` and `windows.addType`. A door or window type is placed many times through shared geometry, so define each size once.
4. **Walls**: `walls.add` per straight wall, from `start` to `end`, with a `height` and a `layerSet` or a `thickness`. `alignment` says which side of the axis the layers lie on, looking from `start` to `end`: walls drawn counterclockwise around a plan lie inside it with `left` and outside with `right`, so with `left` the plan's corners are the building's outer faces.
5. **Joins**: `walls.connect` for every pair of walls that meet, at a corner or where one ends against another's side. Unjoined walls overlap or leave gaps at the corners. A wall that ends against another, such as a partition against an outside wall, may end anywhere within that wall's thickness: the join cuts it back to the face.
6. **Doors, windows and openings**: `doors.add` and `windows.add` place a type in a wall `offset` along its axis from its start, and cut their own opening; do not add an opening for them as well. `openings.add` cuts an empty opening. A window's `sill` defaults to 900 mm above the wall's base, a door's to 0. Keep an opening at least the wall's thickness away from a mitred corner: the offset runs along the axis, and the face on the other side of a corner is shorter by the thickness. A door type's `operation` names its hinges as IFC does, seen from the wall's right side, its start on your left: `singleSwingLeft` is hinged toward the wall's start, `singleSwingRight` toward its end, and the handle is on the other edge.
7. **Slabs**: `slabs.add` with an `outline`, `thickness` or `layerSet` and `topOffset` above the storey's floor; `holes` or `openings.addInSlab` for stairwells and shafts. A floor over a storey whose walls run up to it fits between their inner faces: an outline at the outer faces puts the slab and the top of the walls in the same space.
8. **Roofs**: `roofs.add` over a rectangle of four corners (`kind`: `flat`, `monoPitch`, `gable`, `hip`), with `baseOffset` the height of the walls under it and an `overhang`. A mono-pitch roof rises from the outline's first side and a gable's ridge runs along it. Then `walls.clipByRoof` for each wall it covers. A wall under a slope is added taller than `baseOffset`, up to the ridge at most, and clipping cuts it to the slope, a gable wall to its triangle; a wall added exactly at `baseOffset` is left square, with a wedge open under the slope.
9. **Structure and detail**: `columns.add`, `beams.add` and `members.add` with a `profile` (`rectangle`, `circle`, `iShape`); `assemblies.add` to group parts such as a facade's cladding boards.
10. **Rooms**: `spaces.add` per room, with its `name` (the room number), `longName` and `height`.
11. **Data**: `properties.addSet`, such as `Pset_WallCommon` with `IsExternal: true` shared by every outside wall. A property's value is written as a label, boolean, integer or real as it is, or as the `type` it names: any of IFC4's `IfcValue` types, such as `IfcText`, `IfcLengthMeasure` or `IfcThermalTransmittanceMeasure` for a U-value.
12. **Quantities last**: `quantities.compute` measures every element as it is now; compute again after any later change.
13. **Write**: `model.writeBytes` (any size) or `model.write` (the text).

## A house to start from

[A family house in IFC](/learn/code/common/ifc/family-house) shows where this order leads: a whole two-storey house written with the same calls, which opens in the TypeScript editor.

{/* shot: code.ifc.family-house/morning */}

A two-storey house in Node, with the package alone. It follows the order above and writes a file other BIM tools open:

```typescript
import { writeFileSync } from "node:fs";
import { Base, IFC, IFCService } from "@bitbybit-dev/ifc";

const FOOTPRINT: Base.Point2[] = [[0, 0], [10000, 0], [10000, 8000], [0, 8000]];
const INSIDE: Base.Point2[] = [[250, 250], [9750, 250], [9750, 7750], [250, 7750]];
const STOREY_HEIGHT = 3000;
const STOREYS = ["ground", "first"];

const ifc = new IFCService();
let model = ifc.model.create({ name: "House", seed: "house-1" });
model = ifc.spatial.addStorey({ model, id: "ground", name: "Ground floor", elevation: 0 });
model = ifc.spatial.addStorey({ model, id: "first", name: "First floor", elevation: STOREY_HEIGHT });

model = ifc.materials.add({ model, name: "Brick", category: "brick", color: "#b5651d" });
model = ifc.materials.add({ model, name: "Plaster", category: "plaster", color: "#f2efe6" });
model = ifc.materials.add({ model, name: "Concrete", category: "concrete", color: "#9a9a9a" });
model = ifc.materials.add({ model, name: "Tiles", category: "tile", color: "#7a2e1d" });
model = ifc.materials.addLayerSet({ model, name: "Exterior wall", layers: [{ material: "Brick", thickness: 235 }, { material: "Plaster", thickness: 15 }] });
model = ifc.materials.addLayerSet({ model, name: "Floor", layers: [{ material: "Concrete", thickness: 200 }] });
model = ifc.materials.addLayerSet({ model, name: "Roof", layers: [{ material: "Tiles", thickness: 220 }] });
model = ifc.doors.addType({ model, id: "door", name: "Door 900", width: 900, height: 2100 });
model = ifc.windows.addType({ model, id: "window", name: "Window 1200", width: 1200, height: 1400 });

for (const storey of STOREYS) {
    for (let i = 0; i < FOOTPRINT.length; i++) {
        const underRoof = i % 2 === 1 ? 6500 : 3400;
        model = ifc.walls.add({
            model, storey, id: `${storey}-wall-${i}`, start: FOOTPRINT[i], end: FOOTPRINT[(i + 1) % FOOTPRINT.length],
            height: storey === "first" ? underRoof : STOREY_HEIGHT, layerSet: "Exterior wall", alignment: IFC.wallAlignmentEnum.left,
        });
    }
    for (let i = 0; i < FOOTPRINT.length; i++) {
        model = ifc.walls.connect({ model, wall: `${storey}-wall-${i}`, other: `${storey}-wall-${(i + 1) % FOOTPRINT.length}` });
    }
    model = ifc.slabs.add({ model, storey, id: `${storey}-floor`, outline: storey === "ground" ? FOOTPRINT : INSIDE, layerSet: "Floor" });
    model = ifc.windows.add({ model, wall: `${storey}-wall-2`, windowType: "window", offset: 3000 });
    model = ifc.properties.addSet({
        model, elements: FOOTPRINT.map((_, i) => `${storey}-wall-${i}`), name: "Pset_WallCommon",
        properties: [{ name: "IsExternal", value: true }, { name: "LoadBearing", value: true }],
    });
}
model = ifc.doors.add({ model, wall: "ground-wall-0", doorType: "door", id: "front-door", offset: 4500 });
model = ifc.openings.addInSlab({ model, slab: "first-floor", id: "stairwell", outline: [[7000, 5000], [9750, 5000], [9750, 6200], [7000, 6200]] });
model = ifc.roofs.add({ model, storey: "first", id: "roof", outline: FOOTPRINT, kind: IFC.roofKindEnum.gable, pitch: 35, baseOffset: STOREY_HEIGHT, overhang: 400, layerSet: "Roof" });
for (let i = 0; i < FOOTPRINT.length; i++) {
    model = ifc.walls.clipByRoof({ model, wall: `first-wall-${i}`, roof: "roof" });
}
model = ifc.spaces.add({ model, storey: "ground", id: "living", name: "0.01", longName: "Living room", outline: [[250, 250], [9750, 250], [9750, 7750], [250, 7750]], height: 2700 });
model = ifc.quantities.compute({ model });

writeFileSync("house.ifc", ifc.model.writeBytes({ model, fileName: "house.ifc", timeStamp: "2026-01-01T12:00:00" }));
```

The walls run counterclockwise with `left` alignment, so they stand inside the footprint and their layers are listed outside first: brick, then plaster. The ground floor's slab lies under the walls and the first floor's between their inner faces (`INSIDE`), so no slab cuts into a wall. The gable's ridge runs along the outline's first side, so the short walls (`wall-1` and `wall-3`) are the gables: they are added 6.5 m high and clipped to the roof's triangle, and the long walls are added 3.4 m high and clipped to the slope, so the roof meets every wall without a gap. Each storey's windows, door and stairwell refer to walls and slabs by the ids they were given.

## Checking an IFC model

Read the model back before handing it over; every check here is cheap:

- `model.summary` gives the schema, whether the model can be changed, its length unit as `millimetresPerUnit`, the storeys and how many elements of each type there are (`elementCounts`). Compare the counts with what the prompt asked for: rooms are not among them (count them with `spaces.list`), and a sloping roof's planes are `IfcSlab` parts of its `IfcRoof`, so they count as slabs too.
- `geometry.unsupported` lists every element whose geometry cannot be described, with the reason. It should be empty for a model made with these methods.
- `walls.parameters` reads one wall back: its axis, height, thickness and layers, the walls it is joined to, its openings and its clippings. A corner missing from `joins` is a `walls.connect` that was forgotten; a join names the other wall by its GlobalId, which `model.globalIdOf` gives for an id of your own.
- `spaces.list` gives every room with its area, in the model's length unit squared (square millimetres in a millimetre model). `quantities.get` gives an element's measured quantities after `quantities.compute`, as IFC's base quantities are written: lengths in the model's unit, areas in square metres and volumes in cubic metres.
- A method refuses what it cannot do and says why, before anything changes: an opening wider than its wall, a door type that was never added, a wall id used twice. Read the message, fix the call and run the script again.
- Where Python with IfcOpenShell is available, its validator checks the file against the IFC4 schema and its rules: `python -m ifcopenshell.validate --rules house.ifc`. A file made with these methods passes it.

## Reading and changing IFC files

- `model.read` takes the text or the bytes of an `.ifc` file, such as `readFileSync("in.ifc")` or `await file.arrayBuffer()`. It indexes the file without decoding it, so files of hundreds of megabytes open in seconds.
- `model.elements` lists objects by IFC type, its subtypes included (`IfcWall`, `IfcBuildingElement`, or `IfcElement` for every element), optionally of one storey; `model.element` describes one; `model.getAttribute` and `model.setAttribute` read and set one attribute such as `Name` or `Tag`.
- `properties.getSets` reads an object's property sets; `properties.setValues` changes one object's values, copying a set it shares with others first, so the others keep theirs.
- `walls.parameters` and `walls.edit` read and change walls other tools wrote with an axis and layers; joined walls are trimmed again and the wall's openings move with it. `model.move` moves and turns any element, and `model.remove` takes it away with what only it uses.
- **IFC2X3 files** are read, queried and written back, but not changed: `model.upgradeToIfc4` gives a model that can be.
- `model.writeBytes` writes untouched entities back byte for byte, so a small change to a large file stays small. Prefer it to `model.write` for files read from elsewhere: a JavaScript string holds about 512 MB.

## Drawing an IFC model and exporting STEP

In the browser, a model's recipe is built by a kernel and drawn:

```typescript
const recipe = await bitbybit.ifc.geometry.recipe({ model });
const solids = await bitbybit.manifold.recipes.build({ recipe, adjustZtoY: true });
await bitbybit.draw.drawAnyAsync({ entity: solids });
```

The solids come back one per root of the recipe, and `recipe.roots[i].tag` carries the element's `globalId`, `type`, `name` and, when its material has a colour, `rgba`. With the OpenCascade worker enabled as well, `ifc.geometry.toShapes` gives exact shapes and `ifc.geometry.toStep` the bytes of a STEP file, nested by site, building, storey and IFC class: `await bitbybit.ifc.geometry.toStep({ model, name: "House", fileName: "house.step" })`. A Babylon.js scene is left-handed unless told otherwise; set `scene.useRightHandedSystem = true` before drawing, or the building is mirrored.

## Mistakes to avoid in IFC models

- **Dropping the returned model.** `ifc.walls.add({ model, ... })` without `model =` changes nothing; the next call starts from the model before it.
- **Mixing the two call forms.** In Node the package's methods are synchronous; `bitbybit.ifc` in the browser and in the editors is asynchronous and needs `await` on every call.
- **Guessed units.** A wall `height: 3` in a millimetre model is 3 mm high. Give lengths in the model's unit, millimetres unless the model says otherwise.
- **Y as up.** Plans are `[x, y]` and up is Z. A point written as `[x, height, y]` puts the building on its side.
- **Unjoined walls.** Every corner and T junction needs `walls.connect`. Without it the walls overlap or leave a gap there, and other BIM tools show them as walls that do not meet.
- **An opening for a door or window.** `doors.add` and `windows.add` cut their own; an extra `openings.add` in the same place is a second hole.
- **Openings that do not fit.** An opening past the end of its wall is refused, but two that overlap, or one whose `sill` plus height rises above the wall, are not: keep the openings of a wall apart and under its top.
- **The roof before its walls are clipped, or a roof that is not a rectangle.** `roofs.add` takes four corners, and walls are clipped with `walls.clipByRoof` after the roof exists.
- **Quantities computed too early.** They are a snapshot; compute them once the model is finished, or again after a change.
- **An assembly of a user-defined kind without words.** `assemblies.add` with `predefinedType` `userDefined` needs an `objectType` that says what it is, such as `"Cladding"`.
- **Changing an IFC2X3 model.** It refuses every change until `model.upgradeToIfc4`.
- **Fields that do not exist.** Look each method up with `describe`; its inputs, defaults and ranges come from the index, not from memory.
