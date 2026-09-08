# JSCAD and Manifold

## JSCAD

**Shape kinds are told apart by property.** A 2D region (`geom2`) carries `sides`, a 3D solid
(`geom3`) carries `polygons`, and a path carries neither and is drawn by a different handler. The
detection is written as a TypeScript type predicate so the check and the use are the same statement.

**Flat geometry has no faces**, so anything flat is extruded by **0.001** purely so a renderable mesh
exists. That number is not a kernel tolerance; it is an arbitrary near-zero thickness. Removing it
yields an empty mesh, and enlarging it makes 2D drawings visibly thick.

**A JSCAD geometry carries exactly one flat 4x4 matrix.** The kernel uses matrices extensively rather
than applying them to vertex data, so any conversion out of JSCAD must bake the transform into the
points itself. Because there is only ever one matrix, earlier branches handling a list of matrices and
a list of lists were unreachable and have been removed - do not re-add them speculatively, and do not
drop the transform step, which silently emits untransformed geometry for anything that was moved.

**`shapeToMesh` computes the normals it declares.** Its mesh data type states `normals` as a required
array, and for a long time it allocated one and returned it empty, so every renderer recomputed the
same values for itself. It now fills them through `computeVertexNormals`, the one implementation, which
lives in `base` beside the other internal helpers because both this package and the shared draw helper
need it and neither may import the other. A renderer that receives mesh data over a worker still guards
against an empty array: nothing enforces a type across that boundary, so the guard is a boundary check
rather than dead code.

**`toPolygonPoints` trusts its own producer.** It reads `shapeToMesh`, which always returns both arrays
and always pushes three numbers per vertex and one dense index per vertex, so earlier guards refusing a
missing array, a length that is not a multiple of three, or an index outside the vertex range were
unreachable and have been removed. The two remaining early returns, for positions or indices that are
empty, are reachable: a geometry with no polygons produces them. Do not re-add the others - reaching
them at all needed a test that replaced `shapeToMesh` on the instance.

**`entity-narrowing.ts` exists to keep the casts in one place.** The published input type is
deliberately the union of all three shape kinds, because a script may hand over any of them and the
kernel decides; the kernel's own operations are overloaded per kind and never accept a mixture.
Tidying that module away pushes unchecked casts back into every service.

`JSCADPolygon.createFromCurve` builds a JSCAD 2D polygon from a verb-nurbs curve. Conversion between
different CAD kernels was considered to belong above a kernel-specific package, so this one is in the
wrong layer by the project's own standard.

## Manifold

**Objects are WASM-backed and are not garbage collected.** Chaining N transforms creates N
intermediate Manifolds that leak unless each is deleted; the transforms loop collects every
intermediate, pops the final one to return, and deletes the rest. Any new operation that chains kernel
calls must dispose its intermediates the same way, or a long session accumulates unreclaimable heap.

**The mesh buffer layout is interleaved.** `vertProperties` is one flat `Float32Array` with a stride
of `numProp` (x, y, z first, then any extra properties) and `triVerts` is a flat `Uint32Array` grouped
in threes, so a vertex's data starts at `index * numProp`. Reading the buffers as if they were
3-stride, or as arrays of points, produces silently scrambled geometry as soon as a mesh carries
normals or UVs.

`fromPolygonPoints` hardcodes `numProp = 3` because that path carries positions only; normals and UVs
are deliberately unsupported there and would need a larger stride to match. It de-duplicates vertices
by an **exact** `"x,y,z"` string key, so vertices differing by floating-point noise stay separate. That
is the known reason a mesh built from polygon points can be non-watertight at a seam, and snapping the
coordinates before the call is the only way to close it today.

`toPolygonPoints` guards with `typeof inputs.manifold.getMesh === "function"`. Every real Manifold
declares `getMesh`, so the guard always passes and the `else` throw is unreachable in normal use; it
exists only to catch a caller who passes something that is not a Manifold at all, which the TypeScript
declaration cannot prevent.
