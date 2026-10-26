# Architecture - `@bitbybit-dev/occt`

What the code cannot say for itself: why something is done the way it is, the OCCT behaviour it works
around, and the numbers behind its limits. `CLAUDE.md` beside this file covers the build, the embind
rules, failure reporting and the assembly manager; `lib/services/design/README.md` is the design
record of `occt.design`.

## Kernels older than the package

The package runs on kernels built before some of its functions existed - a pinned or a custom
build - so it detects what the loaded kernel has instead of assuming it.

- **A missing function** is checked by presence. Without `DocumentToMeshBuffers` a shape is meshed
  through the kernel's JSON instead, which carries no iso curves and no surface analysis; without
  `IsoCurvePolylines` or `SurfaceAnalysisAtMeshNodes` the mesh comes back without what they add;
  without `TransformByMatrix` a stretched kept mesh goes through the general transform as before.
- **A function that gained trailing arguments** is recognised by its arity (`fn.length`), and the new
  arguments are passed only when the call takes them (`finenessFor`, `upFor`). A buffer mesh call
  without the fineness arguments meshes at 0.5 rad with an absolute precision. A glTF export call
  without the up-axis argument writes every document as z-up, so a y-up export is refused on such a
  kernel as an input error rather than written turned.

## Meshing

- The angular deflection is checked to lie from 0.001 to pi radians before any call: a kernel
  refuses an angle outside that range, and the JSON path it would fall back to meshes at 0.5 rad, so
  a wrong angle would otherwise pass unnoticed.
- The kernel refuses a zero pull direction whatever surface analysis it measures, so the analyses
  that read none are handed `[0, 1, 0]` (`UNREAD_PULL`). Draft angles come back in degrees.
- The buffer path copies the mesh out of wasm memory and frees the kernel's copy. Every array is
  checked against the face and edge records it belongs to (`checkLengths`, `checkContents`), so a
  kernel with another record layout fails there instead of drawing a mesh with holes. Colour groups
  are rebuilt as the JSON path writes them: each `#rrggbbaa` colour, in sorted order, with its faces.
- **Drawing takes the buffers layout, scripts the lists.** `shapeToMesh` gives what the kernel's JSON
  describes, plain number lists and every position again as a point (`vertexCoordVec`), because users'
  scripts read it so. The drawers ask the worker for `shapeToMeshBuffers` instead (`MeshingService`,
  `decodeMeshBuffers`): the same walk over the records (`decodeWith`), but each kind of number is made
  single precision once for the whole shape and every face holds views into it, with no points again.
  A mesh of 2,000 cylinders is 13 MB that way where the lists are 28 MB, and its buffers are handed to
  the main thread rather than copied. Where the kernel answered as JSON, `meshBuffersFromLists` turns
  the lists into the same buffers.
- **Edges are read from the faces' mesh.** The kernel takes an edge's points from the triangulation of
  a face it bounds, the nodes the mesher already placed along it, so a drawn edge lies exactly on the
  faces; only an edge no meshed face carries (a wire, a free edge) is sampled, with the mesh's own
  angular deflection and its precision as the chordal one. Sampling once took the precision as the
  angle, which traced a small circle in 630 points and made edges most of a large model's mesh.
- **A kept shape is drawn again without the mesher.** With a retention budget set, a redraw whose
  faces all kept their triangulation for the same settings skips OCCT's mesher, whose own check of
  kept faces cost more than a second on an assembly of 130 detailed parts, and reads each face's
  normals and centre as they were worked out the first time. That redraw went from about 1.5 s to
  under 0.1 s; a first draw costs what it did.

## Faces

- `OutlinesOnFace` takes every outline in one call, as flat lists (`OutlineList`): per outline its
  corner count, its corners as x and y pairs, the radius its corners are rounded with, and a
  placement in the face's parameter space, `u = x * scaleU + shiftU`, `v = y * scaleV + shiftV`. The
  kernel leaves out outlines that reach outside the face's trims or into its holes.
