# Design record: model documents and references that survive rebuilds

This folder holds `occt.design`: a model kept as a JSON document (named parameters and an ordered
list of features, or an assembly of parts placed by their connectors) and the runner that builds it
with this package. `design.validate` checks a document
without building it and `design.build` builds it. This record says what the design is, why, and where
each idea comes from, so the reasoning stays next to the code that implements it.

## How the code is laid out

- `expressions.ts` parses and evaluates the expression language: arithmetic, comparisons, `&&`, `||`,
  `!`, quoted text and `if`. `values.ts` reads parameters (typed, with limits and options),
  configurations, overrides, numbers, points, counts and property templates, and reports problems by
  JSON pointer; `problems.ts` holds that problem and the pointer, `structure.ts` the strict-key,
  label and extension checks.
- `document-check.ts` is `validate`: the header, parameters and configurations, then the features in
  order, so a reference can only name what came before it, then materials, parts and assets. A
  feature with a problem is taken as made, so one fault is reported once.
- `names.ts` carries face names through histories; `references.ts` turns a face or edge reference
  into indexes, and `hints.ts` writes hints and scores faces against them when names are lost.
- `runner.ts` runs the features in order. `steps.ts` holds the sketches, the sweeps (extrude, revolve,
  sweep, loft), booleans, fillets, chamfers, patterns, mirrors and operations, `local-features.ts`
  the features that change a body in place (shell, hole, boss, pocket) and import, and `helpers.ts`
  what they share (face frames, profile names). A feature that fails takes what it makes or changes
  with it, a suppressed one that makes a body or a sketch makes none, and the features that read
  either are skipped. `parts.ts` then builds the parts: properties, material, appearance, volume and
  mass.
- A shell tries arc joins, OCCT's default, then intersection joins, and fails when neither builds a
  valid solid with an inner wall: OCCT builds an invalid shell of some filleted bodies with arc
  joins, refuses others, and returns the body itself, unhollowed and "valid", for a thickness well
  past what the body allows.
- An import reads the bytes the build is given for its asset (`assets` on `design.build`), checks
  them against the SHA-256 the asset must record (`digest.ts`), and keys the cache by their digest
  and the asset's entry, so changed data or a changed entry rebuilds. Since the hash is required,
  the document's version pins the geometry every import reads. An asset's `uri` is relative to the
  document's own location in the store that keeps it (an absolute URL is allowed); the runner
  fetches nothing. For OCCT's BREP, `mediaType` records the format version
  (`model/vnd.occt.brep; version=3`).
