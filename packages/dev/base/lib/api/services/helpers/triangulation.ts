const TRIANGLE = 3;
const NO_NODE = -1;
const STRICT_EAR = 0;
const FLAT_EAR = 1;
const ANY_EAR = 2;

function withoutRepeats(loop: readonly number[]): number[] {
    const kept = loop.filter((vertex, at) => vertex !== loop[at === 0 ? loop.length - 1 : at - 1]);
    return kept.length === 0 && loop.length > 0 ? [loop[0]!] : kept;
}

export function newellNormal(positions: ArrayLike<number>, loop: readonly number[]): [number, number, number] {
    let nx = 0;
    let ny = 0;
    let nz = 0;
    for (let at = 0; at < loop.length; at++) {
        const i = loop[at]! * TRIANGLE;
        const j = loop[(at + 1) % loop.length]! * TRIANGLE;
        nx += (positions[i + 1]! - positions[j + 1]!) * (positions[i + 2]! + positions[j + 2]!);
        ny += (positions[i + 2]! - positions[j + 2]!) * (positions[i]! + positions[j]!);
        nz += (positions[i]! - positions[j]!) * (positions[i + 1]! + positions[j + 1]!);
    }
    return [nx, ny, nz];
}

function fan(loop: readonly number[]): number[] {
    const triangles: number[] = [];
    for (let at = 1; at + 1 < loop.length; at++) {
        triangles.push(loop[0]!, loop[at]!, loop[at + 1]!);
    }
    return triangles;
}

function turn(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
    return (by - ay) * (cx - bx) - (bx - ax) * (cy - by);
}

function pointInTriangle(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, px: number, py: number): boolean {
    return (cx - px) * (ay - py) >= (ax - px) * (cy - py)
        && (ax - px) * (by - py) >= (bx - px) * (ay - py)
        && (bx - px) * (cy - py) >= (cx - px) * (by - py);
}

function signedArea(xs: readonly number[], ys: readonly number[]): number {
    let twice = 0;
    for (let at = 0, previous = xs.length - 1; at < xs.length; previous = at++) {
        twice += xs[previous]! * ys[at]! - xs[at]! * ys[previous]!;
    }
    return twice / 2;
}

class Ring {
    private readonly x: number[] = [];
    private readonly y: number[] = [];
    private readonly vertex: number[] = [];
    private readonly prev: number[] = [];
    private readonly next: number[] = [];
    private readonly triangles: number[] = [];

    loop(vertices: readonly number[], xs: readonly number[], ys: readonly number[], counterClockwise: boolean): number {
        const reversed = (signedArea(xs, ys) > 0) !== counterClockwise;
        let last = NO_NODE;
        for (let step = 0; step < vertices.length; step++) {
            const at = reversed ? vertices.length - 1 - step : step;
            last = this.insert(vertices[at]!, xs[at]!, ys[at]!, last);
        }
        return last;
    }

    withHoles(outer: number, holes: readonly number[]): number {
        const leftmost = holes.map((hole) => this.leftmost(hole)).sort((a, b) => this.x[a]! - this.x[b]! || this.y[a]! - this.y[b]!);
        let start = outer;
        for (const hole of leftmost) {
            const bridge = this.bridgeTo(hole, start);
            this.split(bridge, hole);
            start = bridge;
        }
        return start;
    }

    clip(start: number): number[] {
        let ear = start;
        let stop = ear;
        let level = STRICT_EAR;
        while (this.prev[ear] !== this.next[ear]) {
            const previous = this.prev[ear]!;
            const following = this.next[ear]!;
            if (this.isEar(ear, level)) {
                this.emit(previous, ear, following);
                this.remove(ear);
                ear = this.next[following]!;
                stop = ear;
                level = STRICT_EAR;
                continue;
            }
            ear = following;
            if (ear === stop) {
                level = Math.min(level + 1, ANY_EAR);
            }
        }
        return this.triangles;
    }

