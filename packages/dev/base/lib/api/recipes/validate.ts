import type { Base } from "../inputs/base-inputs";
import { InputError } from "../kernel-calls/errors";
import { isRecord } from "../kernel-calls/unknown-values";
import { linearDeterminant } from "../services/helpers/matrices";
import type { Checker, Kind, NodeSummary } from "./checker-types";
import { checkBrep } from "./validate-brep";
import { COORDINATE_RANGE, coordinates, extent, isCoordinate, isCount, positive, range, reference, references, report, vector } from "./checks";
import {
    DEGENERATE_DETERMINANT, FULL_TURN, INT32_HIGHEST, INT32_LOWEST, ISSUES_IN_MESSAGE, MATRIX_SIZE, MAX_BUFFER_LENGTH, MAX_RECIPE_DEPTH, MAX_RECIPE_NODES, MAX_RECIPE_PLACEMENT,
    MAX_RECIPE_GROUPS, MAX_RECIPE_ROOTS, MAX_REFERENCED_NUMBERS, MIN_INTERSECTED, MIN_LOFT_FRAMES, MIN_POLYGON_NUMBERS, POINT2_SIZE, POINT3_SIZE, RECIPE_FORMAT, RECIPE_VERSION, TRIANGLE_CORNERS,
} from "./limits.constants";
import type { RecipeIssue } from "./recipe-types";

const PROFILE: readonly Kind[] = ["profile"];
const SOLID: readonly Kind[] = ["solid"];
const CUTTING_TOOL: readonly Kind[] = ["solid", "halfSpace"];
const PLACEMENT_RANGE = `from -${MAX_RECIPE_PLACEMENT} to ${MAX_RECIPE_PLACEMENT}`;
const UNKNOWN_NODE: NodeSummary = { kind: undefined, depth: 0 };

const TYPED_ARRAY_PROTOTYPE = Object.getPrototypeOf(Int8Array.prototype) as object;

function typedArrayNameOf(value: unknown): unknown {
    return Reflect.get(TYPED_ARRAY_PROTOTYPE, Symbol.toStringTag, value);
}

function isFloat64Array(value: unknown): value is Float64Array {
    return value instanceof Float64Array || typedArrayNameOf(value) === "Float64Array";
}

function isInt32Array(value: unknown): value is Int32Array {
    return value instanceof Int32Array || typedArrayNameOf(value) === "Int32Array";
}

function isAffine(matrix: readonly number[]): boolean {
    return matrix[3] === 0 && matrix[7] === 0 && matrix[11] === 0 && matrix[15] === 1;
}

function checkMatrix(issues: RecipeIssue[], value: unknown, path: string): void {
    if (!coordinates(value, MATRIX_SIZE, MAX_RECIPE_PLACEMENT)) {
        report(issues, path, `must be sixteen numbers in column-major order, each ${PLACEMENT_RANGE}`);
    } else if (!isAffine(value)) {
        report(issues, path, "must have 0, 0, 0, 1 as its bottom row, at indices 3, 7, 11 and 15: it moves, turns, mirrors and scales, and never projects");
    } else if (Math.abs(linearDeterminant(value)) <= DEGENERATE_DETERMINANT) {
        report(issues, path, "flattens what it transforms: its rotation and scale part has no inverse");
    }
}

function checkFrames(checker: Checker, frames: Base.RecipeRange, path: string): void {
    const [start, count] = frames;
    let firstMirrors = false;
    for (let frame = 0; frame < count / MATRIX_SIZE; frame++) {
        const matrix = [...checker.buffers.f64.subarray(start + frame * MATRIX_SIZE, start + (frame + 1) * MATRIX_SIZE)];
        if (!isAffine(matrix)) {
            report(checker.issues, `${path}[${frame}]`, "must have 0, 0, 0, 1 as its bottom row, at numbers 3, 7, 11 and 15 of the frame");
            return;
        }
        const determinant = linearDeterminant(matrix);
        if (Math.abs(determinant) <= DEGENERATE_DETERMINANT) {
            report(checker.issues, `${path}[${frame}]`, "flattens the profile it places: its rotation and scale part has no inverse");
            return;
        }
        if (frame === 0) {
            firstMirrors = determinant < 0;
        } else if (determinant < 0 !== firstMirrors) {
            report(checker.issues, `${path}[${frame}]`, "turns the profile over where the first frame does not, or the other way round: a loft's frames all mirror, or none do");
            return;
        }
    }
}

