import { isRecord } from "../kernel-calls/unknown-values";
import type { Checker, Kind } from "./checker-types";
import { COORDINATE_RANGE, coordinates, extent, isCount, range, reference, report, vector } from "./checks";
import { MAX_BREP_DEGREE, MAX_BREP_ITEMS, PARALLEL_SINE, POINT3_SIZE, QUARTER_TURN } from "./limits.constants";

const SOLID: readonly Kind[] = ["solid"];

interface BrepSizes {
    readonly vertices: number;
    readonly curves: number;
    readonly surfaces: number;
    readonly edges: number;
}

interface EdgeEnds {
    readonly start: number;
    readonly end: number;
}

function list(checker: Checker, value: unknown, path: string, minimum: number): unknown[] {
    if (!Array.isArray(value) || value.length < minimum || value.length > MAX_BREP_ITEMS) {
        report(checker.issues, path, `must be a list of ${minimum > 0 ? `at least ${minimum} and ` : ""}at most ${MAX_BREP_ITEMS} items`);
        return [];
    }
    return value;
}

function index(checker: Checker, value: unknown, count: number, path: string, what: string): value is number {
    if (!isCount(value) || value >= count) {
        report(checker.issues, path, count === 0 ? `must be the index of one of the node's ${what}, and it has none` : `must be the index of one of the node's ${what}, from 0 to ${count - 1}`);
        return false;
    }
    return true;
}

function nonNegative(checker: Checker, value: unknown, path: string): void {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) {
        report(checker.issues, path, "must be a finite number of zero or more");
    }
}

function checkPlacement(checker: Checker, value: Record<string, unknown>, path: string): void {
    if (!coordinates(value["origin"], POINT3_SIZE)) {
        report(checker.issues, `${path}.origin`, `must be three numbers, each ${COORDINATE_RANGE}`);
    }
    vector(checker.issues, value["axis"], `${path}.axis`, true);
    vector(checker.issues, value["xDirection"], `${path}.xDirection`, true);
    const axis = value["axis"];
    const x = value["xDirection"];
    if (coordinates(axis, POINT3_SIZE) && coordinates(x, POINT3_SIZE)) {
        const cross = [axis[1]! * x[2]! - axis[2]! * x[1]!, axis[2]! * x[0]! - axis[0]! * x[2]!, axis[0]! * x[1]! - axis[1]! * x[0]!];
        const sine = Math.hypot(cross[0]!, cross[1]!, cross[2]!) / (Math.hypot(axis[0]!, axis[1]!, axis[2]!) * Math.hypot(x[0]!, x[1]!, x[2]!));
        if (!(sine > PARALLEL_SINE)) {
            report(checker.issues, `${path}.xDirection`, "lies along the axis, so it gives no X direction");
        }
    }
}

function isMultiplicity(value: unknown, highest: number): value is number {
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 1 && value <= highest;
}

function checkKnots(checker: Checker, knots: unknown, multiplicities: unknown, degree: number, count: number, path: string, names: readonly [string, string]): void {
    const [knotsName, multiplicitiesName] = names;
    const knotRange = range(checker, knots, checker.buffers.f64.length, 1, 2, `${path}.${knotsName}`);
    if (!Array.isArray(multiplicities) || multiplicities.length > MAX_BREP_ITEMS || !multiplicities.every((value, at) => isMultiplicity(value, at === 0 || at === multiplicities.length - 1 ? degree + 1 : degree))) {
        report(checker.issues, `${path}.${multiplicitiesName}`, `must be a list of whole numbers, one per knot: from 1 to ${degree + 1} at the ends and at most ${degree} between them`);
        return;
    }
    if (knotRange === undefined) {
        return;
    }
    const [start, length] = knotRange;
    if (multiplicities.length !== length) {
        report(checker.issues, `${path}.${multiplicitiesName}`, `must hold one multiplicity per knot, ${length}`);
        return;
    }
    for (let at = start + 1; at < start + length; at++) {
        if (!(checker.buffers.f64[at]! > checker.buffers.f64[at - 1]!)) {
            report(checker.issues, `${path}.${knotsName}`, "must rise from one knot to the next");
            return;
        }
    }
    const total = multiplicities.reduce((sum: number, value: number) => sum + value, 0);
    if (total !== count + degree + 1) {
        report(checker.issues, `${path}.${multiplicitiesName}`, `must add up to ${count + degree + 1}, the ${count} control points plus the degree plus one, not ${total}`);
    }
}

