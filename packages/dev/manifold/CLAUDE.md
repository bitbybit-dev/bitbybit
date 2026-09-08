# CLAUDE.md - `@bitbybit-dev/manifold`

The Manifold kernel wrapper. Shared package conventions are one level up in `packages/dev/CLAUDE.md`.

**Objects are WASM-backed and are not garbage collected.** Dropping the last JavaScript reference frees
nothing. An operation chaining N kernel calls creates N objects, N-1 of them intermediates nobody
wants, and each must be deleted explicitly. The transforms loop collects every intermediate it creates,
keeps the final one to return, and deletes the rest. Any new operation that chains kernel calls has to
account for its intermediates the same way: the cost is invisible per call and unbounded per session.

**The mesh buffer is interleaved.** `vertProperties` is one flat `Float32Array` with a stride of
`numProp` - x, y, z first, then any further properties - and `triVerts` is a flat `Uint32Array` grouped
in threes, so a vertex's data starts at `index * numProp`. Reading it as though the stride were always
three, or as an array of points, produces geometry that is wrong rather than absent, and only once a
mesh carries normals or UVs. `fromPolygonPoints` writes `numProp = 3` because that path carries
positions only.

**Vertex identity has to be reconstructed, and position is the only signal.** A list of polygon points
is a list of independent triangles: a shared corner appears once per triangle meeting there, and
nothing says those are the same vertex. A solid needs that identity, and exact float comparison does
not supply it - two paths to the same corner agree to about fifteen decimal places, not perfectly. So
coordinates are snapped to `VERTEX_MERGE_TOLERANCE` before being compared.

That makes the tolerance a real parameter. Closer than it, occurrences merge and the surface closes.
Further apart, they stay distinct - and a corner that does not merge is a hole, which the kernel
rejects outright as "Not manifold" rather than returning an unsound solid. Snapping has the boundary
snapping always has: two positions either side of a grid line do not merge however close. A gap wider
than the tolerance is a real gap, and failing on it is correct.

`toPolygonPoints` checks it was handed a Manifold at all before calling into it, because types cannot
enforce that across a worker boundary or from untyped script.
