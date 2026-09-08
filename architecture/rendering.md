# Rendering

The three renderer packages share a draw layer through `core` and differ only in their engine facade.
What follows is the shared behaviour first, then what each engine forces.

## Ordering that is load-bearing

`createOrUpdateSurfacesMesh` **mutates the MeshData array it is given**, so `createBackFaceMesh` must
be called with that array first. This holds at four call sites. Reordering the two for readability
silently builds back faces from mutated data.

## Back faces, and not reversing twice

`prepareBackFaceMeshData` negates supplied normals and reverses the triangle winding. When normals are
absent and are recomputed from the already-reversed indices they must **not** be negated: the reversed
winding alone points them correctly. Adding a symmetrical negation "for consistency" inverts back-face
lighting only for meshes that arrive without normals.

For the same reason, Manifold back faces must take their indices from the original `triVerts`, not
from `vertexData.indices`, which has already been reversed for the front mesh. Feeding the reversed
indices double-reverses the winding, and two-sided rendering appears to do nothing.

## Polylines

**Closing a polyline copies, never pushes**: `[...points, points[0]]`. Pushing onto the caller's array
made a configurator that holds and redraws its polylines grow one duplicate point per redraw, and the
growing count also defeated the updatable fast-path, which matches on stored point counts. This is a
fixed bug in all three renderers, and dropping the copy as an "optimisation" reintroduces it.

**Per-polyline colour arrays are seeded with the shared colour.** When one polyline carries its own
baked colour, the array is materialised by repeating the shared colour and only then overwriting the
entries that have their own. Seeding from empty dropped the shared colour, and the `lastColorRemainder`
strategy then painted every uncoloured polyline with the last one that had a colour.

## Materials

**The material cache self-evicts.** Every cached material registers an `onDispose` that deletes its
own key, so eviction only has to call `dispose()`, and a material disposed by the host application
disappears from the cache instead of being handed out dead. Adding an explicit `cache.delete()` beside
the eviction double-handles; removing the registration hands out disposed materials.

**Shared services are wired once for all three renderers.** `createSharedServices(context)` builds
every non-renderer service; only the engine facade and what draws through it live in each renderer
package. A new non-renderer service added directly to one `BitByBitBase` silently gives it to one
package only.

## Babylon.js

- **GreasedLine wants one colour per *point*, not per line**, and points in segmented form
  (consecutive `[start, end]` pairs where each end equals the next start). `segmentizePolylinePoints`
  converts, and detects already-segmented input so it is not converted twice. Segmentizing is
  **expensive and opt-in**: only the draw methods that render badly without it switch it on, and
  enabling it globally taxes every polyline draw.
- Point clouds are thin instances of one sphere per distinct colour, built with 6 segments but **1
  above 1000 points** for that colour. A deliberate quality-for-throughput threshold, and why large
  point sets look faceted.
- **`scene.metadata = { shadowGenerators: [] }` is the integration contract.** Every ShadowGenerator
  created for the scene must be pushed into that array; the io, glTF and scene paths all read it. A
  scene built by hand without it makes every shadow path throw or silently do nothing.
- **`mesh.receiveShadows = true` throws on a material-less mesh**, which glTF exporters produce
  routinely, so the assignment is wrapped. Removing the guard aborts asset loading for any model
  containing an empty node.
- A decal only appears once the mesh's material has `material.decalMap.isEnabled = true`. Assigning
  `mesh.decalMap` alone renders nothing, which reads as a broken feature rather than a missing step.
- **GLB bytes may be backed by a `SharedArrayBuffer`** when they came from a worker, and Blob will not
  accept one, so the view's range is sliced into a fresh ArrayBuffer first. `new Blob([glbData])`
  looks equivalent and fails for exactly the cross-worker case the method exists to serve.
- The blob URL for a `.babylon` download is kept on the instance **solely so the previous one can be
  revoked**. Making it a local leaks one URL, and its serialized scene string, per export.
- The `uniqueName` discriminator is base-36 of a random fraction with the leading `0.` removed, so it
  **contains no dot** - which is what keeps generated names safe for glTF importers - and is padded to
  8 characters because a small random number produces a shorter string.

## three.js

- **There is no unlit `MeshStandardMaterial`**, so unlit is faked by setting `emissive` to the base
  colour with intensity 1 and the material colour to **black**. The black looks like a bug; removing it
  double-lights the surface.
- `Texture.flipY` defaults to `true`, the **opposite polarity** of the API's `invertY`, so the
  assignment must be negated.
- **VSM shadows need much smaller bias than PCF.** `bias` (-0.0001) and `normalBias` (0.01) are scaled
  by `(sceneSize * groundScaleFactor) / 40`, tuned against a 40-unit shadow camera. Switching back to
  PCF without re-tuning gives peter-panning or acne.
- `startAnimationLoop` **measures the frame interval** and hands it to the camera update and to the
  caller's `onRender`. The first frame after each start reports 1/60, and a measured interval is
  clamped to 0.1 s so a backgrounded tab cannot deliver one enormous step. A fixed delta - which this
  used to use - runs camera inertia and any caller integrating against it at the wrong speed on every
  display that is not 60 Hz.
- Instanced points record their original indices in `instancedMesh.userData.pointIndices`, and the
  update path maps new positions back through it. Change the grouping or that field and points simply
  stop moving, without an error.
- On the update branch the entity type is read from the group's metadata rather than re-running the
  type probes, which is why that branch has no detect chain.
- When line segments must be rebuilt, the group's children are **disposed and the group cleared**
  before the new object is added. Adding without clearing leaves the old segments in the scene;
  clearing without disposing leaks their GPU buffers. Either half-fix grows unboundedly.
- The pitch setter clamps to **+/-89.9 degrees** on top of the user's limits, to stay off the poles
  where the spherical conversion and `lookAt` lose their up vector.

## PlayCanvas

- **Both `depthBias` and `slopeDepthBias` are needed** to push OCCT faces behind their edges (2 each
  when edges are drawn, and a further +0.1 on the back-face material, keyed into the cache). Setting
  only `depthBias` leaves edges z-fighting at grazing angles.
- **There is no per-texture UV transform.** PlayCanvas handles tiling, offset and rotation at the
  *material* level, so the texture DTO's values are stashed on the texture as a private
  `_bitbybitTransform` and re-applied per map slot when the texture is assigned. Delete that hop and
  every UV transform authored through `createTexture` is lost, because a PlayCanvas texture has
  nowhere to keep it.
- `flipY` defaults to `true` (the WebGL convention) while the API's `invertY = false` means "do not
  flip", so the assignment is `flipY: !inputs.invertY`. The two flags are inverses.
- **`invertZ` has nothing to do with Z**: it is realised as a `-1` multiplier on the V component of
  tiling, flipping the texture vertically in UV space.
- `metalnessMap` and `glossMap` share one texture, and PlayCanvas reuses the metalness UV transform
  for the shared gloss map, so the transform is applied **once, deliberately**.
- Texture filters are set **inside `image.onload`, after `setSource`**, not at construction.
- After setting the orbit camera's `pivotPoint`, the controller's internal `_pivotPoint` is copied to
  the same value so the camera **starts** at the target instead of gliding in under the inertia factor.
