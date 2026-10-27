# Architecture - `@bitbybit-dev/ifc`

Why parts of this package work the way they do, where the code alone does not say. The conventions are
in `CLAUDE.md` beside this file.

## Layers

| Folder | Holds |
|---|---|
| `lib/step` | ISO 10303-21: the byte-level indexer, the value decoder, the schema-directed encoder, numbers, strings and the header |
| `lib/schema` | the generated tables and `IfcSchema`, which flattens an entity's attributes in file order |
| `lib/model` | the `IfcModel` interface and its snapshots (`ModelSnapshot`), `IfcTransaction`, the id map and the indexes, reference checks, GlobalIds, reading and writing files |
| `lib/build` | the IFC conventions for standard elements: placements, contexts, storeys, materials, walls and their joins, openings, doors, windows, slabs, members, property sets |
| `lib/geometry` | elements to `Base.Recipe` |
| `lib/api` | the public services and their DTOs |

`lib/build` and `lib/geometry` know IFC's conventions; `lib/step` and `lib/model` know only the
encoding and the schema, so a second schema needs a table and no new code there. Only the `IfcModel`
interface, `isIfcModel`, the value types and the two errors (`StepSyntaxError`, `IfcValueError`) leave
`lib/model` and `lib/step`; the classes behind them are internal and may change.

## Reading a file

`indexStep` scans the bytes once and records, per entity, its id, a code for its type name and where
its row and its attribute list sit; nothing is decoded. Every per-row record is a typed array: the
type codes index a table holding each upper-cased type name once, found by a hash of the name's bytes,
so a row costs about 22 bytes and no string. A UTF-8 byte order mark is skipped, every DATA section is
read, and the file must end with `END-ISO-10303-21;` followed by nothing but space and comments. The
offsets are 32-bit, so a file of 4 GiB or more is refused before the scan starts.

`IfcSource` holds that index for a model read from a file. It finds a row by its id through an
`Int32Array` indexed by id when the ids are dense, as exporters write them, and through a map when they
are spread far apart (`RowsById`). It decodes an entity the first time it is asked for and keeps it. Its
three indexes - entities by type, GlobalIds, and back-references - are each built the first time they
are asked for, from the bytes and without decoding an entity: a GlobalId is the first string of a row
whose type is an IfcRoot, read straight from its bytes when it needs no unescaping, and a back-reference
is a `#` followed by digits outside comments and strings. The back-references are built in two passes
over typed arrays, counting and then filling (offsets per row and the ids that refer), so a file of
millions of rows costs two arrays rather than a map of sets. Each row's `#` signs are counted first
with the native byte search: a row with none, such as a coordinate list that can run to tens of
megabytes, is passed over without walking its bytes, and the scratch for a row's references is sized
by that count rather than by the row's length. A synthetic file of 677 MB and 10.9 million rows, one block of entities repeated, reads
in under 4 s and builds both lookups in about 4 s more, with half a gigabyte of JavaScript heap beside
its bytes.

An IFC4X3 ADD2 file is read and changed through its own table: every verb creates and updates
entities by their names, and IFC4X3 kept every entity and attribute the verbs write (the profile of a
property renamed its `Description` to `Specification`, which no verb writes). The validation fixture
`ifc4x3-edits` runs the authoring verbs on one, and the corpus lane edits every IFC4X3 ADD2 file, both
through IfcOpenShell's validator with IFC4X3's rules; a storey is refused in an infrastructure file,
which has no building. A file naming the bare IFC4X3 is read through the ADD2 table and refuses
changes, as an IFC2X3 one does: its rows would be written in ADD2's shape into a file that says
otherwise. New models are IFC4. IFC4X3 also measures where a sweep starts and ends on its directrix
either as a parameter or as a length along it, typed in the file: a length is compared with the
directrix's exact length (a polyline, a trimmed line or circle), and ends that cannot be measured that
way, or are measured both ways, are refused rather than swept along the whole curve.

An IFC2X3 file is read through the IFC4 table. IFC4 kept almost every IFC2X3 entity, renamed few
attributes in place and appended most new ones, so a row decodes by IFC4's positions and a missing
trailing attribute reads as unset; large IFC2X3 exports of millions of rows
decode in full and build the same geometry as through an IFC2X3 table. Such a model names its own
schema (`schemaName` is `IFC2X3`) and is not `editable`: a change would be written in IFC4's shape into
a file that says IFC2X3, so `IfcTransaction` refuses to start. `upgradeToIfc4` makes it an IFC4 model:
every row is checked against IFC4, attributes IFC4 added are left unset, a newly required enumeration
takes `NOTDEFINED`, a set loses repeated members, and an entity IFC4 merged into its parent
(`IfcRelOccupiesSpaces`) becomes that parent. The rest of what IFC4 writes differently is in
`lib/model/upgrade-rows.ts`, each rule found by upgrading the corpus's IFC2X3 files:
- IFC2X3's date and time entities (`IfcCalendarDate`, `IfcLocalTime`, `IfcDateAndTime` and the UTC
  offset) become the ISO 8601 text IFC4's `IfcDate` and `IfcDateTime` take, where an attribute takes
  one, and their rows are dropped; one referred to anywhere else stops the upgrade.
- An enumeration value IFC4 no longer lists becomes `USERDEFINED`, its old token written into
  `ElementType` or `ObjectType` when that is unset, as IFC4's rules want for a user-defined type, or
  `NOTDEFINED` when there is no `USERDEFINED`; one where IFC4 takes text (`IfcMonetaryUnit.Currency`)
  becomes that text.
- The trailing attributes IFC4 removed are dropped: the centres of gravity of the L, T, U and C
  profiles, a control element's `ControlElementId`, a transport element's capacities.
- A virtual space boundary without an element gets an `IfcVirtualElement` of its own, which IFC4
  requires; a physical one without an element stops the upgrade.
- An empty list IFC4 wants at least one member in is left out where it is optional, and a required
  list that may be empty, left out by the file, is written empty.
- A door style becomes a door type (`DOOR`) and a window style a window type (`WINDOW`), keeping the
  operation, the partitioning and the precedence, since IFC4's rules want a door or window typed by
  those; the construction kind and `Sizeable`, which the types do not hold, are dropped.