    private insert(vertex: number, x: number, y: number, last: number): number {
        const node = this.x.length;
        this.x.push(x);
        this.y.push(y);
        this.vertex.push(vertex);
        if (last === NO_NODE) {
            this.prev.push(node);
            this.next.push(node);
            return node;
        }
        const after = this.next[last]!;
        this.prev.push(last);
        this.next.push(after);
        this.prev[after] = node;
        this.next[last] = node;
        return node;
    }

    private remove(node: number): void {
        const before = this.prev[node]!;
        const after = this.next[node]!;
        this.next[before] = after;
        this.prev[after] = before;
    }

    private emit(a: number, b: number, c: number): void {
        const va = this.vertex[a]!;
        const vb = this.vertex[b]!;
        const vc = this.vertex[c]!;
        if (va !== vb && vb !== vc && vc !== va) {
            this.triangles.push(va, vb, vc);
        }
    }

    private area(a: number, b: number, c: number): number {
        return turn(this.x[a]!, this.y[a]!, this.x[b]!, this.y[b]!, this.x[c]!, this.y[c]!);
    }

    private isEar(ear: number, level: number): boolean {
        if (level === ANY_EAR) {
            return true;
        }
        const a = this.prev[ear]!;
        const c = this.next[ear]!;
        const corner = this.area(a, ear, c);
        if (corner > 0 || (corner === 0 && level < FLAT_EAR)) {
            return false;
        }
        const ax = this.x[a]!;
        const ay = this.y[a]!;
        const bx = this.x[ear]!;
        const by = this.y[ear]!;
        const cx = this.x[c]!;
        const cy = this.y[c]!;
        const minX = Math.min(ax, bx, cx);
        const minY = Math.min(ay, by, cy);
        const maxX = Math.max(ax, bx, cx);
        const maxY = Math.max(ay, by, cy);
        for (let p = this.next[c]!; p !== a; p = this.next[p]!) {
            const px = this.x[p]!;
            const py = this.y[p]!;
            if (!(px === ax && py === ay) && px >= minX && px <= maxX && py >= minY && py <= maxY
                && pointInTriangle(ax, ay, bx, by, cx, cy, px, py) && this.area(this.prev[p]!, p, this.next[p]!) >= 0) {
                return false;
            }
        }
        return true;
    }

    private leftmost(start: number): number {
        let best = start;
        for (let p = this.next[start]!; p !== start; p = this.next[p]!) {
            if (this.x[p]! < this.x[best]! || (this.x[p] === this.x[best] && this.y[p]! < this.y[best]!)) {
                best = p;
            }
        }
        return best;
    }

    private locallyInside(a: number, b: number): boolean {
        const before = this.prev[a]!;
        const after = this.next[a]!;
        return this.area(before, a, after) < 0
            ? this.area(a, b, after) >= 0 && this.area(a, before, b) >= 0
            : this.area(a, b, before) < 0 || this.area(a, after, b) < 0;
    }

    private sectorContainsSector(m: number, p: number): boolean {
        return this.area(this.prev[m]!, m, this.prev[p]!) < 0 && this.area(this.next[p]!, m, this.next[m]!) < 0;
    }

    private bridgeTo(hole: number, outer: number): number {
        const hx = this.x[hole]!;
        const hy = this.y[hole]!;
        let qx = -Infinity;
        let m = NO_NODE;
        let p = outer;
        do {
            const after = this.next[p]!;
            const py = this.y[p]!;
            const ny = this.y[after]!;
            if (this.x[p] === hx && py === hy) {
                return p;
            }
            if (hy <= py && hy >= ny && ny !== py) {
                const x = this.x[p]! + (hy - py) * (this.x[after]! - this.x[p]!) / (ny - py);
                if (x <= hx && x > qx) {
                    qx = x;
                    m = this.x[p]! < this.x[after]! ? p : after;
                    if (x === hx) {
                        return m;
                    }
                }
            }
            p = after;
        } while (p !== outer);
        return m === NO_NODE ? this.nearest(hole, outer) : this.sharpest(hole, m, qx);
    }

