# CLAUDE.md - `@bitbybit-dev/occt-worker`

The main-thread half of the occt-worker boundary. Shared package conventions, and the rules for crossing the
worker boundary at all, are in `packages/dev/CLAUDE.md`. What is specific to the caches lives here.

## The caches

- **The key is a pure function of the arguments.** `computeHash` is cyrb53 over the argument JSON,
  identical in all three kernel workers: 53 bits, non-negative, the same on every JavaScript engine. A
  hit is served on the key alone, without comparing the arguments, so the key has to separate inputs by
  itself - never seed it with anything environment-dependent, and never narrow it back to 32 bits (at
  10,000 live entries a 32-bit key hands back the wrong shape about once per hundred runs). Nothing is
  scrubbed from the JSON: a handle rehydrated into the arguments serializes as nothing but its cache
  hash, because embind keeps the pointer under a non-enumerable `$$`, and `cache-helper.test.ts` pins that.
- **Disposal is best-effort by necessity.** A freed WASM handle does not become null; calling anything
  on it throws. So the delete, null-test and cleanup calls are all wrapped in catches that swallow, and
  the same shape is legitimately reachable through two entries. Those empty catch blocks are
  deliberate: making them log or rethrow aborts a cleanup sweep part-way and leaks everything after it.
- **Non-geometry results are stored wrapped** as `{ value: result }`, so a plain cached value cannot be
  mistaken for a geometry handle. A wrapped result that holds kernel objects (a design's parts, a
  `*WithHistory` shape) is served again only while every one of them is still the live object its
  key holds; once one has been deleted the call is computed again, and the old objects still alive
  are freed as the new ones take their keys.
- **Freeing is deleting the handle, nothing more.** The kernel counts references, so a shape's data
  goes with its last handle. Never strip a shape before deleting it (`BRepTools::CleanGeometry`,
  `BRepTools::Clean`): a face taken from a solid, a copy, a boolean result and the bodies a design
  keeps for its next build all share data with live shapes, and stripping one strips them all - a
  freed face once took the surface off its solid, and a freed design part left the next build a
  solid of volume 0. `occ-worker-shared-shapes.test.ts` pins both through the real kernel.
- **Payloads are digested at any depth.** `toHashableArgs` replaces every large string and binary
  value in the arguments with a content digest, however deep it sits (a design's assets are in
  `inputs.assets`), copying objects only along the way to a replaced value, so ordinary arguments
  hash exactly as before. Kernel handles are never walked into.
- **A result that is a list of kernel objects is stored item by item.** Each item sits under a key
  derived from the call's key and its position (`itemHash`, never the arguments written out again), and
  the call's key holds the list of those keys, so an identical call is a hit. A list with an item
  deleted since is computed again, and the old items still alive are freed as the new ones take their
  keys - an object the new list hands back again is kept.
- **Retention is bounded by a count, not by memory.** Only two things bound it: the count threshold in
  `startedTheRun`, which clears everything once more than `CACHE_THRESHOLD` hashes have been used, and
  the delete commands (`deleteShape`, `deleteShapes`, `deleteDocument`, `cleanAllCache`). An entry a
  later run no longer uses stays until one of them frees it, so the threshold is the only automatic
  bound on WASM memory growth across a long session.

  It counts hashes because hashes are what this side can see. What one hash costs in WASM memory is
  unknowable from here - a point or a hundred-megabyte assembly - so no threshold in hashes can be
  tuned to a memory figure. The number is a practical ceiling on how far the cache drifts before being
  reset, and all three kernel workers use the same one under the same name.

- **`manifoldObjectHashes` is the liveness ledger** in the Manifold worker's sibling of this cache: an
  entry that was a handle but no longer carries embind's `$$` marker is evicted and reported as a miss
  rather than returned as a dangling pointer. That marker is an embind implementation detail and would
  not survive a change of bindings.

## Loading from a CDN

`new Worker()` refuses a cross-origin URL. OCCT workers are **ES modules**, so a same-origin blob that
statically imports the CDN script is built and the worker is constructed from that. The `initialise`
message exists so the worker can point at a different CDN **before** it loads its WASM; send it late
and a worker configured for a custom CDN has already fetched from the default one.
