# CLAUDE.md - `@bitbybit-dev/ifc`

IFC, the open BIM exchange format, read, written and authored in TypeScript. A kernel wrapper whose
"kernel" is this package itself: it depends on `base` alone, holds no WebAssembly, and never builds
geometry. Shared package conventions are one level up in `packages/dev/CLAUDE.md`; why the parts work
the way they do is in `ARCHITECTURE.md` beside this file.

**A model is a value.** `IfcModel` is a public interface over an immutable snapshot (`ModelSnapshot`):
a schema, a header, the file it was read from (if any) and a persistent map of changes over it
(`IdMap`). Every service method that changes a model opens an `IfcTransaction`, lets the building code
create, update and delete entities in it, and commits a new model; the one it was given is left as it
was. Never mutate a snapshot's overlay, an entity's `args` or a snapshot's indexes: snapshots share
them, and a caller (or a worker cache) may still hold the older one.

**The public surface is small on purpose.** From `lib/model` and `lib/step` only `IfcModel`,
`isIfcModel`, the value types and `StepSyntaxError`/`IfcValueError` are exported; the snapshot, the
source, the index and the schema classes stay internal. A deliberate change runs `npm run api:update`.

**The schema table is generated.** `lib/schema/generated/ifc4.ts` is written by
`scripts/gen-ifc-schema.mjs` from `schema/IFC4_ADD2_TC1.exp`, buildingSMART's EXPRESS file, which is
kept exactly as published (changing it would need buildingSMART's consent). Never edit either by hand;
`npm run gen:ifc-schema` rewrites the table and `npm run check:ifc-schema` (part of `npm test`) fails
on a stale one. The table carries buildingSMART's notice, and the package's `NOTICE` the attribution.
There is no IFC2X3 table: an IFC2X3 file is read through the IFC4 one (`readingSchemaFor`), which keeps
most of its entities and appended most of its new attributes, so the model can be shown and queried
but refuses every change (`editable` is false) until `upgradeToIfc4` turns it into an IFC4 model.

**Values are written by the schema, not by their JavaScript type.** An attribute value is a plain
JavaScript value (`IfcValue`): a number is written as a real or an integer as the attribute's type
says, a string as a text or an enumeration value, `{ ref }` as a reference and `{ type, value }` as a
typed value inside a select. `IfcTransaction.create` encodes every attribute on the spot and `update`
the ones it names, so a wrong value fails where it is made rather than when the file is written. A
commit then checks the references of every changed entity, and GlobalIds that are new or changed.

**Ids and GlobalIds.** A service method's `id` is a key of the caller's: `keyGlobalId(model.keySeed,
key)` derives the object's GlobalId from the project's, even when the key looks like a GlobalId.
`resolveObject` finds an object by a GlobalId the model holds or by its key, and refuses one of the
wrong type. Keys, the library's automatic ids and the site and building ids are derived in separate
domains (`lib/model/guid.ts`); keep any new kind of derived id in a domain of its own.

**Standard elements keep their parameters in IFC.** A wall is read back from its own entities
(`readWall`: placement, 'Axis' representation, layer set usage, body depth) whenever it is joined,
clipped or cut, so there is no second copy of its parameters to drift. Its footprint is recomputed from
its `IfcRelConnectsPathElements`; the old body is handed to `dropIfUnused` and pruned at commit if
nothing else refers to it. Pruning only ever removes representations and their items and maps,
placements, profiles, material usages, property and quantity sets and their properties and
quantities; the styled item that styles a pruned item goes with it, and a presentation layer lets go
of what is pruned. Find relationships through `referencesTo` of the object they name
(`lib/build/relationships.ts`), never by listing every relationship of a type.

**Lengths and frames.** All lengths are in the model's length unit (`millimetresPerUnit`). A DTO length
whose default is a size has no initializer (`@default undefined`, `@optional true`); the service fills
it with `lengthIn(model, value, DEFAULT_MILLIMETRES.x)` (`defaults.constants.ts`), since an initializer
would be millimetres in every unit. Plan coordinates are a storey's X and Y, with Z up, as IFC has it;
the package never converts to a Y-up frame. Numbers that reach a file are checked finite by the encoder.

**Enums.** The library's own enums (`lengthUnitEnum`, `wallAlignmentEnum`, `profileKindEnum`) take
camelCase values. Those IFC defines (`wallPredefinedTypeEnum`, `slabPredefinedTypeEnum`,
`doorOperationEnum`) keep IFC's tokens, which are written to the file as they are.

**Geometry recipes.** `lib/geometry` turns elements into a `Base.Recipe` (the format and its validator
live in `base`, so any kernel can execute it): one root per element and surface style of its items,
placed by the element's absolute matrix,
openings cut through the elements they void with `voids`, and each `IfcRepresentationMap` built once
however many mapped items use it. An element it cannot describe is reported, never silently dropped.
A brep's faces, loops and points are read with `peek` and `referenceList`, which keep nothing: a large
file holds millions of them, and the decode cache would keep every one.

**Generic math lives in base.** Vectors, frames, polygons, triangulation, arcs and mesh measures come
from `@bitbybit-dev/base/lib/api/services/helpers/*`; a new helper that is not about IFC goes there,
with its tests, and a public method in the matching base service when users would want it.
`lib/build/math.ts` holds only IFC's own rules.

**Tests** run without a kernel. Geometry is checked by reading back the entities written. Whole files
are checked against IfcOpenShell by `npm run validate` (`validation/`, never part of `npm test`): its
validator with the schema's rules, a shape for every product, and its own wall regeneration over our
walls. Every new verb adds a fixture there that uses it. `npm run bench` (`bench/`, outside `npm test`
too) times eight workloads, a file of 40 copies of a block among them, through the public API against
budgets about three times their measured time, so a change that makes one grow out of proportion
fails; each must give the same fingerprint every run. Measure a large file with the built `dist` in
plain Node as well: under the test runner every imported constant is a getter call, which makes the
byte scans several times slower than they run for users.
