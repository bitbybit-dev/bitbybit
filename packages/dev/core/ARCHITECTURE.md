# Architecture - `@bitbybit-dev/core`

Why the engine-agnostic layer is built the way it is, where the code does not say so itself. The
rules that bite most often are in `CLAUDE.md` beside this file and are not repeated here.

## Draw dispatch

`DrawCore.drawableKinds()` is the one ordered table every renderer walks to decide what it was
handed. It is a single list rather than a chain written out in each renderer, because those copies
had drifted. The order answers what the checks cannot answer alone:

- `line` comes before `points`. `Base.Segment3` is `[Point3, Point3]`, so a two-element list of
  points is also a segment, and the order is what makes it draw as one.
- `jscadPath` comes before `polyline`. A JSCAD path carries `points` as a polyline does;
  `detectPolyline` now rules paths out itself, and the order still states it.

`manifoldMesh` and `manifoldMeshes` are the mesh a Manifold worker sends (`numProp`, a `Float32Array`
of vertex properties and a `Uint32Array` of triangles), told apart by those typed arrays: a mesh from
`manifoldToMesh` or `recipes.surfaceMeshes` draws without another worker call.

Each entry has a `phase`: a kernel shape has to cross to a worker and back, so it resolves only from
the asynchronous call. `resolveDrawableKind` looks the handler up before it runs the check, so a
renderer never asks about a kind it registered no handler for - a renderer without a node concept
simply leaves the node entries out of its handler map. A handler that needs the narrowed entity runs
its check again rather than casting; re-running a check is cheaper than a cast that could be wrong.

## JSCAD paths

A JSCAD `Path2` is drawn as a polyline through `pathToPolylinePoints`, which corrects three things a
plain read of `points` gets wrong:

- It supplies z = 0. The points are `[x, y]` pairs; read as three-element points, each takes the
  next point's x as its z and the whole line skews.
- It closes a closed path explicitly. The segment back to the start is implied by `isClosed`, not by
  a repeated point.
- It applies `transforms`. JSCAD accumulates a translate or rotate into `transforms` and leaves
  `points` untouched until something asks for them, so a moved path still carries the coordinates it
  was built at; reading `points` directly draws it at its original pose while the solid built from
  the same path draws where it was moved. The matrix is column-major and the path is flat, so only
  the four terms that touch x and y are used.

Each renderer's `handleJscadPath` resolves this before handing the points to its polyline handler, so
a path gets the options, metadata and update handling every polyline gets.

## Frames

A frame or a list of frames is drawn as one set of lines in one draw call, however long the list is
(`frameMarkerLines`). Whether the entity is one frame or a list is read from the entity, so a drawing
can be redrawn with either. A frame whose axes cannot be squared draws nothing; when no frame of the
list can be squared nothing is drawn, and an updatable drawing that was handed back is removed.

## Material caches

Each renderer caches its face materials under `getMaterialKey` - colour, alpha rounded to
`CACHE_CONFIG.ALPHA_PRECISION` places so float noise cannot split a key, z offset and the unlit flag -
with a separate cache for the unlit material type where the engine has one. A cache holds at most
`CACHE_CONFIG.MAX_MATERIALS`; at the limit the oldest inserted entry is disposed and dropped. That is
insertion order, not least recently used.

## Surface analysis

`withSurfaceAnalysisRange` fills a missing `analysisMin` or `analysisMax` from every mesh of a list,
so the meshes of one draw call share one colour scale. `surfaceAnalysisColors` maps each value onto a
blue-cyan-green-yellow-red ramp and writes the result as vertex colours in linear light, the space the
engines' shaders read vertex colours in; a NaN value, and every vertex of a face without values,
keeps the fallback colour. Each renderer draws analysed faces with its OCCT face material in white,
so the vertex colours show unchanged.

## Shared constants

`constants.ts` holds the draw defaults the three renderers share: material values per geometry kind,
geometry and colour defaults, cache limits. A number more than one renderer needs belongs there, so
the renderers cannot drift apart; each renderer's own `constants.ts` re-exports it and adds only
engine-specific values.

## Inputs

