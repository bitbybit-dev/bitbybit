# Architecture - `@bitbybit-dev/occt-worker`

How the worker side behaves where the code alone does not say why. The caches are described in
`CLAUDE.md` beside this file, and the rules for crossing the worker boundary in
`packages/dev/CLAUDE.md`.

## Crash and restart

A WebAssembly trap leaves the kernel's memory in an unknown state, so the call that hit it is
answered as a `crash` and that kernel is never called again (`afterCrash`).

- Without a `restart` function the crash is remembered (`lostKernel`) and every later call is refused
  with it.
- With one, `restart` runs once per crash and must end by calling `initializationComplete` again;
  calls arriving meanwhile wait on `restarting`. `kernelGeneration` counts the kernels the worker has
  been given, so a `restart` that settles without delivering a new one, or rejects, leaves the crash
  remembered as above.
- The mesh retention budget a caller set (`meshRetention`, in triangles) is given again to the kernel that
  replaces a crashed one; a first start resets it to 0.
- A restart does not post `occ-initialised` again: the manager sees one worker throughout.

## Progress and cancellation

Three `Int32` words are shared between the worker and the manager: `STOP_REQUEST_WORD` (0) asks the
running call to stop, `PERMILLE_WORD` (1) is its progress in thousandths, `ALGORITHMS_STARTED_WORD`
(2) counts the kernel algorithms it has started, each of which reports from 0 to 1 again. The
multithreaded kernel's own memory is already shared; for the other kernels the worker hands the
module a `SharedArrayBuffer` (`bitbybitControl`) that the kernel keeps in step with its own words.
Where memory cannot be shared - a page that is not cross-origin isolated, or a kernel that predates
the words - there are none, and the manager can neither report progress nor cancel.

The manager reads the words every `PROGRESS_INTERVAL_MS` while calls are pending and attributes them
to the oldest pending call, which is the one running; the timer stops when the last pending call
settles. A call the manager stopped throws `CallStopped` inside the cached computation, so nothing it
made is cached, and is answered as `cancelled`.

## Plugins

`addOc` can arrive before the kernel has started. The dependencies it carries then wait in
`pendingDependencies` and are added to the plugins once `initializationComplete` runs.

## Design scripts

`buildWithScripts` runs the scripts a design build lists as pending on the main thread. The scripts
reach the API through `kernelCalls`, a proxy on which every dotted path is one call to the worker, as
each generated member makes it. The proxy answers `then` with undefined, so awaiting it, or returning
it from an async function, does not mistake it for a promise.
