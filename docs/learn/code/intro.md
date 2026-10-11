---
sidebar_position: 1
title: Code in Bitbybit - the API at a Glance
sidebar_label: Intro
description: How the Bitbybit API is organised and how one function reads in Rete, Blockly and TypeScript, the concepts every script stands on, and a map of every namespace with what it is for, how many functions it has and where it is explained.
topic: code.start.intro
type: landing
tags: [code, draw, occt]
---

# Code in Bitbybit

Everything a Bitbybit script does, it does by calling the **API**: some two thousand functions under `bitbybit`, from `bitbybit.point.spiral` to `bitbybit.occt.fillets.filletEdges`. The three coding editors are three ways of calling the same functions, so what you learn here holds in all of them, and in the [runners](/learn/runners/intro) and [npm packages](/learn/npm-packages/intro) as well.

## One function, three editors

Take `bitbybit.occt.shapes.solid.createBox`. Its path says where it lives: in the OpenCascade kernel (`occt`), among its shapes, with the solids. Each editor finds it by that same path:

| Editor | Where you find it | What you set |
|---|---|---|
| Rete | the palette: <Ui>occt</Ui> > <Ui>shapes</Ui> > <Ui>solid</Ui>, or a right-click search for `box` | the fields on the component, or wires into its inputs |
| Blockly | the toolbox: <Ui>occt</Ui> > <Ui>shapes</Ui> > <Ui>solid</Ui>, or the toolbox search | the blocks plugged into its inputs |
| TypeScript | `bitbybit.occt.shapes.solid.createBox(...)`, with IntelliSense as you type the path | an object of named inputs: `{ width: 4, length: 4, height: 4 }` |

