# CLAUDE.md - `@bitbybit-dev/core`

The engine-agnostic layer: everything the three renderers share, plus the verb wrappers. Shared
package conventions are one level up in `packages/dev/CLAUDE.md`.

## The shared draw layer

`DrawHelperCore` is the base class all three renderer helpers extend, and
`createSharedServices(context)` builds every service that is not engine-specific. Adding a
non-engine service directly to one renderer's `BitByBitBase` gives it to that package alone; the
other two silently lack it.

**Reverse a triangle once, not twice.** There are two ways to flip which side a surface presents:
reverse the winding, or negate the normals. `prepareBackFaceMeshData` picks one according to what it
was given. Normals supplied with the mesh are negated and the winding reversed; normals recomputed
from the already-reversed winding already point correctly and must not be negated as well. Manifold
back faces take their indices from the original `triVerts`, not from the front mesh's reversed copy,
for the same reason.

**The colour array is dense, one slot per polyline.** A draw call carries one shared colour and any
polyline may override it with a colour baked onto its geometry. The array is built by filling every
slot with the shared colour first, then overwriting the ones that have their own, so slot *i* always
describes polyline *i*. Built sparsely, the gap-filling strategy spreads one polyline's colour over
every uncoloured polyline after it.

**Colour is normalized 0-1**, scaled to bytes at the draw boundary. That boundary is where the
convention is enforced: a component outside the range is reported and clamped, because the scaling
otherwise produces a hex string of the wrong length that no engine reads as a colour.

**Drawing a tag returns the tag.** A tag is an HTML overlay positioned from the scene, not geometry,
so it can never satisfy a check for the engine's own object type. Routing a drawn tag through a step
written for scene objects fails for every tag rather than some, which is why the tag path has its own.

## Handedness

JSCAD geometry is right-handed; OCCT and Manifold geometry is left-handed. What decides how a surface
must be presented is the pair - what the geometry is, and what the scene expects - so **the back-face
material cache is keyed on both the geometry flavour and `scene.useRightHandedSystem`**. Keyed on one
alone it hands out a material built for the opposite convention, which draws black or inside out.

## verb

`bitbybit.verb` is deprecated and comes out in the next major; `packages/dev/CLAUDE.md` explains why.
Do not invest in it.
