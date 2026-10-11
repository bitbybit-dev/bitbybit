---
sidebar_position: 3
title: Glossary
sidebar_label: Glossary
description: The words the Bitbybit documentation uses, from kernel, shape and wire to runner, design document, CAD Cloud task and platform algorithm, each in a sentence or two with a link to the page that teaches it.
topic: platform.start.glossary
type: reference
verified: 2026-10-11
tags: [getting-started, architecture]
---

# Glossary

The words these pages use, in alphabetical order. Each links to the page that explains it further. [How Bitbybit works](/learn/how-it-works) puts most of them together.

### API {#api}
The functions under `bitbybit`, such as `bitbybit.occt.fillets.filletEdges`, which every editor, runner and package calls. A Rete component, a Blockly block and a TypeScript call with the same name are the same function. [Code](/learn/code/intro) maps it.

### Assembly {#assembly}
Parts placed together with names and colours, kept in a document that a STEP file can carry and other CAD programs read. [Assemblies](/learn/code/common/occt/assembly/intro); in the Designer, [components and joints](/learn/designer/assemblies/components).

### Asset {#asset}
The word has three uses:
- A **file in a project**, such as a STEP model, a font or an image, that its scripts load, kept in the cloud or in this browser and moved with the project. The editor's **browser asset catalog** keeps files for every project in this browser, for quick tests. [Assets](/learn/getting-started/basics/assets/intro).
- **`bitbybit.asset`**, the open-source functions that load such files, fetch files from a URL and start downloads.
- In 3D Bits, the **3D models** a merchant uploads for the storefront.

