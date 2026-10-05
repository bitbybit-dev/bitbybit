import type * as Models from "../../api/models";
import type { DtoRegistry } from "@bitbybit-dev/base";
import { isRecord, unknownProperties } from "@bitbybit-dev/base";
import { namesIn } from "./expressions";
import { OPERATION_API_MAJOR, OPERATION_KERNEL, operationPathOf, versionProblem } from "./format";
import { holePositionIds, setHoleOf } from "./connectors";
import { DesignProblem, pointer } from "./problems";
import { checkIdList, checkKeys, checkLabel, checkObject, checkText } from "./structure";
import { isExpressionObject, parameterTypeOf, parameterValues, parsed, templatePieces } from "./values";
import { DIMENSIONS } from "./constants";

const FEATURE_ID = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const COLOR = /^#[0-9a-fA-F]{6}$/;

/** The patterns the checker holds ids, document ids, colours and hashes to, which the published schema states too. */
export const PATTERNS = { name: /^[A-Za-z_][A-Za-z0-9_-]*$/.source, uuid: UUID.source, color: COLOR.source, sha256: SHA256.source };

const FACE_SELECTORS = ["ofType", "facing", "extreme", "inBox", "inSphere", "nearest", "onPlane", "bySize", "byRadius", "adjacentTo", "ofEdges", "sortAlong"];
const EDGE_SELECTORS = ["ofType", "along", "extreme", "inBox", "inSphere", "nearest", "onPlane", "byLength", "byRadius", "ofFaces", "tangentChain", "convex", "concave", "sortAlong"];

/** The selectors a reference's `filter` may name, for faces and for edges. */
export const SELECTORS = { faces: FACE_SELECTORS, edges: EDGE_SELECTORS };

const JOINS = ["add", "cut", "intersect"];

const RESERVED_PROPERTIES = ["bomTreatment"];
const COPYING_FEATURES = ["linearPattern", "polarPattern", "mirror"];

/** The properties of the document and of each kind of object in it, besides `extras` and `extensions`. */
export const DOCUMENT_KEYS = {
    document: ["$schema", "schemaVersion", "kind", "id", "units", "up", "meta", "requires", "apis", "parameters", "configurations", "features", "parts", "materials", "assets"],
    units: ["length", "angle"],
    meta: ["name", "description", "authors", "license", "generator", "revision"],
    configuration: ["id", "name", "values"],
    feature: ["id", "type", "name", "suppressed"],
    faceReference: ["of", "role", "from", "copy", "filter", "count", "hint"],
    copy: ["of", "index"],
    edgeReference: ["between", "filter", "count"],
    counterbore: ["diameter", "depth"],
    countersink: ["diameter", "angle"],
    axis: ["origin", "direction"],
    plane: ["origin", "normal"],
    frame: ["origin", "normal", "direction"],
    part: ["id", "name", "body", "material", "appearance", "properties", "connectors"],
    connector: ["id", "on", "origin", "axis", "centre", "direction"],
    assembly: ["$schema", "schemaVersion", "kind", "id", "units", "up", "meta", "requires", "parameters", "configurations", "components", "joints", "connectors", "properties"],
    assemblyConnector: ["id", "component", "connector"],
    component: ["id", "name", "source", "at", "replicate", "suppressed", "properties"],
    replicate: ["connector", "to", "flip", "angle", "offset"],
    source: ["document", "version", "part", "configuration", "parameters"],
    joint: ["id", "type", "component", "connector", "to", "flip", "angle", "offset", "limits"],
    jointLimits: ["angle", "offset"],
    material: ["id", "name", "density", "standard", "appearance", "properties"],
    appearance: ["color", "metallic", "roughness", "opacity", "emissive", "emissiveStrength", "edgeColor", "faces", "edges"],
    faceAppearance: ["faces", "color", "metallic", "roughness", "opacity", "emissive", "emissiveStrength"],
    edgeAppearance: ["edges", "color"],
    asset: ["id", "uri", "sha256", "mediaType"],
};

/** The properties each feature type adds to the ones every feature has. */
export const FEATURE_KEYS: Record<Models.OCCT.DesignFeature["type"], readonly string[]> = {
    sketch: ["on", "start", "pen", "loops", "face"],
    extrude: ["profile", "distance", "direction", "body", "join"],
    revolve: ["profile", "axis", "angle", "body", "join"],
    boolean: ["operation", "body", "tools"],
    fillet: ["body", "edges", "radius"],
    chamfer: ["body", "edges", "distance"],
    linearPattern: ["body", "direction", "spacing", "count"],
    polarPattern: ["body", "axis", "count", "angle"],
    mirror: ["body", "plane", "keepOriginal"],
    transform: ["body", "translate", "rotate", "pivot"],
    pushPull: ["body", "face", "distance"],
    sweep: ["profile", "path", "body", "join"],
    loft: ["profiles", "solid", "body", "join"],
    shell: ["body", "thickness", "open"],
    hole: ["body", "on", "origin", "direction", "at", "diameter", "depth", "tipAngle", "counterbore", "countersink"],
    boss: ["profile", "body", "distance", "until"],
    pocket: ["profile", "body", "distance", "until", "through"],
    import: ["asset", "format"],
    operation: ["operation", "params", "body"],
    script: ["script", "params", "body"],
};

/** The feature types that start a body when they name none to join. */
export const BODY_STARTERS: readonly string[] = ["extrude", "revolve", "sweep", "loft", "operation", "script"];

/** What the check knows of the document before the value it reads. */
export interface Known {
    features: Map<string, string>;
    sketches: Map<string, Set<string>>;
    bodies: Set<string>;
    parameters: Set<string>;
    materials: Set<string>;
    assets: Set<string>;
    pinnedAssets: Set<string>;
    holePositions: Map<string, Set<string>>;
    faceSketches: Set<string>;
    registry: DtoRegistry;
    operations: ReadonlySet<string>;
}

export type Check = (value: unknown, path: string, known: Known) => void;

function inputsOf(known: Known, path: string): string[] | undefined {
    const entry = known.registry[path];
    return entry?.constraints === undefined ? undefined : Object.keys(entry.constraints);
}

export const checkNumber: Check = (value, path, known) => {
    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            throw new DesignProblem(path, "the value is not a finite number");
        }
        return;
    }
    if (typeof value !== "string") {
        throw new DesignProblem(path, "a number or an expression is expected");
    }
    checkNames(parsed(value, path), path, known);
};

