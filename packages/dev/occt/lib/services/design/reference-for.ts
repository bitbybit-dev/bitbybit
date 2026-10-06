import { isRecord } from "@bitbybit-dev/base";
import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Models from "../../api/models";
import { contextOf } from "./helpers";
import { DesignProblem, nothing, unlessTrapped } from "./problems";
import type { ResolveContext } from "./references";
import { resolveEdges, resolveFaces } from "./references";
import { runFeatures } from "./runner";
import type { DesignRun, DesignRunContext } from "./state";
import type { Synthesized } from "./synthesis";
import { edgeReferenceFor, faceReferenceFor } from "./synthesis";
import type { ParameterChoice } from "./values";
import { declaredValues } from "./values";

/** Faces or edges picked on a body, by index. */
export interface DesignPicked {
    kind: "faces" | "edges";
    indexes: number[];
}

type Reference = Models.OCCT.DesignFaceReference | Models.OCCT.DesignEdgeReference;

interface Look {
    type: string;
    direction: readonly number[];
}

const MOST_NUDGED = 8;

const NUDGE = 0.01;

const LEAST_NUDGE = 1e-3;

const ALIKE = 0.99;

const BROKEN = new Set<Models.OCCT.DesignFeatureReport["status"]>(["failed", "skipped", "pending"]);

function looksOf(picked: DesignPicked, shape: TopoDS_Shape, indexes: readonly number[], run: DesignRun): Look[] {
    const wanted = new Set(indexes);
    const signatures = run.occt.analysis.signatures({ shape });
    return picked.kind === "faces"
        ? signatures.faces.filter(face => wanted.has(face.index)).map(face => ({ type: face.type, direction: face.normal }))
        : signatures.edges.filter(edge => wanted.has(edge.index)).map(edge => ({ type: edge.type, direction: edge.tangent }));
}

function along(first: readonly number[], second: readonly number[]): number {
    return Math.abs(first.reduce((sum, value, axis) => sum + value * (second[axis] ?? 0), 0));
}

function alike(picked: readonly Look[], found: readonly Look[]): boolean {
    const left = [...found];
    return picked.length === found.length && picked.every(look => {
        const match = left.findIndex(other => other.type === look.type && along(other.direction, look.direction) >= ALIKE);
        if (match === -1) {
            return false;
        }
        left.splice(match, 1);
        return true;
    });
}

function resolved(reference: Reference, context: ResolveContext): number[] | undefined {
    return unlessTrapped<number[] | undefined>(() => "between" in reference ? resolveEdges(reference, context, "") : resolveFaces(reference, context, ""), nothing);
}

function numberIn(record: Record<string, unknown>, key: string): number | undefined {
    const value = record[key];
    return typeof value === "number" ? value : undefined;
}

function nudgedValue(value: number, declaration: unknown): number | undefined {
    const bounds = isRecord(declaration) ? declaration : { value: declaration };
    if (typeof bounds["value"] === "boolean" || (bounds["type"] !== undefined && bounds["type"] !== "number")) {
        return undefined;
    }
    const step = numberIn(bounds, "step") ?? Math.max(Math.abs(value) * NUDGE, LEAST_NUDGE);
    const [min, max] = [numberIn(bounds, "min"), numberIn(bounds, "max")];
    if (max === undefined || value + step <= max) {
        return value + step;
    }
    return min === undefined || value - step >= min ? value - step : undefined;
}

function nudgeable(document: Models.OCCT.DesignPartDocument, reads: ReadonlySet<string>, run: DesignRun): [string, number][] {
    return Object.entries(declaredValues(reads, run.parameters, run.derived)).flatMap(([name, value]): [string, number][] => {
        const moved = typeof value === "number" ? nudgedValue(value, document.parameters?.[name]) : undefined;
        return moved === undefined ? [] : [[name, moved]];
    }).slice(0, MOST_NUDGED);
}

/**
 * A reference for faces or edges picked on a body of a checked part document, and how it holds up:
 * the document is built, the reference synthesized from the body's face names (and an axis filter
 * when names alone do not single the picks out), and, with `nudge`, the document built again with each
 * declared number the body depends on moved a little, one at a time. A move after which some feature
 * that built fails or is skipped is left out, as it says nothing of the reference; one after which the
 * reference finds nothing, a different number of elements or elements of another kind or facing
 * another way is listed as `lost`, a feature the move suppresses included.
 */
export function referenceFor(document: Models.OCCT.DesignPartDocument, choice: ParameterChoice, context: DesignRunContext, body: string, picked: DesignPicked, nudge: boolean): Models.OCCT.DesignReferenceFound {
    const { run, report } = runFeatures(document, choice, context);
    run.cache.trim(run.used);
    const state = run.bodies.get(body);
    if (state === undefined) {
        throw new DesignProblem("/body", `"${body}" is not a body this document builds`);
    }
    const order = new Map(document.features.map((feature, index) => [feature.id, index]));
    const synthesized: Synthesized<Reference> = picked.kind === "faces"
        ? faceReferenceFor(picked.indexes, contextOf(state, run), order)
        : edgeReferenceFor(picked.indexes, contextOf(state, run), order);
    if ("refused" in synthesized) {
        return { refused: synthesized.refused, nudged: [], lost: [] };
    }
    const reference = synthesized.reference;
    const found: Models.OCCT.DesignReferenceFound = { reference, nudged: [], lost: [] };
    if (!nudge) {
        return found;
    }
    const looks = looksOf(picked, state.shape, picked.indexes, run);
    const built = new Set(report.filter(entry => entry.status === "ok").map(entry => entry.id));
    for (const [name, value] of nudgeable(document, state.reads, run)) {
        const moved = runFeatures(document, { ...choice, overrides: { ...choice.overrides, [name]: value } }, context);
        moved.run.cache.trim(moved.run.used);
        const movedBody = moved.run.bodies.get(body);
        if (movedBody === undefined || moved.report.some(entry => built.has(entry.id) && BROKEN.has(entry.status))) {
            continue;
        }
        found.nudged.push(name);
        const indexes = resolved(reference, contextOf(movedBody, moved.run));
        if (indexes === undefined || !alike(looks, looksOf(picked, movedBody.shape, indexes, moved.run))) {
            found.lost.push(name);
        }
    }
    return found;
}
