# CLAUDE.md - `@bitbybit-dev/occt`

The OpenCascade (OCCT) bindings. Shared package conventions are one level up in
`packages/dev/CLAUDE.md`; this file is only what is specific to `occt`.

**It ships prebuilt wasm alongside the JavaScript.** Three variants live beside the source:
`bitbybit-dev-occt`, `bitbybit-dev-occt-64-bit` and `bitbybit-dev-occt-64-bit-mt`. `npm run build-p`
copies all three into `dist/` via `copy-occt`. A build that runs plain `npm run build` produces a
package that type-checks and resolves but **cannot run** - the kernel is missing.

The wasm is not built here. It comes from the C++ superproject in `projects/occt-super`
(`occt-bitbybit` and `occt-bitbybit-pro`, each with its own `CLAUDE.md`). Publishing a new kernel
means updating CDN file hashes and the `bitbybit-assets` repository; `README.md` at the monorepo
root has the release order.

Its only internal dependency is `@bitbybit-dev/base`, so it is built second, right after `base`.
`@bitbybit-dev/occt-worker` wraps it for off-main-thread use and is what applications normally
consume.

Suites here are kernel-heavy: keep the `NODE_OPTIONS` the scripts already set, or failures look
like test bugs rather than an exhausted heap.