- `FaceNormalsAtUV` turns a normal over where the face is reversed or mirrored, so every normal
  points out of the material.
- Point queries (`FacePointsAtUV`, `FaceNormalsAtUV`, `ClosestPointsOnShape`) take all their points
  in one call, which prepares the shape once rather than once per point.

## Fillets

- `FilletWireCorners` rounds each corner of a wire in the plane of the two edges that meet there, and
  reads a radius of 0 as a corner to leave sharp. A radius of 0 or less that the caller asked for is
  therefore refused before the call; passed through, it would come back as a wire rounded nowhere.
  The corners it could not round come back counted from 0 and are reported counted from 1.
- `fillet2d` on a wire tries OCCT's 2D fillet first. When that is not done and every given radius is
  above 0, it falls back to `FilletWireCorners`, reading its inputs as the first path does: corners
  counted from 1, a `radiusList` without `indexes` giving each corner in turn its radius, listed
  corners taking the entries of `radiusList` in their order along the outline, and listed corners the
  wire does not have passed over. `fillet3DWire` counts `indexes` from 0.
- Edge indexes are checked against the numbering of `shapes.edge.getEdges` before rounding or
  bevelling, so a history always describes edges that were made.

## Booleans and features

The booleans and the feature kernels (holes, bosses, pockets) often return a compound that holds a
single solid. The services unwrap a compound that holds nothing but one solid, however deeply
nested, and return any compound that also holds a face or a wire as it is.

## Offsets

- `BRepOffsetAPI_MakeOffset` in open mode offsets a wire within a face, and would offset the face's
  own boundary too. An open offset on a face therefore lies in an unbounded plane through that face,
  with its normal (`planeFaceOf`). The face must be flat and the wire must lie in its plane; otherwise
  the maker fails, and it can crash when the wire runs across the face.
- On an unbounded plane face the maker offsets to the left of the wire seen from the face's normal,
  whatever the sign of the distance.
- Its result is a wire or a compound holding one; anything else is a failed offset.

## Transforms

- Public matrices are flat arrays of 16 numbers in column-major order (`Base.TransformMatrix`), as
  glTF, WebGL, Babylon.js and three.js write them and as `getLabelTransform` returns them. A point
  transforms as `p' = M * p`, and a list (`Base.TransformMatrixes`) applies first to last.
- A scale factor that is not finite or is below 1e-100 in size is never handed to the exact
  transform: a curved shape scaled that close to 0 shrinks to a point, and the kernel never returns
  from building it.
- `transformByMatrix` stretches and shears a shape that holds a face without a surface (a mesh kept as
  its triangles, found by `GetFaceSurfaceType` reading `unknown`) through the kernel's
  `TransformByMatrix`, the transform step recipes place their roots with. The general transform moves
  such a mesh's triangles but leaves their normals as they were, and under a mirror it leaves the
  triangles wound the old way, so the mesh comes out inside out (a volume of -1/3 for a tetrahedron of
  1/6 stretched to twice its width). Every other matrix keeps the path it always had: moves, turns,
  mirrors and even scales go through the exact transform, whose triangulations move with the shape,
  and stretches of ordinary shapes through the general one, with its B-splines and its handling of
  factors near 0 and past 1e13, which `TransformByMatrix` would refuse.

## Wires

- A point that splits a wire is projected onto every edge and the nearest projection wins; an edge
  the projection fails on is passed over.
- The split parameter snaps to the edge's first or last parameter when the point lies within 1e-7 of
  that end (`snappedToEdgeEnds`). A split at a vertex then matches the split the wire's own ends
  make; without it a rounding error inside the edge cuts off a piece of length 0.

## Sections and slices

Slicing turns the shape so the slicing direction is the Y axis, slices each solid in one kernel call
(`SliceByFrames`) and turns the faces back onto the direction. A plane given twice receives the same
face twice from the kernel, which is kept once; a shape too thin to slice gives an empty compound.
One call refuses to cut more than 100000 slices (`MOST_SLICES`): a step too small for the shape, or
for its distance from the origin, would otherwise loop for a very long time.

