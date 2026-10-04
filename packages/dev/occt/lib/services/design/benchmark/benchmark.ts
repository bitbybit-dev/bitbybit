import { BitbybitOcctModule } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OCCTService } from "../../../occ-service";
import * as Inputs from "../../../api/inputs";
import * as Models from "../../../api/models";
import { DesignCache, release } from "../cache";
import { contextOf } from "../helpers";
import { referenceHintOf } from "../hints";
import { DesignProblem } from "../problems";
import { resolveEdges, resolveFaces } from "../references";
import { runFeatures } from "../runner";
import { BodyState, DesignRun } from "../state";
import { directionOf, numberOf, pointOf } from "../values";

/**
 * Ground truth for faces, found on a built body by geometry alone, never by names: every planar face
 * on a plane facing one way; every face holding one of some points; every cylindrical face of a
 * radius about an axis, tested where its centre, pushed out to the radius, meets the surface (any
 * of four directions square to the axis when the centre lies on it, as a whole cylinder's does).
 */
export type FaceIntent =
    | { plane: { point: Models.OCCT.DesignPoint; normal: Models.OCCT.DesignPoint } }
    | { contains: Models.OCCT.DesignPoint[] }
    | { cylinder: { point: Models.OCCT.DesignPoint; direction: Models.OCCT.DesignPoint; radius: Models.OCCT.DesignNumber } };

/** Ground truth for edges: those between the faces two intents find. */
export interface EdgeIntent {
    between: [FaceIntent, FaceIntent];
}

/** A reference the benchmark follows through the variations, with what it is meant to find. */
export type BenchmarkReference =
    | { id: string; faces: Models.OCCT.DesignFaceReference; intent: FaceIntent }
    | { id: string; edges: Models.OCCT.DesignEdgeReference; intent: EdgeIntent };

/** A change to a case's document: parameter values, an edit of the document, or both. */
export interface BenchmarkVariation {
    id: string;
    parameters?: Readonly<Record<string, number | string | boolean>>;
    edit?: (document: Models.OCCT.DesignPartDocument) => Models.OCCT.DesignPartDocument;
}

/** One scenario: a document, the body its references are resolved on, the references and the variations. */
export interface BenchmarkCase {
    id: string;
    about: string;
    document: Models.OCCT.DesignPartDocument;
    body: string;
    references: BenchmarkReference[];
    variations: BenchmarkVariation[];
}

/** What a reference did in one variation, by its intended elements. */
export type BenchmarkStatus = "kept" | "lost" | "ambiguous" | "wrong";

/**
 * One reference in one variation: its status by lineage alone, and with a hint written from the
 * case's first variation and lost references rebound, what each found and what was meant.
 */
export interface BenchmarkResult {
    case: string;
    variation: string;
    reference: string;
    status: BenchmarkStatus;
    hinted: BenchmarkStatus;
    found: number[];
    hintedFound: number[];
    truth: number[];
}

/** The results of a corpus, the totals per status by lineage alone and with hints, and the variations that did not build. */
export interface BenchmarkReport {
    results: BenchmarkResult[];
    totals: Record<BenchmarkStatus, number>;
    hintedTotals: Record<BenchmarkStatus, number>;
    unbuilt: string[];
}

const TOLERANCE = 1e-6;

function unitOf(vector: readonly number[]): number[] {
    const length = Math.hypot(...vector);
    return vector.map(value => value / length);
}

function dot(a: readonly number[], b: readonly number[]): number {
    return a.reduce((sum, value, index) => sum + value * b[index]!, 0);
}

function minus(a: readonly number[], b: readonly number[]): number[] {
    return a.map((value, index) => value - b[index]!);
}