`inputs/index.ts` re-exports the base and kernel input namespaces by name and leaves `Base` out:
core's own `Base` (`base-inputs.ts`) re-exports the base package's types and adds core's - the colour
map strategy and the Verb types - and a second `Base` would collide. The renderers do the same one
level up, over core. `inputs/inputs.ts` only re-exports `index.ts`; it exists so older deep imports
keep resolving.

In the Verb fragments under `inputs/verb/`, a blank line separates the imports from the body, and the
assembler drops the imports. `namespace.ts` holds only the JSDoc that `scripts/gen-inputs.mjs` places
above `export namespace Verb`, so that block is public documentation even though nothing follows it
in the fragment.

## Workers

`worker-utils.ts` starts each CDN worker from a small blob script. The JSCAD and Manifold workers are
classic scripts, loaded with `importScripts`. The OCCT workers are ES modules, loaded with a static
`import` rather than `import()`, so the module and its message handlers are registered before the
`initialise` message is posted.

## IFC built with OCCT

`ifc` is the IFC worker's API with `geometry` replaced by `IFCWGeometry`, as `occt` is the OCCT
worker's with `io` replaced. Its `toShapes`, `toDocument` and `toStep` join two workers, which only
this layer knows together: the IFC worker describes the model as a recipe, and the recipe crosses the
main thread to the OCCT worker's `recipes.build` or `recipes.buildDocument`. The main thread only
forwards it; the IFC packages stay free of OCCT types, and the OCCT worker gains nothing for IFC.
`toStep` deletes the document it builds whether the export succeeds or not, since the caller never
sees it. `groupByClass` reaches the IFC worker's recipe rather than the OCCT build, since the IFC
package decides the groups and the document only nests what the recipe groups.

## Recipe meshes

`manifold.recipes.meshes` gives a recipe as meshes and placements: each step several roots place,
through transforms that only turn and move, meshed once, and every root a mesh, a matrix and its tag.
`recipeDrawPlanOf` (`draw-recipe.ts`) turns that into what a renderer uploads, so a building of a
hundred thousand elements is a few draw calls rather than a hundred thousand:

- **Elements.** Roots sharing the value of the element tag (`globalId` by default) are one element,
  so an IFC element of several styles shows, hides, colours and picks as one. Each element lists its
  parts: a run of a merged batch, or one instance of a group.
- **Instance groups.** A mesh placed by at least `minInstances` rigid matrices with one alpha is one
  group: the mesh once, and a matrix, a colour and an element per instance, the matrices relative to
  the group's centre.
- **Merged batches.** Every other placement is copied into a batch, its positions placed and
  measured from the batch's centre so that single precision stays exact far from the origin, its
  normals turned by the inverse transpose (a mirror reverses its triangles), its colour written per
  vertex. Batches split by whether they let light through and at `maxBatchVertices`. Each placement
  is one run of triangles and one of vertices, both contiguous, and `recipeDrawElementAt` finds a
  triangle's element by a binary search over the runs.
- **Colours are linear** (`srgbToLinear` on a tag's `rgba`), as every renderer reads vertex and
  instance colours, and `reverseWinding` writes the triangles in the order a renderer that reverses
  kernel meshes expects, so a state change writes the run's indices as they are.

Element state is the runs, not a shader: `recipeDrawRangeIndices` gives a hidden run triangles of
no area at its first vertex and a shown one its planned indices, and `recipeDrawRangeColors` a run's
vertices in one colour. A change costs the element's own vertices, works with each engine's stock
material, and leaves CPU picking right, since the engines pick on the CPU copy of the indices. This
is how xeokit's batching layers keep per-object colours and flags; a state texture would need a
shader patch in each of three engines. `detectRecipeMeshes` checks what arrives (every mesh index
in range or -1, sixteen finite numbers, a tag object, an integer group), because the planner trusts
it from there on.

## Tests

The suites run under jsdom because the tag service writes into the page. The IFC suite runs the IFC
and OCCT kernels through their worker mocks, so a recipe crosses the same message boundary it does in
a browser; it loads the OCCT kernel through `locateFile`, since under jsdom the glue would read the
wasm from an `http:` URL. Coverage is measured over
`lib/api/bitbybit`, the API surface; `lib/asset-manager.ts` is outside it on purpose, because its
suite drives it through the API class rather than directly.
