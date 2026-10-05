# Architecture - `@bitbybit-dev/playcanvas`

Why the PlayCanvas layer draws the way it does, where the code does not say so itself. The rules that
bite most often are in `CLAUDE.md` beside this file, and what the three renderers share is in
`core`'s `CLAUDE.md` and `ARCHITECTURE.md`; neither is repeated here.

## Lines

- A polyline entity is updated in place only when the point count of each of its polylines matches
  the one it was drawn with (`bitbybitMeta.linesForRenderLengths`, written from
  `computePolylineSignature`); anything else rebuilds it.
- Locked vertex buffer storage comes back from PlayCanvas either as the raw `ArrayBuffer` or as a
  typed view over it. `float32ViewOf` reads and writes both through one `Float32Array` on the same
  bytes.

## Points

Points are spheres drawn with hardware instancing (`setInstancing`). An application without a
graphics device cannot instance, so `createFallbackPointsMesh` then draws one sphere entity per point.

## Design builds

What picking reads from a drawn design build: each part entity's `designPart` gives the part and the
component path of each hardware instance, and its faces entity's `faceRanges` where each face's
triangles sit in each look's mesh, in render order.

## Tests

- A mocked engine class that the code under test constructs with `new` is written as a `function`
  expression inside `vi.fn`, never an arrow, because an arrow cannot be constructed (`MeshInstance`
  in `__mocks__/playcanvas.mock.ts`).
- `createMockContext` types its graphics device stand-in as the null device PlayCanvas ships, because
  the engine creates buffers through the concrete device; that is what makes the stand-in's members
  checkable at all.
- The mock camera has never rendered, so it has no viewport: `screenToWorld` hands the screen point
  back unchanged, which is enough for pans that read only the difference between two points, and
  `aspectRatio` is 1.
- The mock application's `mouse` and `touch` may be `null`, as a browser may provide neither, and the
  camera has to cope with their absence.
- `partialMock<T>` in `__mocks__/test-helpers.ts` asserts once, from `Partial<T>`, so every member a
  double supplies is checked against the real type. `asMockApp` reads an engine-typed handle that the
  mocked module built as the recording stand-in it is.
