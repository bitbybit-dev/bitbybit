---
sidebar_position: 3.5
title: "Geometry with the CAD kernels: writing parts with an agent"
sidebar_label: Geometry with the kernels
description: How an agent writes 3D geometry with Bitbybit's kernels - OpenCascade for exact parts, Manifold for fast meshes, JSCAD for quick solids - in the browser, in the editors or in Node, how it chooses edges, checks a shape and exports it, and the mistakes to avoid.
tags: [ai, occt, manifold, jscad]
topic: ai.cad-geometry
type: how-to
---

# Geometry with the CAD kernels: writing parts with an agent

Most code written against Bitbybit builds geometry: a part from a sketch, a solid cut by others, a model drawn on a page or written to a STEP file. This page is written for agents as much as for people: the [Bitbybit CAD MCP](./mcp/bitbybit-mcp) returns its sections through `get_guide`, and its `describe` and `get_examples` tools answer for every method by its dotted path, such as `occt.fillets.filletEdges`. The [code pages](../code/intro) explain each family of methods with examples; this page is what to know before the first call.

## Geometry in Bitbybit

- **Three kernels, one API.** `occt` is OpenCascade, an exact kernel: solids bounded by true curves and surfaces, fillets and chamfers, booleans that keep a cylinder a cylinder, STEP and IGES. `manifold` is Manifold, a mesh kernel whose booleans are fast and always give a closed solid. `jscad` is JSCAD, polygon modelling with text and simple extrusions. Each is an MIT npm package with a worker beside it: `@bitbybit-dev/occt`, `@bitbybit-dev/manifold`, `@bitbybit-dev/jscad`.
- **It runs locally.** The kernels run in the browser and in Node; the methods `describe` marks `oss` need no account and no server.
- **Shapes are values.** Every operation returns a new shape and leaves its inputs as they were, so a part is a chain of calls, each starting from the result of the one before.
- **One object in, one result out.** Every method takes a single object of named fields, most of them with defaults: `createBox({ width: 80, length: 50, height: 8 })`. `describe` lists each field with its default and range. A field left out takes its default, and a misspelt one is ignored, so look the names up rather than recall them.

## Which kernel to use

- **OpenCascade (`occt`)** for parts: exact geometry, fillets and chamfers, measurements, STEP, IGES, STL and DXF, and assemblies with names and colours. An operation takes milliseconds to seconds, so it suits parts of tens or hundreds of features rather than thousands of booleans.
- **Manifold (`manifold`)** for many booleans and for meshes: a panel with a thousand holes, a lattice, imported or scanned meshes, anything that must stay watertight. It has no fillets and no exact curves: a cylinder is a prism of `circularSegments` sides.
- **JSCAD (`jscad`)** for quick solids and 3D text.
- **Between them.** `occt.shapeToManifoldMesh` meshes an OpenCascade shape into the form `manifold.manifold.shapes.manifoldFromMesh` takes, so a part can be modelled exactly and then cut a thousand times in Manifold. A mesh comes back into OpenCascade only as flat triangles, never as true curves.

## Two ways to call a kernel

The methods have the same paths and the same inputs everywhere. What differs is how they answer.

- **In the browser, through the renderer packages, and in scripts in the Bitbybit editors**, each kernel runs in a web worker as `bitbybit.occt`, `bitbybit.manifold` and `bitbybit.jscad`. Every call is asynchronous, and a shape is a small handle, `{ hash, type }`, to the shape the worker holds. Pass it to the next call; it cannot be read or changed.

  ```typescript
  const box = await bitbybit.occt.shapes.solid.createBox({ width: 80, length: 50, height: 8 });
  const rounded = await bitbybit.occt.fillets.filletEdges({ shape: box, radius: 2 });
  ```

