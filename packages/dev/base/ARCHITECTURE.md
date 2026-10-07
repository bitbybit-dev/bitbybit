# Architecture - `@bitbybit-dev/base`

Why parts of this package work the way they do, where the code alone does not say. The conventions
are in `CLAUDE.md` beside this file.

## Kernel calls

- `describeKernelFailure` reports a WebAssembly trap (an error named `RuntimeError`) as kind `crash`,
  apart from an ordinary kernel failure, because a trap leaves the kernel's memory in an unknown state
  and nothing the kernel holds can be trusted afterwards.
- A `KernelOperationError` is recognised by its `name`, not by `instanceof`: the error may have been
  thrown by another copy of the class than the one describing it, and `instanceof` matches only its
  own. Only a string `code` makes it a named failure.

## Frames

- Code that reduces a caller's list of vectors (`reachOf`, the largest coordinate) loops over it
  instead of spreading it into `Math.max`. A spread passes every element as an argument, and a long
  list overflows the call stack.
- `bestFit` decides every sign the points leave open the same way every time. When their turning is
  too small to read, or the first point lies across the widest spread, the axis is flipped so that its
  largest component is positive (`withLargestPositive`). Components within
  `EQUAL_COMPONENT_TOLERANCE` (1e-12) of each other count as equal and the first of them decides, so
  rounding cannot tip the choice; OCCT's frames break the tie the same way. When the points spread
  evenly every way in their plane, X points at the first point that does not sit on the center.

## Shared geometry helpers

`services/helpers/` holds the plain arithmetic the public services stand on, written once for every
package that needs it on a hot path: `vectors` (2D and 3D tuple operations), `frame-axes` (frames
squared, points and vectors moved between a frame and the world, frames placed in frames, a frame as a
matrix), `polygons` (signed area, winding, point in polygon, perimeter), `triangulation`, `arcs`
(the circle through three points, and points along it) and `mesh-measures` (signed volume). They take
and return tuples and flat arrays, never DTOs: a service call builds an object per call and `mul`
resolves its defaults each time, which costs 10 to 300 times the arithmetic, and a file reader calls
these per vertex. The services are the public face of the same code - `Frame` moves points through
`frame-axes`, `Vector.cross` is `cross3`, and `mesh.triangulatePolygon`, `mesh.signedVolume`,
`polyline.polygonNormal`, `polyline.polygonArea` and `point.arcThroughThreePoints` wrap the rest - so
the helpers themselves stay internal and can change shape freely.

- **The frame helpers keep the `Frame` service's own order of operations**, `(x * u + y * v) + z * w`,
  so moving its private methods out changed none of its results.
- **`triangulateFace` never drops a vertex.** It cuts a planar face with holes in the plane of its
  Newell normal: a triangle as it is, a convex loop as a fan, anything else by ear clipping with each
  hole bridged to the outline from its leftmost point, as earcut does. A point on an edge is where a
  neighbouring face meets this one, and leaving it out would open the shell there, so when no proper
  ear is left it clips a flat one, and then any one, which keeps every edge of every loop in the
  result. A face with no area becomes a fan of flat triangles for the same reason. The triangles face
  the way the outline turns; holes may be given either way round.
- **An arc through three points runs from the first through the second to the third**, about the
  normal of the three, so the same formula serves points in a plane and in space. Points on one line,
  or two at one place, fix no circle and give nothing.

## DXF export

`services/helpers/dxf/dxf-generator.ts` writes one of two versions, chosen by `acadVersion`:

- `AC1009` (R12), the default. Its readers expect the VPORT, VIEW, UCS, APPID and DIMSTYLE tables
  and a BLOCKS section even when they are empty, and an APPID entry for `ACAD`, so those are written
  empty rather than left out.
- `AC1015` (2000) adds entity handles and subclass markers (`AcDbSymbolTable`,
  `AcDbLayerTableRecord`). Handles count up in upper-case hexadecimal from 0x101.

