import { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Models from "../../api/models";
import { InputError } from "@bitbybit-dev/base";
import { release } from "./cache";
import { contextOf } from "./helpers";
import { DesignProblem, isKernelTrap, pointer } from "./problems";
import { countProblem, edgesBetween, facesFound } from "./references";
import { runFeatures } from "./runner";
import { BodyState, DesignRun, DesignRunContext, bodyKey } from "./state";
import { ParameterChoice, numberOf } from "./values";

type Rounding = Models.OCCT.DesignFilletFeature | Models.OCCT.DesignChamferFeature;

const CLOSE_ENOUGH = 0.02;

const SMALLEST = 1e-6;

function problemText(error: unknown): string {
    if (error instanceof DesignProblem) {
        return `${error.path}: ${error.message}`;
    }
    return error instanceof Error ? error.message : String(error);
}

function roundingOf(document: Models.OCCT.DesignPartDocument, id: string): { feature: Rounding; index: number } {
    const index = document.features.findIndex(feature => feature.id === id);
    if (index < 0) {
        throw new InputError(`The document has no feature "${id}".`, "feature");
    }
    const feature = document.features[index]!;
    if (feature.type !== "fillet" && feature.type !== "chamfer") {
        throw new InputError(`"${id}" is a ${feature.type} feature; only a fillet or a chamfer is probed.`, "feature");
    }
    return { feature, index };
}

function bodyBefore(feature: Rounding, report: Models.OCCT.DesignFeatureReport[], run: DesignRun): BodyState {
    const body = run.bodies.get(feature.body);
    if (body !== undefined) {
        return body;
    }
    const why = report.filter(entry => entry.status === "failed").flatMap(entry => entry.messages.map(message => `"${entry.id}": ${message}`)).slice(0, 3);
    const state = run.failed.get(bodyKey(feature.body)) === "suppressed" ? "is suppressed" : "did not build";
    throw new InputError(`The body "${feature.body}" ${state} before "${feature.id}", so it has no edges to probe${why.length > 0 ? `: ${why.join("; ")}` : ""}.`, "document");
}

function noted<T>(probe: Models.OCCT.DesignFilletProbe, fallback: T, find: () => T): T {
    try {
        return find();
    } catch (error) {
        if (!(error instanceof DesignProblem)) {
            throw error;
        }
        probe.messages.push(problemText(error));
        return fallback;
    }
}

function edgesOf(feature: Rounding, path: string, body: BodyState, run: DesignRun, probe: Models.OCCT.DesignFilletProbe): number[] {
    const context = contextOf(body, run);
    const side = (index: 0 | 1): number[] => noted(probe, [], () => {
        const at = pointer(path, "edges", "between", index);
        const reference = feature.edges.between[index];
        const found = facesFound(reference, context, at);
        const problem = countProblem(found, reference.count, "face");
        if (problem !== undefined) {
            probe.messages.push(`${at}: ${problem}`);
        }
        return found;
    });
    probe.between = [side(0), side(1)];
    const [first, second] = probe.between;
    if (first.length === 0 || second.length === 0) {
        return [];
    }
    return noted(probe, [], () => {
        const at = pointer(path, "edges");
        const found = edgesBetween(feature.edges, first, second, context, at);
        const problem = countProblem(found, feature.edges.count, "edge");
        if (problem !== undefined) {
            probe.messages.push(`${at}: ${problem}`);
        }
        return found;
    });
}

function valueOf(feature: Rounding, path: string, run: DesignRun, probe: Models.OCCT.DesignFilletProbe): number | undefined {
    return noted<number | undefined>(probe, undefined, () => feature.type === "fillet"
        ? numberOf(feature.radius, run.parameters, pointer(path, "radius"))
        : numberOf(feature.distance, run.parameters, pointer(path, "distance")));
}

function attempt(feature: Rounding, body: BodyState, indexes: number[], value: number, run: DesignRun, probe: Models.OCCT.DesignFilletProbe): boolean {
    const started = performance.now();
    const ms = (): number => performance.now() - started;
    let made: TopoDS_Shape | undefined;
    try {
        made = feature.type === "fillet"
            ? run.occt.fillets.filletEdges({ shape: body.shape, radius: value, indexes })
            : run.occt.fillets.chamferEdges({ shape: body.shape, distance: value, indexes });
        const builds = run.occt.shapeFix.isValid({ shape: made });
        probe.attempts.push(builds ? { value, builds, ms: ms() } : { value, builds, ms: ms(), message: "the kernel made it, but the result is not a valid shape" });
        return builds;
    } catch (error) {
        if (isKernelTrap(error)) {
            throw error;
        }
        probe.attempts.push({ value, builds: false, ms: ms(), message: problemText(error) });
        return false;
    } finally {
        if (made !== undefined) {
            release(made);
        }
    }
}

function search(feature: Rounding, body: BodyState, indexes: number[], value: number | undefined, maxAttempts: number, run: DesignRun, probe: Models.OCCT.DesignFilletProbe): void {
    const size = run.occt.operations.boundingBoxSizeOfShape({ shape: body.shape });
    const limit = Math.hypot(size[0], size[1], size[2]);
    const tried = (next: number): boolean => attempt(feature, body, indexes, next, run, probe);
    const left = (): boolean => probe.attempts.length < maxAttempts;
    const start = value !== undefined && value > 0 ? value : limit / 16;
    let good = 0;
    let bad = Number.POSITIVE_INFINITY;
    if (tried(start)) {
        good = start;
    } else {
        bad = start;
    }
    probe.builds = good > 0 && start === value;
    while (bad === Number.POSITIVE_INFINITY && good < limit && left()) {
        const next = Math.min(good * 2, limit);
        if (tried(next)) {
            good = next;
        } else {
            bad = next;
        }
    }
    while (good === 0 && bad > limit * SMALLEST && left()) {
        const next = bad / 2;
        if (tried(next)) {
            good = next;
        } else {
            bad = next;
        }
    }
    while (good > 0 && bad - good > bad * CLOSE_ENOUGH && left()) {
        const middle = (good + bad) / 2;
        if (tried(middle)) {
            good = middle;
        } else {
            bad = middle;
        }
    }
    if (good > 0) {
        probe.largest = good;
    }
    if (bad !== Number.POSITIVE_INFINITY) {
        probe.smallestFailing = bad;
    }
}

/**
 * Probes a fillet or chamfer feature of a checked part document: runs the features before it as a
 * build does, resolves its edge reference on its body without checking counts, and tries values,
 * the document's own first, then doubling or halving until one builds and one does not, then
 * halving the gap between them until it is within 2 percent, for at most `maxAttempts` tries. The cache is trimmed as a build
 * trims it, keeping what this run used.
 */
export function probeRounding(document: Models.OCCT.DesignPartDocument, choice: ParameterChoice, context: DesignRunContext, id: string, maxAttempts: number): Models.OCCT.DesignFilletProbe {
    const { feature, index } = roundingOf(document, id);
    const path = pointer("/features", index);
    const { run, report } = runFeatures({ ...document, features: document.features.slice(0, index) }, choice, context);
    run.cache.trim(run.used);
    const body = bodyBefore(feature, report, run);
    const probe: Models.OCCT.DesignFilletProbe = { feature: id, type: feature.type, between: [[], []], edges: [], count: feature.edges.count, builds: false, attempts: [], messages: [] };
    const indexes = edgesOf(feature, path, body, run, probe);
    if (indexes.length > 0) {
        const signatures = new Map(run.occt.analysis.signatures({ shape: body.shape }).edges.map(edge => [edge.index, edge]));
        probe.edges = indexes.map(edge => signatures.get(edge)!);
    }
    const value = valueOf(feature, path, run, probe);
    if (value !== undefined) {
        probe.value = value;
    }
    if (indexes.length > 0) {
        search(feature, body, indexes, value, maxAttempts, run, probe);
    }
    return probe;
}
