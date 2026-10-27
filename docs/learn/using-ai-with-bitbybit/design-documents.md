---
sidebar_position: 5
title: "Design documents: parametric models as JSON"
sidebar_label: Design documents
description: How to write a Bitbybit design document - parameters, sketches, features, references that survive edits, parts and assemblies - and the validate, build and fix loop an agent should follow.
tags: [ai, occt]
topic: ai.design-documents
type: reference
---

# Design documents: parametric models as JSON

A design document is a parametric CAD model kept as plain JSON: named parameters, an ordered list of features, and the parts they make. `bitbybit.occt.design.build` turns it into shapes with the Bitbybit OCCT Kernel, in the browser or in Node, and on CAD Cloud as one pipeline step that returns the parts as one STEP or glTF file, with the build's report. This page is written for agents as much as for people: the [Bitbybit CAD MCP](./mcp/bitbybit-mcp) returns its sections through `get_guide`, and the JSON Schema below lets an editor or an agent check a document before it is built.

The format is experimental: each release publishes its own schema, for this one at `https://git-cdn.bitbybit.dev/v1.6.0-rc.0/schemas/design-document/experimental.json` (also in the `@bitbybit-dev/occt` package, under `schemas/design-document/`). Documents carry `"schemaVersion": 1`, and a document written today is not migrated when the format is released.

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
  "$schema": "https://git-cdn.bitbybit.dev/v1.6.0-rc.0/schemas/design-document/experimental.json",
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
- `gear` draws an involute spur gear's outline as `occt.parts.mechanical.gears.spurGearProfile` does: `{ "type": "gear", "id": "teeth", "centre": [0, 0], "module": 2, "teeth": 24 }`, with `pressureAngle`, `profileShift`, `backlash`, `addendum`, `dedendum`, `rootFillet` and `rotation` (in degrees) when the defaults do not fit. Like a circle it is a loop by itself. Its side faces are named by its id and their part: `"from": "profile.teeth.tip"`, `"profile.teeth.flank"` or `"profile.teeth.root"`. Two gears mesh when they share `module` and `pressureAngle` and stand `module * (teeth + otherTeeth) / 2` apart. With `"internal": true` it draws the teeth of a ring gear instead, pointing in toward `centre` as `occt.parts.mechanical.gears.ringGearProfile` draws them, so it belongs in a hole loop inside a larger circle; a ring takes no `profileShift`, needs about 34 teeth or more at 20 degrees, and holds a gear `module * (teeth - otherTeeth) / 2` from its centre.
- `rack` draws an involute rack as `occt.parts.mechanical.gears.rackProfile` does: `{ "type": "rack", "id": "rack", "start": [0, 0], "module": 2, "teeth": 12, "height": 6 }`, with `angle` (in degrees, turning it from running along +x), `pressureAngle`, `backlash`, `addendum`, `dedendum` and `rootFillet` when the defaults do not fit. `start` is where the first tooth's middle sits on the pitch line, and the teeth point to the left of the rack's run. It is a loop by itself, and its side faces are named by its id and their part: `"profile.rack.tip"`, `.flank`, `.root`, `.back` and `.side` (its two ends). A gear of the same module meshes with its centre `module * teeth / 2` from the pitch line, and turning it by `a` degrees moves the rack `pi * module * teeth / 2 * a / 180`.
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
| `shell` | hollows a body, leaving the `open` faces open, including bodies rounded all round when the open faces are flat | `rim`, `inner` |
| `hole` | drills holes `at` positions on a face, `diameter` across or sized by a `fastener` such as `{ "size": "M6", "fit": "tapped" }` or, for an inch screw, `{ "standard": "ansi", "size": "1/4", "series": "UNC", "fit": "tapped" }` (`close`, `normal`, `loose` or `tapped`; `"head": "socket"` adds the counterbore for a socket head cap screw), in the document's unit whichever standard it is, with counterbores or countersinks | `wall` (per position id); a tapped hole's walls are also `thread`, and `design.clashes` leaves out a fastener's thread resting on them |
| `boss` | raises a sketch on a face | `side`, `end` |
| `pocket` | sinks a sketch into a face, a `distance`, `until` a face or `through` | `side`, `end` |
| `keyway`, `flat`, `ringGroove`, `knurl`, `spline`, `thread` | machine the one cylindrical face `on` names, `at` a distance along its axis from its start (the end the nearest world axis points away from; `flip` starts from the other): a `keyway` in a shaft or through a hub's bore, a `flat` `depth` deep, the groove a retaining ring sits in, a `knurl` (`straight`, `left`, `right` or `diamond`), `spline` teeth in a bore, a `thread` outside a shaft of its size or inside a bore drilled for its tap (`size` such as `"M8"` or `"1/4"` is found from the diameter when left out). `standard` picks the tables: `din` (DIN 6885 keys, DIN 471 and 472 rings, DIN 82 knurls by `pitch`, DIN 5480 splines by `module`) or `ansi` (B17.1 keys, B18.27 rings, B94.6 knurls by `diametralPitch`, B92.1 splines by `pitch` such as `"16/32"` and `teeth`), and for a thread `iso` or `ansi` (Unified, with `series` `UNC` or `UNF`, or `threadsPerInch`); `angle` turns a keyway or flat about the axis from world X (world Y on an axis along X); all sized for the face's diameter | `keyway`, `flat`, `groove`, `knurl`, `spline`, `thread` |
| `linearPattern`, `polarPattern` | repeats a body `count` times | copies picked with `copy` |
| `mirror` | mirrors a body across a plane | the image is copy 1 |
| `pushPull` | moves a face of a body along its normal: out when `distance` is above 0, in when below; `mode` `extrude`, the default, sweeps one flat face straight and adds or cuts the swept solid, `offset` moves the faces themselves, flat or curved, the faces around them stretching to follow, and with a `count` the reference may name several faces | `end` (the moved faces, which keep their names), `side` (the faces an extrude sweeps out) |
| `removeFaces` | removes the `count` faces a reference names and closes the gap from the faces around them: a hole's wall fills the hole, a round sharpens its edge | keeps every name the faces that stay had |
| `transform` | moves a body: turns it `rotate` degrees about X, Y and Z through a `pivot`, then shifts it by `translate` | keeps every name it had |
| `import` | starts a body from a STEP, IGES or BREP asset pinned by its SHA-256; `child` takes one shape of a compound, such as one part of the shapes file `fromStep` writes | `face` (per index) |
| `operation` | calls any method of the package by its path, such as `"occt.shapes.shape.unifySameDomain"`, `"occt.parts.mechanical.gears.spurGear"`, `"occt.parts.mechanical.fasteners.iso.socketHeadCapScrew"` (or `fasteners.ansi` for an inch one), `"occt.parts.mechanical.springs.compressionSpring"` or `"occt.parts.mechanical.bearings.iso.ballBearing"`; a method that takes a `unit` builds in the document's, so leave `unit` out | the roles a part names, such as a gear's `tip`, `flank`, `root`, `bore`, `rim`, `start` and `end`, a screw's `head`, `recess`, `seat`, `shank`, `thread` and `end`, or a bearing's `bore`, `outside`, `innerStart`, `innerEnd`, `outerStart` and `outerEnd`; otherwise carried through history, otherwise `face`. `{ "expr": ... }` in `params` passes a number, or text such as a choice parameter's `"M8"` |
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
  "$schema": "https://git-cdn.bitbybit.dev/v1.6.0-rc.0/schemas/design-document/experimental.json",
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
- **`pattern`** places copies of a component where it is placed, turned about an axis or stepped along a direction, such as the blades of a fan: `"pattern": { "polar": { "axis": { "origin": [0, 0, 0], "direction": [1, 0, 0] }, "count": "blades" } }`, or `{ "linear": { "direction": [1, 0, 0], "spacing": 25, "count": 4 } }`. A polar pattern spaces its copies as the `polarPattern` feature does: a whole turn shared out, a part of one (`angle`) with both ends included, the first turned by `start`. Each copy is an occurrence of its own, `blade.1`, `blade.2` and so on, counted in the bill of materials. A patterned component is not moved by a joint or joined to; to turn a row of blades, pattern them inside a sub-assembly and join that.
- A component's `source.parameters` drive the placed document's values from the assembly's own, so one parameter can size several parts.
- **A gear pair** is one gear part document placed twice: its `module`, `teeth`, `width`, `bore` and `backlash` parameters feed a `gear` loop and a `circle` bore, an extrude, and a connector `{ "id": "axis", "on": { "of": "gear", "role": "start" } }`. Each component sets its `teeth` in `source.parameters`, and a revolute joint per gear holds its `axis` against a frame or a plate, `module * (teeth + otherTeeth) / 2` apart. Drive both angles from one parameter: `"turn"` on the first, `"180 / 30 - turn * 20 / 30"` on a 30-tooth second for a 20-tooth first, so the teeth fall into each other's gaps; `design.clashes` at a few values of `turn` through one tooth of the first proves they mesh.
- **A standard part document** is one `operation` feature of `occt.parts` sized by its parameters, such as `{ "id": "screw", "type": "operation", "operation": "occt.parts.mechanical.fasteners.iso.socketHeadCapScrew", "params": { "size": { "expr": "size" }, "length": { "expr": "length" } } }` with `size` a choice parameter of `"M3"`, `"M4"` and so on (`fasteners.ansi` takes `"#10"`, `"1/4"` and a `series`), built in the document's unit, and connectors on the roles it names: a screw's `{ "on": { "of": "screw", "role": "seat" }, "axis": { "of": "screw", "role": "thread" } }`, a nut's or a washer's `seat` and `top`, a bearing's `innerStart` or `outerStart` with the `bore` or `outside` axis, a spring's `bottom` and `top`. Each component sets its own size, so one document places every screw of an assembly, and `replicate` puts one in every hole of a set.
- An assembly may publish `connectors` of its components, so a larger assembly can join it as one unit.
- **From a STEP file:** `occt.design.fromStep({ step, name })` writes an assembly document per assembly and a part document per part, placed `at` the file's frames, with names and colours, every part importing one shapes file by `child`. Store `assets[0].data` at its `uri`, then build the `root` document with `documents` and `assets: { [assets[0].id]: assets[0].data }`; `report.notes` says what changed on the way, such as a mirrored placement built into a part of its own.
- **Section a build:** `occt.design.section({ build, frame })` cuts what `build` returned with the plane of a frame, taking away what lies on the side its normal points to, and gives a cap for each part the plane passes through, the faces it cuts with their `area`. With `cut: true` the pieces behind the plane and the parts wholly behind it come too, each with its `volume`. The result is placed like the build's parts, so `draw.drawAnyAsync({ entity: section })` draws it, and the same frame given to `operations.hiddenLines` looks at the cut.

