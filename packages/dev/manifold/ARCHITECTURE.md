# Architecture - `@bitbybit-dev/manifold`

Why parts of this package work the way they do, where the code alone does not say. The kernel quirks
and conventions are in `CLAUDE.md` beside this file.

## Vertex merging

Why vertices are snapped at all is in `CLAUDE.md`. `VERTEX_MERGE_TOLERANCE` is absolute, not
relative: 1e-7 sits far above the noise of double arithmetic on ordinary CAD magnitudes and far below
any distance a model means to express. Two vertices either side of a grid line do not merge however
close they are; a neighbourhood search would catch them, but costs more than it is worth here.

## Tests

`lib/api/__test__/kernel.ts` sets Manifold's WASM up once per process and every suite in a file
shares it; the service holds no state of its own beyond the kernel it wraps.
