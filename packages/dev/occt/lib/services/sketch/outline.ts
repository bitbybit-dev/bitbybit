import { InputError } from "@bitbybit-dev/base";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { add2, cross2, dot2, leftOf2, length2, polar2, scale2, subtract2, unit2Of } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { radiansOf } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/scalars";

/** A point or a direction in the sketch's plane. */
export type Vec2 = [number, number];

/** A straight piece of an outline. `owner` is the position of the command that drew it. */
export interface LinePiece { kind: "line"; from: Vec2; to: Vec2; owner: number }

/** A circular arc piece: `start` is the angle of `from` about `center`, `sweep` the signed angle it turns, in radians. */
export interface ArcPiece { kind: "arc"; from: Vec2; to: Vec2; center: Vec2; radius: number; start: number; sweep: number; owner: number }

/** A quadratic Bezier piece. */
export interface QuadraticPiece { kind: "quadratic"; from: Vec2; control: Vec2; to: Vec2; owner: number }

/** A cubic Bezier piece. */
export interface CubicPiece { kind: "cubic"; from: Vec2; control1: Vec2; control2: Vec2; to: Vec2; owner: number }

/** One piece of an outline; each becomes one edge. */
export type Piece = LinePiece | ArcPiece | QuadraticPiece | CubicPiece;

/** The pieces of one outline, in drawing order, and whether it closes. */
export interface Outline { pieces: Piece[]; closed: boolean }

/** Points closer than this count as the same point, as the kernel's own confusion distance does. */
export const COINCIDENT = 1e-7;

const STRAIGHT_SHARE = 1e-7;

const FULL_TURN = 2 * Math.PI;
const STRAIGHT_TURN = 1e-9;

const angleOf = (a: Vec2): number => Math.atan2(a[1], a[0]);
const circlePoint = (center: Vec2, radius: number, angle: number): Vec2 => add2(center, polar2(radius, angle));
const turnBetween = (from: number, to: number): number => ((to - from) % FULL_TURN + FULL_TURN) % FULL_TURN;

/** The direction a piece leaves its start in. */
export function startTangent(piece: Piece): Vec2 {
    switch (piece.kind) {
        case "line":
            return unit2Of(subtract2(piece.to, piece.from))!;
        case "arc":
            return scale2(leftOf2(unit2Of(subtract2(piece.from, piece.center))!), Math.sign(piece.sweep));
        case "quadratic":
            return unit2Of(subtract2(firstApart(piece.from, [piece.control, piece.to]), piece.from))!;
        default:
            return unit2Of(subtract2(firstApart(piece.from, [piece.control1, piece.control2, piece.to]), piece.from))!;
    }
}

/** The direction a piece arrives at its end in. */
export function endTangent(piece: Piece): Vec2 {
    switch (piece.kind) {
        case "line":
            return unit2Of(subtract2(piece.to, piece.from))!;
        case "arc":
            return scale2(leftOf2(unit2Of(subtract2(piece.to, piece.center))!), Math.sign(piece.sweep));
        case "quadratic":
            return unit2Of(subtract2(piece.to, firstApart(piece.to, [piece.control, piece.from])))!;
        default:
            return unit2Of(subtract2(piece.to, firstApart(piece.to, [piece.control2, piece.control1, piece.from])))!;
    }
}

function firstApart(point: Vec2, candidates: Vec2[]): Vec2 {
    return candidates.find(candidate => length2(subtract2(candidate, point)) > COINCIDENT) ?? candidates[candidates.length - 1]!;
}

function pieceLength(piece: LinePiece | ArcPiece): number {
    return piece.kind === "line" ? length2(subtract2(piece.to, piece.from)) : piece.radius * Math.abs(piece.sweep);
}

/**
 * The arc through three points, turning the way they turn, or undefined when they line up: when the
 * middle point stands off the chord by no more than COINCIDENT, or than STRAIGHT_SHARE of a chord
 * shorter than one unit, so the teeth of a gear a thousandth of a unit across are still arcs.
 */