A `#RRGGBB` colour is written as the nearest of the nine standard AutoCAD Color Index entries (1-9)
by RGB distance, or, with `colorFormat: "truecolor"`, as ACI 256 (by layer) followed by group 420
holding `r * 65536 + g * 256 + b`. Near-black (every channel under 30) and anything that is not
`#RRGGBB` become ACI 7, which viewers draw black on a light background and white on a dark one.

A polyline is written closed when it has at least three points and its first and last agree within
`CLOSED_POLYLINE_TOLERANCE` in X and Y.

## Recipes

`Base.Recipe` (in `inputs/base-inputs.ts`) is a format, not a service: solids described as a list of
steps a kernel can execute, so the package that describes geometry and the kernels that build it
never depend on each other. It lives here because base is the only package all of them share. The
format, `checkRecipe`, `assertRecipe` and `RecipeIssue` are `@beta` until it is declared stable. How
the Manifold kernel builds one is in `packages/dev/manifold/ARCHITECTURE.md`.

- **Nodes refer backwards only.** A node names earlier nodes by their position, so a recipe is acyclic
  by construction and an executor builds it in one pass, each node once however many nodes and roots
  refer to it.
- **Numbers sit in two typed buffers**, `f64` for coordinates and `i32` for triangle indices, and nodes
  point into them by range, so a large recipe is two flat arrays and a small JSON skeleton. Across a
  worker boundary both are copied by structured clone like any other input; nothing transfers them,
  since a transferred buffer is detached on the sending side and the caller, or a cache, may still
  hold the recipe.
- **What the numbers mean is fixed; how finely they are built is not.** A circle's faceting is the
  executor's choice, so two kernels build close solids, not identical ones. `tolerance` and
  `millimetresPerUnit` describe the data for whoever reads the results; an executor builds in the
  recipe's own units and need not apply either. A compound is the space its parts fill together, so
  an overlap counts once.
- **A polygon is its boundary's region less its holes' regions.** The boundary and the holes may run
  either way round, a boundary that crosses itself keeps every loop, and holes may overlap each other
  or reach past the boundary: only the part of the holes inside the boundary is removed.
- **`checkRecipe` is the one validator**, run before any executor touches a kernel, and linear in the
  size of what it is given: indices in range and backwards, ranges inside their buffers, and the whole
  `f64` buffer checked once for finite coordinates within `MAX_RECIPE_COORDINATE` (a billion units:
  past about twenty billion, Manifold's cross sections fail inside the WASM). Depths, radii, circle
  centres and directions keep to the same bound. Placements - matrix entries and half-space origins -
  may reach `MAX_RECIPE_PLACEMENT` (ten trillion), so a model placed in survey coordinates, millions of
  metres out and given in millimetres, passes while its profiles stay small. A matrix must be affine
  (0, 0, 0, 1 as its bottom row) and must not flatten what it transforms; it may mirror. Triangle
  indices stay inside their positions, and there are caps on every list, on the numbers all ranges
  refer to together (`MAX_REFERENCED_NUMBERS`, since many nodes may share one range) and on nesting
  (`MAX_RECIPE_DEPTH`, 1000: a long chain of booleans costs a kernel time that grows with the square
  of its length). Which buffer reads are safe is decided by the range checks themselves, never by
  searching the issue list, which is capped at `MAX_ISSUES` so a hostile recipe cannot make the report
  large. A half-space is accepted only as a difference's tool, and a polygon or circle only as what an
  extrusion sweeps.
- **The validator cannot see every failure.** Transforms that compose past what a double holds, or a
  boolean the kernel cannot complete, surface only when the kernel evaluates the result, so an
  executor checks what it built and names the node that failed.
- **A root made of triangles alone needs no kernel.** `recipeSurfaceMeshes` follows a root through
  transforms and compounds to its triangle nodes and places them by the composed matrices, turning a
  triangle round under a mirroring one as a kernel's transform does; any other step makes the root
  undefined. It exists for meshes a solid kernel refuses, such as a building model's open furniture
  surfaces, which can still be drawn as the surfaces they are. It checks the recipe once with
  `assertRecipe` for all the roots it is asked for, so asking root by root costs a check each time.