- `typescript-export.ts` is `toTypeScript`: it builds the document once, recording what each feature
  resolved (face frames, face and edge indexes, the import format, the shell's joins), and writes the
  parameters as constants, expressions as TypeScript over them, and each feature as this package's
  calls, with the resolved faces and edges as indexes.
- `probe.ts` is `probeFillet`, for whoever writes a fillet or chamfer without trial builds: it runs
  the features before it, resolves its edge reference with every count reported rather than checked,
  and tries values, the document's own first, doubling or halving until one builds a valid shape and
  one does not, then halving the gap to about 2 percent. "Builds" is stricter there than in a build,
  which keeps a fillet OCCT calls done even when the result is not valid. Each try is timed: on a
  revolved body with nine edges rounded, a radius that builds took under 2 s and one that failed just
  past the largest took up to 113 s, all of it inside OCCT's fillet, so finer steps would cost minutes.
- `cache.ts` keeps each outcome by a hash of the feature, the parameter values it reads and the
  hashes of its inputs, and frees the least recently used beyond its capacity when a build ends. It
  owns every shape it holds: an operation that returns one of its inputs is given its own handle, one
  that returns a list of shapes makes their compound, and the parts a build returns hold new handles
  the caller owns.
- `assembly-check.ts` is `validate` for an assembly document: each component's source against the
  `documents` given beside it, its joints and their limits, joints that close a loop, and the
  problems of every document it places under `/documents/<position>`. `assembly.ts` builds one: each
  part once per document, configuration and parameter set, placed in joint order; `placement.ts` is
  the matrix arithmetic of frames and joints.

The migrations described below are not built yet.

## Parts and assemblies

- **Two kinds of document.** A part document (`kind` left out or `"part"`) builds parts from
  features; an assembly document (`kind: "assembly"`) places `components`, each a part of another
  document or a whole assembly, and has no geometry of its own. The two never mix in one document.
- **A component names its source by address**: the document's `id`, its `version` when pinned, the
  `part`, a `configuration` and `parameters` given as expressions over the assembly's own. The
  runner fetches nothing: the documents are handed to `validate` and `build` as `documents`, keyed
  by id and version, so two components can place two revisions of one document; when several
  versions of one id are given, a component must pin the one it places.
- **A version is a hash of what the document means** (`design.versionOf`, `identity.ts`): the
  SHA-256 of its canonical JSON (RFC 8785, JCS, with test vectors) over a projection that leaves out
  `meta` but its `name` (which names an assembly's product in STEP), `extras`, the extensions it
  does not require, the text only editors show (a parameter's
  `label`, `description`, `group`, `step` and `unit`, an option's `label`, a configuration's and a
  feature's `name`) and the `hint` a face reference may carry. Part
  and component names stay in, since they reach STEP and the bill of materials. So a description fix
  or an editor's view state never breaks a pin, and a pinned component fails when its source changed
  in meaning rather than silently building something else. A store may stamp its own revision id
  into `meta.revision`, outside the hash, and a component may pin that instead. Stored documents are
  never rewritten on read: saving a migrated document makes a new version.
- **A part's look lies over its material's.** `color`, `metallic`, `roughness`, `opacity` and
  `edgeColor` given on the part win over the material's; `faces` entries give the faces a reference
  names their own look and `edges` entries the edges one names their own colour, a later entry over
  an earlier one. The build resolves both to the indexes `shapes.face.getFaces` and
  `shapes.edge.getEdges` give, which is what a renderer draws by. An entry whose reference does not
  resolve is reported and left out; the part is still built. The structure an assembly build returns
  carries the part's colour and edge colour and the colours of the listed faces and edges, so STEP
  keeps them all and glTF the face colours. A look's metallic, roughness and emission go into a PBR
  material on the part, and on each face look, which glTF reads (STEP keeps colours only); emission
  is the emissive colour times its strength in linear light, at most 1, as far as glTF's core
  emissive factor goes.
- **`#rrggbb` is sRGB**, as hex colours are everywhere. The kernel keeps colours in linear light and
  converts at its boundary, so STEP, whose colours are sRGB, gets the colour as written, glTF gets
  its linear value, and a colour read back from either reads as written.
- **Connectors** are frames on a part, declared by a face reference (`on`), so they follow the face
  through parameter changes. A frame on a face is placed as CAD tools place a sketch on one: its
  origin is where `origin`, or the document's origin, meets the face's plane square on, so it stays
  on the face wherever a parameter moves it and an unrelated change to the outline never moves it;
  its x axis is `direction` laid into the face. A face facing along a world axis may leave the
  direction out (X, or Y on a face facing along X); any other needs one, since no default turns
  smoothly with every face, and a build reports it missing rather than guess. Holes and sketches on
  faces take their frames the same way. A connector's origin may come instead from `axis`, where the
  axis of a cylindrical face such as a hole's wall crosses the face (through the centres of the
  circles bounding it; a counterbore, countersink or tip that carries the wall's name too is passed
  over, and the cylinders must share the axis), or from `centre`, a circular edge's centre. An `axis` naming every wall of a
  hole makes a set, one connector per position, `<id>.<position id>`, so a flange's bolt connectors
  follow its holes instead of repeating their positions.
- **`replicate` places a component on every member of a set**: its own `connector` fastened to each
  connector the set `to.connector` names on `to.component`, as a fastened joint with `flip`, `angle`
  and `offset` would, each occurrence named `<id>.<member>` and counted in the bill of materials. A
  replicated component has no `at`, no joint moves it, and nothing joins to it by name.
- **Joints** place components against each other
  (`joints: [{ id, type, component, connector, to }]`): the moved component's connector against
  another component's connector (or a fixed frame), faces meeting with normals opposed, turned by
  `angle` about the shared axis, moved by `offset` along it, and `flip`ped to face the same way. The
  type says what may move: nothing for `fastened`, the angle for `revolute`, the offset for
  `slider`, both for `cylindrical`; `limits` bound what may move, and a value outside them is
  refused: that component fails, and the components joined to it, or to a suppressed one, are
  skipped, as features are, each saying which component it waited on. A failed sub-assembly's own
  components are reported skipped. Values are expressions over the assembly's parameters, so a pose
  is a configuration and one parameter can drive several joints. A component is placed `at` a frame
  or moved by one joint at most, and joints form a tree, each component placed after what it is
  joined to: a closed loop needs a constraint solver and is refused until one exists. The build
  returns every joint with its values, limits and its axis in world coordinates, for tools that draw
  and drive them.
- **An assembly publishes connectors** (`connectors: [{ id, component, connector }]`): a name for a
  connector of one of its components, which may itself be one a sub-assembly publishes. Only
  published connectors are seen from outside, so a sub-assembly is joined, and joined to, by those
  names, and the components inside it can change without breaking the assemblies that place
  it. A sub-assembly is laid out in its own coordinates first, then placed by its connector.
- **One part, many placements.** A part built with the same values is built once and placed by
  matrix, so a bolt placed forty times is one shape, one STEP product and one bill of materials line.
- **An item key names the item a part is** (`itemKey`, 16 hexadecimal digits): the SHA-256 of its
  document's id, its part id and the declared values it reads, through its features, material,
  appearance and properties, and back through any parameter computed from others to the values that
  were given. A parameter the part never reads, the configuration that set the values and the
  document's version are left out, so identical parts are one item, a configuration and the same
  values set by hand are one item, and a revision keeps the key, as an item number outlives its
  revisions. Computed values stay out so a change in how an expression evaluates never renumbers an
  item. A value written as a constant expression (`"2 * 100"`) is a given value too, and a value only
  a connector reads counts, since a connector places the part. In an assembly a part's id is its own
  followed by the key (`post-91b5e70c3f2a6d18`); when a build is given several versions of one
  document, the version's first eight digits follow, so two revisions placed together are two parts
  and two lines;
  `buildKey` adds the version, for caches and editors that must tell revisions apart, and drawers
  keep meshes by `shapeHash`. Two different items that evaluate to one `partNumber` are reported,
  so a template that leaves out a value that changes the part is found.
- **What a build returns for an assembly**: the parts, a report per component, every placed
  occurrence with its path, parent, matrix and world matrix, the bill of materials counted through
  every level, and the structure `assembly.manager.buildAssemblyDocument` takes, so STEP and glTF
  exports keep the tree, the names and the colours. The structure has one root, `/`, that stands for
  the assembly built: named by its `meta.name`, it holds the top-level components, as a CAD
  assembly exports as one product.
- **A part document's build has a structure too**: one product named by its `meta.name`, each part
  placed once under it where it was built, with its colours, finish and properties, so a part build
  exports to STEP and glTF as an assembly's does. Only `design.build` makes it; the part builds an
  assembly runs inside itself do not, as their shapes go into the assembly's own structure.
- **Properties reach STEP.** An assembly document has `properties` of its own, templates over its
  parameters (its part number, say), evaluated into the result's `properties` and onto its node in
  the structure; a sub-assembly's go onto its node, and a part's onto its part. The STEP export
  writes each as a user-defined property of the product (AP242 user-defined attributes, which CAD
  tools show as custom properties). `partNumber`, `description`, `finish` and `unitOfMeasure` have a
  fixed meaning to the bill of materials; `revision` and `vendor` have none, as revisions and
  suppliers live outside the document; `bomTreatment` is reserved for a later minor (phantom,
  purchased, excluded) and refused until then.
- **Left for later**: closed loops of joints (a constraint solver), ball and planar joints,
  interference checks, the kinematics section of STEP AP242, and an assembly, a sketch with loops or
  a circle written as TypeScript (`toTypeScript` refuses them by name).
- **Sketches draw one outline or several.** `pen` draws one, from `start`; `loops` draws several,
  the first the outside and each further one a hole, turned to the right winding whichever way each
  is drawn, so one sketch makes a washer. A `circle` command draws an exact circle as one edge, a
  loop by itself, so an extruded disc has one side face. Command ids are distinct across a sketch's
  loops; constraints, when the solver comes, will be stored over them.
- **Operations name their faces through history.** An `operation` feature whose method has a
  `...WithHistory` twin and is given bodies runs the twin, so the faces it carries keep their names
  (a face of the block keeps `block:face` after a fillet) and the faces it makes take roles: `round`
  and `bevel` for fillets and chamfers, `side` for faces made of edges, `start` and `end`.

## The format and what stays outside it

- **The format is experimental.** `occt.design` is marked beta and its schema is published at an
  address that says so, until the format is frozen: until then a document written today is not
  migrated.
- **How versions work.** `format.ts` declares the format a runner reads, `DESIGN_FORMAT`. While it is
  experimental, documents carry `schemaVersion: 1`. Once released, they carry the version as text,
  `"1.0"`, as glTF does: a minor only adds, a writer stamps the lowest minor its document needs
  (`lowestMinor`), a runner reads every minor of its own major up to its own and refuses a newer one
  by name, and anything that changes a meaning waits for a new major with a migration. Integer `1`
  is then refused as the experimental format, so an old document is never built with a meaning the
  release changed. `scripts/gen-design-schema.mjs --check` holds the release together: the `@beta`
  tag goes with an experimental format, the schema's file with its version (`experimental.json`,
  then `v1.0.json`), and a published schema never changes (`published.json` keeps their SHA-256).
- **The JSON Schema is generated** from `lib/api/models/design/document.ts` by
  `scripts/gen-design-schema.mjs` into the package's `schemas/design-document/`, which the tarball
  ships and the release CDN publishes, where a file never changes once a release is cut. While the
  format is experimental each release's schema is its own, at
  `https://git-cdn.bitbybit.dev/v<version>/schemas/design-document/experimental.json`; a released
  format version has one address for good, `.../latest/schemas/design-document/v1.0.json`, which every
  later release carries unchanged. Editors register a copy under that address rather than fetch it.
  `check:design-schema` fails a stale one, and a test holds the checker's key lists to it. The schema also states the patterns `validate` holds strings
  to (ids, document ids as UUIDs, `#rrggbb` colours, SHA-256 hashes) and the least counts, from the
  table in the generator, which a test holds to the checker's own patterns. `validate` stays the
  authority for what a schema cannot say, such as which roles a referenced feature has. A document
  may name the schema it follows in `$schema`, which runners ignore and the version leaves out.
- **The core is strict.** An unknown property is a problem, which catches typos and invented
  fields. Every document, parameter, configuration, feature, part, material and asset may carry
  `extras` (free JSON) and `extensions` (objects under namespaced names), and `requires` lists the
  extensions a runner must understand; this runner understands none, so it refuses a document that
  requires one.
- **An operation names its kernel, and its defaults are part of the format.** An `operation`
  feature calls a public method by its dotted path with the kernel first (`"occt.fillets.filletEdges"`),
  so a document can tell what an operation of another kernel is and say that it cannot run it.
  `apis` may record the major version of each kernel's API the operations were written against
  (`{ "occt": 1 }`); a runner refuses a major it does not run, and a later major, which may rename a
  path or change a default, renames through its migration. An input a document leaves out takes the
  method's default, so a changed default changes what old documents build:
  `operation-defaults.json` holds every default an operation, a filter or a sketch command fills in,
  and its test fails until a change to one is accepted on purpose (`vitest -u`).
- **In the document:** what describes the product and follows from its geometry or parameters:
  typed parameters, configurations, suppression, parts, materials, appearance, and properties such as
  a part number written as a template over the parameters (`"BRK-{width}x{height}"`).
- **About the document, outside it:** lifecycle, approvals, change orders, effectivity, cost, price,
  stock, suppliers and routings belong to the systems that manage them. They refer to a part by its
  address: the document's `id`, a version (a content hash, or a store's version id), the part's `id`
  and the configuration's `id`.
