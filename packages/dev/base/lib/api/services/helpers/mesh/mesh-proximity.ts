import { cross3, dot3, subtract3 } from "../geometry/vectors";
import type * as Inputs from "../../../inputs";
import type { TreeBox, TriangleTree } from "../helper-types";
import { FLAT_SHARE, LEAF_TRIANGLES, PARALLEL, POINT_SHARE, PRUNE_SLACK, RAY_DIRECTIONS, WELD_SHARE } from "./mesh-proximity.constants";
import { windingComponents } from "./mesh-orientation";
import { uniqueVectors } from "../geometry/vector-grid";

const CORNERS = 3;
const TRIANGLE = 9;
const BOX = 6;
const AXES = 3;

type Vec = Inputs.Base.Point3;

function boxOf(corners: Float64Array, order: Uint32Array, start: number, end: number, into: Float64Array, at: number): void {
    let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let index = start; index < end; index++) {
        const base = order[index]! * TRIANGLE;
        for (let corner = 0; corner < TRIANGLE; corner += CORNERS) {
            const x = corners[base + corner]!;
            const y = corners[base + corner + 1]!;
            const z = corners[base + corner + 2]!;
            minX = Math.min(minX, x); minY = Math.min(minY, y); minZ = Math.min(minZ, z);
            maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); maxZ = Math.max(maxZ, z);
        }
    }
    into[at] = minX; into[at + 1] = minY; into[at + 2] = minZ;
    into[at + AXES] = maxX; into[at + AXES + 1] = maxY; into[at + AXES + 2] = maxZ;
}

export function triangleTree(positions: ArrayLike<number>, indices: ArrayLike<number>): TriangleTree {
    const count = Math.floor(indices.length / CORNERS);
    const source = new Float64Array(count * TRIANGLE);
    const centres = new Float64Array(count * CORNERS);
    for (let triangle = 0; triangle < count; triangle++) {
        for (let corner = 0; corner < CORNERS; corner++) {
            const vertex = indices[triangle * CORNERS + corner]! * CORNERS;
            for (let axis = 0; axis < AXES; axis++) {
                const value = positions[vertex + axis]!;
                source[triangle * TRIANGLE + corner * CORNERS + axis] = value;
                centres[triangle * CORNERS + axis] = centres[triangle * CORNERS + axis]! + value / CORNERS;
            }
        }
    }
    const order = new Uint32Array(count).map((_, index) => index);
    const boxes: number[] = [];
    const starts: number[] = [];
    const counts: number[] = [];
    const lefts: number[] = [];
    const rights: number[] = [];
    const box = new Float64Array(BOX);
    const build = (start: number, end: number): number => {
        const node = starts.length;
        boxOf(source, order, start, end, box, 0);
        boxes.push(...box);
        starts.push(start);
        counts.push(end - start);
        lefts.push(-1);
        rights.push(-1);
        if (end - start <= LEAF_TRIANGLES) {
            return node;
        }
        const extents = [box[AXES]! - box[0]!, box[AXES + 1]! - box[1]!, box[AXES + 2]! - box[2]!];
        const axis = extents.indexOf(Math.max(...extents));
        const slice = Array.from(order.subarray(start, end)).sort((a, b) => centres[a * CORNERS + axis]! - centres[b * CORNERS + axis]!);
        order.set(slice, start);
        const middle = (start + end) >> 1;
        lefts[node] = build(start, middle);
        rights[node] = build(middle, end);
        return node;
    };
    if (count > 0) {
        build(0, count);
    }
    const corners = new Float64Array(count * TRIANGLE);
    order.forEach((triangle, index) => corners.set(source.subarray(triangle * TRIANGLE, triangle * TRIANGLE + TRIANGLE), index * TRIANGLE));
    return { corners, boxes: Float64Array.from(boxes), starts: Uint32Array.from(starts), counts: Uint32Array.from(counts), lefts: Int32Array.from(lefts), rights: Int32Array.from(rights) };
}

function boxGap(a: Float64Array, i: number, b: Float64Array, j: number): number {
    let sum = 0;
    for (let axis = 0; axis < AXES; axis++) {
        const gap = Math.max(0, a[i * BOX + axis]! - b[j * BOX + AXES + axis]!, b[j * BOX + axis]! - a[i * BOX + AXES + axis]!);
        sum += gap * gap;
    }
    return Math.sqrt(sum);
}

function corner(source: Float64Array, triangle: number, index: number): Vec {
    const at = triangle * TRIANGLE + index * CORNERS;
    return [source[at]!, source[at + 1]!, source[at + 2]!];
}

