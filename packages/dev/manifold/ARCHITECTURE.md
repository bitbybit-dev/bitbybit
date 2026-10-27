# Architecture - `@bitbybit-dev/manifold`

Why parts of this package work the way they do, where the code alone does not say. The kernel quirks
and conventions are in `CLAUDE.md` beside this file.

## Vertex merging

Why vertices are snapped at all is in `CLAUDE.md`. `VERTEX_MERGE_TOLERANCE` is absolute, not
relative: 1e-7 sits far above the noise of double arithmetic on ordinary CAD magnitudes and far below
any distance a model means to express. Two vertices either side of a grid line do not merge however
close they are; a neighbourhood search would catch them, but costs more than it is worth here.

## Building recipes

`recipes.build` executes a `Base.Recipe`, the format described in `packages/dev/base/ARCHITECTURE.md`.
It runs `assertRecipe` before the kernel is touched, builds every node once in order, then places each
root by transforming its node's solid with the root's matrix.

- **Winding is the executor's to settle.** A polygon's boundary is built as given with the `NonZero`
  fill rule, so either winding fills and a boundary that crosses itself keeps every loop. Its holes
  are each turned counterclockwise and built together as one cross section, `NonZero` too, so two
  holes that overlap are joined rather than cancelling each other, and that cross section is
  subtracted from the boundary's.
- **A compound is a union.** `Manifold.union` of its parts, since the kernel's own compose joins
  overlapping parts anyway, and a `union` node is the same call; an `intersection` is
  `Manifold.intersection`. A `voids` node subtracts the union of its `openings` from its `host` solid.
- **A turn is the kernel's revolve, moved into place.** `Manifold.revolve` turns a cross section about
  its Y axis, which becomes Z. The profile is first carried into the axis's frame (distance from the
  axis as X, along it as Y, on whichever side it lies), revolved with `circularSegments` scaled by the
  angle, and placed back by one proper rotation whose X is the profile's side, Y the axis crossed with
  it and Z the axis, so the profile starts where it lies and turns by the right-hand rule. A profile
  on both sides of its axis fails, since the kernel would keep only one side.
- **A loft is a mesh built here** (`recipe-loft.ts`), since the kernel has no loft. Every section is the
  profile's loops placed by its frame (a circle divided into `circularSegments` corners from angle 0),
  each corner joined to the same corner of the next section by two triangles, and both ends capped by
  the kernel's `triangulate`; the mesh is turned outwards by its signed volume, so frames that run
  backwards or mirror close as well; it is closed by construction, and the kernel collapses what is
  degenerate in it, such as a profile with no area. Profiles whose loops hold different numbers of
  corners are refused, and so is a loft no thicker than its coordinates' precision: its volume over
  its largest placed section's area at most `2^-20` of its farthest coordinate, sixteen times the
  float32 rounding of a vertex there. Frames that coincide, or that slide a profile within its own
  plane, would otherwise give a mesh of no volume that draws as a sheet; the exact kernel fails the
  same lofts by its own precision. Frames that mirror where the first does not are refused before
  any of this, by the validator.
- **A half-space is never built as a solid.** It stays a node until a difference applies it, as
  `trimByPlane` against its reversed normal, which keeps the side the normal points away from.
- **`adjustZtoY` is folded into each root's matrix**, as the rotation taking (x, y, z) to (x, z, -y),
  so nothing extra is built and no solid is turned inside out.
- **Every root's status is read** after it is placed; anything but `NoError` throws naming the node
  and the root, and a value the WASM throws that is not an `Error` is rewritten into one naming the
  node. A triangle mesh that is not closed fails naming its node.
- **`emptyWhenFailed` keeps going.** A node that fails is left unbuilt, and so is every node built
  from it; a root resting on one, or whose placement fails, comes back as an empty solid in its place.
  Strict is the default, since a viewer wants the rest of a building but a modelling step wants to
  know.
- **Memory bounds a single build.** The 32-bit WASM holds at most 4 GB, and every placed root is a
  mesh of its own, however many roots share a node: a model of over a hundred thousand elements (some 16 million
  triangles) does not fit in one build. Build such a recipe in parts.
- **Nothing outlives a failure.** Every node's result is released once the roots are placed, and when
  anything throws, the roots already placed are released too, so a recipe that fails halfway leaks no
  WASM memory.