- A context's true north given in space becomes a new direction in the plan, as IFC4's rule wants, and
  one pointing straight up is left out; the direction itself is kept for whatever else uses it.
- A faceted brep only 'SurfaceModel' representations show (and styles and layers name) becomes, in
  place, the `IfcShellBasedSurfaceModel` of its shells, since IFC4 no longer lets a surface model hold a
  brep; one a solid representation or a boolean uses is left alone.
- A `USERDEFINED` predefined type that names no type, which IFC4's rules refuse, becomes `NOTDEFINED`,
  which says as much, and an owner history recording a change without its date takes its creation date.

Each rule was found by IfcOpenShell's validator on an upgraded corpus file, comparing it with the file it
came from: the rules IFC4 added are what an upgrade has to satisfy, not only its attribute lists.
Only the rows a rule changed go into the overlay - a small fraction of a large file's - so the others
are still written as read; anything no rule covers stops the upgrade, naming the entity. The writer copies the file's header only when it is the one the file was
read with, so an upgraded model's header says IFC4.

The scan never builds the file as one string. Text is decoded per value, or per run of rows when
writing, as UTF-8 when it is valid UTF-8 and as ISO 8859-1 when it is not: the standard allows only
ASCII between the apostrophes, but exporters write raw bytes in UTF-8 or in ISO 8859-1. Inside a
string, `\X2\` and `\X4\` runs must hold whole groups of hexadecimal digits and code points within
Unicode, and `\S\` follows the alphabet the string's last `\PA\` to `\PI\` directive chose (ISO 8859-1
to 9). A reference is `#` followed by digits only. A typed value takes the schema's spelling
(`IfcLabel`, not the file's `IFCLABEL`).

The decoder is iterative, with an explicit stack and a nesting limit (`MAX_NESTING`), so a hostile file
cannot overflow the call stack. The values in one entity are not capped, since a large point list
legitimately holds millions. Every syntax error is a `StepSyntaxError` carrying its byte offset.

Numbers, references, enumeration values and type names are read from their bytes without a text
decoder, which costs more per call than the value it decodes. A reference's id is summed from its
digits. A number whose mantissa has at most 15 significant digits and whose power of ten is within 22
is divided or multiplied by an exact power of ten, which rounds once and so gives exactly what `Number`
gives; any other number goes through `Number`, as do the malformed ones, which it refuses.

Geometry reads millions of faces, loops and points it uses once, so it does not keep them:
`peek` decodes an entity without adding it to the source's cache (and hands back the kept one when
there is one), and `referenceList` reads a row whose only attribute is a list of references - a loop,
a face, a shell - straight from its bytes. That reader accepts nothing but `(#a, #b, ...)` with space
or comments between, and gives nothing for any other row, which then goes through the full decoder
and its errors. A changed or deleted entity is always read from the model's changes.

Placement chains are walked with a cycle guard and a depth limit (`absoluteFrame`), because a file can
make a placement relative to itself.

An `.ifczip` archive is known by its first bytes, a zip local header, and read from the one `.ifc` file
it holds; folders and macOS resource forks (`__MACOSX/`) are passed over, and an archive with no `.ifc`
file or several is refused, naming what it holds. The archive is read by `base`'s zip helper, which
inflates synchronously, so `model.read` stays one synchronous call, and checks every entry's size and
CRC-32; a ZIP64 archive and an encrypted entry are refused. The model is the inflated file's, so it
writes back as a plain `.ifc` file.

A file may hold rows of types its schema does not define - an IFC2X3 file read through IFC4 keeps
`IfcRelOccupiesSpaces`, for one. Such a row is kept and written back as it was, but decoding it throws,
so every walk over the rows that refer to an object compares their types with `typeOf`, which reads the
type code without decoding the row.

## Writing a file

