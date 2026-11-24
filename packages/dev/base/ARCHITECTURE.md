# Architecture - `@bitbybit-dev/base`

Why parts of this package work the way they do, where the code alone does not say. The conventions
are in `CLAUDE.md` beside this file.

## Kernel calls

- `describeKernelFailure` reports a WebAssembly trap (an error named `RuntimeError`) as kind `crash`,
  apart from an ordinary kernel failure, because a trap leaves the kernel's memory in an unknown state
  and nothing the kernel holds can be trusted afterwards.
- A `KernelOperationError` is recognised by its `name`, not by `instanceof`: the error may have been
  thrown by another copy of the class than the one describing it, and `instanceof` matches only its
  own. Only a string `code` makes it a named failure.

## Settings

A setting is something an instance works by for all of its calls, set once: today the coordinate
system the model's numbers are in. `BitbybitSettings` (`lib/api/kernel-calls/settings.ts`) is the one type,
and `checkedSettings` the one gate: it refuses a name that is no setting and a value its setting does
not take, as an `InputError`, and returns a new object. A new setting is a property on the type and
a line in that file's table of checks; nothing else carries a list of them.

- **Per instance, never global.** `BaseBitByBit.settings` holds them, checked as they are set, and
  the services that read them (text, the point grids, recipes) take a getter, so two instances in
  one page can differ. A kernel service exposes them as a `settings` accessor (`occt.settings`,
  `jscad.settings`).
- **Set once, not sent with a call.** A worker manager's `setSettings` checks them where they
  arrive and sends one reserved command (`SettingsRelay`, shared by the three managers); the worker
  keeps them, gives them to a kernel that replaces a crashed one, and adds them to its cache key only
  when there are any (`settingsCacheKey`), so a call made with no settings hashes as it always did.
  The manager remembers what it accepted and tells a worker set later. Nothing waits for the
  worker's answer: a worker takes calls in the order they came and holds those that arrive before
  its kernel is ready, so every later call works by the settings, and waiting for the answer would
  wait for the kernel to load. A worker that refuses them all the same reports it through the
  manager's `errorCallback`. A renderer's root object does all of it with
  `await bitbybit.setSettings(bitbybit.engineSettings())`, for all three kernel workers at once.
- **No setting means the behaviour from before settings existed**, pinned by tests, so nothing
  saved changes until an application opts in. One bug fix is the exception: `occt.io.saveShapeSTEP` with
  `fromRightHanded` turned the shape a quarter about X the wrong way, which stood it upside down in a
  Z-up program, and now turns it upright with no setting too. A script that turned the file back
  itself drops that turn; the release notes say so.

### Conventions levels

Content an application saves cannot carry its settings, because the right ones depend on the engine
that runs it: the same model is left-handed in a default BabylonJS scene and right-handed in three.js.
It carries one whole number instead, its conventions level. 0, or no level, is the behaviour from before
settings existed; 1 is the engine's own coordinate system; a later setting joins a later level, and
levels only add. `settingsOfConventions(level, engineSettings)` turns a level into settings,
`CURRENT_CONVENTIONS` is the newest level, a renderer's root object applies one with
`setConventions(level)`, and `initBitByBit` takes it as its `conventions` option. A level newer than
the installed libraries know runs by the newest they have.

### Moving content to a newer level

A level is a promise to keep an older behaviour alive, so content is meant to leave it. Whether it
can leave unseen depends on what it uses: `core` lists every operation a level changes
(`CONVENTIONS_SURFACE`, with `isConventionSensitive` for an operation's path and
`conventionSensitiveMentions` for source code). Content that uses none of them gives the same result
at every level, so an application may move it to the newest one as it is. Content that uses one is
best moved by its author, told which operations change, because only the author knows whether the
content already works around the old behaviour.

### The coordinate system

The kernels are right-handed with Y up. A default BabylonJS scene is left-handed and draws the
kernel's numbers as they are, which shows a mirror image; three.js and PlayCanvas are right-handed.
With `coordinateSystem` set, the library speaks the engine's system: every file is a true
right-handed file, and a shape that names a hand shows that hand on screen.

| What | `leftHanded` | `rightHanded` |
|---|---|---|
| A file with Z up, out (STEP, STL, OBJ, PLY, 3MF, a 3D DXF) | Y and Z swapped: (x, z, y) | a quarter turn about X: (x, -z, y) |
| A file with Z up, in | Y and Z swapped | the turn back: (x, z, -y) |
| A file with Y up (glTF, or the up flag off) | X mirrored: (-x, y, z) | as it is |
| A drawing or text laid on the ground | (x, 0, y) | (x, 0, -y) |
| A view drawn onto a drawing plane | its y mirrored | as the kernel gives it |
| A named hand, or a winding named as it is seen (a helix's or a flat spiral's `clockwise`, a thread, a helical gear) | built as the mirror image | as the kernel builds it |

The table lives once, in `helpers/files`. `meshMatrixInFile` and `meshMatrixInModel` hold the file
rows as matrices, `stlAxesInFile` and `stlAxesInModel` read an STL's axis map off them, and
`pointOnGround` (`ground-axes.ts`) is the ground row, which is the Z-up row read in, on the
drawing's plane (held so by test). Code that moves a mesh, a point or a placement calls them rather
than writing a matrix out; the kernels' own turns of a shape, which keep the arithmetic of the
behaviour before settings, are held equal to them by test.

Rotation sense (a "counterclockwise" angle, the turn of a twist) is not a hand and is left alone:
in a left-handed scene a positive turn follows the left-hand rule, as the engine's own do. A flat
spiral has no hand either, a mirror through its own plane being the same spiral, but its
`clockwise` is worded as a helix's is, as what is seen from the tip of its normal, so it is built to
show that. A dimension label reads the same in both systems by construction.

The file rows are not a choice of ours beyond one axis. Three laws pick each of them out of the 48
axis-aligned systems (24 rotations, 24 mirrors), and `file-axes-laws.test.ts` runs all 48 against
them and finds exactly the table's entry:

1. **The picture.** A camera looking at the model in its own system and a right-handed viewer
   looking at the file from the same place show the same picture. A left-handed model therefore
   goes out through a mirror, a right-handed one through a turn.
2. **Up.** The model's up (+Y) is the file's up: +Z in a file with Z up, +Y otherwise.
3. **The named axis.** The picture and up leave four systems, a quarter turn about up apart. A
   file with Z up keeps the model's X as its X, as CAD programs expect a part standing on the XY
   plane; a file with Y up keeps the model's Z, which is what glTF loaders do in a left-handed scene.

Opened in other programs, the files the table produces show two things that are the formats' and
not ours:

- **An OBJ file does not say which way is up.** FreeCAD reads it as it is, so it wants Z up;
  Blender assumes Y up and stands it on Z. The up flag is the caller's to choose for the program
  the file is for.
- **A file with Y up from a left-handed scene is seen from behind** in a program's front view. It
  is upright and unmirrored, turned half a turn about up, which is where Babylon.js's own glTF
  loader and exporter put a model in a left-handed scene. A file with Z up is seen from the front
  in both systems.

## Frames

- Code that reduces a caller's list of vectors (`reachOf`, the largest coordinate) loops over it
  instead of spreading it into `Math.max`. A spread passes every element as an argument, and a long
  list overflows the call stack.
- `bestFit` decides every sign the points leave open the same way every time. When their turning is
  too small to read, or the first point lies across the widest spread, the axis is flipped so that its
  largest component is positive (`withLargestPositive`). Components within
  `EQUAL_COMPONENT_TOLERANCE` (1e-12) of each other count as equal and the first of them decides, so
  rounding cannot tip the choice; OCCT's frames break the tie the same way. When the points spread
  evenly every way in their plane, X points at the first point that does not sit on the center.

## Shared geometry helpers

`services/helpers/` holds the plain arithmetic the public services stand on, written once for every
package that needs it on a hot path, in one folder per domain:

| Folder | What it holds |
|---|---|
| `geometry/` | `vectors` (2D and 3D tuple operations), `scalars` (degree conversion, interpolation, rounding), `matrices` (composition, rigid inverses, the 3x3 eigen solve), `frame-axes` (frames squared, points and vectors moved between a frame and the world, a frame as a matrix), `arcs` (the circle through three points), `ellipse-arcs` (an SVG arc from its end points to its centre, and an elliptical arc's exact image under an affine map), `polygons` (signed area, winding, point in polygon, rounded corners), `polygon-nesting` (boxes, crossings, interior points, and nested outlines filled by the SVG fill rules), `loop-fill` (loops in one plane filled by a fill rule), `paths` (sweep frames along a polyline, rounded paths), `triangulation` and `vector-grid` (duplicates under a tolerance) |
| `mesh/` | measures (signed volume), normals (smooth and creased), orientation and winding repair, primitives (icosphere, frustum) and proximity trees; the normals and the winding work on indexed meshes, `Base.IndexedMesh` in public |
| `curves/` | `nurbs` (B-spline curve and surface evaluation), `nurbs-forms` (knot insertion, clamping, Bezier pieces), `bezier-pieces` (rational Bezier evaluation, cubic fitting and sampling within a tolerance), `conic-arcs` (circle and ellipse arcs: points, exact bounds, sampling, rational quadratic form, bulges) and `surface-triangulation` (adaptive meshing of a curved face) |
| `color/` | the sRGB conversions |
| `text/` | the single-line stroke font: its glyphs, the Latin letters it composes from a base letter and a mark, and the advances and ink reach a line of text is measured by, behind `text.vectorChar`, `text.vectorText` and the drawing texts |
| `files/` | the zip and gzip readers over one inflater, the stored zip writer, crc32, and the drawing writers: `drawing/` (the model both read, and a dimension's picture), `dxf/` and `svg/`, which also holds the one SVG path data reader (numbers, commands, arcs to centre form, sampling) |

**The readers take untrusted files, so they bound what a file can cost.** An archive's sizes are
claims, and deflate can legitimately expand about a thousand times, so `inflateRaw` refuses a claimed
size above its limit before setting anything aside and stops a stream that inflates past it; the limit
is 1 GiB (`MOST_INFLATED_BYTES`) unless the caller of `zipEntryData`, `gunzipped` or `inflateRaw`
passes another. `zipEntries` refuses entries whose data overlaps, the trick that lets one compressed
stream be inflated once per entry, and an entry that runs into the central directory. The writer
refuses names that would leave the folder they are extracted into and anything past the classic ZIP
limits rather than writing ZIP64.

A helper never sits loose beside the folders (`exposure.test.ts` fails one that does). They take and
return tuples and flat arrays, never DTOs: a service call builds an object per call and `mul` resolves
its defaults each time, which costs 10 to 300 times the arithmetic, and a file reader calls these per
vertex. The services are the public face of the same code - `Frame` moves points through
`frame-axes`, `Vector.cross` is `cross3`, `transforms.combine` is `composed`, `polyline.sweepFrames`
is `transportedAxes`, `mesh.triangulateLoops` is `filledLoopTriangles`, and `mesh.triangulatePolygon`, `mesh.icosphere`, `polyline.polygonArea` and
`point.arcThroughThreePoints` wrap the rest - so the helpers themselves stay internal and can change
shape freely.

**Every helper is exposed, internal for a reason, or on its way.** The people who build 3D apps on
these packages need the same primitives the kernels use, so a generic helper gets a public service
method that wraps it; tuple forms that exist for hot paths (`add3` beside `vector.add`), input guards
and file-format plumbing stay internal. `lib/api/services/helpers/exposure.json` records the choice per export and
`lib/api/services/helpers/exposure.test.ts` checks it: every export is listed, an exposed one names a public method in a
service file that calls it, an internal one says why, and the count still waiting (`PENDING_CEILING`)
must equal the number recorded, so exposing one lowers it and a new helper cannot join the queue. The
other half of the rule is in `LINT.md`: `bitbybit/no-local-maths` fails vector, matrix and angle
arithmetic written anywhere but here, so a kernel or renderer calls base instead of drifting from it.

The same holds for every domain module: the index exports no free function (`CLAUDE.md`, "What the
index exports"). The gear, fastener, machine-element and shaft tables under `gears/`, `fasteners/`,
`machine-elements/` and `shafts/` are public only as `bitbybit.engineering.mechanical`, the recipe tools only as
`bitbybit.recipes` and the sRGB conversions as `color.srgbToLinear` and `color.linearToSrgb`
(`lib/api/services/helpers/color/color-space.ts`; the two functions the index shipped in 1.5.0 wrap it and are
deprecated).

- **One length, and one way to make a direction of length 1.** A length is the square root of the
  sum of the squares - `length2`, `length3` and through them `point.distance`, `polyline.length` and
  `vector.length`, as `vector.norm` and `vector.dist` always were - which is what three.js and
  gl-matrix do; `Math.hypot` rounds differently in the last bit. `unitOf` and `unit2Of` divide by the
  largest component first, so a very long or very short vector neither overflows nor vanishes, and
  then by `Math.hypot` of the three scaled components, the plan form with 0 as its third: `Math.hypot`
  of two differs from it in the last bit for some plan directions (8 of the 1680 integer ones from -20
  to 20), and a plan sketch must normalise to the bits its placement in space does.
- **The frame helpers keep the `Frame` service's own order of operations**, `(x * u + y * v) + z * w`,
  so moving its private methods out changed none of its results.
- **`triangulateFace` never drops a vertex.** It cuts a planar face with holes in the plane of its
  Newell normal: a triangle as it is, a convex loop as a fan, anything else by ear clipping with each
  hole bridged to the outline from its leftmost point, as earcut does. A point on an edge is where a
  neighbouring face meets this one, and leaving it out would open the shell there, so when no proper
  ear is left it clips a flat one, and then any one, which keeps every edge of every loop in the
  result. A face with no area becomes a fan of flat triangles for the same reason. The triangles face
  the way the outline turns; holes may be given either way round.
- **`filledLoopTriangles` fills loops whose roles nobody names**, as the letters of a STEP file's
  annotations come: rims of triangles in no order and no agreed direction. It projects every loop on
  the plane of the largest one's Newell normal, lets `polygon-nesting` decide which loop lies inside
  which (`nestedOutlines2`, narrowed by `overlappingBoxPairs2`) and which are filled under the rule
  (`filledRegions2`, the readers' code), and cuts each filled outline with its holes by
  `triangulateFace`. Every triangle faces the largest loop's way, an outline wound the other way
  being reversed first. It returns corner indexes into the flat positions it was given, which is what
  a renderer uploads; `mesh.triangulateLoops` turns them into triangles of points.
- **An arc through three points runs from the first through the second to the third**, about the
  normal of the three, so the same formula serves points in a plane and in space. Points on one line,
  or two at one place, fix no circle and give nothing.
- **`paths` carries a profile along a polyline.** A section stands square to the tangent, which at a
  corner is the bisector and at an end the tangent the caller gives (a curve's own) or the last
  segment's. Its axes are carried from point to point by double reflection, so a path that turns does
  not twist the profile, and a corner's section is stretched across the bend by one over the cosine of
  half the turn, so a tube keeps its width through a mitre. `roundedPath3` rounds a polyline's corners
  in space by a radius, shrunk where two corners would overlap.
- **A rounded path or outline never repeats a point**, so it can be swept or rounded again, which
  refuses two points in one place. Each arc ends exactly at its tangent points. Where two arcs meet on
  the segment between them - two corners of `roundedPath3` shrunk to half of it each, or arcs of
  `roundedCorners2` that need the whole side within a billionth of its length - the point they share
  is given once, and `roundedCorners2` drops a last point that repeats its first. Arcs that need more
  than the side are refused rather than drawn overlapping, which would step back along it.
- **The proximity trees judge nesting piece by piece.** When no triangles of two meshes come within
  the distance, one is inside the other only if a piece of it is: `treesNested` welds a tree's corners,
  joins its triangles into pieces across shared edges and tests one corner of each piece against the
  other mesh, since a single corner says nothing of the pieces it does not belong to. The pieces are
  found once per tree, the first time it is asked, so a tree tested against many others pays once, and
  a mesh of one piece costs one point test as before. A ray counts as parallel to a triangle when it
  lies within a millionth of a radian of the triangle's plane: the test scales by the ray's length and
  the triangle's area rather than its edges, so a sliver still stops a ray that crosses it.
- **`nurbs` evaluates B-spline curves and surfaces** by de Boor's algorithm in homogeneous coordinates,
  so rational and plain splines share one path; a parameter outside the knot domain is held at its
  end.
- **`surface-triangulation` meshes a face of a curved surface from its boundary in parameter space.**
  The boundary's points and their positions are given; the face is cut by `triangulateFace`, the flat
  triangles a straight parameter line leaves are flipped away, and then, until nothing changes,
  interior edges are flipped to Delaunay and those whose surface bends more than a 32nd of a turn,
  and leaves the chord by more than an arc of that turn would, are split at their middle. Boundary
  edges are never split, so a neighbouring face that shares an edge shares its points and the shell
  stays closed. Delaunay is judged in a metric of how fast the normal turns along each parameter, plus
  a little of the surface's own length so flat directions still shape the triangles: along a cylinder
  the normal does not turn, so a pipe's face becomes straight strips with no points inside. Each pass
  flips until no edge flips, since splitting before the flips settle grows points without end. An edge
  is flipped when the two angles facing it pass half a turn, judged by the sign of the sine of their
  sum from dot and cross products: summing two `acos` values is ill-conditioned near flat angles, and
  on a cone whose parameters ran 0.92 along it the rounding made edges flip back and forth until the
  round limit, twenty times slower (the ifc package's bench holds that cone to a budget).

## What could leave base

Base takes code on the three conditions `CLAUDE.md` gives ("What belongs in base"), so it stays the
3D maths core rather than the place shared code goes when no other place fits. Three bodies of code
sit here because base is the one package everything may depend on, not because they are that core,
and each is marked as a package it could become. None of them leaves while it is small: a package
costs a manifest, a build, a release tier and an API report, and today each is reached by one or two
consumers. Each is reached only through its service, or by its own folder's deep import, so a move
is a new dependency for those few packages and a re-export, never a change to what a user calls.

- **Curves** (`services/helpers/curves/`): NURBS evaluation and the adaptive surface mesher. Only the
  `ifc` package calls them, to draw an IFC file's exact geometry without a kernel, which is why they
  are not in the OCCT package. They have no public method yet: NURBS deserves an API designed as a
  whole (curves and surfaces as values, evaluation, derivatives, meshing), not one method per helper,
  and the deprecated verb API shows what a half-kept one costs. When that API is wanted, or a second
  package needs the code, it becomes `@bitbybit-dev/curves` on base, and `ifc` depends on it.
- **The engineering tables** (`threads/`, `fasteners/`, `bearings/`, `keys/`, `retaining-rings/`,
  `splines/`, `knurls/`, `gears/`, `springs/` and `services/engineering/`): sizes from standards,
  public as `bitbybit.engineering`, which the OCCT
  parts build from. They grow by family and by discipline ("How engineering grows"), and once a
  second discipline arrives they are a package of their own, `@bitbybit-dev/engineering`, with the
  same dotted paths.
- **Recipes** (`lib/api/recipes/`, `lib/api/services/recipes.ts`): the format and its checker, shared by every kernel
  and `ifc`. It is `@beta`; once declared stable it could move with its checker into
  `@bitbybit-dev/recipes`, which every kernel would depend on as they depend on base now.

The file plumbing (`files/`) stays: it is small, it has no surface of its own, and the IO service
and the `ifc` reader both open archives through it.

## How engineering grows

`bitbybit.engineering` is grouped by discipline, and each discipline by the families of parts its
standards size: `engineering.mechanical` holds `threads`, `fasteners`, `gears`, `bearings`, `keys`,
`retainingRings`, `splines`, `knurls` and `springs`. A new family of the same discipline is one more
member there (seals or O-rings, pulleys and belts, chains and sprockets); a new discipline is one more
member beside `mechanical` (fluid fittings and pipes, sheet stock, structural sections). Everything
under `engineering` is numbers from standards and needs no CAD kernel; its solids live under
`occt.parts`, mirrored by discipline and family (`occt.parts.mechanical.fasteners` builds what
`engineering.mechanical.fasteners` sizes), so the two trees name the same thing the same way. Work that
judges a design rather than sizing its parts, such as stress, strength or finite elements, is not a
family of parts and gets a top-level name of its own (`simulation`), never a place under `engineering`.
A thread is a family of its own because both fasteners and machining use it.

Below a family sits the standard whose tables size it, so a path reads discipline, family, standard:
`engineering.mechanical.fasteners.iso` and `fasteners.ansi`, built by `occt.parts.mechanical.fasteners.iso`
and `fasteners.ansi`. A standard is named by the body that publishes its tables, as CAD part libraries
label them: `iso` for the metric threads, fasteners and bearings, `din` for the metric keys, retaining
rings, splines and knurls, and `ansi` for the inch ones (ASME B1.1 threads, the B18 fasteners, the
R-series bearings, B17.1 keys, B18.27 rings, B92.1 splines and B94.6 knurls). A family no standard sizes
has no such tier: gears, springs, dowel pins and machined flats take plain lengths in model units. A new
standard is one more member beside the others (JIS fasteners, the DIN forms of the ISO ones), with
its own DTOs and enums named for it (`IsoHexBoltSizesDto`, `ansiThreadSizeEnum`), because tools that
read the published declarations find a DTO by its class name and an enum by its bare name, so no name
may repeat across standards. An enum that means the same in every standard is shared (`clearanceFitEnum`,
`knurlPatternEnum`, `retainingRingKindEnum`), and so is a family's result type (`ThreadSizes`,
`InvoluteSplineSizes`): the OCCT builders take the numbers and never ask which standard gave them. Each
standard's roles and connectors are the same as the others' of its kind, so a design that fastens with
one fastens with any.

## Units

Each standard's tables are stored, and its rules worked, in its own unit: millimetres for ISO and DIN,
inches for ANSI. Every lookup and builder of a standard takes `unit` (`Base.unitOfLengthEnum`, by
default the standard's own) and converts at the edges, through `lib/api/services/helpers/geometry/lengths.ts`:

- **Free lengths are in `unit`**: a screw's length, the shaft or bore a key, ring, spline or knurl is
  sized for, and every length a lookup returns. One going in is converted into the table's unit and
  rounded to the table's resolution (`tableLength`: 0.1 micrometre in millimetres, a ten-thousandth
  of an inch) before it is compared, because a size rounded in another unit, as a field shows it to
  six places, would otherwise miss an exact match such as a table's `nominal === diameter` or land
  on the wrong side of a row's `upTo`. Lengths going out are rounded to 9 places (`snappedLength`).
- **Designations stay in the standard's own terms** and are never converted: the size ("M8", "1/4"),
  ISO's fine pitch ("M8x1"), DIN's module and knurl pitch, threads per inch and diametral pitch.
- **Counts, angles and shares are never scaled.**
- A value outside the table is refused with its bounds in the caller's unit.

`math.convertLength` and `math.millimetresPerUnit` are the one conversion every package calls; 25.4 is
exact. The unit codes are the ones design documents and assembly structures write (`mm`, `cm`, `m`,
`in`), and feet are left out because the OCCT document has no unit for them.

## Where the inch sizes come from

The ASME standards are sold, not published, so the ANSI tables were built from public reproductions
of them, every value read from at least two that agree unless named below as resting on one, and only
numbers were taken:

- **Unified threads**: Machinery's Handbook as AmesWeb reproduces it, Wikipedia's Unified Thread
  Standard table, and the Little Machine Shop, Tameson and University of Pennsylvania tap drill
  charts, which settle the few tap drills the charts disagree on by majority.
- **Socket head cap screws and set screws**: AFT Fasteners, American Fastener, fasten.it, torqbolt,
  Global Fastener and the Unbrako catalogue. A cap screw's thread length is tabulated below 1/4
  and is 2D + 1/2 inch from there; counterbore diameters come from AmesWeb and Engineers Edge, and
  the depth, the head's height plus 0.02, follows ISO's rule of sinking the head, as only one source
  states the flush depth. A short set screw's socket depth is Unbrako's alone, since ASME gives none,
  and never deeper than a long one's.
- **Hex cap screws, hex nuts and plain washers**: AFT Fasteners, American Fastener and fasten.it
  for B18.2.1 and B18.2.2, the SparkFun-hosted B18.6.3 datasheet for machine screw nuts (whose
  #3 and #5 thicknesses are inferred from their neighbours), Engineers Edge and Global Fastener for
  B18.22.1 type A washers.
- **Clearance holes** (B18.2.8): AmesWeb, Omni, isocnc and PI Fabricators.
- **R-series bearings**: the NSK and NHBB catalogues, which agree on every size, and Applied, Bailey
  and Zoro from R8 up. Catalogue decimals are truncated fractions, so the tables hold the fractions.
- **Keys** (B17.1): Engineers Edge, AmesWeb and the TTE/MPTA handout; the keyseat depth formulas
  reproduce 523 of the 524 published depths. B17.1 measures half the key's height at the keyseat's
  side, where DIN 6885 measures from the top of the shaft's round, so the ANSI depths add the
  chordal height of the shaft they are asked for.
- **Set screws**: the standard writes its lengths to two decimals, so a threshold such as 0.13 is
  held as the fraction it stands for, 1/8, and a screw exactly that long is past it. The short
  screws' socket depths are a maker's (Unbrako), as ASME gives none, and never exceed the long ones'.
- **Retaining rings**: B18.27's own tables are not reproduced anywhere public, so the tables hold the
  series interchangeable with it (Truarc 5100 and N5000, MS16624 and MS16625), from Rotor Clip,
  MS16624D and Engineers Edge. A tapered section ring is widest opposite its gap, so that is where
  the tables' largest section goes.
- **Splines** (B92.1) and **knurls** (B94.6): Machinery's Handbook as reproduced online and Engineers
  Edge, with the Dorian Tool catalogue for knurling tools; a spline's root fillet uses the published
  data points, as the standard's own minimum is not public. Splines are the 30 degree flat root side
  fit, which B92.1 gives from 2.5/5 to 32/64 only. A knurl takes the tooth depth the charts give per
  pitch and refuses a blank with fewer teeth round it than they ask for.

The metric tables hold the ISO and DIN values they always did; their tests pin them.

## Gear pairs

`lib/api/gears/gear-pairs.ts` reports a mesh as the gear standards do (ISO 21771, KHK's tables): the contact
ratio is counted only along the line of action where both flanks are involutes, and what would run
past that is flagged rather than counted.

- **External pairs.** The working pressure angle is the inverse involute of the shifts' sum, solved
  by Newton steps that fall back to halving within 0 and a quarter turn, so a guess past it cannot
  run away; shifts that would work above 45 degrees are refused before the solve. Contact runs from
  where one tip circle crosses the line of action to where the other does, each clipped at the point
  the line touches the other gear's base circle; a tip reaching past it is `interferes`. Shifted gears
  move apart by less than their shifts add up to, and the difference times the module is the
  `tipShortening` that keeps the clearance of the unshifted pair; `clearance` is measured with the
  tips as given, so it falls below 0 when the shortening is left out.
- **Internal pairs and a planet in its ring.** The ring's tips must cross the line of action beyond
  where it touches the gear's base circle (involute interference, `z1 / z2 >= 1 - tan(tip angle of
  the ring) / tan(working angle)`), and the gear's tips must leave the ring's tips behind on the way
  out of mesh (trochoid interference, KHK's condition on the angles at which the two tip circles
  cross). A simulation of the gear's tip corners against the ring's teeth agrees with that condition
  in sign for every pair tried, from 50 teeth in 52 to 15 in 34.
- A tip inside its own base circle has no involute to mesh with and is refused, for the gears of a
  pair as `checkedRingTips` refuses it for a ring.

## Drawings: DXF and SVG

The drawing model and its writers are base's: `io` is a service of the root object (`bitbybit.io`,
`lib/api/services/io/`), its `drawing` building the model (the `Inputs.IO.Drawing*Dto` segments, paths
and parts), its `dxf` writing and reading DXF and its `svg` writing and reading SVG, none of it needing a kernel.
The model's former DXF names (`DxfPathsPartDto` and its kin, and the builders on `io.dxf`) are
deprecated subclasses of the drawing DTOs and forwards to `io.drawing`, removed in the next major
version. A kernel carries the workflow of its own shapes and calls these writers
directly, DXF and SVG kept apart. OCCT's `occt.io` traces shapes for DXF (`shapeToDxfPaths`,
`dxfPathsWithLayer`, `dxfCreate`), draws layers of shapes as SVG (`svgLayer`, `svgCreate`), draws a
view of a shape as either (`saveShapeDxf`, `saveShapeSvg`) and builds a DXF reading into shapes
(`loadDxf`); one internal tracer (`DrawingService`) turns shapes into this model for all of them.

`io.dxf.dxfCreate` and `io.svg.svgCreate` write the same model: parts (a layer, a colour, a line
type) of paths of segments - lines, arcs, circles, bulged polylines, splines and ellipses, with 2D or
3D points. Both start in `lib/api/services/helpers/files/drawing/drawing-model.ts`, which checks every value where it
arrives and refuses what no reader could draw, naming the input (`dxfPathsParts[0].paths[1].segments[2].knots`):
a number that is not finite, a point of other than 2 or 3 numbers, a radius of 0, a zero normal,
knots of the wrong count, decreasing, of no length or repeating an inner knot more often than the
degree, a weight of 0 or less, an ellipse whose major axis leaves its plane, a colour that is not
hex, a layer name with a character DXF forbids. It then normalises once for both writers:

- **A spline is always clamped.** Given knots are clamped by knot insertion at the ends of their
  domain (the curve is unchanged); a closed spline without knots wraps its control points into a
  periodic uniform curve and is then clamped; otherwise it gets clamped uniform knots. Every writer
  can then take the curve's first and last control points as its ends.
- **A polyline whose last point repeats its first is closed**, the repeat dropped with its bulge.
  One whose points leave one Z is a 3D polyline and may carry no bulge (a bulge is defined in the
  polyline's plane).
- **Arcs keep the degrees they were given** for DXF and radians for geometry, both brought into
  their first turn (`angleWithinTurn`), as an ellipse's start parameter is: at 1e20 degrees a sweep
  added to the start would round away. Converting 30 degrees to radians and back writes
  29.999999999999996. An arc or circle with a normal lies in the plane DXF derives from it by the
  arbitrary axis algorithm, as CAD programs read it.
- **A colour is one hex form**, read by `hexChannels` and written by `hexOfChannels`, the pair
  behind `color.hexToRgb` and `color.rgbToHex`.

`io.drawing.svgToDxf` and `io.drawing.dxfToSvg` convert one file into the other through the model, and
sit on `io.drawing` so DXF and SVG stay separate domains. `svgToDxf` is `io.svg.svgRead` then
`io.dxf.dxfCreate`, its `unit` both reading the SVG at true size and stating the DXF's unit (which R12
refuses); `dxfToSvg` is `io.dxf.dxfRead` then `io.svg.svgCreate` with the unit the DXF states. Each
returns the file it wrote and the reading's warnings, so a spline given only by fit points, which
`dxfRead` leaves out, is named there, and the writers' limits refuse what is too large to write. Each
call builds its own `Svg` and `Dxf`, because `Dxf` holds a `Drawing` for its deprecated builders. A
drawing taken through either converter and read back is the same drawing, layers, colours and line
types included, within the six decimals the SVG writer keeps.

Bounds are exact for lines, arcs, circles, ellipses and bulges (`conicArcExtremes`: the ends and
every angle where the arc turns back along an axis, at most a whole turn's worth) and, for splines,
contain the curve and lie within the tolerance of it (`bezierPiecesBounds`: a piece is halved only
while its control points reach past what is already bounded), so a view box never crops the
drawing. A spline is split into Bezier pieces in one pass over its knots (Piegl and Tiller's
DecomposeCurve), so a spline of 20,000 control points costs what its pieces do. Sampling never goes
finer than a millionth of the drawing's larger side, nor an arc finer than a billionth of its
radius, whatever the tolerance; a circle, arc or ellipse standing edge-on to the plan is drawn as
the lines through the turning points of its shadow.

**Hatches a renderer draws itself.** `io.drawing.hatchLines` gives the pattern's lines whole, from
side to side of the box around the boundaries; `io.drawing.clippedHatchLines` gives the pieces of
them inside the region, and `io.drawing.hatchOutlines` the region's outlines as closed loops of
points, so a 3D renderer can draw a hatch without a file. Both flatten the boundaries the way the
DXF writer joins them (`drawingLoopsOf`: segments whose ends meet become one loop, a loop whose ends
do not meet is closed straight), bulges sampled as arcs within the DTO's `tolerance`. Inside is the
even-odd rule over every loop, the rule the SVG writer fills a hatch by: an edge crosses a line when
one of its ends lies above the line and the other on or below it, so a line through a vertex is
crossed once or not at all and the crossings along each line pair up. The lines
stand at the offsets `hatchFamiliesOf` gives every writer, measured from the drawing's origin, so a
pattern runs on unbroken across neighbouring regions of one angle and spacing. The tests hold the
result to an area oracle: the pieces' summed length times the spacing is the region's area, holes
taken out, within the spacing times the boundary's length (the chord length along the lines varies
by at most the boundary's length, so a sample every spacing errs by at most that) plus the
boundary's length times the tolerance for the flattening.

**A dimension's picture** (`@beta`, since 2026-11-22). `io.drawing.dimensionPicture` draws a linear,
diameter, radius or angular dimension in the drawing's plane as plain numbers - polylines, arrowheads
as closed counterclockwise triangles whose first corner is the tip, the value in the stroke font as
strokes and as a drawing text - and `io.drawing.dimensionExtent` gives the box of the same layout
without drawing the letters (`lib/api/services/helpers/files/drawing/drawing-dimension.ts`). The kernels draw nothing: OCCT's
PMI writer lifts this picture into a dimension's plane, and any renderer or file writer can take it
as it is. It is not `occt.dimensions`, which builds kernel wires with open arrows and no diameter,
radius or tolerance, and whose output is a shape, not numbers. The layout follows the drawing
standards' habits, sized from the text height `h`: extension lines start `h/4` off the measured
points and run `h/2` past the dimension line; arrowheads are `arrowLength` long (`h` unless given)
and a third as wide; the text stands `h/4` clear of the line, its descenders included, turned to
read from left to right or from bottom to top (a rotation in (-90, 90] degrees), and an angle's text
stands outside its arc. A span shorter than two and a half arrowheads (one and a quarter for a
radius's single arrow) takes its arrows outside, pointing in, the line running one and a half
arrowheads past each tip, and a text wider than the room between the arrows goes past the line's
end, the line extended under it. Values are rounded to `decimalPlaces` and lose trailing zeros;
tolerances keep six places, written `+0.1/-0.05`, or `±0.1` when equal; a diameter is written after the
diameter sign (U+2300, which the font draws), a radius after R, an angle before the degree sign. The
property test (`drawing-dimension-properties.test.ts`, fast-check, seeded) holds every kind to its
contract over random points, sizes and tolerances: every point inside the extent `dimensionExtent`
gives, the text point inside what is drawn, the text upright and along its line or across its arc's
middle, every arrow tip on its extension line or on the measured circle, the two arrowheads apart,
and no line with two neighbouring points in one place, which the OCCT kernel refuses in a
presentation.

### DXF

`files/dxf/` builds the file as a list of lines joined once; spreading a list into `push` overflowed
the stack past about 25,000 vertices, and a test writes half a million. The SVG writer and the hatch
boundary loops append the same way, element by element, for the same reason. `AC1015` (AutoCAD 2000) is
the default and writes what AutoCAD requires of that version: every table with a handle, an owner
of 0 and its subclass markers, the records LTYPE ByBlock, ByLayer and CONTINUOUS, layer 0, the STYLE
and DIMSTYLE Standard (a DIMSTYLE record's handle is group 105), the APPID ACAD, the BLOCK_RECORD
table with `*Model_Space` and `*Paper_Space`, their BLOCK and ENDBLK, every entity owned by the model
space record, the OBJECTS section's root dictionary with its ACAD_GROUP dictionary, and `$HANDSEED`
above every handle. Entities: LINE, ARC and CIRCLE (in their object coordinate system, with the
extrusion when the normal is not +Z), LWPOLYLINE (planar, elevation 38), POLYLINE with VERTEX and
SEQEND for 3D, SPLINE (degree, the full knot vector, control points, a weight 41 after each when
rational, planar and rational flags; the closed flag is left off, as a clamped curve that ends where
it starts is not periodic) and ELLIPSE (centre, major axis end, normal, ratio, parameters).
`AC1009` (R12) defines no LWPOLYLINE, SPLINE or ELLIPSE, so polylines become POLYLINE, VERTEX and
SEQEND and splines and ellipses polylines within `curveTolerance`; R12 has no handles and no place
for a unit, so a unit given with it is refused.

Numbers are written shortest and exact (`String`), with a decimal point, and never in exponent
form: an exponent is written out as the digits it stands for, so 1e-13 keeps its one digit and
1e21 its 22. Text outside ASCII is written as `\U+XXXX`, one escape of four hex digits per UTF-16
code unit, so a character beyond the basic plane takes two, as AutoCAD and ezdxf read them. A
colour is the nearest of the 255 AutoCAD index colours (the palette is generated: nine fixed, 24
pure hues of `hslChannels` in five shades each full and pastel, six greys), black and white as 7;
`truecolor` adds group 420 in AC1015 only. A layer takes the colour and line type of the first part
on it, and names that differ only in case are one layer, as DXF names are, spelled as first used;
each entity also carries its part's colour and, when not continuous, its line type, and CONTINUOUS
when its layer's line type is not. Dashes are
scaled to the drawing: a two-hundredth of its larger side in plan is the pattern's unit, one
`patternUnitOf` for DXF and SVG, so a deep drawing dashes alike in both.

A hatch (AC1015 only) names its pattern with an angle and a scale and carries the pattern's lines as
well, so a program that draws the lines and one that rebuilds the pattern from its name draw the same
hatch. The scale counts from the pattern file a CAD program takes for the drawing's measurement:
`acad.pat`'s inch patterns (ANSI31 0.125 apart) when the unit is inches, which also writes
`$MEASUREMENT` 0, and `acadiso.pat`'s millimetre ones (ANSI31 3.175) for any other unit or none
(`DXF_HATCH_NATIVE_SPACING`, one rule in `dxfMeasurementOf` for the header and the scale).

### What other programs make of the files

Every kind of segment the model takes, written as DXF (both versions) and as SVG, is drawn by
programs that are not ours where the model has it: their points lie on the model's curve and
their total length is the model's.

- **DXF** is read by FreeCAD and by ezdxf, both exactly (a spline with weights measures 3 pi / 2
  as the quarter circle it is), and by LibreCAD through the SVG it prints. ezdxf's audit finds no
  error and nothing to fix in the files, and reads each file's version, unit, layers, line types
  and true colours as they were written.
- **SVG** is read by Chrome, by FreeCAD and by Blender; Chrome's page size states the drawing's
  true size in millimetres and in inches.
- **No program reads everything.** FreeCAD draws an arc of an ellipse whole and lays tilted curves
  flat, LibreCAD ignores a spline's knots and weights and is flat, Blender mis-sizes inches. Every
  DXF file the writer makes is still read exactly by FreeCAD or by ezdxf.
- **Files made elsewhere come in the same way.** For drawings ezdxf authors with every entity
  kind, flat and in space, `dxfRead` returns what ezdxf itself measures in them.

### SVG

`files/svg/` turns each segment into SVG moves, exact wherever SVG can be: lines, bulges and arcs
as `A`, ellipses as `A` with a rotation, and a circle, arc or ellipse whose plane is tilted as the
ellipse its shadow on XY is (its conjugate radii turned into principal ones by `principalArcOf`,
the major always the longer), each arc split into
quarter turns so no `A` is ambiguous; non-rational spline pieces of degree 1 to 3 as `L`, `Q` or `C`
(the curve split into Bezier pieces by knot insertion), rational and higher degree pieces as cubic
Hermite fits split in half until 7 samples each lie within the tolerance. Z is dropped. Segments
that meet are one stroke, a segment turned round when its end meets the stroke, and a stroke that
returns to its start is closed with `Z`. A document negates Y, frames the drawing with a fortieth of
its larger side, widens a side with no extent and no border to the line width (never below the
smallest number it writes), so no view box is 0 wide, states its size in mm, cm or in (metres as
centimetres) when given a unit, and writes each layer as a group Inkscape reads as a layer, names
that differ only in case one layer as in DXF.

### Reading DXF

`io.dxf.dxfRead` reads ASCII DXF, R12 to the current version, into the same model:
`DxfDrawingDto` holds parts by layer, colour and line type, the file's unit and version, and warnings.
`occt.io.loadDxf` builds the same reading into shapes. Both take the file as text or as bytes:
`dxf-file-text.ts` reads bytes that are UTF-8 as UTF-8, bytes of a file from AutoCAD 2007 on (`AC1021`)
as UTF-8 too, and older bytes in the code page the header's `$DWGCODEPAGE` names, or as Windows-1252.
The reader is six files in `files/dxf/`:

- `dxf-tokens.ts` splits the text into group code and value pairs and the pairs into records, the
  VERTEX records of an old POLYLINE attached to it. It accepts a byte order mark and CRLF or CR line
  ends, refuses a binary DXF, and refuses a code or a number it cannot read, naming the line. A
  `\U+XXXX` escape is exactly four hex digits, one UTF-16 code unit, so a letter after it stays a
  letter and no escape can name a character that does not exist.
- `dxf-reader.ts` reads the HEADER (`$ACADVER`, `$INSUNITS` for mm, cm, m and in, a code that is
  not a number refused; another unit is read as drawn, with a warning; and `$MEASUREMENT` for
  hatches), the LAYER table (colour, line type, frozen or switched off) and the
  BLOCKS, then walks ENTITIES: LINE, ARC, CIRCLE, ELLIPSE, LWPOLYLINE, POLYLINE (2D with bulges, or
  3D; meshes are left out), SPLINE (control points with knots and weights, or fit points alone) and
  INSERT.
  - Coordinates are read in the object coordinate system of each entity's extrusion, by the
    arbitrary axis algorithm, so a mirrored drawing written with extrusion -Z reads where it lies.
    Angles and ellipse parameters are brought into their first turn as they are read.
  - An INSERT maps its block by base point, scale, rotation and extrusion, and repeats it for the
    rows and columns of a MINSERT. Nesting stops at 16 levels with a warning, which also ends a block
    that inserts itself. What a record decodes (its names, colours and style, its own segments, an
    insert's block and frames) is worked out once and remembered, so a copy costs a lookup and the
    mapping of its points. Before anything is expanded, the work the inserts ask for is counted
    against one limit per file (see "Size limits" below), and a top-level insert whose whole
    expansion does not fit what is left is left out, with one warning.
  - Entities on layer 0 inside a block take the insert's layer, and BYBLOCK colours and line types
    take the insert's. ACI 7 reads as black, since the writer writes black as 7.
  - A polyline under a mapping that keeps shapes (a similarity) keeps its bulges, its normal turned
    over by a mirror. Under any other mapping its arcs become ellipses.
  - Paper space, frozen and switched-off layers (unless `includeHiddenLayers`) and every other entity
    kind are left out, each kind counted in one warning; at most five skipped kinds, missing blocks
    or external references are named, the rest counted together.
- `dxf-reader-segments.ts` reads the segments of each drawn entity kind and what each costs against
  the insert limit, worked out once per record.
- `dxf-reader-annotations.ts` reads TEXT and HATCH for `io.dxf.dxfRead` (`occt.io.loadDxf` leaves them
  out): a text placed by its horizontal and vertical alignment on the baseline the stroke font draws
  from, a hatch's polyline and edge boundaries with the pattern its definition lines or its name give.
  A pattern known only by name and scale counts from `acad.pat`'s inch spacing when the file measures
  in imperial units - its `$MEASUREMENT`, or when it states none its `$INSUNITS` (inches, feet, miles,
  microinches, mils and yards, the units ezdxf marks imperial) - and from `acadiso.pat`'s otherwise.
  Both are read once per record in a block, and each copy costs the insert limit its characters or
  its boundary's segments. One the reader cannot draw, a hatch spline edge above degree 25 included,
  is named in a warning.
- `dxf-reader-geometry.ts` holds the mappings, frame axes composed and applied by
  `geometry/frame-axes.ts` (an insert's axes scaled and turned, so only the world-ward functions
  apply), bulges as exact arcs, and `principalConicOf`, which turns a conic given by any two
  conjugate radii onto its principal axes with `principalArcOf`, the one the SVG writer uses: the
  major axis is always the longer, so a circle in a block stretched more in Y than in X, or an
  ELLIPSE written with a ratio above 1, reads as an ellipse the writers take.
- `dxf-reader-dtos.ts` turns the reading into DTOs. A conic with equal axes becomes a circle or an
  arc, its angles measured in the object coordinate system of its normal, and any other conic an
  ellipse on its principal axes. A polyline facing Z keeps its bulges. A spline given by fit points
  alone needs a kernel to interpolate it, so it is left out here with a warning that names
  `occt.io.loadDxf`, which reads it.

### Reading SVG

`files/svg/` also reads SVG, in TypeScript and with no kernel: the XML, the path mini-language,
transforms, viewports and units, `<use>` references and the style cascade with CSS. `normalizeSvg`
reduces a document to a scene of elements, each with its style and its subpaths of the four exact
segment kinds SVG path data can express - line, quadratic Bezier, cubic Bezier, elliptical arc -
every basic shape (rect, circle, ellipse, line, polyline, polygon, rounded corners, smooth-curve
shorthands) becoming those. Coordinates stay in the root's user space, y down. `occt.svg.loadSVG`
builds the scene into shapes (`occt/ARCHITECTURE.md`, "SVG import").

- **The XML reader** (`svg-xml.ts`) is a small scanner of its own, because a web worker has no
  `DOMParser`. It reads quoted values character by character, so a `>` inside one does not end the
  tag, takes unquoted values, keeps the text of `<style>` (CDATA included, as written) and steps over
  `<script>` without reading markup in it, expands the entities a DOCTYPE declares, and resolves each
  element's namespace from the `xmlns` declarations in scope, kept as one stack per prefix, pushed
  and popped as elements open and close, so a declaration costs the same however many others are in
  scope. A prefixed attribute's namespace is resolved from the same stacks (`attrNamespaces`), so
  `inkscape:label` is found by the Inkscape namespace whatever prefix a file binds to it. It refuses a document nested more than
  256 elements deep with an `InputError` rather than letting a recursive walk overflow the stack.
  Files can be large or malformed, so every scan is linear in the file's length: the end of a
  `<style>` or `<script>` is found by a plain search for `</` and a case-insensitive compare of the
  name, never by a pattern built from the file, and CDATA sections and CSS comments are cut out the
  same way. Entity expansion has one limit per file (see "Size
  limits"), shared by declarations that use earlier entities and every reference, and a document
  past it is refused with an `InputError`, so nested or repeated entities cannot multiply the file. Entities, attributes, namespaces and every table a
  name from the file is looked up in have no prototype, so `&constructor;` stays as written, and a
  character reference past U+10FFFF reads as U+FFFD.
- **Numbers are read by one grammar** (`svg-path-data.ts`) for path data,
  transform lists, `points`, `viewBox` and lengths, so `-5-5`, `.7.7` and exponents read as they do
  in a browser and a change to the grammar reaches every reader. A transform list that does not
  scan cleanly, names an unknown transform or gives one the wrong number of arguments is ignored
  whole with one warning, as a browser ignores an invalid presentation attribute.
- **Units and viewports** (`svg-document.ts`): lengths take px, mm, cm, in, pt, pc, em and ex at 96
  pixels to the inch and a 16 pixel font, and `%` against the nearest viewport (its view box when it
  has one; the normalised diagonal for radii and stroke widths). A nested `<svg>` and a `<symbol>`
  placed by `<use>` map their view box into their x, y, width and height with `preserveAspectRatio`.
  The root's view box is not applied by default: coordinates stay in the root's user units, as they
  always have, and the page size and the millimetres a user unit stands for are only reported. With
  `unit` set the root's view box mapping is applied too and the result scaled from CSS pixels into
  that unit, so the drawing comes in at true size with the page's top left corner at the origin. A
  `transform` on the root applies outside its view box, in the page's pixels, as SVG 2 has it; in
  user units it is carried back into them through the view box mapping, so the drawing lands where
  a browser shows it.
- **The style cascade** reads presentation attributes, every `<style>` element in the document and
  the `style` attribute, in that order of strength, with `!important` above all of them and the
  style attribute's above the stylesheet's (`svg-css.ts`, `svg-style.ts`). Selectors are type,
  universal, `#id`, `.class` and attribute tests, grouped with commas and combined by descendant and
  child combinators, ranked by specificity and then by order; rules inside `@media` apply, other
  at-rules are skipped, and a selector it cannot match (pseudo-classes, sibling combinators) is named
  in one warning instead of being dropped silently, as is a block at-rule nested more than 32 deep.
  A selector is decided per element by remembering, for each compound and ancestor depth, whether
  the compounds before it fit above that ancestor, so a long descendant selector over a deep tree
  costs compounds times depth rather than every way of placing the compounds; that verdict depends
  only on the ancestors, so siblings share it. A rule keeps only the properties the importer reads,
  one declaration each (the last important one, else the last), and an element keeps only the
  winning declaration per property, so a sheet that repeats declarations or names unknown properties
  costs no memory per element. Matching the whole sheet has one limit per file, counted in what a
  test really costs (a compound tried costs one plus its classes and attribute tests, an attribute
  test the characters it compares, a selector's table its cells, a matched rule its declarations);
  when it runs out the rest of the document is imported without the stylesheet, with a warning.
  At-rule statements are found by a scan that never returns over what it has passed. Rules are matched once over the document tree
  before the walk, by the element's place in the source, so content a `<use>` instantiates keeps the
  rules that match it where it is defined. `inherit` takes the parent's value, `currentColor` the
  element's own `color` where the paint is used, `opacity` multiplies down the tree, and `display:
  none` hides the whole subtree whatever a descendant says, while `visibility` can be overridden.
  Stroke widths are scaled by the square root of the transform's area scale. A fill of `none`,
  `transparent`, zero alpha, or a zero `fill-opacity` or `opacity`, makes no faces.
- **`<use>`** places a copy of the element it names (`href` or `xlink:href`) under its own transform
  and x, y offset, inheriting the `<use>` element's style. A reference to an element that contains
  the `<use>`, the root included, which is how a cycle shows, is refused with a warning, and so are
  references nested more than 16 deep. The walk stops after 500,000 elements, counting every element
  it steps over, the ones it skips without drawing included, and after a number of path segments
  that grows with the file (see "Size limits"), counted after `<use>` is expanded, since one long
  path placed many times multiplies geometry without multiplying elements. So that a visit costs the
  same however long the attributes it reads, everything read from an element is read once however
  often it is placed: its `d`, its transform, its specified style, a path's, polygon's or polyline's
  outline, a viewport's view box and `preserveAspectRatio`, the element a `<use>` names and the child
  a `<switch>` draws; only a rect's, circle's, ellipse's or line's outline is read again per
  viewport size, its lengths read once. Style values and lengths are read once per document, and
  keywords are compared only against values of their own length. External references are warned
  about and skipped.
- **What is skipped**: elements of other namespaces (Inkscape's, Sodipodi's, Illustrator's) silently;
  definitions, paint servers, metadata and the like silently; text, images, `foreignObject` and any
  other element it does not draw with one warning each, without descending into them. `clip-path`,
  `mask` and a `transform` given in CSS are not applied and are warned about. A `<switch>` draws its
  first child that names no required extension.
- **Path data is tokenised per command** (`parseSvgPathData`, the one SVG path reader, which the SVG
  writer's tests read their output with too), not by one split into numbers: an arc's
  large-arc and sweep flags are single digits that may be written without separators (`016` in an
  arc is `0, 1, 6`), and a general number reader misreads nearly every arc drawing tools write. An
  incomplete argument group ends the command. Arcs are converted once from endpoint to centre
  parametrisation, after the SVG 1.1 implementation notes (`packages/dev/base/lib/api/services/helpers/geometry/ellipse-arcs.ts`); an arc
  that ends where it starts is left out, and a full ellipse is two 180-degree arcs, because one
  360-degree arc is degenerate.
- **Transforms are exact.** A matrix is `[a, b, c, d, e, f]` as in SVG's `matrix(a b c d e f)`:
  `x' = a*x + c*y + e`, `y' = b*x + d*y + f`, the 2D affine form of `packages/dev/base/lib/api/services/helpers/geometry/affine2.ts`. Lines and Beziers map their control points. An arc is
  re-derived from the combined matrix by a closed-form 2x2 singular value decomposition
  (`affineEllipseArc2`): with the arc
  as `M = L * Rot(phi) * diag(rx, ry)`, `L` the linear part `[[a, c], [b, d]]`, and
  `e = (m00 + m11) / 2`, `f = (m00 - m11) / 2`, `g = (m10 + m01) / 2`, `h = (m10 - m01) / 2`,
  `q = hypot(e, h)`, `r = hypot(f, g)`, `M = Rot(phi') * diag(q + r, q - r) * Rot(theta)` with
  `phi' = (atan2(h, e) + atan2(g, f)) / 2` and `theta = (atan2(h, e) - atan2(g, f)) / 2`. The image
  ellipse is `M` applied to the unit circle, so its radii are `q + r` and `|q - r|` and its tilt is
  `phi'`; `theta` only turns the parametrisation, and the start and end angles are read from the
  mapped end points instead. A negative determinant, a reflection, reverses the sweep. Flattening arcs
  into segments instead would lose the exact geometry CAD input needs.

`io.svg.svgRead` (`svg-reading.ts`) reads the scene into the drawing model, the mirror of `dxfRead`,
in time linear in the scene:

- **Geometry.** Y is turned up by mirroring each subpath through the transform code itself, so an arc
  keeps the points it draws. Each subpath is one path, and a closed subpath whose end is not its start
  gets its closing line. Lines stay lines; quadratic and cubic Beziers become splines of degree 2 and
  3 with clamped Bezier knots, exactly. Consecutive arcs on one conic turning the same way are joined
  into one, since the writer splits arcs into quarter turns: one conic means centres, radii and axes
  within a millionth of the major radius or a hundred-thousandth of a user unit, what numbers written
  to six decimals hold. A run that returns to its start past half a turn is a whole circle or ellipse.
  Each run is turned counterclockwise about +Z over the same points and handed to the DXF reader's own
  decision (`conicSegmentDto`): radii equal within 1e-12 make a circle or an arc, anything else an
  ellipse on its principal axes. An arc a transform flattens to no width is left out with a warning,
  one under a billionth of a turn is the line it is.
- **Parts** are keyed by layer, colour and line type in first-seen order. The layer is the
  `inkscape:label`, else the id, of the nearest group Inkscape marks as a layer
  (`inkscape:groupmode="layer"`; the normalizer records it as the element's `layer`), so a `<use>`
  copy is on the layer of the `<use>`; otherwise the model's default layer, `0`. A character a layer
  name may not hold becomes `_` and a name past 255 characters is cut, each counted in one warning.
- **Colour** is the resolved stroke unless it paints nothing (none, transparent, zero alpha), else the
  fill likewise, else black. `packages/dev/base/lib/api/services/helpers/color/css-colors.ts` reads hex of 3, 4, 6 or 8 digits (alpha dropped),
  `rgb()` and `rgba()` with numbers or percentages, and the 148 CSS named colours; a gradient, a
  pattern or any other colour form is black, counted in one warning.
- **Line type.** The cascade resolves `stroke-dasharray`, inherited and scaled as stroke widths are,
  an odd list repeated once; `none`, a negative or unreadable length and all zeros draw a solid line,
  as in a browser. No dashes is continuous; otherwise the line type whose `LINE_TYPE_PATTERNS` ratios
  it matches within a thousandth of its period, at any scale. Dashed (4, 2) and hidden (2, 1) share
  their ratios, so between them the one whose pattern unit is nearer the drawing's wins, `patternUnitOf`
  of the drawing's bounds measured as the writers measure them and only when needed, which reads back
  what `svgCreate` wrote at any size. A pattern no line type matches is dashed, counted in one warning.
- Hidden elements are left out unless `includeInvisible`, counted in one warning, and the scene's
  warnings come first. With `unit` the drawing comes in at true size with the page's top left corner
  at the origin, so after the turn of Y the page lies below the X axis and a drawing `svgCreate` wrote
  comes back moved by the view box's corner, which the result's `viewBox` gives.

### Size limits

Reading and writing a drawing costs work in proportion to its size, and every place where one file
could ask for much more than its size suggests has a limit. Each is counted in the unit of its real
cost, one per call (a `WorkBudget`, `packages/dev/base/lib/api/services/helpers/files/work-budget.ts`: a floor, a share per unit of
input, a ceiling); none is fresh per element, layer or block, so repeating a block multiplies
nothing. A reader keeps what it has read and says in a warning what it left out; a writer refuses
with an `InputError` naming its input.

| Limit | Counted in | Size | Past it |
|---|---|---|---|
| Block inserts (`dxf-reader.constants.ts`) | 2 per entity a copy places, plus its points (a line or conic 2, a polyline 1 per point and 1 per bulged span, a spline 1 per control or fit point; a text 1 per character, a hatch its boundary's segments counted so), plus 1 per array copy | min(1,000,000, max(500,000, 16 x the file's characters)) | the top-level insert that does not fit is left out, with one warning |
| Insert nesting | levels | 16 | deeper inserts left out, with one note |
| Layer, block and line-type names | UTF-16 code units | 255, AutoCAD's limit | read: cut to 255 with one warning; written: refused |
| Spline degree | degree | 25, OCCT's highest | read: left out as a spline that cannot be drawn; written: refused |
| Spline fit points | points | 10,000 | left out as a spline that cannot be drawn |
| Drawing numbers | magnitude | finite and below 1e100 (a weighted control point too, and a weight at least 1e-100) | written: refused |
| Writing (`writerBudgetOf`, `drawing-budget.ts`) | one step per character written, plus the control points blended in decomposing, bounding, sampling and fitting splines | min(2^25, max(2^20, 2^14 x the drawing's numbers)) | refused: "too large to write" |
| Sampling tolerance | length | never below a millionth of the drawing's larger side | the coarser tolerance is used |
| SVG entity expansion (`svg/svg-xml.ts`) | characters substituted | min(134,217,728, max(65,536, 8 x the file's characters)) | refused, `InputError` |
| SVG selector matching (`packages/dev/base/lib/api/services/helpers/files/svg/svg-css.ts`) | steps, as in "The style cascade" | min(64,000,000, max(2,000,000, 64 x the file's characters)) | the rest imported without the stylesheet, with a warning |
| SVG path segments (`svg/svg-normalizer.ts`) | segments after `<use>`, a closing line included | min(120,000, max(25,000, 2 x the file's characters)) | that element and the rest left out, with a warning |
| SVG dash arrays (`packages/dev/base/lib/api/services/helpers/files/svg/svg-style.ts`) | lengths in one `stroke-dasharray` | 64 | read as a solid line, with one warning |
| SVG walk | elements visited, nesting, `<use>` depth | 500,000; XML 256 deep (refused); 512; 16 | the rest left out, with a warning |
| Warnings | names per kind | 5 | the rest counted in one warning |

## Recipes

`Base.Recipe` (in `inputs/base-inputs.ts`) is a format: solids described as a list of
steps a kernel can execute, so the package that describes geometry and the kernels that build it
never depend on each other. It lives here because base is the only package all of them share. The
format and `bitbybit.recipes` (`lib/api/services/recipes.ts`: `check`, `read`, `surfaceMeshes`, `sourceOf`,
which wrap `checkRecipe`, `toRecipe`, `recipeSurfaceMeshes` and `recipeSourceOf` in `recipes/`) are
`@beta` until it is declared stable; the kernels and the `ifc` package call the service too. How
the Manifold kernel builds one is in `packages/dev/manifold/ARCHITECTURE.md`.

- **Nodes refer backwards only.** A node names earlier nodes by their position, so a recipe is acyclic
  by construction and an executor builds it in one pass, each node once however many nodes and roots
  refer to it.
- **Numbers sit in two typed buffers**, `f64` for coordinates and `i32` for triangle indices, and nodes
  point into them by range, so a large recipe is two flat arrays and a small JSON skeleton. Across a
  worker boundary both are copied by structured clone like any other input; nothing transfers them,
  since a transferred buffer is detached on the sending side and the caller, or a cache, may still
  hold the recipe.
- **What the numbers mean is fixed; how finely they are built is not.** A circle's faceting is the
  executor's choice, so two kernels build close solids, not identical ones. `millimetresPerUnit`
  describes the data for whoever reads the results; an executor builds in the recipe's own units and
  need not apply it. A compound is the space its parts fill together, so
  an overlap counts once, though an exact kernel may keep its parts apart; a `union` joins them into
  one solid in every kernel, and an `intersection` keeps the space all its solids share.
- **A cut reaches through within the tolerance.** `tolerance` is where two positions count as the
  same, and every executor applies it to cuts: an opening, or a difference's solid tool, that ends
  within it of a face passes through that face. Exporters write openings exactly as deep as their
  walls, and composing an opening's placement with its wall's leaves it short of a face by rounding,
  around 1e-11 of a unit; cut exactly, that leaves a skin as thin as the rounding over every window,
  which a mesh kernel then tears into slivers. The same happens beside an opening whose sill, head or
  side lies on a face of its host - a door standing on the wall's bottom, a window at the wall's end.
  The exact kernel cuts fuzzily at the tolerance and takes an opening within it of both faces as cut
  through. The Manifold kernel, whose booleans are exact, moves the end of a tool out by the
  tolerance where it stops short of, or overshoots, a side of its host's bounding box, and where it
  lies wholly on a face inside the box with nothing of the host just beyond it, as a sink hole as deep
  as a worktop that a backsplash rises above; its `ARCHITECTURE.md` says how, and which ends it leaves
  as drawn. What lies inside the host is cut as drawn: a niche keeps its depth and an opening its
  outline, and only ends that meet a face of the host move, by the tolerance, which is what the
  tolerance says - positions closer than it are the same.
- **Turns and lofts are generic.** A `revolve` turns a profile about an axis in its plane by the
  right-hand rule, and the profile must lie on one side of the axis. A `loft` places profiles by
  frames held in `f64`, sixteen numbers each, and joins each section to the next by straight sides:
  one profile placed by many frames is a sweep along a path, two profiles a taper. Whatever decides
  the frames (a pipe's bends, a curve's reference surface, an alignment) is the producer's, so an
  executor only places what it is given. A mesh executor joins sections corner to corner, so
  profiles that differ must have as many corners in each loop.
- **A recipe read from JSON has lists where its buffers are.** JSON carries no typed arrays, so a
  recipe sent to CAD Cloud or read from a file holds `f64` and `i32` as lists of numbers. The executors
  read every recipe through `toRecipe`, which turns such lists into the typed arrays and then checks
  the result as `assertRecipe` does; an index list holding a number a 32-bit integer cannot hold stays
  a list and is refused, rather than wrapped. The value it is given is left as it was.
- **Groups are structure, not geometry.** `groups` names the parts of a structure (a storey, an
  assembly), each in an earlier one or at the top, and a root may say which it belongs to. An executor
  that builds an assembly document nests its results by them; one that only builds shapes, such as
  Manifold's, ignores them, and a recipe without groups is as before. A group's parent comes earlier
  in the list for the same reason a node's inputs do: the tree is acyclic by construction.
- **A polygon is its boundary's region less its holes' regions.** The boundary and the holes may run
  either way round, a boundary that crosses itself keeps every loop, and holes may overlap each other
  or reach past the boundary: only the part of the holes inside the boundary is removed.
- **`checkRecipe` is the one validator**, run before any executor touches a kernel, and linear in the
  size of what it is given: indices in range and backwards, ranges inside their buffers, and the whole
  `f64` buffer checked once for finite coordinates within `MAX_RECIPE_COORDINATE` (a billion units:
  past about twenty billion, Manifold's cross sections fail inside the WASM). Depths, radii, circle
  centres and directions keep to the same bound. Placements - matrix entries and half-space origins -
  may reach `MAX_RECIPE_PLACEMENT` (ten trillion), so a model placed in survey coordinates, millions of
  metres out and given in millimetres, passes while its profiles stay small. A matrix must be affine
  (0, 0, 0, 1 as its bottom row) and must not flatten what it transforms; it may mirror. Triangle
  indices stay inside their positions, and there are caps on every list, on the numbers all ranges
  refer to together (`MAX_REFERENCED_NUMBERS`, since many nodes may share one range) and on nesting
  (`MAX_RECIPE_DEPTH`, 1000: a long chain of booleans costs a kernel time that grows with the square
  of its length). Which buffer reads are safe is decided by the range checks themselves, never by
  searching the issue list, which is capped at `MAX_ISSUES` so a hostile recipe cannot make the report
  large. A half-space is accepted only as a difference's tool, and a polygon or circle only as what an
  extrusion, a turn or a loft builds from. A turn's angle is above zero and at most a whole turn, an
  intersection has two solids at least, and every loft frame is affine, does not flatten and mirrors
  exactly when the first frame does: frames that disagree twist the sections through themselves
  into a solid of no volume in an exact kernel and a mesh one alike.
- **The validator cannot see every failure.** Transforms that compose past what a double holds, or a
  boolean the kernel cannot complete, surface only when the kernel evaluates the result, so an
  executor checks what it built and names the node that failed.
- **A root made of triangles alone needs no kernel.** `recipeSurfaceMeshes` follows a root through
  transforms, compounds and unions to its triangle nodes (a union of surfaces is all of them) and places them by the composed matrices, turning a
  triangle round under a mirroring one as a kernel's transform does; any other step makes the root
  undefined. It exists for meshes a solid kernel refuses, such as a building model's open furniture
  surfaces, which can still be drawn as the surfaces they are. It checks the recipe once with
  `assertRecipe` for all the roots it is asked for, so asking root by root costs a check each time.
- **A root's source is found by folding rigid transforms.** `recipeSourceOf` follows transform steps
  whose matrices only turn and move (`isRigidMatrix`: columns of length 1 at right angles within
  `1e-7`, keeping handedness) into the placing matrix, so roots that place one step through
  different moves share it. A transform that mirrors, scales or stretches stays a step of its own,
  since an instance drawn by it would turn its normals or its winding. An exact kernel's assembly
  document and a mesh drawer's instances both read sharing from it.
