import type { ArcPiece, Outline, Piece, Vec2 } from "./outline";
import { COINCIDENT } from "./outline";
import { add2, dot2, leftOf2, length2, polar2, subtract2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

/**
 * Something the hull wraps: a point, or a disc of `radius` about `center` whose rim counts only
 * where its outward direction lies in `range` (counterclockwise from `from`, `span` radians wide),
 * which is how a circular arc takes part; a full circle has no range.
 */
export type HullPart =
    | { kind: "point"; at: Vec2 }
    | { kind: "disc"; center: Vec2; radius: number; range?: { from: number; span: number } };

const FULL_TURN = 2 * Math.PI;
const SAME_ANGLE = 1e-12;

const ahead = (from: number, angle: number): number => {
    const turned = ((angle - from) % FULL_TURN + FULL_TURN) % FULL_TURN;
    return turned <= SAME_ANGLE ? turned + FULL_TURN : turned;
};

const outward = (angle: number): Vec2 => [Math.cos(angle), Math.sin(angle)];

function centerOf(part: HullPart): Vec2 {
    return part.kind === "point" ? part.at : part.center;
}

function radiusOf(part: HullPart): number {
    return part.kind === "point" ? 0 : part.radius;
}

function coversOnward(part: HullPart, angle: number): boolean {
    if (part.kind === "point" || part.range === undefined) {
        return true;
    }
    const into = ((angle - part.range.from) % FULL_TURN + FULL_TURN) % FULL_TURN;
    return into < part.range.span - SAME_ANGLE || into >= FULL_TURN - SAME_ANGLE;
}

function reach(part: HullPart, angle: number): number {
    return dot2(outward(angle), centerOf(part)) + radiusOf(part);
}

function touch(part: HullPart, angle: number): Vec2 {
    const center = centerOf(part);
    const radius = radiusOf(part);
    return add2(center, polar2(radius, angle));
}

function overtakesAt(current: HullPart, next: HullPart, angle: number): number | undefined {
    const between = subtract2(centerOf(next), centerOf(current));
    const distance = length2(between);
    const difference = radiusOf(current) - radiusOf(next);
    if (difference >= distance - COINCIDENT) {
        return undefined;
    }
    if (-difference >= distance - COINCIDENT) {
        if (coversOnward(next, angle)) {
            return 0;
        }
        return next.kind === "disc" && next.range !== undefined ? ahead(angle, next.range.from) : undefined;
    }
    const direction = Math.atan2(between[1], between[0]);
    const turned = ahead(angle, direction - Math.acos(difference / distance));
    return coversOnward(next, angle + turned) ? turned : undefined;
}

function overtakesFirst(part: HullPart, turn: number, rival: HullPart, rivalTurn: number, angle: number): boolean {
    if (turn < rivalTurn - SAME_ANGLE) {
        return true;
    }
    if (Math.abs(turn - rivalTurn) > SAME_ANGLE) {
        return false;
    }
    const travel = leftOf2(polar2(1, angle + turn));
    const further = dot2(touch(part, angle + turn), travel) - dot2(touch(rival, angle + turn), travel);
    return further > COINCIDENT || (further >= -COINCIDENT && radiusOf(part) > radiusOf(rival) + COINCIDENT);
}

type Run = { part: HullPart; from: number; to: number };

/**
 * The convex hull of the parts as an outline running counterclockwise: arcs where a disc's rim is on
 * the hull, straight tangent segments between parts. Undefined when there is nothing to wrap.
 */
export function hullOf(parts: readonly HullPart[]): Outline | undefined {
    const startAngle = 0.123456789;
    const candidates = parts.filter(part => coversOnward(part, startAngle));
    const first = candidates[0];
    if (first === undefined) {
        return undefined;
    }
    let current = candidates.reduce((best, part) => reach(part, startAngle) > reach(best, startAngle) + COINCIDENT ? part : best, first);
    let angle = startAngle;
    let turned = 0;
    const runs: Run[] = [];
    for (let step = 0; step < 4 * parts.length + 8 && turned < FULL_TURN; step++) {
        const event = nextEvent(parts, current, angle);
        const stepTurn = Math.min(event.turn, FULL_TURN - turned);
        runs.push({ part: current, from: angle, to: angle + stepTurn });
        angle += stepTurn;
        turned += stepTurn;
        current = event.part;
    }
    return { pieces: piecesOf(merged(runs)), closed: true };
}

function nextEvent(parts: readonly HullPart[], current: HullPart, angle: number): { turn: number; part: HullPart } {
    let best: { turn: number; part: HullPart } | undefined;
    if (current.kind === "disc" && current.range !== undefined) {
        const end = current.range.from + current.range.span;
        const endPoint: HullPart = { kind: "point", at: touch(current, end) };
        best = { turn: ahead(angle, end), part: endPoint };
    }
    for (const part of parts) {
        if (part === current) {
            continue;
        }
        const turn = overtakesAt(current, part, angle);
        if (turn !== undefined && (best === undefined || overtakesFirst(part, turn, best.part, best.turn, angle))) {
            best = { turn, part };
        }
    }
    return best ?? { turn: FULL_TURN, part: current };
}

function merged(runs: Run[]): Run[] {
    const first = runs[0];
    const last = runs[runs.length - 1];
    if (runs.length > 1 && first !== undefined && last !== undefined && samePart(first.part, last.part)) {
        return [{ part: last.part, from: last.from, to: first.to + FULL_TURN }, ...runs.slice(1, -1)];
    }
    return runs;
}

function samePart(a: HullPart, b: HullPart): boolean {
    if (a === b) {
        return true;
    }
    return a.kind === "point" && b.kind === "point" && length2(subtract2(a.at, b.at)) <= COINCIDENT;
}

function piecesOf(runs: readonly Run[]): Piece[] {
    const pieces: Piece[] = [];
    runs.forEach((run, index) => {
        const radius = radiusOf(run.part);
        const sweep = run.to - run.from;
        if (radius > COINCIDENT && sweep * radius > COINCIDENT) {
            const arc: ArcPiece = {
                kind: "arc",
                from: touch(run.part, run.from),
                to: touch(run.part, run.to),
                center: centerOf(run.part),
                radius,
                start: run.from,
                sweep,
                owner: 0,
            };
            pieces.push(arc);
        }
        const next = runs[(index + 1) % runs.length]!;
        const from = touch(run.part, run.to);
        const to = touch(next.part, run.to);
        if (length2(subtract2(to, from)) > COINCIDENT) {
            pieces.push({ kind: "line", from, to, owner: 0 });
        }
    });
    return pieces;
}