- **Units** default to millimetres and degrees. The kernel is unitless, so geometry is built from the
  numbers as they are; masses and exports read the unit. One build is in one length unit: an
  assembly refuses a document in another, rather than scale it. A number parameter's `unit` is the
  document's length unit, `deg`, or `none` for a count or a ratio, so an editor can show it and a
  tool convert it.
- **`up` is a hint for what reads the build, not a transform.** It says which axis the numbers have
  pointing up, `y` when left out; the build never turns geometry by it, and only the document built
  reports it (`up` on the result, beside `units`): a document an assembly places is placed by its
  joints, whatever its own `up` says. The STEP export writes the numbers as they are with the length
  unit (`structure.lengthUnit`), and the glTF export takes the `up` so a y-up document is not turned
  as a z-up one would be. glTF is written in the document's unit, as every glTF export here is.

## The expression language

Every number in a document may be an expression over its parameters, and so may a configuration
value, a property template's `{...}` and a component's parameter. The grammar, loosest first:

```text
expression  = or
or          = and { "||" and }
and         = equality { "&&" equality }
equality    = comparison { ( "==" | "!=" ) comparison }
comparison  = sum { ( "<" | "<=" | ">" | ">=" ) sum }
sum         = product { ( "+" | "-" ) product }
product     = unary { ( "*" | "/" ) unary }
unary       = ( "-" | "+" | "!" ) unary | power
power       = primary [ "^" unary ]            (so -2^2 is -4, and 2^3^2 is 2^9)
primary     = number | 'text' | name | name "(" [ expression { "," expression } ] ")" | "(" expression ")"
```

