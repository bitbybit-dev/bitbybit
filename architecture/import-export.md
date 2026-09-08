# Import and export

## The two scene serializers treat metadata differently

This is why the two export paths look asymmetric, and the asymmetry is correct.

- `SceneSerializer.Serialize` (`.babylon`) copies `scene.metadata` into its output **wholesale**.
  Because the metadata holds shadow generators, which reference their lights and through them the
  scene, stringifying it throws on the cycle. The metadata is therefore cleared for the length of one
  synchronous serialize and restored in a `finally`, so it survives a throw.
- The glTF exporter reads scene metadata **only through `IExportOptions.metadataSelector`**, whose
  default is `metadata?.gltf?.extras`. That expression is passed explicitly so the cycle can never
  reach the file. Stating it rather than relying on the default is deliberate: the default has moved
  before. The earlier workaround - deleting `scene.metadata` for the duration of the async export and
  restoring it in `.then` - left the live scene without metadata while the export ran, and for good if
  the export rejected.

## Sibling path mappings serve api-extractor, not just the compiler

Each package's build config maps the siblings it resolves, and several of those mappings have no
import behind them. They are not debris, and removing them breaks a gate that `tsc` cannot see.

**api-extractor follows declarations where the compiler follows references.** A package's
`dist/index.d.ts` names types from siblings it never imports directly - the renderers' `Draw.Entity`
names JSCAD's entity type, the two worker packages' kernels name base's types - and api-extractor
resolves those names through `paths`. Without the mapping it reaches the sibling's **source** and fails
with `ae-wrong-input-file-type`. `tsc` never notices, because it resolves siblings through project
references instead, so a build and a strict typecheck both pass while `api:check` fails.

That is why the three renderer packages map `jscad`, `manifold` and `occt` although nothing in them
imports those packages, and why `jscad-worker` and `manifold-worker` map `base` although neither
depends on it. Removing any of them was tried and reverted: the build stayed green and `api:check`
failed. A mapping here is evidence about the declarations, not about the imports.

`core`'s mapping of its own name to its own `dist` was the one real piece of debris, and is gone. A
self-mapping would have resolved the package's own name to its stale build output had anything used it.

The check cannot tell these apart for you. `check:references` compares the three generated configs
against each other and against the manifests' `references`; it never compares `paths` against
`dependencies`, so a mapping with nothing behind it passes, and so does a missing one until
api-extractor fails.

## STEP and IGES

`.stpz` is compressed STEP and `.igz` compressed IGES. Binary input must go through the `*FromBinary`
readers, which are **the only path handling the compressed forms**; text input is written into the
Emscripten virtual filesystem and read with the control readers, then unlinked.

A File or Blob never reaches this layer: the worker layer converts first, and the kernel throws if one
arrives. That is a layering contract a caller cannot infer from the signature. For the glTF conversion
path a string is encoded with `TextEncoder`, because the binary converter has no string overload.

An unmapped glTF name-format value falls back to the native value `2`, meaning "instance".

## SVG

