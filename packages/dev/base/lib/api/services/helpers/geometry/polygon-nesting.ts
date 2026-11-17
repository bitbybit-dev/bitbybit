import type * as Inputs from "../../../inputs";
import { WorkBudget } from "../files/work-budget";
import { isInsidePolygon2, signedArea2 } from "./polygons";
import { cross2, subtract2 } from "./vectors";
import {
    COINCIDENT_AREA_SHARE, INTERIOR_SCANLINES, NESTING_BOX_MARGIN, SWEEP_CANDIDATES_PER_PAIR, SWEEP_STEPS_PER_BOX, SWEEP_STEPS_PER_CANDIDATE,
} from "./polygon-nesting.constants";

type Point2 = Inputs.Base.Point2;
type Axis = 0 | 1;

const SWEEP_AXES: readonly Axis[] = [0, 1];

export type FillRule2 = "nonzero" | "evenOdd";

export interface Box2 {
    min: Point2;
    max: Point2;
}

export interface NestingOutline2 {
    points: Point2[];
    area: number;
    box: Box2;
    inner?: Point2;
}

export interface FilledRegion2 {
    outer: number;
    holes: number[];
}

interface Span {
    width: number;
    middle: Point2;
}

interface EdgeBoxes {
    minX: Float64Array;
    minY: Float64Array;
    maxX: Float64Array;
    maxY: Float64Array;
}

export const boxOf2 = (points: readonly Point2[]): Box2 => {
    const min: Point2 = [Infinity, Infinity];
    const max: Point2 = [-Infinity, -Infinity];
    for (const [x, y] of points) {
        min[0] = Math.min(min[0], x);
        min[1] = Math.min(min[1], y);
        max[0] = Math.max(max[0], x);
        max[1] = Math.max(max[1], y);
    }
    return { min, max };
};

export const boxesOverlap2 = (a: Box2, b: Box2): boolean =>
    a.min[0] <= b.max[0] && b.min[0] <= a.max[0] && a.min[1] <= b.max[1] && b.min[1] <= a.max[1];

const boxHolds = (outer: Box2, inner: Box2): boolean => {
    const margin = NESTING_BOX_MARGIN * Math.max(outer.max[0] - outer.min[0], outer.max[1] - outer.min[1]);
    return inner.min[0] >= outer.min[0] - margin && inner.min[1] >= outer.min[1] - margin
        && inner.max[0] <= outer.max[0] + margin && inner.max[1] <= outer.max[1] + margin;
};

const widestSpanAt = (points: readonly Point2[], y: number): Span | undefined => {
    const xs: number[] = [];
    for (let at = 0, previous = points.length - 1; at < points.length; previous = at++) {
        const [x1, y1] = points[at]!;
        const [x2, y2] = points[previous]!;
        if ((y1 > y) !== (y2 > y)) {
            xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
        }
    }
    xs.sort((a, b) => a - b);
    let best: Span | undefined;
    for (let k = 0; k + 1 < xs.length; k += 2) {
        const width = xs[k + 1]! - xs[k]!;
        if (width > 0 && (!best || width > best.width)) {
            best = { width, middle: [(xs[k]! + xs[k + 1]!) / 2, y] };
        }
    }
    return best;
};

export const interiorPoint2 = (points: readonly Point2[], box: Box2 = boxOf2(points)): Point2 | undefined => {
    let best: Span | undefined;
    for (const share of INTERIOR_SCANLINES) {
        const span = widestSpanAt(points, box.min[1] + (box.max[1] - box.min[1]) * share);
        if (span && (!best || span.width > best.width)) {
            best = span;
        }
    }
    return best?.middle;
};

export const nestingOutlineOf2 = (points: Point2[]): NestingOutline2 => {
    const box = boxOf2(points);
    const area = signedArea2(points);
    const outline: NestingOutline2 = { points, area, box };
    const inner = area === 0 ? undefined : interiorPoint2(points, box);
    if (inner) {
        outline.inner = inner;
    }
    return outline;
};

const firstAbove = (sorted: readonly number[], value: number): number => {
    let low = 0;
    let high = sorted.length;
    while (low < high) {
        const middle = (low + high) >> 1;
        if (sorted[middle]! > value) {
            high = middle;
        } else {
            low = middle + 1;
        }
    }
    return low;
};

const sweepOrder = (boxes: readonly Box2[], axis: Axis): number[] => boxes.map((_, i) => i).sort((a, b) => boxes[a]!.min[axis] - boxes[b]!.min[axis]);