- **Values** are numbers or text. Text comes from text and choice parameters or a quoted literal, and
  may only be compared with `==` and `!=` or chosen by `if`. Comparisons, `&&`, `||` and `!` give 1
  or 0, and 0 is false.
- **Names**: the parameters, `configuration` (the configuration in use) and the constants `pi`, `tau`,
  `e`, `true` (1) and `false` (0). `inf` and `nan` are reserved and have no value. None of these can
  name a parameter.
- **Functions**: `if(test, then, otherwise)`, `min` and `max` (one value or more), `abs`, `sqrt`,
  `floor`, `ceil`, `round` (halves away from zero: 2.5 to 3, -2.5 to -3), and trigonometry in degrees:
  `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2(y, x)`. An angle is folded into one turn first,
  and multiples of 30 and 45 degrees give their exact values, so `cos(90)` is 0 and `tan(45)` is 1,
  and `asin`/`acos` of those values give whole angles.
- **Every step is finite.** A step that gives infinity or not-a-number (a division by 0, `sqrt(-1)`,
  `tan(90)`) is an error where it happens, even inside a condition that would not use it.
- **Limits**: 2,000 characters, 64 levels of nesting.
- **What a string means depends on where it sits, and `{ "expr": "..." }` is the one escape.** Where
  a number or a boolean is expected (a dimension, a parameter's value, a switch such as
  `suppressed`), a string is an expression. Where text is expected (a colour, a material, a text or
  choice parameter's value in the parameter, a configuration or a component's source), a string is
  the text as written, and `{ "expr": "..." }` computes it: `"material": { "expr": "finish" }` chooses
  a material by a choice parameter. So an application never quotes the text a user types, and `validate`
  knows for each place which form it takes. Two places keep their own forms: a property's string is a
  template with `{expression}` in it, and an operation's `params` take literal values, with
  `{ "expr" }` for a computed number.
