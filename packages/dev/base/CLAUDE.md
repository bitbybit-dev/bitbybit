# CLAUDE.md - `@bitbybit-dev/base`

The root of the dependency graph. It depends on no sibling, which is what makes it the only place two
packages that cannot import each other can share code. Shared package conventions are one level up in
`packages/dev/CLAUDE.md`.

**What belongs in base.** Base is the 3D maths core every other package shares, and it takes code on
three conditions together: the code is stateless arithmetic on plain numbers and tuples (no topology,
no kernel objects, no iterative solving beyond small closed forms such as a 3x3 eigen solve); it is
shared 3D vocabulary rather than a feature (vectors, matrices, frames, polygons, triangle meshes,
curve and surface evaluation, path framing); and two packages need it, or the one that does may not
depend on a kernel (`ifc` sits on base alone). Modelling stays out - booleans, offsets, fillets,
NURBS fitting or intersection, B-rep topology are the kernels' work. Base also hosts two bodies of
kernel-agnostic knowledge beside the maths core, the engineering tables and the recipe format;
`ARCHITECTURE.md` ("What could leave base") names them and the curves helpers as the parts that could
become packages of their own, which their service-only surface keeps cheap.

`lib/api/services/helpers/` is internal: not exported from the services barrel, and reached by direct
import from the few places that need it, grouped by domain - `geometry/` (vectors, scalars, matrices,
frame axes, arcs, polygons, paths, triangulation), `mesh/`, `curves/` (NURBS evaluation, adaptive
surface meshing), `color/` and `files/` (zip, inflate, crc32, dxf). A helper never sits loose beside
them. The helper itself is not public API, the service method that wraps it is: base is the toolbox
people building 3D apps reach for, so a generic helper is exposed (DTO, JSDoc, example) and a service
never keeps a second copy of the arithmetic. `lib/api/services/helpers/exposure.json` records for
every export the method that exposes it, why it stays internal, or that it waits to be exposed;
`lib/api/services/helpers/exposure.test.ts` holds each export to it, and the number waiting only
falls. No other package writes its own copy: `bitbybit/no-local-maths` (`LINT.md`) fails the
arithmetic it recognises outside `services/helpers/` (`ARCHITECTURE.md`, "Shared geometry helpers").

**What the index exports.** Services, the `Inputs` and `Resolved` namespaces, models and types, and
`kernel-calls/` - never a free-standing helper function. Code a caller can use becomes public as a
service method with a DTO and the JSDoc `API_DOCS_GUIDE.md` asks for (`engineering.mechanical.gears.spurGearSizes`,
`recipes.check`), because that is what reaches the editors, the reference and the catalogue, and the
kernels, the renderers and the apps call that same method, so what they rely on is what users get.
`resolveDto` copies one level, so a service call costs nothing a loop notices. A deep import
(`@bitbybit-dev/base/lib/api/...`) is the exception, for what the method cannot serve: a result it
does not give (a gear outline as exact arcs and cubics, where the method gives points) or a call from a
module function on a draw path with no service in reach (the sRGB conversion); nothing re-exports
such an implementation. `lib/api/index-exports.test.ts` holds the index to this: every function it
exports is a class, part of `kernel-calls/`, or one of the two sRGB functions that shipped in 1.5.0,
deprecated now and gone in the next major.

**`uniqueVectors` (`lib/api/services/helpers/geometry/vector-grid.ts`) is the one deduplication**: behind
`vector.removeAllDuplicateVectors`, and behind `mesh.toIndexed`, which also reads which kept vector each
corner matched. Deduplication under a tolerance is quadratic written directly, and it runs
on caller-supplied point lists of unbounded size, so kept vectors are indexed into a grid of cells a
few tolerances wide and only the cells a candidate could match are probed.

**The grid narrows candidates and never decides equality.** Every candidate it returns is still
confirmed component by component, which keeps the result identical item for item to the plain scan:
the first occurrence is kept, and each vector matches the first kept one it agrees with. If the grid
decided equality, the answer would depend on the cell size.
Vectors it cannot place - a non-finite component, a tolerance that is not positive and finite, a
magnitude where the cell arithmetic stops being exact - fall back to the plain scan and are also held
in a side list the grid path consults, so neither path can miss a duplicate the other holds.
`removeConsecutiveDuplicates` remains the cheaper call when only neighbours matter.

**`lib/api/kernel-calls/` is public on purpose**, unlike `helpers/`: it is how a call reaches a kernel,
and the kernels, the workers and the code that dispatches to a kernel from outside all share it.
`resolveDto` and `resolveInputs` lay a caller's inputs over a DTO's defaults and return a new plain
object, never the caller's and never a class instance - a walk over the inputs treats a class instance
as opaque. A property left out, set to undefined, or set to null where the DTO has a default gets the
default; null on a property with no default stays null. An empty text on a property with no default is
left out, since an empty text there means "not set"; one in place of a default stays.
`withDefaults` does the same for a kernel
used in the same thread, wrapping only the objects on the way to a registered operation.
`callByPath`, `rehydrateReferences` and `describeKernelFailure`
are the three pieces every worker used to keep its own copy of. A caller can tell three errors apart:
`InputError` (the inputs were refused before the kernel ran), `KernelOperationError` (the kernel ran
and could not complete the operation, named by a `code` such as `occt.fillet.failedOnEdges` that
keeps its meaning across releases and languages, with the `details` its message names, such as
`{ edges: [3, 7] }`) and `KernelCallError`, the rejection a worker's caller receives, which carries
the kind, the code and the details across the thread boundary. A caller translates a failure by its
code and fills its template with `fillFailureMessage(template, details, formatList)`: `{name}`
placeholders, a list written by the formatter it passes (English by default, since the packages
compile against ES2020 and `Intl.ListFormat` is the caller's to bring). Details are plain strings,
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
