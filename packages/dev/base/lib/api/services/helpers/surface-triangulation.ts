import type * as Inputs from "../../inputs";
import type { RefinedSurfaceMesh } from "./helper-types";
import { triangulateFace } from "./triangulation";
import { add3, cross3, dot3, length3, scale3, subtract3 } from "./vectors";

type Point2 = Inputs.Base.Point2;
type Point3 = Inputs.Base.Point3;
type Vec3 = Inputs.Base.Vector3;
type Triangle = [number, number, number];

const SEGMENTS_PER_TURN = 32;
const TURN_SLACK = 1e-6;
const MAX_TURN = ((2 * Math.PI) / SEGMENTS_PER_TURN) * (1 + TURN_SLACK);
const SAGITTA_PER_LENGTH = Math.tan(MAX_TURN / (2 * 2)) / 2;
const MAX_VERTICES = 20000;
const MAX_PASSES = 24;
const MAX_FLIP_ROUNDS = 1000;
const NORMAL_STEP = 1e-5;
const FLIP_SLACK = 1e-9;
const FLAT_RATIO = 1e-12;
const METRIC_SAMPLES = 64;
const METRIC_WIDTH = 1000;
const KEY_BITS = 22;
const KEY_BASE = 2 ** KEY_BITS;
const CORNERS = 3;

const keyOf = (a: number, b: number): number => (a < b ? a * KEY_BASE + b : b * KEY_BASE + a);

const unitOrUndefined = (vector: Vec3): Vec3 | undefined => {
    const length = length3(vector);
    return length > 0 ? scale3(vector, 1 / length) : undefined;
};

const angleAt = (corner: Point2, a: Point2, b: Point2): number => {
    const toA: Point2 = [a[0] - corner[0], a[1] - corner[1]];
    const toB: Point2 = [b[0] - corner[0], b[1] - corner[1]];
    const lengths = Math.hypot(toA[0], toA[1]) * Math.hypot(toB[0], toB[1]);
    return lengths > 0 ? Math.acos(Math.max(-1, Math.min(1, (toA[0] * toB[0] + toA[1] * toB[1]) / lengths))) : 0;
};

const orient2 = (a: Point2, b: Point2, c: Point2): number => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

class SurfaceMesh {
    private readonly uv: Point2[];
    private readonly xyz: Point3[];
    private readonly normals: (Vec3 | undefined | null)[] = [];
    private readonly triangles: (Triangle | undefined)[] = [];
    private readonly edges = new Map<number, number[]>();
    private readonly constrained = new Set<number>();
    private readonly step: Point2;
    private readonly side: number;
    private readonly flatArea: number;
    private readonly metric: Point2;

    constructor(uv: readonly Point2[], positions: readonly Point3[], loops: readonly (readonly number[])[], private readonly pointAt: (u: number, v: number) => Point3) {
        this.uv = uv.map(([u, v]) => [u, v]);
        this.xyz = positions.map(([x, y, z]) => [x, y, z]);
        const us = this.uv.map(([u]) => u);
        const vs = this.uv.map(([, v]) => v);
        this.step = [(Math.max(...us) - Math.min(...us)) * NORMAL_STEP || NORMAL_STEP, (Math.max(...vs) - Math.min(...vs)) * NORMAL_STEP || NORMAL_STEP];
        loops.forEach((loop) => loop.forEach((vertex, at) => this.constrained.add(keyOf(vertex, loop[(at + 1) % loop.length]!))));
        this.metric = this.metricOf();
        const flat = this.uv.flatMap(([u, v]) => [u, v, 0]);
        const corners = triangulateFace(flat, loops);
        let winding = 0;
        for (let at = 0; at + 2 < corners.length; at += CORNERS) {
            const triangle: Triangle = [corners[at]!, corners[at + 1]!, corners[at + 2]!];
            winding += orient2(this.uv[triangle[0]]!, this.uv[triangle[1]]!, this.uv[triangle[2]]!);
            this.add(triangle);
        }
        this.side = Math.sign(winding);
        this.flatArea = FLAT_RATIO * (Math.max(...us) - Math.min(...us)) * (Math.max(...vs) - Math.min(...vs));
    }

    refine(): RefinedSurfaceMesh {
        this.removeSlivers();
        for (let pass = 0; pass < MAX_PASSES; pass++) {
            this.flipToDelaunay();
            const split = this.splitBentEdges();
            const filled = this.fillBentTriangles();
            if (!split && !filled) {
                break;
            }
        }
        this.flipToDelaunay();
        return { positions: this.xyz, triangles: this.triangles.flatMap((triangle) => (triangle ? [...triangle] : [])) };
    }

