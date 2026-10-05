# Architecture - `@bitbybit-dev/babylonjs`

Why the BabylonJS layer draws and sets up a scene the way it does, where the code does not say so
itself. The rules that bite most often are in `CLAUDE.md` beside this file, and what the three
renderers share is in `core`'s `CLAUDE.md` and `ARCHITECTURE.md`; neither is repeated here.

## Back faces

Two-sided drawing adds a back-face mesh behind the faces. Kernel geometry gets its winding reversed
and its normals negated, with a clockwise `sideOrientation`, or counter-clockwise when
`scene.useRightHandedSystem` is set. JSCAD geometry is right-handed: in a left-handed scene its back
material keeps Babylon's default orientation, and in a right-handed scene the mesh keeps its winding
and only has its normals negated (`prepareBackFaceMeshDataNoWindingReversal`). The back-face material key carries both the JSCAD flag
and the scene's handedness, so the conventions never share a material.

## Lines

A greased polyline drawn before is updated in place only when it has the same number of lines, each
with the same number of points, coloured the same way (one colour, or a colour per point). Anything
else rebuilds it, because its colour texture is laid out per point. `metadata.linesForRenderLengths`
holds the point counts that check compares.

## Design builds

What picking reads from a drawn design build: each part's faces mesh and edges line carry, in
`metadata`, the part and the component path of each thin instance. The faces mesh also says where
each face's triangles sit (`faceRanges`), and the edges line which edge each of its lines draws, as
`shapes.edge.getEdges` numbers them (`edgeIndexes`).

## Nodes

Drawing a node parents an axis triad to it. The node is not geometry, so pickability and casting and
receiving shadows apply to the triad's lines (`applyNodeSettingsAndMetadata`). Sending a node through
the mesh path instead writes members onto an object that has none and registers a non-mesh as a
shadow caster, which the shadow map then walks as geometry.

The settings go to the triad the caller passes in, never to the node's own meshes. Any transform node
can be drawn - a loaded model hangs its whole mesh tree off one - and asking the node for its meshes
would make every mesh of the model unpickable and register each one again as a shadow caster.

## Scene

- The projected ground material allows `PROJECTED_GROUND_MAX_LIGHTS` lights. It reads lights only for
  their shadows, yet every scene light takes one of its light slots, and Babylon's default of four
  drops the shadow of the fifth light.
- `createPbrSkybox` builds the PBR skybox that `scene.createDefaultSkybox` would, without calling it:
  that helper is registered together with the VR and XR experience helpers, which a bundle that only
  views models would otherwise have to ship.

## Tests

- Coverage is measured over `lib/api`. `lib/gui-enriched-babylon.ts` is outside it on purpose: it is
  a re-export shim over `@babylonjs/gui` with no logic of its own.
- `__test__/headless.ts` builds a real scene on the `NullEngine` carrying what an attached scene
  carries: the `shadowGenerators` metadata the draw paths record into, a camera under the name the
  camera API adjusts, and the root transform node. A suite built on it asserts what the engine ends
  up holding rather than which call was made.
- `instanceOf` in `__mocks__/babylonjs.mock.ts` narrows a double with an `instanceof` check instead
  of an assertion. Where `@babylonjs/core` is mocked its classes are these doubles, so a suite that
  forgot the mock fails there, by name.
- `MockTransformNode` is deliberately not a mesh. The synchronous draw path skips detection when it is
  handed a `BABYLON.Mesh`, treating it as an update, so the node branch can only be reached with
  something that is a node and not a mesh.
- `MockMeshMetadata` is the set of keys this package writes into `mesh.metadata` and reads back, not
  an engine type; Babylon types `metadata` as `any`.
- `MockMesh` keeps `_parent` and `_scene` non-enumerable, so serialising a mesh to JSON does not
  recurse through its parent and scene.
- The line-system mocks update and return the `instance` they are handed and record their points and
  material options. A mock that built a fresh mesh every time reported zero vertices, which kept the
  update paths and every colour and width decision out of reach of an assertion.
- `partialMock<T>` in `__mocks__/test-helpers.ts` asserts once, from `Partial<T>`, so every member a
  double supplies is checked against the real type. `contextWithSceneDouble` is the one place a
  `MockScene` meets a `Context`; take the `MockScene` it returns rather than reinterpreting
  `context.scene`.