- `toTypeScript` writes expressions as TypeScript that computes the same values to the bit: it
  declares small helpers for the trigonometry and the rounding above, since JavaScript's `Math` does
  neither the same way.

## The document is the truth

- A model is a plain JSON document: `schemaVersion`, named `parameters`, and `features`, each with a
  stable `id` that is never reused.
- Parameters are numbers or arithmetic over other parameters, read by a small parser. Nothing is
  evaluated as code.
- The TypeScript types are the source of the schema; a JSON Schema is generated from them, and a chain
  of migrations opens every older `schemaVersion`.
- A whole rebuild is one call, so it costs one round trip to the worker.
- Shapes are always derived from the document, never stored in it. BREP is the format a built body is
  cached or moved in, because it keeps the shape's tree, and so the numbering of its faces and edges,
  exactly; STEP does not.

## References that survive rebuilds

A feature that acts on faces or edges (a fillet, a sketch on a face) stores a reference with three
parts:

1. **Lineage (required).** The feature that made the element and the role it made it in: the
   `start`, `end` or `side` of a sweep (a side named by the sketch command it came from), the `round`
   of a fillet, an edge a boolean `new`ly made, or an index into an imported shape. It is followed
   forward through the history of every later feature.
2. **Filter (optional).** One of the selectors in `occt.select` narrowing what the lineage yields.
3. **Count (required).** How many elements the reference expects. A mismatch is an error, never a
   guess.

