# Architecture - `@bitbybit-dev/occt`

What the code cannot say for itself: why something is done the way it is, the OCCT behaviour it works
around, and the numbers behind its limits. `CLAUDE.md` beside this file covers the build, the embind
rules, failure reporting and the assembly manager; `lib/services/design/README.md` is the design
record of `occt.design`.

## Kernels older than the package

The package runs on kernels built before some of its functions existed - a pinned or a custom
build - so it detects what the loaded kernel has instead of assuming it.

- **A missing function** is checked by presence. Without `DocumentToMeshBuffers` a shape is meshed
  through the kernel's JSON instead, which carries no iso curves and no surface analysis; without
  `IsoCurvePolylines` or `SurfaceAnalysisAtMeshNodes` the mesh comes back without what they add.
- **A function that gained trailing arguments** is recognised by its arity (`fn.length`), and the new
  arguments are passed only when the call takes them (`finenessFor`, `upFor`). A buffer mesh call
  without the fineness arguments meshes at 0.5 rad with an absolute precision. A glTF export call
  without the up-axis argument writes every document as z-up, so a y-up export is refused on such a
  kernel as an input error rather than written turned.

## Meshing

- The angular deflection is checked to lie from 0.001 to pi radians before any call: a kernel
  refuses an angle outside that range, and the JSON path it would fall back to meshes at 0.5 rad, so
  a wrong angle would otherwise pass unnoticed.
- The kernel refuses a zero pull direction whatever surface analysis it measures, so the analyses
  that read none are handed `[0, 1, 0]` (`UNREAD_PULL`). Draft angles come back in degrees.
- The buffer path copies the mesh out of wasm memory and frees the kernel's copy. Every array is
  checked against the face and edge records it belongs to (`checkLengths`, `checkContents`), so a
  kernel with another record layout fails there instead of drawing a mesh with holes. Colour groups
  are rebuilt as the JSON path writes them: each `#rrggbbaa` colour, in sorted order, with its faces.

## Faces

- `OutlinesOnFace` takes every outline in one call, as flat lists (`OutlineList`): per outline its
  corner count, its corners as x and y pairs, the radius its corners are rounded with, and a
  placement in the face's parameter space, `u = x * scaleU + shiftU`, `v = y * scaleV + shiftV`. The
  kernel leaves out outlines that reach outside the face's trims or into its holes.
- `FaceNormalsAtUV` turns a normal over where the face is reversed or mirrored, so every normal
  points out of the material.
- Point queries (`FacePointsAtUV`, `FaceNormalsAtUV`, `ClosestPointsOnShape`) take all their points
  in one call, which prepares the shape once rather than once per point.

## Fillets

- `FilletWireCorners` rounds each corner of a wire in the plane of the two edges that meet there, and
  reads a radius of 0 as a corner to leave sharp. A radius of 0 or less that the caller asked for is
  therefore refused before the call; passed through, it would come back as a wire rounded nowhere.
  The corners it could not round come back counted from 0 and are reported counted from 1.
- `fillet2d` on a wire tries OCCT's 2D fillet first. When that is not done and every given radius is
  above 0, it falls back to `FilletWireCorners`, reading its inputs as the first path does: corners
  counted from 1, a `radiusList` without `indexes` giving each corner in turn its radius, listed
  corners taking the entries of `radiusList` in their order along the outline, and listed corners the
  wire does not have passed over. `fillet3DWire` counts `indexes` from 0.
- Edge indexes are checked against the numbering of `shapes.edge.getEdges` before rounding or
  bevelling, so a history always describes edges that were made.

## Booleans and features

The booleans and the feature kernels (holes, bosses, pockets) often return a compound that holds a
single solid. The services unwrap a compound that holds nothing but one solid, however deeply
nested, and return any compound that also holds a face or a wire as it is.

## Offsets

- `BRepOffsetAPI_MakeOffset` in open mode offsets a wire within a face, and would offset the face's
  own boundary too. An open offset on a face therefore lies in an unbounded plane through that face,
  with its normal (`planeFaceOf`). The face must be flat and the wire must lie in its plane; otherwise
  the maker fails, and it can crash when the wire runs across the face.
