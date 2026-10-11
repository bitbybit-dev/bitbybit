# CLAUDE.md - `@bitbybit-dev/ifc-worker`

The main-thread half of the IFC worker boundary, and the worker thread's message handler. Shared
package conventions, and the rules for crossing the worker boundary, are in `packages/dev/CLAUDE.md`;
why the parts behave as they do is in `ARCHITECTURE.md` beside this file.

**The API classes under `lib/api` are generated** from `@bitbybit-dev/ifc` by `npm run gen:worker-api`,
except `bitbybit-ifc.ts` (the init class) and the `index.ts` barrel. `IfcModel` in a kernel signature
becomes `Inputs.IFC.IfcModelPointer` here.

**A model handle is the hash of the call that made it.** `ModelCache.keyOf` hashes the dotted path and
the inputs after their defaults (`keyPart` in `model-cache.ts` says which values are told apart), so
the same call is a cache hit and its model is handed back as the same handle. A model handle in the
inputs is part of the key, so a call on a different model is a different call. A call that is meant to
differ each time is listed in `UNREPEATABLE` (`ifc-worker.ts`) and gets a fresh key. `ModelCache` and
its handle checks are internal; the handle's public type is `Inputs.IFC.IfcModelPointer`.

**The cache holds plain JavaScript objects**, so nothing has to be freed: `cleanAllCache` and the
count threshold in `startedTheRun` (`CACHE_THRESHOLD`, as in the kernel workers) only drop
references. A handle used after its model was dropped fails with an error saying to make the model
again.

**State lives in an `IFCWorkerHandler`, never in the module.** The exported `initializationComplete`
and `onMessageInput` share one handler made on first use, and each `IFCWorkerMock` has its own. Calls
that arrive before `initializationComplete` are held and answered, in order, once it runs. The library
is plain TypeScript with no WebAssembly to load, so a worker script calls it first thing.

**The manager keys waiting calls by uid**, asks a new worker `isReady` so a start it missed is still
seen, and rejects every waiting call on the worker's `error` event (`IFCStateEnum.failed`). A new
reserved call is answered in `IFCWorkerHandler.execute` before the inputs reach `prepareKernelCall`.
