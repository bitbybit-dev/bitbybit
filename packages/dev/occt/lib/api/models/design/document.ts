import type { SketchCommand } from "../sketch/sketch";

/**
 * A number in a design document: a number, or an expression over the document's parameters such as
 * `"width / 2 + 3"`, with `+ - * / ^`, parentheses, the functions `min max abs sqrt sin cos tan asin
 * acos atan atan2 round floor ceil` and the constant `pi`. Angles are in degrees. Comparisons
 * (`< <= > >= == !=`) and `&&`, `||` and `!` give 1 or 0, `if(condition, a, b)` chooses, and quoted
 * text such as `'steel'` compares with text and choice parameters.
 */
export type DesignNumber = number | string;

/**
 * An expression where text is expected, such as `{ "expr": "if(heavy, 'steel', 'aluminium')" }`:
 * where a value is text (a colour, a material, a text or choice parameter's value), a string is
 * taken as it is written, and this is how text is computed instead.
 */
export interface DesignExpression {
    expr: string;
}

/**
 * Text in a design document: a string taken as it is written, or `{ "expr": "..." }` for text an
 * expression over the document's parameters computes.
 */
export type DesignText = string | DesignExpression;

/**
 * Data a document carries for other tools: `extras` is free JSON nothing reads, and `extensions`
 * holds objects under namespaced names such as `"acme.costing"`, which a runner ignores unless the
 * document lists the name in `requires`.
 */
export interface DesignExtensible {
    extras?: unknown;
    extensions?: Record<string, unknown>;
}

/**
 * Text shown to people: one string, or one per language by locale code, such as
 * `{ "en": "Width", "de": "Breite" }`.
 */
export type DesignLabel = string | Record<string, string>;

/**
 * One option of a choice parameter: its `value`, which expressions compare with, and its `label`.
 */
export interface DesignChoiceOption {
    value: string;
    label?: DesignLabel;
}

/**
 * A parameter with its kind and limits. `type` is `number` (the default, `value` a number or an
 * expression), `boolean`, `choice` (`value` one of `options`) or `text` (`value` taken as it is). A
 * choice or text value may be `{ "expr": "..." }`, computed from other parameters.
 * `min`, `max` and `options` are enforced on every value a build uses; `unit`, `step`, `label`,
 * `description` and `group` are for the people and tools that edit it. A number parameter's `unit`
 * is the document's length unit, `deg`, or `none` for a count or a ratio.
 */
export interface DesignParameter extends DesignExtensible {
    value: DesignNumber | boolean | DesignExpression;
    type?: "number" | "boolean" | "choice" | "text";
    unit?: "mm" | "cm" | "m" | "in" | "deg" | "none";
    min?: number;
    max?: number;
    step?: number;
    options?: DesignChoiceOption[];
    label?: DesignLabel;
    description?: DesignLabel;
    group?: string;
}

/**
 * A named set of parameter values, such as one size of a product: each value replaces the
 * parameter's own and is read the same way. A build picks one by `id`; expressions read the chosen id
 * as `configuration`.
 */
export interface DesignConfiguration extends DesignExtensible {
    id: string;
    name?: DesignLabel;
    values: Record<string, DesignNumber | boolean | DesignExpression>;
}

/**
 * What every feature may carry besides its own fields: a display `name`, and `suppressed`, which
 * leaves the feature out when true or when its expression is not 0. A suppressed feature that
 * changes a body leaves the body as it was; one that makes a body or a sketch makes none.
 */
export interface DesignFeatureBase extends DesignExtensible {
    id: string;
    name?: string;
    suppressed?: boolean | DesignNumber;
}

/**
 * A point or a vector in a design document, each coordinate a number or an expression.
 */
export type DesignPoint = [DesignNumber, DesignNumber, DesignNumber];

/**
 * A type with every number in it allowed to be an expression instead.
 */