const sweepCandidates = (boxes: readonly Box2[], order: readonly number[], axis: Axis): number => {
    const starts = order.map((i) => boxes[i]!.min[axis]);
    return order.reduce((sum, i, k) => sum + Math.max(0, firstAbove(starts, boxes[i]!.max[axis]) - k - 1), 0);
};

const sweptPairs = (boxes: readonly Box2[], order: readonly number[], axis: Axis, most: number): [number, number][] | undefined => {
    const pairs: [number, number][] = [];
    for (let k = 0; k < order.length; k++) {
        const i = order[k]!;
        const a = boxes[i]!;
        for (let m = k + 1; m < order.length; m++) {
            const j = order[m]!;
            const b = boxes[j]!;
            if (b.min[axis] > a.max[axis]) {
                break;
            }
            if (boxesOverlap2(a, b)) {
                if (pairs.length >= most) {
                    return undefined;
                }
                pairs.push([i, j]);
            }
        }
    }
    return pairs;
};

const unbounded = (): WorkBudget => new WorkBudget(Number.POSITIVE_INFINITY);

export function overlappingBoxPairs2(boxes: readonly Box2[]): [number, number][];
export function overlappingBoxPairs2(boxes: readonly Box2[], most: number, budget?: WorkBudget): [number, number][] | undefined;
export function overlappingBoxPairs2(boxes: readonly Box2[], most = Number.POSITIVE_INFINITY, budget = unbounded()): [number, number][] | undefined {
    const examinable = most * SWEEP_CANDIDATES_PER_PAIR;
    for (const axis of SWEEP_AXES) {
        if (!budget.spend(boxes.length * SWEEP_STEPS_PER_BOX)) {
            return undefined;
        }
        const order = sweepOrder(boxes, axis);
        const candidates = sweepCandidates(boxes, order, axis);
        if (candidates <= examinable) {
            return budget.spend(candidates * SWEEP_STEPS_PER_CANDIDATE) ? sweptPairs(boxes, order, axis, most) : undefined;
        }
    }
    return undefined;
}

export const segmentsCross2 = (p1: Point2, p2: Point2, q1: Point2, q2: Point2): boolean => {
    const d = subtract2(p2, p1);
    const e = subtract2(q2, q1);
    return cross2(d, subtract2(q1, p1)) * cross2(d, subtract2(q2, p1)) < 0 && cross2(e, subtract2(p1, q1)) * cross2(e, subtract2(p2, q1)) < 0;
};

const spanMeets = (p: number, q: number, low: number, high: number): boolean => Math.min(p, q) <= high && low <= Math.max(p, q);

const edgesNear = (outline: NestingOutline2, box: Box2): number[] => {
    const { points } = outline;
    const near: number[] = [];
    for (let k = 0; k < points.length; k++) {
        const p = points[k]!;
        const q = points[(k + 1) % points.length]!;
        if (spanMeets(p[0], q[0], box.min[0], box.max[0]) && spanMeets(p[1], q[1], box.min[1], box.max[1])) {
            near.push(k);
        }
    }
    return near;
};

const edgeBoxesOf = (outline: NestingOutline2, edges: readonly number[]): EdgeBoxes => {
    const boxes: EdgeBoxes = {
        minX: new Float64Array(edges.length), minY: new Float64Array(edges.length), maxX: new Float64Array(edges.length), maxY: new Float64Array(edges.length),
    };
    edges.forEach((k, at) => {
        const p = outline.points[k]!;
        const q = outline.points[(k + 1) % outline.points.length]!;
        boxes.minX[at] = Math.min(p[0], q[0]);
        boxes.minY[at] = Math.min(p[1], q[1]);
        boxes.maxX[at] = Math.max(p[0], q[0]);
        boxes.maxY[at] = Math.max(p[1], q[1]);
    });
    return boxes;
};

const edgeCrossesAny = (a: NestingOutline2, k: number, b: NestingOutline2, edges: readonly number[], boxes: EdgeBoxes): boolean => {
    const p1 = a.points[k]!;
    const p2 = a.points[(k + 1) % a.points.length]!;
    const minX = Math.min(p1[0], p2[0]);
    const minY = Math.min(p1[1], p2[1]);
    const maxX = Math.max(p1[0], p2[0]);
    const maxY = Math.max(p1[1], p2[1]);
    for (let at = 0; at < edges.length; at++) {
        if (boxes.minX[at]! <= maxX && minX <= boxes.maxX[at]! && boxes.minY[at]! <= maxY && minY <= boxes.maxY[at]!
            && segmentsCross2(p1, p2, b.points[edges[at]!]!, b.points[(edges[at]! + 1) % b.points.length]!)) {
            return true;
        }
    }
    return false;
};

