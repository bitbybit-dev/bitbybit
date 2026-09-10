# CLAUDE.md - `@bitbybit-dev/threejs`

The three.js integration layer over `@bitbybit-dev/core`. Shared package conventions are one level up
in `packages/dev/CLAUDE.md`; the shared draw rules are in `core`'s.

The engine is an ordinary dependency here, not a peer as it is in `babylonjs`.

- **There is no unlit `MeshStandardMaterial`.** Unlit is imitated by setting `emissive` to the wanted
  colour with intensity 1 and the material colour to **black**. The black reads as a mistake; removing
  it lights the surface twice.
- **`Texture.flipY` defaults to `true`, the opposite polarity to the API's `invertY`**, so the
  assignment is negated on the way through.
- **VSM shadows need a far smaller bias than PCF.** `bias` (-0.0001) and `normalBias` (0.01) are scaled
  by `(sceneSize * groundScaleFactor) / 40`, tuned against a 40-unit shadow camera. Switching to PCF
  without retuning gives detached shadows or surface acne.
- **The animation loop measures the frame interval** and passes it to the camera and to the caller's
  `onRender`. The first frame after each start reports 1/60, and any measurement is clamped to 0.1 s so
  a backgrounded tab cannot deliver one enormous step. A fixed delta runs camera inertia, and anything
  integrating against it, at the wrong speed on every display that is not 60 Hz.
- **Instanced points remember their original indices** in `instancedMesh.userData.pointIndices`, and
  the update path maps new positions back through it. Change the grouping or rename that field and
  points stop moving, with no error.
- On the update branch the entity type is read from the group's metadata rather than re-detected, which
  is why that branch carries no detect chain.
- **A line is `LineSegments2`, not `LineSegments`, and the width is in pixels.** WebGL renders a GL
  line one pixel wide whatever `LineBasicMaterial.linewidth` says, so a polyline or an OCCT edge is
  built as ribbon geometry through `LineSegments2` / `LineSegmentsGeometry` / `LineMaterial` from
  `three/examples/jsm/lines/*` - the first addon import in this package. `size` is scaled by
  `LINE_WIDTH_PER_SIZE` (a third) to land on the weight the BabylonJS layer draws.

  Matching that layer's *units* instead - world units at a hundredth of `size`, which is what it
  uses - was tried and rejected twice: a hundredth of a small `size` is well under a pixel across,
  and a sub-pixel ribbon renders broken, or, with `alphaToCoverage` resolving it, so faint the line
  disappears. BabylonJS's shader holds a thin line together where this one cannot.

  `LineMaterial` needs the viewport and this layer never sets it: `LineSegments2` writes the
  renderer's own viewport into the material before every frame, so a line is correct in a canvas that
  is not the window and stays correct across a resize. Setting it here as well is dead code that is
  overwritten before it is read. What the material's zero default does cost is picking - a line that
  has been drawn but not yet rendered raycasts as a miss, because `LineSegments2.raycast` bails while
  the resolution is still zero, where a plain `LineSegments` picked from the moment it existed.

  One material serves every line of a given width, cached by a rounded width and freed only by
  `dispose()`. A line does not own its material, so a path that rebuilds a line disposes its geometry
  and leaves the material alone.
- **`LineSegmentsGeometry` keeps positions and colours in interleaved instance attributes**, so a
  test reads `instanceStart` / `instanceColorStart` and one level further in through `.data.array`.
  `position` on that geometry is the ribbon template, not the line, and its `count` is segments where
  a plain attribute counted vertices - which is why those expectations are halved.
- **`size` is a point's diameter**, as it is in the BabylonJS layer. `THREE.SphereGeometry` takes a
  radius, so the draw path halves it. It read the value as a radius until the three renderers were
  measured against each other, which made the same script draw points twice the size here.
- **Rebuilding line segments needs both halves**: clear the group and dispose its children. Adding
  without clearing leaves the old segments in the scene; clearing without disposing leaks their GPU
  buffers. Either half alone grows without bound.
- The pitch setter clamps to **+/-89.9 degrees** on top of the caller's limits, to stay off the poles
  where the spherical conversion and `lookAt` lose their up vector.
