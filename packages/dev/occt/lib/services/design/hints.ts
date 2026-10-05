import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OCCTService } from "../../occ-service";
import type { BaseBitByBit } from "../../base";
import type * as Models from "../../api/models";
import type { FaceNames } from "./names";
import { tripleOf } from "./placement";

const WEIGHTS = { normal: 0.35, area: 0.2, neighbours: 0.45 };

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

/** The services a hint is recorded and scored with. */
export interface HintServices {
    occt: OCCTService;
    base: BaseBitByBit;
}

const factsByShape = new WeakMap<TopoDS_Shape, BodyFacts>();

function factsOf(shape: TopoDS_Shape, { occt, base }: HintServices): BodyFacts {
    let facts = factsByShape.get(shape);
    if (facts === undefined) {
        const faces = occt.analysis.signatures({ shape }).faces;
        const box = base.point.boundingBoxOfPoints({ points: faces.flatMap(face => [face.box.min, face.box.max]) });
        const adjacency = new Map(occt.brepGraph.faceAdjacency({ shape }).faces.map(entry => [entry.index, entry.adjacent]));
        facts = {
            faces,
            min: box.min,
            size: base.vector.sub({ first: box.max, second: box.min }),
            area: faces.reduce((sum, face) => sum + face.area, 0),
            adjacent: faces.map(face => [...(adjacency.get(face.index) ?? [])]),
        };
        factsByShape.set(shape, facts);
    }
    return facts;
}

const HINT_SCALE = 1e6;

const rounded = (value: number): number => Math.round(value * HINT_SCALE) / HINT_SCALE + 0;

function neighboursOf(index: number, facts: BodyFacts, names: FaceNames): string[] {
    return [...new Set(facts.adjacent[index]!.flatMap(face => names[face] ?? []))].sort();
}

const fractionOf = (facts: BodyFacts, value: number, axis: number): number => facts.size[axis] === 0 ? 0 : (value - facts.min[axis]!) / facts.size[axis]!;

/**
 * What a hint records of face `index` of a body: its surface type, its area as a fraction of the
 * body's, its centre as fractions of the body's box, its normal, and the names of the faces next to
 * it, so it can be found again by likeness where its names are lost.
 */
export function faceHintOf(index: number, shape: TopoDS_Shape, names: FaceNames, services: HintServices): Models.OCCT.DesignFaceHint {
    const facts = factsOf(shape, services);
    const face = facts.faces[index]!;
    return {
        type: face.type,
        area: rounded(facts.area === 0 ? 0 : face.area / facts.area),
        centre: [0, 1, 2].map(axis => rounded(fractionOf(facts, face.centre[axis]!, axis))) as [number, number, number],
        normal: tripleOf((services.base.vector.normalized({ vector: face.normal }) ?? [0, 0, 0]).map(rounded)),
        neighbours: neighboursOf(index, facts, names),
    };
}

/** The hint of a reference that found `faces` of a body: the body's box, and each face as `faceHintOf` records it. */
export function referenceHintOf(faces: readonly number[], shape: TopoDS_Shape, names: FaceNames, services: HintServices): Models.OCCT.DesignReferenceHint {
    const facts = factsOf(shape, services);
    const corner = (values: readonly number[]): [number, number, number] => values.map(rounded) as [number, number, number];
    return {
        v: 1,
        box: { min: corner(facts.min), max: corner(facts.min.map((value, axis) => value + facts.size[axis]!)) },
        faces: faces.map(face => faceHintOf(face, shape, names, services)),
    };
}

interface Candidate {
    hint: Models.OCCT.DesignFaceHint;
    min: readonly number[];
    max: readonly number[];
    bodyMin: readonly number[];
    bodySize: readonly number[];
}

function candidateOf(index: number, shape: TopoDS_Shape, names: FaceNames, services: HintServices): Candidate {
    const facts = factsOf(shape, services);
    const box = facts.faces[index]!.box;
    return { hint: faceHintOf(index, shape, names, services), min: box.min, max: box.max, bodyMin: facts.min, bodySize: facts.size };
}

function nearness(point: readonly number[], min: readonly number[], max: readonly number[], span: (axis: number) => number, services: HintServices): number {
    const away = services.base.vector.norm({ vector: point.map((value, axis) => Math.max(min[axis]! - value, 0, value - max[axis]!) / span(axis)) });
    return 1 - Math.min(1, away / REACH);
}

interface Nearness {
    proportion: number;
    place: number;
}

function placement(hint: Models.OCCT.DesignFaceHint, box: Models.OCCT.DesignHintBox, found: Candidate, services: HintServices): Nearness {
    const size = box.max.map((value, axis) => value - box.min[axis]!);
    const largest = Math.max(...size) || 1;
    const hintSpan = (axis: number): number => size[axis]! > 0 ? size[axis]! : largest;
    const bodySpan = (axis: number): number => found.bodySize[axis]! > 0 ? found.bodySize[axis]! : largest;
    const toBody = (values: readonly number[]): number[] => values.map((value, axis) => (value - found.bodyMin[axis]!) / bodySpan(axis));
    const centre = hint.centre.map((value, axis) => box.min[axis]! + value * size[axis]!);
    return {
        proportion: nearness(hint.centre, toBody(found.min), toBody(found.max), () => 1, services),
        place: nearness(centre, found.min, found.max, hintSpan, services),
    };
}

function likeness(hint: Models.OCCT.DesignFaceHint, found: Candidate, present: ReadonlySet<string>, services: HintServices): number {
    const normal = (1 + services.base.vector.dot({ first: hint.normal, second: found.hint.normal })) / 2;
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

function scoreOf(hint: Models.OCCT.DesignReferenceHint, index: number, shape: TopoDS_Shape, names: FaceNames, services: HintServices, present: ReadonlySet<string>): number {
    const found = candidateOf(index, shape, names, services);
    return Math.max(0, ...hint.faces.map(face => {
        if (face.type !== found.hint.type) {
            return 0;
        }
        const { proportion, place } = placement(face, hint.box, found, services);
        return Math.min(proportion, place) * likeness(face, found, present, services);
    }));
}

/** A face a lost reference could rebind to, and how like the hint it scored. */
export interface RebindCandidate {
    face: number;
    score: number;
}

/** The faces a lost reference rebinds to, and the lowest score among them. */
export interface Rebound {
    faces: number[];
    score: number;
}

/** Every face of a body of a type the hint has, scored against it, best first. */
export function candidatesOf(hint: Models.OCCT.DesignReferenceHint, shape: TopoDS_Shape, names: FaceNames, services: HintServices): RebindCandidate[] {
    const types = new Set(hint.faces.map(face => face.type));
    const present = new Set(names.flat());
    return factsOf(shape, services).faces
        .filter(face => types.has(face.type))
        .map(face => ({ face: face.index, score: rounded(scoreOf(hint, face.index, shape, names, services, present)) }))
        .sort((a, b) => b.score - a.score || a.face - b.face);
}

/**
 * The faces a lost reference rebinds to: the `needed` best candidates, when each scores at least
 * `REBIND_SCORE` and beats the best one left out by `REBIND_MARGIN`; otherwise none.
 */
export function rebindOf(candidates: readonly RebindCandidate[], needed: number): Rebound | undefined {
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
