# CLAUDE.md - `@bitbybit-dev/babylonjs`

The Babylon.js integration layer over `@bitbybit-dev/core`. Shared package conventions are one level
up in `packages/dev/CLAUDE.md`.

**The engine is a peer dependency here, not a hard one** - `@babylonjs/core`, `gui`, `havok`,
`loaders`, `materials`, `serializers`, plus `earcut`. Its siblings `threejs` and `playcanvas` take
their engines as ordinary dependencies instead. That asymmetry is load-bearing: the tooling that
provisions a runtime reads **`peerDependencies`** as the source of truth for which engine version
to install. Moving an engine between `dependencies` and `peerDependencies`
therefore changes how the runners resolve it.

Because the engine is a peer, the consuming application supplies it. A version skew between the app's
Babylon and the one this package was built against surfaces at runtime, not at build time.

Adding a feature area follows a fixed shape: a class, its inputs, two index entries and the
aggregator. JSDoc tags on the public surface drive code generation downstream, so a missing tag
produces a wrong result there rather than an error here.

The shared draw rules live in `core`'s `CLAUDE.md`. What Babylon itself forces:

- **GreasedLine wants one colour per *point*, not per line**, and points in segmented form:
  consecutive `[start, end]` pairs where each end repeats the next start.
  `segmentizePolylinePoints` converts, and detects already-segmented input so it does not convert
  twice. Segmentizing is expensive and opt-in - only the draw methods that render badly without it
  switch it on, and enabling it globally taxes every polyline draw.
- Point clouds are thin instances of one sphere per distinct colour, built with 6 segments but **1
  above 1000 points** of that colour. A deliberate quality-for-throughput threshold, and why large
  point sets look faceted.
- **`scene.metadata = { shadowGenerators: [] }` is the integration contract.** Every ShadowGenerator
  made for the scene must be pushed into that array; the io, glTF and scene paths all read it. A scene
  built by hand without it makes every shadow path throw or silently do nothing.
- **`mesh.receiveShadows = true` throws on a material-less mesh**, which glTF files routinely contain
  as empty nodes, so the assignment is wrapped. Removing the guard aborts asset loading for such a
  model.
- A decal appears only once the mesh's material has `material.decalMap.isEnabled = true`. Assigning
  `mesh.decalMap` alone renders nothing, which reads as a broken feature rather than a missing step.
- **GLB bytes may be backed by a `SharedArrayBuffer`** when they came from a worker, which `Blob`
  refuses, so the view's range is copied into a fresh `ArrayBuffer` first. `new Blob([glbData])` looks
  equivalent and fails for exactly the cross-worker case the method exists to serve.
- The blob URL for a `.babylon` download is kept on the instance **so the previous one can be
  revoked**. Making it a local leaks one URL, and the serialized scene behind it, per export.
- **`uniqueName` is a counter plus a per-session random discriminator**, and needs both: the counter
  makes names unique by construction within a session, the session part keeps them from colliding with
  names minted in another tab, a worker, or an older file being imported back. The name contains **no
  dot**, because a glTF importer that reads a trailing dot-and-digits as a duplicate marker can parse a
  long digit run into a fixed-width integer and abort.