function checkRevolve(checker: Checker, node: Record<string, unknown>, at: number, path: string): number {
    const { issues } = checker;
    const deepest = reference(checker, node["profile"], at, PROFILE, `${path}.profile`);
    if (!coordinates(node["origin"], POINT2_SIZE)) {
        report(issues, `${path}.origin`, `must be two numbers, each ${COORDINATE_RANGE}`);
    }
    if (!coordinates(node["direction"], POINT2_SIZE)) {
        report(issues, `${path}.direction`, `must be two numbers, each ${COORDINATE_RANGE}`);
    } else if (node["direction"].every((item) => item === 0)) {
        report(issues, `${path}.direction`, "must not be a zero vector");
    }
    const angle = node["angle"];
    if (typeof angle !== "number" || !(angle > 0) || !(angle <= FULL_TURN)) {
        report(issues, `${path}.angle`, "must be an angle in radians above zero and at most a whole turn");
    }
    return deepest;
}

function checkLoft(checker: Checker, node: Record<string, unknown>, at: number, path: string): number {
    const deepest = references(checker, node["profiles"], at, PROFILE, `${path}.profiles`, false);
    const frames = range(checker, node["frames"], checker.buffers.f64.length, MATRIX_SIZE, MIN_LOFT_FRAMES * MATRIX_SIZE, `${path}.frames`);
    if (frames === undefined) {
        return deepest;
    }
    const count = frames[1] / MATRIX_SIZE;
    const profiles = node["profiles"];
    if (Array.isArray(profiles) && profiles.length > 1 && profiles.length !== count) {
        report(checker.issues, `${path}.profiles`, `must hold one profile, or one for each of the ${count} frames`);
    }
    checkFrames(checker, frames, `${path}.frames`);
    return deepest;
}

function checkCoordinates(issues: RecipeIssue[], f64: Float64Array): void {
    for (let index = 0; index < f64.length; index++) {
        if (!isCoordinate(f64[index])) {
            report(issues, `buffers.f64[${index}]`, `holds ${f64[index]}, where every number must be a coordinate ${COORDINATE_RANGE}`);
            return;
        }
    }
}

function checkCorners(checker: Checker, positions: Base.RecipeRange, indices: Base.RecipeRange, path: string): void {
    const vertices = positions[1] / POINT3_SIZE;
    const [start, count] = indices;
    for (let index = start; index < start + count; index++) {
        const corner = checker.buffers.i32[index]!;
        if (corner < 0 || corner >= vertices) {
            report(checker.issues, path, `points at position ${corner}, but the node has ${vertices} positions`);
            return;
        }
    }
}

function checkTriangles(checker: Checker, node: Record<string, unknown>, path: string): void {
    const positions = range(checker, node["positions"], checker.buffers.f64.length, POINT3_SIZE, POINT3_SIZE * TRIANGLE_CORNERS, `${path}.positions`);
    const indices = range(checker, node["indices"], checker.buffers.i32.length, TRIANGLE_CORNERS, TRIANGLE_CORNERS, `${path}.indices`);
    if (positions !== undefined && indices !== undefined && checker.referenced <= MAX_REFERENCED_NUMBERS) {
        checkCorners(checker, positions, indices, `${path}.indices`);
    }
}