## Clashes

- `analysis.clashes.betweenShapes` measures a pair exactly only when it cannot be ruled out more
  cheaply, and answers what measuring every pair would. Two shapes whose kernel boxes are farther
  apart than the clearance cannot clash. Meshes then rule out the rest, but only between shapes that
  are one solid whose every face carries a surface: free edges and vertices are never meshed, ray
  parity cannot tell inside from outside in a compound of overlapping solids, and a face that holds
  only a mesh is meshed and measured by no surface, so any other pair is measured. Shapes are meshed
  lazily, only once a pair of them survives the boxes.
- Each shape is meshed at a thousandth of its box's diagonal, and the meshes go into box trees
  (base's mesh proximity helpers, whose tolerances are relative to the triangles they compare, so a
  part modelled in metres is measured as one in millimetres). A pair whose meshes stay farther apart
  than the clearance plus twice both meshes' error cannot clash, unless one lies inside the other,
  which a point of each tested by ray parity against the other settles; that far from the other's
  mesh the parity cannot be fooled by the mesh's error.
- Meshes already within the clearance less that margin go straight to `ClashesBetween`'s exact
  distance and shared volume. A pair in the band between, or whose meshes cross where the clearance
  is smaller than the margin, is meshed again four times finer, up to twice, within a triangle
  budget and never finer than a precision of 1e-6 (the kernel meshes nothing finer than 1e-7),
  since a coarse mesh of a big part cannot rule out a gap of a tenth of a millimetre; meshes that
  still cross are measured. Where the finest meshes still cannot tell, the kernel classifies eight
  points of each mesh, spread through it, against the other shape, which settles one inside the
  other near its wall where ray parity could be fooled. A point the kernel cannot classify (it
  answers unknown for every point of some valid solids) is left to ray parity, but only at a point
  farther than twice the mesh's error from it; with none that far, the pair is measured. Then
  `FacesWithin` names the faces that really come within the clearance, and only a pair with a point
  inside or such a face is measured. A mesh that comes out empty at any level is measured too.
  `prefilter: false` measures every pair.
- Pairs are measured one at a time, so a kernel failure would name positions 0 and 1. A kernel
  failure on the way therefore measures the whole list the way `prefilter: false` does, which fails
  naming the pair by its positions in the list, or answers; any other error is thrown as it is.
- When one tree's node is a leaf, each of its triangles walks the other tree on its own, pruned by
  the triangle's box and its plane: a big flat face meshes to long triangles whose boxes cover their
  neighbours, and testing them as a leaf made a gear against a crankcase take a minute.
- `design.clashes` meshes each built part once and places the mesh by each component's world matrix,
  its kernel box by the box of the placed corners and a point by the inverse placement before it is
  classified against the part's own shape. What it learns is kept by the parts' shape hashes, never
  their ids, which outlive an edit: the kernel boxes (shared with `design.section`), whether a part
  is one solid, its meshes at each level within a byte budget, and measured pairs. A pair of parts at
  the same relative placement and clearance is answered from what was measured, its points kept in
  the first part's frame, so a sweep through a motion measures only what moved. A kernel failure
  while ruling a pair out measures it exactly; one while telling a thread apart keeps the measured
  clash.

## Drawings

- The kernel builds a projected drawing on the XY plane, and its edges carry curves on that plane
  only. `BRepLib_BuildCurves3d_Simple` builds their 3D curves before the drawing is turned onto the
  XZ ground plane; turning it first loses the edges.
- The SVG writer negates every y, since SVG's y axis points down.

## Files

- BREP text is recognised by its header (`CASCADE Topology V<n>`, optionally after the
  `DBRep_DrawableShape` line OCCT's DRAW writes before it) and its ending (the `TShapes` table, then
  the reference to the shape it holds). Text the kernel finds damaged is refused as an input error
  that says where.
