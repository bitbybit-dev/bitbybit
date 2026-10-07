import type { Base } from "../inputs/base-inputs";
import { InputError } from "../kernel-calls/errors";
import { isRecord } from "../kernel-calls/unknown-values";
import { linearDeterminant } from "../services/helpers/matrices";
import type { Checker, Kind, NodeSummary } from "./checker-types";
import {
    DEGENERATE_DETERMINANT, ISSUES_IN_MESSAGE, MATRIX_SIZE, MAX_BUFFER_LENGTH, MAX_ISSUES, MAX_RECIPE_COORDINATE, MAX_RECIPE_DEPTH, MAX_RECIPE_NODES, MAX_RECIPE_PLACEMENT,
    MAX_RECIPE_ROOTS, MAX_REFERENCED_NUMBERS, MIN_POLYGON_NUMBERS, POINT2_SIZE, POINT3_SIZE, RECIPE_FORMAT, RECIPE_VERSION, TRIANGLE_CORNERS,
} from "./limits.constants";
import type { RecipeIssue } from "./recipe-types";

const PROFILE: readonly Kind[] = ["profile"];
const SOLID: readonly Kind[] = ["solid"];
const CUTTING_TOOL: readonly Kind[] = ["solid", "halfSpace"];
const COORDINATE_RANGE = `from -${MAX_RECIPE_COORDINATE} to ${MAX_RECIPE_COORDINATE}`;
const PLACEMENT_RANGE = `from -${MAX_RECIPE_PLACEMENT} to ${MAX_RECIPE_PLACEMENT}`;
const UNKNOWN_NODE: NodeSummary = { kind: undefined, depth: 0 };

function report(issues: RecipeIssue[], path: string, message: string): void {
    if (issues.length < MAX_ISSUES) {
        issues.push({ path, message });
    }
}

function isCoordinate(value: unknown, limit = MAX_RECIPE_COORDINATE): value is number {
    return typeof value === "number" && Math.abs(value) <= limit;
}

function coordinates(value: unknown, size: number, limit = MAX_RECIPE_COORDINATE): value is number[] {
    if (!Array.isArray(value) || value.length !== size) {
        return false;
    }
    for (let index = 0; index < size; index++) {
        if (!isCoordinate(value[index], limit)) {
            return false;
        }
    }
    return true;
}

function isCount(value: unknown): value is number {
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function positive(issues: RecipeIssue[], value: unknown, path: string): void {
    if (typeof value !== "number" || !Number.isFinite(value) || !(value > 0)) {
        report(issues, path, "must be a finite number above zero");
    }
}

function extent(issues: RecipeIssue[], value: unknown, path: string): void {
    if (!isCoordinate(value) || !(value > 0)) {
        report(issues, path, `must be a number above zero and at most ${MAX_RECIPE_COORDINATE}`);
    }
}

function vector(issues: RecipeIssue[], value: unknown, path: string, nonZero: boolean): void {
    if (!coordinates(value, POINT3_SIZE)) {
        report(issues, path, `must be three numbers, each ${COORDINATE_RANGE}`);
    } else if (nonZero && value.every((item) => item === 0)) {
        report(issues, path, "must not be a zero vector");
    }
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

function checkCoordinates(issues: RecipeIssue[], f64: Float64Array): void {
    for (let index = 0; index < f64.length; index++) {
        if (!isCoordinate(f64[index])) {
            report(issues, `buffers.f64[${index}]`, `holds ${f64[index]}, where every number must be a coordinate ${COORDINATE_RANGE}`);
            return;
        }
    }
}

function range(checker: Checker, value: unknown, length: number, multiple: number, minimum: number, path: string): Base.RecipeRange | undefined {
    if (!Array.isArray(value) || value.length !== 2 || !isCount(value[0]) || !isCount(value[1])) {
        report(checker.issues, path, "must be a range of two whole numbers, a start and a count");
        return undefined;
    }
    const checked = value as Base.RecipeRange;
    const [start, count] = checked;
    if (start + count > length) {
        report(checker.issues, path, `runs past the end of its buffer, which holds ${length} numbers`);
        return undefined;
    }
    if (count % multiple !== 0 || count < minimum) {
        report(checker.issues, path, `must hold a multiple of ${multiple} numbers, at least ${minimum}`);
        return undefined;
    }
    checker.referenced += count;
    return checked;
}

function reference(checker: Checker, value: unknown, at: number, accepted: readonly Kind[], path: string): number {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value >= at) {
        report(checker.issues, path, at === 0 ? "must be the index of an earlier node, and none comes before it" : `must be the index of an earlier node, from 0 to ${at - 1}`);
        return 0;
    }
    const kind = checker.kinds[value];
    if (kind !== undefined && !accepted.includes(kind)) {
        report(checker.issues, path, `refers to a ${kind} node where ${accepted.join(" or ")} is needed`);
    }
    return checker.depths[value]!;
}

function references(checker: Checker, value: unknown, at: number, accepted: readonly Kind[], path: string, allowEmpty: boolean): number {
    if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
        report(checker.issues, path, allowEmpty ? "must be a list of node indices" : "must be a list of at least one node index");
        return 0;
    }
    let deepest = 0;
    for (let index = 0; index < value.length; index++) {
        deepest = Math.max(deepest, reference(checker, value[index], at, accepted, `${path}[${index}]`));
    }
    return deepest;
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
            return summary("solid", references(checker, node["of"], at, SOLID, `${path}.of`, false));
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

function checkRoot(checker: Checker, root: unknown, path: string, nodeCount: number): void {
    if (!isRecord(root)) {
        report(checker.issues, path, "must be an object with a node, a matrix and a tag");
        return;
    }
    reference(checker, root["node"], nodeCount, SOLID, `${path}.node`);
    checkMatrix(checker.issues, root["matrix"], `${path}.matrix`);
    if (!isRecord(root["tag"])) {
        report(checker.issues, `${path}.tag`, "must be an object");
    }
}

function checkRoots(checker: Checker, roots: readonly unknown[], nodeCount: number): void {
    for (let index = 0; index < roots.length; index++) {
        checkRoot(checker, roots[index], `roots[${index}]`, nodeCount);
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
    positive(issues, recipe["tolerance"], "tolerance");
    const buffers = recipe["buffers"];
    const f64 = isRecord(buffers) ? buffers["f64"] : undefined;
    const i32 = isRecord(buffers) ? buffers["i32"] : undefined;
    if (!(f64 instanceof Float64Array) || !(i32 instanceof Int32Array)) {
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
    checkCoordinates(issues, f64);
    const checker: Checker = { issues, buffers: { f64, i32 }, kinds: [], depths: [], referenced: 0 };
    checkNodes(checker, nodes);
    checkRoots(checker, roots, nodes.length);
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