/** The faces of `body` an intent finds, ascending. */
export function intendedFaces(intent: FaceIntent, body: BodyState, run: DesignRun): number[] {
    const signatures = run.occt.analysis.signatures({ shape: body.shape }).faces;
    if ("plane" in intent) {
        const point = pointOf(intent.plane.point, run.parameters, "/intent/plane/point");
        const normal = unitOf(directionOf(intent.plane.normal, run.parameters, "/intent/plane/normal"));
        return signatures.flatMap(signature => signature.type === Inputs.OCCT.surfaceTypeEnum.plane
            && dot(unitOf(signature.normal), normal) > 1 - 1e-9
            && Math.abs(dot(normal, minus(signature.centre, point))) < TOLERANCE ? [signature.index] : []);
    }
    const near = (index: number, points: readonly number[][]): boolean => {
        const face = run.occt.shapes.face.getFace({ shape: body.shape, index });
        try {
            return run.occt.analysis.surfaces.closestPoints({ shape: face, points: points.map(point => [point[0]!, point[1]!, point[2]!] as Inputs.Base.Point3) }).some(found => found.distance < TOLERANCE);
        } finally {
            release(face);
        }
    };
    if ("contains" in intent) {
        const points = intent.contains.map((point, index) => pointOf(point, run.parameters, `/intent/contains/${index}`));
        return signatures.flatMap(signature => near(signature.index, points) ? [signature.index] : []);
    }
    const origin = pointOf(intent.cylinder.point, run.parameters, "/intent/cylinder/point");
    const axis = unitOf(directionOf(intent.cylinder.direction, run.parameters, "/intent/cylinder/direction"));
    const radius = numberOf(intent.cylinder.radius, run.parameters, "/intent/cylinder/radius");
    const helper = Math.abs(axis[0]!) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const first = unitOf(minus(helper, axis.map(value => value * dot(helper, axis))));
    const second = [axis[1]! * first[2]! - axis[2]! * first[1]!, axis[2]! * first[0]! - axis[0]! * first[2]!, axis[0]! * first[1]! - axis[1]! * first[0]!];
    return signatures.flatMap(signature => {
        if (signature.type !== Inputs.OCCT.surfaceTypeEnum.cylinder) {
            return [];
        }
        const offset = minus(signature.centre, origin);
        const along = dot(offset, axis);
        const across = minus(offset, axis.map(value => value * along));
        const length = Math.hypot(...across);
        const directions = length < TOLERANCE ? [first, second, first.map(value => -value), second.map(value => -value)] : [across.map(value => value / length)];
        const points = directions.map(direction => origin.map((value, index) => value + axis[index]! * along + direction[index]! * radius));
        return near(signature.index, points) ? [signature.index] : [];
    });
}

function intended(reference: BenchmarkReference, body: BodyState, run: DesignRun): number[] {
    if ("faces" in reference) {
        return intendedFaces(reference.intent, body, run);
    }
    const [first, second] = reference.intent.between.map(intent => intendedFaces(intent, body, run)) as [number[], number[]];
    if (first.length === 0 || second.length === 0) {
        return [];
    }
    return [...run.occt.select.edges.between({ shape: body.shape, indexes: first, otherIndexes: second })].sort((a, b) => a - b);
}

/** A reference with hints written from what it finds on `body`; edge references hint their two face references. */
function hinted(reference: BenchmarkReference, body: BodyState, run: DesignRun): BenchmarkReference {
    const context = contextOf(body, run);
    const hintOf = (faces: Models.OCCT.DesignFaceReference): Models.OCCT.DesignFaceReference => {
        try {
            const resolved = resolveFaces(faces, context, "/reference");
            return { ...faces, hint: referenceHintOf(resolved, body.shape, body.names, run.occt) };
        } catch (error) {
            if (error instanceof DesignProblem) {
                return faces;
            }
            throw error;
        }
    };
    if ("faces" in reference) {
        return { ...reference, faces: hintOf(reference.faces) };
    }
    return { ...reference, edges: { ...reference.edges, between: [hintOf(reference.edges.between[0]), hintOf(reference.edges.between[1])] } };
}

function found(reference: BenchmarkReference, body: BodyState, run: DesignRun): number[] | undefined {
    try {
        const context = contextOf(body, run);
        const elements = "faces" in reference ? resolveFaces(reference.faces, context, "/reference") : resolveEdges(reference.edges, context, "/reference");
        return [...elements].sort((a, b) => a - b);
    } catch (error) {
        if (error instanceof DesignProblem) {
            return undefined;
        }
        throw error;
    }
}