- Mesh exports work on a copy of the shape without its mesh, so they triangulate at their own
  precision and leave the caller's mesh alone. `adjustYtoZ` places that copy with y and z swapped,
  which turns Y-up into Z-up; the swap is a mirror, so the mesh writers turn the triangles of a
  mirrored placement to keep them facing out, and a placement moves a face that carries only a mesh
  too. STL data swapped after the fact (`stlWithYAndZSwapped`) likewise swaps y and z in every normal
  and corner and reverses each triangle's winding, binary or ASCII.
- **Units.** Every unit an export or an import takes is optional, and leaving it out writes and reads
  exactly what the call did before it had one.
  - STEP: the shape writer cannot declare a unit, so a shape modelled in another unit is scaled into
    millimetres and written by the same plain writer; the file states millimetres and its sizes are
    true. A document's export (`exportDocumentToStep`) states the document's own `lengthUnit`.
  - STEP and IGES loading: OCCT's reader brings every file in as millimetres, whatever it states,
    and `unit` scales the shape from there. `fileLengthUnit` tells what a file states: the `LENGTH_UNIT`
    of a STEP file's global context (an SI prefix, or INCH as a conversion-based unit) or the unit flag
    of an IGES file's global section, after unzipping a compressed one, and undefined when it cannot
    tell.
  - glTF is in metres by its specification: with a `unit`, a document's GLB gets one root node, "unit
    scale", that scales the scene's old roots, and no mesh is rewritten (`glbWithRootScale` in base,
    which Babylon's GLB export uses too).
  - An SVG with a `unit` states its `width` and `height` in it, margins included; metres are written as
    centimetres, which SVG has and metres it has not.

## Documents, PMI and validity

- DTOs that take a document handle leave its lifetime to the caller, who frees it with `delete()`
  (`deleteDocument()` through the worker).
- A root of an XCAF document cannot be placed. When a root assembly node carries a placement other
  than the identity, `buildAssemblyDocument` puts every root node under one top assembly named
  "Assembly", as the builder names the one it makes for loose instances, and keeps the placement
  relative to it.
- The kernel writes product manufacturing information as JSON, where a value JSON cannot hold (an
  infinite or undefined number) is null; it is read back as NaN.
- The kernel's validity report numbers each kind of sub-shape in its distinct list, each sub-shape
  once, while the getters of vertices, wires, faces, shells and solids count every occurrence.
  `shapeFix` maps a reported index to the first occurrence, grouping occurrences by the kernel's
  shape hash (taken modulo 2147483647).

## SVG import

- **Everything SVG is understood in TypeScript** (`lib/svg`): the XML, the path mini-language,
  transforms, the style cascade and units. It is reduced to the four exact segment kinds SVG path data
  can express - line, quadratic Bezier, cubic Bezier, elliptical arc - and every basic shape (rect,
  circle, ellipse, line, polyline, polygon, rounded corners, smooth-curve shorthands) becomes those.
  Coordinates stay in SVG user space, y down, until the path builder, so the normaliser is testable
  without the kernel.
- **The style cascade** covers presentation attributes and inline `style`, inherited down the tree.
  Stylesheets are out of scope: a `<style>` element produces a warning rather than silent
  mis-styling. Unsupported elements produce a warning with a hint, and `<use>` matters most: it
  places geometry defined inside `<defs>`, which is skipped, so a drawing built that way would
  otherwise import as nothing with no explanation.
- **Path data is tokenised per command**, not by one split into numbers: an arc's large-arc and sweep
  flags are single digits that may be written without separators (`016` in an arc is `0, 1, 6`), and
  a general number reader misreads nearly every arc drawing tools write. An incomplete argument
  group ends the command. Arcs are converted once from endpoint to centre parametrisation, after the
  SVG 1.1 implementation notes, and a full ellipse is two 180-degree arcs, because one 360-degree arc
  is degenerate.