export type DesignExpressions<T> = T extends number
    ? DesignNumber
    : T extends object
        ? { [K in keyof T]: DesignExpressions<T[K]> }
        : T;

/**
 * An exact circle, drawn as one closed edge around `centre`, in the sketch's coordinates, with
 * `radius`. It is a loop by itself, so it is the only command of its pen or loop.
 */
export interface DesignCircleCommand {
    type: "circle";
    id?: string;
    centre: [DesignNumber, DesignNumber];
    radius: DesignNumber;
}

/**
 * A pen command of a sketch feature: a `sketch.pen` command whose numbers may be expressions, or a
 * `circle`.
 */
export type DesignPenCommand = DesignExpressions<SketchCommand> | DesignCircleCommand;

/**
 * One closed outline of a sketch that draws several: where its pen starts and its commands.
 */
export interface DesignLoop {
    start?: [DesignNumber, DesignNumber];
    pen: DesignPenCommand[];
}

/**
 * A coordinate frame: `origin`, the `normal` it faces along and the in-plane `direction` its x axis
 * runs along.
 */
export interface DesignFrame {
    origin: DesignPoint;
    normal: DesignPoint;
    direction: DesignPoint;
}

/**
 * A selector applied to the faces or edges a reference's lineage found: `select` names a
 * `select.faces` or `select.edges` method (`facing`, `extreme`, `ofType`, `nearest`, `bySize` and
 * the others) and the other properties are its inputs, without `shape` and `indexes`.
 */
export interface DesignFilter {
    select: string;
    [input: string]: unknown;
}

/**
 * Which copy a pattern or a mirror made, at one level of copying: the copier's id and the copy's
 * `index` from 1, or `"all"` for every copy and the original.
 */
export interface DesignCopy {
    of: string;
    index: number | "all";
}

/**
 * Faces named by the feature that made them: `of` is that feature's id, `role` what the feature made
 * them as (`start`, `end`, `side`, `round`, `bevel`, `new`, `face`, `inner`, `rim`, `wall`), and
 * `from` the sketch command a side was swept from (`"<sketch id>.<command id>"`), the id of a hole's
 * position, or an imported face's index as text, such as `"2"`. `copy` picks copies a pattern or a
 * mirror made: one `{ of, index }`, or a list with one per level when patterns copy copies; a level
 * the reference does not list means the original there. `filter` narrows what the lineage found and
 * `count`, when given, is how many faces it must leave. `hint`, which tools write and the version
 * leaves out, records what the faces were like, so a build can find them again by likeness when
 * their names are lost.
 */
export interface DesignFaceReference {
    of: string;
    role: string;
    from?: string;
    copy?: DesignCopy | DesignCopy[];
    filter?: DesignFilter;
    count?: number;
    hint?: DesignReferenceHint;
}

/**
 * What a reference's faces were like when a tool last resolved it (`design.withHints`): the body's
 * bounding `box` then, and one entry per face. A build reads it only to find the faces again by
 * likeness when their names are lost.
 */
export interface DesignReferenceHint {
    v: 1;
    box: DesignHintBox;
    faces: DesignFaceHint[];
}

/**
 * A body's bounding box when a hint was written, by its least and greatest corners.
 */
export interface DesignHintBox {
    min: [number, number, number];
    max: [number, number, number];
}

/**
 * One face as a hint records it: its surface `type`, its `area` as a fraction of the body's, its
 * `centre` as fractions of the body's bounding box, its unit `normal`, and the names of the faces next
 * to it, sorted. Fractions keep a hint true when the body grows or shrinks with its parameters.
 */
export interface DesignFaceHint {
    type: string;
    area: number;
    centre: [number, number, number];
    normal: [number, number, number];
    neighbours: string[];
}

/**
 * Edges named by the two sets of faces they lie between, narrowed by `filter` and checked against
 * `count`.
 */
export interface DesignEdgeReference {
    between: [DesignFaceReference, DesignFaceReference];
    filter?: DesignFilter;
    count: number;
}

