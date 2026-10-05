---
sidebar_position: 5
title: "Design documents: parametric models as JSON"
sidebar_label: Design documents
description: How to write a Bitbybit design document - parameters, sketches, features, references that survive edits, parts and assemblies - and the validate, build and fix loop an agent should follow.
tags: [ai, occt]
---

# Design documents: parametric models as JSON

A design document is a parametric CAD model kept as plain JSON: named parameters, an ordered list of features, and the parts they make. `bitbybit.occt.design.build` turns it into shapes with the OpenCascade kernel, in the browser or in Node, and on CAD Cloud as one pipeline step that returns the parts as one STEP or glTF file, with the build's report. This page is written for agents as much as for people: the [Bitbybit CAD MCP](./mcp/bitbybit-mcp) returns its sections through `get_guide`, and the JSON Schema below lets an editor or an agent check a document before it is built.

The format is experimental: each release publishes its own schema, for this one at `https://git-cdn.bitbybit.dev/v1.4.1/schemas/design-document/experimental.json` (also in the `@bitbybit-dev/occt` package, under `schemas/design-document/`). Documents carry `"schemaVersion": 1`, and a document written today is not migrated when the format is released.

## What a design document is

- **A part document** builds parts from features: `parameters`, `configurations`, `features`, `parts`, `materials` and `assets`.
- **An assembly document** (`"kind": "assembly"`) places parts of other documents as `components`, moved by `joints` between their connectors. It has no geometry of its own.
- **The document is the truth.** Shapes are always rebuilt from it and never stored in it. Every feature has a stable `id` that is never reused, and later features refer to earlier ones by those ids.
- **Every number may be an expression** over the parameters, such as `"width / 2 + 3"`.
- **Nothing is evaluated as code.** Expressions are read by a small arithmetic parser, and an `operation` feature calls a public method of the package by its dotted path.
- **Unknown properties are errors.** A misspelt field is reported, never ignored. Free data goes into `extras`.

## The loop an agent should follow

1. **Write the document** against the schema. Name it in `$schema` so editors validate it as you type.
2. **Validate it**: `await bitbybit.occt.design.validate({ document })` returns every problem with a JSON pointer to it, such as `/features/3/edges/count`. It builds nothing, so it is cheap. Fix every issue before building.
3. **Build it**: `await bitbybit.occt.design.build({ document })` returns the `parts` with their shapes, a `report` with one entry per feature (`ok`, `failed` with messages, `skipped` because something it used failed, `suppressed`), and `issues` for parts, looks and connectors.
4. **Read the report.** A failed feature names why: a reference that found 3 faces where it expects 4, a fillet radius the faces cannot take, an expression that divides by 0. Change the document and build again; features that did not change are reused, so the next build is fast.
5. **Draw the result**: `await bitbybit.draw.drawAnyAsync({ entity: result })` draws every part with its looks, each placement an instance.
6. **Try other values** with `parameters` or a `configuration` on the same call, without editing the document: `build({ document, parameters: { width: 80 } })`.

Fillets fail most often, and one tool helps with them: `design.probeFillet` reports which edges a fillet's reference finds and the largest radius that builds.

## A first document

A plate with two holes and rounded top edges, made of aluminium, with a part number written from its size:

```json title="bracket.design.json"
{
  "$schema": "https://git-cdn.bitbybit.dev/v1.4.1/schemas/design-document/experimental.json",
  "schemaVersion": 1,
  "id": "3f1c2a7e-8b4d-4c1a-9e2f-5d6b7a8c9e01",
  "meta": { "name": "Bracket" },
  "parameters": {
    "width": { "value": 60, "min": 30, "unit": "mm" },
    "depth": { "value": 40, "min": 20, "unit": "mm" },
    "thickness": { "value": 6, "min": 2, "unit": "mm" },
    "hole": { "value": 6, "min": 2, "max": 12, "unit": "mm" }
  },
  "features": [
    {
      "id": "base", "type": "sketch", "on": { "plane": "XY" }, "start": [0, 0],
      "pen": [
        { "type": "hLine", "id": "south", "length": "width" },
        { "type": "vLine", "id": "east", "length": "depth" },
        { "type": "hLine", "id": "north", "length": "-width" },
        { "type": "close", "id": "west" }
      ]
    },
    { "id": "plate", "type": "extrude", "profile": "base", "distance": "thickness" },
    {
      "id": "holes", "type": "hole", "body": "plate",
      "on": { "of": "plate", "role": "end", "count": 1 },
      "at": [{ "id": "left", "x": 10, "y": "depth / 2" }, { "id": "right", "x": "width - 10", "y": "depth / 2" }],
      "diameter": "hole"
    },
    {
      "id": "round", "type": "fillet", "body": "plate", "radius": 2,
      "edges": { "between": [{ "of": "plate", "role": "end" }, { "of": "plate", "role": "side" }], "count": 4 }
    }
  ],
  "materials": [
    { "id": "aluminium", "density": 2700, "appearance": { "color": "#b0b4b8", "metallic": 0.8, "roughness": 0.4 } }
  ],
  "parts": [
    {
      "id": "bracket", "name": "Bracket", "body": "plate", "material": "aluminium",
      "properties": { "partNumber": "BRK-{width}x{depth}" },
      "connectors": [
        { "id": "pivotTop", "on": { "of": "plate", "role": "end", "count": 1 }, "axis": { "of": "holes", "role": "wall", "from": "left" } },
        { "id": "pivotBottom", "on": { "of": "plate", "role": "start", "count": 1 }, "axis": { "of": "holes", "role": "wall", "from": "left" } }
      ]
    }
  ]
}
```

