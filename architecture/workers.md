# The worker boundary

Why it is shaped this way is in `ARCHITECTURE.md`. This page is what you have to respect when working
across it.

## Workers return hashes, never geometry

The main thread cannot receive a live kernel pointer, so every worker reduces its result to a cache
handle (`{ hash, type: "manifold-shape" }`, or the bare hash for JSCAD) and rehydrates any input
carrying such a handle from its own cache before dispatching. Real geometry is only produced by
calling a tessellation method with the hash.

That cache is also the memoisation layer an interactive caller relies on, which is why a cache clean
makes a previously returned handle unusable ("not found in cache") rather than silently recomputing. A new worker method
that returns a kernel object directly either fails structured clone or hands the main thread a
meaningless pointer.

## `uid` is the correlation key

It is echoed unchanged on both the success and the error reply, and it is the only thing telling the
manager which pending promise to resolve. **A request that produces no reply strands its caller
forever**, which is why the error branch wraps its own `postMessage` in a second try/catch that falls
back to a minimal message built from the error text alone.

## Structured clone drops prototypes

A DTO instance posted to a worker arrives as a plain object. That is why the worker-side types are
plain records and why the manager casts inputs to `Record<string, unknown>`: the cast describes what
the other side actually receives. Do not rely on DTO methods, getters or `instanceof` inside a worker.

## Things that must not cross, or must cross untouched

- **Materials cannot cross.** Babylon, three.js and PlayCanvas material objects are deeply circular
  and throw `DataCloneError`, so `getSafeWorkerOptions` shallow-copies the draw options while dropping
  `faceMaterial`. Every worker call accepting a material must go through it.
- **Typed arrays must pass through the recursive walkers untouched.** Both the shape resolver and the
  result serializer short-circuit on `ArrayBuffer` and its views before their generic object branch;
  the generic branch would rebuild them through `Object.keys` as objects with numeric string keys and
  destroy the payload. Dropping that guard corrupts every binary import and export while leaving all
  shape operations working, so only the file-IO tests would catch it.
- **File and Blob conversion belongs on the main thread.** Input resolution inside the worker is
  synchronous and reading a Blob is not, so the API layer converts to `ArrayBuffer` before posting. A
  Blob that still reaches the resolver throws an explicit "this is a bug in the API layer" rather than
  being silently mangled.
- **Never `JSON.stringify` a binary input in an error path.** Stringifying a multi-megabyte STEP or
  glTF buffer can crash V8, turning a readable failure into a dead worker and a hung promise. Binary
  values are reported as `[<ctor> length=<n>]`; everything else is truncated at 200 characters.

## Results can nest shapes at any depth

The SVG importer returns `{ shapes: [{ shape, ...metadata }], viewBox, warnings }`. The cache walks
the whole result and gives every shape found at any depth a path-derived hash. This is mandatory, not
an optimisation: the serializer only converts a shape into a reference if it has a hash, so an
unhashed shape never reaches the main thread and the next call that takes it fails.

## The caches

- Identity is the **(hash, ptr) pair**; an element is dropped only when both match.
- **Disposal is best-effort by necessity.** A freed embind handle does not become null, and calling
  any method on it throws, so `delete()`, `IsNull()` and the OCCT clean calls are all wrapped in
  catches that swallow. The same shape is legitimately reachable through two entries. Those empty
  catch blocks are deliberate: making them log or rethrow aborts a cache sweep part-way and leaks the
  rest.
- `manifoldObjectHashes` is the **liveness ledger**: an entry that was a handle but no longer carries
  embind's `$$` marker is evicted and reported as a miss rather than returned as a dead pointer. The
  `$$` test is an embind implementation detail that would not survive a binding change.
- Non-geometry results are stored **wrapped** as `{ value: result }`, so a plain cached value can be
  told apart from a geometry handle.
- **Retention:** `startedTheRun` wipes everything only once more than 10000 hashes have been used;
  `cleanUpCache` otherwise keeps just the hashes touched in the run that finished and rolls the set
  forward. Together they are the only bound on WASM memory growth in a long editing session, and what
  they bound is a **count of hashes** - 10000, hand-picked - rather than anything measured from
  memory.

## Workers loaded from a CDN

OCCT workers are ES modules and are **not** constructed from the CDN URL directly: a same-origin blob
that statically imports the CDN script is built instead, which is what avoids the cross-origin
restriction on `new Worker()`. JSCAD and Manifold workers are **classic** workers loaded through a
blob using `importScripts`, and are published for 32-bit only, so they take no architecture argument.

The `initialise` message posted to the OCCT and Manifold workers exists so they can override their CDN
provider *before* loading WASM; delaying it makes a worker built against a custom CDN fetch its kernel
from the default one. The JSCAD worker deliberately receives no such message.