/**
 * How a feature that makes a solid joins the body it names: added to it, cut from it, or
 * intersected with it.
 */
export type DesignJoin = "add" | "cut" | "intersect";

/**
 * Where a sketch lies: on one of the three planes through the origin, moved `offset` along its
 * normal; on a frame; or on a planar face of a body, placed as a connector is: at `origin`, or the
 * document's origin, met square on with the face's plane, with its x axis along `direction`, which a
 * face facing along a world axis may leave out.
 */
export type DesignSketchPlacement =
    | { plane: "XY" | "XZ" | "YZ"; offset?: DesignNumber }
    | { frame: DesignFrame }
    | { face: DesignFaceReference; origin?: DesignPoint; direction?: DesignPoint };

/**
 * A sketch: pen commands on a placement, or `loops`, several closed outlines making one face, the
 * first its outside and each further one a hole in it, such as a washer or a plate with cut-outs. An
 * outline is closed when it ends with `close` or back at its start; a closed outline is made a face
 * unless `face` is false, and an open one stays a wire. Each command's `id`, distinct across the
 * sketch's loops, names the sides a later feature sweeps from it.
 */
export interface DesignSketchFeature extends DesignFeatureBase {
    type: "sketch";
    on: DesignSketchPlacement;
    start?: [DesignNumber, DesignNumber];
    pen?: DesignPenCommand[];
    loops?: DesignLoop[];
    face?: boolean;
}

/**
 * Sweeps a sketch's face `distance` along its normal, or along `direction`. Without `body` it starts
 * a body named by its id; with `body` it joins that body as `join` says, adding by default. Its
 * faces are named `start`, `end` and `side` (from each sketch command).
 */
export interface DesignExtrudeFeature extends DesignFeatureBase {
    type: "extrude";
    profile: string;
    distance: DesignNumber;
    direction?: DesignPoint;
    body?: string;
    join?: DesignJoin;
}

/**
 * Turns a sketch's face `angle` degrees (360 by default) about `axis`. Bodies and joins as for
 * `extrude`; its faces are named `start`, `end` (none on a whole turn) and `side`.
 */
export interface DesignRevolveFeature extends DesignFeatureBase {
    type: "revolve";
    profile: string;
    axis: { origin: DesignPoint; direction: DesignPoint };
    angle?: DesignNumber;
    body?: string;
    join?: DesignJoin;
}

/**
 * Combines bodies: `body` goes on as the union, the difference or the intersection with `tools`,
 * which are used up. Faces no input owned are named `new`.
 */
export interface DesignBooleanFeature extends DesignFeatureBase {
    type: "boolean";
    operation: "union" | "difference" | "intersection";
    body: string;
    tools: string[];
}

/**
 * Rounds the edges `edges` names on `body`; the rounds are named `round`.
 */
export interface DesignFilletFeature extends DesignFeatureBase {
    type: "fillet";
    body: string;
    edges: DesignEdgeReference;
    radius: DesignNumber;
}

/**
 * Bevels the edges `edges` names on `body`; the bevels are named `bevel`.
 */
export interface DesignChamferFeature extends DesignFeatureBase {
    type: "chamfer";
    body: string;
    edges: DesignEdgeReference;
    distance: DesignNumber;
}

/**
 * Repeats `body` `count` times, the original included, `spacing` apart along `direction`, and
 * fuses the copies. Copy `i` (from 1) keeps its faces' names, picked with `copy`.
 */
export interface DesignLinearPatternFeature extends DesignFeatureBase {
    type: "linearPattern";
    body: string;
    direction: DesignPoint;
    spacing: DesignNumber;
    count: DesignNumber;
}

/**
 * Repeats `body` `count` times, the original included, turned evenly through `angle` degrees (360
 * by default) about `axis`, and fuses the copies. Copies are picked with `copy`, as for
 * `linearPattern`.
 */