**The face-name grammar.** Every build lists each face's names (`faceNames`), each written
`feature:role[:from]`, then one `@copier#index` for every pattern or mirror that copied the face, in
the order they ran: `block:end@rowX#2@gridY#1` is the end of the block in the third column of the
second row. A reference's `copy` picks copies level by level: one `{ of, index }`, or a list of them
for patterns of patterns. A level the reference does not list means the original there, which is
what a single `{ of, index }` has always meant, and `index: "all"` takes every copy at that level
with its original, so `[{ "of": "rowX", "index": "all" }, { "of": "gridY", "index": "all" }]` names an
end in every place a count parameter puts one.

**Names, never positions.** A reference names a sketch command by its id, a hole by the id of its
position (`{ "id": "left", "x": -10, "y": 0 }`), and an imported face by its index only when the asset
is pinned by its SHA-256. A command or a position without an id has no name a reference can use:
inserting a command or a position would shift every later one, and a reference by position would go
on resolving, with the right count, to a different face. Ids stay optional, so a quick sketch nothing
refers to needs none. The count is required on edge references and on the faces a shell opens; an
appearance may leave it out.

**Hints, for when names are lost.** A face reference may carry a `hint`, which tools write
(`design.withHints`, from a build with given values) and the version leaves out: the body's box,
and per face its surface type, its area as a fraction of the body's, its centre as fractions of the
box, its normal and the names of its neighbours. Edge references carry none of their own; their two
face references do. A build reads a hint only when its reference finds no face or another count
than it expects:

- **Every face of a hinted type is scored** (`hints.ts`). Where it lies gates the score: it falls
  to nothing as the face's box moves a quarter of the body away from the hinted centre, measured
  both in the body's proportions and in place, whichever is further. A face merged with others
  still covers the centre; a sibling hole or a pattern's copy elsewhere does not, nor does the copy
  a shorter pattern moves to the proportional place of a vanished one. Then the normal (0.35), the
  area (0.2) and the neighbours' names (0.45, their Jaccard overlap) weigh in. Hinted names the body
  no longer holds anywhere are left out, as no face could share them, and when it holds none of
  them, after an operation that keeps no history, the other facts share the score.
- **A reference rebinds** only when as many faces as it needs each score 0.75 or more and beat the
  best face left out by 0.1. A split under a count of one never rebinds: its pieces tie.
- **`rebind` on `design.build` decides what happens then.** `"never"`, the default for headless
  builds, fails the feature as before and lists the faces most like the hint as `repairs`, saying
  whether they stand clear. `"report"`, for editors, takes them and reports the feature `rebound`,
  naming the faces each reference took. Nothing is rebound without appearing in the report.
- **No warning for faces found by name.** A report of faces that a reference found but that look
  unlike its hint was tried on the benchmark and dropped: of its ten flags, nine were correct
  references after an ordinary change (a moved boss, a turned body, a pattern grown longer), and it
  missed the one wrong reference.

## Scripts, and outcomes the caller supplies

- **A script feature runs code the kernel does not**:
  `{ "type": "script", "script": "<asset id>", "params": { ... }, "body"?: "<id>" }`. Its code is an
  asset pinned by SHA-256, as an import's file is, so the document's version pins it, and the
  digest is part of the feature's hash. Its params pass bodies (`{ "body" }`), numbers
  (`{ "expr" }`), the indexes a face or edge reference finds (`{ "faces" }`, `{ "edges" }`), and
  values as they are written.