const along = (a: Vec, d: Vec, t: number): Vec => [a[0] + d[0] * t, a[1] + d[1] * t, a[2] + d[2] * t];
const clamp = (value: number): number => Math.min(1, Math.max(0, value));

function segmentsSquared(p1: Vec, q1: Vec, p2: Vec, q2: Vec): number {
    const d1 = subtract3(q1, p1);
    const d2 = subtract3(q2, p2);
    const r = subtract3(p1, p2);
    const a = dot3(d1, d1);
    const e = dot3(d2, d2);
    const f = dot3(d2, r);
    const point = POINT_SHARE * Math.max(a, e);
    let s = 0;
    let t = 0;
    if (a <= point && e <= point) {
        return dot3(r, r);
    }
    if (a <= point) {
        t = clamp(f / e);
    } else {
        const c = dot3(d1, r);
        if (e <= point) {
            s = clamp(-c / a);
        } else {
            const b = dot3(d1, d2);
            const denominator = a * e - b * b;
            s = denominator > PARALLEL * a * e ? clamp((b * f - c * e) / denominator) : 0;
            t = (b * s + f) / e;
            if (t < 0) {
                t = 0;
                s = clamp(-c / a);
            } else if (t > 1) {
                t = 1;
                s = clamp((b - c) / a);
            }
        }
    }
    const gap = subtract3(along(p1, d1, s), along(p2, d2, t));
    return dot3(gap, gap);
}

function pointTriangleSquared(p: Vec, a: Vec, b: Vec, c: Vec): number {
    const ab = subtract3(b, a);
    const ac = subtract3(c, a);
    const ap = subtract3(p, a);
    const d1 = dot3(ab, ap);
    const d2 = dot3(ac, ap);
    if (d1 <= 0 && d2 <= 0) {
        return dot3(ap, ap);
    }
    const bp = subtract3(p, b);
    const d3 = dot3(ab, bp);
    const d4 = dot3(ac, bp);
    if (d3 >= 0 && d4 <= d3) {
        return dot3(bp, bp);
    }
    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        const q = subtract3(p, along(a, ab, d1 / (d1 - d3)));
        return dot3(q, q);
    }
    const cp = subtract3(p, c);
    const d5 = dot3(ab, cp);
    const d6 = dot3(ac, cp);
    if (d6 >= 0 && d5 <= d6) {
        return dot3(cp, cp);
    }
    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
        const q = subtract3(p, along(a, ac, d2 / (d2 - d6)));
        return dot3(q, q);
    }
    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
        const q = subtract3(p, along(b, subtract3(c, b), (d4 - d3) / (d4 - d3 + (d5 - d6))));
        return dot3(q, q);
    }
    const total = va + vb + vc;
    const v = vb / total;
    const w = vc / total;
    const q = subtract3(p, [a[0] + ab[0] * v + ac[0] * w, a[1] + ab[1] * v + ac[1] * w, a[2] + ab[2] * v + ac[2] * w]);
    return dot3(q, q);
}

function rayTriangleHit(from: Vec, direction: Vec, a: Vec, b: Vec, c: Vec): Vec | undefined {
    const e1 = subtract3(b, a);
    const e2 = subtract3(c, a);
    const p = cross3(direction, e2);
    const determinant = dot3(e1, p);
    const facing = cross3(e1, e2);
    const facingSquared = dot3(facing, facing);
    if (facingSquared <= FLAT_SHARE * dot3(e1, e1) * dot3(e2, e2) || determinant * determinant <= PARALLEL * dot3(direction, direction) * facingSquared) {
        return undefined;
    }
    const inverse = 1 / determinant;
    const s = subtract3(from, a);
    const q = cross3(s, e1);
    return [dot3(s, p) * inverse, dot3(direction, q) * inverse, dot3(e2, q) * inverse];
}

function segmentCrosses(from: Vec, to: Vec, a: Vec, b: Vec, c: Vec): boolean {
    const hit = rayTriangleHit(from, subtract3(to, from), a, b, c);
    if (hit === undefined) {
        return false;
    }
    const [u, v, t] = hit;
    return u >= 0 && u <= 1 && v >= 0 && u + v <= 1 && t >= 0 && t <= 1;
}