- **In Node, with the package alone**, the kernel runs in the process and its methods are synchronous:

  ```typescript
  import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/index.js";
  import { OCCTService, OccHelper, ShapesHelperService, VectorHelperService } from "@bitbybit-dev/occt";

  const occ = await initOpenCascade({ print: () => undefined });
  const occt = new OCCTService(occ, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occ));
  const box = occt.shapes.solid.createBox({ width: 80, length: 50, height: 8 });
  ```

  `print` keeps the kernel's progress lines, such as a STEP writer's statistics, off the console. Run the TypeScript with `tsx` (`npx tsx part.ts`): the package's own imports leave out file extensions, as bundlers expect, so plain `node` cannot load them.

Write geometry so it runs both ways: `await` every call, as the projects `npm init @bitbybit-dev/app` creates do. Their `src/model.ts` holds a `buildModel(occt, params)` that the page calls with `bitbybit.occt` and the Node smoke test calls with the in-process service, typed as the worker's API through one cast.

A few members differ between the two. Only the worker has `occt.deleteShape`, `occt.deleteShapes` and `occt.cleanAllCache`, which free the shapes it holds; in Node a shape is freed with its own `.delete()`. Through the worker `io.saveShapeSTEP` starts a browser download and `io.saveShapeSTEPAndReturn` returns the text; in Node `io.saveShapeSTEP` returns the text, so call it on the service itself rather than through code typed as the worker's API, which sees it return nothing. The worker also remembers results: the same call with the same inputs gives back the same handle without running again.

`describe` shows the worker form, `createBox(inputs: Inputs.OCCT.BoxDto): Promise<Inputs.OCCT.TopoDSSolidPointer>`; in Node the same method returns the shape itself. A method's answer also names the types it returns, such as `Models.OCCT.SolidDebugInfo` for `occt.shapes.solid.debugInfo`; `describe` with that name lists their fields.

## How the Bitbybit OCCT Kernel thinks

- **Y is up.** The ground is the XZ plane. A box's `height` runs along Y, a cylinder grows along its `direction`, `[0, 1, 0]` unless given, and a rectangle or circle wire lies flat on the ground unless its `direction`, the normal of its plane, says otherwise. Manifold and JSCAD build along Z instead: their cylinders stand on the XY plane.
- **Shapes nest.** A vertex is a point, an edge a curve between vertices, a wire a chain of edges, a face a surface bounded by wires, a shell faces joined at their edges, a solid the volume a closed shell bounds, and a compound a group of shapes kept apart. Each method says which kinds it takes and gives: `operations.extrude` turns a face into a solid, but a wire only into a shell.
- **Units are plain numbers.** STEP files are written in millimetres, so model in millimetres when the part goes to another CAD tool. Angles are degrees, and tolerances are in the model's units.
- **Right-handed.** OpenCascade is right-handed, as three.js and PlayCanvas are. A Babylon.js scene is left-handed, and shows every part mirrored, unless `scene.useRightHandedSystem` is set when it is created.
- **Colours** are hex strings such as `"#ff8000"`, or arrays of three numbers from 0 to 1.

## The order to build a part in

Each step starts from what the step before made, so this order avoids most failures:

1. **A profile.** A wire from `shapes.wire.createRectangleWire`, `createCircleWire` or `createPolygonWire`, or a pen sketch of lines and arcs with `occt.sketch`. `fillets.fillet2d` rounds a flat wire's corners.
2. **A face.** `shapes.face.createFaceFromWire`, with `planar: true` for a flat profile.
3. **A solid.** `operations.extrude` along a vector whose length is the distance, `operations.revolve` about an axis, `operations.loft` through several wires, or `operations.pipe` along a path; or a primitive, such as `shapes.solid.createBox` or `shapes.solid.createCylinder`.
4. **Booleans.** `booleans.union` fuses, `booleans.difference` cuts, `booleans.intersection` keeps what the shapes share. Cut round holes with cylinders rather than as holes in the profile.
5. **Fillets and chamfers.** `fillets.filletEdges`, `fillets.chamferEdges` and their list forms, on edges chosen by their geometry. Round an edge once the booleans that make it are done; a hole cut afterwards leaves a fillet it does not touch as it was.
6. **Placement.** `transforms.translate`, `transforms.rotate` (degrees, about an axis through the origin) and `transforms.mirror`.
7. **Checks, then drawing or export**, as the sections below describe.