export function arcThrough(from: Vec2, through: Vec2, to: Vec2, owner: number): ArcPiece | undefined {
    const chord = subtract2(to, from);
    const chordLength = length2(chord);
    const twiceArea = cross2(subtract2(through, from), chord);
    if (chordLength <= COINCIDENT || Math.abs(twiceArea) <= Math.min(COINCIDENT, STRAIGHT_SHARE * chordLength) * chordLength) {
        return undefined;
    }
    const d = 2 * (from[0] * (through[1] - to[1]) + through[0] * (to[1] - from[1]) + to[0] * (from[1] - through[1]));
    const fromSquared = dot2(from, from);
    const throughSquared = dot2(through, through);
    const toSquared = dot2(to, to);
    const center: Vec2 = [
        (fromSquared * (through[1] - to[1]) + throughSquared * (to[1] - from[1]) + toSquared * (from[1] - through[1])) / d,
        (fromSquared * (to[0] - through[0]) + throughSquared * (from[0] - to[0]) + toSquared * (through[0] - from[0])) / d,
    ];
    const counterclockwise = cross2(subtract2(through, from), subtract2(to, through)) > 0;
    return arcAbout(center, from, to, counterclockwise, owner);
}

function arcAbout(center: Vec2, from: Vec2, to: Vec2, counterclockwise: boolean, owner: number): ArcPiece {
    const start = angleOf(subtract2(from, center));
    const end = angleOf(subtract2(to, center));
    const sweep = counterclockwise ? turnBetween(start, end) : -turnBetween(end, start);
    return { kind: "arc", from, to, center, radius: length2(subtract2(from, center)), start, sweep, owner };
}

/** Twice the signed area a closed run of pieces encloses: positive when it runs counterclockwise. */
export function signedArea(pieces: readonly Piece[]): number {
    let twice = 0;
    for (const piece of pieces) {
        switch (piece.kind) {
            case "line":
                twice += cross2(piece.from, piece.to);
                break;
            case "arc": {
                const end = piece.start + piece.sweep;
                twice += piece.radius * piece.center[0] * (Math.sin(end) - Math.sin(piece.start))
                    - piece.radius * piece.center[1] * (Math.cos(end) - Math.cos(piece.start))
                    + piece.radius * piece.radius * piece.sweep;
                break;
            }
            default:
                twice += bezierAreaTerm(piece);
                break;
        }
    }
    return twice / 2;
}

const GAUSS: readonly (readonly [number, number])[] = [
    [0.5 - Math.sqrt(15) / 10, 5 / 18],
    [0.5, 8 / 18],
    [0.5 + Math.sqrt(15) / 10, 5 / 18],
];

function bezierAreaTerm(piece: QuadraticPiece | CubicPiece): number {
    const points: Vec2[] = piece.kind === "quadratic" ? [piece.from, piece.control, piece.to] : [piece.from, piece.control1, piece.control2, piece.to];
    const degree = points.length - 1;
    let sum = 0;
    for (const [t, weight] of GAUSS) {
        const level = deCasteljau(points, t);
        const position = level.point;
        const derivative = scale2(subtract2(level.after, level.before), degree);
        sum += weight * cross2(position, derivative);
    }
    return sum;
}

function deCasteljau(points: readonly Vec2[], t: number): { point: Vec2; before: Vec2; after: Vec2 } {
    let level = points.slice();
    while (level.length > 2) {
        level = level.slice(1).map((point, index) => add2(scale2(level[index]!, 1 - t), scale2(point, t)));
    }
    const before = level[0]!;
    const after = level[1]!;
    return { point: add2(scale2(before, 1 - t), scale2(after, t)), before, after };
}

/** The path segments the path builder draws, one per piece, and where they start. */
export function subpathOf(outline: Outline): Inputs.OCCT.PathSubpath {
    const segments = outline.pieces.map((piece): Inputs.OCCT.PathSegment => {
        switch (piece.kind) {
            case "line":
                return { type: "line", to: piece.to };
            case "arc":
                return { type: "arc", to: piece.to, center: piece.center, rx: piece.radius, ry: piece.radius, xAxisRotation: 0, startAngle: piece.start, deltaAngle: piece.sweep };
            case "quadratic":
                return { type: "quadratic", c: piece.control, to: piece.to };
            default:
                return { type: "cubic", c1: piece.control1, c2: piece.control2, to: piece.to };
        }
    });
    return { start: outline.pieces[0]!.from, segments, closed: outline.closed };
}

