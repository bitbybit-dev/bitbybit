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
  overlapping parts anyway; a `voids` node subtracts the union of its `openings` from its `host`
  solid.
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
  mesh of its own, however many roots share a node: a model of 167 thousand elements (16 million
  triangles) does not fit in one build. Build such a recipe in parts.
- **Nothing outlives a failure.** Every node's result is released once the roots are placed, and when
  anything throws, the roots already placed are released too, so a recipe that fails halfway leaks no
  WASM memory.
- **An open mesh is drawn, not built.** `recipes.surfaceMeshes` hands base's `recipeSurfaceMeshes`
  the roots a caller names, typically the ones `build` gave back empty, and returns them in the shape
  `manifoldToMesh` gives (positions only, so the renderer computes their normals), with an empty mesh
  for a root that holds a solid step. The renderers draw that shape through `drawAnyAsync` directly.

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
