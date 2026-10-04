import { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OCCTService } from "../../occ-service";
import * as Models from "../../api/models";
import type { FaceNames } from "./names";

/**
 * The share each fact has in a face's likeness to a hint. Where a body holds none of the names a
 * hint's neighbours had, as after an operation that keeps no history, the neighbours say nothing and
 * the other facts share the likeness.
 */
const WEIGHTS = { normal: 0.35, area: 0.2, neighbours: 0.45 };

/** How far, in fractions of the body's box, a face may lie from a hinted centre before it scores nothing. */
const REACH = 0.25;

/** The least score a face needs to be taken for a lost reference. */
export const REBIND_SCORE = 0.75;

/** How far each face taken must beat the best face left out, so a tie is never settled by chance. */
export const REBIND_MARGIN = 0.1;

/** What a lost reference with a hint became in a build, by its JSON pointer: rebound to faces, or offered them as a repair. */
export interface RebindEntry {
    path: string;
    kind: "rebound" | "repair";
    faces: number[];
    score: number;
    clear?: boolean;
}

/** How a run treats references that carry hints: whether it rebinds lost ones, what it found, and hints to record when it writes them. */
export interface Rebinding {
    mode: "never" | "report";
    entries: RebindEntry[];
    hints?: Map<string, Models.OCCT.DesignReferenceHint | null> | undefined;
}

/** Records the hint of a reference at `path`; a path resolved to other faces elsewhere gets none, as a connector set's axis does. */
export function recordHint(hints: Map<string, Models.OCCT.DesignReferenceHint | null>, path: string, hint: Models.OCCT.DesignReferenceHint): void {
    const known = hints.get(path);
    hints.set(path, known === undefined || (known !== null && JSON.stringify(known) === JSON.stringify(hint)) ? hint : null);
}

const unescaped = (token: string): string => token.replace(/~1/g, "/").replace(/~0/g, "~");

/** A copy of `document` with each recorded hint written onto the face reference at its JSON pointer. */
export function hintedDocument<T extends object>(document: T, hints: ReadonlyMap<string, Models.OCCT.DesignReferenceHint | null>): T {
    const copy = JSON.parse(JSON.stringify(document)) as T;
    for (const [path, hint] of hints) {
        if (hint === null) {
            continue;
        }
        let target: unknown = copy;
        for (const token of path.split("/").slice(1).map(unescaped)) {
            target = typeof target === "object" && target !== null ? (target as Record<string, unknown>)[token] : undefined;
        }
        if (typeof target === "object" && target !== null && "of" in target) {
            (target as Record<string, unknown>)["hint"] = hint;
        }
    }
    return copy;
}

interface BodyFacts {
    faces: Models.OCCT.FaceSignature[];
    min: readonly number[];
    size: readonly number[];
    area: number;
    adjacent: number[][];
}

const factsByShape = new WeakMap<TopoDS_Shape, BodyFacts>();

function factsOf(shape: TopoDS_Shape, occt: OCCTService): BodyFacts {
    let facts = factsByShape.get(shape);
    if (facts === undefined) {
        const faces = occt.analysis.signatures({ shape }).faces;
        const min = [0, 1, 2].map(axis => Math.min(...faces.map(face => face.box.min[axis]!)));
        const max = [0, 1, 2].map(axis => Math.max(...faces.map(face => face.box.max[axis]!)));
        const adjacency = new Map(occt.brepGraph.faceAdjacency({ shape }).faces.map(entry => [entry.index, entry.adjacent]));
        facts = {
            faces,
            min,
            size: max.map((value, axis) => value - min[axis]!),
            area: faces.reduce((sum, face) => sum + face.area, 0),
            adjacent: faces.map(face => [...(adjacency.get(face.index) ?? [])]),
        };
        factsByShape.set(shape, facts);
    }
    return facts;
}

const rounded = (value: number): number => Math.round(value * 1e6) / 1e6 + 0;

function unit(vector: readonly number[]): number[] {
    const length = Math.hypot(...vector);
    return length === 0 ? [0, 0, 0] : vector.map(value => value / length);
}

function neighboursOf(index: number, facts: BodyFacts, names: FaceNames): string[] {
    return [...new Set(facts.adjacent[index]!.flatMap(face => names[face] ?? []))].sort();
}

const fractionOf = (facts: BodyFacts, value: number, axis: number): number => facts.size[axis] === 0 ? 0 : (value - facts.min[axis]!) / facts.size[axis]!;

/**
 * What a hint records of face `index` of a body: its surface type, its area as a fraction of the
 * body's, its centre as fractions of the body's box, its normal, and the names of the faces next to
 * it, so it can be found again by likeness where its names are lost.
 */
export function faceHintOf(index: number, shape: TopoDS_Shape, names: FaceNames, occt: OCCTService): Models.OCCT.DesignFaceHint {
    const facts = factsOf(shape, occt);
    const face = facts.faces[index]!;
    return {
        type: face.type,
        area: rounded(facts.area === 0 ? 0 : face.area / facts.area),
        centre: [0, 1, 2].map(axis => rounded(fractionOf(facts, face.centre[axis]!, axis))) as [number, number, number],
        normal: unit(face.normal).map(rounded) as [number, number, number],
        neighbours: neighboursOf(index, facts, names),
    };
}

/** The hint of a reference that found `faces` of a body: the body's box, and each face as `faceHintOf` records it. */
export function referenceHintOf(faces: readonly number[], shape: TopoDS_Shape, names: FaceNames, occt: OCCTService): Models.OCCT.DesignReferenceHint {
    const facts = factsOf(shape, occt);
    const corner = (values: readonly number[]): [number, number, number] => values.map(rounded) as [number, number, number];
    return {
        v: 1,
        box: { min: corner(facts.min), max: corner(facts.min.map((value, axis) => value + facts.size[axis]!)) },
        faces: faces.map(face => faceHintOf(face, shape, names, occt)),
    };
}

