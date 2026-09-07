# Conventions you cannot derive

Cross-cutting agreements that hold across the packages. Everything here is a choice, not a
consequence, so nothing in the code will tell you it.

## Handedness differs per kernel

JSCAD geometry is right-handed; OCCT and Manifold geometry is left-handed. The two-sided render path
branches three ways on it: a right-handed scene uses `CounterClockWiseSideOrientation`; a left-handed
scene holding left-handed geometry uses `ClockWiseSideOrientation`; JSCAD in a left-handed scene sets
no side orientation at all and relies on the winding. Winding reversal is skipped for JSCAD in
right-handed scenes and the normals are flipped instead.

**The back-face material cache key must therefore include both the geometry flavour and
`scene.useRightHandedSystem`.** Reusing a material built for the opposite handedness renders surfaces
black or inside-out.

## Y is up, and each disagreement is corrected at its boundary

- `manifold-3d`'s `CrossSection.revolve()` sweeps around Y and then treats that axis as Z, so the
  solid comes out lying down. The `matchProfile` branch rotates `[-90, 0, 0]` purely to put Y back up
  so the solid matches the profile the user drew.
- The DXF writer projects to 2D by **dropping Y**: 3D X becomes DXF X, 3D Z becomes DXF Y. All the
  `atan2` work in the arc and bulge code happens in that projection.
- `subdivideToHexagonWires` maps its local X to the face's **V** and local Z to **U**. Reversing the
  pair rotates and distorts every generated hexagon.
- 2D JSCAD points lift as `[x, y] -> [x, y, 0]`. Building a closing point as `[x, 0, y]` puts the last
  segment of every closed path in a different plane from the rest.

## Colour

**A colour array is normalized floats in 0-1**, multiplied by 255 at the draw boundary to make the
hex string the engines take. Nothing enforces that at runtime - only the array's length is checked -
so the convention has to be known rather than discovered.

Where JSCAD geometry arrives with a colour baked on (`mesh.color`, `polyline.color`), **that colour
deliberately beats the draw options**. This is intended precedence, and it is why a user's chosen
colour appears ignored for some JSCAD shapes and not others.

## Defaults that are easy to invert

- **`drawTwoSided` defaults to on.** Back faces are drawn unless the flag is exactly `false`.
  Rewriting the guard as a truthiness check inverts the default for everyone who omits it.
- **A 20-unit scene is the camera tuning baseline** in all three renderer packages. Distance, the
  distance or clipping limits, and the pan and wheel sensitivities are all derived from
  `sceneSize / 20` - but only for a caller who passes no camera options. Passing camera options opts
  out of the derivation, so an options object is tied to the scene size it was written for.