function checkPolygon(checker: Checker, node: Record<string, unknown>, path: string): void {
    const length = checker.buffers.f64.length;
    range(checker, node["points"], length, POINT2_SIZE, MIN_POLYGON_NUMBERS, `${path}.points`);
    const holes = node["holes"];
    if (!Array.isArray(holes)) {
        report(checker.issues, `${path}.holes`, "must be a list of ranges, empty when there are no holes");
        return;
    }
    for (let index = 0; index < holes.length; index++) {
        range(checker, holes[index], length, POINT2_SIZE, MIN_POLYGON_NUMBERS, `${path}.holes[${index}]`);
    }
}

function summary(kind: Kind, deepestReference: number): NodeSummary {
    return { kind, depth: deepestReference + 1 };
}

function checkNode(checker: Checker, node: unknown, at: number): NodeSummary {
    const path = `nodes[${at}]`;
    const { issues } = checker;
    if (!isRecord(node)) {
        report(issues, path, "must be an object with an op");
        return UNKNOWN_NODE;
    }
    switch (node["op"]) {
        case "polygon":
            checkPolygon(checker, node, path);
            return summary("profile", 0);
        case "circle":
            if (!coordinates(node["center"], POINT2_SIZE)) {
                report(issues, `${path}.center`, `must be two numbers, each ${COORDINATE_RANGE}`);
            }
            extent(issues, node["radius"], `${path}.radius`);
            return summary("profile", 0);
        case "extrude": {
            const deepest = reference(checker, node["profile"], at, PROFILE, `${path}.profile`);
            vector(issues, node["direction"], `${path}.direction`, true);
            if (coordinates(node["direction"], POINT3_SIZE) && node["direction"][2] === 0) {
                report(issues, `${path}.direction`, "lies in the XY plane, so the sweep has no volume");
            }
            extent(issues, node["depth"], `${path}.depth`);
            return summary("solid", deepest);
        }
        case "halfSpace":
            if (!coordinates(node["origin"], POINT3_SIZE, MAX_RECIPE_PLACEMENT)) {
                report(issues, `${path}.origin`, `must be three numbers, each ${PLACEMENT_RANGE}`);
            }
            vector(issues, node["normal"], `${path}.normal`, true);
            return summary("halfSpace", 0);
        case "difference": {
            const deepest = reference(checker, node["of"], at, SOLID, `${path}.of`);
            return summary("solid", Math.max(deepest, references(checker, node["tools"], at, CUTTING_TOOL, `${path}.tools`, false)));
        }
        case "transform": {
            const deepest = reference(checker, node["of"], at, SOLID, `${path}.of`);
            checkMatrix(issues, node["matrix"], `${path}.matrix`);
            return summary("solid", deepest);
        }
        case "voids": {
            const deepest = reference(checker, node["host"], at, SOLID, `${path}.host`);
            return summary("solid", Math.max(deepest, references(checker, node["openings"], at, SOLID, `${path}.openings`, true)));
        }
        case "triangles":
            checkTriangles(checker, node, path);
            return summary("solid", 0);
        case "compound":
        case "union":
            return summary("solid", references(checker, node["of"], at, SOLID, `${path}.of`, false));
        case "intersection":
            if (Array.isArray(node["of"]) && node["of"].length < MIN_INTERSECTED) {
                report(issues, `${path}.of`, `must be a list of at least ${MIN_INTERSECTED} node indices`);
            }
            return summary("solid", references(checker, node["of"], at, SOLID, `${path}.of`, false));
        case "revolve":
            return summary("solid", checkRevolve(checker, node, at, path));
        case "loft":
            return summary("solid", checkLoft(checker, node, at, path));
        case "brep":
            return summary("solid", checkBrep(checker, node, at, path));
        default:
            report(issues, `${path}.op`, `'${String(node["op"])}' is not an operation recipes know`);
            return UNKNOWN_NODE;
    }
}