interface Candidate {
    hint: Models.OCCT.DesignFaceHint;
    min: readonly number[];
    max: readonly number[];
    bodyMin: readonly number[];
    bodySize: readonly number[];
}

function candidateOf(index: number, shape: TopoDS_Shape, names: FaceNames, occt: OCCTService): Candidate {
    const facts = factsOf(shape, occt);
    const box = facts.faces[index]!.box;
    return { hint: faceHintOf(index, shape, names, occt), min: box.min, max: box.max, bodyMin: facts.min, bodySize: facts.size };
}

/** How near a point lies to a box, per axis in fractions of `span`, as a factor that falls from 1 to 0 over `REACH`. */
function nearness(point: readonly number[], min: readonly number[], max: readonly number[], span: (axis: number) => number): number {
    const away = Math.hypot(...point.map((value, axis) => Math.max(min[axis]! - value, 0, value - max[axis]!) / span(axis)));
    return 1 - Math.min(1, away / REACH);
}

/**
 * Where a face lies against a hinted face, twice: in proportion, the hinted centre in fractions of
 * the box the hint recorded against the face's box in fractions of the body's box now; and in
 * place, both in the hint's units. A face merged with others still covers the hinted centre.
 */
function placement(hint: Models.OCCT.DesignFaceHint, box: Models.OCCT.DesignHintBox, found: Candidate): { proportion: number; place: number } {
    const size = box.max.map((value, axis) => value - box.min[axis]!);
    const largest = Math.max(...size) || 1;
    const hintSpan = (axis: number): number => size[axis]! > 0 ? size[axis]! : largest;
    const bodySpan = (axis: number): number => found.bodySize[axis]! > 0 ? found.bodySize[axis]! : largest;
    const toBody = (values: readonly number[]): number[] => values.map((value, axis) => (value - found.bodyMin[axis]!) / bodySpan(axis));
    const centre = hint.centre.map((value, axis) => box.min[axis]! + value * size[axis]!);
    return {
        proportion: nearness(hint.centre, toBody(found.min), toBody(found.max), () => 1),
        place: nearness(centre, found.min, found.max, hintSpan),
    };
}

/**
 * How much a face looks like one face of a hint, from 0 to 1, given how near it lies: its normal,
 * its area and the names its neighbours share with the hinted ones weigh in, and hinted names the
 * body no longer holds anywhere are left out, as no face could share them.
 */
function likeness(hint: Models.OCCT.DesignFaceHint, found: Candidate, present: ReadonlySet<string>): number {
    const normal = (1 + hint.normal.reduce((sum, value, axis) => sum + value * found.hint.normal[axis]!, 0)) / 2;
    const larger = Math.max(hint.area, found.hint.area);
    const area = larger === 0 ? 1 : Math.min(hint.area, found.hint.area) / larger;
    const shape = WEIGHTS.normal * normal + WEIGHTS.area * area;
    const held = hint.neighbours.filter(name => present.has(name));
    if (hint.neighbours.length > 0 && held.length === 0) {
        return shape / (1 - WEIGHTS.neighbours);
    }
    const union = new Set([...held, ...found.hint.neighbours]);
    const shared = held.filter(name => found.hint.neighbours.includes(name)).length;
    return shape + WEIGHTS.neighbours * (union.size === 0 ? 1 : shared / union.size);
}

/**
 * A face's score against the best matching face of a hint. Nearness gates it: a face of another
 * surface type scores nothing, and the score falls to nothing as the face moves `REACH` away from
 * where the hinted face lay, in proportion or in place, whichever is further, so a sibling a pattern
 * moved into the place the body's proportions give is not taken.
 */
function scoreOf(hint: Models.OCCT.DesignReferenceHint, index: number, shape: TopoDS_Shape, names: FaceNames, occt: OCCTService, present: ReadonlySet<string>): number {
    const found = candidateOf(index, shape, names, occt);
    return Math.max(0, ...hint.faces.map(face => {
        if (face.type !== found.hint.type) {
            return 0;
        }
        const { proportion, place } = placement(face, hint.box, found);
        return Math.min(proportion, place) * likeness(face, found, present);
    }));
}

/** Every face of a body of a type the hint has, scored against it, best first. */
export function candidatesOf(hint: Models.OCCT.DesignReferenceHint, shape: TopoDS_Shape, names: FaceNames, occt: OCCTService): { face: number; score: number }[] {
    const types = new Set(hint.faces.map(face => face.type));
    const present = new Set(names.flat());
    return factsOf(shape, occt).faces
        .filter(face => types.has(face.type))
        .map(face => ({ face: face.index, score: rounded(scoreOf(hint, face.index, shape, names, occt, present)) }))
        .sort((a, b) => b.score - a.score || a.face - b.face);
}

/**
 * The faces a lost reference rebinds to: the `needed` best candidates, when each scores at least
 * `REBIND_SCORE` and beats the best one left out by `REBIND_MARGIN`; otherwise none.
 */
export function rebindOf(candidates: readonly { face: number; score: number }[], needed: number): { faces: number[]; score: number } | undefined {
    const taken = candidates.slice(0, needed);
    if (needed < 1 || taken.length < needed || taken.some(candidate => candidate.score < REBIND_SCORE)) {
        return undefined;
    }
    const weakest = taken[taken.length - 1]!.score;
    const next = candidates[needed];
    if (next !== undefined && weakest - next.score < REBIND_MARGIN) {
        return undefined;
    }
    return { faces: taken.map(candidate => candidate.face).sort((a, b) => a - b), score: weakest };
}