The writer walks the source rows in file order and takes each run of untouched rows as one slice of
the file's bytes, from the first row's start to the last row's end, so the line ends and comments
between them come back as they were. A changed row is re-encoded on a line of its own, a deleted one
left out, and created entities follow in id order. Everything before the first row is copied as the
file wrote it while the header to write is the one read, and everything after the last row always is,
and the lines the writer adds take the file's own line break (`\r\n` when its first line ends so), so
an untouched file from a Windows exporter comes back byte for byte and an edited one diffs cleanly. The rows of several DATA sections are written in
one, a run never crossing the start of a section. `writeModelBytes` (`model.writeBytes`) copies those
slices into one byte array, so an untouched file comes back byte for byte, an older file's ISO 8859-1
bytes included, and a file of hundreds of megabytes writes in well under a second. `writeModel`
(`model.write`) decodes them into text instead, the same characters as UTF-8, and refuses a file longer
than one JavaScript string holds (`LONGEST_STRING`, V8's limit of about 536 million characters) rather
than fail inside the engine. Header entities other than FILE_DESCRIPTION, FILE_NAME and FILE_SCHEMA are
kept as their text and written back after FILE_SCHEMA. Ids are never renumbered, so a diff of two saves
shows what changed.

Reals are written in the shortest form that reads back exactly, with a decimal point and an upper-case
`E` exponent (`1.E-7`), never in a locale's form. Strings escape everything outside printable ASCII as
`\X2\` (UCS-2) or `\X4\` (code points beyond the BMP), and double apostrophes and backslashes.

`IfcEncoder` checks a value against its attribute's type and normalises it (an enumeration's spelling,
a select's type name) in one walk. The path of an `IfcValueError` (`#12 IfcPolyline.Points[3]`) is put
together on the way out of a failure, so a value that passes costs no path at all.

## Snapshots and transactions

A snapshot (`ModelSnapshot`) is the file it was read from, if any, and an overlay of changes over it.
The overlay is a persistent 32-way trie keyed by express id (`IdMap`: seven levels of five bits, a slot
for every id below 2^31). A commit applies the transaction's changes in one batch: it copies the trie
nodes on the paths to the ids it changed, each node once however many of its ids change, and shares
every other node with the snapshot it started from. An edit costs what it touched, not the size of the
model, and every earlier snapshot stays readable.

Each snapshot keeps indexes over its own overlay (`OverlayIndexes`: entities by type, GlobalIds,
back-references), built the first time they are asked for; a query joins the source's answer, less the
ids the overlay changed, with the overlay's. A commit takes the indexes from the snapshot it started
from, updates them by the ids the transaction touched and hands them to the new snapshot. The old
snapshot is left without them and rebuilds its own if it is asked again, so editing a chain of
snapshots keeps one set of indexes up to date instead of rebuilding them for each.

`IfcTransaction` reads through to its snapshot and answers back-references itself: the snapshot's
answer, less the entities it changed, plus those of its changes that refer to the entity. `create`
encodes every attribute on the spot. `update` encodes only the attributes it names, so a defect a file
already holds in another attribute does not stop an edit. At commit every reference of a changed entity
is checked to name an entity of an accepted type, a deleted entity must have no users left, and
GlobalIds are checked for uniqueness only where an entity's GlobalId is new or changed, so two objects
of a file that already share one can still be edited.

### Owner histories

IFC4 makes `OwnerHistory` optional, and a model this library creates carries none. A file from a tool
that keeps them is kept up to date instead (`lib/model/owner-history.ts`, run by every commit): when the
file holds an `IfcOwnerHistory` and an `IfcPersonAndOrganization`, the first of those is the user
every change is recorded as made by, since the library has no other knowledge of who is editing.
- Every object the commit adds, unless the change set its history itself, shares one history whose
  `ChangeAction` is `ADDED`, created now by that user and this library.
- An existing object the commit changed is `MODIFIED`: it gets a new history that keeps the old one's
  owning user, application, state and `CreationDate`, with the time, the user and this library as its
  last modification. Objects that shared a history share the new one, and the old one stays for the
  objects the commit left alone. An object that had none is given one created now.
- An object counts as changed when its own row is, or a row that is part of it: the walk goes from
  every changed row that is not an object through the rows that refer to it, up to the first objects
  it meets, so a wall whose 'Body' representation or placement was rewritten is modified. It never
  walks from one placement to the placements relative to it: an opening placed on a moved wall moved
  with it but did not change.
- `LastModifiedDate` is always written, because IFC4's `CorrectChangeAction` rule allows `ADDED` and
  `MODIFIED` only beside it. The application is the one `IfcApplication` whose identifier is
  `@bitbybit-dev/ifc`, created once per file with the version the CDN url names.

## GlobalIds

A GlobalId is 128 bits in IFC's 22-character alphabet, stamped with the version and variant bits of a
version 4 UUID. A derived one hashes a seed and a key (`hashOfText`, repeated with a counter until the
16 bytes are filled). Three kinds are derived in separate domains, so no two hash the same text: a
caller's key (`keyGlobalId`); the library's automatic ids (`automaticGlobalId`), for what it creates
without a key, such as relationships, property sets and an element given no `id`; and the site and
building (`structureGlobalId`). Their seed is the project's GlobalId, which `model.create` derives
from the caller's `seed` text (`projectGlobalId`) or makes random.

In a model the library created, automatic GlobalIds come from the seed, the next free express id of the
snapshot the transaction started from and a counter, so the same calls give the same file. In a model
read from a file they are random: two independent edits of one file would otherwise mint the same
GlobalId for different objects. Creating always derives from the key, even a key that looks like a
GlobalId; looking up (`resolveObject`) takes a GlobalId the model holds as itself and anything else as a
key. A transaction refuses a GlobalId the model or the transaction already holds, and the encoder
refuses one that is not 22 characters of the alphabet.

Files from other tools do not always keep GlobalIds unique: an export may give one GlobalId to
several entities, such as two copies of one rebar. Such a file reads and builds as it is, each
copy its own entity; `resolveObject` refuses a GlobalId that several entities own and names them,
since whichever it picked could be the wrong one to read or change. A geometry selection is the one
place it is not refused: `geometry.recipe` asked for such a GlobalId builds every product that owns it.

## Lengths and defaults

A DTO length whose default is a size has no initializer: it is optional, and the service fills it in
the model's length unit (`DEFAULT_MILLIMETRES` divided by `millimetresPerUnit`, in `lengthIn`), so a
model in metres gets a 3 m wall where one in millimetres gets 3000 mm. Geometric checks use the
model's length tolerance, 1e-6 m in its unit (`lengthTolerance`).

## Contexts and relationships

A shape goes in the representation subcontext IFC's conventions name for it (`Plan/Axis/GRAPH_VIEW`
for an axis, `Model/Body/MODEL_VIEW` for a body) when the model has it, otherwise in any subcontext with
that identifier, as other tools lay theirs out, and otherwise in a new one under the parent context of
that type. The answer is cached per transaction.

