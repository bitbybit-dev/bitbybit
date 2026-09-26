# CLAUDE.md - `@bitbybit-dev/manifold-worker`

The main-thread half of the manifold-worker boundary. Shared package conventions, and the rules for crossing the
worker boundary at all, are in `packages/dev/CLAUDE.md`. What is specific to the caches lives here.

## The caches

- **Identity is the (hash, ptr) pair.** An entry is dropped only when both match.
- **Disposal is best-effort by necessity.** A freed WASM handle does not become null; calling anything
  on it throws. So the delete, null-test and cleanup calls are all wrapped in catches that swallow, and
  the same shape is legitimately reachable through two entries. Those empty catch blocks are
  deliberate: making them log or rethrow aborts a cleanup sweep part-way and leaks everything after it.
- **Non-geometry results are stored wrapped** as `{ value: result }`, so a plain cached value cannot be
  mistaken for a geometry handle.
- **A result that is a list of kernel objects is stored item by item.** Each item sits under a key
  derived from the call's key and its position (`itemHash`, never the arguments written out again), and
  the call's key holds the list of those keys, so an identical call is a hit. A list with an item
  deleted since is computed again, and the old items still alive are freed as the new ones take their
  keys - an object the new list hands back again is kept.
- **Binary data in the arguments is keyed by a digest of its bytes**, at any depth - a mesh's
  vertex and triangle arrays sit inside `mesh` - because JSON writes a typed array out one element
  at a time as an object, which took seconds per call on a large mesh, hits included.
- **Retention is bounded by a count, not by memory.** `startedTheRun` clears everything once more than
  `CACHE_THRESHOLD` hashes have been used, and that is the only bound on WASM memory growth across a
  long session: until then an entry stays until a delete command or `cleanAllCache` frees it.
  `cleanUpCache`, which would keep only the hashes the finished run touched, has not been called
  since 2021, when the per-run sweep was switched off over problems never pinned down; it is kept and
  tested, but nothing relies on it.

  It counts hashes because hashes are what this side can see. What one hash costs in WASM memory is
  unknowable from here - a point or a hundred-megabyte assembly - so no threshold in hashes can be
  tuned to a memory figure. The number is a practical ceiling on how far the cache drifts before being
  reset, and all three kernel workers use the same one under the same name.

- **`manifoldObjectHashes` is the liveness ledger.** An entry that was a handle but no longer carries
  embind's `$$` marker is evicted and reported as a miss rather than returned as a dangling pointer.
  That marker is an embind implementation detail and would not survive a change of bindings.

## Loading from a CDN

`new Worker()` refuses a cross-origin URL. This worker is a **classic** worker, loaded through a blob
using `importScripts`, and is published 32-bit only, so it takes no architecture argument. The
`initialise` message exists so it can point at a different CDN **before** it loads its WASM; send it
late and a worker configured for a custom CDN has already fetched from the default one.
