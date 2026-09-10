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

The renderers' entry points now say so in their types: `Inputs.Draw.Drawn<E, T>` maps the entity a
caller passes to what drawing it produces - a tag to the drawn tag, a list of tags to the list, a
host-resolved overlay to something disposable, everything else to the renderer's own object. A layer
that adds entity kinds overrides the protected `drawResolved` / `drawResolvedAsync` seam rather than
the public method: two unresolved conditional types over the same `E` have no provable relation, so a
narrower override of the public signature cannot typecheck however correct it is.

**The three renderers' `Draw` namespaces are held to each other by a check, not by sharing.** Each
package owns a copy, and has to: a namespace cannot be merged across modules, and the declarations
name types that resolve per renderer - its own scene object, and its own `Base`, which extends the
shared one with `Texture` and `Material`. There is no package that could host them and still
typecheck them. So `npm run check:draw-parity` compares the copies instead: every declaration that
appears in more than one renderer must be identical once documentation is stripped, unless
`scripts/draw-parity.allow.json` says why it differs - the engine's metadata carrier, the update
slot's property name, BabylonJS's node arms. An entry that stops differing has to come off the list,
so it only shrinks. Documentation is not compared, deliberately: doc drift is worth fixing but
changes nothing a consumer runs, and failing on it would make the gate noisy enough to route around.

**`size` means two things, and no single default serves both.** On `DrawBasicGeometryOptions` it is
a point's diameter in world units *and* a line's width - pixels in the Three layer, world units at a
hundredth in the BabylonJS one. The default is calibrated as a diameter (0.1), so a polyline drawn
with an explicitly constructed options object asks for a line far thinner than a pixel and renders
too faint to see, in BabylonJS as much as in Three. The paths that matter escape it because
`defaultPolylineOptions` overrides `size` to 2, which is why this reads as a latent trap rather than
a visible bug. Splitting the two meanings is a public-surface change and has not been taken.

## Handedness

JSCAD geometry is right-handed; OCCT and Manifold geometry is left-handed. What decides how a surface
must be presented is the pair - what the geometry is, and what the scene expects - so **the back-face
material cache is keyed on both the geometry flavour and `scene.useRightHandedSystem`**. Keyed on one
alone it hands out a material built for the opposite convention, which draws black or inside out.

## verb

`bitbybit.verb` is deprecated and comes out in the next major; `packages/dev/CLAUDE.md` explains why.
Do not invest in it.