/** The edges each command drew, given that piece `i` became edge `i`; commands that drew nothing are left out. */
export function segmentsOf(names: readonly string[], pieces: readonly Piece[]): Models.OCCT.SketchSegment[] {
    return names.flatMap((id, command) => {
        const edges = pieces.flatMap((piece, edge) => piece.owner === command ? [edge] : []);
        return edges.length === 0 ? [] : [{ id, command, edges }];
    });
}

type Corner = { kind: "fillet" | "chamfer"; size: number; owner: number; label: string };

const COMMAND_TYPES = [
    "line", "hLine", "vLine", "polarLine", "tangentLine", "threePointArc", "tangentArc", "sagittaArc", "bulgeArc",
    "quadratic", "cubic", "close", "filletCorner", "chamferCorner",
] as const;

type Fields = Record<string, unknown>;

type CommandType = typeof COMMAND_TYPES[number];

const isCommandType = (value: unknown): value is CommandType => typeof value === "string" && (COMMAND_TYPES as readonly string[]).includes(value);

/**
 * Draws the commands from `start` into pieces, checking each command as it arrives and naming it by
 * position and id in every refusal, with each command's name: its id, or its position as text.
 */
export function outlineOf(commands: unknown, start: Vec2): { outline: Outline; names: string[] } {
    if (!Array.isArray(commands)) {
        throw new InputError("`commands` is not a list of pen commands.", "commands");
    }
    const pen = new Pen(start);
    const names = commands.map((command: unknown, index) => pen.apply(command, index));
    names.forEach((name, index) => {
        const first = names.indexOf(name);
        if (first !== index) {
            const positional = String(index) === name ? index : first;
            const named = positional === index ? first : index;
            throw new InputError(`\`commands\` at position ${named} has the id \`${name}\`, the name the command at position ${positional} takes because it has no id; give that command an id, or use an id that is not a number.`, "commands");
        }
    });
    return { outline: pen.finish(), names };
}

class Pen {
    private readonly pieces: Piece[] = [];
    private cursor: Vec2;
    private closed = false;
    private pending: Corner | undefined;
    private wrap: Corner | undefined;
    private readonly ids = new Set<string>();
    private label = "";

    constructor(private readonly start: Vec2) {
        this.cursor = start;
    }

