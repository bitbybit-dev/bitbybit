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
millions of rows costs two arrays rather than a map of sets. A 677 MB file of 10.9 million rows reads
in under 4 s and builds both lookups in about 4 s more, with half a gigabyte of JavaScript heap beside
its bytes.

An IFC2X3 file is read through the IFC4 table. IFC4 kept almost every IFC2X3 entity, renamed few
attributes in place and appended most new ones, so a row decodes by IFC4's positions and a missing
trailing attribute reads as unset; two production files of 1.5 and 10.4 million rows decoded in full
but for one row, and built the same geometry as through an IFC2X3 table. Such a model names its own
schema (`schemaName` is `IFC2X3`) and is not `editable`: a change would be written in IFC4's shape into
a file that says IFC2X3, so `IfcTransaction` refuses to start. `upgradeToIfc4` makes it an IFC4 model:
every row is checked against IFC4, attributes IFC4 added are left unset, a newly required enumeration
takes `NOTDEFINED`, a set loses repeated members, and an entity IFC4 merged into its parent
(`IfcRelOccupiesSpaces`) becomes that parent. Only the rows a rule changed go into the overlay - 16
thousand of the 10.4 million - so the others are still written as read; anything no rule covers stops
the upgrade, naming the entity. The writer copies the file's header only when it is the one the file was
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
since the join would no longer describe the walls. The walls whose ends it trims are rebuilt after it.
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

`openings.edit` reads an opening back as `walls.edit` does and writes it again at its new offset, sill
or size, carrying the doors and windows in it as `walls.edit` does; one placed anywhere but on the
opening or the wall is refused. Given a door or
window, it edits the opening that holds it, whose size is the door's or window's own.

A slab opening (`openings.addInSlab`) is placed on the slab's placement at its top face plus a margin
and extruded down through the slab's thickness plus a margin each side, the thickness read from the
slab's body: an outline extruded straight up or down, whichever way another tool wrote it. When the
slab's outline can be read (an arbitrary profile over a polyline), the opening's outline must lie inside
it or on its edge. A slab opening is related to the slab alone, not to its storey.

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
any more is pruned. The walls a removed wall trimmed are rebuilt with square ends, when this library
can read them as walls; a wall another tool wrote in a form it cannot read keeps the footprint it had.

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
its underside is the plane; the slabs are placed on the `IfcRoof` and aggregated into it, so moving or
removing the roof moves or removes them.

`walls.clipByRoof` reads each part's underside back from its body and clips the wall by every plane that
passes below the wall's top at a corner of its footprint. These roofs are convex, so the lowest of their
planes is the roof's underside everywhere, and clipping by each plane that reaches the wall gives a
gable wall its triangle and leaves an eaves wall level. A plane the wall is already clipped by is not
added again, nor is one plane added twice when two parts lie in it. Each part's plane clips the whole
wall, so a part whose plane is below the wall's bottom at every corner of its footprint is refused
rather than clipping the wall away.

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
either side of its position, less the side of its plane the half-space leaves out; the recipe has no
intersection, and that difference is one. A boxed half-space cuts as its plane.

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
`elements` it was made for, so asking for both describes the model once.

## The schema generator

`scripts/gen-ifc-schema.mjs` reads EXPRESS with regular expressions over the comment-free text, which
is enough because IFC's schemas use a small, regular subset: one supertype per entity, explicit
attributes, `DERIVE` redeclarations of inherited attributes (written `*` in a file) and `INVERSE`
attributes. It skips `WHERE`, `FUNCTION` and `RULE` blocks, which only full validation needs. It fails
on any type it cannot read and on any name the schema does not define, so a schema it misreads cannot
produce a table. Its suite checks buildingSMART's own counts for IFC4: 776 entities and 397 types, 207
of them enumerations and 60 selects.

## Checked by an outside tool

The suites read back what the library wrote, so they share its understanding of IFC.
`npm run validate` checks that understanding against IfcOpenShell's: `validation/fixtures.ts` builds
one model per group of verbs, plus a two-storey house, through the public API, and `validation/check.py`
runs on every file it writes. For each file it reports:
- what IfcOpenShell's validator finds, with the schema's `WHERE` rules and functions;
- every product IfcOpenShell cannot make a shape for, from its 'Body' representation as viewers do;
- every wall IfcOpenShell's own wall regeneration (the logic of its authoring add-on) rebuilds to a
  different volume from the axis, the layer set usage and the joins. A wall under a clipping is left
  out: the regeneration knows nothing of clippings it did not make.
- every net volume `quantities.compute` writes that differs from the volume IfcOpenShell measures from
  the element's geometry with its openings cut. A circular section is measured by IfcOpenShell as a
  polygon, so it agrees to 1 % rather than exactly.

The suite runs only on request, since it needs a Python with IfcOpenShell 0.9 (`IFC_PYTHON`, or
`python3`). A new verb adds the fixture that uses it.