function trianglesWithin(a0: Vec, a1: Vec, a2: Vec, b0: Vec, b1: Vec, b2: Vec, limit: number): boolean {
    if (segmentCrosses(a0, a1, b0, b1, b2) || segmentCrosses(a1, a2, b0, b1, b2) || segmentCrosses(a2, a0, b0, b1, b2)
        || segmentCrosses(b0, b1, a0, a1, a2) || segmentCrosses(b1, b2, a0, a1, a2) || segmentCrosses(b2, b0, a0, a1, a2)) {
        return true;
    }
    const squared = limit * limit;
    if (pointTriangleSquared(a0, b0, b1, b2) <= squared || pointTriangleSquared(a1, b0, b1, b2) <= squared || pointTriangleSquared(a2, b0, b1, b2) <= squared
        || pointTriangleSquared(b0, a0, a1, a2) <= squared || pointTriangleSquared(b1, a0, a1, a2) <= squared || pointTriangleSquared(b2, a0, a1, a2) <= squared) {
        return true;
    }
    const edgesA: readonly (readonly [Vec, Vec])[] = [[a0, a1], [a1, a2], [a2, a0]];
    const edgesB: readonly (readonly [Vec, Vec])[] = [[b0, b1], [b1, b2], [b2, b0]];
    return edgesA.some(([p1, q1]) => edgesB.some(([p2, q2]) => segmentsSquared(p1, q1, p2, q2) <= squared));
}

function triangleBox(source: Float64Array, triangle: number, into: Float64Array): void {
    for (let axis = 0; axis < AXES; axis++) {
        const a = source[triangle * TRIANGLE + axis]!;
        const b = source[triangle * TRIANGLE + CORNERS + axis]!;
        const c = source[triangle * TRIANGLE + 2 * CORNERS + axis]!;
        into[axis] = Math.min(a, b, c);
        into[AXES + axis] = Math.max(a, b, c);
    }
}

function planeGap(normal: Vec, offset: number, boxes: Float64Array, node: number): number {
    let centre = 0;
    let reach = 0;
    for (let axis = 0; axis < AXES; axis++) {
        const low = boxes[node * BOX + axis]!;
        const high = boxes[node * BOX + AXES + axis]!;
        centre += normal[axis]! * (low + high) / 2;
        reach += Math.abs(normal[axis]!) * (high - low) / 2;
    }
    return Math.abs(centre - offset) - reach;
}

function triangleWithinTree(source: Float64Array, triangle: number, tree: TriangleTree, node: number, limit: number, prune: number): boolean {
    const a0 = corner(source, triangle, 0);
    const a1 = corner(source, triangle, 1);
    const a2 = corner(source, triangle, 2);
    const box = new Float64Array(BOX);
    triangleBox(source, triangle, box);
    const first = subtract3(a1, a0);
    const second = subtract3(a2, a0);
    const facing = cross3(first, second);
    const length = Math.hypot(facing[0], facing[1], facing[2]);
    const normal: Vec | undefined = length * length > PARALLEL * dot3(first, first) * dot3(second, second) ? [facing[0] / length, facing[1] / length, facing[2] / length] : undefined;
    const offset = normal === undefined ? 0 : dot3(normal, a0);
    const other = new Float64Array(BOX);
    const stack = [node];
    while (stack.length > 0) {
        const at = stack.pop()!;
        if (boxGap(box, 0, tree.boxes, at) > prune || (normal !== undefined && planeGap(normal, offset, tree.boxes, at) > prune)) {
            continue;
        }
        if (tree.lefts[at]! >= 0) {
            stack.push(tree.lefts[at]!, tree.rights[at]!);
            continue;
        }
        for (let b = tree.starts[at]!; b < tree.starts[at]! + tree.counts[at]!; b++) {
            triangleBox(tree.corners, b, other);
            if (boxGap(box, 0, other, 0) <= prune && trianglesWithin(a0, a1, a2, corner(tree.corners, b, 0), corner(tree.corners, b, 1), corner(tree.corners, b, 2), limit)) {
                return true;
            }
        }
    }
    return false;
}

function leafWithin(leafTree: TriangleTree, leaf: number, tree: TriangleTree, node: number, limit: number, prune: number): boolean {
    for (let triangle = leafTree.starts[leaf]!; triangle < leafTree.starts[leaf]! + leafTree.counts[leaf]!; triangle++) {
        if (triangleWithinTree(leafTree.corners, triangle, tree, node, limit, prune)) {
            return true;
        }
    }
    return false;
}

const reachOfTree = (tree: TriangleTree): number => tree.boxes.subarray(0, BOX).reduce((largest, value) => Math.max(largest, Math.abs(value)), 0);