    apply(command: unknown, index: number): string {
        if (typeof command !== "object" || command === null) {
            throw new InputError(`\`commands\` at position ${index} is not a pen command.`, "commands");
        }
        const fields = command as Fields;
        const type = fields["type"];
        if (!isCommandType(type)) {
            throw new InputError(`\`commands\` at position ${index} has the type ${JSON.stringify(type ?? null)}; a command is one of ${COMMAND_TYPES.join(", ")}.`, "commands");
        }
        const given = fields["id"];
        if (given !== undefined && typeof given !== "string") {
            throw new InputError(`\`commands\` at position ${index} (a \`${type}\`) has an \`id\` that is not text.`, "commands");
        }
        const id = given === "" ? undefined : given;
        this.label = `\`commands\` at position ${index} (${id === undefined ? "" : `\`${id}\`, `}a \`${type}\`)`;
        if (id !== undefined) {
            if (this.ids.has(id)) {
                this.refuse(`uses the id \`${id}\` a command before it already has`);
            }
            this.ids.add(id);
        }
        if (this.closed && type !== "filletCorner" && type !== "chamferCorner") {
            this.refuse("comes after `close`; only a corner command may follow it");
        }
        this.draw(type, fields, index);
        return id ?? String(index);
    }

    finish(): Outline {
        if (this.pieces.length === 0) {
            throw new InputError("`commands` draw nothing: the pen needs at least one segment.", "commands");
        }
        if (this.pending !== undefined) {
            throw new InputError(`${this.pending.label} has no segment after it, so there is no corner to round or bevel: a corner command goes between the two segments it joins, or after \`close\` for the corner at the start.`, "commands");
        }
        if (!this.closed && length2(subtract2(this.cursor, this.start)) <= COINCIDENT && this.pieces.length > 1) {
            this.closed = true;
        }
        if (this.wrap !== undefined) {
            const last = this.pieces[this.pieces.length - 1]!;
            const first = this.pieces[0]!;
            const joined = cornerBetween(last, first, this.wrap, this.wrap.label);
            this.pieces[this.pieces.length - 1] = joined.before;
            this.pieces[0] = joined.after;
            this.pieces.push(joined.corner);
        }
        return { pieces: this.pieces, closed: this.closed };
    }

    private draw(type: CommandType, fields: Fields, index: number): void {
        switch (type) {
            case "line":
                this.lineTo(this.target(fields, "to"), index);
                break;
            case "hLine":
                this.lineTo(add2(this.cursor, [this.nonZero(fields, "length"), 0]), index);
                break;
            case "vLine":
                this.lineTo(add2(this.cursor, [0, this.nonZero(fields, "length")]), index);
                break;
            case "polarLine": {
                const distance = this.nonZero(fields, "length");
                this.lineTo(add2(this.cursor, polar2(distance, radiansOf(this.number(fields, "angle")))), index);
                break;
            }
            case "tangentLine": {
                const distance = this.number(fields, "length");
                if (!(distance > COINCIDENT)) {
                    this.refuse(`has the length ${distance}; a tangent line carries on forward, so its length must be above 0`);
                }
                this.lineTo(add2(this.cursor, scale2(this.direction(), distance)), index);
                break;
            }
            case "threePointArc":
                this.arcTo(arcThrough(this.cursor, this.target(fields, "through"), this.target(fields, "to"), index), "its three points lie on one line");
                break;
            case "tangentArc":
                this.arcTo(this.tangentArc(this.target(fields, "to"), index), "its end lies straight ahead; draw a `tangentLine` instead");
                break;
            case "sagittaArc":
                this.sagittaArc(this.target(fields, "to"), this.number(fields, "sagitta"), index);
                break;
            case "bulgeArc": {
                const to = this.target(fields, "to");
                this.sagittaArc(to, -this.number(fields, "bulge") * length2(subtract2(to, this.cursor)) / 2, index);
                break;
            }
            case "quadratic": {
                const control = this.target(fields, "control");
                const to = this.target(fields, "to");
                this.curveTo({ kind: "quadratic", from: this.cursor, control, to, owner: index });
                break;
            }
            case "cubic": {
                const control1 = this.target(fields, "control1");
                const control2 = this.target(fields, "control2");
                const to = this.target(fields, "to");
                this.curveTo({ kind: "cubic", from: this.cursor, control1, control2, to, owner: index });
                break;
            }
            case "close":
                if (length2(subtract2(this.cursor, this.start)) > COINCIDENT) {
                    this.lineTo(this.start, index);
                }
                this.closed = true;
                break;
            case "filletCorner":
                this.corner({ kind: "fillet", size: this.positive(fields, "radius"), owner: index, label: this.label });
                break;
            default:
                this.corner({ kind: "chamfer", size: this.positive(fields, "distance"), owner: index, label: this.label });
                break;
        }
    }

    private lineTo(to: Vec2, owner: number): void {
        if (length2(subtract2(to, this.cursor)) <= COINCIDENT) {
            this.refuse("draws a segment of no length: it ends where the pen already is");
        }
        this.push({ kind: "line", from: this.cursor, to, owner });
    }

    private arcTo(arc: ArcPiece | undefined, degenerate: string): void {
        if (arc === undefined) {
            this.refuse(`draws no arc: ${degenerate}`);
        }
        this.push(arc);
    }

    private curveTo(curve: QuadraticPiece | CubicPiece): void {
        if (length2(subtract2(curve.to, curve.from)) <= COINCIDENT) {
            this.refuse("draws a curve that ends where it starts");
        }
        this.push(curve);
    }

    private sagittaArc(to: Vec2, sagitta: number, owner: number): void {
        const chord = subtract2(to, this.cursor);
        if (length2(chord) <= COINCIDENT) {
            this.refuse("draws an arc that ends where it starts");
        }
        if (Math.abs(sagitta) <= COINCIDENT) {
            this.refuse("draws no arc: it stands no distance off the straight line to its end");
        }
        const middle = add2(scale2(add2(this.cursor, to), 0.5), scale2(leftOf2(unit2Of(chord)!), sagitta));
        this.arcTo(arcThrough(this.cursor, middle, to, owner), "it stands no distance off the straight line to its end");
    }

    private tangentArc(to: Vec2, owner: number): ArcPiece | undefined {
        const tangent = this.direction();
        const normal = leftOf2(tangent);
        const chord = subtract2(to, this.cursor);
        const across = dot2(chord, normal);
        if (length2(chord) <= COINCIDENT || Math.abs(across) <= COINCIDENT) {
            return undefined;
        }
        const signedRadius = dot2(chord, chord) / (2 * across);
        return arcAbout(add2(this.cursor, scale2(normal, signedRadius)), this.cursor, to, signedRadius > 0, owner);
    }

    private corner(corner: Corner): void {
        if (this.pieces.length === 0) {
            this.refuse("has no segment before it, so there is no corner to round or bevel");
        }
        if (this.pending !== undefined || this.wrap !== undefined) {
            this.refuse("follows another corner command; one corner takes one command");
        }
        if (this.closed) {
            this.wrap = corner;
        } else {
            this.pending = corner;
        }
    }

    private push(piece: Piece): void {
        if (this.pending !== undefined) {
            const before = this.pieces[this.pieces.length - 1]!;
            const joined = cornerBetween(before, piece, this.pending, this.pending.label);
            this.pieces[this.pieces.length - 1] = joined.before;
            this.pieces.push(joined.corner);
            this.pieces.push(joined.after);
            this.pending = undefined;
        } else {
            this.pieces.push(piece);
        }
        this.cursor = piece.to;
    }

    private direction(): Vec2 {
        const last = this.pieces[this.pieces.length - 1];
        if (last === undefined) {
            this.refuse("continues from the segment before it, and there is none");
        }
        return endTangent(last);
    }

    private target(fields: Fields, name: string): Vec2 {
        const value = fields[name];
        if (!Array.isArray(value) || value.length !== 2 || !value.every(part => typeof part === "number" && Number.isFinite(part))) {
            this.refuse(`has a \`${name}\` that is not a point: it needs two finite numbers`);
        }
        const point = value as Vec2;
        const relative = fields["relative"];
        if (relative !== undefined && typeof relative !== "boolean") {
            this.refuse("has a `relative` that is not true or false");
        }
        return relative === true ? add2(this.cursor, point) : [point[0], point[1]];
    }

    private number(fields: Fields, name: string): number {
        const value = fields[name];
        if (typeof value !== "number" || !Number.isFinite(value)) {
            this.refuse(`has a \`${name}\` that is not a finite number`);
        }
        return value;
    }

    private nonZero(fields: Fields, name: string): number {
        const value = this.number(fields, name);
        if (Math.abs(value) <= COINCIDENT) {
            this.refuse(`has the ${name} ${value}, which draws nothing`);
        }
        return value;
    }

    private positive(fields: Fields, name: string): number {
        const value = this.number(fields, name);
        if (!(value > 0)) {
            this.refuse(`has the ${name} ${value}; it must be above 0`);
        }
        return value;
    }

    private refuse(reason: string): never {
        throw new InputError(`${this.label} ${reason}.`, "commands");
    }
}