/**
 * How a reference fared: kept when it finds exactly the intended elements, or fails where none
 * exist; lost when it fails although they exist, or finds only some; ambiguous when it finds them
 * all and more; wrong when it finds an element outside the intent while missing one, or finds
 * anything where none exists.
 */
export function statusOf(foundElements: readonly number[] | undefined, truth: readonly number[]): BenchmarkStatus {
    if (foundElements === undefined || foundElements.length === 0) {
        return truth.length === 0 ? "kept" : "lost";
    }
    if (truth.length === 0) {
        return "wrong";
    }
    const extra = foundElements.some(element => !truth.includes(element));
    const missing = truth.some(element => !foundElements.includes(element));
    if (!extra && !missing) {
        return "kept";
    }
    if (!extra) {
        return "lost";
    }
    return missing ? "wrong" : "ambiguous";
}

/**
 * Builds every variation of every case and classifies every reference in it twice: by lineage alone,
 * and with hints written from the case's first variation, in a build that rebinds lost references.
 */
export function runBenchmark(cases: readonly BenchmarkCase[], occt: OCCTService, occ: BitbybitOcctModule): BenchmarkReport {
    const results: BenchmarkResult[] = [];
    const unbuilt: string[] = [];
    for (const benchmarkCase of cases) {
        const cache = new DesignCache(64);
        try {
            let hintedReferences: BenchmarkReference[] | undefined;
            for (const variation of benchmarkCase.variations) {
                const document = variation.edit === undefined ? benchmarkCase.document : variation.edit(benchmarkCase.document);
                const { run, report } = runFeatures(document, { overrides: variation.parameters ?? {} }, { occt, occ, cache, rebind: "report" });
                const body = run.bodies.get(benchmarkCase.body);
                const failed = report.filter(entry => entry.status === "failed");
                if (body === undefined || failed.length > 0) {
                    unbuilt.push(`${benchmarkCase.id}/${variation.id}: ${failed.map(entry => `${entry.id} ${entry.messages.join("; ")}`).join(" | ") || `no body "${benchmarkCase.body}"`}`);
                    continue;
                }
                hintedReferences ??= benchmarkCase.references.map(reference => hinted(reference, body, run));
                benchmarkCase.references.forEach((reference, index) => {
                    const truth = intended(reference, body, run);
                    const resolved = found(reference, body, run);
                    const resolvedWithHint = found(hintedReferences![index]!, body, run);
                    results.push({
                        case: benchmarkCase.id,
                        variation: variation.id,
                        reference: reference.id,
                        status: statusOf(resolved, truth),
                        hinted: statusOf(resolvedWithHint, truth),
                        found: resolved ?? [],
                        hintedFound: resolvedWithHint ?? [],
                        truth,
                    });
                });
            }
        } finally {
            cache.clear();
        }
    }
    const tally = (pick: (result: BenchmarkResult) => BenchmarkStatus): Record<BenchmarkStatus, number> => {
        const totals: Record<BenchmarkStatus, number> = { kept: 0, lost: 0, ambiguous: 0, wrong: 0 };
        results.forEach(result => {
            totals[pick(result)] += 1;
        });
        return totals;
    };
    return { results, totals: tally(result => result.status), hintedTotals: tally(result => result.hinted), unbuilt };
}

/** The benchmark in one line: how many references in how many variations, and the totals per status by lineage alone and with hints. */
export function summaryLine(report: BenchmarkReport, cases: number): string {
    const line = (totals: Record<BenchmarkStatus, number>): string => `kept ${totals.kept}, lost ${totals.lost}, ambiguous ${totals.ambiguous}, wrong ${totals.wrong}`;
    return `naming benchmark: ${report.results.length} checks over ${cases} cases - by lineage: ${line(report.totals)}; with hints: ${line(report.hintedTotals)}`;
}
