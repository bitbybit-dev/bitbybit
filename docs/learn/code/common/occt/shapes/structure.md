---
sidebar_position: 9
title: Inside a Shape - Its Graph and Its Geometry
sidebar_label: Graph and Geometry
description: Looking inside an OpenCascade shape - the graph of solids, shells, faces, edges and vertices and how they connect, read with occt.brepGraph, and the curves and surfaces beneath them, built and read with occt.geom - with a table of every function.
topic: code.occt.shapes.structure
type: explanation
tags: [code, occt]
---

# Inside a shape: its graph and its geometry

An OpenCascade shape has two layers. The **topology** says what the shape is made of and how the parts connect: a solid bounded by shells, a shell made of faces, faces bounded by wires of edges, edges ending in vertices. The **geometry** says where each part lies: the surface a face is cut from, the curve an edge follows, the point a vertex sits at. A cylinder's side face is a piece of an infinite cylindrical surface, trimmed by two circular edges.

Most scripts never look at either layer directly: they build, combine and select. These two namespaces are for when you need to.

## The graph: `occt.brepGraph`

`bitbybit.occt.brepGraph` reads a shape as a graph and answers in plain data:

- `analyze` counts what the shape is made of, and the distinct surfaces and curves behind it;
- `faceAdjacency` lists, for every face, the faces it shares an edge with;
- `edgeFaceMap` lists, for every edge, the faces it belongs to and whether it is a seam;
- `vertexEdgeMap` lists every vertex with the edges that meet there;
- `faceInfo`, `edgeInfo` and `wireInfo` describe the geometry behind each face, edge and wire: the kind of surface or curve, its bounds and its continuity;
- `containment` maps upward, from faces to shells to solids;
- `assembly` reads an assembly's products and the places each is used;
- `dump` writes out the whole structure, and `validate` checks it for dangling or inconsistent links.

Every query returns its answer with an `ok` flag and an error message rather than stopping the script, so a batch of queries can report what failed item by item. `nodeOfShape` finds the node that stands for a sub-shape, and `reconstruct` turns a node back into the real face or edge, to draw it, measure it or build on it.

Reach for the graph to find faces by how they connect, such as every face next to a selected one, or to understand a shape that came from a file. To pick faces and edges by what they are and where they lie, [selecting by rule](../select/intro) is simpler.

## The geometry: `occt.geom`

`bitbybit.occt.geom` reaches beneath the topology to the curves and surfaces themselves:

- `surfaces.surfaceFromFace` reads the surface a face lies on, without its boundary, and `surfaces.cylindricalSurface` makes an infinite cylinder;
- `curves` makes 2D curves, segments, ellipses and trimmed pieces, for constructions in the UV space of a surface, and evaluates them at a parameter. `geomCircleCurve` and `geomEllipseCurve` make full circles and ellipses as closed wires.

A surface or a 2D curve cannot be drawn on its own: it has no boundary. Wrap it into a face or an edge first, with `occt.shapes.face` and `occt.shapes.edge`, such as `faceFromSurfaceAndWire`, which trims a surface by a wire. This is how a pattern is drawn on a curved face: build it in the face's UV space, then put it on the surface.

## Every function

### The graph

{/* api:occt.brepGraph:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`analyze`](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph#analyze) | Counts what a shape is made of: solids, shells, faces, wires, edges, coedges and vertices, the distinct surfaces and curves behind them, and any assembly products and occurrences. |
| [`assembly`](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph#assembly) | Reads the assembly structure of a shape as products and occurrences: a product is a part or sub-assembly defined once, an occurrence is one placement of it with a matrix and a parent. |
| [`containment`](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph#containment) | Maps the shape's parts upward: which shells each face belongs to, which solids each shell belongs to, and which solids each face ends up in. |
| [`dump`](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph#dump) | Dumps the whole structure of a shape: every solid, shell, face, edge and vertex with its unique id and the parts directly below it. |
| [`edgeFaceMap`](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph#edgeFaceMap) | Lists, for every edge, the faces it belongs to, its end vertices and its topology flags, such as whether it is a seam or a border edge. |
| [`edgeInfo`](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph#edgeInfo) | Describes the geometry of every edge: the kind of curve it follows, its parameter range, its continuity and a unique id. |
| [`faceAdjacency`](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph#faceAdjacency) | Lists, for every face, the faces that share an edge with it, along with its edges, wire count and outer wire. |
| [`faceInfo`](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph#faceInfo) | Describes the geometry of every face: the kind of surface it lies on, its UV bounds, whether it carries a triangulation, and a unique id. |
| [`nodeOfShape`](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph#nodeOfShape) | Finds the graph node that stands for a given sub-shape of a shape: its kind, its index and its unique id. |
| [`reconstruct`](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph#reconstruct) | Turns a node of the graph, given by its kind and index, back into the real sub-shape it stands for, so a face or edge found by a query can be used in an operation. |
| [`validate`](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph#validate) | Checks the structure of a shape's graph for problems such as dangling references or inconsistent links, and lists every issue found with its severity. |
| [`vertexEdgeMap`](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph#vertexEdgeMap) | Lists every vertex with its 3D point, its tolerance and the edges that meet there. |
| [`wireInfo`](https://docs.bitbybit.dev/classes/Bit.OCCTBrepGraph#wireInfo) | Describes every wire: whether it is closed, whether it is the outer boundary of its face, how many coedges and distinct edges it has and which face owns it. |

{/* api:occt.brepGraph:end */}

### The geometry

{/* api:occt.geom:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`curves.geom2dEllipse`](https://docs.bitbybit.dev/classes/Bit.OCCTCurves#geom2dEllipse) | Creates a 2D ellipse curve in a plane, for constructions in the UV space of a surface. |
| [`curves.geom2dSegment`](https://docs.bitbybit.dev/classes/Bit.OCCTCurves#geom2dSegment) | Creates a straight 2D curve segment between two 2D points, for constructions in the UV space of a surface. |
| [`curves.geom2dTrimmedCurve`](https://docs.bitbybit.dev/classes/Bit.OCCTCurves#geom2dTrimmedCurve) | Cuts a piece out of a 2D curve between the parameters `u1` and `u2`. |
| [`curves.geomCircleCurve`](https://docs.bitbybit.dev/classes/Bit.OCCTCurves#geomCircleCurve) | Creates a full circle as a closed single-edge wire, lying in the plane whose normal is `direction`. |
| [`curves.geomEllipseCurve`](https://docs.bitbybit.dev/classes/Bit.OCCTCurves#geomEllipseCurve) | Creates a full ellipse as a closed single-edge wire, lying in the plane whose normal is `direction`. |
| [`curves.get2dPointFrom2dCurveOnParam`](https://docs.bitbybit.dev/classes/Bit.OCCTCurves#get2dPointFrom2dCurveOnParam) | Evaluates a 2D curve at a parameter and returns the 2D point there. |
| [`surfaces.cylindricalSurface`](https://docs.bitbybit.dev/classes/Bit.OCCTSurfaces#cylindricalSurface) | Creates an infinite cylindrical surface of the given radius around an axis through `center` along `direction`. |
| [`surfaces.surfaceFromFace`](https://docs.bitbybit.dev/classes/Bit.OCCTSurfaces#surfaceFromFace) | Reads the underlying surface a face lies on, without its boundary. |

{/* api:occt.geom:end */}