    private metricOf(): Point2 {
        const [hu, hv] = this.step;
        const xs = this.xyz.map(([x]) => x);
        const ys = this.xyz.map(([, y]) => y);
        const zs = this.xyz.map(([, , z]) => z);
        const size = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), Math.max(...zs) - Math.min(...zs)) || 1;
        const every = Math.max(1, Math.floor(this.uv.length / METRIC_SAMPLES));
        const [wu, wv] = [hu * METRIC_WIDTH, hv * METRIC_WIDTH];
        let alongU = 0;
        let alongV = 0;
        let count = 0;
        for (let at = 0; at < this.uv.length; at += every) {
            const [u, v] = this.uv[at]!;
            const stretchU = length3(subtract3(this.pointAt(u + hu, v), this.pointAt(u - hu, v))) / (2 * hu);
            const stretchV = length3(subtract3(this.pointAt(u, v + hv), this.pointAt(u, v - hv))) / (2 * hv);
            alongU += this.normalTurn([u - wu, v], [u + wu, v]) / (2 * wu) / MAX_TURN + stretchU / size;
            alongV += this.normalTurn([u, v - wv], [u, v + wv]) / (2 * wv) / MAX_TURN + stretchV / size;
            count++;
        }
        return [alongU / count || 1, alongV / count || 1];
    }

    private normalAt(u: number, v: number): Vec3 | undefined {
        const [hu, hv] = this.step;
        return unitOrUndefined(cross3(subtract3(this.pointAt(u + hu, v), this.pointAt(u - hu, v)), subtract3(this.pointAt(u, v + hv), this.pointAt(u, v - hv))));
    }

    private normalTurn(from: Point2, to: Point2): number {
        const first = this.normalAt(from[0], from[1]);
        const second = this.normalAt(to[0], to[1]);
        return first && second ? Math.acos(Math.max(-1, Math.min(1, dot3(first, second)))) : 0;
    }

    private scaled(vertex: number): Point2 {
        const [u, v] = this.uv[vertex]!;
        return [u * this.metric[0], v * this.metric[1]];
    }

    private normal(vertex: number): Vec3 | undefined {
        const known = this.normals[vertex];
        if (known !== undefined) {
            return known ?? undefined;
        }
        const [u, v] = this.uv[vertex]!;
        const normal = this.normalAt(u, v);
        this.normals[vertex] = normal ?? null;
        return normal;
    }

    private turn(a: number, b: number): number {
        const first = this.normal(a);
        const second = this.normal(b);
        return first && second ? Math.acos(Math.max(-1, Math.min(1, dot3(first, second)))) : 0;
    }

    private bendingChord(a: number, b: number): number {
        const first = this.normal(a);
        const second = this.normal(b);
        const across = first && second ? unitOrUndefined(subtract3(second, first)) : undefined;
        return across ? Math.abs(dot3(subtract3(this.xyz[b]!, this.xyz[a]!), across)) : 0;
    }

    private bent(corners: readonly number[]): Point2 | undefined {
        const sides = corners.map((vertex, at) => [vertex, corners[(at + 1) % corners.length]!] as const);
        if (!sides.some(([a, b]) => this.turn(a, b) > MAX_TURN)) {
            return undefined;
        }
        const chord = Math.max(...sides.map(([a, b]) => this.bendingChord(a, b)));
        const uv: Point2 = [0, 1].map((axis) => corners.reduce((sum, vertex) => sum + this.uv[vertex]![axis]!, 0) / corners.length) as Point2;
        const flat = scale3(corners.reduce((sum: Point3, vertex) => add3(sum, this.xyz[vertex]!), [0, 0, 0]), 1 / corners.length);
        return length3(subtract3(this.pointAt(uv[0], uv[1]), flat)) > SAGITTA_PER_LENGTH * chord ? uv : undefined;
    }

    private vertex(uv: Point2): number {
        this.uv.push(uv);
        this.xyz.push(this.pointAt(uv[0], uv[1]));
        return this.uv.length - 1;
    }

    private add(triangle: Triangle): void {
        const index = this.triangles.length;
        this.triangles.push(triangle);
        triangle.forEach((vertex, at) => {
            const key = keyOf(vertex, triangle[(at + 1) % CORNERS]!);
            const list = this.edges.get(key);
            if (list) {
                list.push(index);
            } else {
                this.edges.set(key, [index]);
            }
        });
    }

    private remove(index: number): Triangle {
        const triangle = this.triangles[index]!;
        this.triangles[index] = undefined;
        triangle.forEach((vertex, at) => {
            const key = keyOf(vertex, triangle[(at + 1) % CORNERS]!);
            const list = this.edges.get(key)!.filter((other) => other !== index);
            if (list.length) {
                this.edges.set(key, list);
            } else {
                this.edges.delete(key);
            }
        });
        return triangle;
    }

    private alongEdge(index: number, a: number, b: number): Triangle {
        const [x, y, z] = this.triangles[index]!;
        if ((x === a && y === b) || (x === b && y === a)) {
            return [x, y, z];
        }
        if ((y === a && z === b) || (y === b && z === a)) {
            return [y, z, x];
        }
        return [z, x, y];
    }

    private splitBentEdges(): boolean {
        let changed = false;
        for (const key of [...this.edges.keys()]) {
            if (this.uv.length >= MAX_VERTICES) {
                break;
            }
            const sharing = this.edges.get(key);
            if (this.constrained.has(key) || sharing?.length !== 2) {
                continue;
            }
            const a = Math.floor(key / KEY_BASE);
            const b = key % KEY_BASE;
            const at = this.bent([a, b]);
            if (at === undefined || sharing.some((index) => this.isSliver(this.triangles[index]!) || this.isAt(at, this.alongEdge(index, a, b)[2]))) {
                continue;
            }
            const middle = this.vertex(at);
            for (const index of sharing) {
                const [p, q, r] = this.alongEdge(index, a, b);
                this.remove(index);
                this.add([p, middle, r]);
                this.add([middle, q, r]);
            }
            changed = true;
        }
        return changed;
    }

    private fillBentTriangles(): boolean {
        let changed = false;
        const count = this.triangles.length;
        for (let index = 0; index < count && this.uv.length < MAX_VERTICES; index++) {
            const triangle = this.triangles[index];
            if (!triangle || !triangle.every((vertex, at) => this.constrained.has(keyOf(vertex, triangle[(at + 1) % CORNERS]!)))) {
                continue;
            }
            const [a, b, c] = triangle;
            const at = this.bent(triangle);
            if (at === undefined) {
                continue;
            }
            const centre = this.vertex(at);
            this.remove(index);
            this.add([a, b, centre]);
            this.add([b, c, centre]);
            this.add([c, a, centre]);
            changed = true;
        }
        return changed;
    }

    private isAt(uv: Point2, vertex: number): boolean {
        const [u, v] = this.uv[vertex]!;
        return Math.abs(u - uv[0]) <= this.step[0] && Math.abs(v - uv[1]) <= this.step[1];
    }

    private isSliver(triangle: Triangle): boolean {
        const [a, b, c] = triangle.map((vertex) => this.uv[vertex]!);
        return Math.abs(orient2(a!, b!, c!)) <= this.flatArea;
    }

    private removeSlivers(): void {
        const rounds = this.triangles.length;
        for (let round = 0; round < rounds; round++) {
            let flipped = false;
            for (let index = 0; index < this.triangles.length; index++) {
                const triangle = this.triangles[index];
                if (!triangle || !this.isSliver(triangle)) {
                    continue;
                }
                const lengths = triangle.map((vertex, at) => {
                    const next = triangle[(at + 1) % CORNERS]!;
                    return Math.hypot(this.uv[next]![0] - this.uv[vertex]![0], this.uv[next]![1] - this.uv[vertex]![1]);
                });
                const longest = lengths.indexOf(Math.max(...lengths));
                flipped = this.flip(triangle[longest]!, triangle[(longest + 1) % CORNERS]!) || flipped;
            }
            if (!flipped) {
                return;
            }
        }
    }

    private flip(a: number, b: number): boolean {
        const key = keyOf(a, b);
        const sharing = this.edges.get(key);
        if (this.constrained.has(key) || sharing?.length !== 2) {
            return false;
        }
        const [p, q, c] = this.alongEdge(sharing[0]!, a, b);
        const [, , d] = this.alongEdge(sharing[1]!, a, b);
        const uv = this.uv;
        const first = orient2(uv[p]!, uv[d]!, uv[c]!);
        const second = orient2(uv[d]!, uv[q]!, uv[c]!);
        if (c === d || this.edges.has(keyOf(c, d)) || Math.sign(first) !== this.side || Math.sign(second) !== this.side || Math.abs(first) <= this.flatArea || Math.abs(second) <= this.flatArea) {
            return false;
        }
        this.remove(sharing[0]!);
        this.remove(sharing[1]!);
        this.add([p, d, c]);
        this.add([d, q, c]);
        return true;
    }

    private flipToDelaunay(): void {
        for (let round = 0; round < MAX_FLIP_ROUNDS; round++) {
            let flipped = false;
            for (const key of [...this.edges.keys()]) {
                const sharing = this.edges.get(key);
                if (this.constrained.has(key) || sharing?.length !== 2) {
                    continue;
                }
                const a = Math.floor(key / KEY_BASE);
                const b = key % KEY_BASE;
                const [p, q, c] = this.alongEdge(sharing[0]!, a, b);
                const [, , d] = this.alongEdge(sharing[1]!, a, b);
                const [sp, sq, sc, sd] = [p, q, c, d].map((vertex) => this.scaled(vertex));
                if (angleAt(sc!, sp!, sq!) + angleAt(sd!, sp!, sq!) > Math.PI + FLIP_SLACK) {
                    flipped = this.flip(a, b) || flipped;
                }
            }
            if (!flipped) {
                return;
            }
        }
    }
}

export const refinedSurfaceMesh = (
    uv: readonly Point2[],
    positions: readonly Point3[],
    loops: readonly (readonly number[])[],
    pointAt: (u: number, v: number) => Point3,
): RefinedSurfaceMesh => new SurfaceMesh(uv, positions, loops, pointAt).refine();
