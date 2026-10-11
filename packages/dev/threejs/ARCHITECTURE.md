# Architecture - `@bitbybit-dev/threejs`

Why the three.js layer draws the way it does, where the code does not say so itself. The rules that
bite most often - among them why a line is a `LineSegments2` with a width in pixels - are in
`CLAUDE.md` beside this file, and what the three renderers share is in `core`'s `CLAUDE.md` and
`ARCHITECTURE.md`; neither is repeated here.

## Lines

- `LINE_WIDTH_MIN_PX` floors a drawn line at one pixel. Below a pixel the ribbon `LineSegments2`
  builds stops covering pixel centres reliably and the line comes out broken or gone, because
  `LineMaterial` discards a fragment outside the ribbon rather than fading it. The library's defaults
  reach that regime without trying - a `size` of 0.1 scales to a thirtieth of a pixel. One pixel is
  what every line was before lines could carry a width, so no scene drawn at a default got thinner,
  and a `size` large enough to ask for more still gets it.
- A pixel width stays readable at any zoom, which is what an edge on a CAD model is for. The trade is
  that it does not thin out as a scene grows, the way a world-unit width does.
- The line material cache is keyed by the width rounded to `LINE_WIDTH_PRECISION` decimal places.
  Unrounded, two widths that differ in the last binary digit make two materials that never hit.
  Rounding bounds the keys to widths a scene can tell apart, and that is what lets this cache go
  without eviction: every line drawn at a width references its material and nothing tracks those
  references, so evicting one would blank lines still in the scene. `dispose()` is the single owner.
- `flattenVertices` is shared by the create and update paths so both lay out the same geometry.
  Written twice, one drifts, and an update silently writes a different shape than the draw did.

## Design builds

What picking reads from a design build's edges: the one `LineSegments2` carries in `userData` the
component path (`paths`) and part (`parts`) of each placement, where each placement's segments start
(`segmentStarts`), and per part where each edge's segments are (`edgeRanges`).

## Recipe meshes

A recipe drawn from its meshes is a group, added to the scene, with one `Mesh` per merged batch and
one `InstancedMesh` per instance group. A batch has a dynamic index and a four-component colour
attribute and a white `MeshPhysicalMaterial` with `vertexColors`; a group sets its matrices and an
`instanceColor` per instance, and its material carries the group's one opacity, because
`instanceColor` has no alpha and the plan groups instances by alpha for that reason. An instance
material has `vertexColors` off: its geometry has no colour attribute, which with the flag on draws
black. A state change writes the run into the attribute's array and adds an update range, so only
the run is uploaded, and the raycaster reads the same array; an instance hides by a matrix scaled
to zero. A pick names its element from `faceIndex` on a batch and `instanceId` on a group.

## Tests

`lib/api/bitbybit/draw-recipe-meshes.test.ts` raycasts drawn recipe meshes, through hidden elements
and onto shown ones, and reads the colours written back.

- `instanceOf` in `__mocks__/threejs.mock.ts` narrows a double with an `instanceof` check instead of
  an assertion. Where `three` is mocked its classes are these doubles, so a suite that forgot the
  mock fails there, by name.
- `partialMock<T>` in `__mocks__/test-helpers.ts` asserts once, from `Partial<T>`, so every member a
  double supplies is checked against the real type.
- A double has the shape the API says the real value has, even where nothing reads it:
  `createMockJSCADMesh` returns a minimal JSCAD solid although the suites mock the worker.
