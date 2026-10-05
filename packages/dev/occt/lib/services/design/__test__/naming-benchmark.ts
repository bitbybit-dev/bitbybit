import type { BitbybitOcctModule } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OCCTService } from "../../../occ-service";
import * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import { DesignCache, release } from "../cache";
import { contextOf } from "../helpers";
import { referenceHintOf } from "../hints";
import { DesignProblem } from "../problems";
import { resolveEdges, resolveFaces } from "../references";
import { runFeatures } from "../runner";
import type { BodyState, DesignRun } from "../state";
import { directionOf, numberOf, pointOf } from "../values";
import { unitVector } from "../placement";
import { BaseBitByBit } from "../../../base";

export type FaceIntent =
    | { plane: { point: Models.OCCT.DesignPoint; normal: Models.OCCT.DesignPoint } }
    | { contains: Models.OCCT.DesignPoint[] }
    | { cylinder: { point: Models.OCCT.DesignPoint; direction: Models.OCCT.DesignPoint; radius: Models.OCCT.DesignNumber } };

export interface EdgeIntent {
    between: [FaceIntent, FaceIntent];
}

export type BenchmarkReference =
    | { id: string; faces: Models.OCCT.DesignFaceReference; intent: FaceIntent }
    | { id: string; edges: Models.OCCT.DesignEdgeReference; intent: EdgeIntent };

export interface BenchmarkVariation {
    id: string;
    parameters?: Readonly<Record<string, number | string | boolean>>;
    edit?: (document: Models.OCCT.DesignPartDocument) => Models.OCCT.DesignPartDocument;
}

export interface BenchmarkCase {
    id: string;
    about: string;
    document: Models.OCCT.DesignPartDocument;
    body: string;
    references: BenchmarkReference[];
    variations: BenchmarkVariation[];
}

export type BenchmarkStatus = "kept" | "lost" | "ambiguous" | "wrong";

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

export interface BenchmarkReport {
    results: BenchmarkResult[];
    totals: Record<BenchmarkStatus, number>;
    hintedTotals: Record<BenchmarkStatus, number>;
    unbuilt: string[];
}

const TOLERANCE = 1e-6;

export function intendedFaces(intent: FaceIntent, body: BodyState, run: DesignRun): number[] {
    const signatures = run.occt.analysis.signatures({ shape: body.shape }).faces;
    const vector = run.base.vector;
    if ("plane" in intent) {
        const point = pointOf(intent.plane.point, run.parameters, "/intent/plane/point");
        const normal = unitVector(directionOf(intent.plane.normal, run.parameters, "/intent/plane/normal"), "/intent/plane/normal", run.base);
        return signatures.flatMap(signature => signature.type === Inputs.OCCT.surfaceTypeEnum.plane
            && vector.dot({ first: unitVector(signature.normal, "/intent/plane/normal", run.base), second: normal }) > 1 - 1e-9
            && Math.abs(vector.dot({ first: normal, second: vector.sub({ first: signature.centre, second: point }) })) < TOLERANCE ? [signature.index] : []);
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
    const axis = unitVector(directionOf(intent.cylinder.direction, run.parameters, "/intent/cylinder/direction"), "/intent/cylinder/direction", run.base);
    const radius = numberOf(intent.cylinder.radius, run.parameters, "/intent/cylinder/radius");
    const around = run.base.frame.fromPointAndNormal({ origin, normal: axis });
    const first = around.direction;
    const second = run.base.frame.yDirection({ frame: around });
    const sideways = [first, second, vector.neg({ vector: first }), vector.neg({ vector: second })];
    return signatures.flatMap(signature => {
        if (signature.type !== Inputs.OCCT.surfaceTypeEnum.cylinder) {
            return [];
        }
        const offset = vector.sub({ first: signature.centre, second: origin });
        const along = vector.dot({ first: offset, second: axis });
        const across = vector.sub({ first: offset, second: vector.mul({ vector: axis, scalar: along }) });
        const directions = vector.norm({ vector: across }) < TOLERANCE ? sideways : [vector.normalized({ vector: across })!];
        const points = directions.map(direction => vector.addAll({ vectors: [origin, vector.mul({ vector: axis, scalar: along }), vector.mul({ vector: direction, scalar: radius })] }));
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

function hinted(reference: BenchmarkReference, body: BodyState, run: DesignRun): BenchmarkReference {
    const context = contextOf(body, run);
    const hintOf = (faces: Models.OCCT.DesignFaceReference): Models.OCCT.DesignFaceReference => {
        try {
            const resolved = resolveFaces(faces, context, "/reference");
            return { ...faces, hint: referenceHintOf(resolved, body.shape, body.names, run) };
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

export function runBenchmark(cases: readonly BenchmarkCase[], occt: OCCTService, occ: BitbybitOcctModule): BenchmarkReport {
    const results: BenchmarkResult[] = [];
    const unbuilt: string[] = [];
    for (const benchmarkCase of cases) {
        const cache = new DesignCache(64);
        try {
            let hintedReferences: BenchmarkReference[] | undefined;
            for (const variation of benchmarkCase.variations) {
                const document = variation.edit === undefined ? benchmarkCase.document : variation.edit(benchmarkCase.document);
                const { run, report } = runFeatures(document, { overrides: variation.parameters ?? {} }, { occt, occ, base: new BaseBitByBit(), cache, rebind: "report" });
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

export function summaryLine(report: BenchmarkReport, cases: number): string {
    const line = (totals: Record<BenchmarkStatus, number>): string => `kept ${totals.kept}, lost ${totals.lost}, ambiguous ${totals.ambiguous}, wrong ${totals.wrong}`;
    return `naming benchmark: ${report.results.length} checks over ${cases} cases - by lineage: ${line(report.totals)}; with hints: ${line(report.hintedTotals)}`;
}
