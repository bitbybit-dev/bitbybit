# CLAUDE.md - `@bitbybit-dev/playcanvas`

The PlayCanvas integration layer over `@bitbybit-dev/core`. Shared package conventions are one level up
in `packages/dev/CLAUDE.md`; the shared draw rules are in `core`'s.

The engine is an ordinary dependency here, not a peer as it is in `babylonjs`.

- **Line width is not honoured here, and that is a limitation of the engine layer rather than an
  oversight.** A polyline or an OCCT edge is drawn as `pc.PRIMITIVE_LINES`, and WebGL renders a GL
  line one pixel wide whatever width is asked for - so `DrawBasicGeometryOptions.size` and
  `DrawOcctShapeOptions.edgeWidth` reach the draw path, are carried through it, and change nothing on
  screen. The parameters that would apply a width are named `_size` to say so at the call site.

  The other two renderers do honour it: `babylonjs` draws through `GreasedLine` and `threejs` through
  `LineSegments2`, both of which build the line as ribbon geometry a shader expands to any width.
  PlayCanvas ships no equivalent, so matching them means writing that expansion here - quad-strip
  geometry per polyline plus a shader that offsets its vertices in clip space by the viewport, and
  with it joins, caps, per-vertex colours and the update-in-place path. Generating the ribbon in
  world space instead, with no shader, is the cheap version and is not worth doing: it was tried in
  `threejs` and a sub-pixel world-space ribbon renders broken or, once a coverage mask resolves it,
  so faint the line disappears.

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