- The sketch draws a rectangle with a pen: each command moves from where the last one ended, and `close` returns to `start`. The command ids name the four side faces the extrude sweeps from them.
- The extrude starts a body named `plate`. Its bottom face is `start`, its top `end` and its walls `side`.
- The holes are placed on the face the reference `{ "of": "plate", "role": "end", "count": 1 }` names, at x and y on that face. Each position has an id, so a later reference can name one hole's wall.
- The fillet rounds the edges between the top and the walls: exactly 4, or the build reports otherwise.
- The connectors are frames where an assembly fastens the part: on the top and the bottom face, at the left hole's axis.

## Parameters and expressions

- A parameter is a number, or an object with its `value` and limits: `{ "value": 6, "min": 2, "max": 12, "unit": "mm" }`. `type` may be `number` (the default), `boolean`, `choice` (with `options`) or `text`.
- `min`, `max` and `options` are enforced on every value a build uses. `label`, `description`, `group`, `step` and `unit` are for people and editors.
- A parameter may be an expression over others: `"inner": "outer - 2 * wall"`.
- `configurations` are named sets of values, such as the sizes of a product: `{ "id": "large", "values": { "width": 120 } }`, chosen with `build({ document, configuration: "large" })`.
- Expressions have `+ - * / ^`, comparisons, `&& || !`, `if(test, then, otherwise)`, `min`, `max`, `abs`, `sqrt`, `floor`, `ceil`, `round`, and trigonometry in degrees (`sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`). `pi`, `tau`, `e`, `true` and `false` are constants. A step that gives infinity or not-a-number is an error.
- Where a number or a switch is expected, a string is an expression. Where text is expected (a colour, a material id, a choice), a string is the text itself, and `{ "expr": "..." }` computes it.
- `suppressed` on a feature leaves it out when it is true or its expression is not 0: `"suppressed": "!withHoles"`.

## Sketches

- `on` places the sketch: `{ "plane": "XY" }` (or `XZ`, `YZ`, with an `offset`), `{ "frame": { "origin", "normal", "direction" } }`, or `{ "face": <face reference>, "origin": [...], "direction": [...] }` on a flat face of a body. A sketch on a face follows the face when parameters move it.
- `pen` draws one outline from `start`: `line` (to a point), `hLine` and `vLine` (a length along x or y, negative for the other way), `polarLine`, `tangentLine`, `threePointArc`, `tangentArc`, `sagittaArc`, `bulgeArc`, `quadratic`, `cubic`, `close`, and `filletCorner` and `chamferCorner`, which round or bevel the corner between the commands before and after them.
- A sketch with no `pen` and no `loops` draws nothing yet: it is only its plane, which an editor draws on, and a feature that uses it fails until it draws something.
- An outline that ends with `close`, or back at its `start`, is closed, and a closed outline is a face. `"face": false` keeps it a wire, such as a closed path to sweep along; an open outline is always a wire.
- `circle` draws an exact circle as one closed edge: `{ "type": "circle", "id": "bore", "centre": [0, 0], "radius": 5 }`.
- `loops` draws several outlines in one sketch, the first the outside and each further one a hole in it, so one sketch makes a washer: `"loops": [{ "start": [-15, -15], "pen": [...] }, { "pen": [{ "type": "circle", ... }] }]`.
- **Give an id to every command a later feature refers to.** A side face is named after the command it was swept from; a command without an id has no name a reference can use.

