# Architecture - `@bitbybit-dev/occt-worker`

How the worker side behaves where the code alone does not say why. The caches are described in
`CLAUDE.md` beside this file, and the rules for crossing the worker boundary in
`packages/dev/CLAUDE.md`.

## References across the boundary

A kernel object an answer carries crosses as its cache hash with a tag (`ResultSerializer`), and a
reference in a call's inputs is rehydrated from the cache by that tag (`ShapeResolver`), at any depth:

- `occ-shape` for a `TopoDS_Shape` (it answers `ShapeType()`), the only kind an answer counts for
  `deleteUnsharedShapes`;
- `occ-document` for an assembly document (`Handle_TDocStd_Document`, the one class the kernel binds
  with both `Main()` and `IsNull()`), which is what `TDocStdDocumentPointer` declares and how a draw
  call tells a document from any other handle;
- `occ-entity` for every other kernel object, such as a 2D curve handle.

A reference lives only as long as the worker's cache, so none is written into anything that outlives a
session; the tag is part of a call's cache key, since the key is taken from the posted inputs.

## Assembly documents are values

The kernel changes a document in place (`SetDocLabelColor`, `SetDocLabelName`, `AddDocumentPmiJson`,
`RemoveDocumentPmiJson`, and `BuildAssemblyDocument` given an existing document), while the cache
answers a call by its inputs alone. Changed in place, a document would take a run made again on top
of what the run before it left (a changed dimension added beside the old one, a removal never run
again), and an export of it would answer the bytes written before the change. So the worker never
changes the document a creating call made, and a change makes a version:

- `DOCUMENT_CHANGING_FUNCTIONS` (`constants.ts`) names each call that changes a document, with the
  input that holds it, and `DOCUMENT_READING_FUNCTIONS` each call that only reads one;
  `constants.test.ts` fails when a worker call that takes a document is in neither (or is
  `deleteDocument`), so the next call that changes one cannot be forgotten, and
  `occ-worker-document-reads.test.ts` runs every reading call on a document with PMI and fails when one
  changes its STEP text, PMI, hierarchy or parts.
- A changing call answers a reference to the version it made (`{ type: "occ-document", hash }`, a key
  derived from the call's key, `CacheHelper.changeOp`), and the kernel method answers the document it
  changed (`constants.test.ts` holds every changing call to that, and `DocumentVersions` refuses a
  change that answers anything else, keeping nothing). Since the call key holds the key of the
  version it read, a version key stands for its whole history.

### How a reference reads

The worker keeps no way of reading references of its own. The manager stamps every call it sends
with the caller's (`DataInput.documentReferences`, set by `OCCTWorkerManager.setDocumentReferences`;
a message without one reads `latest`, one naming anything else is refused), so one caller can never
switch another, and the reference rules are:

- A reference to a version always reads exactly that version, in both ways.
- `exact`, for a dataflow graph that runs again only the calls whose inputs changed: a reference to a
  document as its creating call answered it reads that document as made. Two branches made from one
  document never see each other's change, and running one branch again gives what running every
  call again gives.
- `latest`, the default, for a script that makes its calls one after another: that reference reads
  the version the last change sent under `latest` made of the document in this run, or the document
  as made before any. So a script that ignores what a change answered and exports the document it
  changed exports the change, and one that passes each answer on makes the same calls under the same
  keys (`DocumentVersions.atVersionsRead` rewrites only such references, before the call is keyed;
  with `exact`, or before any change of the run, it walks nothing, and it passes over bytes, buffers
  and lists of numbers). `startedTheRun` begins a run: every document reads as made again.
  `red = setDocLabelColor(doc, red); setDocLabelColor(doc, blue); export(red)` exports red.

Either way a change is keyed by the version it applies to and a read or an export by the version it
reads, so an unchanged call or run is answered from the cache with no kernel call, and a change of
value makes a new version, whose reference makes every call given it run again.

### A version is a recipe

`DocumentVersions` keeps each version as its change (dotted path, inputs as keyed, settings) applied
to the version it was made from, back to the document as made. Kernel objects are kept for some
versions only:

- at most `MAX_DOCUMENT_VERSIONS_KEPT` of one document and `MAX_DOCUMENT_VERSION_LABELS` labels of all
  (a version counts each part or sub-assembly, each placement and each dimension, tolerance and datum
  it holds, measured once it is made, with `getDocumentParts` and the kernel's PMI reading; a change
  that only sets a colour or a name, `DOCUMENT_LABEL_SETTING_FUNCTIONS`, weighs as the version it read,
  so a slider colouring 300 parts weighs nothing again); once a call has been answered the least
  recently used beyond either bound are freed, never one that call used. A version read while it is not kept is made again
  on a copy of the nearest version kept, or of the document as made, by replaying the changes between,
  each under the settings it ran under, and is kept.
- A change sent under `latest` that applies to the version the document reads in the run takes that
  version's kept object over instead of copying it: the object becomes the new version, and the one
  it read stays a recipe. A script that colours each of 300 parts one call at a time therefore makes
  one copy, not 300. A graph's changes (`exact`) always copy, because a graph runs a branch again on
  its own and would otherwise make the version it read again on every change downstream.
- `setDocLabelColors` and `setDocLabelNames` change many labels in one call, so one version holds
  every colour or name. A change per label given the same document makes a version per label, each
  holding its own colour: that is what a graph's colour node given a list of labels does, where
  in-place colouring once coloured one document.
- A version whose change names kernel objects besides its document (`buildAssemblyDocument` given
  shapes or source documents) can be made again only while those are cached, and no change takes it
  over. The bounds free it like any other while the cache holds every object it names, so a slider
  building a part into one document run after run under `latest` keeps at most the bound of copies;
  once one of them is gone the bounds keep it, since it could not be made again. A read of such a
  version that is no longer kept, after its shapes were deleted, is refused with a message saying
  that its change named shapes the worker no longer keeps, rather than naming a shape the reading call
  never received.
- A change that fails or is stopped frees what it made, a copy or the object it took over (the version
  it read is made again when read). A change refuses its inputs, an `InputError`, before it changes
  anything (the label setters check every label and name first, and the kernel refuses PMI before it
  writes a label), so a refused change hands the object it took over back to the version it read
  instead of freeing it. After a WebAssembly trap nothing is freed: that kernel is
  never called again, and running a destructor on it could replace the crash with another error.

### Lifetimes

- `releaseDocumentVersions` (`OCCTWorkerManager.releaseDocumentVersions`) frees the kept objects of
  the versions a caller no longer holds, as Rete does with the versions no node's output names; each
  stays answerable and is made again when read. A document as made is passed over.
- `deleteDocument` given a version frees that version's object alone, and it is made again if read;
  given the document as made, it frees the document with every version made from it, versions of
  versions included, and forgets them with the cached answers of the calls that made them. The two
  full clears (`cleanAllCache`, the threshold reset) free them all.
- A version answer is a document reference, so no answer counts one for `deleteUnsharedShapes`.
- Each call is a transaction for versions (`beginCall`, `settleCall`, `abandonCall`): a call that is
  stopped after its version was stored, or answered from the cache, keeps nothing it made and leaves
  the document reading as before it, so "nothing it made was kept" holds.
- A shape taken out of a document (`getShapeFromLabel`) is a shape of its own, holding the geometry
  the kernel counts references to, so freeing the version it was read from leaves it whole.
- The STEP export numbers each assembly usage occurrence from a counter global to the kernel, so a
  partial run does not equal a full run byte for byte; the tests compare what the file says, not its
  bytes.

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