### Await {#await}
Kernel calls take time and run in a [worker](#web-worker), so in TypeScript each returns a promise you `await` before using its result. Rete components and Blockly blocks wait for you.

### B-rep {#b-rep}
Boundary representation: a solid described by the exact surfaces and curves that bound it, as OpenCascade keeps it, rather than by triangles. It is why a fillet stays round and a STEP file stays exact.

### BabylonJS, ThreeJS, PlayCanvas {#renderers}
The three 3D engines Bitbybit draws with. The editors on bitbybit.dev use BabylonJS; the npm packages and runners come in all three. [Game engines](/learn/getting-started/engines/babylonjs).

### Blockly {#blockly}
The editor where you build a script by snapping blocks together. [Blockly](/learn/getting-started/blockly).

### CAD Cloud {#cad-cloud}
Bitbybit's servers, which run geometry through a REST API, a TypeScript SDK and an MCP server, and return STEP, glTF or mesh files. [CAD Cloud API](/api/cloud-api).

### Code component {#code-component}
A Rete component that holds a TypeScript function, for the few lines where code says more than nodes. [Code components](/learn/getting-started/rete/typescript-editor-component).

### Community {#community}
Who may open a shared project: everyone (public), or members of the Silver or Gold plan. [Projects](/learn/getting-started/basics/projects/intro).

### Component {#component}
In Rete, one node of the graph: a function with its inputs on the left and its outputs on the right. In the Designer, a part or sub-assembly placed in an assembly.

### Composer {#composer}
The 3D Bits tool for building a Shopify product's 3D viewer and configurator without code. [Composer](/learn/3d-bits/composer/intro).

### Compound {#compound}
A group of OpenCascade shapes kept together as one shape but not joined, drawn and moved at once. [Compounds](/learn/code/common/occt/shapes/compound/intro).

### Converter {#converter}
The bitbybit.dev tool that turns STEP files into glTF in your browser, for Silver and Gold members. CAD Cloud converts in bulk. [Converter](/learn/tools/converter).

### Design document {#design-document}
The JSON the Designer keeps a part or an assembly in: its parameters, sketches, features and joints, in order. Agents can write one, and `bitbybit.occt.design.build` builds it. [Design documents](/learn/using-ai-with-bitbybit/design-documents).

### Designer {#designer}
Bitbybit's parametric CAD modeller, where you build by clicking: sketches, features, parts and assemblies with joints, every step editable. Part of the Gold plan. [The Designer](/learn/designer/intro).

### Draw {#draw}
Turning geometry into a mesh a 3D engine shows. A shape is computed whether or not it is drawn, and the drawing never changes the shape. [Drawing](/learn/getting-started/basics/drawing), [the draw functions](/learn/code/common/draw/intro).

### Edge, wire, face, shell, solid {#shape-kinds}
The kinds of OpenCascade shape, from small to large: an edge is a curve between two vertices, a wire a chain of edges, a face a surface bounded by wires, a shell faces joined at their edges, and a solid the volume a closed shell bounds. [OCCT shapes](/learn/code/common/occt/shapes/intro).

### Export to runner {#export-to-runner}
Turning an editor's script into JavaScript a [runner](#runner) executes on another website. [Runners](/learn/runners/intro).

### glTF, GLB {#gltf}
The standard format for 3D models on the web, with meshes, materials and animations; GLB is its single-file form. Bitbybit draws, imports and exports it.

### IFC {#ifc}
The open format of building models (BIM). `bitbybit.ifc` reads, writes and authors it. [IFC](/learn/npm-packages/ifc).

### Inspector {#inspector}
The bitbybit.dev tool for looking inside glTF, GLB and STL files, for Silver and Gold members. [3D inspector](/learn/tools/3d-inspector).

### JSCAD {#jscad}
A kernel that builds solids from polygons, good for quick shapes and 3D text. It builds along Z. [How it works](/learn/how-it-works#kernels).

### Kernel {#kernel}
The library that computes geometry. Bitbybit runs OpenCascade, Manifold, JSCAD and an IFC library, compiled to WebAssembly. [The kernels](/learn/how-it-works#kernels).

### Manifold {#manifold}
A mesh kernel whose booleans are fast and always give a closed solid, for thousands of cuts, lattices and scanned meshes. It builds along Z. [How it works](/learn/how-it-works#kernels).

### MCP {#mcp}
Model Context Protocol, the way AI agents connect to tools. The Bitbybit CAD MCP answers questions about the API; the CAD Cloud MCP runs geometry on CAD Cloud. [Using AI](/learn/using-ai-with-bitbybit/intro).

### Mesh {#mesh}
A surface made of triangles: what every engine draws, what Manifold computes with, and what STL files hold.

### Module {#module}
The word has three uses:
- A **Rete module**: part of a graph packaged with its own inputs and outputs and used as a component, many times. [Modules](/learn/getting-started/rete/modules).
- A **TypeScript file** that other files `import` from. [Files and imports](/learn/getting-started/typescript/files-and-imports).
- In JavaScript tooling, an **ES module** an npm package ships as.

### npm packages {#npm-packages}
Bitbybit's open-source libraries, `@bitbybit-dev/*`, for your own web app or Node service. [npm packages](/learn/npm-packages/intro).

### OCCT, OpenCascade {#occt}
The exact CAD kernel under most of Bitbybit's modelling: solids, fillets, booleans, STEP and IGES. [What is OCCT](/learn/code/common/occt/what-is-occt).

### Platform algorithms {#platform-algorithms}
The `bitbybit.advanced` and `bitbybit.things` functions, closed source, which run on bitbybit.dev and in the runners; some need the Silver or Gold plan. Tools that list the API call them `platform-pro`. [Plans](/learn/plans#platform-algorithms).

### Preview {#preview}
The page that shows a published script's result without its editor, and the address an embed frames on another website. [Publishing](/learn/getting-started/basics/projects/publish).

### Project {#project}
What holds your work on bitbybit.dev: scripts and the files they use, kept in the cloud or in this browser. [Projects](/learn/getting-started/basics/projects/intro).

### Rete {#rete}
The editor where you wire nodes into a graph that reruns as you change it. [Rete](/learn/getting-started/rete).

### Runner {#runner}
One JavaScript file that carries the kernels and an engine, so a script made in an editor, or code you write, runs on any web page from a `<script>` tag. [Runners](/learn/runners/intro).

### Script {#script}
One piece of work in a project, written in one editor: a Rete graph, a Blockly workspace, TypeScript files or a Designer design. [Scripts](/learn/getting-started/basics/scripts/intro).

### Shape, shape handle {#shape}
What an OpenCascade, Manifold or JSCAD function returns. In a browser the kernel keeps the shape in its [worker](#web-worker) and your code holds a handle, `{ hash, type }`, that it passes to the next call. [How it works](/learn/how-it-works#kernels-run-in-web-workers-and-shapes-are-handles).

### STEP, IGES, BREP {#step}
CAD file formats that keep exact geometry. STEP is the one most CAD programs exchange, and it can carry assemblies with names and colours; BREP is OpenCascade's own. [STEP and IGES](/learn/code/common/occt/io/step-and-iges).

### STL {#stl}
A mesh file of triangles, the usual format for 3D printing.

### Studio {#studio}
Bitbybit Studio, the dashboard of CAD Cloud, where you get API keys, try operations and follow tasks. [Studio](/api/studio/intro).

### Task {#task}
One CAD Cloud job: submitted, then followed until its result is ready to download. [CAD Cloud API](/api/cloud-api).

### Tolerance, precision {#tolerance}
How close is close enough. A kernel's tolerance decides when two points are the same; a drawing's precision decides how finely a curve is divided into triangles. Neither is a modelling dimension.

### TypeScript editor {#typescript-editor}
The editor where you write code against the whole API, in many files, with IntelliSense. It is built on Monaco, the editor of Visual Studio Code. [TypeScript](/learn/getting-started/typescript).

### Vertex {#vertex}
An OpenCascade point that belongs to a shape, at the ends of its edges. A plain point is just `[x, y, z]`.

### Web worker {#web-worker}
A background thread of the browser. Each kernel runs in one, so long calculations never freeze the page. [How it works](/learn/how-it-works#kernels-run-in-web-workers-and-shapes-are-handles).

### WebAssembly {#webassembly}
The format that lets compiled C++ run in a browser at close to native speed. The kernels are compiled to it.

### 3D Bits {#3d-bits}
Bitbybit's Shopify app, which puts 3D viewers and product configurators on product pages. [3D Bits](/learn/3d-bits/intro).