function checkNodes(checker: Checker, nodes: readonly unknown[]): void {
    for (let at = 0; at < nodes.length; at++) {
        const { kind, depth } = checkNode(checker, nodes[at], at);
        checker.kinds.push(kind);
        checker.depths.push(depth);
        if (depth === MAX_RECIPE_DEPTH + 1) {
            report(checker.issues, `nodes[${at}]`, `stands ${depth} steps deep, more than the ${MAX_RECIPE_DEPTH} a recipe may nest`);
        }
    }
    if (checker.referenced > MAX_REFERENCED_NUMBERS) {
        report(checker.issues, "nodes", `refer to ${checker.referenced} numbers of the buffers in all, more than the ${MAX_REFERENCED_NUMBERS} a recipe may build from`);
    }
}

function checkGroupIndex(issues: RecipeIssue[], value: unknown, groupCount: number, path: string, what: string): void {
    if (value !== undefined && !(isCount(value) && value < groupCount)) {
        report(issues, path, groupCount === 0 ? `must be left out, since ${what}` : `must be left out or be the index of ${what}, from 0 to ${groupCount - 1}`);
    }
}

function checkRoot(checker: Checker, root: unknown, path: string, nodeCount: number, groupCount: number): void {
    if (!isRecord(root)) {
        report(checker.issues, path, "must be an object with a node, a matrix and a tag");
        return;
    }
    reference(checker, root["node"], nodeCount, SOLID, `${path}.node`);
    checkMatrix(checker.issues, root["matrix"], `${path}.matrix`);
    if (!isRecord(root["tag"])) {
        report(checker.issues, `${path}.tag`, "must be an object");
    }
    checkGroupIndex(checker.issues, root["group"], groupCount, `${path}.group`, groupCount === 0 ? "the recipe has no groups" : "one of the recipe's groups");
}

function checkRoots(checker: Checker, roots: readonly unknown[], nodeCount: number, groupCount: number): void {
    for (let index = 0; index < roots.length; index++) {
        checkRoot(checker, roots[index], `roots[${index}]`, nodeCount, groupCount);
    }
}

function checkGroups(issues: RecipeIssue[], groups: readonly unknown[]): void {
    for (let index = 0; index < groups.length; index++) {
        const group = groups[index];
        const path = `groups[${index}]`;
        if (!isRecord(group)) {
            report(issues, path, "must be an object with a name and a tag");
            continue;
        }
        if (typeof group["name"] !== "string") {
            report(issues, `${path}.name`, "must be text");
        }
        if (!isRecord(group["tag"])) {
            report(issues, `${path}.tag`, "must be an object");
        }
        checkGroupIndex(issues, group["parent"], index, `${path}.parent`, index === 0 ? "no group comes before the first one" : "an earlier group");
    }
}

/**
 * Checks that a value is a recipe an executor can safely run: every index refers to an earlier
 * node of the right kind, every range lies inside its buffer, every coordinate of a profile or an
 * extrusion is finite and between minus and plus one billion, every placement (a matrix or a
 * half-space's origin) between minus and plus ten trillion, every matrix moves, turns, mirrors and
 * scales without flattening, and no list, total or nesting exceeds its limit. A recipe that comes from another thread, a file or a caller is
 * checked before any kernel touches it.
 *
 * Experimental: the recipe format may still change before it is declared stable.
 * @param recipe - The value to check
 * @returns What is wrong with it, at most a hundred issues, empty when nothing is
 * @beta
 */
