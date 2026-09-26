# CLAUDE.md - `@bitbybit-dev/base`

The root of the dependency graph. It depends on no sibling, which is what makes it the only place two
packages that cannot import each other can share code. Shared package conventions are one level up in
`packages/dev/CLAUDE.md`.

`lib/api/services/helpers/` is internal: not exported from the services barrel, and reached by direct
import from the few places that need it. Code lands there when it must be shared but must not become
public API. `computeVertexNormals` is there because both `jscad` and the shared draw helper need it and
neither may import the other.

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
as opaque. `withDefaults` does the same for a kernel used in the same thread, wrapping only the objects
on the way to a registered operation. `callByPath`, `rehydrateReferences` and `describeKernelFailure`
are the three pieces every worker used to keep its own copy of, and `InputError` / `KernelCallError`
are the two errors a caller can tell apart.

**`validateInputs` checks a call before a kernel runs it**, in two layers. The constraints a
generated registry carries per property - required, a number that is not NaN, a point of the right
arity, a hex color, a value of the enum - come from the DTO's declared types, so a property whose
type they cannot read (a shape, a `T`, a union) is only checked for presence. The rules across
properties are written by hand beside each kernel with `defineRules` and the combinators
(`sameLength`, `lessThan`, `distinct`, `notZeroVector`, `atLeastOne`, `when`, `custom`), against
the `Resolved` type, since they run after the defaults; a rule for an abstract parent applies to
every DTO that extends it, and a rule runs only when every property it reads passed its own check.
A rule belongs to a DTO, so it has to hold for every operation that takes that DTO - "at least two
points" is not a `PointsDto` rule. The workers report what they find through `reportInputIssues`,
each distinct issue once, and do not throw yet: a service keeps its own throw until validation
throws, and the default instance of every DTO has to pass its own checks (`dto-registry.test.ts`).
