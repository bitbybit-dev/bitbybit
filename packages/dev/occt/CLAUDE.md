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