function checkNames(tree: ReturnType<typeof parsed>, path: string, known: Known): void {
    for (const name of namesIn(tree)) {
        if (!known.parameters.has(name)) {
            throw new DesignProblem(path, `"${name}" is not a parameter of this document`);
        }
    }
}

export const checkSwitch: Check = (value, path, known) => {
    if (typeof value !== "boolean") {
        checkNumber(value, path, known);
    }
};

export const checkPoint: Check = (value, path, known) => {
    if (!Array.isArray(value) || value.length !== DIMENSIONS) {
        throw new DesignProblem(path, "a point or vector is three numbers or expressions");
    }
    value.forEach((coordinate, index) => checkNumber(coordinate, pointer(path, index), known));
};

const checkBody: Check = (value, path, known) => {
    if (typeof value !== "string" || !known.bodies.has(value)) {
        throw new DesignProblem(path, `${JSON.stringify(value)} is not a body made by an earlier feature, or it was used up`);
    }
};

const checkProfile: Check = (value, path, known) => {
    if (typeof value !== "string" || !known.sketches.has(value)) {
        throw new DesignProblem(path, `${JSON.stringify(value)} is not a sketch made by an earlier feature`);
    }
};

function framed(keys: readonly string[], what: string): Check {
    return (value, path, known) => {
        checkObject(value, keys, path, false, what);
        keys.forEach(key => checkPoint((value as Record<string, unknown>)[key], pointer(path, key), known));
    };
}

const checkAxis = framed(DOCUMENT_KEYS.axis, "an axis { origin, direction }");
const checkPlane = framed(DOCUMENT_KEYS.plane, "a plane { origin, normal }");
export const checkFrame = framed(DOCUMENT_KEYS.frame, "a frame { origin, normal, direction }");

function checkFilter(value: unknown, path: string, kind: "faces" | "edges", known: Known): void {
    const selectors = SELECTORS[kind];
    if (!isRecord(value) || typeof value["select"] !== "string" || !selectors.includes(value["select"])) {
        throw new DesignProblem(path, `a filter is { select, ...inputs } with select one of ${selectors.join(", ")}`);
    }
    const inputs = inputsOf(known, `select.${kind}.${value["select"]}`);
    if (inputs !== undefined) {
        checkKeys(value, ["select", ...inputs.filter(input => input !== "shape" && input !== "indexes")], path, false);
    }
}

function checkCount(value: unknown, path: string, required: boolean): void {
    if (value === undefined && !required) {
        return;
    }
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
        throw new DesignProblem(path, "a count is a whole number of at least 1");
    }
}

const WHOLE_NUMBER = /^(0|[1-9][0-9]*)$/;

const NAME_ID = /^[A-Za-z_][A-Za-z0-9_-]*$/;

function checkFrom(from: unknown, of: string, path: string, known: Known): void {
    const type = known.features.get(of);
    if (type === "hole") {
        const ids = known.holePositions.get(of) ?? new Set<string>();
        if (typeof from !== "string" || !ids.has(from)) {
            throw new DesignProblem(path, typeof from === "string" && WHOLE_NUMBER.test(from)
                ? `a hole is named by the id of its position, not by where it comes in "at": give it one, as { "id": "left", "x": ..., "y": ... }`
                : `${JSON.stringify(from)} is not the id of a position of "${of}"`);
        }
        return;
    }
    if (type === "import") {
        if (typeof from !== "string" || !WHOLE_NUMBER.test(from)) {
            throw new DesignProblem(path, `${JSON.stringify(from)} is not the index of a face as text, such as "2"`);
        }
        return;
    }
    const pieces = typeof from === "string" ? from.split(".") : [];
    const [sketch, command] = pieces;
    if (pieces.length === 2 && sketch !== undefined && command !== undefined && known.sketches.has(sketch) && WHOLE_NUMBER.test(command) && !known.sketches.get(sketch)!.has(command)) {
        throw new DesignProblem(path, `commands are named by their id, not by their position: give command ${command} of "${sketch}" an id`);
    }
    if (pieces.length !== 2 || sketch === undefined || command === undefined || !known.sketches.get(sketch)?.has(command)) {
        throw new DesignProblem(path, `${JSON.stringify(from)} is not "<sketch>.<command id>" of an earlier sketch`);
    }
}

export const checkFaces: Check = (value, path, known) => {
    const reference = checkObject(value, DOCUMENT_KEYS.faceReference, path, false, "a face reference { of, role, from?, copy?, filter?, count? }");
    const of = reference["of"];
    if (typeof of !== "string" || !known.features.has(of)) {
        throw new DesignProblem(pointer(path, "of"), `${JSON.stringify(of)} is not an earlier feature`);
    }
    if (typeof reference["role"] !== "string" || reference["role"] === "") {
        throw new DesignProblem(pointer(path, "role"), "a role is a name such as start, end, side or round");
    }
    const from = reference["from"];
    if (from !== undefined) {
        checkFrom(from, of, pointer(path, "from"), known);
    }
    const copy = reference["copy"];
    if (copy !== undefined) {
        const copyPath = pointer(path, "copy");
        const levels = Array.isArray(copy) ? copy : [copy];
        if (levels.length === 0) {
            throw new DesignProblem(copyPath, "copy is { of, index } or a list of them, one per level");
        }
        const copiers = new Set<string>();
        levels.forEach((level, index) => {
            const levelPath = Array.isArray(copy) ? pointer(copyPath, index) : copyPath;
            const checked = checkObject(level, DOCUMENT_KEYS.copy, levelPath, false, "a copy { of, index }");
            const at = checked["index"];
            const of = checked["of"];
            if (typeof of !== "string" || !COPYING_FEATURES.includes(known.features.get(of) ?? "") || !(at === "all" || (typeof at === "number" && Number.isInteger(at) && at >= 1))) {
                throw new DesignProblem(levelPath, "a copy is { of: <pattern or mirror id>, index: 1 or more, or \"all\" }");
            }
            if (copiers.has(of)) {
                throw new DesignProblem(levelPath, `"${of}" is listed twice: give each level once`);
            }
            copiers.add(of);
        });
    }
    if (reference["filter"] !== undefined) {
        checkFilter(reference["filter"], pointer(path, "filter"), "faces", known);
    }
    checkCount(reference["count"], pointer(path, "count"), false);
    if (reference["hint"] !== undefined) {
        checkHint(reference["hint"], pointer(path, "hint"));
    }
};

