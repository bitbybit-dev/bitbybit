import { messageOf } from "@bitbybit-dev/base";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { nameParts } from "./names";
import { nothing, unlessTrapped } from "./problems";
import type { ResolveContext } from "./references";
import { edgesBetween, facesFound } from "./references";

type FaceReference = Models.OCCT.DesignFaceReference;

type EdgeReference = Models.OCCT.DesignEdgeReference;

/** A reference that names exactly the picked elements, or why none does. */
export type Synthesized<T> = { reference: T } | { refused: string };

interface Candidate {
    name: string;
    reference: FaceReference;
    faces: number[];
    specificity: number;
    order: number;
}

interface CandidatePair {
    between: [FaceReference, FaceReference];
    specificity: number;
    order: number;
    name: string;
}

interface AxisFilter {
    select: string;
    direction: Inputs.Base.Vector3;
}

const AXES: readonly Inputs.Base.Vector3[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0, 0], [0, -1, 0], [0, 0, -1]];

const FACE_FILTERS: readonly AxisFilter[] = [...AXES.map(direction => ({ select: "facing", direction })), ...AXES.map(direction => ({ select: "extreme", direction }))];

const POSITIVE_AXES = 3;

const EDGE_FILTERS: readonly AxisFilter[] = [...AXES.slice(0, POSITIVE_AXES).map(direction => ({ select: "along", direction })), ...AXES.map(direction => ({ select: "extreme", direction }))];

const SUPERSETS = 3;

const UNKNOWN_ORDER = Number.MAX_SAFE_INTEGER;

/** The reference a face name stands for: its feature, role and source, and the copies it is of. */
export function referenceOfName(name: string): FaceReference {
    const { base, copies } = nameParts(name);
    const [of = "", role = "", ...rest] = base.split(":");
    const levels = [...copies].map(([copier, index]): Models.OCCT.DesignCopy => ({ of: copier, index }));
    const [single] = levels;
    return {
        of,
        role,
        ...(rest.length > 0 ? { from: rest.join(":") } : {}),
        ...(single === undefined ? {} : { copy: levels.length === 1 ? single : levels }),
    };
}

function quietly(read: () => number[]): number[] | undefined {
    return unlessTrapped<number[] | undefined>(read, nothing);
}

function sameSet(found: readonly number[], wanted: readonly number[]): boolean {
    const set = new Set(found);
    return set.size === new Set(wanted).size && wanted.every(item => set.has(item));
}

function covers(found: readonly number[], wanted: readonly number[]): boolean {
    const set = new Set(found);
    return wanted.every(item => set.has(item));
}

function byPreference(first: Pick<Candidate, "specificity" | "order" | "name">, second: Pick<Candidate, "specificity" | "order" | "name">): number {
    return first.specificity - second.specificity || first.order - second.order || first.name.localeCompare(second.name);
}

function candidatesOf(names: readonly string[], context: ResolveContext, order: ReadonlyMap<string, number>): Candidate[] {
    return names.flatMap(name => {
        const reference = referenceOfName(name);
        const faces = quietly(() => facesFound(reference, context, ""));
        if (faces === undefined) {
            return [];
        }
        const specificity = (reference.from === undefined ? 0 : 1) + nameParts(name).copies.size;
        return [{ name, reference, faces, specificity, order: order.get(reference.of) ?? UNKNOWN_ORDER }];
    }).sort(byPreference);
}

function plural(count: number, word: string): string {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/**
 * A face reference that finds exactly `faces` of the body `context` holds: the least specific name
 * all of them hold and no other face does, preferring the earliest feature, else one of the names
 * that hold them among others, narrowed by a `facing` or `extreme` filter along an axis.
 */
export function faceReferenceFor(faces: readonly number[], context: ResolveContext, order: ReadonlyMap<string, number>): Synthesized<FaceReference> {
    const held = faces.map(face => new Set(context.names[face] ?? []));
    const shared = [...held[0] ?? []].filter(name => held.every(names => names.has(name)));
    const candidates = candidatesOf(shared, context, order);
    const exact = candidates.find(candidate => sameSet(candidate.faces, faces));
    if (exact !== undefined) {
        return { reference: { ...exact.reference, count: faces.length } };
    }
    const supersets = candidates.filter(candidate => candidate.faces.length > faces.length && covers(candidate.faces, faces))
        .sort((first, second) => first.faces.length - second.faces.length || byPreference(first, second))
        .slice(0, SUPERSETS);
    for (const superset of supersets) {
        for (const filter of FACE_FILTERS) {
            const reference: FaceReference = { ...superset.reference, filter: { select: filter.select, direction: [...filter.direction] } };
            const found = quietly(() => facesFound(reference, context, ""));
            if (found !== undefined && sameSet(found, faces)) {
                return { reference: { ...reference, count: faces.length } };
            }
        }
    }
    return { refused: `no name covers exactly the ${plural(faces.length, "picked face")}; pick faces one feature made` };
}

function edgesOf(reference: EdgeReference, context: ResolveContext): number[] | undefined {
    const first = quietly(() => facesFound(reference.between[0], context, ""));
    const second = quietly(() => facesFound(reference.between[1], context, ""));
    return first === undefined || second === undefined ? undefined : quietly(() => edgesBetween(reference, first, second, context, ""));
}

/**
 * An edge reference that finds exactly `edges` of the body `context` holds: the edges between two
 * names held by the faces along them, the least specific pair first, else such a pair whose edges
 * hold them among others, narrowed by an `along` or `extreme` filter along an axis.
 */
export function edgeReferenceFor(edges: readonly number[], context: ResolveContext, order: ReadonlyMap<string, number>): Synthesized<EdgeReference> {
    const adjacent = unlessTrapped<number[] | string>(() => context.occt.select.faces.ofEdges({ shape: context.shape, indexes: [...edges] }), messageOf);
    if (typeof adjacent === "string") {
        return { refused: `the faces along the picked edges could not be read: ${adjacent}` };
    }
    const names = [...new Set(adjacent.flatMap(face => context.names[face] ?? []))];
    const candidates = candidatesOf(names, context, order);
    const pairs = candidates.flatMap((first, index) => candidates.slice(index).map((second): CandidatePair => ({
        between: [first.reference, second.reference],
        specificity: first.specificity + second.specificity,
        order: Math.max(first.order, second.order),
        name: `${first.name}|${second.name}`,
    }))).sort(byPreference);
    const supersets: EdgeReference[] = [];
    for (const pair of pairs) {
        const reference: EdgeReference = { between: pair.between, count: edges.length };
        const found = edgesOf(reference, context);
        if (found !== undefined && sameSet(found, edges)) {
            return { reference };
        }
        if (found !== undefined && found.length > edges.length && covers(found, edges) && supersets.length < SUPERSETS) {
            supersets.push(reference);
        }
    }
    for (const superset of supersets) {
        for (const filter of EDGE_FILTERS) {
            const reference: EdgeReference = { ...superset, filter: { select: filter.select, direction: [...filter.direction] } };
            const found = edgesOf(reference, context);
            if (found !== undefined && sameSet(found, edges)) {
                return { reference };
            }
        }
    }
    return { refused: `no two named sets of faces have exactly the ${plural(edges.length, "picked edge")} between them; pick edges along the same faces` };
}
