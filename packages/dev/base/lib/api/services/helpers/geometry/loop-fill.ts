import type * as Inputs from "../../../inputs";
import { filledRegions2, nestedOutlines2, nestingOutlineOf2, overlappingBoxPairs2, type FillRule2 } from "./polygon-nesting";
import { newellNormal, triangulateFace } from "./triangulation";

type Point2 = Inputs.Base.Point2;
type Point3 = [number, number, number];

const POINT = 3;
const LEAST_CORNERS = 3;

const sameCorner = (positions: ArrayLike<number>, a: number, b: number): boolean =>
    positions[a * POINT] === positions[b * POINT]
    && positions[a * POINT + 1] === positions[b * POINT + 1]
    && positions[a * POINT + 2] === positions[b * POINT + 2];

const distinctCorners = (positions: ArrayLike<number>, loop: readonly number[]): number[] =>
    loop.filter((vertex, at) => loop.length === 1 || !sameCorner(positions, vertex, loop[at === 0 ? loop.length - 1 : at - 1]!));

const weightOf = ([x, y, z]: Point3): number => x * x + y * y + z * z;

export function filledLoopTriangles(positions: ArrayLike<number>, loops: readonly (readonly number[])[], rule: FillRule2): number[] {
    const kept = loops.map((loop) => distinctCorners(positions, loop)).filter((loop) => loop.length >= LEAST_CORNERS);
    const normals = kept.map((loop) => newellNormal(positions, loop));
    const reference = normals.reduce<Point3 | undefined>((best, normal) => best === undefined || weightOf(normal) > weightOf(best) ? normal : best, undefined);
    if (reference === undefined) {
        return [];
    }
    const magnitudes = reference.map(Math.abs);
    const dropped = magnitudes.indexOf(Math.max(...magnitudes));
    if (!(magnitudes[dropped]! > 0)) {
        return [];
    }
    const u = (dropped + 1) % POINT;
    const v = (dropped + 2) % POINT;
    const sense = reference[dropped]! < 0 ? -1 : 1;
    const outlines = kept.map((loop) => nestingOutlineOf2(loop.map((vertex): Point2 => [positions[vertex * POINT + u]! * sense, positions[vertex * POINT + v]!])));
    const ancestors = nestedOutlines2(outlines, overlappingBoxPairs2(outlines.map((outline) => outline.box)));
    const triangles: number[] = [];
    for (const region of filledRegions2(outlines, ancestors, rule)) {
        const outer = kept[region.outer]!;
        const facingReference = outlines[region.outer]!.area > 0 ? outer : [...outer].reverse();
        const filled = triangulateFace(positions, [facingReference, ...region.holes.map((hole) => kept[hole]!)]);
        for (const corner of filled) {
            triangles.push(corner);
        }
    }
    return triangles;
}
