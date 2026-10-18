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
| `geometry/` | `vectors` (2D and 3D tuple operations), `scalars` (degree conversion, interpolation, rounding), `matrices` (composition, rigid inverses, the 3x3 eigen solve), `frame-axes` (frames squared, points and vectors moved between a frame and the world, a frame as a matrix), `arcs` (the circle through three points), `polygons` (signed area, winding, point in polygon, rounded corners), `paths` (sweep frames along a polyline, rounded paths), `triangulation` and `vector-grid` (duplicates under a tolerance) |
| `mesh/` | measures (signed volume), normals (smooth and creased), orientation and winding repair, primitives (icosphere, frustum) and proximity trees; the normals and the winding work on indexed meshes, `Base.IndexedMesh` in public |
| `curves/` | `nurbs` (B-spline curve and surface evaluation) and `surface-triangulation` (adaptive meshing of a curved face) |
| `color/` | the sRGB conversions |
| `files/` | the zip and inflate readers, crc32 and the DXF writer |

A helper never sits loose beside the folders (`exposure.test.ts` fails one that does). They take and
return tuples and flat arrays, never DTOs: a service call builds an object per call and `mul` resolves
its defaults each time, which costs 10 to 300 times the arithmetic, and a file reader calls these per
vertex. The services are the public face of the same code - `Frame` moves points through
`frame-axes`, `Vector.cross` is `cross3`, `transforms.combine` is `composed`, `polyline.sweepFrames`
is `transportedAxes`, and `mesh.triangulatePolygon`, `mesh.icosphere`, `polyline.polygonArea` and
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
- **The engineering tables** (`gears/`, `fasteners/`, `machine-elements/`, `shafts/` and
  `services/engineering/`): sizes from standards, public as `bitbybit.engineering`, which the OCCT
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

## DXF export

`lib/api/services/helpers/files/dxf/dxf-generator.ts` writes one of two versions, chosen by `acadVersion`:

- `AC1009` (R12), the default. Its readers expect the VPORT, VIEW, UCS, APPID and DIMSTYLE tables
  and a BLOCKS section even when they are empty, and an APPID entry for `ACAD`, so those are written
  empty rather than left out.
- `AC1015` (2000) adds entity handles and subclass markers (`AcDbSymbolTable`,
  `AcDbLayerTableRecord`). Handles count up in upper-case hexadecimal from 0x101.

A `#RRGGBB` colour is written as the nearest of the nine standard AutoCAD Color Index entries (1-9)
by RGB distance, or, with `colorFormat: "truecolor"`, as ACI 256 (by layer) followed by group 420
holding `r * 65536 + g * 256 + b`. Near-black (every channel under 30) and anything that is not
`#RRGGBB` become ACI 7, which viewers draw black on a light background and white on a dark one.

A polyline is written closed when it has at least three points and its first and last agree within
`CLOSED_POLYLINE_TOLERANCE` in X and Y.

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
  executor's choice, so two kernels build close solids, not identical ones. `tolerance` and
  `millimetresPerUnit` describe the data for whoever reads the results; an executor builds in the
  recipe's own units and need not apply either. A compound is the space its parts fill together, so
  an overlap counts once, though an exact kernel may keep its parts apart; a `union` joins them into
  one solid in every kernel, and an `intersection` keeps the space all its solids share.
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