## A part to start from

A mounting bracket: a plate with rounded corners, a boss with a bore, a fillet where the boss meets the plate, and four holes. It follows the order above, chooses the edge to fillet by where it is, and runs unchanged in the browser and in Node:

```typescript
import type { BitByBitBase, Inputs } from "@bitbybit-dev/threejs";

type Occt = BitByBitBase["occt"];
type Shape = Awaited<ReturnType<Occt["booleans"]["difference"]>>;

const PLATE = { width: 80, length: 50, thickness: 8, cornerRadius: 6 };
const BOSS = { radius: 12, height: 20, bore: 6 };
const HOLE = { radius: 3.5, inset: 10 };
const ROOT_FILLET = 3;
const TOLERANCE = 1e-6;
const UP: Inputs.Base.Vector3 = [0, 1, 0];

function isAt(point: Inputs.Base.Point3 | undefined, target: Inputs.Base.Point3): boolean {
    return point !== undefined && Math.hypot(point[0] - target[0], point[1] - target[1], point[2] - target[2]) < TOLERANCE;
}

export async function buildBracket(occt: Occt): Promise<Shape> {
    const outline = await occt.shapes.wire.createRectangleWire({ width: PLATE.width, length: PLATE.length, center: [0, 0, 0], direction: UP });
    const rounded = await occt.fillets.fillet2d({ shape: outline, radius: PLATE.cornerRadius });
    const face = await occt.shapes.face.createFaceFromWire({ shape: rounded, planar: true });
    const plate = await occt.operations.extrude({ shape: face, direction: [0, PLATE.thickness, 0] });
    const boss = await occt.shapes.solid.createCylinder({ radius: BOSS.radius, height: PLATE.thickness + BOSS.height, center: [0, 0, 0], direction: UP });
    const body = await occt.booleans.union({ shapes: [plate, boss] });

    const edges = await occt.shapes.edge.getEdges({ shape: body });
    const centers = await occt.shapes.edge.getEdgesCentersOfMass({ shapes: edges });
    const root = edges.filter((_edge, index) => isAt(centers[index], [0, PLATE.thickness, 0]));
    const filleted = await occt.fillets.filletEdgesListOneRadius({ shape: body, edges: root, radius: ROOT_FILLET });

    const x = PLATE.width / 2 - HOLE.inset;
    const z = PLATE.length / 2 - HOLE.inset;
    const corners: Inputs.Base.Point3[] = [[x, 0, z], [-x, 0, z], [-x, 0, -z], [x, 0, -z]];
    const holes = await Promise.all(corners.map((center) => occt.shapes.solid.createCylinder({ radius: HOLE.radius, height: PLATE.thickness, center, direction: UP })));
    const bore = await occt.shapes.solid.createCylinder({ radius: BOSS.bore, height: PLATE.thickness + BOSS.height, center: [0, 0, 0], direction: UP });
    return occt.booleans.difference({ shape: filleted, shapes: [...holes, bore] });
}
```

The result is a valid solid of 18 faces, 80 by 28 by 50 mm, of about 36,556 mm³. The plate lies on the ground and the boss rises along Y. The only circle centred on the boss's axis at the plate's top is where the boss meets the plate, so that is the edge the fillet rounds, whatever number the kernel gave it. In a scaffolded project the function goes into `src/model.ts`, whose `Occt` and `Shape` types are the same; in a script in the editors, make the same calls on `bitbybit.occt`. In Node, hand it the in-process service through one cast and write a STEP file standing upright for a Z-up CAD tool:

