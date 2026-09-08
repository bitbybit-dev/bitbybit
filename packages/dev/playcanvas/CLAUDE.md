# CLAUDE.md - `@bitbybit-dev/playcanvas`

The PlayCanvas integration layer over `@bitbybit-dev/core`. Shared package conventions are one level up
in `packages/dev/CLAUDE.md`; the shared draw rules are in `core`'s.

The engine is an ordinary dependency here, not a peer as it is in `babylonjs`.

- **Pushing OCCT faces behind their edges needs `depthBias` and `slopeDepthBias` together** - 2 each
  when edges are drawn, plus a further 0.1 on the back-face material, which is part of its cache key.
  Setting only `depthBias` leaves edges z-fighting at grazing angles.
- **There is no per-texture UV transform.** PlayCanvas keeps tiling, offset and rotation on the
  *material*, so the texture DTO's values are parked on the texture as a private `_bitbybitTransform`
  and re-applied per map slot when the texture is assigned. Remove that hop and every UV transform
  authored through `createTexture` is lost, because a PlayCanvas texture has nowhere to keep it.
- **`flipY` and `invertY` are inverses.** PlayCanvas defaults `flipY` to `true`, the WebGL convention,
  while `invertY = false` means "do not flip", hence `flipY: !inputs.invertY`.
- **`invertZ` has nothing to do with Z**: it is a `-1` multiplier on the V component of tiling, which
  flips the texture vertically in UV space.
- `metalnessMap` and `glossMap` share one texture, and PlayCanvas reuses the metalness UV transform for
  the shared gloss map, so the transform is applied **once, deliberately**.
- Texture filters are set **inside `image.onload`, after `setSource`**, not at construction.
- After setting the orbit camera's `pivotPoint`, the controller's internal `_pivotPoint` is set to
  match, so the camera **starts** at the target rather than gliding in under its inertia factor.