- **Transforms are exact.** A matrix is `[a, b, c, d, e, f]` as in SVG's `matrix(a b c d e f)`:
  `x' = a*x + c*y + e`, `y' = b*x + d*y + f`. Lines and Beziers map their control points. An arc is
  re-derived from the combined matrix by a closed-form 2x2 singular value decomposition: with the arc
  as `M = L * Rot(phi) * diag(rx, ry)`, `L` the linear part `[[a, c], [b, d]]`, and
  `e = (m00 + m11) / 2`, `f = (m00 - m11) / 2`, `g = (m10 + m01) / 2`, `h = (m10 - m01) / 2`,
  `q = hypot(e, h)`, `r = hypot(f, g)`, the new radii are `q + r` and `|q - r|` and the new tilt is
  `(atan2(h, e) - atan2(g, f)) / 2`. A negative determinant, a reflection, reverses the sweep.
  Flattening arcs into segments instead would lose the exact geometry CAD input needs.
- **One native call builds a whole drawing.** The path builder encodes every group into flat buffers
  for `BuildShapesFromSegments`, which makes each segment exact geometry (a low-degree Bezier, a
  rational conic arc), optionally joins each subpath into one B-spline, and returns one compound
  child per group, in order.
- **Faces follow the fill rule**, not "the largest wire is the outside": an element may hold several
  disjoint regions, holes, and solids inside holes, and SVG does not constrain winding. The face
  builder turns every wire counterclockwise, finds each wire's nesting depth by containment, decides
  which depths are filled (`evenodd` by the depth's parity, `nonzero` by the summed winding of the
  original orientations), and builds one face per filled region with its immediate unfilled children
  as holes, turned clockwise so OCCT cuts them. Containment takes two tests: the enclosing wire holds
  the other's centroid and has the strictly larger absolute area. The centroid test alone cannot
  order two outlines drawn around one centre - a ring, a washer, a letter with a counter - and those
  are ordinary. A region whose face cannot be built is passed over. All of it runs on the flat wires
  before placement.
- **Placement**: the drawing is built in the XY plane, turned onto the XZ ground plane like the other
  on-ground primitives, anchored by its combined bounding box according to `alignment`, then oriented
  to `direction` and moved to `center`.

## Design documents

- `design.build` refuses a document `validate` faults, and the builders rely on it: they do not
  check again that no component is moved by two joints, and they recurse into sub-assemblies because
  `validate` refuses an assembly that contains itself. Code that builds a document runs `validate`
  first.
- Ids that become part of a face's name - a sketch command's, a hole position's - match
  `[A-Za-z_][A-Za-z0-9_-]*`: never a bare number, and never the `.`, `:`, `@` or `#` the name grammar
  splits on.
- An operation's history twin returns its histories in input order: `shape` first, then `shapes`.
- A shell tries arc joins, then intersection joins, because neither is right everywhere: a filleted
  block opened at its top is valid only with intersection joins, one opened at its bottom only with
  arc joins.
- `toTypeScript` replaces control characters and line separators with spaces in any document text it
  writes into a `//` comment: a line break would end the comment and run the rest as code. It
  parenthesises the operand of a unary `-` or `!` unless that is an atom or another sign, because
  TypeScript refuses a sign directly before `**`.

## Standard parts

- A spur gear's outline is computed in base (`spurGearOutline`, kernel-neutral; public as points through
  `engineering.mechanical.gears.spurGearOutline`) as lines, arcs and cubic Beziers, read here by its deep path, and drawn through the pen in one kernel call. Each involute flank is a run
  of cubics fitted by arc length, split until no sample strays more than a ten-thousandth of the
  module from the true involute; the root fillet touches the radial root below the base circle or
  the involute above it, and shrinks until the two fillets of a gap meet short of its middle.
- The pen commands carry ids `<part>.<index>` (`tip`, `flank`, `root`), unique as the pen needs; a
  role comes from the outline move of the segment's command, never from parsing the id.