function checkWeights(checker: Checker, weights: unknown, count: number, path: string): void {
    if (weights === undefined) {
        return;
    }
    const weightRange = range(checker, weights, checker.buffers.f64.length, 1, 1, path);
    if (weightRange === undefined) {
        return;
    }
    const [start, length] = weightRange;
    if (length !== count) {
        report(checker.issues, path, `must hold one weight per control point, ${count}`);
        return;
    }
    for (let at = start; at < start + length; at++) {
        if (!(checker.buffers.f64[at]! > 0)) {
            report(checker.issues, path, "must hold weights above zero");
            return;
        }
    }
}

function degreeOf(checker: Checker, value: unknown, path: string): number {
    if (!isMultiplicity(value, MAX_BREP_DEGREE)) {
        report(checker.issues, path, `must be a whole number from 1 to ${MAX_BREP_DEGREE}`);
        return 0;
    }
    return value;
}

function checkSplineCurve(checker: Checker, curve: Record<string, unknown>, path: string): void {
    const degree = degreeOf(checker, curve["degree"], `${path}.degree`);
    const points = range(checker, curve["points"], checker.buffers.f64.length, POINT3_SIZE, POINT3_SIZE * (degree + 1), `${path}.points`);
    if (degree === 0 || points === undefined) {
        return;
    }
    const count = points[1] / POINT3_SIZE;
    checkWeights(checker, curve["weights"], count, `${path}.weights`);
    checkKnots(checker, curve["knots"], curve["multiplicities"], degree, count, path, ["knots", "multiplicities"]);
}

function checkCurve(checker: Checker, curve: unknown, path: string): void {
    if (!isRecord(curve)) {
        report(checker.issues, path, "must be an object with a kind");
        return;
    }
    switch (curve["kind"]) {
        case "line":
            if (!coordinates(curve["origin"], POINT3_SIZE)) {
                report(checker.issues, `${path}.origin`, `must be three numbers, each ${COORDINATE_RANGE}`);
            }
            vector(checker.issues, curve["direction"], `${path}.direction`, true);
            return;
        case "circle":
            checkPlacement(checker, curve, path);
            extent(checker.issues, curve["radius"], `${path}.radius`);
            return;
        case "ellipse":
            checkPlacement(checker, curve, path);
            extent(checker.issues, curve["xRadius"], `${path}.xRadius`);
            extent(checker.issues, curve["yRadius"], `${path}.yRadius`);
            return;
        case "bspline":
            checkSplineCurve(checker, curve, path);
            return;
        default:
            report(checker.issues, `${path}.kind`, `'${String(curve["kind"])}' is not a curve a brep node knows`);
    }
}

function checkSplineSurface(checker: Checker, surface: Record<string, unknown>, path: string): void {
    const uDegree = degreeOf(checker, surface["uDegree"], `${path}.uDegree`);
    const vDegree = degreeOf(checker, surface["vDegree"], `${path}.vDegree`);
    const uCount = surface["uCount"];
    const vCount = surface["vCount"];
    if (!isCount(uCount) || uCount < uDegree + 1) {
        report(checker.issues, `${path}.uCount`, `must be a whole number of at least ${uDegree + 1}, the degree along u plus one`);
        return;
    }
    if (!isCount(vCount) || vCount < vDegree + 1) {
        report(checker.issues, `${path}.vCount`, `must be a whole number of at least ${vDegree + 1}, the degree along v plus one`);
        return;
    }
    const points = range(checker, surface["points"], checker.buffers.f64.length, POINT3_SIZE, POINT3_SIZE, `${path}.points`);
    if (points !== undefined && points[1] !== uCount * vCount * POINT3_SIZE) {
        report(checker.issues, `${path}.points`, `must hold uCount times vCount control points, ${uCount * vCount}`);
    }
    checkWeights(checker, surface["weights"], uCount * vCount, `${path}.weights`);
    if (uDegree > 0) {
        checkKnots(checker, surface["uKnots"], surface["uMultiplicities"], uDegree, uCount, path, ["uKnots", "uMultiplicities"]);
    }
    if (vDegree > 0) {
        checkKnots(checker, surface["vKnots"], surface["vMultiplicities"], vDegree, vCount, path, ["vKnots", "vMultiplicities"]);
    }
}

