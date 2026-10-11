# Architecture - `@bitbybit-dev/ifc-worker`

Why the worker side behaves as it does where the code does not say. The conventions are in
`CLAUDE.md` beside this file.

## One call

1. `IFCWorkerManager.genericCallToWorkerPromise` posts `{ action: { functionName, inputs }, uid }` and
   keeps the call's promise under its uid.
2. `onMessageInput` posts `busy`. It answers the reserved calls (`isReady`, `startedTheRun`,
   `cleanAllCache`) itself; any other it lays over the DTO's defaults (`prepareKernelCall`) and keys.
3. On a miss it reports what the inputs fail (without throwing), replaces every model handle by the
   cached model (`rehydrateReferences`), calls the dotted path on `IFCService` and caches what comes
   back.
4. It posts `{ uid, result }`, with a model as its handle, or the failure as `describeKernelFailure`
   words it.

## Cache keys

A key is a hash of the dotted path and the inputs after their defaults. The inputs are first made
into a structure JSON holds without losing what tells two calls apart: `NaN`, the infinities, `-0` and
`undefined` become tagged values, an `ArrayBuffer` or a typed array its kind, its length and a digest
of its bytes, a `Date` its time, and an object's keys are sorted, so the same keys in another order
make the same call. Inputs that contain themselves are refused with an `InputError`.

A call meant to differ each time, `model.create` without a `seed` or `model.write` without a
`timeStamp`, gets a fresh key instead: a counter running down from -1, below every hash, so it is never
answered from the cache and its model gets a handle of its own.

## One handler per thread

`IFCWorkerHandler` holds a worker's state: the library, the cache and the calls held until it starts.
The module functions a worker script calls, `initializationComplete` and `onMessageInput`, share one
handler created on their first use, so importing the package creates nothing.

## The manager

`IFCWorkerManager` settles a waiting call on the answer that carries its uid, a failure included.
Given a worker (`setIfcWorker`), it reports `loading` and sends the reserved `isReady` call, which the
worker holds until it has started and then answers. So a start the worker announced with
`ifc-initialised` before the manager listened is not missed: either message marks the worker started
(`ifcWorkerStarted()`) and reports `initialised`, once. When the worker's script fails to load or
throws (its `error` event), every waiting call is rejected with a `KernelCallError` and the state
becomes `failed`, so nothing waits for an answer that will never come.

## The stand-in

`IFCWorkerMock` runs a handler of its own on the calling thread and copies every message both ways by
structured clone, so a suite or a script on the main thread runs exactly the code a worker runs, no
model crosses by reference, and two mocks share nothing. Its answers are synchronous, which is why a
test that needs a call to stay outstanding captures the message instead.
