# OCCT

The largest kernel wrapper, and the one with the most behaviour that cannot be read off the code.

## Service construction is a dependency ring

Wires, operations, fillets and faces refer to one another in a cycle (wires needs operations and
fillets; operations needs wires and faces; fillets needs operations and faces; faces needs wires and
fillets), so no construction order can hand every one of them its collaborators.

Each edge that closes a cycle is passed into the constructor as a **supplier function** read on use
rather than at construction; everything else is built in true dependency order, and nothing is
assigned onto a service afterwards. Replacing the suppliers with direct references, or with
post-construction field assignment, gives undefined collaborators at runtime.

## Living with the embind bindings

- Native calls return **embind vectors**, not arrays: `.size()` and `.get(i)`, no `length` or
  indexing. Treating one as an array yields `undefined` rather than an error, so the bug surfaces far
  from its cause.
- `TopAbs_State` arrives as a plain number: **0 = IN, 1 = OUT, 2 = ON, 3 = UNKNOWN**. The numeric
  switches in the point filters depend on it.
- **Overload resolution is fragile.** `BRepPrimAPI_MakePrism` must use the 2-argument form (the
  4-argument one has binding issues), and faces are made through `MakeFaceFromWireOnlyPlane` /
  `MakeFaceFromFaceSurfaceAndWire` rather than the `BRepBuilderAPI_MakeFace` constructor, to avoid an
  ambiguity that only appears at runtime. `BRepPrimAPI_MakeRevol` by contrast deliberately uses 2
  arguments for a full revolution and 4 for a partial one.
- A **deleted object throws on any method call** rather than becoming null, which is why validity is
  probed by catching rather than by testing.
- `occ-referenced-returns.ts` is a **migration shim**: the old opencascade.js API returned extra
  outputs through reference parameters, the current bindings return result structures. It exists only
  so old call sites keep working, and new code should not adopt the `{ current }` indirection.

## Geometry behaviour

- **A face can be REVERSED while its surface is not**, so normals from `GeomLib_NormEstim` must be
  flipped when `face.Orientation() === REVERSED`. Skipping this gives inward normals for some faces
  only, surfacing much later as inside-out solids or wrong-side offsets.
- **Tessellation is not guaranteed to run in the edge's direction.** `edgeToPoints` compares the first
  and last tessellation points against the edge start and reverses when needed; without it, points
  along a wire alternate direction per edge and the polyline zig-zags.
- **`GetDerivativesOnEdgeAtParam` takes a normalized [0,1] parameter** and remaps internally. Adding
  the "missing" remap, or passing a real curve parameter, returns a tangent from the wrong place.
- **Bezier degree is capped at 25.** Beyond that a single Bezier also oscillates badly, so
  `createBezier` switches to a clamped bounded-degree BSpline over the same control polygon, which is
  what lets it scale to arbitrarily many control points.
- **A periodic curve must not duplicate poles.** A non-periodic closed curve repeats its first control
  point (and its weight) to close C0; a periodic one already wraps through its knot vector, and
  duplicating creates a kink or an invalid curve.
- **BSpline parametrization codes** are uniform = 0, chordLength = 1, centripetal = 2, and an unset
  value falls back to 1 **for backward compatibility with scripts saved before the option existed**.
  Changing the fallback changes the shape of existing saved work.
- **The 6-argument torus** is `(axes, majorRadius, minorRadius, angle1, angle2, angle)`: the first two
  angles bound the *ring* (the minor circle), the last bounds the *pipe* (the major circle). A
  pie-slice torus keeps the ring full and limits only the last. The full-torus form is chosen with a
  1e-7 tolerance against 2*PI so float drift does not fall into the partial branch.
- **Rebuilding a wire from its edges is what normalises their orientation.** There is no OCCT call
  doing it, so the function looks like a pointless round-trip and is a prime candidate for deletion.
- **Slicing is done bbox-aligned.** The shape is aligned so the section direction becomes `[0,1,0]`,
  the bounding box and all slices are computed there, and the results are transformed back. Removing
  the align/unalign pair breaks slicing on arbitrary directions.