type Locus = { kind: "line"; through: Vec2; direction: Vec2 } | { kind: "circle"; center: Vec2; radius: number };

/**
 * Joins `before` and `after`, which meet at a corner, through a fillet arc or a chamfer line owned by
 * the corner command, trimming both. Only lines and circular arcs take a corner.
 */
export function cornerBetween(before: Piece, after: Piece, corner: Corner, label: string): { before: Piece; corner: Piece; after: Piece } {
    const refuse = (reason: string): never => {
        throw new InputError(`${label} ${reason}.`, "commands");
    };
    if (before.kind === "quadratic" || before.kind === "cubic" || after.kind === "quadratic" || after.kind === "cubic") {
        return refuse("rounds or bevels a corner next to a Bezier curve; only lines and circular arcs take a corner");
    }
    const arriving = endTangent(before);
    const leaving = startTangent(after);
    const turn = cross2(arriving, leaving);
    if (Math.abs(turn) <= STRAIGHT_TURN) {
        return refuse(dot2(arriving, leaving) > 0
            ? "rounds or bevels a corner where the segments meet in a straight line, so there is no corner"
            : "rounds or bevels a corner where the segments double back on each other");
    }
    const side = Math.sign(turn);
    const point = before.to;
    if (corner.kind === "chamfer") {
        const cutBefore = alongFromEnd(before, corner.size);
        const cutAfter = alongFromStart(after, corner.size);
        if (cutBefore === undefined || cutAfter === undefined) {
            return refuse(`bevels ${corner.size} off a segment shorter than that`);
        }
        return {
            before: trimmedEnd(before, cutBefore),
            corner: { kind: "line", from: cutBefore, to: cutAfter, owner: corner.owner },
            after: trimmedStart(after, cutAfter),
        };
    }
    const radius = corner.size;
    const loci = [locusOf(before, side, radius), locusOf(after, side, radius)];
    if (loci[0] === undefined || loci[1] === undefined) {
        return refuse(`rounds with the radius ${radius}, larger than the arc beside the corner allows`);
    }
    const center = nearest(point, crossings(loci[0], loci[1]));
    if (center === undefined) {
        return refuse(`rounds with the radius ${radius}, which does not fit between the segments`);
    }
    const touchBefore = touchPoint(before, center);
    const touchAfter = touchPoint(after, center);
    if (!withinFromEnd(before, touchBefore) || !withinFromStart(after, touchAfter)) {
        return refuse(`rounds with the radius ${radius}, too large for the segments beside the corner`);
    }
    return {
        before: trimmedEnd(before, touchBefore),
        corner: arcAbout(center, touchBefore, touchAfter, side > 0, corner.owner),
        after: trimmedStart(after, touchAfter),
    };
}

