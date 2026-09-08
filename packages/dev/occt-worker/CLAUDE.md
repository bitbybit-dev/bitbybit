# CLAUDE.md - `@bitbybit-dev/occt-worker`

The main-thread half of the occt-worker boundary. Shared package conventions, and the rules for crossing the
worker boundary at all, are in `packages/dev/CLAUDE.md`. What is specific to the caches lives here.

## The caches

- **Identity is the (hash, ptr) pair.** An entry is dropped only when both match.
- **Disposal is best-effort by necessity.** A freed WASM handle does not become null; calling anything
  on it throws. So the delete, null-test and cleanup calls are all wrapped in catches that swallow, and
  the same shape is legitimately reachable through two entries. Those empty catch blocks are
  deliberate: making them log or rethrow aborts a cleanup sweep part-way and leaks everything after it.
- **Non-geometry results are stored wrapped** as `{ value: result }`, so a plain cached value cannot be
  mistaken for a geometry handle.
- **Retention is bounded by a count, not by memory.** `startedTheRun` clears everything once more than
  `CACHE_THRESHOLD` hashes have been used; otherwise `cleanUpCache` keeps only the hashes touched in the
  run that finished and rolls that set forward. Together they are the only bound on WASM memory growth
  across a long session.

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