export interface DesignPolarPatternFeature extends DesignFeatureBase {
    type: "polarPattern";
    body: string;
    axis: { origin: DesignPoint; direction: DesignPoint };
    count: DesignNumber;
    angle?: DesignNumber;
}

/**
 * Mirrors `body` across the plane through `origin` facing `normal` and fuses the mirror image with
 * it, unless `keepOriginal` is false. The image is copy 1.
 */
export interface DesignMirrorFeature extends DesignFeatureBase {
    type: "mirror";
    body: string;
    plane: { origin: DesignPoint; normal: DesignPoint };
    keepOriginal?: boolean;
}

/**
 * Moves `body` as one rigid piece: it turns `rotate` degrees about X, then Y, then Z, each about an
 * axis through `pivot` (the origin when it is left out), and then shifts by `translate`. The body
 * keeps its faces and their names, so references made before the move still find them.
 */
export interface DesignTransformFeature extends DesignFeatureBase {
    type: "transform";
    body: string;
    translate?: DesignPoint;
    rotate?: DesignPoint;
    pivot?: DesignPoint;
}

/**
 * Pushes or pulls one flat face of `body` along its normal by `distance`: out of the body when it is
 * above 0, into it when it is below. The moved face keeps its names and is also named `end`; the
 * faces it sweeps out are named `side`.
 */
export interface DesignPushPullFeature extends DesignFeatureBase {
    type: "pushPull";
    body: string;
    face: DesignFaceReference;
    distance: DesignNumber;
}

/**
 * Sweeps a sketch's outline along the outline of the sketch `path`, which should start where the
 * profile lies and cross it. Bodies and joins as for `extrude`; its faces are named `start`, `end`
 * and `side` (from each profile command).
 */
export interface DesignSweepFeature extends DesignFeatureBase {
    type: "sweep";
    profile: string;
    path: string;
    body?: string;
    join?: DesignJoin;
}

/**
 * Skins a surface through two or more sketches in order, closed into a solid unless `solid` is
 * false. Bodies and joins as for `extrude`; its faces are named `start` (on the first profile),
 * `end` (on the last) and `side` (from each profile's commands).
 */
export interface DesignLoftFeature extends DesignFeatureBase {
    type: "loft";
    profiles: string[];
    solid?: boolean;
    body?: string;
    join?: DesignJoin;
}

/**
 * Hollows `body` into walls `thickness` thick, inward, or outward when it is negative, leaving open
 * the faces `open` names. The open faces become the `rim` and the walls offset from the others are
 * named `inner`.
 */
export interface DesignShellFeature extends DesignFeatureBase {
    type: "shell";
    body: string;
    thickness: DesignNumber;
    open: DesignFaceReference;
}

/**
 * A hole's position on its face with the `id` a reference names its walls by: x and y as a sketch on
 * the face reads them.
 */
export interface DesignHolePosition {
    id: string;
    x: DesignNumber;
    y: DesignNumber;
}

/**
 * Drills holes into `body` through the flat face `on` names, at the points `at`, which are x and y
 * on that face as a sketch on it reads them (`origin` and `direction` as for a sketch on a face).
 * `depth` 0, the default, drills through; `tipAngle` gives the bottom a drill point. A `counterbore`
 * or a `countersink` widens each mouth. Every hole's faces are named `wall`, and a hole whose
 * position has an id, as `{ "id": "left", "x": -10, "y": 0 }`, also `wall` with that id, which a
 * reference names it by; a position is never named by where it comes in `at`.
 */
export interface DesignHoleFeature extends DesignFeatureBase {
    type: "hole";
    body: string;
    on: DesignFaceReference;
    origin?: DesignPoint;
    direction?: DesignPoint;
    at: (DesignHolePosition | [DesignNumber, DesignNumber])[];
    diameter: DesignNumber;
    depth?: DesignNumber;
    tipAngle?: DesignNumber;
    counterbore?: { diameter: DesignNumber; depth: DesignNumber };
    countersink?: { diameter: DesignNumber; angle: DesignNumber };
}