function locusOf(piece: LinePiece | ArcPiece, side: number, radius: number): Locus | undefined {
    if (piece.kind === "line") {
        const direction = unit2Of(subtract2(piece.to, piece.from))!;
        return { kind: "line", through: add2(piece.from, scale2(leftOf2(direction), side * radius)), direction };
    }
    const offset = piece.radius - side * Math.sign(piece.sweep) * radius;
    return offset > COINCIDENT ? { kind: "circle", center: piece.center, radius: offset } : undefined;
}

function crossings(a: Locus, b: Locus): Vec2[] {
    if (a.kind === "line" && b.kind === "line") {
        const denominator = cross2(a.direction, b.direction);
        if (Math.abs(denominator) <= STRAIGHT_TURN) {
            return [];
        }
        const along = cross2(subtract2(b.through, a.through), b.direction) / denominator;
        return [add2(a.through, scale2(a.direction, along))];
    }
    if (a.kind === "circle" && b.kind === "circle") {
        return circleCrossings(a, b);
    }
    const line = a.kind === "line" ? a : b as Extract<Locus, { kind: "line" }>;
    const circle = a.kind === "circle" ? a : b as Extract<Locus, { kind: "circle" }>;
    const offset = subtract2(line.through, circle.center);
    const half = dot2(offset, line.direction);
    const rest = dot2(offset, offset) - circle.radius * circle.radius;
    const discriminant = half * half - rest;
    if (discriminant < 0) {
        return [];
    }
    const root = Math.sqrt(discriminant);
    return [-half - root, -half + root].map(along => add2(line.through, scale2(line.direction, along)));
}