The importer draws seven tags - `path`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon` -
and explicitly skips the nine that hold no geometry of their own (`defs`, `symbol`, `clippath`,
`mask`, `marker`, `pattern`, `metadata`, `title`, `desc`). Anything in neither set is descended into
and contributes nothing. The scene carries a `warnings` array for what the import could not honour.

- **Arc flags may be packed without separators.** The large-arc and sweep flags are single `0`/`1`
  digits, so `"016"` must parse as `0, 1, 6`. A general number reader swallows it as `16`, and every
  packed arc in real-world SVG parses wrong.
- **Implicit repeats after a moveto are linetos** per the spec: lowercase `m` emits `l`, uppercase `M`
  emits `L`. Removing that promotion turns multi-point movetos into disconnected subpaths. Also per
  spec: out-of-range arc radii are corrected by scaling both by `sqrt(lambda)`; `Z` ends the subpath so
  the next command starts a fresh one; a lone moveto is dropped.
- **The root `<svg>` may carry its own transform and style**, so the cascade is seeded from the root's
  own parsed matrix and resolved properties rather than from identity.
- **Faces are assembled in TypeScript, never natively.** The native path builder is always called with
  `makeFaces = false` and returns outline wires only; hole nesting and winding are resolved per element
  in TypeScript according to the face strategy and that element's fill-rule. The decode contract is
  that the native call returns one child per input group, in order, and the child's shape type is what
  says wire-vs-face. Turning on native face building bypasses the fill-rule logic entirely.
- **Containment needs the area guard.** A wire `j` contains `i` only when `|area_j| > |area_i|`
  strictly, *in addition* to the centroid test. That is what disambiguates concentric wires whose
  centroids coincide. Every wire is first normalised to counter-clockwise, and a region whose parent is
  itself filled is interior material rather than a boundary.
- The rounded-rect subpath is emitted **clockwise from the top edge** to match the spec, because
  winding feeds the fill-rule and hole classification downstream.
- **A Y-flip negates an arc's `xAxisRotation`, `startAngle` and `deltaAngle`**, so it also reverses the
  sweep. Flipping only coordinates leaves every arc bulging the wrong way.
- **An elliptical arc under an affine transform is solved by a closed-form 2x2 SVD.** Treating the arc
  as `M = L * Rot(phi) * diag(rx, ry)` with linear part `[[a,c],[b,d]]`: `e=(m00+m11)/2`,
  `f=(m00-m11)/2`, `g=(m10+m01)/2`, `h=(m10-m01)/2`, `q=hypot(e,h)`, `r=hypot(f,g)`; the singular
  values are `sx = q+r` and `sy = |q-r|`, and the major-axis rotation is
  `(atan2(h,e) - atan2(g,f)) / 2`. A reflection (`det < 0`) flips the sweep direction while preserving
  its magnitude. This is a derivation, not a transcription: nobody reading the bare arithmetic would
  know the terms are an SVD.

## DXF

- **A bulge is `tan(includedAngle / 4)`**; positive curves left travelling start to end (CCW), negative
  curves right. The included angle cannot be derived from the two endpoint angles alone, because they
  cannot distinguish the short arc from the long one, so a point at parameter 0.5 is sampled: if its
  angle offset has the same sign as the end offset and is smaller in magnitude (within 0.1 rad) the
  short arc is taken, otherwise the complement.
- **24-bit colour needs group code 62 set to 256 (ByEntity) and the packed `r*65536 + g*256 + b` in
  group code 420.** Setting 62 to anything else silently loses the colour. The ACI alternative writes a
  1-255 palette index to 62 directly, and 7 is white.
- **The colour format is `aci` by default**, not true colour. That branch is a nearest-Euclidean match
  against a nine-entry table, with anything darker than rgb(30,30,30) sent to ACI 7 on purpose so that
  near-black geometry stays visible against the dark model space typical of CAD viewers. Colours
  therefore do not round-trip unless the caller asks for `truecolor`.
- **SPLINE group code 70 is a bitfield**: 1 closed, 2 periodic, 4 rational, 8 planar, 16 linear. The
  generator emits 8 for an open 2D spline and 9 for a closed one, and sets code 74 to 0 because it
  writes control points rather than fit points.
- **Entity handles start at 256** so they do not collide with the handles AutoCAD reserves for system
  objects.
- **Apparently empty boilerplate is mandatory.** Many CAD programs need a BLOCKS section even with no
  blocks; LTYPE is always required; STYLE is required whenever text is present; and AC1009
  additionally requires VPORT, VIEW, UCS, APPID and DIMSTYLE.
- `AC1009` (AutoCAD R12) is the default because its minimal header gives maximum compatibility with
  older software. `AC1015` (AutoCAD 2000) is the modern format and additionally requires per-entity
  handles and `AcDb*` subclass markers.