/**
 * Raises a sketch drawn on a face of `body` out of that face: `distance` along the sketch's normal,
 * or `until` the face a reference names. Its walls are named `side` (from each sketch command) and
 * its top `end`.
 */
export interface DesignBossFeature extends DesignFeatureBase {
    type: "boss";
    profile: string;
    body: string;
    distance?: DesignNumber;
    until?: DesignFaceReference;
}

/**
 * Sinks a sketch drawn on a face of `body` into it: `distance` deep, `until` the face a reference
 * names, or `through` the whole body. Its walls are named `side` (from each sketch command) and its
 * floor `end`.
 */
export interface DesignPocketFeature extends DesignFeatureBase {
    type: "pocket";
    profile: string;
    body: string;
    distance?: DesignNumber;
    until?: DesignFaceReference;
    through?: boolean;
}

/**
 * Starts a body from one of the document's `assets`: BREP as text (`brep`) or binary
 * (`brep-binary`), STEP or IGES, read from the media type or the file extension when `format` is
 * left out. The shape is taken as the file has it. Its faces are named `face`, and `face` with
 * their index from 0.
 */
export interface DesignImportFeature extends DesignFeatureBase {
    type: "import";
    asset: string;
    format?: "brep" | "brep-binary" | "step" | "iges";
}

/**
 * Runs any operation of this package by its dotted path with the kernel first, such as
 * `"occt.operations.offset"`, with `params` as its inputs. In `params`, `{ "body": "<id>" }` passes a
 * body's shape and `{ "expr": "<expression>" }` a number. With `body` the result goes on as that
 * body, otherwise it starts a body named by the feature's id. An operation with a history twin
 * (`...WithHistory`) given bodies keeps the names of the faces it carries through, and names the
 * faces it makes of edges `round` (a fillet), `bevel` (a chamfer) or `side`, and its first and last
 * faces `start` and `end`; every other face is named `face`. An operation that makes a list of
 * shapes, such as `occt.shapes.face.subdivideToHexagonHoles`, makes their compound.
 */
export interface DesignOperationFeature extends DesignFeatureBase {
    type: "operation";
    operation: string;
    params: Record<string, unknown>;
    body?: string;
}

/**
 * Runs a script on the document's geometry: the code of the asset `script` names, pinned by its
 * SHA-256, takes `params` as an operation does (`{ "body": "<id>" }` passes a body's shape and
 * `{ "expr": "<expression>" }` a number), and `{ "faces": <face reference> }` and
 * `{ "edges": <edge reference> }` pass the indexes a reference finds on the body it names. It
 * returns a shape and the roles its faces take, such as `{ shape, roles: { tooth: [3, 4] } }`, which
 * name those faces as other features' roles do; every other face is named `face`. With `body` the
 * result goes on as that body, otherwise it starts a body named by the feature's id. A kernel runs
 * no code: a build lists the feature under `pending`, and the caller that runs the script builds
 * again with its outcome.
 */
export interface DesignScriptFeature extends DesignFeatureBase {
    type: "script";
    script: string;
    params?: Record<string, unknown>;
    body?: string;
}

/**
 * One feature of a design document.
 */
export type DesignFeature =
    | DesignSketchFeature
    | DesignExtrudeFeature
    | DesignRevolveFeature
    | DesignBooleanFeature
    | DesignFilletFeature
    | DesignChamferFeature
    | DesignLinearPatternFeature
    | DesignPolarPatternFeature
    | DesignMirrorFeature
    | DesignTransformFeature
    | DesignPushPullFeature
    | DesignSweepFeature
    | DesignLoftFeature
    | DesignShellFeature
    | DesignHoleFeature
    | DesignBossFeature
    | DesignPocketFeature
    | DesignImportFeature
    | DesignOperationFeature
    | DesignScriptFeature;