- **`fillet3DWire` reproduces the 2D fillet's corner indices through an extrusion.** A 0-based corner
  `i >= 2` maps to extruded edge `4 + 3*(i - 2)`; a closed wire has its edge list rotated by one first,
  and on an open wire corner 0 maps to edge 1. After filleting, the wanted edge of each resulting face
  is always at index 3, and the assembled wire is translated back along the negated extrusion
  direction. This is empirical knowledge about how OCCT numbers edges and cannot be re-derived. The 2D
  fillet also falls back to this path whenever the wire is not purely straight and circular edges.
- **STL export must `BRepTools.Clean` first.** OCCT caches triangulation on the shape, so without it a
  previously computed high-resolution mesh is reused and the precision input is silently ignored.
- Beam profile alignment (`I`/`H`/`T`/`U`) places the **named corner at the origin** - `topLeft` puts
  the top-left corner at `(0,0)` - so the offsets have the opposite sign to most readers' intuition.
  The profiles are authored centred in the XZ plane, and the H-beam is the I-beam with width and
  height swapped.
- `subdivideToRectangleHoles` defaults its pattern scale to **0.5 because a scale >= 1 cannot punch a
  hole**: the scaled rectangle must be strictly smaller than its cell.
- **`removeAllDuplicateVectors` lives in `base`, and the OCCT vector helper delegates to it** rather
  than carrying a second copy. It is called on user point lists, where a large input used to stall
  visibly, so it indexes the vectors it has kept into a spatial grid whose cells are a few tolerances
  wide and probes only the cells a candidate could match in. **The grid narrows the candidates and
  never decides equality** - every candidate is still confirmed with `vectorsTheSame`, so the result
  is element for element what the plain scan returned, first occurrence kept. A vector the grid
  cannot place - a non-finite component, a tolerance that is not positive or not finite, a magnitude
  past the point where the cell arithmetic stays exact - falls back to the plain scan and is also
  kept in a small side list that the grid path checks, so neither path can miss a duplicate the other
  holds. `removeConsecutiveDuplicates` is still the cheaper call when only neighbouring duplicates
  matter.

## Guards that cannot fire, and readers that do not refuse

Three behaviours here look like defects and are not. Each is pinned by a test, so a correction shows
up as a failing test rather than as silence.

- **The IGES text reader accepts a file it can make nothing of, and reports success.** Reading an empty
  file as `.igs` hands back a shape rather than `undefined`, so a caller that needs to know learns it
  from the shape being null, not from the result. The failure branch of the combined STEP-or-IGES load
  is therefore unreachable from a text input. The binary path does report failure.
- **`multiplyTransforms`' empty-list guard cannot fire.** The fold wraps a bare matrix in a
  one-element list before the length check, and treats an empty array as a bare matrix, so the list is
  never empty by the time it is measured.
- **Three of the four branches of `quaternionFromMatrix` are unreachable through the public API.**
  Reading a shape's transform reads its placement, and this library's rotate writes the turn into the
  geometry instead, so the matrix read back is always the identity and the trace is always positive. A
  caller could reasonably expect the opposite, which is why the behaviour is pinned rather than assumed.

## Assemblies

- The native document expects a node's matrix as a flat **row-major 3x4** (12 values); the public API
  uses **column-major 4x4** and also accepts an ordered list. The manager folds and transposes at the
  boundary. Passing a public matrix straight through transposes every placement, which produces
  plausible but wrong part positions.
- `loadedParts` reference their source document by index and **deliberately carry no shape data**,
  unlike `parts`, which are serialised by index into the shapes array.

## A security boundary

**Dimension label expressions are filtered, then parsed - never evaluated.** A label is checked
against `[0-9 + - * / . ( ) space]` and only then handed to a safe arithmetic parser; anything else is
treated as a plain template string. `eval` and `Function` are deliberately absent from this path,
because these expressions come from user-authored scripts.
