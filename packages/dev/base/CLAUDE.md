# CLAUDE.md - `@bitbybit-dev/base`

The root of the dependency graph. It depends on no sibling, which is what makes it the only place two
packages that cannot import each other can share code. Shared package conventions are one level up in
`packages/dev/CLAUDE.md`.

`lib/api/services/helpers/` is internal: not exported from the services barrel, and reached by direct
import from the few places that need it. Code lands there when it must be shared but must not become
public API. `computeVertexNormals` is there because both `jscad` and the shared draw helper need it and
neither may import the other. The geometry helpers (vectors, frame transforms, polygons, triangulation,
arcs, mesh measures) are the arithmetic under the public services and the other packages' hot paths:
plain tuples, no DTOs. When one is useful to users, a service method wraps it rather than copying it,
and a service never keeps a second copy of the arithmetic (`ARCHITECTURE.md`, "Shared geometry
helpers").

**`removeAllDuplicateVectors` is the shared implementation**, and the OCCT vector helper calls it
rather than keeping a copy. Deduplication under a tolerance is quadratic written directly, and it runs
on caller-supplied point lists of unbounded size, so kept vectors are indexed into a grid of cells a
few tolerances wide and only the cells a candidate could match are probed.

**The grid narrows candidates and never decides equality.** Every candidate it returns is still
confirmed with `vectorsTheSame`, which is what keeps the result identical item for item to the plain
scan, first occurrence kept. If the grid decided equality, the answer would depend on the cell size.
Vectors it cannot place - a non-finite component, a tolerance that is not positive and finite, a
magnitude where the cell arithmetic stops being exact - fall back to the plain scan and are also held
in a side list the grid path consults, so neither path can miss a duplicate the other holds.
`removeConsecutiveDuplicates` remains the cheaper call when only neighbours matter.

**`lib/api/kernel-calls/` is public on purpose**, unlike `helpers/`: it is how a call reaches a kernel,
and the kernels, the workers and the code that dispatches to a kernel from outside all share it.
`resolveDto` and `resolveInputs` lay a caller's inputs over a DTO's defaults and return a new plain
object, never the caller's and never a class instance - a walk over the inputs treats a class instance
as opaque. A property left out, set to undefined, or set to null where the DTO has a default gets the
default; null on a property with no default stays null. `withDefaults` does the same for a kernel
used in the same thread, wrapping only the objects on the way to a registered operation.
`callByPath`, `rehydrateReferences` and `describeKernelFailure`
are the three pieces every worker used to keep its own copy of. A caller can tell three errors apart:
`InputError` (the inputs were refused before the kernel ran), `KernelOperationError` (the kernel ran
and could not complete the operation, named by a `code` such as `occt.fillet.failedOnEdges` that
keeps its meaning across releases and languages, with the `details` its message names, such as
`{ edges: [3, 7] }`) and `KernelCallError`, the rejection a worker's caller receives, which carries
the kind, the code and the details across the thread boundary. A host translates a failure by its
code and fills its template with `fillFailureMessage(template, details, formatList)`: `{name}`
placeholders, a list written by the formatter it passes (English by default, since the packages
compile against ES2020 and `Intl.ListFormat` is the host's to bring). Details are plain strings,
numbers, booleans and lists of one of them; `describeKernelFailure` drops anything else, since it
must cross to another thread. `describeKernelFailure` never throws, and gives binary data
at any depth by its kind and size and a long input only up to its cut, so describing a failure never
costs more than the failure.

**`validateInputs` checks a call before a kernel runs it**, in two layers. The constraints a
generated registry carries per property - required, a number that is not NaN and lies within its
`@minimum`/`@maximum` (strict under `@exclusiveMinimum true`), a point of the right arity, a hex
color, a value of the enum - come from the DTO's declared types and tags, so a property whose
type they cannot read (a shape, a `T`, a union) is only checked for presence. The rules across
properties are written by hand beside each kernel with `defineRules` and the combinators
(`sameLength`, `lessThan`, `distinct`, `notZeroVector`, `atLeastOne`, `when`, `custom`), against
the `Resolved` type, since they run after the defaults; a rule for an abstract parent applies to
every DTO that extends it, and a rule runs only when every property it reads passed its own check.
A rule belongs to a DTO, so it has to hold for every operation that takes that DTO - "at least two
points" is not a `PointsDto` rule. The workers go through `prepareKernelCall`, which resolves the
inputs and, on a cache miss, reports what `validateInputs` finds through `reportInputIssues` - each
distinct issue once, two rules on one property kept apart, the last thousand remembered - and never
lets a check or a sink that throws fail the call. Validation does not throw yet: a service keeps its
own throw until it does, and the default instance of every DTO has to pass its own checks
(`dto-registry.test.ts`).