function circleCrossings(a: { center: Vec2; radius: number }, b: { center: Vec2; radius: number }): Vec2[] {
    const between = subtract2(b.center, a.center);
    const distance = length2(between);
    if (distance <= COINCIDENT || distance > a.radius + b.radius || distance < Math.abs(a.radius - b.radius)) {
        return [];
    }
    const along = (a.radius * a.radius - b.radius * b.radius + distance * distance) / (2 * distance);
    const across = Math.sqrt(Math.max(0, a.radius * a.radius - along * along));
    const foot = add2(a.center, scale2(between, along / distance));
    const normal = leftOf2(scale2(between, 1 / distance));
    return [add2(foot, scale2(normal, across)), subtract2(foot, scale2(normal, across))];
}

function nearest(point: Vec2, candidates: Vec2[]): Vec2 | undefined {
    let best: Vec2 | undefined;
    for (const candidate of candidates) {
        if (best === undefined || length2(subtract2(candidate, point)) < length2(subtract2(best, point))) {
            best = candidate;
        }
    }
    return best;
}

function touchPoint(piece: LinePiece | ArcPiece, center: Vec2): Vec2 {
    if (piece.kind === "line") {
        const direction = unit2Of(subtract2(piece.to, piece.from))!;
        return add2(piece.from, scale2(direction, dot2(subtract2(center, piece.from), direction)));
    }
    return add2(piece.center, scale2(unit2Of(subtract2(center, piece.center))!, piece.radius));
}

function travelled(piece: LinePiece | ArcPiece, point: Vec2): number {
    if (piece.kind === "line") {
        return dot2(subtract2(point, piece.from), unit2Of(subtract2(piece.to, piece.from))!);
    }
    const angle = angleOf(subtract2(point, piece.center));
    const turned = piece.sweep > 0 ? turnBetween(piece.start, angle) : turnBetween(angle, piece.start);
    return (FULL_TURN - turned) * piece.radius <= COINCIDENT ? 0 : turned * piece.radius;
}

function withinFromEnd(piece: LinePiece | ArcPiece, point: Vec2): boolean {
    const along = travelled(piece, point);
    return along > COINCIDENT && along < pieceLength(piece) + COINCIDENT;
}

function withinFromStart(piece: LinePiece | ArcPiece, point: Vec2): boolean {
    const along = travelled(piece, point);
    return along > -COINCIDENT && along < pieceLength(piece) - COINCIDENT;
}

function alongFromEnd(piece: LinePiece | ArcPiece, distance: number): Vec2 | undefined {
    return pointAt(piece, pieceLength(piece) - distance);
}

function alongFromStart(piece: LinePiece | ArcPiece, distance: number): Vec2 | undefined {
    return pointAt(piece, distance);
}

function pointAt(piece: LinePiece | ArcPiece, along: number): Vec2 | undefined {
    if (!(along > COINCIDENT && along < pieceLength(piece) - COINCIDENT)) {
        return undefined;
    }
    if (piece.kind === "line") {
        return add2(piece.from, scale2(unit2Of(subtract2(piece.to, piece.from))!, along));
    }
    return circlePoint(piece.center, piece.radius, piece.start + Math.sign(piece.sweep) * along / piece.radius);
}

function trimmedEnd(piece: LinePiece | ArcPiece, to: Vec2): LinePiece | ArcPiece {
    if (piece.kind === "line") {
        return { ...piece, to };
    }
    const sweep = Math.sign(piece.sweep) * travelled(piece, to) / piece.radius;
    return { ...piece, to, sweep };
}

function trimmedStart(piece: LinePiece | ArcPiece, from: Vec2): LinePiece | ArcPiece {
    if (piece.kind === "line") {
        return { ...piece, from };
    }
    const turned = travelled(piece, from) / piece.radius;
    const start = piece.start + Math.sign(piece.sweep) * turned;
    return { ...piece, from, start, sweep: piece.sweep - Math.sign(piece.sweep) * turned };
}