## Mistakes to avoid

- **Indexes in references.** Never write a face or edge by its number. Name it by the feature and role that made it.
- **Missing command and position ids.** A side or a hole wall that a later feature names needs an id where it was drawn.
- **Edge references without `count`.** They are refused; count the edges you mean.
- **Operations without the kernel.** An `operation` path starts with the kernel: `"occt.fillets.filletEdges"`, not `"fillets.filletEdges"`. Look its inputs up with the MCP's `describe` before writing them, and pass bodies as `{ "body": "<id>" }`.
- **Guessed units.** Lengths are in the document's `units.length` (`mm`, `cm`, `m` or `in`), millimetres when left out, and angles in degrees. An inch document holds inch numbers: a 1/4 inch plate is `0.25` thick, and its standard parts and fastener holes are sized in inches, ISO and ANSI alike. A STEP export states the document's unit; a glTF one holds the numbers as they are unless it is given the unit (`unit` on `exportDocumentToGltf`, `outputs.unit` on CAD Cloud), when it is written in metres, the unit glTF viewers assume.
- **Fields that do not exist.** The schema and `validate` refuse unknown properties. Check them rather than inventing a plausible one.
- **Building before validating.** `validate` reports every problem at once with a pointer to it; a build stops at the first feature that fails and skips what depends on it.
