import { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Models from "../../api/models";
import { callByPath } from "@bitbybit-dev/base";
import { FaceNames, facesCopied, nameOf } from "./names";
import type { OCCTService } from "../../occ-service";
import { Rebinding, candidatesOf, rebindOf, recordHint, referenceHintOf } from "./hints";
import { DesignProblem, isKernelTrap, pointer } from "./problems";

/**
 * What a reference is resolved against: a body's shape and its face names, the package to filter
 * with, the features that were suppressed, and how references with hints are treated.
 */
export interface ResolveContext {
    shape: TopoDS_Shape;
    names: FaceNames;
    occt: OCCTService;
    suppressed: ReadonlySet<string>;
    rebinding?: Rebinding | undefined;
}

function filtered(kind: "faces" | "edges", found: number[], filter: Models.OCCT.DesignFilter | undefined, context: ResolveContext, path: string): number[] {
    if (filter === undefined || found.length === 0) {
        return found;
    }
    const { select, ...inputs } = filter;
    try {
        return callByPath(context.occt, `select.${kind}.${select}`, { ...inputs, shape: context.shape, indexes: found }) as number[];
    } catch (error) {
        if (isKernelTrap(error)) {
            throw error;
        }
        throw new DesignProblem(pointer(path, "filter"), `the filter failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/** What is wrong with what a reference found, when its count or an empty result is wrong. */
export function countProblem(found: number[], count: number | undefined, kind: "face" | "edge"): string | undefined {
    const what = found.length === 1 ? kind : `${kind}s`;
    if (count !== undefined && found.length !== count) {
        return `the reference expects ${count} ${what} and finds ${found.length}${found.length > 0 ? ` (${found.join(", ")})` : ""}`;
    }
    return found.length === 0 ? `the reference finds no ${what}` : undefined;
}

function checkedCount(found: number[], count: number | undefined, kind: "face" | "edge", path: string): number[] {
    const problem = countProblem(found, count, kind);
    if (problem !== undefined) {
        throw new DesignProblem(path, problem);
    }
    return found;
}

/** The copy levels a face reference lists: none, one, or one per level. */
export function copyLevels(reference: Models.OCCT.DesignFaceReference): Models.OCCT.DesignCopy[] {
    return reference.copy === undefined ? [] : Array.isArray(reference.copy) ? reference.copy : [reference.copy];
}

/** The faces a face reference finds before its count is checked: those holding its name, then its filter. */
export function facesFound(reference: Models.OCCT.DesignFaceReference, context: ResolveContext, path: string): number[] {
    if (context.suppressed.has(reference.of)) {
        throw new DesignProblem(path, `"${reference.of}" is suppressed, so it made no faces`);
    }
    return filtered("faces", facesCopied(context.names, nameOf(reference.of, reference.role, reference.from), copyLevels(reference)), reference.filter, context, path);
}

/**
 * The faces a face reference names: those holding its name, then its filter, then its count. When
 * they are lost and the reference has a hint, the faces most like it are scored: a run that rebinds
 * takes them when they stand clear, and either way the run records them. A run that writes hints
 * records one for each reference it resolves.
 */
export function resolveFaces(reference: Models.OCCT.DesignFaceReference, context: ResolveContext, path: string): number[] {
    const found = facesFound(reference, context, path);
    const problem = countProblem(found, reference.count, "face");
    const rebinding = context.rebinding;
    if (problem === undefined) {
        if (rebinding?.hints !== undefined) {
            recordHint(rebinding.hints, path, referenceHintOf(found, context.shape, context.names, context.occt));
        }
        return found;
    }
    if (rebinding !== undefined && reference.hint !== undefined) {
        const candidates = candidatesOf(reference.hint, context.shape, context.names, context.occt);
        const needed = reference.count ?? reference.hint.faces.length;
        const rebound = rebindOf(candidates, needed);
        if (rebound !== undefined && rebinding.mode === "report") {
            rebinding.entries.push({ path, kind: "rebound", faces: rebound.faces, score: rebound.score });
            return rebound.faces;
        }
        const offered = rebound ?? { faces: candidates.slice(0, needed).map(candidate => candidate.face).sort((a, b) => a - b), score: candidates[needed - 1]?.score ?? 0 };
        rebinding.entries.push({ path, kind: "repair", faces: offered.faces, score: offered.score, clear: rebound !== undefined });
    }
    throw new DesignProblem(path, problem);
}

/** The edges between two sets of faces an edge reference found, then its filter, before its count is checked. */
export function edgesBetween(reference: Models.OCCT.DesignEdgeReference, first: number[], second: number[], context: ResolveContext, path: string): number[] {
    const between = callByPath(context.occt, "select.edges.between", { shape: context.shape, indexes: first, otherIndexes: second }) as number[];
    return filtered("edges", between, reference.filter, context, path);
}

/** The edges an edge reference names: those between its two sets of faces, then its filter, then its count. */
export function resolveEdges(reference: Models.OCCT.DesignEdgeReference, context: ResolveContext, path: string): number[] {
    const first = resolveFaces(reference.between[0], context, pointer(path, "between", 0));
    const second = resolveFaces(reference.between[1], context, pointer(path, "between", 1));
    return checkedCount(edgesBetween(reference, first, second, context, path), reference.count, "edge", path);
}