function checkSurface(checker: Checker, surface: unknown, curves: number, path: string): void {
    if (!isRecord(surface)) {
        report(checker.issues, path, "must be an object with a kind");
        return;
    }
    switch (surface["kind"]) {
        case "plane":
            checkPlacement(checker, surface, path);
            return;
        case "cylinder":
        case "sphere":
            checkPlacement(checker, surface, path);
            extent(checker.issues, surface["radius"], `${path}.radius`);
            return;
        case "cone": {
            checkPlacement(checker, surface, path);
            nonNegative(checker, surface["radius"], `${path}.radius`);
            const angle = surface["semiAngle"];
            if (typeof angle !== "number" || !(angle > 0) || !(angle < QUARTER_TURN)) {
                report(checker.issues, `${path}.semiAngle`, "must be an angle in radians above zero and below a quarter turn");
            }
            return;
        }
        case "torus":
            checkPlacement(checker, surface, path);
            extent(checker.issues, surface["majorRadius"], `${path}.majorRadius`);
            extent(checker.issues, surface["minorRadius"], `${path}.minorRadius`);
            return;
        case "bspline":
            checkSplineSurface(checker, surface, path);
            return;
        case "revolution":
            index(checker, surface["curve"], curves, `${path}.curve`, "curves");
            if (!coordinates(surface["origin"], POINT3_SIZE)) {
                report(checker.issues, `${path}.origin`, `must be three numbers, each ${COORDINATE_RANGE}`);
            }
            vector(checker.issues, surface["axis"], `${path}.axis`, true);
            return;
        case "extrusion":
            index(checker, surface["curve"], curves, `${path}.curve`, "curves");
            vector(checker.issues, surface["direction"], `${path}.direction`, true);
            return;
        default:
            report(checker.issues, `${path}.kind`, `'${String(surface["kind"])}' is not a surface a brep node knows`);
    }
}

function checkEdge(checker: Checker, edge: unknown, sizes: BrepSizes, path: string): EdgeEnds | undefined {
    if (!isRecord(edge)) {
        report(checker.issues, path, "must be an object with a curve, a start and an end");
        return undefined;
    }
    index(checker, edge["curve"], sizes.curves, `${path}.curve`, "curves");
    const start = index(checker, edge["start"], sizes.vertices, `${path}.start`, "vertices") ? edge["start"] : undefined;
    const end = index(checker, edge["end"], sizes.vertices, `${path}.end`, "vertices") ? edge["end"] : undefined;
    if (edge["sameSense"] !== undefined && typeof edge["sameSense"] !== "boolean") {
        report(checker.issues, `${path}.sameSense`, "must be true or false, or be left out");
    }
    const parameters = edge["parameters"];
    if (parameters !== undefined && (!Array.isArray(parameters) || parameters.length !== 2 || !parameters.every((value) => typeof value === "number" && Number.isFinite(value)) || parameters[0] === parameters[1])) {
        report(checker.issues, `${path}.parameters`, "must be two different finite numbers, or be left out");
    }
    return start === undefined || end === undefined ? undefined : { start, end };
}

function checkBound(checker: Checker, bound: unknown, ends: readonly (EdgeEnds | undefined)[], path: string): boolean {
    if (!isRecord(bound)) {
        report(checker.issues, path, "must be an object with outer, edges and forward");
        return false;
    }
    if (typeof bound["outer"] !== "boolean") {
        report(checker.issues, `${path}.outer`, "must be true or false");
    }
    const edges = list(checker, bound["edges"], `${path}.edges`, 1);
    const forward = bound["forward"];
    if (!Array.isArray(forward) || forward.length !== edges.length || !forward.every((value) => typeof value === "boolean")) {
        report(checker.issues, `${path}.forward`, `must be a list of ${edges.length} true or false values, one per edge`);
        return bound["outer"] === true;
    }
    const uses: (EdgeEnds | undefined)[] = edges.map((edge, at) => {
        if (!index(checker, edge, ends.length, `${path}.edges[${at}]`, "edges")) {
            return undefined;
        }
        const known = ends[edge];
        return known && (forward[at] ? known : { start: known.end, end: known.start });
    });
    for (let at = 0; at < uses.length; at++) {
        const here = uses[at];
        const next = uses[(at + 1) % uses.length];
        if (here && next && here.end !== next.start) {
            report(checker.issues, `${path}.edges[${at}]`, `ends at vertex ${here.end}, but the next edge of the loop starts at vertex ${next.start}`);
            break;
        }
    }
    return bound["outer"] === true;
}