```typescript
import { writeFileSync } from "node:fs";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/index.js";
import { OCCTService, OccHelper, ShapesHelperService, VectorHelperService } from "@bitbybit-dev/occt";
import { buildBracket } from "./bracket.ts";

type Occt = Parameters<typeof buildBracket>[0];
type KernelShape = Parameters<OCCTService["io"]["saveShapeSTEP"]>[0]["shape"];

function asWorkerApi(service: object): Occt {
    return service as Occt;
}

function asKernelShape(shape: object): KernelShape {
    return shape as KernelShape;
}

const occ = await initOpenCascade({ print: () => undefined });
const service = new OCCTService(occ, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occ));
const bracket = asKernelShape(await buildBracket(asWorkerApi(service)));
const upright = service.transforms.rotate({ shape: bracket, axis: [1, 0, 0], angle: 90 });
writeFileSync("bracket.step", service.io.saveShapeSTEP({ shape: upright, fileName: "bracket.step" }));
```

## Choosing edges and faces

- **Never guess an index.** Edges and faces are numbered in the order the kernel walks a shape, which nothing predicts and every operation changes. `fillets.filletEdges` takes `indexes` counted from 0 in the order `shapes.edge.getEdges` lists the edges, and `fillets.fillet2d` takes corners counted from 1; an index read off one shape means nothing on the next.
- **Choose by geometry.** `shapes.edge.getEdges` lists a shape's edges; `shapes.edge.getEdgesCentersOfMass` and `shapes.edge.getEdgesLengths` measure them; `shapes.edge.isEdgeCircular`, `shapes.edge.isEdgeLinear`, `shapes.edge.getCircularEdgeRadius` and `shapes.edge.getCircularEdgeCenterPoint` say what each is. A full circle's center of mass is its center, but an arc's lies on its inner side, so find arcs, such as a rim a slot has cut open, by being circular, by their radius and by their circle's center. Keep the edges you mean, as the bracket does, and pass them to `fillets.filletEdgesListOneRadius`, `fillets.filletEdgesList` or `fillets.chamferEdgesList`, which takes a distance for each edge. Faces work the same way, with `shapes.face.getFaces`, `shapes.face.getFacesCentersOfMass` and `shapes.face.getFacesAreas`.
- **Follow an edge through a change.** Methods ending in `WithHistory`, such as `booleans.differenceWithHistory` and `fillets.filletEdgesWithHistory`, also report what became of every face, edge and vertex they were given, for code that must keep pointing at the same edge as the part changes.
- **Labels are for people.** `drawEdgeIndexes` and `drawFaceIndexes` in the draw options write each edge's and face's number on the screen, which helps a person find one but does not replace choosing by geometry in code.

## Checking a shape

Each check is one call. Run them after any step that may have gone wrong:

- `shapeFix.isValid` checks that a shape is well formed, of any kind. An operation can finish without an error and still return an invalid shape: a fillet too large for the faces beside its edge can.
- `shapes.solid.debugInfo` reports in one answer how many faces and edges a solid has, its area and its volume. Its `valid` is false only for an empty shape; it does not check the geometry, so use `shapeFix.isValid` for that.
- `shapes.solid.getSolidVolume` and `analysis.measure.tightBoundingBox` measure. Compare them with what the part should be: a cut that misses its shape, or a face whose hole was wound the wrong way, changes the volume by the wrong amount or not at all, without an error. The tight box follows the exact geometry; the older `operations.boundingBoxOfShape` can be loose around curved faces and is deprecated.
- A method that cannot do what it was asked throws and says why, such as a fillet the faces beside an edge cannot hold. Read the message, change the input and run again.

## Drawing and exporting a part

- **Drawing.** In the browser and in the editors, `draw.drawAnyAsync({ entity: shape, options })` draws any shape, mesh or point list; for OpenCascade shapes `options` is an `Inputs.Draw.DrawOcctShapeOptions`, with `faceColour`, `edgeColour`, `edgeWidth` and `precision`, the meshing tolerance. Draw the finished part rather than every step.
- **STEP**, the exact format other CAD tools open: `io.saveShapeSTEPAndReturn` through the worker, `io.saveShapeSTEP` on the in-process service in Node, both giving the file's text in millimetres. Most CAD tools are Z-up: turn the part first with `transforms.rotate({ shape, axis: [1, 0, 0], angle: 90 })`, which takes Y up to Z and keeps the part as it was built. The `adjustYtoZ` option swaps Y and Z instead, which mirrors the part: it matches what a left-handed Babylon.js scene shows.
- **STL** for printing: `io.saveShapeStlAndReturn` through the worker, `io.saveShapeStl` in Node, with `precision` as the meshing tolerance and `binary` for the smaller form. Turn the part as for STEP.
- **Drawings and assemblies.** `io.shapeToDxfPaths` and `io.dxfCreate` write a DXF of flat geometry, and the documents of `occt.assembly.manager` hold several parts with names, colours and placements, written to one STEP file with `occt.assembly.manager.exportDocumentToStep`.