The building code finds containment, type, material, aggregation, declaration and property
relationships through the back-references of the object they name, never by scanning every
relationship in the model; only the reads of a whole model (`model.elements`, `geometry.recipe`) list
a relationship type, once. A relationship can name tens of thousands of objects (one storey's
containment, one material's association), so whether it names one is answered from a set of its list,
made the first time the list is asked and kept beside the list it was made from; asking each of a
model's elements would otherwise read the whole list each time.

## Storeys and spaces

A storey is placed on its building with its elevation as the placement's height, and everything on it
is placed on the storey, so `spatial.setElevation` moves the storey's placement and its contents follow.
It moves the placement by the change in the recorded `Elevation`, so a storey another tool placed with
an offset of its own keeps it. A space is an `IfcSpatialElement`, so it is aggregated into its storey
(`IfcRelAggregates`) rather than contained in it, is never drawn by a recipe, and makes the storey count
as holding something when the storey is removed. `spaces.list` reads a space's area and height from its
body when that is an outline extruded up, as the spaces this library writes are.

## Walls

A straight wall is placed at its axis start with X along the axis, on its storey's placement. Its
'Axis' representation is a two-point `IfcIndexedPolyCurve` in `Plan/Axis/GRAPH_VIEW`, its 'Body' an
`IfcExtrudedAreaSolid` of its footprint in `Model/Body/MODEL_VIEW`, and its layers an
`IfcMaterialLayerSetUsage` along AXIS2, positive, with the offset its alignment gives. These are the
representations IFC's wall conventions name and that tools editing IFC walls look for. A wall of a wall
type takes the type's layer set and leaves its own `PredefinedType` unset, so the type's applies.

`readWall` reads a wall back from those entities, accepting an `IfcPolyline` axis too, as other tools
write, and an axis that starts anywhere in the wall's coordinates so long as it runs along their X:
IFC offsets the layers along the placement's Y, which lies across the wall only then. A wall that is
not upright, whose axis runs another way, or whose body is not an `IfcExtrudedAreaSolid` (under any
clippings) rising straight up from a plan outline, is refused before anything is changed.

A wall without a layer set usage, as Revit writes most of its walls (a plain material or a constituent
set instead), is read from its body: when the body's plan outline, placed by the extrusion's
position, is a strip whose every corner lies on one of two lines along the axis, the lower line is
its offset and the distance between them its thickness. Its edits rebuild the body alone and keep the
material it has, since a plain material says nothing of thickness; a layer set given to it explicitly
replaces the material with a usage. An outline with holes or one that is not such a strip is refused,
and so is the elevation Revit extrudes through a wall's thickness where a door reaches the floor:
rebuilt as a plan outline it would lose the door's notch. Over the corpus this reads 43 of 78 walls
of one Revit file and 143 of 212 of another that read none before.

The footprint is the two side lines of the layers cut at each end. An end without a connection is cut
square. A connection between two ends (`ATSTART`/`ATEND` on both) is a mitre: the cut runs through the
two points where the walls' corresponding sides meet, pairing left with left when the walls run on from
each other and left with right when they meet head on. A connection from an end to another wall's path
(`ATPATH`) cuts the end at the near face of the other wall, the face on the side the end's wall stands.
A connection of any other type (`NOTDEFINED`) is left aside.

`walls.connect` finds which ends meet: ends within the thicker wall's thickness of each other make a
corner, an end within reach of the other's layers and between its ends makes a T, and corners are
preferred; two parallel walls are never joined as a T. A wall end joins one other wall, so joining an
end already joined to a third wall is refused, and joining the same two walls again replaces their join;
a wall's length takes any number of T joins.

Clipping wraps the body's extrusion in one `IfcBooleanClippingResult` per plane, with an
`IfcHalfSpaceSolid` whose `AgreementFlag` is false, so the plane's normal points into the part
removed. Regenerating a footprint keeps the half-spaces and rewraps the new extrusion.

`walls.edit` writes a wall again from its new parameters. Its `IfcLocalPlacement` stays and takes the
relative placement that carries the old axis onto the new one, its start, direction and bottom, so the
wall's own coordinates keep their meaning wherever another tool put the placement against the axis,
and whatever is placed relative to the wall moves with it. The Axis is written again in those
coordinates, the layer set usage too when the layers or their offset change, and the body from the new
footprint and joins. The joins are kept, and each is checked first with the reach
`walls.connect` uses: a change that takes the wall out of reach of a wall it is joined to is refused,
since the join would no longer describe the walls. A join another tool wrote between walls this test
does not see meet (the edit lane found 444 of 784 in one authoring tool's file) is refused before any
change, saying so, since the library could not keep it. The walls whose ends it trims are rebuilt after it.
Clippings stay where they were in the building: each half-space is carried from the old wall frame to
the new one. An opening is read back as an offset along the axis, a sill, a width and a height when its
body is one rectangle extruded through the wall's thickness and it is placed relative to the wall. The
openings move with the wall; when its faces move, with its thickness or side, each is written again
through the new thickness, and its doors and windows are carried from the middle of the old wall to the
middle of the new, so they stay centred whatever frame the opening was written in. A door or window is
carried when it is placed on its opening or on the wall and an opening when it is placed on the wall,
so a change that moves the wall or its faces refuses one placed anywhere else, and one read no other
way stays on a wall that only moves but refuses a change of thickness or side. `walls.parameters` reads the same parameters back from any wall
`readWall` accepts, and `walls.disconnect` deletes the joins between two walls and squares the ends they
trimmed.

## Openings and fillings

An opening is placed on its wall's placement, at the wall's far face plus a margin, and extruded back
through the wall's thickness plus a margin each side (`OPENING_MARGIN_RATIO` of the thickness), so it
always cuts through. A door or window cuts its own opening, is placed on the opening's placement,
centred in the wall's thickness, and is drawn by an `IfcMappedItem` of its type's Body
`IfcRepresentationMap`.

A type's size is read back from that map's geometry: the box around its extruded rectangles, each
corner carried through the profile's position, the extrusion's direction and depth, the solid's position
and the map's mapping origin. The occurrence is offset by the box's minimum corner, so the box sits in
the opening whatever origin the type's geometry has, and its `OverallWidth` and `OverallHeight` match
the opening it cuts. An occurrence leaves its predefined, operation and partitioning types unset, so its
type's apply.

A door type's `handle` (a lever, or a pull bar on two posts) is part of its geometry, on both faces of
the panel near the edge away from the hinges its operation names (`*_RIGHT` hinges on the right, so the
handle goes left). Its sizes are millimetres converted to the model's unit
(`HANDLE_MILLIMETRES`); it stands off the panel past the lining, which deepens the type's box but not its
width or height, so the opening it cuts is unchanged and the door stays centred in the wall.

A type's parts take materials: a window's frame and glass, a door's lining, panel and handle. Each named
material styles its part's items with the material's own `IfcSurfaceStyle`, so a viewer shows a dark
frame around clear glass and the recipe gives each part as a root of its own colour; a material without
a colour styles nothing. The type is also associated with an `IfcMaterialConstituentSet` naming the
parts (`Framing` and `Glazing`, `Lining` and `Panel`), which the occurrences take from it.

`openings.edit` reads an opening back as `walls.edit` does and writes it again at its new offset, sill
or size, carrying the doors and windows in it as `walls.edit` does; one placed anywhere but on the
opening or the wall is refused. Given a door or
window, it edits the opening that holds it, whose size is the door's or window's own.

A slab opening (`openings.addInSlab`) is placed on the slab's placement at its top face plus a margin
and extruded down through the slab's thickness plus a margin each side, the thickness read from the
slab's body: an outline extruded straight up or down, whichever way another tool wrote it. When the
slab's outline can be read (an arbitrary profile over a polyline), the opening's outline must lie inside
it or on its edge. A slab opening is related to the slab alone, not to its storey.

## Assemblies

`assemblies.add` makes elements the parts of an `IfcElementAssembly` (`IfcRelAggregates`), which IFC4
documents as the element made of other elements, with members, plates and the like as parts. A
covering (`IfcCovering` of type CLADDING) would name a cladding more closely, but IFC documents no
decomposition of a covering into parts, so boards gathered into one are an assembly whose `ObjectType`
says `Cladding`. As IFC asks, the parts leave the spatial structure: their
`IfcRelContainedInSpatialStructure` lets go of them, and the assembly is contained where they stood,
placed at that structure's origin. The parts keep their own placements, so nothing moves.
`model.elements` and `model.element` give a part the structure its whole stands in (`standingIn`),
nested wholes included, so a board still lists under its storey; `storeyOf` already looked through
aggregates. Removing an assembly removes its parts, as removing any aggregate does.

## Elements from shapes

`elements.add` writes an element of any non-abstract subtype of `IfcElement` whose body is given as a
recipe of brep or triangles steps, such as an OpenCascade shape `occt.recipes.describe` turned into
one. A closed brep step's solids become `IfcAdvancedBrep` items, an open one's faces an
`IfcShellBasedSurfaceModel`, and triangles an `IfcTriangulatedFaceSet` marked closed when every edge
is run once each way. Curves and surfaces are written once however many edges and faces lie on them.
Advanced faces take planes, cylinders, spheres, tori and B-spline surfaces; IFC4 has no conical
surface, and its swept surfaces sweep a profile definition rather than a curve, so a cone or a swept
surface is refused and `ifcSurfaces` on `describe` writes them as B-splines instead. Roots may move
and turn their steps, never scale or mirror them, and are written in the element's own frame, the body
scaled from its units to the model's.

A solid with cavities is written as an `IfcCsgSolid` of its outside less each cavity
(`IfcBooleanResult` DIFFERENCE of `IfcAdvancedBrep` operands, the cavities wound outward), not as an
`IfcAdvancedBrepWithVoids`. The schema's own rule on that entity (`VoidsHaveAdvancedFaces`, the same in
IFC4X3) counts the voids made only of advanced faces and requires there to be none, so every valid
instance fails it, and IfcOpenShell 0.9 builds no brep with voids at all, faceted ones included. The
reader still reads `IfcAdvancedBrepWithVoids` other tools write.

## Moving

`model.move` turns an element's absolute frame about the vertical through its origin, moves it, and
writes the result relative to the placement it was relative to, so what is placed on the element moves
too. The translation is read in the plan of the element's storey, or of the storey a space belongs to.
It refuses what another verb moves (an opening, a door or window, a joined wall, a storey), an element
that shares its placement with another product, and one placed on another element, which moves with
that element.

## Removing

`model.remove` first gathers everything that goes with the object: the openings that void it, the
doors and windows that fill those openings, and the parts it aggregates (never a spatial element's,
which must be empty). It refuses the project, site and building, a storey or space that still holds
anything, and a type that elements are of, before anything changes. Each gathered object is then taken
out of every relationship that names it: a relationship that names it in a single role, or is left with
an empty list, is deleted; one that lists other objects too keeps them. Only relationships are changed,
so anything else that refers to the object makes the commit refuse the removal. Layer sets, materials and
types stay as the library items they are; a material usage, a property set or geometry that nothing uses
any more is pruned. An `IfcShapeAspect`, which Revit and Archicad write for the parts of a product's
shape, is part of the product shape or representation map it describes: one only its whole refers to
goes when that whole is pruned, with the representations only it held, as a styled item goes with its
item; an aspect a door or window's panel or lining properties refer to keeps its whole. The edit lane
found the shape left behind without it, which IFC4 refuses. The walls a removed wall trimmed are rebuilt with square ends, when this library
can read them as walls; a wall another tool wrote in a form it cannot read keeps the footprint it had.

## Site

Terrain and trees are `IfcGeographicElement`s contained in the model's one `IfcSite` and placed on it,
not on a storey. Terrain (`TERRAIN`) is an outline with holes extruded down from its top by its depth, so
paving or a building footprint left as a hole meets it flush without two faces in one plane. A tree
(`USERDEFINED`, its species as `ObjectType`, which IFC4 asks of a user-defined type) is one Tessellation
body of two closed `IfcTriangulatedFaceSet`s: a crown from base's `icosphere`, stretched upwards and
rippled so it does not read as a ball, and a tapering trunk from base's `frustum` that reaches into it. The
crown is at most 45 percent of the tree's height, so every tree has a trunk. Each part takes its material
the way a door or window part does: a styled item and a constituent of the element's constituent set.

`model.georeference` reads where a model sits on the Earth and changes nothing. IFC4 places a model's
coordinates on a map with an `IfcMapConversion` from a representation context to an `IfcProjectedCRS`;
when a file holds several, the one from the 'Model' context is read, else the first. Its eastings,
northings and height are in the map's unit, which is why they are given as written and not converted.
The site's reference latitude and longitude are compound angles - degrees, minutes, seconds and
millionths, all negative to the south and west - read into decimal degrees. An IFC2X3 file has no map
conversion and often places its site kilometres from the origin instead; such a model reads as unmapped.

## Slabs

A slab is placed at its storey, raised by its top offset, and extruded down from that reference plane:
the solid's position is at z = 0 and its `ExtrudedDirection` is (0, 0, -1), as its
`IfcMaterialLayerSetUsage` along AXIS3, NEGATIVE, offset 0 says. An outline may repeat its first point
at its end; a point repeated anywhere else, an outline that encloses no area and a hole with a point
outside the outline are refused, at the model's length tolerance.

## Roofs

A roof covers a rectangle. Every slope of it has the same pitch, so over a rectangle the planes meet in
straight lines without a straight skeleton: a gable's ridge runs along the first side, halfway across
the rectangle, and a hip's ridge runs along the longer sides, as long as the longer side less the
shorter, coming to a point over a square. The overhang widens the rectangle on every side and lowers the eaves along the slope,
which leaves the ridge where it was. Each plane is an `IfcSlab` ROOF placed on the plane, its outline in
the plane's coordinates (X level along the eaves, Y up the slope), extruded up through the thickness, so
its underside is the plane. Its `IfcMaterialLayerSetUsage` runs along AXIS3, NEGATIVE, offset by the
thickness, so the first layer is at the top as a slab's is, and a layer set reads the same on both;
the slabs are placed on the `IfcRoof` and aggregated into it, so moving or
removing the roof moves or removes them.

`walls.clipByRoof` reads each part's underside back from its body and clips the wall by every plane that
passes below the wall's top at a corner of its footprint. These roofs are convex, so the lowest of their
planes is the roof's underside everywhere, and clipping by each plane that reaches the wall gives a
gable wall its triangle and leaves an eaves wall level. A plane the wall is already clipped by is not
added again, nor is one plane added twice when two parts lie in it. Each part's plane clips the whole
wall, so a part whose plane is below the wall's bottom at every corner of its footprint is refused
rather than clipping the wall away.

Bonsai, the authoring tool built on IfcOpenShell, rebuilds a wall's body from its axis, layers and
joins, and keeps only the clippings its own `BBIM_Boolean` property set lists: a property `Data`, an
`IfcLabel` holding a JSON list of the step ids of the element's boolean results (learnt from files
IfcOpenShell writes). So every clipping this library adds is listed there, or Bonsai would drop a roof
clipping the first time it regenerated the wall. A body is rebuilt with new rows whenever a wall is
joined, edited or clipped again (`lib/build/clipping-registry.ts`, at both places a wall's body is
replaced): a clipping keeps its place in the chain across a rebuild, so the new chain's clipping at a
place the old one listed is listed, one beyond the old chain is new and listed, and one the file had
not listed stays unlisted, since Bonsai makes some of its own. A listed boolean outside the chain is
kept while it exists. The set is written only for a wall that has had one or had a clipping listed,
and only when its list changes.

