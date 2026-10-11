import type { ArcPiece, Outline, Piece, Vec2 } from "./outline";
import { COINCIDENT } from "./outline";

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

function covers(part: HullPart, angle: number): boolean {
    if (part.kind === "point" || part.range === undefined) {
        return true;
    }
    const into = ((angle - part.range.from) % FULL_TURN + FULL_TURN) % FULL_TURN;
    return into <= part.range.span + SAME_ANGLE || into >= FULL_TURN - SAME_ANGLE;
}

function reach(part: HullPart, angle: number): number {
    const direction = outward(angle);
    const center = centerOf(part);
    return direction[0] * center[0] + direction[1] * center[1] + radiusOf(part);
}

function touch(part: HullPart, angle: number): Vec2 {
    const center = centerOf(part);
    const radius = radiusOf(part);
    return [center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)];
}

function overtakesAt(current: HullPart, next: HullPart, angle: number): number | undefined {
    const between: Vec2 = [centerOf(next)[0] - centerOf(current)[0], centerOf(next)[1] - centerOf(current)[1]];
    const distance = Math.hypot(between[0], between[1]);
    const difference = radiusOf(current) - radiusOf(next);
    if (distance <= COINCIDENT || difference >= distance - COINCIDENT) {
        return undefined;
    }
    const direction = Math.atan2(between[1], between[0]);
    const tangent = difference <= COINCIDENT - distance ? direction + Math.PI : direction - Math.acos(difference / distance);
    const turned = ahead(angle, tangent);
    return covers(next, angle + turned) ? turned : undefined;
}

type Run = { part: HullPart; from: number; to: number };

/**
 * The convex hull of the parts as an outline running counterclockwise: arcs where a disc's rim is on
 * the hull, straight tangent segments between parts. Undefined when there is nothing to wrap.
 */
export function hullOf(parts: readonly HullPart[]): Outline | undefined {
    const startAngle = 0.123456789;
    const candidates = parts.filter(part => covers(part, startAngle));
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
        if (turn === undefined) {
            continue;
        }
        const along = (candidate: HullPart): number => {
            const point = touch(candidate, angle + turn);
            const travel: Vec2 = [-Math.sin(angle + turn), Math.cos(angle + turn)];
            return point[0] * travel[0] + point[1] * travel[1];
        };
        if (best === undefined || turn < best.turn - SAME_ANGLE || (Math.abs(turn - best.turn) <= SAME_ANGLE && along(part) > along(best.part))) {
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
    return a.kind === "point" && b.kind === "point" && Math.hypot(a.at[0] - b.at[0], a.at[1] - b.at[1]) <= COINCIDENT;
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
        if (Math.hypot(to[0] - from[0], to[1] - from[1]) > COINCIDENT) {
            pieces.push({ kind: "line", from, to, owner: 0 });
        }
    });
    return pieces;
}