const isFinite3 = (value: unknown): value is [number, number, number] => Array.isArray(value) && value.length === DIMENSIONS && value.every(item => typeof item === "number" && Number.isFinite(item));

function checkHint(value: unknown, path: string): void {
    const hint = checkObject(value, ["v", "box", "faces"], path, false, "a hint { v: 1, box, faces }");
    if (hint["v"] !== 1) {
        throw new DesignProblem(pointer(path, "v"), "this runner reads hints of version 1");
    }
    const box = checkObject(hint["box"], ["min", "max"], pointer(path, "box"), false, "a box { min, max }");
    const least = box["min"];
    const most = box["max"];
    if (!isFinite3(least) || !isFinite3(most) || least.some((value, axis) => value > most[axis]!)) {
        throw new DesignProblem(pointer(path, "box"), "a box has a least and a greatest corner of three numbers each");
    }
    const faces = hint["faces"];
    if (!Array.isArray(faces) || faces.length === 0) {
        throw new DesignProblem(pointer(path, "faces"), "faces lists what each face was like, one entry per face");
    }
    faces.forEach((face: unknown, index) => {
        const facePath = pointer(path, "faces", index);
        const checked = checkObject(face, ["type", "area", "centre", "normal", "neighbours"], facePath, false, "a face hint { type, area, centre, normal, neighbours }");
        const area = checked["area"];
        const neighbours = checked["neighbours"];
        if (typeof checked["type"] !== "string" || typeof area !== "number" || !(area >= 0 && area <= 1) || !isFinite3(checked["centre"]) || !isFinite3(checked["normal"])
            || !Array.isArray(neighbours) || !neighbours.every(name => typeof name === "string")) {
            throw new DesignProblem(facePath, "a face hint has a surface type, an area from 0 to 1, a centre and a normal of three numbers, and the names of its neighbours");
        }
    });
}

const checkEdges: Check = (value, path, known) => {
    const between = isRecord(value) ? value["between"] : undefined;
    if (!isRecord(value) || !Array.isArray(between) || between.length !== 2) {
        throw new DesignProblem(path, "an edge reference is { between: [faces, faces], filter?, count }");
    }
    checkKeys(value, DOCUMENT_KEYS.edgeReference, path, false);
    checkFaces(between[0], pointer(path, "between", 0), known);
    checkFaces(between[1], pointer(path, "between", 1), known);
    if (value["filter"] !== undefined) {
        checkFilter(value["filter"], pointer(path, "filter"), "edges", known);
    }
    checkCount(value["count"], pointer(path, "count"), true);
};

const checkPlacement: Check = (value, path, known) => {
    if (!isRecord(value)) {
        throw new DesignProblem(path, "a sketch is placed { plane }, { frame } or { face }");
    }
    if ("plane" in value) {
        checkKeys(value, ["plane", "offset"], path, false);
        if (!["XY", "XZ", "YZ"].includes(value["plane"] as string)) {
            throw new DesignProblem(pointer(path, "plane"), "a plane is XY, XZ or YZ");
        }
        if (value["offset"] !== undefined) {
            checkNumber(value["offset"], pointer(path, "offset"), known);
        }
    } else if ("frame" in value) {
        checkKeys(value, ["frame"], path, false);
        checkFrame(value["frame"], pointer(path, "frame"), known);
    } else if ("face" in value) {
        checkKeys(value, ["face", "origin", "direction"], path, false);
        checkFaces(value["face"], pointer(path, "face"), known);
        for (const key of ["origin", "direction"]) {
            if (value[key] !== undefined) {
                checkPoint(value[key], pointer(path, key), known);
            }
        }
    } else {
        throw new DesignProblem(path, "a sketch is placed { plane }, { frame } or { face }");
    }
};

const CIRCLE_KEYS = ["id", "centre", "radius"];

function checkPen(value: unknown, path: string, known: Known, ids = new Set<string>()): Set<string> {
    if (!Array.isArray(value) || value.length === 0) {
        throw new DesignProblem(path, "pen is a list of sketch commands");
    }
    value.forEach((command, index) => {
        const commandPath = pointer(path, index);
        if (!isRecord(command) || typeof command["type"] !== "string") {
            throw new DesignProblem(commandPath, "a pen command is an object with a type");
        }
        if (command["type"] === "circle" && value.length > 1) {
            throw new DesignProblem(commandPath, "a circle is a loop by itself: give it a pen or a loop of its own");
        }
        const inputs = command["type"] === "circle" ? CIRCLE_KEYS : inputsOf(known, `sketch.commands.${command["type"]}`);
        if (inputs === undefined) {
            throw new DesignProblem(pointer(commandPath, "type"), `${JSON.stringify(command["type"])} is not a sketch command`);
        }
        checkKeys(command, ["type", ...inputs], commandPath, false);
        const id = command["id"];
        if (id !== undefined && id !== "") {
            if (typeof id !== "string" || !NAME_ID.test(id) || ids.has(id)) {
                throw new DesignProblem(pointer(commandPath, "id"), "command ids are distinct, start with a letter or _ and hold letters, digits, _ and -");
            }
            ids.add(id);
        }
        for (const [key, inner] of Object.entries(command)) {
            if (key !== "type" && key !== "id") {
                checkNumbersIn(inner, pointer(commandPath, key), known);
            }
        }
    });
    return ids;
}

function checkLoops(feature: Record<string, unknown>, path: string, known: Known): Set<string> {
    for (const key of ["pen", "start"]) {
        if (feature[key] !== undefined) {
            throw new DesignProblem(pointer(path, key), `a sketch draws with pen or with loops: give ${key} inside each loop`);
        }
    }
    if (feature["face"] === false) {
        throw new DesignProblem(pointer(path, "face"), "loops are the outline and the holes of one face, so a sketch with loops is a face");
    }
    const loops = feature["loops"];
    if (!Array.isArray(loops) || loops.length === 0) {
        throw new DesignProblem(pointer(path, "loops"), "loops is a list of { start?, pen }, the outline first and then its holes");
    }
    const ids = new Set<string>();
    loops.forEach((value: unknown, index) => {
        const loopPath = pointer(path, "loops", index);
        const loop = checkObject(value, ["start", "pen"], loopPath, false, "a loop { start?, pen }");
        if (loop["start"] !== undefined) {
            checkNumbersIn(loop["start"], pointer(loopPath, "start"), known);
        }
        checkPen(loop["pen"], pointer(loopPath, "pen"), known, ids);
    });
    return ids;
}

