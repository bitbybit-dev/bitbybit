import type { DiamondKnurlSpec, KnurlMesh, LoopVertex } from "../parts-types";
import { POINT_SIZE, ROW_SLACK, TRIANGLE_CORNERS } from "../parts.constants";
import { interpolated } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/scalars";
import { polar2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

const TURN = 2 * Math.PI;

export function diamondKnurlMesh(spec: DiamondKnurlSpec): KnurlMesh {
    const { crest, root, grooves, twist, length, outside } = spec;
    const columns = 2 * grooves;
    const step = Math.PI / (grooves * twist);
    const rows = Math.floor(length / step + ROW_SLACK);
    const clipped = length - rows * step > length * ROW_SLACK;
    const positions: number[] = [];
    const indices: number[] = [];
    const added = (x: number, y: number, z: number): number => {
        positions.push(x, y, z);
        return positions.length / POINT_SIZE - 1;
    };
    const lattice = new Map<number, number>();
    const at = (row: number, column: number): number => {
        const wrapped = ((column % columns) + columns) % columns;
        const key = row * columns + wrapped;
        const known = lattice.get(key);
        if (known !== undefined) {
            return known;
        }
        const [x, y] = polar2(((column - row) % 2 + 2) % 2 === 0 ? crest : root, Math.PI * wrapped / grooves);
        const made = added(x, y, row * step);
        lattice.set(key, made);
        return made;
    };
    const band = (row: number): number[][] => {
        const triangles: number[][] = [];
        for (let column = 0; column < columns; column++) {
            if (((column - row) % 2 + 2) % 2 === 0) {
                triangles.push([at(row, column), at(row, column + 1), at(row + 1, column)], [at(row, column), at(row + 1, column), at(row, column - 1)]);
            } else {
                triangles.push([at(row + 1, column), at(row, column), at(row + 1, column + 1)], [at(row + 1, column), at(row + 1, column - 1), at(row, column)]);
            }
        }
        return triangles;
    };
    for (let row = 0; row < rows; row++) {
        band(row).forEach(triangle => indices.push(...triangle));
    }
    const top: number[] = [];
    if (clipped) {
        const crossings = new Map<string, number>();
        const crossing = (below: number, above: number): number => {
            const key = below < above ? `${String(below)}:${String(above)}` : `${String(above)}:${String(below)}`;
            const known = crossings.get(key);
            if (known !== undefined) {
                return known;
            }
            const from = positions.slice(below * POINT_SIZE, below * POINT_SIZE + POINT_SIZE);
            const to = positions.slice(above * POINT_SIZE, above * POINT_SIZE + POINT_SIZE);
            const share = (length - from[2]!) / (to[2]! - from[2]!);
            const made = added(interpolated(from[0]!, to[0]!, share), interpolated(from[1]!, to[1]!, share), length);
            crossings.set(key, made);
            top.push(made);
            return made;
        };
        band(rows).forEach(triangle => {
            const kept: number[] = [];
            triangle.forEach((corner, index) => {
                const next = triangle[(index + 1) % TRIANGLE_CORNERS]!;
                const inside = positions[corner * POINT_SIZE + 2]! <= length;
                const nextInside = positions[next * POINT_SIZE + 2]! <= length;
                if (inside) {
                    kept.push(corner);
                }
                if (inside !== nextInside) {
                    kept.push(inside ? crossing(corner, next) : crossing(next, corner));
                }
            });
            for (let index = 1; index + 1 < kept.length; index++) {
                indices.push(kept[0]!, kept[index]!, kept[index + 1]!);
            }
        });
    } else {
        for (let column = 0; column < columns; column++) {
            top.push(at(rows, column));
        }
    }
    const reach = outside / Math.cos(Math.PI / columns);
    const wall = (z: number): number[] => Array.from({ length: columns }, (_, column) => added(...polar2(reach, Math.PI * column / grooves), z));
    const bottomWall = wall(0);
    const topWall = wall(length);
    const bottom = Array.from({ length: columns }, (_, column) => at(0, column));
    ringed(bottom, bottomWall, positions).forEach(triangle => indices.push(...triangle));
    ringed(top, topWall, positions).forEach(triangle => indices.push(...triangle));
    for (let column = 0; column < columns; column++) {
        const next = (column + 1) % columns;
        indices.push(bottomWall[column]!, bottomWall[next]!, topWall[next]!, bottomWall[column]!, topWall[next]!, topWall[column]!);
    }
    return compacted(positions, indices);
}

function compacted(positions: readonly number[], indices: readonly number[]): KnurlMesh {
    const renumbered = new Map<number, number>();
    const kept: number[] = [];
    const remapped = indices.map(vertex => {
        const known = renumbered.get(vertex);
        if (known !== undefined) {
            return known;
        }
        const made = kept.length / POINT_SIZE;
        kept.push(positions[vertex * POINT_SIZE]!, positions[vertex * POINT_SIZE + 1]!, positions[vertex * POINT_SIZE + 2]!);
        renumbered.set(vertex, made);
        return made;
    });
    return { positions: kept, indices: remapped };
}

function ringed(inner: readonly number[], outer: readonly number[], positions: readonly number[]): number[][] {
    const angleOf = (vertex: number): number => {
        const angle = Math.atan2(positions[vertex * POINT_SIZE + 1]!, positions[vertex * POINT_SIZE]!);
        return angle < 0 ? angle + TURN : angle;
    };
    const around = (loop: readonly number[], from: number): LoopVertex[] => {
        const sorted = loop.map((vertex): LoopVertex => {
            const angle = angleOf(vertex);
            return { vertex, angle: angle < from ? angle + TURN : angle };
        }).sort((a, b) => a.angle - b.angle);
        return [...sorted, { vertex: sorted[0]!.vertex, angle: sorted[0]!.angle + TURN }];
    };
    const inside = around(inner, 0);
    const outside = around(outer, inside[0]!.angle);
    const triangles: number[][] = [];
    let i = 0;
    let o = 0;
    while (i < inside.length - 1 || o < outside.length - 1) {
        if (o === outside.length - 1 || (i < inside.length - 1 && inside[i + 1]!.angle <= outside[o + 1]!.angle)) {
            triangles.push([inside[i]!.vertex, inside[i + 1]!.vertex, outside[o]!.vertex]);
            i++;
        } else {
            triangles.push([inside[i]!.vertex, outside[o + 1]!.vertex, outside[o]!.vertex]);
            o++;
        }
    }
    return triangles;
}