## Property sets

IFC does not allow a type object in `IfcRelDefinesByProperties`, so a property set given to a type goes
in the type's own `HasPropertySets` and is read back from there. An occurrence's set is related to it
by an `IfcRelDefinesByProperties` and found through its back-references.

A set held by more than one object is shared data: changing it for one object (`properties.setValues`,
`properties.removeValues`) first gives that object a copy, which shares the unchanged property entities,
so the others keep their values. A changed value is a new property entity; the old one is pruned when no
set holds it. A set left with no properties is taken away, since IFC needs at least one. An occurrence
whose type has a set of the same name gets its own set, whose values override the type's as IFC says.

## Quantities

`quantities.compute` writes IFC's base quantity sets (`Qto_*BaseQuantities`) as an `IfcElementQuantity`
per element, measured from the element's own body, in place of any quantity set of the same name the
element had: one it shares with other elements stays with them.
Lengths are in the model's length unit and areas and volumes in the area and volume units the project
declares (`siPerUnit`), which for the models this library creates are square and cubic metres.

A wall's gross volume is the integral, over its footprint, of the height between the highest of its
base and any clipping that removes from below and the lowest of its top and any clipping that removes
from above; a clipping that stands upright trims the footprint. Each piece where one top and one
bottom win is the footprint clipped by the half-planes where they do, over which the height is
linear, so the integral is exact. Its side area is the same along its middle line. Its openings, read
back as in `walls.edit`, take their rectangle out of the side area and that times the thickness out of
the volume, up to the wall's unclipped height; one read no other way, such as a niche that stops inside
the wall, is left in the gross figures. A slab's net area loses the outlines of the openings in it; its holes are
part of its outline. Columns, beams and members are their section along their length, and doors,
windows and wall openings their size. The quantities are a snapshot: an element changed afterwards is
measured again by computing again.