function checkNumbersIn(value: unknown, path: string, known: Known): void {
    if (typeof value === "number" || typeof value === "string") {
        checkNumber(value, path, known);
    } else if (Array.isArray(value)) {
        value.forEach((inner, index) => checkNumbersIn(inner, pointer(path, index), known));
    } else if (isRecord(value)) {
        Object.entries(value).forEach(([key, inner]) => checkNumbersIn(inner, pointer(path, key), known));
    }
}

function optional(check: Check): Check {
    return (value, path, known) => {
        if (value !== undefined) {
            check(value, path, known);
        }
    };
}

export function oneOf(values: readonly string[], optionalValue: boolean): (value: unknown, path: string) => void {
    return (value, path) => {
        if (value === undefined && optionalValue) {
            return;
        }
        if (typeof value !== "string" || !values.includes(value)) {
            throw new DesignProblem(path, `one of ${values.join(", ")} is expected`);
        }
    };
}

export const checkBoolean = (value: unknown, path: string): void => {
    if (typeof value !== "boolean") {
        throw new DesignProblem(path, "true or false is expected");
    }
};

const checkProfiles: Check = (value, path, known) => {
    if (!Array.isArray(value) || value.length < 2) {
        throw new DesignProblem(path, "profiles is a list of two or more sketches");
    }
    value.forEach((profile, index) => checkProfile(profile, pointer(path, index), known));
};

const checkFaceProfile: Check = (value, path, known) => {
    checkProfile(value, path, known);
    if (!known.faceSketches.has(value as string)) {
        throw new DesignProblem(path, `${JSON.stringify(value)} is not a sketch on a face: a boss or a pocket starts from one`);
    }
};


function positionIds(value: unknown): Set<string> {
    return new Set((Array.isArray(value) ? value : []).flatMap(position => isRecord(position) && typeof position["id"] === "string" ? [position["id"]] : []));
}

const checkPositions: Check = (value, path, known) => {
    if (!Array.isArray(value) || value.length === 0) {
        throw new DesignProblem(path, "at is a list of positions, [x, y] or { id, x, y }");
    }
    const ids = new Set<string>();
    value.forEach((position, index) => {
        const at = pointer(path, index);
        if (isRecord(position)) {
            checkKeys(position, ["id", "x", "y"], at, false);
            const id = position["id"];
            if (typeof id !== "string" || !NAME_ID.test(id) || ids.has(id)) {
                throw new DesignProblem(pointer(at, "id"), "a position's id is distinct, starts with a letter or _ and holds letters, digits, _ and -");
            }
            ids.add(id);
            checkNumber(position["x"], pointer(at, "x"), known);
            checkNumber(position["y"], pointer(at, "y"), known);
            return;
        }
        if (!Array.isArray(position) || position.length !== 2) {
            throw new DesignProblem(at, "a position is [x, y] or { id, x, y }");
        }
        position.forEach((coordinate, axis) => checkNumber(coordinate, pointer(at, axis), known));
    });
};

const checkCountedFaces: Check = (value, path, known) => {
    checkFaces(value, path, known);
    checkCount(isRecord(value) ? value["count"] : undefined, pointer(path, "count"), true);
};

function sized(keys: readonly string[], what: string): Check {
    return (value, path, known) => {
        const checked = checkObject(value, keys, path, false, what);
        keys.forEach(key => checkNumber(checked[key], pointer(path, key), known));
    };
}

const checkAsset: Check = (value, path, known) => {
    if (typeof value !== "string" || !known.assets.has(value)) {
        throw new DesignProblem(path, `${JSON.stringify(value)} is not one of the document's assets`);
    }
};

function checkExtent(feature: Record<string, unknown>, path: string, kinds: readonly string[]): void {
    const given = kinds.filter(kind => feature[kind] !== undefined);
    if (given.length !== 1) {
        throw new DesignProblem(path, `give exactly one of ${kinds.join(", ")}`);
    }
}

const FIELDS: Record<Exclude<Models.OCCT.DesignFeature["type"], "sketch">, Record<string, Check>> = {
    extrude: { profile: checkProfile, distance: checkNumber, direction: optional(checkPoint), body: optional(checkBody), join: oneOf(JOINS, true) },
    revolve: { profile: checkProfile, axis: checkAxis, angle: optional(checkNumber), body: optional(checkBody), join: oneOf(JOINS, true) },
    boolean: { operation: oneOf(["union", "difference", "intersection"], false), body: checkBody },
    fillet: { body: checkBody, edges: checkEdges, radius: checkNumber },
    chamfer: { body: checkBody, edges: checkEdges, distance: checkNumber },
    linearPattern: { body: checkBody, direction: checkPoint, spacing: checkNumber, count: checkNumber },
    polarPattern: { body: checkBody, axis: checkAxis, count: checkNumber, angle: optional(checkNumber) },
    mirror: { body: checkBody, plane: checkPlane, keepOriginal: optional(checkBoolean) },
    transform: { body: checkBody, translate: optional(checkPoint), rotate: optional(checkPoint), pivot: optional(checkPoint) },
    pushPull: { body: checkBody, face: checkFaces, distance: checkNumber },
    sweep: { profile: checkProfile, path: checkProfile, body: optional(checkBody), join: oneOf(JOINS, true) },
    loft: { profiles: checkProfiles, solid: optional(checkBoolean), body: optional(checkBody), join: oneOf(JOINS, true) },
    shell: { body: checkBody, thickness: checkNumber, open: checkCountedFaces },
    hole: {
        body: checkBody, on: checkFaces, origin: optional(checkPoint), direction: optional(checkPoint), at: checkPositions, diameter: checkNumber,
        depth: optional(checkNumber), tipAngle: optional(checkNumber),
        counterbore: optional(sized(DOCUMENT_KEYS.counterbore, "a counterbore { diameter, depth }")), countersink: optional(sized(DOCUMENT_KEYS.countersink, "a countersink { diameter, angle }")),
    },
    boss: { profile: checkFaceProfile, body: checkBody, distance: optional(checkNumber), until: optional(checkFaces) },
    pocket: { profile: checkFaceProfile, body: checkBody, distance: optional(checkNumber), until: optional(checkFaces), through: optional(checkBoolean) },
    import: { asset: checkAsset, format: oneOf(["brep", "brep-binary", "step", "iges"], true) },
    operation: { body: optional(checkBody) },
    script: { script: checkAsset, body: optional(checkBody) },
};

