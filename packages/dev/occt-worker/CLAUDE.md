# CLAUDE.md - `@bitbybit-dev/occt-worker`

The main-thread half of the occt-worker boundary. Shared package conventions, and the rules for crossing the
worker boundary at all, are in `packages/dev/CLAUDE.md`. What is specific to the caches lives here.

## Answers handed over, not copied

`shapeToMeshBuffers` and `shapesToMeshBuffers` answer with typed arrays and hand their buffers to the
calling thread: a handler's `transfer` list (`meshBuffersOf`, `lib/occ-worker/mesh-transfer.ts`)
reaches `postMessage(message, { transfer })`, so the worker's own copy is emptied in the move. That is
safe only because these commands keep nothing: they run as reserved command handlers, which never go
through the cache, and must stay so, since a cached result whose buffers were handed over would be
served again empty. They are also in `NON_CACHEABLE_FUNCTIONS`, which only stops
`executeStandardFunction` from running them should their handler go missing. Every host wires the
worker as `onMessageInput(data, postMessage)`, passing the worker's own `postMessage`, which takes the
options form whether it is typed as a worker's or a window's (the runners compile against the DOM
types); a host that wraps it drops the list and its answers are copied instead, and a host whose
`postMessage` throws on the options form gets the answer posted again without it. Either costs time
and nothing else.

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
- **A shape inside a structure is keyed by its path in the answer** (`hashNestedShapes`:
  `result.parts[0].shape`), and a key that is not a plain name is written quoted in brackets
  (`result.inputs["a.b"]`). Script params let a document choose its keys, and written plainly `a.b`
  spells the path of `{ a: { b } }`: the two shapes took one key, the first was freed and the cached
  answer held a deleted handle. The walk passes over bytes, buffers and views, as every walker here
  does; walking an 8 MB answer key by key took 784 ms on every miss.
- **`design.buildWithScripts` deletes what it does not hand back** (`lib/occ-worker/design-scripts.ts`).
  Only the last build's shapes reach the caller, so each earlier build's shapes are deleted once the
  next build has run, and the shapes the scripts made once the last build has taken them - a build
  keeps its own copy of every outcome it is given. A shape a script handed back as its outcome is
  passed to every later build, so it stays until the last. On a failure both are deleted before it
  is thrown on; nothing the caller supplied in `outcomes` is. Through the worker's cache an identical
  call elsewhere is answered with the same shape, before the build or between its rounds, so the
  worker counts the answers that carry each shape (`CacheHelper.countAnswer`, once the answer is
  posted) and the loop deletes through `deleteUnsharedShapes`, which frees a shape only when every
  answer that carried it was the loop's own; a shared one stays until `deleteShape`, `cleanAllCache`
  or the threshold frees it. Keys are deterministic, so a count belongs to the key, not to the shape
  under it now: a delete of one key (`deleteShape`, `deleteShapes`, `deleteUnsharedShapes`) keeps its
  count, and a shape made again under it counts on, so a count taken before can never match again.
  Such a key is never freed by a later loop in that epoch; it stays cached, one shape, until a delete
  command or a full clear. The two full clears (`cleanAllCache`, the threshold reset) drop every count
  and begin a new epoch, and the cache a restarted kernel gets begins one no earlier cache had. The
  loop asks for the epoch before its first build (`deleteUnsharedShapes` with an empty list and no
  epoch) and names it in every delete; the worker deletes nothing for an epoch that has ended, since
  that clear freed all the loop held and what a key holds since is another caller's. A worker without
  the command (an older bundle) refuses the ask as a kernel failure - on one that has it, an empty ask
  can fail only as a cancel or a crash, which are thrown - and the loop then deletes nothing, as
  before the cleanup existed. A delete refused later, for any reason, still frees what it can and is
  thrown. `occ-worker-lifetimes.test.ts` pins the shared cases, both clears and the older worker
  through a real worker, `design-scripts.test.ts` which shapes go when.
- **Retention is bounded by a count, not by memory.** Only two things bound it: the count threshold in
  `startedTheRun`, which clears everything once more than `CACHE_THRESHOLD` hashes have been used, and
  the delete commands (`deleteShape`, `deleteShapes`, `deleteDocument`, `cleanAllCache`). An entry a
  later run no longer uses stays until one of them frees it, so the threshold is the only automatic
  bound on WASM memory growth across a long session.

  It counts hashes because hashes are what this side can see. What one hash costs in WASM memory is
  unknowable from here - a point or a hundred-megabyte assembly - so no threshold in hashes can be
  tuned to a memory figure. The number is a practical ceiling on how far the cache drifts before being
  reset, and all three kernel workers use the same one under the same name.

- **Meshes are bounded separately, in triangles.** The kernel keeps no triangulation unless a caller
  calls `setMeshRetention(triangles)`; with a budget every mesh stays on its shape, and the least
  recently used faces are cleaned once the kept triangles exceed it, however long the cached shapes
  live. This is the one strip that is safe: the kernel cleans only a face whose triangulation is still
  the one it recorded, never the geometry. `cleanAllCache` and the threshold reset release the kept
  meshes first (`ReleaseKeptMeshes`) and keep the budget.

- **The design builder keeps kernel shapes of its own, and only the two full clears free them.**
  Between builds it keeps each feature's outcome, so an unchanged feature is not built again, and
  between sections each cut, so the same section makes nothing. When a build ends it frees the least
  recently used outcomes beyond 256, and when a section ends the cuts beyond 512, but never one that
  call used: a build that uses more than 256 outcomes keeps every one of them, so neither number is
  a bound. `cleanAllCache` and the threshold reset free all of them through `releaseDesignCaches`,
  after the kept meshes and this cache, together with the boxes and clash meshes it keeps outside
  the kernel; the delete commands never reach them. `occ-worker-lifetimes.test.ts` pins both clears
  on the kernel objects (none a design build made is alive after either, while the sketch's face and
  the extruded shape are after a run under the threshold), and `command-handlers.test.ts` pins that
  the next build makes every feature again after either and reuses them after a run under the
  threshold. No worker test measures the heap here; the occt package's `npm run heap` measures a
  design session released this way, outside `npm test`.

- **`manifoldObjectHashes` is the liveness ledger** in the Manifold worker's sibling of this cache: an
  entry that was a handle but no longer carries embind's `$$` marker is evicted and reported as a miss
  rather than returned as a dangling pointer. That marker is an embind implementation detail and would
  not survive a change of bindings.

## Loading from a CDN

`new Worker()` refuses a cross-origin URL. OCCT workers are **ES modules**, so a same-origin blob that
statically imports the CDN script is built and the worker is constructed from that. The `initialise`
message exists so the worker can point at a different CDN **before** it loads its WASM; send it late
and a worker configured for a custom CDN has already fetched from the default one.
