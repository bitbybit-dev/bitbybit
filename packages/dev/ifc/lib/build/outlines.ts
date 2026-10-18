import type { Base } from "@bitbybit-dev/base";
import { isInsidePolygon2, signedArea2, wound2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/polygons";
import { cross2, length2, subtract2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { MIN_OUTLINE_POINTS } from "./constants";
import { distanceToSegment } from "./math";

export function cleanOutline(points: readonly Base.Point2[], tolerance: number, what: string): Base.Point2[] {
    const first = points[0];
    const last = points[points.length - 1];
    const open = first && last && points.length > 1 && length2(subtract2(first, last)) <= tolerance ? points.slice(0, -1) : [...points];
    if (open.length < MIN_OUTLINE_POINTS) {
        throw new Error(`The ${what} needs at least ${MIN_OUTLINE_POINTS} distinct points, got ${open.length}`);
    }
    open.forEach((point, index) => {
        const next = open[(index + 1) % open.length]!;
        if (length2(subtract2(next, point)) <= tolerance) {
            throw new Error(`The ${what} repeats its point ${index} at ${index + 1}, which leaves a side of no length`);
        }
    });
    if (!(Math.abs(signedArea2(open)) > tolerance * tolerance)) {
        throw new Error(`The ${what} must enclose an area`);
    }
    return open;
}

export function isInsideOrOn(point: Base.Point2, outline: readonly Base.Point2[], tolerance: number): boolean {
    return isInsidePolygon2(point, outline) || outline.some((corner, index) => distanceToSegment(point, corner, outline[(index + 1) % outline.length]!) <= tolerance);
}

function sideOf(point: Base.Point2, start: Base.Point2, end: Base.Point2): number {
    return cross2(subtract2(end, start), subtract2(point, start)) / length2(subtract2(end, start));
}

function apart(first: number, second: number, tolerance: number): boolean {
    return (first > tolerance && second < -tolerance) || (first < -tolerance && second > tolerance);
}

export function edgesCross(first: readonly Base.Point2[], second: readonly Base.Point2[], tolerance: number): boolean {
    return first.some((a, i) => {
        const b = first[(i + 1) % first.length]!;
        return second.some((c, j) => {
            const d = second[(j + 1) % second.length]!;
            return apart(sideOf(c, a, b), sideOf(d, a, b), tolerance) && apart(sideOf(a, c, d), sideOf(b, c, d), tolerance);
        });
    });
}

export function cleanHoles(outer: readonly Base.Point2[], holes: readonly (readonly Base.Point2[])[], tolerance: number, owner: string): Base.Point2[][] {
    return holes.map((hole, index) => {
        const cleaned = cleanOutline(hole, tolerance, `hole ${index}`);
        if (!cleaned.every((point) => isInsideOrOn(point, outer, tolerance)) || edgesCross(cleaned, outer, tolerance)) {
            throw new Error(`Hole ${index} reaches outside the ${owner}'s outline`);
        }
        return wound2(cleaned, false);
    });
}

export function measuredFrom(points: readonly Base.Point2[], anchor: Base.Point2): Base.Point2[] {
    return points.map((point) => subtract2(point, anchor));
}