export function outlinesCross2(outlines: readonly NestingOutline2[], pairs: readonly (readonly [number, number])[]): boolean;
export function outlinesCross2(outlines: readonly NestingOutline2[], pairs: readonly (readonly [number, number])[], budget: WorkBudget): boolean | undefined;
export function outlinesCross2(outlines: readonly NestingOutline2[], pairs: readonly (readonly [number, number])[], budget = unbounded()): boolean | undefined {
    for (const [first, second] of pairs) {
        const a = outlines[first]!;
        const b = outlines[second]!;
        if (!budget.spend(a.points.length)) {
            return undefined;
        }
        const ofA = edgesNear(a, b.box);
        if (ofA.length === 0) {
            continue;
        }
        if (!budget.spend(b.points.length)) {
            return undefined;
        }
        const ofB = edgesNear(b, a.box);
        const boxesOfB = edgeBoxesOf(b, ofB);
        for (const k of ofA) {
            if (!budget.spend(ofB.length)) {
                return undefined;
            }
            if (edgeCrossesAny(a, k, b, ofB, boxesOfB)) {
                return true;
            }
        }
    }
    return false;
}

const sameSize = (a: number, b: number): boolean => Math.abs(a - b) <= COINCIDENT_AREA_SHARE * Math.max(a, b);

export function nestedOutlines2(outlines: readonly NestingOutline2[], pairs: readonly (readonly [number, number])[]): number[][];
export function nestedOutlines2(outlines: readonly NestingOutline2[], pairs: readonly (readonly [number, number])[], budget: WorkBudget): number[][] | undefined;
export function nestedOutlines2(outlines: readonly NestingOutline2[], pairs: readonly (readonly [number, number])[], budget = unbounded()): number[][] | undefined {
    const ancestors: number[][] = outlines.map(() => []);
    let affordable = true;
    const holds = (outer: NestingOutline2, inner: NestingOutline2): boolean => {
        if (inner.inner === undefined || !boxHolds(outer.box, inner.box)) {
            return false;
        }
        affordable = budget.spend(outer.points.length);
        return affordable && isInsidePolygon2(inner.inner, outer.points);
    };
    for (const [first, second] of pairs) {
        const sizeOfFirst = Math.abs(outlines[first]!.area);
        const sizeOfSecond = Math.abs(outlines[second]!.area);
        if (sameSize(sizeOfFirst, sizeOfSecond)) {
            if (holds(outlines[first]!, outlines[second]!) && holds(outlines[second]!, outlines[first]!)) {
                ancestors[Math.max(first, second)]!.push(Math.min(first, second));
            }
        } else {
            const [big, small] = sizeOfFirst > sizeOfSecond ? [first, second] : [second, first];
            if (holds(outlines[big]!, outlines[small]!)) {
                ancestors[small]!.push(big);
            }
        }
        if (!affordable) {
            return undefined;
        }
    }
    return ancestors;
}

export const filledRegions2 = (outlines: readonly NestingOutline2[], ancestors: readonly (readonly number[])[], rule: FillRule2): FilledRegion2[] => {
    const depth = ancestors.map((a) => a.length);
    const parent = ancestors.map((a) => a.reduce((best, j) => (best === -1 || depth[j]! > depth[best]! ? j : best), -1));
    const sign = outlines.map((outline) => Math.sign(outline.area));
    const filled = outlines.map((_, i) => rule === "evenOdd"
        ? depth[i]! % 2 === 0
        : sign[i]! + ancestors[i]!.reduce((sum, j) => sum + sign[j]!, 0) !== 0);
    const effective = outlines.map((outline, i) => outline.inner !== undefined && filled[i] !== (parent[i] === -1 ? false : filled[parent[i]!]!));
    const effectiveParent = (i: number): number => {
        let up = parent[i]!;
        while (up !== -1 && !effective[up]) {
            up = parent[up]!;
        }
        return up;
    };
    const regions = new Map<number, FilledRegion2>();
    outlines.forEach((_, i) => {
        if (effective[i] && filled[i]) {
            regions.set(i, { outer: i, holes: [] });
        }
    });
    outlines.forEach((_, i) => {
        if (effective[i] && !filled[i]) {
            regions.get(effectiveParent(i))?.holes.push(i);
        }
    });
    const sizeOf = (i: number): number => Math.abs(outlines[i]!.area);
    return [...regions.values()].filter((region) => !region.holes.some((hole) => sameSize(sizeOf(hole), sizeOf(region.outer))));
};