function isFeatureType(type: unknown): type is Models.OCCT.DesignFeature["type"] {
    return typeof type === "string" && Object.prototype.hasOwnProperty.call(FEATURE_KEYS, type);
}

function checkFeature(feature: unknown, path: string, known: Known): void {
    if (!isRecord(feature)) {
        throw new DesignProblem(path, "a feature is an object with an id and a type");
    }
    const id = feature["id"];
    if (typeof id !== "string" || !FEATURE_ID.test(id)) {
        throw new DesignProblem(pointer(path, "id"), "an id starts with a letter or _ and holds letters, digits, _ and -");
    }
    if (known.features.has(id)) {
        throw new DesignProblem(pointer(path, "id"), `"${id}" is the id of an earlier feature`);
    }
    const type = feature["type"];
    if (!isFeatureType(type)) {
        throw new DesignProblem(pointer(path, "type"), `${JSON.stringify(type)} is not a feature type: ${Object.keys(FEATURE_KEYS).join(", ")}`);
    }
    if (type === "sketch" && feature["closed"] !== undefined) {
        throw new DesignProblem(pointer(path, "closed"), "a sketch's `closed` is now `face`: the pen's `close` command closes the outline, and `face` false keeps a closed outline a wire");
    }
    checkKeys(feature, [...DOCUMENT_KEYS.feature, ...FEATURE_KEYS[type]], path, true);
    if (feature["name"] !== undefined) {
        checkText(feature["name"], pointer(path, "name"), "a name");
    }
    if (feature["suppressed"] !== undefined) {
        checkSwitch(feature["suppressed"], pointer(path, "suppressed"), known);
    }
    if (type === "sketch") {
        checkPlacement(feature["on"], pointer(path, "on"), known);
        if (feature["start"] !== undefined) {
            checkNumbersIn(feature["start"], pointer(path, "start"), known);
        }
        if (feature["face"] !== undefined) {
            checkBoolean(feature["face"], pointer(path, "face"));
        }
        const drawsNothing = feature["loops"] === undefined && (feature["pen"] === undefined || (Array.isArray(feature["pen"]) && feature["pen"].length === 0));
        known.sketches.set(id, drawsNothing ? new Set() : feature["loops"] === undefined ? checkPen(feature["pen"], pointer(path, "pen"), known) : checkLoops(feature, path, known));
        if (isRecord(feature["on"]) && "face" in feature["on"]) {
            known.faceSketches.add(id);
        }
        known.features.set(id, type);
        return;
    }
    for (const [field, check] of Object.entries(FIELDS[type])) {
        check(feature[field], pointer(path, field), known);
    }
    if (type === "boss" || type === "pocket") {
        checkExtent(feature, path, type === "boss" ? ["distance", "until"] : ["distance", "until", "through"]);
    }
    if (type === "hole" && feature["counterbore"] !== undefined && feature["countersink"] !== undefined) {
        throw new DesignProblem(pointer(path, "countersink"), "a hole has a counterbore or a countersink, not both");
    }
    if (type === "hole") {
        known.holePositions.set(id, positionIds(feature["at"]));
    }
    if (type === "import" && typeof feature["asset"] === "string" && known.assets.has(feature["asset"]) && !known.pinnedAssets.has(feature["asset"])) {
        throw new DesignProblem(pointer(path, "asset"), `the asset "${feature["asset"]}" an import reads needs its sha256, so the document's version pins the geometry it reads`);
    }
    if (type === "script" && typeof feature["script"] === "string" && known.assets.has(feature["script"]) && !known.pinnedAssets.has(feature["script"])) {
        throw new DesignProblem(pointer(path, "script"), `the asset "${feature["script"]}" a script runs needs its sha256, so the document's version pins the code it runs`);
    }
    if (type === "script" && feature["params"] !== undefined) {
        if (!isRecord(feature["params"])) {
            throw new DesignProblem(pointer(path, "params"), "params is an object of the script's inputs");
        }
        checkScriptParams(feature["params"], pointer(path, "params"), known);
    }
    if (type === "boolean") {
        const tools = feature["tools"];
        if (!Array.isArray(tools) || tools.length === 0) {
            throw new DesignProblem(pointer(path, "tools"), "tools is a list of bodies");
        }
        tools.forEach((tool, index) => {
            checkBody(tool, pointer(path, "tools", index), known);
            if (tool === feature["body"] || tools.indexOf(tool) !== index) {
                throw new DesignProblem(pointer(path, "tools", index), "a tool is another body, named once");
            }
        });
        tools.forEach(tool => known.bodies.delete(tool as string));
    }
    if (type === "operation") {
        checkOperation(feature, path, known);
    }
    if ((BODY_STARTERS.includes(type) && feature["body"] === undefined) || type === "import") {
        known.bodies.add(id);
    }
    known.features.set(id, type);
}

function checkOperation(feature: Record<string, unknown>, path: string, known: Known): void {
    const operation = feature["operation"];
    const operationPath = operationPathOf(operation);
    if (operationPath === undefined || !known.operations.has(operationPath)) {
        const kernel = typeof operation === "string" ? operation.split(".")[0] : undefined;
        throw new DesignProblem(pointer(path, "operation"), typeof operation === "string" && known.operations.has(operation)
            ? `operation paths name their kernel: write "${OPERATION_KERNEL}.${operation}"`
            : kernel === "manifold" || kernel === "jscad"
                ? `this runner runs ${OPERATION_KERNEL} operations, not ${kernel} ones`
                : `${JSON.stringify(operation)} is not an operation of this package`);
    }
    const params = feature["params"];
    if (!isRecord(params)) {
        throw new DesignProblem(pointer(path, "params"), "params is an object of the operation's inputs");
    }
    const unknown = unknownProperties(known.registry, operationPath, params)[0];
    if (unknown !== undefined) {
        throw new DesignProblem(pointer(path, "params", unknown), `"${unknown}" is not an input of ${String(operation)}`);
    }
    checkOperationParams(params, pointer(path, "params"), known);
}