- **The kernel never runs it.** A build stops there: the feature is `pending`, what reads its body
  is skipped, and the result's `pending` lists it with the hash its outcome must carry and its
  inputs, bodies as new shape handles the caller owns. The caller runs the code and builds again with
  `outcomes: [{ hash, shape, roles }]`; the roles name faces as built-in features name theirs
  (`lug:top`), and every other face is `lug:face`. The design cache then keeps the outcome like any
  other, so a later build of the same inputs waits for nothing.
- **`design.buildWithScripts`** (the worker API, on the main thread) is that loop: it runs each
  script as the body of an async function given `inputs` and `occt`, the package's API reached by
  dotted path, one worker call each, and builds again until nothing waits or every script has had
  its turn. Scripts run with the rights of the page, so an application runs only the documents it trusts.
- **Why not in the kernel:** the worker runs one synchronous call at a time, and an awaiting runner
  would break its posting, cancelling and busy signal; and code a document carries runs where its
  caller decides, never inside the library.
- **`outcomes` is general:** an outcome supplied under any feature's hash, with its face `names`, is
  taken instead of making the feature, which is how a caller restores bodies it kept.
- **Only what is needed is made.** When the build holds outcomes (the cache, or `outcomes`), the
  features first run dry: their plans, hashes and reads, no shapes. Then, from the last feature back,
  a feature whose outcome only feeds outcomes the build already holds is skipped: it reports `cached`,
  keeps its hash and reads for the features after it, and its cached outcome stays kept, with its
  rebinds reported again. Every other feature is made, so a build that holds nothing makes all of
  them, and so does one that traces. A caller that kept each part's last outcome therefore rebuilds a
  document by reading those back, with nothing before them made.
- **An assembly builds its documents without their sketches**, since it hands none back.
- **Meshes a caller keeps.** Each engine's drawer hands out the meshes it made for design parts,
  by `shapeHash`, for the drawing options given (`drawHelper.keptDesignMeshes`), and takes them back
  (`drawHelper.keepDesignMeshes`), passing over anything that is not a mesh of faces and edges. With
  each part's last outcome and its mesh kept, a caller reopens a design without making or meshing
  anything.

## How well references survive: the naming benchmark

`naming-benchmark.test.ts` measures it over the test support in `__test__/`, which the build leaves
out of the package, and `npm test` runs it, printing one line:
`naming benchmark: 129 checks over 16 cases - by lineage: kept 115, lost 13, ambiguous 0, wrong 1;
with hints: kept 120, lost 8, ambiguous 0, wrong 1`.

- **The corpus** (`__test__/naming-corpus.ts`) rebuilds the classic persistent-naming failures as
  documents:
  - a pad sketched on a pad's face;
  - a face a slot splits;
  - patterns whose count changes;
  - holes added and removed;
  - sketch commands inserted, and a sketch redrawn without its ids;
  - features inserted before and reordered;
  - fillets resized;
  - mirrored copies;
  - revolved casings with a groove drawn in;
  - a slotted disk;
  - faces merged by an operation without history;
  - a pocket deepened through its body;
  - a sketch of loops;
  - a face picked by a filter that another face comes to win;
  - a drilled block turned and moved by operations that keep every face.

  Each case varies parameters or edits the document.
- **Ground truth never comes from names.** Each reference has an intent: the faces on a plane facing
  one way, the faces holding some points, the cylinders of a radius about an axis (each tested where
  its centre, pushed out square to the axis by the radius, meets its surface), or the edges between
  two such sets, found by geometry on each variation's build.
- **Each check is classified** as kept, lost, ambiguous or wrong:
  - **kept:** the reference finds exactly what was meant, or fails where it no longer exists;
  - **lost:** it fails although the face exists, or finds only part of it;
  - **ambiguous:** it finds more;
  - **wrong:** it finds something else, the case a person never sees.
- **The results are a file snapshot** (`naming-benchmark.json`), so a change in any count is a diff
  that is accepted on purpose (`vitest -u`).
- **Each check runs twice:** by lineage alone, and with hints written from the case's first variation
  in a build with `rebind: "report"`. The hints must lower lost without raising wrong.