/**
 * How a part or a material looks: `color` as `#rrggbb`, and `metallic`, `roughness` and `opacity`
 * from 0 to 1. `emissive` is the colour the surface gives off, as `#rrggbb`, and `emissiveStrength`
 * how strongly, from 0, 1 when left out. `edgeColor` is the colour of its edges as `#rrggbb`. A colour
 * may be `{ "expr": "..." }`, computed from the parameters. On a part, `faces` colours the faces a
 * reference names and `edges` the edges one names, so the colour follows them through rebuilds; a
 * material has neither, since it has no body to name them on.
 */
export interface DesignAppearance {
    color?: DesignText;
    metallic?: DesignNumber;
    roughness?: DesignNumber;
    opacity?: DesignNumber;
    emissive?: DesignText;
    emissiveStrength?: DesignNumber;
    edgeColor?: DesignText;
    faces?: DesignFaceAppearance[];
    edges?: DesignEdgeAppearance[];
}

/**
 * The colour of the edges a reference names, as `#rrggbb`, over the edge colour of their part.
 */
export interface DesignEdgeAppearance {
    edges: DesignEdgeReference;
    color?: DesignText;
}

/**
 * How the faces a reference names look, over the appearance of their part.
 */
export interface DesignFaceAppearance {
    faces: DesignFaceReference;
    color?: DesignText;
    metallic?: DesignNumber;
    roughness?: DesignNumber;
    opacity?: DesignNumber;
    emissive?: DesignText;
    emissiveStrength?: DesignNumber;
}

/**
 * A value of a property: text, in which each `{expression}` is replaced by its value (`{{` and `}}`
 * write braces), a number, a boolean, or `{ "expr": "..." }` for a computed number.
 */
export type DesignPropertyValue = string | number | boolean | DesignExpression;

/**
 * Properties of a part, a material or an assembly by name. The names `partNumber`, `description`,
 * `finish` and `unitOfMeasure` mean what they say to the bill of materials, and the STEP export
 * writes every property of a part or an assembly as a user-defined property of its product.
 * `bomTreatment` is reserved for a later version of the format. Any other name is free, and a dotted
 * prefix such as `acme.costCentre` keeps a tool's names apart; revisions and suppliers belong to the
 * systems that manage them.
 */
export type DesignProperties = Record<string, DesignPropertyValue>;

/**
 * A material: what it is made of, as a bill of materials and the mass need it. `density` is in
 * kilograms per cubic metre; `standard` names the grade, such as `EN AW-6061`.
 */
export interface DesignMaterial extends DesignExtensible {
    id: string;
    name?: string;
    density?: DesignNumber;
    standard?: string;
    appearance?: DesignAppearance;
    properties?: DesignProperties;
}

/**
 * A product the document makes: the body it is, under a stable `id` that renaming keeps, with its
 * material, appearance and properties. A body no part names is construction geometry. `material` is
 * the id of one of the document's materials, or `{ "expr": "..." }` that gives one, so a parameter
 * can choose it.
 */
export interface DesignPart extends DesignExtensible {
    id: string;
    name?: string;
    body: string;
    material?: DesignText;
    appearance?: DesignAppearance;
    properties?: DesignProperties;
    connectors?: DesignConnector[];
}

/**
 * A named frame on a part, where an assembly fastens it to another: on the one flat face `on` names,
 * facing out of it, with its x axis along `direction` laid into the face. Its origin is where
 * `origin`, or the document's origin when it is left out, meets the face's plane square on, so it
 * stays on the face when a parameter moves the face; or where the axis of the cylindrical face
 * `axis` names crosses the face, such as a hole's wall; or the centre of the circular edge `centre`
 * names, met square on. An `axis` that names the walls of a hole with no `from` makes a set: one
 * connector per position of the hole, named `<id>.<position id>`, which a component's `replicate`
 * places on. `direction` may be left out on a face facing along a world axis (it is then X, or Y on a
 * face facing along X), and is needed on any other. It follows the face through rebuilds as
 * references do.
 */