## Manifold and JSCAD

- **Manifold** solids are handles too, through the worker. Make them with `manifold.manifold.shapes.cube`, `sphere` and `cylinder`, or from a flat outline with `manifold.crossSection.shapes.rectangle` or `manifold.crossSection.shapes.circle` and `manifold.crossSection.operations.extrude`. Combine them with `manifold.manifold.booleans.union`, `difference` and `intersection`, which take the whole list of `manifolds` at once, and measure them with `manifold.manifold.evaluate.volume`. `cube` and `cylinder` are centred on the origin by default (`center: true`), cylinders and extrusions stand along Z, and `circularSegments` sets how round a curve is. Free a solid with `manifold.deleteManifoldOrCrossSection` through the worker, or its own `.delete()` in Node.
- **From OpenCascade to Manifold**, mesh the part and build a solid from the mesh:

  ```typescript
  const mesh = await bitbybit.occt.shapeToManifoldMesh({ shape: bracket, precision: 0.05 });
  const solid = await bitbybit.manifold.manifold.shapes.manifoldFromMesh({ mesh });
  ```

- **JSCAD** entities are plain data, copied to and from the worker. `jscad.shapes.cube` and `jscad.shapes.cylinder` (along Z, centred on `center`) make solids, `jscad.booleans.union` and `jscad.booleans.subtract` combine a list of `meshes`, and `jscad.text.cylindricalText` writes text as solids. Move a part to OpenCascade when it needs fillets or STEP.

## Mistakes to avoid in geometry code

- **Guessed edge indexes.** An index from memory or from a picture rounds the wrong edge, or none. Choose edges by their geometry; `fillets.filletEdges` counts from 0 and `fillets.fillet2d` from 1.
- **A fillet too large for its faces.** It throws, or returns an invalid solid without an error. Keep the radius under half the width of the narrowest face beside the edge, and check `shapeFix.isValid` after it.
- **Holes in a face made from several wires.** `shapes.face.createFaceFromWires` cuts a hole only with a wire that runs against the outline; a wire running the same way adds material, silently. Cut holes with `booleans.difference` and cylinders, or turn such a wire round with `shapes.wire.reversedWire`.
- **A cut that misses.** A tool that does not reach the shape leaves it as it was, with no error. Check that the volume changed.
- **Extruding a wire.** That gives a shell, not a solid; make a face first.
- **Treating Z as up in OpenCascade.** Heights run along Y there. Manifold and JSCAD build along Z, so primitives from different kernels need a quarter turn about X to line up.
- **A missing `await`.** Through the worker every call returns a promise, and a promise passed as a shape fails in the next call.
- **Worker-only members in Node.** `occt.deleteShape`, `occt.cleanAllCache` and `io.saveShapeSTEPAndReturn` exist only through the worker; in Node use `.delete()` and `io.saveShapeSTEP`.
- **`adjustYtoZ` on export.** It mirrors the part; turn it about X instead.
- **Degenerate numbers.** A scale of 0, a zero-length direction or `NaN` can stop the kernel rather than make it throw. Check computed values before they reach a call.
- **Keeping every shape.** The worker holds every shape it has made until it is freed. Free what is no longer needed with `occt.deleteShapes`, or everything with `occt.cleanAllCache` before building a new part from scratch.
- **Fields that do not exist.** `describe` each method first; its inputs, defaults and ranges come from the index, not from memory.