function checkOperationParams(value: unknown, path: string, known: Known): void {
    if (Array.isArray(value)) {
        value.forEach((inner, index) => checkOperationParams(inner, pointer(path, index), known));
        return;
    }
    if (!isRecord(value)) {
        return;
    }
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === "body") {
        checkBody(value["body"], pointer(path, "body"), known);
        return;
    }
    if (keys.length === 1 && keys[0] === "expr") {
        checkNumber(value["expr"], pointer(path, "expr"), known);
        return;
    }
    Object.entries(value).forEach(([key, inner]) => checkOperationParams(inner, pointer(path, key), known));
}

function checkScriptParams(value: unknown, path: string, known: Known): void {
    if (isRecord(value) && Object.keys(value).length === 1 && "faces" in value) {
        checkFaces(value["faces"], pointer(path, "faces"), known);
        return;
    }
    if (isRecord(value) && Object.keys(value).length === 1 && "edges" in value) {
        checkEdges(value["edges"], pointer(path, "edges"), known);
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((inner, index) => checkScriptParams(inner, pointer(path, index), known));
        return;
    }
    if (isRecord(value) && !(Object.keys(value).length === 1 && ("body" in value || "expr" in value))) {
        Object.entries(value).forEach(([key, inner]) => checkScriptParams(inner, pointer(path, key), known));
        return;
    }
    checkOperationParams(value, path, known);
}

function takeAsMade(feature: unknown, known: Known): void {
    if (!isRecord(feature) || typeof feature["id"] !== "string" || known.features.has(feature["id"])) {
        return;
    }
    const id = feature["id"];
    const type = feature["type"];
    known.features.set(id, String(type));
    if (type === "sketch") {
        const loops: unknown[] = Array.isArray(feature["loops"]) ? feature["loops"] : [];
        const pens = [feature["pen"], ...loops.map(loop => isRecord(loop) ? loop["pen"] : undefined)];
        const commands: unknown[] = pens.flatMap(pen => Array.isArray(pen) ? pen : []);
        known.sketches.set(id, new Set(commands.flatMap(command => isRecord(command) && typeof command["id"] === "string" && command["id"] !== "" ? [command["id"]] : [])));
        if (isRecord(feature["on"]) && "face" in feature["on"]) {
            known.faceSketches.add(id);
        }
    } else if ((BODY_STARTERS.includes(String(type)) && feature["body"] === undefined) || type === "import") {
        known.bodies.add(id);
    } else if (type === "hole") {
        known.holePositions.set(id, positionIds(feature["at"]));
    } else if (type === "boolean" && Array.isArray(feature["tools"])) {
        feature["tools"].filter(tool => tool !== feature["body"]).forEach(tool => known.bodies.delete(String(tool)));
    }
}

/** Checks what every document starts with: its version, its properties, its kind, id, units, up axis, meta, the extensions it requires and the kernel APIs its operations were written against. */
export function checkHeader(document: Record<string, unknown>, record: (run: () => void) => void, keys: readonly string[] = DOCUMENT_KEYS.document, kind: "part" | "assembly" = "part"): void {
    record(() => {
        const problem = versionProblem(document["schemaVersion"]);
        if (problem !== undefined) {
            throw new DesignProblem("/schemaVersion", problem);
        }
    });
    record(() => checkKeys(document, keys, "", true));
    record(() => {
        if (document["$schema"] !== undefined) {
            checkText(document["$schema"], "/$schema", "$schema, the address of the schema the document follows,");
        }
    });
    record(() => oneOf([kind], kind === "part")(document["kind"], "/kind"));
    record(() => {
        if (document["id"] !== undefined && (typeof document["id"] !== "string" || !UUID.test(document["id"]))) {
            throw new DesignProblem("/id", "a document id is a UUID, such as 3f2c9a1e-5b7d-4e8f-9a0b-1c2d3e4f5a6b");
        }
    });
    record(() => {
        if (document["units"] !== undefined) {
            const units = checkObject(document["units"], DOCUMENT_KEYS.units, "/units", false, "units");
            oneOf(["mm", "cm", "m", "in"], true)(units["length"], "/units/length");
            oneOf(["deg"], true)(units["angle"], "/units/angle");
        }
    });
    record(() => oneOf(["y", "z"], true)(document["up"], "/up"));
    record(() => {
        if (document["meta"] !== undefined) {
            const meta = checkObject(document["meta"], DOCUMENT_KEYS.meta, "/meta", false, "meta");
            for (const key of ["name", "description", "license", "generator", "revision"]) {
                if (meta[key] !== undefined) {
                    checkText(meta[key], pointer("/meta", key), key);
                }
            }
            const authors = meta["authors"];
            if (authors !== undefined && (!Array.isArray(authors) || !authors.every(author => typeof author === "string"))) {
                throw new DesignProblem("/meta/authors", "authors is a list of names");
            }
        }
    });
    record(() => {
        const requires = document["requires"];
        if (requires === undefined) {
            return;
        }
        if (!Array.isArray(requires)) {
            throw new DesignProblem("/requires", "requires is a list of extension names");
        }
        if (requires.length > 0) {
            throw new DesignProblem("/requires/0", `this runner supports no extensions, so it cannot build a document that requires ${JSON.stringify(requires[0])}`);
        }
    });
    record(() => checkApis(document["apis"]));
}

function checkApis(apis: unknown): void {
    if (apis === undefined) {
        return;
    }
    if (!isRecord(apis)) {
        throw new DesignProblem("/apis", `apis names the API version each kernel's operations were written against, such as { "${OPERATION_KERNEL}": ${OPERATION_API_MAJOR} }`);
    }
    for (const [kernel, major] of Object.entries(apis)) {
        const path = pointer("/apis", kernel);
        if (kernel !== OPERATION_KERNEL) {
            throw new DesignProblem(path, `this runner runs ${OPERATION_KERNEL} operations, not ${kernel} ones`);
        }
        if (typeof major !== "number" || !Number.isInteger(major) || major < 1) {
            throw new DesignProblem(path, `an API version is a whole number, such as ${OPERATION_API_MAJOR}`);
        }
        if (major !== OPERATION_API_MAJOR) {
            throw new DesignProblem(path, `the operations were written against ${kernel} API ${major}; this runner runs ${kernel} API ${OPERATION_API_MAJOR}`);
        }
    }
}

