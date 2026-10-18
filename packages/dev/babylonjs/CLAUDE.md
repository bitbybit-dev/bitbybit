# CLAUDE.md - `@bitbybit-dev/babylonjs`

The Babylon.js integration layer over `@bitbybit-dev/core`. Shared package conventions are one level
up in `packages/dev/CLAUDE.md`.

**The engine is a peer dependency here, not a hard one** - `@babylonjs/core`, `gui`, `havok`,
`loaders`, `materials`, `serializers`, plus `earcut`. Its siblings `threejs` and `playcanvas` take
their engines as ordinary dependencies instead. That asymmetry is load-bearing: applications that
install the engine themselves read **`peerDependencies`** to know which engine version to install,
so moving an engine between `dependencies` and `peerDependencies` changes what they get.

Because the engine is a peer, the consuming application supplies it. A version skew between the app's
Babylon and the one this package was built against surfaces at runtime, not at build time.

Adding a feature area follows a fixed shape: a class, its inputs, two index entries and the
aggregator. JSDoc tags on the public surface are read as data by documentation tooling, so a missing
tag produces a wrong result there rather than an error here.

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
- **A shape with its appearance is one mesh with a sub-mesh and a material per look**: a
  `MultiMaterial` over the cached look materials when there is more than one look, the cached material
  itself when there is one. Each triangle is written reversed as it is merged (`lookedMeshOf` with
  `reverseWinding`), as the plain kernel meshes are (`mergeMeshParts` with `reverseWinding`);
  `flipFaces` would read the indices back and upload them a second time, and on a mesh with
  sub-meshes Babylon then replaces them with one. `metadata.faceRanges` says where each face's
  triangles sit.
- **A JSCAD back face is wound from the triangles the worker sent, never from the front mesh's.**
  A mesh made in a left-handed scene takes `CounterClockWiseSideOrientation` by default and one made
  in a right-handed scene `ClockWiseSideOrientation`, so the back face reverses the JSCAD winding in a
  right-handed scene, where its material takes `CounterClockWiseSideOrientation`, and keeps it in a
  left-handed one. The front mesh reverses a copy (`flipFaces`): Babylon's geometry keeps a
  reference to the array it is given, so reversing the worker's own would hand the back face
  indices that were already turned round. `draw-helper-winding.test.ts` pins every back face on the
  `NullEngine`, which the engine mock cannot do, since its `flipFaces` does nothing.
- **A design build is one mesh and one greased line per part, both thin-instanced** from one matrix
  buffer per part, so a placement adds no node. The line follows the instances because the greased
  line's camera-facing vertex code places vertices through `finalWorld`, which carries the thin
  instance matrix on the PBR material type the lines use. A pose writes that buffer, calls
  `thinInstanceBufferUpdated` and refreshes the bounding info. A redraw disposes the part meshes,
  their `MultiMaterial` and the lines with their own materials, never the cached look materials.
  `draw-appearance.test.ts` runs all of it on the `NullEngine`, not the engine mock.