- **What is left:** lineage loses splits under a count of one, a revolved side a groove splits, a
  merge without history and a sketch redrawn without ids; the hints recover the last two and none
  of the splits. The one wrong check is the filter, in both runs.

## History is the backbone

Every feature reports what it did to the faces, edges and vertices it was given, as
`Models.OCCT.ShapeHistory`: index lists in the numbering of `shapes.face.getFaces`,
`shapes.edge.getEdges` and `shapes.vertex.getVertices`.

- `faces`, `edges`: what each input face or edge became (itself, its pieces, or nothing).
- `facesFromFaces`, `edgesFromFaces`: what was made from each face (an offset wall, the edge where a
  boolean cut it).
- `facesFromEdges`, `facesFromVertices`, `edgesFromVertices`: what was swept or rounded from each edge
  and vertex.
- `firstFaces`, `lastFaces`: where a sweep, a loft or a feature starts and ends.

An operation over several inputs returns one history per input, in the order given
(`ShapeWithHistories`). The `*WithHistory` twins (`booleans`, `fillets`, `operations`, `features`)
are the operations a document's features call. An `operation` feature calls an operation's twin
when it has one; the transforms that move, turn, mirror or scale one shape have none and need none,
since they keep its topology as it was, so each face keeps its names. Any other operation without a
twin names every face it makes `<feature>:face`.

Where the kernel's own history is incomplete, the gap is filled from geometry or adjacency, and only
where exactly one candidate fits; a missing entry is visible, a wrong one would silently move a
reference. A feature prism stopped at a face, for one, reports neither its walls nor the faces it cut.

The naming logic is TypeScript over facts the kernel gives in bulk (histories, selectors, adjacency,
signatures): one kernel call per shape, never one per face.

## Left out on purpose

- **Two-way sync with hand-written code.** A document can be exported to readable code, one way.
- **Persistent ids from the kernel's own graph.** They count within one graph, and a rebuild makes a
  new one.
- **OCAF's TNaming re-selection.** It keeps its names in an OCAF document, recorded as each operation
  runs. A design rebuilt from a JSON document keeps no such document between builds, and its
  references have to be data in the document itself.
- **A constraint solver.** Sketches are pen commands (`occt.sketch`); a solver can later write the
  same commands.

## Sources

The naming design and the code that implements it were written for this package from the published
papers and public documentation below. No code was taken from another modelling system's naming
implementation.

- Lineage with a geometric fallback, common ground among the persistent naming methods surveyed in
  Farjana and Han, "Mechanisms of Persistent Identification of Topological Entities in CAD Systems:
  A Review", Alexandria Engineering Journal 57(4), 2018.
- Names derived from operation history: Kripac, "A mechanism for persistently naming topological
  entities in history-based parametric solid models", Computer-Aided Design 29(2), 1997; Capoyleas,
  Chen and Hoffmann, "Generic naming in generative, constraint-based design", Computer-Aided Design
  28(1), 1996 (https://doi.org/10.1016/0010-4485(95)00014-3).
- References by lineage with checked counts, and failing loudly rather than matching silently:
  Cascaval, Bodik and Schulz, "A Lineage-Based Referencing DSL for Computer-Aided Design",
  Proceedings of the ACM on Programming Languages 7 (PLDI), 2023 (https://doi.org/10.1145/3591223).
- Queries made from picks and checked by rebuilding with nudged parameters: Mathur, Pirron and
  Zufferey, "Interactive Programming for Parametric CAD", Computer Graphics Forum 39(6), 2020
  (https://doi.org/10.1111/cgf.14046).
- Long chains of references as hard for language models to reason over: Jones, Hähnlein, Zhang,
  Ahmad, Kim and Schulz, "A Solver-Aided Hierarchical Language for LLM-Driven CAD Design", Computer
  Graphics Forum, 2025 (https://doi.org/10.1111/cgf.70250, https://arxiv.org/abs/2502.09819).
- Where OCCT's history is incomplete: Open CASCADE issue 1036, "Inconsistent
  Generated/Modified/IsDeleted implementations across BRepBuilderAPI classes"
  (https://github.com/Open-Cascade-SAS/OCCT/issues/1036).