    private sharpest(hole: number, candidate: number, qx: number): number {
        const hx = this.x[hole]!;
        const hy = this.y[hole]!;
        const mx = this.x[candidate]!;
        const my = this.y[candidate]!;
        let m = candidate;
        let tanMin = Infinity;
        let p = candidate;
        do {
            const px = this.x[p]!;
            const py = this.y[p]!;
            if (hx >= px && px >= mx && hx !== px && pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, px, py)) {
                const tan = Math.abs(hy - py) / (hx - px);
                if (this.locallyInside(p, hole) && (tan < tanMin || (tan === tanMin && (px > this.x[m]! || (px === this.x[m] && this.sectorContainsSector(m, p)))))) {
                    m = p;
                    tanMin = tan;
                }
            }
            p = this.next[p]!;
        } while (p !== candidate);
        return m;
    }

    private nearest(hole: number, outer: number): number {
        let best = outer;
        let bestDistance = Infinity;
        let p = outer;
        do {
            const distance = (this.x[p]! - this.x[hole]!) ** 2 + (this.y[p]! - this.y[hole]!) ** 2;
            if (distance < bestDistance) {
                best = p;
                bestDistance = distance;
            }
            p = this.next[p]!;
        } while (p !== outer);
        return best;
    }

    private split(a: number, b: number): void {
        const a2 = this.insert(this.vertex[a]!, this.x[a]!, this.y[a]!, NO_NODE);
        const b2 = this.insert(this.vertex[b]!, this.x[b]!, this.y[b]!, NO_NODE);
        const an = this.next[a]!;
        const bp = this.prev[b]!;
        this.next[a] = b;
        this.prev[b] = a;
        this.next[a2] = an;
        this.prev[an] = a2;
        this.next[b2] = a2;
        this.prev[a2] = b2;
        this.next[bp] = b2;
        this.prev[b2] = bp;
    }
}

function isConvex(xs: readonly number[], ys: readonly number[]): boolean {
    for (let at = 0; at < xs.length; at++) {
        const b = (at + 1) % xs.length;
        const c = (at + 2) % xs.length;
        if (turn(xs[at]!, ys[at]!, xs[b]!, ys[b]!, xs[c]!, ys[c]!) > 0) {
            return false;
        }
    }
    return true;
}

export function triangulateFace(positions: ArrayLike<number>, loops: readonly (readonly number[])[]): number[] {
    const [outer, ...rest] = loops.map(withoutRepeats);
    if (!outer || outer.length < TRIANGLE) {
        return [];
    }
    const holes = rest.filter((hole) => hole.length >= TRIANGLE);
    if (outer.length === TRIANGLE && holes.length === 0) {
        return [...outer];
    }
    const normal = newellNormal(positions, outer);
    const magnitudes = normal.map(Math.abs);
    const dropped = magnitudes.indexOf(Math.max(...magnitudes));
    if (!(magnitudes[dropped]! > 0)) {
        return fan(outer);
    }
    const u = (dropped + 1) % TRIANGLE;
    const v = (dropped + 2) % TRIANGLE;
    const sense = normal[dropped]! < 0 ? -1 : 1;
    const xsOf = (loop: readonly number[]): number[] => loop.map((vertex) => positions[vertex * TRIANGLE + u]! * sense);
    const ysOf = (loop: readonly number[]): number[] => loop.map((vertex) => positions[vertex * TRIANGLE + v]!);
    const xs = xsOf(outer);
    const ys = ysOf(outer);
    if (holes.length === 0 && isConvex(xs, ys)) {
        return fan(outer);
    }
    const ring = new Ring();
    const start = ring.loop(outer, xs, ys, true);
    const holeStarts = holes.map((hole) => ring.loop(hole, xsOf(hole), ysOf(hole), false));
    return ring.clip(ring.withHoles(start, holeStarts));
}