- A ring gear's outline is the edge of the space inside the ring, and that space is shaped like a
  spur gear whose teeth are the ring's gaps: the same flank code draws it with the ring's root as
  that shape's tips, which are rounded instead of the gaps, and turned half a pitch so a ring tooth
  lies along the frame's direction. Its tips must stay outside the base circle, where the involute
  starts, which rules out rings of fewer than about 34 teeth at 20 degrees.
- `spurGearWithRoles` takes the side roles from the extrude's history, `start` and `end` from its
  first and last faces, and after the bore is cut keeps each face's role through the boolean's
  history: the faces no gear face became are the bore. `ringGearWithRoles` makes the ring as one
  face, the outer circle with the teeth as its hole, and extrudes it, so the face that is not a
  tooth's is the rim; the face's edges are matched to the teeth's by `IsSame`. Both twins return the
  `axis` frame, the input frame turned by `rotation`. `lib/services/parts/mechanical/gear-pen.ts` is shared
  with the design documents' `gear` loop, so both draw the same outline.
- Fasteners are turned profiles, with a hexagon cut for a socket and intersected with a 30 degree
  chamfer cone for a head or a nut, all in one frame along +Z with the seat at the origin, then
  oriented onto the caller's frame. Their faces are named by where each sits in that frame (its
  surface kind and its box: its height along the axis and how far it reaches from it), which a
  boolean's history would only repeat; `analysis.signatures` would also integrate every face's area
  and centre, a second for a spring's swept coil. The booleans keep their edges, so a screw's
  plain shank and its threaded length stay two faces.
- Threads are cosmetic and modelled at the nominal diameter inside a nut and a tapped hole as well
  as on the screw, so a screw in its nut or hole touches it without sharing volume; `design.clashes`
  leaves that touch out where a joint holds the two together.
- A compression spring is a round tube swept along an interpolated helix with the Frenet trihedron
  (the corrected Frenet and constant normal sweeps break on that path), then cut flat by a cylinder
  as long as the spring. The helix runs three quarters of a coil past each end, so the cutting planes
  cross the wire's side: a plane through the centre of the tube's end cap left the boolean unable to
  cut at most lengths. Closed coils rise by 1.05 of the wire's diameter rather than touching.
- A ball bearing is a compound of separate solids, rings, balls, cage and shields, each named by its
  own rule and offset by the faces before it, since a boolean of them would weld what turns. The
  balls, raceways and cage follow typical proportions of the bearing's section, sized so nothing in
  it overlaps; only the boundary sizes come from the designation. Each ring's flat sides are named
  apart from the rest of it (`innerStart`, `outerEnd`), so a design document's connector can stand
  on one. A ball is no larger than the section leaves room for with its cage pocket
  (`CAGE_POCKET_ROOM`) and the shield gap: the inch R-series sections are narrower than the ISO
  ones, and an open one once had its cage cut through its balls.
- **Standards and units.** Each standard is its own class (`fasteners.iso` and `fasteners.ansi`,
  `machining.iso`, `machining.din` and `machining.ansi`, and so on): it looks its sizes up in base, in
  the `unit` the call names, and hands the numbers to geometry shared by every standard
  (`fastener-shapes.ts`, `machining-shapes.ts`, `parallel-key-shapes.ts`, `retaining-ring-shapes.ts`,
  `ball-bearing-shapes.ts`), so an ANSI screw and an ISO one are the same code on different numbers,
  with the same roles and connectors. Gears, springs, dowel pins and flats take model units and no
  `unit`. A thread is cut in millimetres and then scaled into the unit (`thread-cutter.ts`), because
  its play and its helix accuracy are absolute millimetre values chosen for the kernel's tolerance; a
  spline takes its pressure angle and root round from the sizes, 30 degrees and DIN's root for
  DIN 5480, the flat root of B92.1 for ANSI.

## Recipes

