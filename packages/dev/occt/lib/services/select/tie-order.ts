import type { Base } from "../../api/inputs";
import { distance3, length3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

const TIE_SHARE = 1e-9;
const CONFUSION = 1e-7;
const TIE_LOOKAHEAD = 8;

/** The tolerance the kernel's grouping takes as its confusion tolerance, which it never goes below. */
export const TIE_LEVEL = 0;

/** Whether the kernel groups at `tolerance` exactly as it groups elements level with each other. */
export function groupsAreLevels(tolerance: number): boolean {
    return tolerance <= CONFUSION;
}

function positionsIn(among: readonly number[] | undefined): (index: number) => number {
    if (among === undefined) {
        return index => index;
    }
    const positions = new Map<number, number>();
    among.forEach((index, at) => {
        if (!positions.has(index)) {
            positions.set(index, at);
        }
    });
    return index => positions.get(index) ?? index;
}

/**
 * The `count` chosen elements nearest `point`, nearest first, from the kernel's list of every
 * candidate by exact distance: elements as near as each other, to OCCT's confusion tolerance or a
 * billionth of the size of the coordinates measured, keep the order they were chosen among. The
 * kernel's list puts such elements next to each other, so only the first `count` and the ones
 * level with the last of them have their centres read.
 */
export function nearestInOrder(chosen: readonly number[], point: Base.Point3, count: number, centresOf: (indexes: readonly number[]) => Base.Point3[], among: readonly number[] | undefined): number[] {
    const positionOf = positionsIn(among);
    let known = Math.min(chosen.length, count + TIE_LOOKAHEAD);
    for (;;) {
        const prefix = chosen.slice(0, known);
        const centres = centresOf(prefix);
        const distances = centres.map(centre => distance3(centre, point));
        const scale = Math.max(0, ...centres.map(centre => length3(centre))) + Math.max(0, ...distances);
        const tolerance = Math.max(CONFUSION, TIE_SHARE * scale);
        const ordered = levelsOf(prefix.map((_, at) => at), at => distances[at]!, tolerance)
            .flatMap(level => level.sort((a, b) => positionOf(prefix[a]!) - positionOf(prefix[b]!)).map(at => prefix[at]!));
        const last = [...distances].sort((a, b) => a - b)[Math.min(count, known) - 1]!;
        if (known === chosen.length || distances[known - 1]! > last + 2 * tolerance) {
            return ordered.slice(0, count);
        }
        known = Math.min(chosen.length, known * 2);
    }
}

function levelsOf(items: readonly number[], keyOf: (item: number) => number, tolerance: number): number[][] {
    const sorted = [...items].sort((a, b) => keyOf(a) - keyOf(b));
    const levels: number[][] = [];
    sorted.forEach(item => {
        const level = levels[levels.length - 1];
        if (level === undefined || keyOf(item) - keyOf(level[0]!) > tolerance) {
            levels.push([item]);
        } else {
            level.push(item);
        }
    });
    return levels;
}

/** The levels the kernel groups at its confusion tolerance, one after the other, each in the order its elements were chosen among. */
export function levelsInOrder(levels: readonly (readonly number[])[], among: readonly number[] | undefined): number[] {
    const positionOf = positionsIn(among);
    return levels.flatMap(level => [...level].sort((a, b) => positionOf(a) - positionOf(b)));
}

/**
 * Each group the kernel made, its elements level with each other, at the kernel's confusion
 * tolerance, kept in the order they were chosen among.
 */
export function groupsInOrder(groups: readonly (readonly number[])[], levels: readonly (readonly number[])[], among: readonly number[] | undefined): number[][] {
    const positionOf = positionsIn(among);
    const levelOf = new Map<number, number>();
    levels.forEach((level, rank) => level.forEach(index => levelOf.set(index, rank)));
    return groups.map(group => [...group].sort((a, b) => levelOf.get(a)! - levelOf.get(b)! || positionOf(a) - positionOf(b)));
}