export interface DesignConnector extends DesignExtensible {
    id: string;
    on: DesignFaceReference;
    origin?: DesignPoint;
    axis?: DesignFaceReference;
    centre?: DesignEdgeReference;
    direction?: DesignPoint;
}

/**
 * A file the document uses, such as a STEP model it imports: where it is, `uri` relative to the
 * document's own location in the store that keeps it (an absolute URL is allowed), and the SHA-256
 * of its bytes, which an asset an import reads must carry, so the document's version pins the
 * geometry it reads and a changed file is refused. `mediaType` names the format; for OCCT's BREP it
 * records the format version, such as `model/vnd.occt.brep; version=3`.
 */
export interface DesignAsset extends DesignExtensible {
    id: string;
    uri: string;
    sha256?: string;
    mediaType?: string;
}

/**
 * The units the document's numbers are in. Geometry is built from the numbers as they are; exports
 * and masses read the units. Angles are in degrees. Every document an assembly places is in the
 * assembly's length unit, so one build is in one unit.
 */
export interface DesignUnits {
    length?: "mm" | "cm" | "m" | "in";
    angle?: "deg";
}

/**
 * What the document is and who made it, outside its version. `revision` is the id the store that
 * keeps the document gave this revision of it, which a component may pin as its source's `version`.
 */
export interface DesignMeta {
    name?: string;
    description?: string;
    authors?: string[];
    license?: string;
    generator?: string;
    revision?: string;
}

/**
 * The major version of each kernel API a document's `operation` features were written against, by
 * kernel name. Left out, the operations mean what the runner's own API version gives them.
 */
export interface DesignApis {
    occt?: 1;
}

/**
 * A parametric part model as data: named `parameters` and `configurations`, an ordered list of
 * `features` that build bodies, and the `parts` they are (every body that is not used up, when left
 * out). `id` is a UUID that stays with the document for life; `units` default to millimetres and
 * `up` to `y`; `apis` records the kernel API its operations were written against.
 */
export interface DesignPartDocument extends DesignExtensible {
    $schema?: string;
    schemaVersion: 1;
    kind?: "part";
    id?: string;
    units?: DesignUnits;
    up?: "y" | "z";
    meta?: DesignMeta;
    requires?: string[];
    apis?: DesignApis;
    parameters?: Record<string, DesignNumber | boolean | DesignParameter>;
    configurations?: DesignConfiguration[];
    features: DesignFeature[];
    parts?: DesignPart[];
    materials?: DesignMaterial[];
    assets?: DesignAsset[];
}

/**
 * Where a component comes from: the `id` of a document given to the build beside this one, the
 * `part` of it when it is a part document (an assembly document is placed whole), its
 * `configuration`, and `parameters` replacing its values, each read by the kind of parameter it
 * sets: for a number or boolean parameter, a number, a boolean or an expression over this assembly's
 * parameters; for a text or choice parameter, text as it is written, or `{ "expr": "..." }` for text
 * this assembly's parameters compute. `version`, when given, pins the source: the document's
 * version (`design.versionOf`, the SHA-256 of its canonical JSON without what only editors and tools
 * read) or the store revision in its `meta.revision`. A document with other contents is refused, and
 * when several versions of one document are given, a component without a `version` is refused too.
 */
export interface DesignComponentSource {
    document: string;
    version?: string;
    part?: string;
    configuration?: string;
    parameters?: Record<string, DesignNumber | boolean | DesignExpression>;
}

/**
 * Which of a joint's `angle` and `offset` may move: none for `fastened`, the angle for `revolute`,
 * the offset for `slider`, and both for `cylindrical`. A value that may not move is still applied.
 */
export type DesignJointType = "fastened" | "revolute" | "slider" | "cylindrical";