- `recipes.build` hands the whole recipe to the kernel's `BuildRecipes` in one call: the steps and
  the roots' placements as JSON, the buffers as they are, the tags left out. One call per step from
  TypeScript cost 0.1 to 0.5 ms each, and a triangle mesh built face by face about 0.2 ms per
  triangle; inside the kernel the steps of one depth also build in parallel on the multithreaded
  kernel. A kernel without `BuildRecipes` is refused with a message, since nothing else builds a
  recipe here.
- The kernel reports each root as built or failed, naming the step that failed first in its chain
  and the reason. The package turns the first failed root into `occt.recipe.failed`, or an empty
  compound in its place when asked.
- A step whose `op` the kernel does not know fails the roots resting on it with "'<op>' is not a step
  this kernel builds; a newer kernel does", and the other roots build: a recipe written for a newer
  kernel loses only what it needs the newer kernel for. `checkRecipe` in `base` decides whether such a
  recipe reaches the kernel through `build` at all.
- An opening of a voids step that cannot be built is left uncut: the host is cut by the openings that
  were, and the kernel lists the left-out openings under the root's `uncut`. Without
  `emptyWhenFailed` the package treats such a root as failed, naming the opening and its reason, so a
  strict build still stops; with it the root comes back with the hole missing.
- A revolution is `BRepPrimAPI_MakeRevol` of the profile face, a whole turn being OCCT's closed
  revolution. A loft places a copy of its profile by each frame and joins the sections with a ruled
  `BRepOffsetAPI_ThruSections`, corner to corner (OCCT's compatibility check off when the sections have
  as many edges, since it would untwist what the frames twist), each hole lofted alike and cut out; a
  circle stays a circle in every section, so a loft of circles gives a cylinder or a cone. A union is
  one fuse, an intersection one common after another.
- A triangle mesh keeps its triangles by default: a shell holding one face with no surface, only its
  triangulation, which draws, bounds, measures and writes to STEP as AP242 tessellated geometry. A mesh
  turned into a faceted solid instead (`facetedMeshes`, or wherever a cut, a union or an intersection
  needs it, since a boolean cannot use a face without a surface) costs a B-rep face per plane, a few microseconds per triangle,
  and its validity depends on the mesh: exported meshes carry cracks and slivers. On a large exported
  building model of about three million mesh triangles, Manifold builds in 7 s, the kept triangles
  in 12 s and the faceted solids in 41 s, a few dozen of which fail OCCT's validity check.
- `maxTriangles` bounds the faceted build only: one mesh of millions (a scanned or vegetation
  stand-in) would otherwise hold up every other root. An infinite limit is passed as the largest whole
  number the kernel takes.
- A placement that only moves and turns shares its step's geometry, placing it by the shape's location
  rather than copying it, and a step's shape is let go once its last user is built: a building model
  places one mesh many times, through a mapped item and then the element's placement, and copying at
  both held three solids of every mesh. One chunk of furniture needed more than the 2 GB of the 32-bit
  kernel that way. A mirror or a scale still copies, since a location carries neither.
- A compound keeps its parts apart, so their volumes add: a door whose leaf and frame overlap measures
  the overlap twice, where Manifold's executor unions a compound and counts it once. Part by part the
  two agree.
- `booleans` refuses a shape holding a face without a surface (`occt.boolean.tessellated`): OCCT's
  boolean dereferences the missing surface and crashes the kernel.
- `recipes.buildDocument` builds parts, not placed roots. A placement in a document moves and turns
  only, so a root whose matrix does is an instance of its step's part, and a step placed by many
  such roots (a door type) is one part; a root that mirrors or scales is built in place as a part of
  its own. The plan looks through transforms that only move and turn (a mapped item) to the step
  under them and folds them into the root's matrix: the kernel would place that step by a location,
  and XCAF stores a located part as a reference to the same shape unlocated, a label without a name,
  which STEP then names after the translator. A recipe in a unit STEP cannot state (feet, say) is scaled to millimetres, which makes
  every root such a part. Instance properties are not written to STEP, so the tags become
  properties of a product assembly per group, which holds the instances.