- On an unbounded plane face the maker offsets to the left of the wire seen from the face's normal,
  whatever the sign of the distance.
- Its result is a wire or a compound holding one; anything else is a failed offset.

## Transforms

- Public matrices are flat arrays of 16 numbers in column-major order (`Base.TransformMatrix`), as
  glTF, WebGL, Babylon.js and three.js write them and as `getLabelTransform` returns them. A point
  transforms as `p' = M * p`, and a list (`Base.TransformMatrixes`) applies first to last.
- A scale factor that is not finite or is below 1e-100 in size is never handed to the exact
  transform: a curved shape scaled that close to 0 shrinks to a point, and the kernel never returns
  from building it.

## Wires

- A point that splits a wire is projected onto every edge and the nearest projection wins; an edge
  the projection fails on is passed over.
- The split parameter snaps to the edge's first or last parameter when the point lies within 1e-7 of
  that end (`snappedToEdgeEnds`). A split at a vertex then matches the split the wire's own ends
  make; without it a rounding error inside the edge cuts off a piece of length 0.

## Sections and slices

Slicing turns the shape so the slicing direction is the Y axis, slices each solid in one kernel call
(`SliceByFrames`) and turns the faces back onto the direction. A plane given twice receives the same
face twice from the kernel, which is kept once; a shape too thin to slice gives an empty compound.
One call refuses to cut more than 100000 slices (`MOST_SLICES`): a step too small for the shape, or
for its distance from the origin, would otherwise loop for a very long time.

## Drawings

- The kernel builds a projected drawing on the XY plane, and its edges carry curves on that plane
  only. `BRepLib_BuildCurves3d_Simple` builds their 3D curves before the drawing is turned onto the
  XZ ground plane; turning it first loses the edges.
- The SVG writer negates every y, since SVG's y axis points down.

## Files

- BREP text is recognised by its header (`CASCADE Topology V<n>`, optionally after the
  `DBRep_DrawableShape` line OCCT's DRAW writes before it) and its ending (the `TShapes` table, then
  the reference to the shape it holds). Text the kernel finds damaged is refused as an input error
  that says where.
- Mesh exports work on a copy of the shape without its mesh, so they triangulate at their own
  precision and leave the caller's mesh alone. `adjustYtoZ` places that copy with y and z swapped,
  which turns Y-up into Z-up; the swap is a mirror, so the mesh writers turn the triangles of a
  mirrored placement to keep them facing out, and a placement moves a face that carries only a mesh
  too. STL data swapped after the fact (`stlWithYAndZSwapped`) likewise swaps y and z in every normal
  and corner and reverses each triangle's winding, binary or ASCII.

## Documents, PMI and validity

- DTOs that take a document handle leave its lifetime to the caller, who frees it with `delete()`
  (`deleteDocument()` through the worker).
- A root of an XCAF document cannot be placed. When a root assembly node carries a placement other
  than the identity, `buildAssemblyDocument` puts every root node under one top assembly named
  "Assembly", as the builder names the one it makes for loose instances, and keeps the placement
  relative to it.
- The kernel writes product manufacturing information as JSON, where a value JSON cannot hold (an
  infinite or undefined number) is null; it is read back as NaN.
- The kernel's validity report numbers each kind of sub-shape in its distinct list, each sub-shape
  once, while the getters of vertices, wires, faces, shells and solids count every occurrence.
  `shapeFix` maps a reported index to the first occurrence, grouping occurrences by the kernel's
  shape hash (taken modulo 2147483647).

## SVG import

- **Everything SVG is understood in TypeScript** (`lib/svg`): the XML, the path mini-language,
  transforms, the style cascade and units. It is reduced to the four exact segment kinds SVG path data
  can express - line, quadratic Bezier, cubic Bezier, elliptical arc - and every basic shape (rect,
  circle, ellipse, line, polyline, polygon, rounded corners, smooth-curve shorthands) becomes those.
  Coordinates stay in SVG user space, y down, until the path builder, so the normaliser is testable
  without the kernel.