## Recipes

`modelRecipe` visits every product with a 'Body' representation in a 'Model' context (a subcontext
without a `ContextType` of its own takes its parent's) and gives each a root placed by its absolute
matrix. Openings, spatial elements and annotations are skipped; one that `elements` asks for, or an
element without such a body, is listed as a problem instead. Items convert into nodes once per entity
(`ItemConverter` caches them), so an item two representations share, or a representation map placed by
many mapped items, becomes one node. Openings are converted in the coordinates of the element they
void (their placement relative to its) and cut with one `voids` node.

A mapped item's target is built as IFC's `IfcBaseAxis` builds it: Axis3 (or Z) first, Axis1 projected
square to it, and Axis2 choosing which side the Y axis falls, so a target may mirror; Scale, Scale2 and
Scale3 scale the three axes. A triangulated face set's `CoordIndex` goes through its `PnIndex` when it
has one.

Meshes - triangulated and polygonal face sets, faceted breps (with their voids), and face and shell
based surface models - become one `triangles` node each (`MeshCollector`). A brep's corners are shared
by point and by place, so two points an exporter wrote at the same coordinates become one vertex and
the faces meeting there join; a loop runs backwards when its bound's `Orientation` is false; the outer
loop is the `IfcFaceOuterBound`, or the largest when no bound says. A closed shell is turned outwards
when its triangles enclose a negative volume, and a void inwards when they enclose a positive one; an
open shell or face set is left as written. A representation made only of meshes becomes one mesh, each
item keeping its own vertices, rather than a compound: joining solids makes the kernel re-simplify
dense parts each time their tolerances differ, which turned a door of 18 parts into five seconds.

Faces are cut into triangles by base's `triangulateFace`, which keeps every vertex so that a shell
stays closed where a neighbouring face splits an edge, and shells are turned by base's
`signedVolumeOf`. The vector, frame, polygon and arc arithmetic of the whole package comes from base's
helpers too (`packages/dev/base/ARCHITECTURE.md`, "Shared geometry helpers"); `lib/build/math.ts`
keeps only what is IFC's own: directions normalised with an error, frames built as IFC places them,
the plan lines the wall code joins, and plan points placed by a frame.

Profiles are converted to regions in the profile's plane with the profile's own position applied, so
the polygons and circles of a recipe never need a 2D transform. Outlines are wound counterclockwise and
holes clockwise, though the format accepts either. `CurveSampler` reads an outline: polylines, indexed
poly curves (an `IfcArcIndex` through its three points), composite curves (a segment reversed when its
`SameSense` is false), trimmed circles, ellipses and lines, and whole circles and ellipses. An arc is
divided every 1/32 of a turn, with its trim points kept exact; an arc index goes through base's
`arcThroughThreePoints`. A trim parameter is read in the
project's plane angle unit, preferred over the trim point only when `MasterRepresentation` says so,
and trims that meet take the whole turn, as IfcOpenShell takes them.

A polygonal bounded half-space is the prism of its boundary, reaching `REACH_MILLIMETRES` (a kilometre)
either side of its position, less the side of its plane the half-space leaves out. A boxed half-space
cuts as its plane.

A boolean result's difference is a `difference`, its union a `union` and its intersection an
`intersection`, so both lanes join or intersect the solids exactly. An intersection with a plane's
half-space is a cut by the other side of the plane, since a half-space is not a solid; a union with a
half-space has no bounds and is refused.

Solids other than extrusions are built from the recipe's generic steps, and every decision IFC makes
about them is taken here, so an executor only places what it is given (`SweptSolids`,
`lib/geometry/swept-solids.ts`; a region becomes a solid through `regionSolid`, which joins a composite
profile's parts and hollows a hollow circle the same way for every step).
- A revolved area solid is a `revolve` about its axis, which must lie in the profile's plane; a negative
  angle turns the other way.
- A tapered extrusion is a `loft` of its two profiles, at its start and at its depth along the
  direction, so they must have as many corners each; hollow circles taper as their outer loft less
  their inner one.
- A swept disk is a `loft` of a circle through a frame at every point of its directrix, sampled as an
  outline is; a polygonal one has its corners rounded by its fillet radius first (base's
  `roundedPath3`).
- A fixed-reference sweep turns its profile so the x axis follows the reference across the directrix,
  and a surface-curve sweep so it follows the reference surface's normal: a plane's, or across a surface
  of linear extrusion the directrix's tangent crossed with the extrusion direction. A centred circle
  needs no such axis, so it sweeps on any surface; another profile on a surface no rule reads is
  refused.
- The frames come from base's `paths.ts`: the profile square to the tangent (at a corner the bisector,
  at the ends the curve's own tangent when it is a circle, an ellipse or made of them), its axes carried
  along without twisting by double reflection, and a corner's section stretched across the bend so a
  tube keeps its width.
- `StartParam` and `EndParam` are honoured when they span the whole directrix, read as IFC defines
  them or from the trimmed curve's start as Revit writes them; a sweep along part of its directrix is
  refused for now.
- CSG primitives are a block's extruded rectangle, a cylinder's extruded circle, a cone's and a sphere's
  turned half sections and a pyramid's closed mesh; a CSG solid is its tree.

Advanced breps are meshes in the mesh lane: one `triangles` node, as faceted breps are, built face by
face (`AdvancedFaces`, `lib/geometry/advanced.ts`).
- Every edge is sampled once, from its start vertex to its end along its curve (`EdgeSampler`,
  `lib/geometry/edges.ts`): a line, a polyline, a circle or an ellipse in the edge's sense, the whole
  way round when its vertices are one, a B-spline between the parameters nearest its vertices, a curve
  on a surface through its curve in space. Two faces that share an edge share its points exactly, so
  the collector welds them and the shell closes.
- A face's surface gives a point for two parameters and the parameters of a point
  (`parametricSurface`, `lib/geometry/surfaces.ts`): planes, cylinders, spheres, tori, surfaces of
  revolution and of linear extrusion, and B-spline surfaces, a rectangular trimmed or curve bounded
  surface through its basis. Each is parametrised as ISO 10303-42 parametrises it, so the surface's
  normal is the one the face's `SameSense` refers to; a revolution's or an extrusion's curve is
  sampled eight times as finely as an outline, so the normal's kinks at its points stay small. A
  B-spline surface is inverted by damped Newton steps from the previous point, restarted from a grid
  when it misses, and closed where its flags say.
- The loops go into parameter space, angles unwrapped along each loop. A face whose two loops wrap
  around its surface (a band of a cylinder without a seam edge) is cut open along a seam between them,
  and one whose single loop wraps (half a sphere) is closed over the pole; the cut and the pole's edge
  are sampled along the surface as finely as its normal turns, a step every 1/32 of a turn, the same
  points on both sides of the cut. A turn within a billionth of a step of a whole number of steps takes
  no extra step: half a sphere's normals turn a quarter turn, eight steps, give or take their
  rounding, and without that slack the rounding decided between eight and nine. `refinedSurfaceMesh` (base) then meshes the face, and its triangles are turned to face along
  the surface's normal, or against it when `SameSense` is false.
- A rational spline whose ends meet their vertices only once its control points are divided by their
  weights is read divided, and a rational surface its boundary misses is tried the same way: one
  exporter writes its control points multiplied by their weights.

IfcOpenShell 0.9 builds no polygonal swept disk with a fillet and no CSG cylinder or cone, and gives an
open shell for a tapered rectangle; those rest on the executors' own tests of the same steps, which
compare turns and lofts with volumes worked out by hand.

An element gives one root for each surface style its items carry (`ItemConverter.parts`), so a window
is an opaque frame and see-through glass rather than one colour. An item's own style comes from the
`IfcStyledItem` that names it, through an `IfcPresentationStyleAssignment` when the file wraps it in one
as IFC2X3 does; items inside a representation map keep their own styles, and a styled mapped item lends
its style to those that have none. Items of one style are joined as one root, meshes into one mesh, and
the element's openings are cut through every root it gives. A part with no style of its own takes the
element's material style: through its material, its layer set usage, or the first styled material of
its layer set. The colours of every material and item are read once per recipe.

The recipe's `millimetresPerUnit` is the model's unit and its `tolerance` the 'Model' context's
precision, or the length tolerance when the context gives none. `geometry.recipe` and
`geometry.unsupported` share one build: the service keeps the last description per model, with the
`elements` and `groupByClass` it was made for, so asking for both describes the model once.

Every root belongs to a group of the recipe (`RecipeGroups`, `lib/geometry/groups.ts`), made the first
time an element needs it, after the group it lies in. An element that is a part of another element (a
roof's slab, an assembly's member) belongs to a group of its whole, named after it and placed where the
whole would be; any other element belongs to its spatial structure, the site, building, storey or space
holding it, each a group in the one that aggregates it, up to but not including the project. With
`groupByClass` an element's group is a class group inside its structure, named after the IFC class as
a plural (`Walls`, `Element assemblies`), and the parts of a whole sit in the whole's group without
one. An element finds its group through the relationships, never by geometry, so a group is right
however the elements overlap.

A parameterized profile is outlined in its own frame, centred on its bounding box, and its corner radii
are drawn as arcs as finely as curves are (`arcSegments`, 32 segments a turn) by base's
`roundedCorners2`: an I, asymmetric I, U, T, L, C or Z section's fillets and edges, a hollow or rounded
rectangle's corners. Where IFC leaves a convention open, the outline is IfcOpenShell's: a C section's
outer corners are rounded by its inner radius plus its wall, a Z section's lower flange runs to the right
of the web and its upper one to the left, and an asymmetric I section without a top flange thickness takes
the bottom one's. An IFC2X3 asymmetric I section is read without edge radii or slopes, since the IFC4
table reads its centre of gravity where IFC4 put the bottom edge radius. A trapezium is placed by its top's
offset from its bottom's left corner, and an ellipse is a polygon divided as a circle is.
Sloped flanges follow IfcOpenShell's reading, which differs by section: an I section keeps its stated
flange thickness at the flange tip, a U section at the profile's centre line; a sloped L leg or T web or
flange is refused for now, as no file in the corpus has one. A slope is an angle in the model's plane
angle unit. A hollow circle stays exact: its outer circle's extrusion less its inner one's, so the
exact lane keeps true cylinders.

Two things IFC forbids are read as other readers read them, since exporters write both. A negative
extrusion depth extrudes the other way, which is how a plate extruded both ways from its middle comes
out whole. An arbitrary profile whose polyline has points off the profile's plane is built in the plane
those points lie in (`CurveSampler.planeOf`), and the extrusion is turned into that plane; points that
lie in no one plane are refused.

A composite profile is a region of regions, each part extruded on its own and the extrusions taken
together as one compound. A derived profile is its parent, placed by the parent's own position, then
moved, turned and scaled by its operator; a circle stays a circle under an operator that keeps its shape
and is outlined under one that stretches it. A mirrored profile is a derived one whose operator, as the
schema derives it, mirrors about the y axis, so a parent placed off the axis lands on its other side.
IfcOpenShell 0.9 reads both differently: it mirrors a placed parent in the parent's own frame, which
leaves it where it was, and it neither turns nor scales a derived profile as its operator says.

## The schema generator

`scripts/gen-ifc-schema.mjs` reads EXPRESS with regular expressions over the comment-free text, which
is enough because IFC's schemas use a small, regular subset: one supertype per entity, explicit
attributes, `DERIVE` redeclarations of inherited attributes (written `*` in a file) and `INVERSE`
attributes. It skips `WHERE`, `FUNCTION` and `RULE` blocks, which only full validation needs. It fails
on any type it cannot read and on any name the schema does not define, so a schema it misreads cannot
produce a table. Its suite checks buildingSMART's own counts for IFC4: 776 entities and 397 types, 207
of them enumerations and 60 selects; and IFC4X3 ADD2's: 876 entities and 436 types, 243 of them
enumerations and 61 selects.

IFC 4.3 keeps 736 of the 760 entities it shares with IFC4 attribute for attribute; seven append
attributes, the rest mostly rename one in place (a property's `Description` became `Specification`),
and the building element supertype is `IfcBuiltElement` where IFC4 has `IfcBuildingElement`. Code that
names an IFC4-only type (`IfcPresentationStyleAssignment`) asks through `isSubtypeOf` and `byType`, which
answer no and nothing for a name the schema does not define, so it reads an IFC4X3 model unchanged.
The IFC4X3 file's notice is not in the file, so the generator reads it from `IFC4X3_ADD2.notice.txt`,
the publication's copyright and warranty text, verbatim. Each table is about 30 KB gzipped (the IFC4X3 one 34 KB
minified); both are loaded with the package, which the worker that hosts it loads only on first use.

## Checked by an outside tool

The suites read back what the library wrote, so they share its understanding of IFC.
`npm run validate` checks that understanding against IfcOpenShell's: `validation/fixtures.ts` builds
one model per group of verbs, plus a two-storey house, through the public API, and `validation/check.py`
runs on every file it writes. For each file it reports:
- what IfcOpenShell's validator finds, with the schema's `WHERE` rules and functions;
- every product IfcOpenShell cannot make a shape for, from its 'Body' representation as viewers do;
- every wall IfcOpenShell's own wall regeneration (the logic of its authoring add-on) rebuilds to a
  different volume from the axis, the layer set usage and the joins. The regeneration keeps only the
  clippings `BBIM_Boolean` lists, so a wall with a clipping it does not list is left out and counted,
  and every fixture must have none: a roof-clipped wall is regenerated with its clippings.
- every net volume `quantities.compute` writes that differs from the volume IfcOpenShell measures from
  the element's geometry with its openings cut. A circular section is measured by IfcOpenShell as a
  polygon, so it agrees to 1 % rather than exactly.

- every volume an element's `Validation_Expected` property set states as `NetVolume` that differs from
  the one IfcOpenShell measures, so a fixture can state the volume of a body no quantity set covers.
  Advanced breps on curved surfaces are measured from IfcOpenShell's tessellation, to 1 %.

IfcOpenShell 0.9's rule executor fails with a Python error on `IfcSurfaceWeightsPositive` for every
rational B-spline surface, buildingSMART's own samples included, so `check.py` evaluates that one rule
itself when the executor fails on it. The executor needs pytest, which `requirements.txt` pins beside
IfcOpenShell. The suite runs only on request, since it needs a Python with both (`IFC_PYTHON`, or
`python3`). A new verb adds the fixture that uses it.

## Measured against real files

The fixtures are files this library wrote. `npm run ifc:corpus` at the repository root
(`scripts/README.md`) measures files other tools wrote: the ones `corpus/corpus.json` lists - authoring
tools' exports, viewers' sample sets and buildingSMART's own examples, each with its licence and SHA-256 -
downloaded on request and never committed. For each file it times reading, querying and the recipe,
builds every element with Manifold (and with `--exact`, as OpenCascade shapes), counts the elements the
recipe reports unsupported and the roots that build empty, checks that writing the model back leaves its
DATA section byte for byte the same, and compares every element's volume and bounding box to the ones
IfcOpenShell measures (`corpus/oracle.py`). With `--edits` it also edits every IFC4 and IFC2X3 file
up to 20 MB through the public API, upgrading an IFC2X3 one first, and has IfcOpenShell's validator
check that the edits added no error to the ones the file already had. A change to reading or to the
recipes is measured before and after it.
