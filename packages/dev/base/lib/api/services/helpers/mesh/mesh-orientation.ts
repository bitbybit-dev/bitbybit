import type { EdgeUses, WindingComponents } from "../helper-types";

const CORNERS = 3;

function cornerOf(indices: ArrayLike<number>, start: number, triangle: number, corner: number): number {
    return indices[start + triangle * CORNERS + (corner % CORNERS)]!;
}

function edgeUsesOf(indices: ArrayLike<number>, start: number, triangles: number): EdgeUses {
    let highest = 0;
    for (let at = start; at < start + triangles * CORNERS; at++) {
        highest = Math.max(highest, indices[at]!);
    }
    const stride = highest + 1;
    const uses = new Map<number, number[]>();
    for (let triangle = 0; triangle < triangles; triangle++) {
        for (let corner = 0; corner < CORNERS; corner++) {
            const a = cornerOf(indices, start, triangle, corner);
            const b = cornerOf(indices, start, triangle, corner + 1);
            if (a === b) {
                continue;
            }
            const key = a < b ? a * stride + b : b * stride + a;
            const known = uses.get(key);
            if (known === undefined) {
                uses.set(key, [triangle * CORNERS + corner]);
            } else {
                known.push(triangle * CORNERS + corner);
            }
        }
    }
    return { uses, stride };
}

/**
 * Finds which triangles of a mesh to turn over so that every edge two triangles share is run one way
 * by one and the other way by the other, and which connected piece each triangle belongs to. The
 * first triangle of each piece keeps its winding; an edge shared by more than two triangles is not
 * followed.
 * @param indices - Triangle corners, three per triangle
 * @param start - The first index of the range to read
 * @param end - The index after the range to read
 * @returns For each triangle of the range, whether to turn it over and its piece, and how many pieces there are
 */
export function windingComponents(indices: ArrayLike<number>, start = 0, end = indices.length): WindingComponents {
    const triangles = Math.max(0, Math.floor((end - start) / CORNERS));
    const flips = new Uint8Array(triangles);
    const component = new Int32Array(triangles).fill(-1);
    const { uses, stride } = edgeUsesOf(indices, start, triangles);
    const queue = new Int32Array(triangles);
    let count = 0;
    for (let seed = 0; seed < triangles; seed++) {
        if (component[seed]! >= 0) {
            continue;
        }
        component[seed] = count;
        let head = 0;
        let tail = 0;
        queue[tail++] = seed;
        while (head < tail) {
            const triangle = queue[head++]!;
            for (let corner = 0; corner < CORNERS; corner++) {
                const a = cornerOf(indices, start, triangle, corner);
                const b = cornerOf(indices, start, triangle, corner + 1);
                const shared = a === b ? undefined : uses.get(a < b ? a * stride + b : b * stride + a);
                const other = shared?.length === 2 ? shared.find((use) => Math.floor(use / CORNERS) !== triangle) : undefined;
                if (other === undefined) {
                    continue;
                }
                const neighbour = Math.floor(other / CORNERS);
                if (component[neighbour]! >= 0) {
                    continue;
                }
                const sameDirection = cornerOf(indices, start, neighbour, other % CORNERS) === a;
                flips[neighbour] = sameDirection ? 1 - flips[triangle]! : flips[triangle]!;
                component[neighbour] = count;
                queue[tail++] = neighbour;
            }
        }
        count++;
    }
    return { flips, component, count };
}

function twiceArea(positions: ArrayLike<number>, indices: ArrayLike<number>, start: number, triangle: number): number {
    const [a, b, c] = [0, 1, 2].map((corner) => cornerOf(indices, start, triangle, corner) * CORNERS);
    const [ux, uy, uz] = [positions[b!]! - positions[a!]!, positions[b! + 1]! - positions[a! + 1]!, positions[b! + 2]! - positions[a! + 2]!];
    const [vx, vy, vz] = [positions[c!]! - positions[a!]!, positions[c! + 1]! - positions[a! + 1]!, positions[c! + 2]! - positions[a! + 2]!];
    return Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
}

/**
 * Finds which triangles of a mesh wind against the rest of their connected piece and should be
 * turned over: within each piece, the winding most of its area already has is kept, so a few faces
 * written inside out are mended while a piece wound inward on purpose, such as the inside of a
 * hollow profile, stays as it is.
 * @param positions - Flat `x, y, z` triples
 * @param indices - Triangle corners, three per triangle
 * @param start - The first index of the range to read
 * @param end - The index after the range to read
 * @returns For each triangle of the range, 1 where it should be turned over
 */
export function windingRepairs(positions: ArrayLike<number>, indices: ArrayLike<number>, start = 0, end = indices.length): Uint8Array {
    const { flips, component, count } = windingComponents(indices, start, end);
    const balance = new Float64Array(count);
    flips.forEach((flip, triangle) => {
        balance[component[triangle]!]! += flip === 1 ? -twiceArea(positions, indices, start, triangle) : twiceArea(positions, indices, start, triangle);
    });
    return flips.map((flip, triangle) => (balance[component[triangle]!]! < 0 ? 1 - flip : flip));
}
