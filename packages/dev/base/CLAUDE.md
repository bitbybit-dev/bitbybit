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