## Features

| Feature | What it does | Faces it names |
|---|---|---|
| `extrude` | sweeps a sketch `distance` along its normal | `start`, `end`, `side` (per command) |
| `revolve` | turns a sketch about an `axis` | `start`, `end`, `side` |
| `sweep` | sweeps a profile along a `path` sketch | `start`, `end`, `side` |
| `loft` | skins two or more sketches in order | `start`, `end`, `side` |
| `boolean` | `union`, `difference` or `intersection` of `body` with `tools` | `new` for faces no input had |
| `fillet` | rounds the `edges` a reference names | `round` |
| `chamfer` | bevels them | `bevel` |
| `shell` | hollows a body, leaving the `open` faces open | `rim`, `inner` |
| `hole` | drills holes `at` positions on a face, with counterbores or countersinks | `wall` (per position id) |
| `boss` | raises a sketch on a face | `side`, `end` |
| `pocket` | sinks a sketch into a face, a `distance`, `until` a face or `through` | `side`, `end` |
| `linearPattern`, `polarPattern` | repeats a body `count` times | copies picked with `copy` |
| `mirror` | mirrors a body across a plane | the image is copy 1 |
| `pushPull` | moves one flat face of a body along its normal: out when `distance` is above 0, in when below | `end` (the moved face, which keeps its names), `side` |
| `transform` | moves a body: turns it `rotate` degrees about X, Y and Z through a `pivot`, then shifts it by `translate` | keeps every name it had |
| `import` | starts a body from a STEP, IGES or BREP asset pinned by its SHA-256 | `face` (per index) |
| `operation` | calls any method of the package by its path, such as `"occt.shapes.shape.unifySameDomain"` | carried through history, otherwise `face` |
| `script` | runs code from an asset pinned by its SHA-256, outside the kernel, on bodies, references and values | the roles the script returns, otherwise `face` |

Features that make a solid start a body named by their id, or join the body they name with `"body": "<id>"` and `"join": "add"`, `"cut"` or `"intersect"`.

## References: naming faces and edges

A feature that acts on faces or edges stores a reference, never an index. Indexes change whenever the model changes; references follow the faces through every later feature.

- **A face reference** names the feature that made the faces and the role it made them in: `{ "of": "plate", "role": "side", "from": "base.east" }` is the side of `plate` swept from the sketch command `east` of the sketch `base`. `from` also takes a hole position's id (`{ "of": "holes", "role": "wall", "from": "left" }`) or an imported face's index as text.
- **`count`** says how many faces the reference must find. A different number is an error, never a guess, so give it whenever you know it.
- **`copy`** picks copies of a pattern or a mirror: `{ "of": "row", "index": 2 }`, or `"index": "all"` for every copy and the original.
- **`filter`** narrows what the lineage found with a selector of `occt.select`: `{ "select": "facing", "direction": [0, 0, 1] }`, or `{ "select": "extreme", "direction": [1, 0, 0] }`. Prefer names over filters: a filter can move to a face that comes to win it after an edit.
- **An edge reference** names the edges between two sets of faces, and always has a `count`: `{ "between": [{ "of": "plate", "role": "end" }, { "of": "plate", "role": "side" }], "count": 4 }`.

**Hints.** `design.withHints({ document })` writes onto every face reference what its faces are like (surface type, area, position and normal relative to the body, and the names of their neighbours). Hints change nothing while names resolve. When an edit loses a reference's faces (a sketch redrawn without its ids, an operation that keeps no history), `build({ document, rebind: "report" })` takes the faces most like the hint, when they stand clear of every other face, and reports the feature `rebound`; the default, `rebind: "never"`, fails the feature and lists those faces as `repairs`. Write them when a document is saved; an agent writing a document by hand can leave them out.

## Script features

A script feature carries what a generator knows, such as "a gear of 14 teeth", as one step of the document instead of the hundred commands it expands to.

- **The code is an asset** pinned by its SHA-256, given to the build in `assets` as an import's file is: `{ "id": "gear", "type": "script", "script": "gearCode", "params": { "teeth": 14, "on": { "faces": { "of": "hub", "role": "end", "count": 1 } } } }`.
- **The code is the body of an async function** given `inputs` (the params, with bodies as shapes, references as indexes and expressions as numbers) and `occt` (the OCCT API). It returns a shape, or `{ shape, roles }` naming faces by role, so later features refer to them as they do to any feature's faces: `{ "of": "gear", "role": "tooth" }`.
- **The kernel runs no code.** `design.build` reports the feature `pending` and lists what it would run on; `design.buildWithScripts` runs each script and builds again until nothing waits. Run only documents whose scripts you trust.

