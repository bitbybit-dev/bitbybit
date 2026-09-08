# CLAUDE.md - `@bitbybit-dev/occt`

The OpenCascade (OCCT) bindings. Shared package conventions are one level up in
`packages/dev/CLAUDE.md`; this file is only what is specific to `occt`.

**It ships prebuilt wasm alongside the JavaScript, and the wasm is not tracked here.** Three variant
directories sit beside the source: `bitbybit-dev-occt`, `bitbybit-dev-occt-64-bit` and
`bitbybit-dev-occt-64-bit-mt`, each with its emscripten glue, its typings and a content-hashed
`<variant>.<hash>.wasm` (about 35 MB, a new set on every kernel rebuild). `kernels.json` is the
manifest: per directory the hashed file name the glue references, its size, its SHA-256 and the url
it is published at. `npm run fetch-kernels` (the first step of `build-p`, also `npm run kernels:fetch`
at the root) verifies a kernel that is present against the manifest and downloads one that is
missing; `kernels:check` only verifies. A kernel on disk whose hash differs from the manifest is an
error, never overwritten: the deploy folder is the source of truth, and the mismatch means a kernel
build did not update the manifest. `npm run build-p` then copies all three directories into `dist/`
via `copy-occt`, with `NOTICE` and `licenses/` (OCCT is LGPL-2.1 with the Open CASCADE exception,
Draco is Apache-2.0; the package's own code is MIT). `check:tarballs` fails a tarball that lacks any
of it. A build that runs plain `npm run build` produces a package that type-checks and resolves but
**cannot run** - the kernel is missing.

The wasm is not built here. It is compiled from the OCCT fork and the bindings layer
(https://github.com/bitbybit-dev/OCCT and its BitbybitOcct module); that build deploys the glue,
the typings and the hashed wasm into the variant directory and rewrites `kernels.json`, and every
hashed reference in this repository (the `cdn.js` entries, the node examples) is synced to the file
on disk. Publishing a kernel uploads it as a release asset of the bitbybit-assets repository and
fills in the manifest's url; until then the entry has none, and a fetch anywhere but the building
machine stops and names the file.

Its only internal dependency is `@bitbybit-dev/base`, so it is built second, right after `base`.
`@bitbybit-dev/occt-worker` wraps it for off-main-thread use and is what applications normally
consume.

Suites here are kernel-heavy: keep the `NODE_OPTIONS` the scripts already set, or failures look
like test bugs rather than an exhausted heap.

## Services are built in a ring

Wires, operations, fillets and faces need each other in a cycle: wires needs operations and fillets,
operations needs wires and faces, fillets needs operations and faces, faces needs wires and fillets.
No construction order gives every one of them its collaborators.

Each link that closes a cycle is therefore passed in as a **supplier function**, called when it is
needed rather than when the object is built. Everything else is built in true dependency order, and
nothing is assigned onto a service afterwards. Replace a supplier with a direct reference, or go back
to assigning fields after construction, and collaborators are undefined at runtime.

## Living with the embind bindings

- Native calls return **embind vectors**: `.size()` and `.get(i)`, no `length`, no indexing. Treating
  one as an array yields `undefined` rather than an error, so the failure surfaces far from its cause.
- `TopAbs_State` arrives as a plain number: **0 = IN, 1 = OUT, 2 = ON, 3 = UNKNOWN**.
- **Overload resolution is fragile.** `BRepPrimAPI_MakePrism` must use the 2-argument form; faces go
  through `MakeFaceFromWireOnlyPlane` and `MakeFaceFromFaceSurfaceAndWire` rather than the
  `BRepBuilderAPI_MakeFace` constructor, to avoid an ambiguity that appears only at runtime.
  `BRepPrimAPI_MakeRevol` is the opposite case: 2 arguments for a full revolution, 4 for a partial one.
- **A deleted object throws on any method call** rather than becoming null, which is why validity is
  probed by calling and catching, and why disposal paths swallow.
- **Extra outputs arrive as result structures**, each carrying `IsValid`.
  `BRep_Tool_GetEdgeParameters`, `GetEdgeCurve` and `GetFaceUVBounds` return one. Nothing on this side
  passes an object in to be written into.

## Knowing whether something worked

The kernel reports failure inconsistently, so what counts as failure differs per entry point and is
not visible in the return type.

**A status code is not a result.** `ReadFile` returns `RetDone` for a file it parsed but could build
no model from, and the transfer then yields a null shape. Success has two parts, the status and a
non-null shape, and both loaders check both.

Two behaviours are stable and surprising, so assume the opposite at your peril:

- **A shape's transform always reads back as the identity.** Reading a transform reads the shape's
  placement, and rotation here is written into the geometry instead. A caller hoping to recover the
  rotation it applied will not find it there.
- **Folding transformations never sees an empty list.** A bare matrix is wrapped into a one-element
  list before any length is measured, and an empty array is treated as a bare matrix.

## Assemblies

The native document wants a node's matrix as a flat **row-major 3x4** (12 numbers); the public API uses
**column-major 4x4** and also accepts an ordered list. The manager folds and transposes at the
boundary. Passing a public matrix straight through transposes every placement, giving part positions
that look plausible and are wrong.

`loadedParts` reference their source document by index and **deliberately carry no shape data**, unlike
`parts`, which are serialised by index into the shapes array.

## A security boundary

**Dimension label expressions are filtered, then parsed - never evaluated.** A label is checked against
`[0-9 + - * / . ( ) space]` and only then handed to a small arithmetic parser; anything else is treated
as plain text. `eval` and `Function` are deliberately absent from this path, because these expressions
arrive in user-authored scripts.