function checkFace(checker: Checker, face: unknown, sizes: BrepSizes, ends: readonly (EdgeEnds | undefined)[], path: string): void {
    if (!isRecord(face)) {
        report(checker.issues, path, "must be an object with a surface, sameSense and bounds");
        return;
    }
    index(checker, face["surface"], sizes.surfaces, `${path}.surface`, "surfaces");
    if (typeof face["sameSense"] !== "boolean") {
        report(checker.issues, `${path}.sameSense`, "must be true or false");
    }
    const bounds = list(checker, face["bounds"], `${path}.bounds`, 1);
    let outer = 0;
    bounds.forEach((bound, at) => {
        outer += checkBound(checker, bound, ends, `${path}.bounds[${at}]`) ? 1 : 0;
    });
    if (outer > 1) {
        report(checker.issues, `${path}.bounds`, `must hold at most one outer bound, not ${outer}`);
    }
}

function checkShell(checker: Checker, shell: unknown, faces: number, used: Set<number>, path: string): void {
    const listed = list(checker, shell, path, 1);
    listed.forEach((face, at) => {
        if (index(checker, face, faces, `${path}[${at}]`, "faces")) {
            if (used.has(face)) {
                report(checker.issues, `${path}[${at}]`, `names face ${face}, which another shell already holds`);
            }
            used.add(face);
        }
    });
}

function checkSolids(checker: Checker, value: unknown, faces: number, path: string, closed: boolean): void {
    if (!closed) {
        report(checker.issues, path, "must be left out of a node whose faces do not close a volume");
        return;
    }
    const used = new Set<number>();
    list(checker, value, path, 1).forEach((solid, at) => {
        if (!isRecord(solid)) {
            report(checker.issues, `${path}[${at}]`, "must be an object with an outer shell");
            return;
        }
        checkShell(checker, solid["outer"], faces, used, `${path}[${at}].outer`);
        if (solid["voids"] !== undefined) {
            list(checker, solid["voids"], `${path}[${at}].voids`, 0).forEach((shell, shellAt) => {
                checkShell(checker, shell, faces, used, `${path}[${at}].voids[${shellAt}]`);
            });
        }
    });
    const missing = Array.isArray(value) ? Array.from({ length: faces }, (_, face) => face).find((face) => !used.has(face)) : undefined;
    if (missing !== undefined) {
        report(checker.issues, path, `must place each of the node's faces in a shell, and leaves face ${missing} out`);
    }
}

export function checkBrep(checker: Checker, node: Record<string, unknown>, at: number, path: string): number {
    const vertices = range(checker, node["vertices"], checker.buffers.f64.length, POINT3_SIZE, POINT3_SIZE, `${path}.vertices`);
    const curves = list(checker, node["curves"], `${path}.curves`, 0);
    const surfaces = list(checker, node["surfaces"], `${path}.surfaces`, 0);
    const edges = list(checker, node["edges"], `${path}.edges`, 0);
    const faces = list(checker, node["faces"], `${path}.faces`, 1);
    const sizes: BrepSizes = { vertices: vertices === undefined ? 0 : vertices[1] / POINT3_SIZE, curves: curves.length, surfaces: surfaces.length, edges: edges.length };
    curves.forEach((curve, item) => {
        checkCurve(checker, curve, `${path}.curves[${item}]`);
    });
    surfaces.forEach((surface, item) => {
        checkSurface(checker, surface, sizes.curves, `${path}.surfaces[${item}]`);
    });
    const ends = edges.map((edge, item) => checkEdge(checker, edge, sizes, `${path}.edges[${item}]`));
    faces.forEach((face, item) => {
        checkFace(checker, face, sizes, ends, `${path}.faces[${item}]`);
    });
    if (typeof node["closed"] !== "boolean") {
        report(checker.issues, `${path}.closed`, "must be true or false");
    }
    if (node["solids"] !== undefined) {
        checkSolids(checker, node["solids"], faces.length, `${path}.solids`, node["closed"] === true);
    }
    return node["fallback"] === undefined ? 0 : reference(checker, node["fallback"], at, SOLID, `${path}.fallback`);
}