- **An open mesh is drawn, not built.** `recipes.surfaceMeshes` hands base's `recipes.surfaceMeshes`
  the roots a caller names, typically the ones `build` gave back empty, and returns them in the shape
  `manifoldToMesh` gives (positions only, so the renderer computes their normals), with an empty mesh
  for a root that holds a solid step. The renderers draw that shape through `drawAnyAsync` directly.
- **`recipes.meshes` gives a drawer what it batches.** Each root is followed to its source with
  base's `recipes.sourceOf`, its rigid transforms folded into the placement, and the executor builds
  the recipe once and hands back a copy of each source's solid (`executeRecipeNodes`), undefined for
  one that failed. Each solid is meshed once with creased normals (`creasedMeshData`, which
  `decomposeManifoldOrCrossSection` uses too), and every root becomes a placement: its mesh or -1,
  its matrix with `adjustZtoY` folded in, its tag and group. A root whose source failed and that is
  triangles alone is drawn as its surface (base's `recipes.surfaceMeshes`, placed already); a root built
  empty, such as a host its openings cut away, draws nothing, so a cut host never comes back uncut.
  A door type placed a hundred times is one mesh, which is what lets the renderers instance it.

## Lofts and sweeps

`crossSection.operations.loft` and `sweep` give that mesh loft to any caller. `loft` takes
cross-sections (one, or one per frame) and frames, checks the frames as the validator checks a
recipe's (affine, not flattening, mirroring all or none) and lofts each cross-section's polygons
(`toPolygons`, outer loops counterclockwise and holes clockwise, as `triangulate` expects).
`sweep` drops repeated points from a path, rounds its corners by `roundedPath3` when given a corner
radius, in enough segments to keep each within `2 pi / circularSegments` of a turn, and places the
cross-section along it with base's sweep frames: tangents that halve each corner, X axes carried
along the path without twisting (from `xDirection` when given), and a corner frame stretched by the
mitre so the solid keeps its width through it. Both return the kernel's manifold, built by `ofMesh`.

## Drawing

The renderers draw a solid from `decomposeManifoldOrCrossSection` with `minSharpAngle`, which reads the
solid's plain mesh and computes its normals with base's `creasedMesh`: smooth across edges flatter
than the angle, split into one normal per face across sharper ones, so a cylinder shades round while a
box keeps its edges. The angle is the drawing option `minSharpAngle` (40 degrees) when
`computeNormals` is true, its default, and 0 when it is false, which shades every face flat by the
same path. The mesh comes back with six properties per vertex, the normal after the position.

The kernel's own `calculateNormals` is not used for drawing. On a solid built after many others, as a
recipe builds a whole building, its normals came back attached to the wrong vertices when read with a
plain `getMesh()`, and `getMesh` with a normal index (meant for normals the input meshes carried, turned
with each run's transform) wrote past its buffers and corrupted the kernel's memory. Neither happened on
a solid built alone, which is why the tests build a recipe's solid and a moved and turned one.

The renderers read the mesh through core's `manifoldMeshAttributes`, one path for all three: the
worker's normals when a vertex carries six properties, otherwise `creasedMesh` with the same angle on
the main thread. That covers a worker of an older release, which ignores `minSharpAngle` and sends
positions alone, and a mesh read some other way, so a cube keeps its edges whichever worker draws it,
where the engine's own normal computation would average them across the shared corners and shade it
round.

## Tests

`lib/api/__test__/kernel.ts` sets Manifold's WASM up once per process and every suite in a file
shares it; the service holds no state of its own beyond the kernel it wraps.

Every test runs with the kernel ledger (`lib/api/__test__/kernel-ledger.setup.ts`, the root
`scripts/README.md`): each outermost call through the service tree is checked for kernel objects it
made and left alive outside its answer. manifold-3d's own JavaScript leaks some of the vectors it
converts arrays through (`toPolygons` never deletes each polygon's vector, `extrude` and `revolve`
never delete the polygons they read, `triangulate` never deletes its result). The ledger tells those
apart by where they were made, not by their class: an object manifold-3d's own script made and no
call from our code returned is the library's, counted apart and bounded per call and per class in
`scripts/kernel-ledger.allow.json` (`foreign`), and anything else left alive is the call's. `extrude` translates
a centred solid itself, because the library's centring leaves the uncentred solid behind.
`kernel-lifetimes.test.ts` names the cases one at a time through `ledgerRun`.