- The recipe's groups become assemblies above the products, each in the assembly of its parent group
  and the top-level ones in the document's top assembly, with the group's tags as properties; a
  product sits in the assembly of its first root's group. A group none of whose products was built is
  left out, so a document of a few elements carries only the structure around them, and a group
  without a name is called `Group <n>`.

## Tests

`vitest.config.ts` runs a process per file because the kernel holds global state, and raises the
timeouts (30 s a test, 60 s a hook) because building through the real kernel is slower than a unit
test, and the first load of the wasm slower still.

Every test runs with the kernel ledger (`lib/__test__/kernel-ledger.setup.ts`): each kernel a test
creates is watched, and every outermost call through the service tree is checked for kernel objects
it made and left alive, outside its answer and the design builder's own caches. The root
`check:kernel-ledger` reads what the run recorded (`scripts/README.md`), and only a report a file's
whole run wrote: a run filtered by `-t`, by line or by `.only`, and a file that stopped before its last
test, leave a partial report that fails the gate. Measured over the whole suite,
it adds no time a run can tell apart from noise. `kernel-lifetimes.test.ts` names the cases one at a time, a success and a
refusal for each leak found, through `ledgerRun`, which nests under the suite-wide ledger.

The same harness holds every case to "nothing consumes what it was given". Every kernel object the
arrangement left alive is read before and after the call (`lib/__test__/input-contents.ts`): a shape by
its BREP text without triangulations, so curves, pcurves, tolerances, sub-shapes, placement and the
orientable, closed, infinite and convex flags all count, while the free, modified and checked flags,
which OCCT sets on any shape another one is built from, do not, and neither does a mesh, which meshing
stores on the faces by design and replaces rather than grows; a curve or surface by its values at fixed
parameters, a point or frame by its coordinates. The call itself goes through a watching proxy
(`call-watch.ts`) that snapshots its arguments, plain arrays, objects and bytes included, before and
after. A case that changes its input on purpose says so and why in its own `changesItsInput`, and still
has to change it. A refusal counts only as an `InputError`, a `KernelOperationError` or an Error read
from a C++ exception (`readKernelException` marks those, `kernel-exception-reads.ts`, without changing
them); a `TypeError`, a `BindingError` or an unmarked Error fails, and so does a trap anywhere along the
cause chain. A case whose name says why it is refused states the refusal it expects in `refusedBy`, by
property, code or message part, so one refused for another reason fails. The checks found that joining
edges into a wire gave a caller's edge drawn from a 2D curve on a surface a 3D curve it did not have;
`combineEdgesAndWiresIntoAWire` now builds the missing 3D curves on a BREP copy of the wire, only when an
edge lacks one, which leaves every other wire sharing the caller's edges as before.

The ledger sees kernel objects, not the C++ memory behind them; `kernel-heap.test.ts`,
`kernel-exceptions.test.ts` and `npm run heap` (`CLAUDE.md`) read the heap itself, the probe calling a
case a leak when its heap grows by more than 8 bytes a call on average over three windows. They found
that OCCT's sweeps put the result's pcurves on the edges of the profile they were given, so a profile lofted,
revolved or extruded again and again kept every earlier result's surfaces alive. `operationsService.loft`,
`loftAdvanced`, `revolve` and `extrude` therefore build on a structural copy (`BRepBuilderAPI_Copy_Shape`
without geometry) and hand that copy to the history readers, whose index lists come out the same; a
result no longer shares edges with the caller's profile. The sections of a loft are copied together in
one compound, so a section given twice, or two sections sharing an edge, stay shared in the copy as they
were. A copy stores the plane pcurves OCCT otherwise computes on the fly, so the rim of an extruded face
now carries a pcurve on its own cap: `shapes.face.fillPatch` takes that cap as the support of a tangent
rim edge given none, where it refused an edge on no face before.