Every function takes one set of named inputs, most with a default, and returns one result. The [API reference](https://docs.bitbybit.dev) documents each one, and in Rete the path printed on a component links to its page there.

## Start with the concepts

A handful of ideas explain most of what surprises people. Each page shows its idea in all three editors:

- [Shapes live in a worker](./common/concepts/shapes-live-in-a-worker) - why calls wait, why a shape is a handle, and why operations never change their inputs.
- [Choosing a kernel](./common/concepts/choosing-a-kernel) - OpenCascade, Manifold or JSCAD, and moving a shape between them.
- [Units, tolerance and precision](./common/concepts/units-and-precision) - what a number means, and why a drawing's precision never changes the shape.
- [Lists in every editor](./common/concepts/lists) - a list as one value, and a function run once per item.
- [Picking faces and edges](./common/concepts/picking-faces-and-edges) - by index, by rule and by history.
- [Checking a shape](./common/concepts/checking-a-shape) - volume, validity and repair, for the mistakes that do not fail.
- [Getting a model out](./common/concepts/getting-a-model-out) - STEP, STL, GLB and the other files, and a picture.
- [Materials and the look of a model](./common/concepts/materials-and-looks) - colours, edges and physically based materials.
- [Conventions](./common/conventions) - colours from 0 to 1, which way is up in each kernel, and the defaults that surprise people.

[How Bitbybit works](/learn/how-it-works) puts these ideas in the context of the whole platform.

## What only one editor has

Most of the palette and the toolbox is the API. A few things belong to one editor, because they are about how that editor works rather than about geometry:

- **Rete**: [modules](/learn/getting-started/rete/modules) that package part of a graph as a component, [code components](/learn/getting-started/rete/typescript-editor-component) that hold a TypeScript function, groups and comments, sliders, and flow components that run on events such as a key press or a timer.
- **Blockly**: [variables and functions](/learn/getting-started/blockly/variables-and-functions), loops and Blockly's own maths, text and logic blocks.
- **TypeScript**: anything the language offers, a script of [many files](/learn/getting-started/typescript/files-and-imports), and BabylonJS itself beside the API.

## The map of the API

Every namespace, what it is for, how many functions it holds, which [tier](/learn/how-it-works#open-source-platform-and-cloud-functions) it belongs to, and where Code explains it. A namespace without a Code page is still documented in full in the reference.

{/* api-map:start - generated from the API index; edits between these markers are overwritten */}

| Namespace | What it is for | Functions | Tier | Explained in |
|---|---|---|---|---|
| `bitbybit.occt` | The entry point to the OpenCascade kernel: every OCCT feature is reached through one of its properties. | 627 | open source | [Code](/learn/code/common/occt/what-is-occt) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCT) |
| `bitbybit.babylon` | The BabylonJS side of the library: everything that lives in the rendered scene rather than in a CAD kernel. | 428 | open source | [Code](/learn/code/common/babylon/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.Babylon) |
| `bitbybit.manifold` | The entry point to the Manifold kernel, a fast mesh-based solid modeler. | 129 | open source | [Code](/learn/code/common/manifold/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.ManifoldBitByBit) |
| `bitbybit.verb` | NURBS curves and surfaces. | 115 | open source | - · [reference](https://docs.bitbybit.dev/classes/Bit.Verb) |
| `bitbybit.things` | The entry point to the finished parametric models, grouped by what they are for. | 88 | platform | [Code](/learn/code/common/things/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.ThingsAdv) |
| `bitbybit.jscad` | The entry point to the JSCAD kernel, a mesh-based solid modeler with three kinds of geometry. | 66 | open source | [Code](/learn/code/common/jscad/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.JSCAD) |
| `bitbybit.advanced` | Advanced tools that do in one call what would take many steps. | 62 | platform | [Code](/learn/code/common/advanced/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.AdvancedAdv) |
| `bitbybit.ifc` | IFC building models as reached from a script. | 56 | open source | [Code](/learn/code/common/ifc/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.IFCW) |
| `bitbybit.math` | Arithmetic, rounding, ranges, random numbers and the trigonometric functions on plain numbers. | 46 | open source | [Code](/learn/code/common/base/math/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.MathBitByBit) |
| `bitbybit.draw` | Drawing anything into the scene. | 45 | open source | [Code](/learn/code/common/draw/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.Draw) |
| `bitbybit.dates` | Dates and times as JavaScript Date values: creating them, reading and setting their parts, and formatting them as text. | 42 | open source | [Code](/learn/code/common/base/dates/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.Dates) |
| `bitbybit.lists` | Reading, building and reshaping plain arrays of any kind of item. | 42 | open source | [Code](/learn/code/common/base/lists/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.Lists) |
| `bitbybit.vector` | Vector maths on plain number arrays. | 38 | open source | [Code](/learn/code/common/base/vector/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.Vector) |
| `bitbybit.frame` | Frames: a frame is a point with three axes at right angles, written as its origin, its normal (the Z axis) and its direction (the X axis), the Y axis following from those two. | 36 | open source | [Code](/learn/code/common/base/frame/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.Frame) |
| `bitbybit.text` | Working with text: splitting, joining, searching, trimming, padding, changing case, regular expressions and formatting with placeholders. | 36 | open source | [Code](/learn/code/common/base/text/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.TextBitByBit) |
| `bitbybit.point` | Points as plain number arrays. | 34 | open source | [Code](/learn/code/common/base/point/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.Point) |
| `bitbybit.color` | Colors in the two forms the library uses. | 18 | open source | [Code](/learn/code/common/base/color/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.Color) |
| `bitbybit.asset` | Files in and out of a script: assets the running application stores under a name, files fetched from a URL, downloads, and conversions between File, Blob, ArrayBuffer and Uint8Array. | 17 | open source | [Code](/learn/code/common/base/asset/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.Asset) |
| `bitbybit.line` | Straight lines between two points, held as plain objects of the form \{ start, end \}, and the segment form [start, end] of the same thing. | 16 | open source | [Code](/learn/code/common/base/line/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.Line) |
| `bitbybit.polyline` | Polylines: chains of straight segments through a list of points, held as plain objects of the form \{ points, isClosed \}. | 15 | open source | [Code](/learn/code/common/base/polyline/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.Polyline) |
| `bitbybit.json` | Reading and changing values inside JSON data. | 12 | open source | [Code](/learn/code/common/base/json/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.JSONBitByBit) |
| `bitbybit.csv` | Reading and writing CSV, the plain-text table format with one row per line and a separator between cells. | 11 | open source | [Code](/learn/code/common/base/csv/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.CSVBitByBit) |
| `bitbybit.three` | The Three.js side of the library: what lives in the rendered scene rather than in a CAD kernel. | 11 | open source | - · [reference](https://docs.bitbybit.dev/classes/Bit.ThreeJS) |
| `bitbybit.logic` | Booleans and decisions: comparing values, flipping booleans, turning lists of numbers into lists of booleans by thresholds, drawing random booleans, and gating a value so it passes only when a condition holds. | 10 | open source | [Code](/learn/code/common/base/logic/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.Logic) |
| `bitbybit.mesh` | Geometry on plain triangle meshes: a mesh is a list of triangles, each three points. | 8 | open source | [Code](/learn/code/common/base/mesh/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.MeshBitByBit) |
| `bitbybit.cloud` | Operations that exist only on CAD Cloud, each behind its own REST route. | 5 | CAD Cloud | - |
| `bitbybit.playcanvas` | The PlayCanvas side of the library: what lives in the rendered scene rather than in a CAD kernel. | 5 | open source | - · [reference](https://docs.bitbybit.dev/classes/Bit.PlayCanvas) |
| `bitbybit.occtPro` | Pro OCCT algorithms that run on CAD Cloud as pipeline steps. | 4 | CAD Cloud | - |
| `bitbybit.tag` | Text labels pinned to 3D positions. | 3 | open source | [Code](/learn/code/common/draw/tags) · [reference](https://docs.bitbybit.dev/classes/Bit.Tag) |
| `bitbybit.time` | Hooks into the frame loop of the scene. | 1 | open source | [Code](/learn/code/common/draw/frame-loop) · [reference](https://docs.bitbybit.dev/classes/Bit.Time) |

### Inside `bitbybit.occt`

| Namespace | What it is for | Functions | Tier | Explained in |
|---|---|---|---|---|
| `shapes` | Shape construction in OpenCascade, grouped by what you are building: vertices, edges, wires, faces, shells, solids and compounds. | 301 | open source | [Code](/learn/code/common/occt/shapes/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTShapes) |
| `operations` | The modeling operations that turn OpenCascade wires and faces into surfaces and solids and measure shapes. | 46 | open source | [Code](/learn/code/common/occt/operations/extrusions) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTOperations) |
| `transforms` | Moving, turning, scaling and mirroring OpenCascade shapes, and building the 4x4 matrices that describe such moves. | 41 | open source | [Code](/learn/code/common/occt/transforms/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms) |
| `select` | Choosing faces and edges of OpenCascade shapes by what they are, where they lie and how they meet, rather than by an index that shifts whenever the model changes. | 29 | open source | [Code](/learn/code/common/occt/select/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTSelect) |
| `io` | Reading and writing CAD files with OCCT. | 27 | open source | [Code](/learn/code/common/occt/io/step-and-iges) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTWIO) |
| `assembly` | Assemblies as OpenCascade documents. | 25 | open source | [Code](/learn/code/common/occt/assembly/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTAssembly) |
| `analysis` | Questions asked of OpenCascade shapes, answered with points, numbers and index lists rather than new shapes. | 24 | open source | [Code](/learn/code/common/occt/analysis/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTAnalysis) |
| `fillets` | Rounding and beveling the edges of OpenCascade shapes. | 22 | open source | [Code](/learn/code/common/occt/fillets/fillets-intro) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTFillets) |
| `features` | Local modelling features on solids. | 20 | open source | [Code](/learn/code/common/occt/features/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures) |
| `sketch` | Drawing flat outlines with a pen. | 18 | open source | [Code](/learn/code/common/occt/sketch/pen-sketcher) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTSketch) |
| `brepGraph` | Structural queries over an OpenCascade shape seen as a graph. | 13 | open source | [Code](/learn/code/common/occt/shapes/structure) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph) |
| `booleans` | Combining OpenCascade shapes with each other. | 10 | open source | [Code](/learn/code/common/occt/booleans/operations) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTBooleans) |
| `shapeFix` | Checks and repairs for OpenCascade shapes that came out of a file or an operation with defects. | 10 | open source | [Code](/learn/code/common/concepts/checking-a-shape) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTShapeFix) |
| `design` | Builds parametric parts and assemblies kept as data. | 9 | open source | [Code](/learn/using-ai-with-bitbybit/design-documents) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTDesign) |
| `geom` | The geometric layer beneath the topology: the mathematical curves and surfaces themselves, separate from the edges and faces that carry them. | 8 | open source | [Code](/learn/code/common/occt/shapes/structure) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTGeom) |
| `corners` | Rounding and beveling single corners of an OpenCascade shell or solid, picked by a point near them rather than by edge index. | 4 | open source | [Code](/learn/code/common/occt/features/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTCorners) |
| `dimensions` | Measurement annotations drawn as OpenCascade wires. | 3 | open source | [Code](/learn/code/common/occt/dimensions/linear-dimension) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTDimensions) |
| `draft` | Draft angles for OpenCascade shapes: the slight taper cast and molded parts need so they slide out of the mold. | 3 | open source | [Code](/learn/code/common/occt/features/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTDraft) |
| `recipes` | Building recipes exactly: solids described as data - polygons, circles, extrusions, turns, lofts, cuts by solids and planes, openings, unions, intersections, transforms and triangle meshes - by a package that does not build geometry itself, such as one that reads building models. | 2 | open source | [Code](/learn/code/common/ifc/intro) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTRecipes) |
| `svg` | Importing SVG drawings as OpenCascade shapes. | 2 | open source | [Code](/learn/code/common/occt/io/svg-import) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTSVG) |
| `path` | A generic 2D path builder: describe an outline as subpaths of line, quadratic, cubic and arc segments, the vocabulary of SVG paths, and get an OpenCascade wire or face in one call. | 1 | open source | [Code](/learn/code/common/occt/io/svg-import) · [reference](https://docs.bitbybit.dev/classes/Bit.OCCTPath) |

{/* api-map:end */}

## Writing code with an agent

An AI agent writing Bitbybit code should read [Geometry with the kernels](../using-ai-with-bitbybit/cad-geometry), which the [Bitbybit CAD MCP](../using-ai-with-bitbybit/mcp/bitbybit-mcp) serves through `get_guide`: which kernel to use, the order to build a part in, how to choose edges, check a shape and export it, and the mistakes to avoid.