/** A document's length unit as it states it, millimetres when it states none. */
export function lengthUnitOf(document: Readonly<Record<string, unknown>>): string {
    const units = document["units"];
    return isRecord(units) && typeof units["length"] === "string" ? units["length"] : "mm";
}

function checkParameterUnit(declared: unknown, path: string, lengthUnit: string): void {
    if (!isRecord(declared) || typeof declared["unit"] !== "string") {
        return;
    }
    if (parameterTypeOf(declared) !== "number") {
        throw new DesignProblem(path, "a unit is for number parameters");
    }
    if (![lengthUnit, "deg", "none"].includes(declared["unit"])) {
        throw new DesignProblem(path, `a parameter's unit is ${lengthUnit}, the document's length unit, deg or none`);
    }
}

export function checkParameters(document: Record<string, unknown>, known: Known, record: (run: () => void) => void): void {
    record(() => parameterValues(document["parameters"], document["configurations"], {}).forEach((_, name) => known.parameters.add(name)));
    Object.keys(isRecord(document["parameters"]) ? document["parameters"] : {}).forEach(name => known.parameters.add(name));
    Object.entries(isRecord(document["parameters"]) ? document["parameters"] : {}).forEach(([name, declared]) => record(() => checkParameterUnit(declared, pointer("/parameters", name, "unit"), lengthUnitOf(document))));
    known.parameters.add("configuration");
    const configurations = document["configurations"];
    if (configurations === undefined) {
        return;
    }
    record(() => {
        checkIdList(configurations, "/configurations", "configurations").forEach((configuration, index) => {
            const path = pointer("/configurations", index);
            checkKeys(configuration, DOCUMENT_KEYS.configuration, path, true);
            if (configuration["name"] !== undefined) {
                checkLabel(configuration["name"], pointer(path, "name"));
            }
            parameterValues(document["parameters"], configurations, { configuration: String(configuration["id"]) });
        });
    });
}

export function checkProperties(value: unknown, path: string, known: Known): void {
    if (value === undefined) {
        return;
    }
    if (!isRecord(value)) {
        throw new DesignProblem(path, "properties is an object of named values");
    }
    for (const [name, property] of Object.entries(value)) {
        const propertyPath = pointer(path, name);
        if (RESERVED_PROPERTIES.includes(name)) {
            throw new DesignProblem(propertyPath, `"${name}" is reserved for a later version of the format`);
        }
        if (typeof property === "string") {
            templatePieces(property, propertyPath).forEach(piece => {
                if ("expression" in piece) {
                    checkNames(parsed(piece.expression, propertyPath), propertyPath, known);
                }
            });
        } else if (isRecord(property) && Object.keys(property).length === 1 && "expr" in property) {
            checkNumber(property["expr"], pointer(propertyPath, "expr"), known);
        } else if (typeof property !== "boolean") {
            checkNumber(property, propertyPath, known);
        }
    }
}

function checkLook(value: Record<string, unknown>, path: string, known: Known): void {
    checkColor(value["color"], pointer(path, "color"), known);
    checkColor(value["emissive"], pointer(path, "emissive"), known);
    for (const key of ["metallic", "roughness", "opacity", "emissiveStrength"]) {
        if (value[key] !== undefined) {
            checkNumber(value[key], pointer(path, key), known);
        }
    }
}

function checkColor(value: unknown, path: string, known: Known): void {
    if (isExpressionObject(value)) {
        checkTextExpression(value.expr, pointer(path, "expr"), known);
    } else if (value !== undefined && (typeof value !== "string" || !COLOR.test(value))) {
        throw new DesignProblem(path, "a colour is #rrggbb or { expr }");
    }
}

function checkTextExpression(text: string, path: string, known: Known): void {
    checkNames(parsed(text, path), path, known);
}

function checkAppearance(value: unknown, path: string, known: Known, onBody: boolean): void {
    if (value === undefined) {
        return;
    }
    const appearance = checkObject(value, onBody ? DOCUMENT_KEYS.appearance : DOCUMENT_KEYS.appearance.filter(key => key !== "faces" && key !== "edges"), path, false, "an appearance");
    checkLook(appearance, path, known);
    checkColor(appearance["edgeColor"], pointer(path, "edgeColor"), known);
    const faces = appearance["faces"];
    if (faces !== undefined && !Array.isArray(faces)) {
        throw new DesignProblem(pointer(path, "faces"), "faces is a list of { faces, color?, ... }");
    }
    (faces ?? []).forEach((entry: unknown, index: number) => {
        const entryPath = pointer(path, "faces", index);
        const faceAppearance = checkObject(entry, DOCUMENT_KEYS.faceAppearance, entryPath, false, "a face appearance");
        checkFaces(faceAppearance["faces"], pointer(entryPath, "faces"), known);
        checkLook(faceAppearance, entryPath, known);
    });
    const edges = appearance["edges"];
    if (edges !== undefined && !Array.isArray(edges)) {
        throw new DesignProblem(pointer(path, "edges"), "edges is a list of { edges, color? }");
    }
    (edges ?? []).forEach((entry: unknown, index: number) => {
        const entryPath = pointer(path, "edges", index);
        const edgeAppearance = checkObject(entry, DOCUMENT_KEYS.edgeAppearance, entryPath, false, "an edge appearance");
        checkEdges(edgeAppearance["edges"], pointer(entryPath, "edges"), known);
        checkColor(edgeAppearance["color"], pointer(entryPath, "color"), known);
    });
}

function checkMaterials(document: Record<string, unknown>, known: Known, record: (run: () => void) => void): void {
    if (document["materials"] === undefined) {
        return;
    }
    record(() => checkIdList(document["materials"], "/materials", "materials").forEach(material => known.materials.add(String(material["id"]))));
    (Array.isArray(document["materials"]) ? document["materials"] : []).forEach((material: unknown, index) => record(() => {
        const path = pointer("/materials", index);
        const checked = checkObject(material, DOCUMENT_KEYS.material, path, true, "a material");
        for (const key of ["name", "standard"]) {
            if (checked[key] !== undefined) {
                checkText(checked[key], pointer(path, key), key);
            }
        }
        if (checked["density"] !== undefined) {
            checkNumber(checked["density"], pointer(path, "density"), known);
        }
        checkAppearance(checked["appearance"], pointer(path, "appearance"), known, false);
        checkProperties(checked["properties"], pointer(path, "properties"), known);
    }));
}