## Parts, materials and looks

- **A part** is a body the document delivers, under a stable `id`: `{ "id": "bracket", "body": "plate", "material": "aluminium" }`. A body no part names is construction geometry. Without `parts`, every body that is not used up is a part.
- **A material** carries `density` in kilograms per cubic metre (so the build reports mass), a `standard`, an `appearance` and `properties`. A part's `material` may be `{ "expr": "..." }`, so a choice parameter can pick it.
- **Looks**: `color` and `edgeColor` as `#rrggbb` in sRGB, `metallic`, `roughness`, `opacity`, `emissive` and `emissiveStrength`. A part's appearance lies over its material's, and `faces` and `edges` entries colour what a reference names: `"faces": [{ "faces": { "of": "holes", "role": "wall" }, "color": "#202020" }]`.
- **Properties** are text, numbers, booleans or templates over the parameters: `"partNumber": "BRK-{width}x{depth}"`. `partNumber`, `description`, `finish` and `unitOfMeasure` mean what they say to the bill of materials, and STEP exports carry every property.
- **Connectors** are named frames on a part, on the flat face `on` names: at `origin`, at the axis of a cylindrical face (`axis`, such as a hole's wall), or at the centre of a circular edge (`centre`). An `axis` that names every wall of a hole makes one connector per hole position, `<id>.<position id>`.

## Assemblies

An assembly places parts of other documents. The documents are given to the build beside it, keyed by their `id`; the runner fetches nothing.

```json title="hinge.design.json"
{
  "$schema": "https://git-cdn.bitbybit.dev/v1.4.1/schemas/design-document/experimental.json",
  "schemaVersion": 1,
  "kind": "assembly",
  "meta": { "name": "Swivel pair" },
  "parameters": {
    "swing": { "value": 30, "min": 0, "max": 90, "unit": "deg" }
  },
  "components": [
    { "id": "lower", "source": { "document": "3f1c2a7e-8b4d-4c1a-9e2f-5d6b7a8c9e01", "part": "bracket" } },
    { "id": "upper", "source": { "document": "3f1c2a7e-8b4d-4c1a-9e2f-5d6b7a8c9e01", "part": "bracket", "parameters": { "width": 80 } } }
  ],
  "joints": [
    {
      "id": "pivot", "type": "revolute", "component": "upper", "connector": "pivotBottom",
      "to": { "component": "lower", "connector": "pivotTop" },
      "angle": "swing", "limits": { "angle": [0, 90] }
    }
  ]
}
```

- Build it with the documents it places: `build({ document: hinge, documents: [bracket] })`. The result has the parts, every placed occurrence with its matrix, the bill of materials, and the structure that `assembly.manager.buildAssemblyDocument` exports to STEP and glTF.
- **Joints** put a component's connector against another's, faces meeting and facing each other: `fastened` moves nothing, `revolute` turns by `angle` about the shared axis, `slider` moves by `offset` along it, `cylindrical` does both. `flip` makes the faces face the same way, `limits` bound what may move, and joints form a tree.
- **`replicate`** places a component on every member of a connector set, such as a bolt in every hole of a flange: `"replicate": { "connector": "seat", "to": { "component": "flange", "connector": "bolts" } }`.
- A component's `source.parameters` drive the placed document's values from the assembly's own, so one parameter can size several parts.
- An assembly may publish `connectors` of its components, so a larger assembly can join it as one unit.

## Mistakes to avoid

- **Indexes in references.** Never write a face or edge by its number. Name it by the feature and role that made it.
- **Missing command and position ids.** A side or a hole wall that a later feature names needs an id where it was drawn.
- **Edge references without `count`.** They are refused; count the edges you mean.
- **Operations without the kernel.** An `operation` path starts with the kernel: `"occt.fillets.filletEdges"`, not `"fillets.filletEdges"`. Look its inputs up with the MCP's `describe` before writing them, and pass bodies as `{ "body": "<id>" }`.
- **Guessed units.** Lengths are in the document's `units.length`, millimetres when left out, and angles in degrees.
- **Fields that do not exist.** The schema and `validate` refuse unknown properties. Check them rather than inventing a plausible one.
- **Building before validating.** `validate` reports every problem at once with a pointer to it; a build stops at the first feature that fails and skips what depends on it.