export function checkRecipe(recipe: unknown): RecipeIssue[] {
    const issues: RecipeIssue[] = [];
    if (!isRecord(recipe)) {
        report(issues, "", "a recipe must be an object");
        return issues;
    }
    if (recipe["format"] !== RECIPE_FORMAT || recipe["version"] !== RECIPE_VERSION) {
        report(issues, "format", `must be ${RECIPE_FORMAT} version ${RECIPE_VERSION}`);
    }
    positive(issues, recipe["millimetresPerUnit"], "millimetresPerUnit");
    extent(issues, recipe["tolerance"], "tolerance");
    const buffers = recipe["buffers"];
    const f64 = isRecord(buffers) ? buffers["f64"] : undefined;
    const i32 = isRecord(buffers) ? buffers["i32"] : undefined;
    if (!isFloat64Array(f64) || !isInt32Array(i32)) {
        report(issues, "buffers", "must hold an f64 Float64Array and an i32 Int32Array");
        return issues;
    }
    if (f64.length > MAX_BUFFER_LENGTH || i32.length > MAX_BUFFER_LENGTH) {
        report(issues, "buffers", `must each hold at most ${MAX_BUFFER_LENGTH} numbers`);
        return issues;
    }
    const nodes = recipe["nodes"];
    if (!Array.isArray(nodes) || nodes.length > MAX_RECIPE_NODES) {
        report(issues, "nodes", `must be a list of at most ${MAX_RECIPE_NODES} nodes`);
        return issues;
    }
    const roots = recipe["roots"];
    if (!Array.isArray(roots) || roots.length > MAX_RECIPE_ROOTS) {
        report(issues, "roots", `must be a list of at most ${MAX_RECIPE_ROOTS} roots`);
        return issues;
    }
    const groups = recipe["groups"] ?? [];
    if (!Array.isArray(groups) || groups.length > MAX_RECIPE_GROUPS) {
        report(issues, "groups", `must be left out or be a list of at most ${MAX_RECIPE_GROUPS} groups`);
        return issues;
    }
    checkCoordinates(issues, f64);
    const checker: Checker = { issues, buffers: { f64, i32 }, kinds: [], depths: [], referenced: 0 };
    checkNodes(checker, nodes);
    checkGroups(issues, groups);
    checkRoots(checker, roots, nodes.length, groups.length);
    return issues;
}

/**
 * Throws an `InputError` when a value is not a recipe an executor can safely run, naming the first
 * three problems `checkRecipe` finds.
 *
 * Experimental: the recipe format may still change before it is declared stable.
 * @param recipe - The value to check
 * @beta
 */
export function assertRecipe(recipe: unknown): asserts recipe is Base.Recipe {
    const issues = checkRecipe(recipe);
    if (issues.length) {
        throw new InputError(`The recipe cannot be built: ${issues.slice(0, ISSUES_IN_MESSAGE).map((issue) => `${issue.path ? `${issue.path} ` : ""}${issue.message}`).join("; ")}`, "recipe");
    }
}

function isNumberList(value: unknown): value is number[] {
    return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function isInt32List(value: unknown): value is number[] {
    return isNumberList(value) && value.every((item) => Number.isInteger(item) && item >= INT32_LOWEST && item <= INT32_HIGHEST);
}

/**
 * Reads a value as a recipe an executor can run, taking its buffers as lists of numbers too, as JSON
 * carries them: such lists become the typed arrays the format holds, and the result is checked as
 * `assertRecipe` checks it. The value it is given is left as it was.
 *
 * Experimental: the recipe format may still change before it is declared stable.
 * @param value - The recipe, its buffers typed arrays or lists of numbers
 * @returns The recipe with typed buffers
 * @beta
 */
export function toRecipe(value: unknown): Base.Recipe {
    const buffers = isRecord(value) ? value["buffers"] : undefined;
    if (isRecord(value) && isRecord(buffers) && (isNumberList(buffers["f64"]) || isInt32List(buffers["i32"]))) {
        const f64 = buffers["f64"];
        const i32 = buffers["i32"];
        const typed = { ...value, buffers: { ...buffers, f64: isNumberList(f64) ? Float64Array.from(f64) : f64, i32: isInt32List(i32) ? Int32Array.from(i32) : i32 } };
        assertRecipe(typed);
        return typed;
    }
    assertRecipe(value);
    return value;
}