function checkAssets(document: Record<string, unknown>, known: Known, record: (run: () => void) => void): void {
    if (document["assets"] === undefined) {
        return;
    }
    (Array.isArray(document["assets"]) ? document["assets"] : []).forEach((asset: unknown) => {
        if (isRecord(asset) && typeof asset["id"] === "string") {
            known.assets.add(asset["id"]);
            if (asset["sha256"] !== undefined) {
                known.pinnedAssets.add(asset["id"]);
            }
        }
    });
    record(() => checkIdList(document["assets"], "/assets", "assets").forEach((asset, index) => {
        const path = pointer("/assets", index);
        checkKeys(asset, DOCUMENT_KEYS.asset, path, true);
        checkText(asset["uri"], pointer(path, "uri"), "a uri");
        if (asset["sha256"] !== undefined && (typeof asset["sha256"] !== "string" || !SHA256.test(asset["sha256"]))) {
            throw new DesignProblem(pointer(path, "sha256"), "a SHA-256 is 64 lower-case hexadecimal digits");
        }
        if (asset["mediaType"] !== undefined) {
            checkText(asset["mediaType"], pointer(path, "mediaType"), "a media type");
        }
    }));
}

function checkParts(document: Record<string, unknown>, known: Known, record: (run: () => void) => void): void {
    if (document["parts"] === undefined) {
        return;
    }
    record(() => checkIdList(document["parts"], "/parts", "parts"));
    (Array.isArray(document["parts"]) ? document["parts"] : []).forEach((part: unknown, index) => record(() => {
        const path = pointer("/parts", index);
        const checked = checkObject(part, DOCUMENT_KEYS.part, path, true, "a part");
        if (checked["name"] !== undefined) {
            checkText(checked["name"], pointer(path, "name"), "a name");
        }
        checkBody(checked["body"], pointer(path, "body"), known);
        const material = checked["material"];
        if (isExpressionObject(material)) {
            checkTextExpression(material.expr, pointer(path, "material", "expr"), known);
        } else if (material !== undefined && (typeof material !== "string" || !known.materials.has(material))) {
            throw new DesignProblem(pointer(path, "material"), `${JSON.stringify(material)} is not a material of this document`);
        }
        checkAppearance(checked["appearance"], pointer(path, "appearance"), known, true);
        checkProperties(checked["properties"], pointer(path, "properties"), known);
        if (checked["connectors"] !== undefined) {
            checkIdList(checked["connectors"], pointer(path, "connectors"), "connectors").forEach((connector, index) => {
                const connectorPath = pointer(path, "connectors", index);
                checkKeys(connector, DOCUMENT_KEYS.connector, connectorPath, true);
                checkFaces(connector["on"], pointer(connectorPath, "on"), known);
                for (const key of ["origin", "direction"]) {
                    if (connector[key] !== undefined) {
                        checkPoint(connector[key], pointer(connectorPath, key), known);
                    }
                }
                const sources = ["origin", "axis", "centre"].filter(key => connector[key] !== undefined);
                if (sources.length > 1) {
                    throw new DesignProblem(pointer(connectorPath, sources[1]!), "a connector's origin comes from one of origin, axis and centre");
                }
                if (connector["axis"] !== undefined) {
                    checkFaces(connector["axis"], pointer(connectorPath, "axis"), known);
                    const hole = setHoleOf(connector["axis"], document);
                    if (hole !== undefined && (holePositionIds(document, hole) ?? []).some(position => position === undefined)) {
                        throw new DesignProblem(pointer(connectorPath, "axis"), `a connector on every wall of "${hole}" is named by the ids of its positions: give each position of "${hole}" one`);
                    }
                }
                if (connector["centre"] !== undefined) {
                    checkEdges(connector["centre"], pointer(connectorPath, "centre"), known);
                }
            });
        }
    }));
}

/** A fresh account of what a check knows, for the operations `registry` lists. */
export function knownFor(registry: DtoRegistry): Known {
    const operations = new Set(Object.keys(registry).filter(path => !path.startsWith("design.")));
    return { features: new Map(), sketches: new Map(), bodies: new Set(), parameters: new Set(), materials: new Set(), assets: new Set(), pinnedAssets: new Set(), holePositions: new Map(), faceSketches: new Set(), registry, operations };
}

/** A recorder that turns each problem `run` throws into an issue. */
export function recorderOf(issues: Models.OCCT.DesignIssue[]): (run: () => void) => void {
    return (run: () => void): void => {
        try {
            run();
        } catch (error) {
            if (error instanceof DesignProblem) {
                issues.push({ path: error.path, message: error.message });
            } else {
                throw error;
            }
        }
    };
}

/**
 * Every problem of `document` found without building it: its header, parameters and
 * configurations, each feature's fields, ids and references read in order so a reference can only
 * name what came before it, then its materials, parts and assets. A property the format does not
 * define is a problem. The first problem of each feature is reported; a feature with one is then
 * taken as made, so the features after it are still read.
 */
export function documentIssues(document: unknown, registry: DtoRegistry): Models.OCCT.DesignIssue[] {
    const issues: Models.OCCT.DesignIssue[] = [];
    const record = recorderOf(issues);
    if (!isRecord(document)) {
        return [{ path: "", message: "a design document is an object" }];
    }
    const known = knownFor(registry);
    checkHeader(document, record);
    checkParameters(document, known, record);
    checkAssets(document, known, record);
    checkMaterials(document, known, record);
    const features = document["features"];
    if (!Array.isArray(features)) {
        issues.push({ path: "/features", message: "features is a list" });
        return issues;
    }
    features.forEach((feature, index) => {
        const found = issues.length;
        record(() => checkFeature(feature, pointer("/features", index), known));
        if (issues.length > found) {
            takeAsMade(feature, known);
        }
    });
    checkParts(document, known, record);
    return issues;
}