- **The style cascade** covers presentation attributes and inline `style`, inherited down the tree.
  Stylesheets are out of scope: a `<style>` element produces a warning rather than silent
  mis-styling. Unsupported elements produce a warning with a hint, and `<use>` matters most: it
  places geometry defined inside `<defs>`, which is skipped, so a drawing built that way would
  otherwise import as nothing with no explanation.
- **Path data is tokenised per command**, not by one split into numbers: an arc's large-arc and sweep
  flags are single digits that may be written without separators (`016` in an arc is `0, 1, 6`), and
  a general number reader misreads nearly every arc drawing tools write. An incomplete argument
  group ends the command. Arcs are converted once from endpoint to centre parametrisation, after the
  SVG 1.1 implementation notes, and a full ellipse is two 180-degree arcs, because one 360-degree arc
  is degenerate.
- **Transforms are exact.** A matrix is `[a, b, c, d, e, f]` as in SVG's `matrix(a b c d e f)`:
  `x' = a*x + c*y + e`, `y' = b*x + d*y + f`. Lines and Beziers map their control points. An arc is
  re-derived from the combined matrix by a closed-form 2x2 singular value decomposition: with the arc
  as `M = L * Rot(phi) * diag(rx, ry)`, `L` the linear part `[[a, c], [b, d]]`, and
  `e = (m00 + m11) / 2`, `f = (m00 - m11) / 2`, `g = (m10 + m01) / 2`, `h = (m10 - m01) / 2`,
  `q = hypot(e, h)`, `r = hypot(f, g)`, the new radii are `q + r` and `|q - r|` and the new tilt is
  `(atan2(h, e) - atan2(g, f)) / 2`. A negative determinant, a reflection, reverses the sweep.
  Flattening arcs into segments instead would lose the exact geometry CAD input needs.
- **One native call builds a whole drawing.** The path builder encodes every group into flat buffers
  for `BuildShapesFromSegments`, which makes each segment exact geometry (a low-degree Bezier, a
  rational conic arc), optionally joins each subpath into one B-spline, and returns one compound
  child per group, in order.
- **Faces follow the fill rule**, not "the largest wire is the outside": an element may hold several
  disjoint regions, holes, and solids inside holes, and SVG does not constrain winding. The face
  builder turns every wire counterclockwise, finds each wire's nesting depth by containment, decides
  which depths are filled (`evenodd` by the depth's parity, `nonzero` by the summed winding of the
  original orientations), and builds one face per filled region with its immediate unfilled children
  as holes, turned clockwise so OCCT cuts them. Containment takes two tests: the enclosing wire holds
  the other's centroid and has the strictly larger absolute area. The centroid test alone cannot
  order two outlines drawn around one centre - a ring, a washer, a letter with a counter - and those
  are ordinary. A region whose face cannot be built is passed over. All of it runs on the flat wires
  before placement.
- **Placement**: the drawing is built in the XY plane, turned onto the XZ ground plane like the other
  on-ground primitives, anchored by its combined bounding box according to `alignment`, then oriented
  to `direction` and moved to `center`.

## Design documents

- `design.build` refuses a document `validate` faults, and the builders rely on it: they do not
  check again that no component is moved by two joints, and they recurse into sub-assemblies because
  `validate` refuses an assembly that contains itself. Code that builds a document runs `validate`
  first.
- Ids that become part of a face's name - a sketch command's, a hole position's - match
  `[A-Za-z_][A-Za-z0-9_-]*`: never a bare number, and never the `.`, `:`, `@` or `#` the name grammar
  splits on.
- An operation's history twin returns its histories in input order: `shape` first, then `shapes`.
- A shell tries arc joins, then intersection joins, because neither is right everywhere: a filleted
  block opened at its top is valid only with intersection joins, one opened at its bottom only with
  arc joins.
- `toTypeScript` replaces control characters and line separators with spaces in any document text it
  writes into a `//` comment: a line break would end the comment and run the rest as code. It
  parenthesises the operand of a unary `-` or `!` unless that is an atom or another sign, because
  TypeScript refuses a sign directly before `**`.

## Tests

`vitest.config.ts` runs a process per file because the kernel holds global state, and raises the
timeouts (30 s a test, 60 s a hook) because building through the real kernel is slower than a unit
test, and the first load of the wasm slower still.