export function treesWithin(first: TriangleTree, second: TriangleTree, limit: number): boolean {
    if (first.starts.length === 0 || second.starts.length === 0) {
        return false;
    }
    const prune = limit + PRUNE_SLACK * Math.max(reachOfTree(first), reachOfTree(second));
    const stack: number[] = [0, 0];
    while (stack.length > 0) {
        const j = stack.pop()!;
        const i = stack.pop()!;
        if (boxGap(first.boxes, i, second.boxes, j) > prune) {
            continue;
        }
        if (first.lefts[i]! < 0) {
            if (leafWithin(first, i, second, j, limit, prune)) {
                return true;
            }
        } else if (second.lefts[j]! < 0) {
            if (leafWithin(second, j, first, i, limit, prune)) {
                return true;
            }
        } else if (second.counts[j]! > first.counts[i]!) {
            stack.push(i, second.lefts[j]!, i, second.rights[j]!);
        } else {
            stack.push(first.lefts[i]!, j, first.rights[i]!, j);
        }
    }
    return false;
}

function rayHitsBox(origin: Vec, direction: Vec, boxes: Float64Array, node: number): boolean {
    let near = 0;
    let far = Infinity;
    for (let axis = 0; axis < AXES; axis++) {
        const low = boxes[node * BOX + axis]!;
        const high = boxes[node * BOX + AXES + axis]!;
        const from = origin[axis]!;
        const step = direction[axis]!;
        const t1 = (low - from) / step;
        const t2 = (high - from) / step;
        near = Math.max(near, Math.min(t1, t2));
        far = Math.min(far, Math.max(t1, t2));
        if (near > far) {
            return false;
        }
    }
    return true;
}

function crossings(tree: TriangleTree, origin: Vec, direction: Vec): number {
    let hits = 0;
    const stack = [0];
    while (stack.length > 0) {
        const node = stack.pop()!;
        if (!rayHitsBox(origin, direction, tree.boxes, node)) {
            continue;
        }
        if (tree.lefts[node]! >= 0) {
            stack.push(tree.lefts[node]!, tree.rights[node]!);
            continue;
        }
        for (let triangle = tree.starts[node]!; triangle < tree.starts[node]! + tree.counts[node]!; triangle++) {
            const hit = rayTriangleHit(origin, direction, corner(tree.corners, triangle, 0), corner(tree.corners, triangle, 1), corner(tree.corners, triangle, 2));
            if (hit !== undefined && hit[0] >= 0 && hit[1] >= 0 && hit[0] + hit[1] <= 1 && hit[2] > 0) {
                hits++;
            }
        }
    }
    return hits;
}

export function pointInTree(tree: TriangleTree, point: Vec): boolean {
    if (tree.starts.length === 0) {
        return false;
    }
    const inside = RAY_DIRECTIONS.filter(direction => crossings(tree, point, [direction[0], direction[1], direction[2]]) % 2 === 1).length;
    return inside * 2 > RAY_DIRECTIONS.length;
}

export function pointOnTree(tree: TriangleTree): Vec | undefined {
    return tree.corners.length === 0 ? undefined : corner(tree.corners, 0, 0);
}

const piecePoints = new WeakMap<TriangleTree, Vec[]>();

function pointPerPiece(tree: TriangleTree): Vec[] {
    const known = piecePoints.get(tree);
    if (known !== undefined) {
        return known;
    }
    const corners = Array.from({ length: tree.corners.length / CORNERS }, (_, at) => [tree.corners[at * CORNERS]!, tree.corners[at * CORNERS + 1]!, tree.corners[at * CORNERS + 2]!]);
    const reach = tree.boxes.subarray(0, BOX).reduce((largest, value) => Math.max(largest, Math.abs(value)), 1);
    const { component, count } = windingComponents(uniqueVectors(corners, WELD_SHARE * reach).indexes);
    const firsts = new Int32Array(count).fill(-1);
    component.forEach((piece, triangle) => {
        if (firsts[piece]! < 0) {
            firsts[piece] = triangle;
        }
    });
    const points = Array.from(firsts, triangle => corner(tree.corners, triangle, 0));
    piecePoints.set(tree, points);
    return points;
}

export function treesNested(first: TriangleTree, second: TriangleTree): boolean {
    return pointPerPiece(second).some(point => pointInTree(first, point)) || pointPerPiece(first).some(point => pointInTree(second, point));
}

export function pointsOnTree(tree: TriangleTree, most: number): Vec[] {
    const triangles = tree.corners.length / TRIANGLE;
    const count = Math.min(Math.max(0, Math.floor(most)), triangles);
    return Array.from({ length: count }, (_, index) => corner(tree.corners, Math.floor(index * triangles / count), index % CORNERS));
}

export function treeBox(tree: TriangleTree): TreeBox | undefined {
    return tree.starts.length === 0 ? undefined : { min: [tree.boxes[0]!, tree.boxes[1]!, tree.boxes[2]!], max: [tree.boxes[AXES]!, tree.boxes[AXES + 1]!, tree.boxes[AXES + 2]!] };
}