/**
 * How far the values a joint lets move may go, each as `[least, most]`: the angle in degrees and
 * the offset in the document's length unit. A value outside its limits is refused.
 */
export interface DesignJointLimits {
    angle?: [DesignNumber, DesignNumber];
    offset?: [DesignNumber, DesignNumber];
}

/**
 * A joint of an assembly: it places `component` by one of its `connector`s against a connector of
 * another component or against a `frame`, the two faces meeting and facing each other with their x
 * axes along each other. `flip` makes them face the same way, `angle` turns the component about the
 * shared axis in degrees, and `offset` moves it along that axis, away from the face it meets. The
 * `type` says which of the two may move, within `limits`. A part component's connectors are its
 * part's; a sub-assembly's are the ones its document publishes.
 */
export interface DesignJoint extends DesignExtensible {
    id: string;
    type: DesignJointType;
    component: string;
    connector: string;
    to: { component: string; connector: string } | { frame: DesignFrame };
    flip?: boolean;
    angle?: DesignNumber;
    offset?: DesignNumber;
    limits?: DesignJointLimits;
}

/**
 * How a component is placed once on every member of a connector set: its own `connector` fastened,
 * as a fastened joint would, to each connector of the set `to.connector` names on `to.component`,
 * such as a bolt on every hole of a flange, with the joint's `flip`, `angle` and `offset`. A
 * `to.connector` that names one connector places one occurrence.
 */
export interface DesignReplicate {
    connector: string;
    to: { component: string; connector: string };
    flip?: boolean;
    angle?: DesignNumber;
    offset?: DesignNumber;
}

/**
 * One placed occurrence of a part or of another assembly: its `source`, and where it goes, `at` a
 * frame (its own origin, X and Z axes moved onto the frame's origin, direction and normal), by the
 * joint that moves it, or where its source has it when neither places it. `replicate` places it
 * instead once on every member of a connector set, each occurrence named `<id>.<member>` and
 * counted in the bill of materials. `suppressed` leaves it out, and `properties` describe this
 * occurrence, such as a position code.
 */
export interface DesignComponent extends DesignExtensible {
    id: string;
    name?: string;
    source: DesignComponentSource;
    at?: DesignFrame;
    replicate?: DesignReplicate;
    suppressed?: boolean | DesignNumber;
    properties?: DesignProperties;
}

/**
 * An assembly as data: named `parameters` and `configurations`, the `components` that place parts
 * and other assemblies, each built from a document given to the build with values this assembly's
 * parameters can drive, the `joints` that place them against each other, and the `connectors` it
 * publishes for the assemblies that place it, and its own `properties`, such as its part number,
 * evaluated over its parameters. Each component is moved by at most one joint, and joints form no
 * closed loop.
 */
export interface DesignAssemblyDocument extends DesignExtensible {
    $schema?: string;
    schemaVersion: 1;
    kind: "assembly";
    id?: string;
    units?: DesignUnits;
    up?: "y" | "z";
    meta?: DesignMeta;
    requires?: string[];
    parameters?: Record<string, DesignNumber | boolean | DesignParameter>;
    configurations?: DesignConfiguration[];
    components: DesignComponent[];
    joints?: DesignJoint[];
    connectors?: DesignAssemblyConnector[];
    properties?: DesignProperties;
}

/**
 * A connector an assembly publishes, so an assembly that places it can join it and join to it:
 * under its own `id`, the `connector` of one of its `component`s, which may be a connector another
 * sub-assembly publishes. Only published connectors are seen from outside, so the components inside
 * can change without breaking the assemblies that use it.
 */
export interface DesignAssemblyConnector extends DesignExtensible {
    id: string;
    component: string;
    connector: string;
}

/**
 * A design document: a part document, which builds parts from features, or an assembly document,
 * which places parts and other assemblies.
 */
export type DesignDocument = DesignPartDocument | DesignAssemblyDocument;
