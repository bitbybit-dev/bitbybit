import { InputError } from "@bitbybit-dev/base";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

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

const FULL_TURN = 2 * Math.PI;
const STRAIGHT_TURN = 1e-9;

const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];
const scale = (a: Vec2, factor: number): Vec2 => [a[0] * factor, a[1] * factor];
const dot = (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1];
const cross = (a: Vec2, b: Vec2): number => a[0] * b[1] - a[1] * b[0];
const length = (a: Vec2): number => Math.hypot(a[0], a[1]);
const unit = (a: Vec2): Vec2 => scale(a, 1 / length(a));
const left = (a: Vec2): Vec2 => [-a[1], a[0]];
const angleOf = (a: Vec2): number => Math.atan2(a[1], a[0]);
const onCircle = (center: Vec2, radius: number, angle: number): Vec2 => [center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)];
const turnBetween = (from: number, to: number): number => ((to - from) % FULL_TURN + FULL_TURN) % FULL_TURN;

/** The direction a piece leaves its start in. */
export function startTangent(piece: Piece): Vec2 {
    switch (piece.kind) {
        case "line":
            return unit(sub(piece.to, piece.from));
        case "arc":
            return scale(left(unit(sub(piece.from, piece.center))), Math.sign(piece.sweep));
        case "quadratic":
            return unit(sub(firstApart(piece.from, [piece.control, piece.to]), piece.from));
        default:
            return unit(sub(firstApart(piece.from, [piece.control1, piece.control2, piece.to]), piece.from));
    }
}

/** The direction a piece arrives at its end in. */
export function endTangent(piece: Piece): Vec2 {
    switch (piece.kind) {
        case "line":
            return unit(sub(piece.to, piece.from));
        case "arc":
            return scale(left(unit(sub(piece.to, piece.center))), Math.sign(piece.sweep));
        case "quadratic":
            return unit(sub(piece.to, firstApart(piece.to, [piece.control, piece.from])));
        default:
            return unit(sub(piece.to, firstApart(piece.to, [piece.control2, piece.control1, piece.from])));
    }
}

function firstApart(point: Vec2, candidates: Vec2[]): Vec2 {
    return candidates.find(candidate => length(sub(candidate, point)) > COINCIDENT) ?? candidates[candidates.length - 1]!;
}

/** How long a line or an arc is. */
function pieceLength(piece: LinePiece | ArcPiece): number {
    return piece.kind === "line" ? length(sub(piece.to, piece.from)) : piece.radius * Math.abs(piece.sweep);
}

/** The arc through three points, turning the way they turn, or undefined when they line up. */
export function arcThrough(from: Vec2, through: Vec2, to: Vec2, owner: number): ArcPiece | undefined {
    const chord = sub(to, from);
    const twiceArea = cross(sub(through, from), chord);
    if (length(chord) <= COINCIDENT || Math.abs(twiceArea) <= COINCIDENT * length(chord)) {
        return undefined;
    }
    const d = 2 * (from[0] * (through[1] - to[1]) + through[0] * (to[1] - from[1]) + to[0] * (from[1] - through[1]));
    const fromSquared = dot(from, from);
    const throughSquared = dot(through, through);
    const toSquared = dot(to, to);
    const center: Vec2 = [
        (fromSquared * (through[1] - to[1]) + throughSquared * (to[1] - from[1]) + toSquared * (from[1] - through[1])) / d,
        (fromSquared * (to[0] - through[0]) + throughSquared * (from[0] - to[0]) + toSquared * (through[0] - from[0])) / d,
    ];
    const counterclockwise = cross(sub(through, from), sub(to, through)) > 0;
    return arcAbout(center, from, to, counterclockwise, owner);
}

/** The arc about `center` from `from` to `to`, counterclockwise or clockwise. */
function arcAbout(center: Vec2, from: Vec2, to: Vec2, counterclockwise: boolean, owner: number): ArcPiece {
    const start = angleOf(sub(from, center));
    const end = angleOf(sub(to, center));
    const sweep = counterclockwise ? turnBetween(start, end) : -turnBetween(end, start);
    return { kind: "arc", from, to, center, radius: length(sub(from, center)), start, sweep, owner };
}

/** Twice the signed area a closed run of pieces encloses: positive when it runs counterclockwise. */
export function signedArea(pieces: readonly Piece[]): number {
    let twice = 0;
    for (const piece of pieces) {
        switch (piece.kind) {
            case "line":
                twice += cross(piece.from, piece.to);
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
        const derivative = scale(sub(level.after, level.before), degree);
        sum += weight * cross(position, derivative);
    }
    return sum;
}

function deCasteljau(points: readonly Vec2[], t: number): { point: Vec2; before: Vec2; after: Vec2 } {
    let level = points.slice();
    while (level.length > 2) {
        level = level.slice(1).map((point, index) => add(scale(level[index]!, 1 - t), scale(point, t)));
    }
    const before = level[0]!;
    const after = level[1]!;
    return { point: add(scale(before, 1 - t), scale(after, t)), before, after };
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
        if (!this.closed && length(sub(this.cursor, this.start)) <= COINCIDENT && this.pieces.length > 1) {
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
                this.lineTo(add(this.cursor, [this.nonZero(fields, "length"), 0]), index);
                break;
            case "vLine":
                this.lineTo(add(this.cursor, [0, this.nonZero(fields, "length")]), index);
                break;
            case "polarLine": {
                const distance = this.nonZero(fields, "length");
                const angle = this.number(fields, "angle") * Math.PI / 180;
                this.lineTo(add(this.cursor, [distance * Math.cos(angle), distance * Math.sin(angle)]), index);
                break;
            }
            case "tangentLine": {
                const distance = this.number(fields, "length");
                if (!(distance > COINCIDENT)) {
                    this.refuse(`has the length ${distance}; a tangent line carries on forward, so its length must be above 0`);
                }
                this.lineTo(add(this.cursor, scale(this.direction(), distance)), index);
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
                this.sagittaArc(to, -this.number(fields, "bulge") * length(sub(to, this.cursor)) / 2, index);
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
                if (length(sub(this.cursor, this.start)) > COINCIDENT) {
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
        if (length(sub(to, this.cursor)) <= COINCIDENT) {
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
        if (length(sub(curve.to, curve.from)) <= COINCIDENT) {
            this.refuse("draws a curve that ends where it starts");
        }
        this.push(curve);
    }

    private sagittaArc(to: Vec2, sagitta: number, owner: number): void {
        const chord = sub(to, this.cursor);
        if (length(chord) <= COINCIDENT) {
            this.refuse("draws an arc that ends where it starts");
        }
        if (Math.abs(sagitta) <= COINCIDENT) {
            this.refuse("draws no arc: it stands no distance off the straight line to its end");
        }
        const middle = add(scale(add(this.cursor, to), 0.5), scale(left(unit(chord)), sagitta));
        this.arcTo(arcThrough(this.cursor, middle, to, owner), "it stands no distance off the straight line to its end");
    }

    private tangentArc(to: Vec2, owner: number): ArcPiece | undefined {
        const tangent = this.direction();
        const normal = left(tangent);
        const chord = sub(to, this.cursor);
        const across = dot(chord, normal);
        if (length(chord) <= COINCIDENT || Math.abs(across) <= COINCIDENT) {
            return undefined;
        }
        const signedRadius = dot(chord, chord) / (2 * across);
        return arcAbout(add(this.cursor, scale(normal, signedRadius)), this.cursor, to, signedRadius > 0, owner);
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
        return relative === true ? add(this.cursor, point) : [point[0], point[1]];
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

/** Where a circle centered on the corner's inner side sits against a line or an arc. */
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
    const turn = cross(arriving, leaving);
    if (Math.abs(turn) <= STRAIGHT_TURN) {
        return refuse(dot(arriving, leaving) > 0
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
        const direction = unit(sub(piece.to, piece.from));
        return { kind: "line", through: add(piece.from, scale(left(direction), side * radius)), direction };
    }
    const offset = piece.radius - side * Math.sign(piece.sweep) * radius;
    return offset > COINCIDENT ? { kind: "circle", center: piece.center, radius: offset } : undefined;
}

function crossings(a: Locus, b: Locus): Vec2[] {
    if (a.kind === "line" && b.kind === "line") {
        const denominator = cross(a.direction, b.direction);
        if (Math.abs(denominator) <= STRAIGHT_TURN) {
            return [];
        }
        const along = cross(sub(b.through, a.through), b.direction) / denominator;
        return [add(a.through, scale(a.direction, along))];
    }
    if (a.kind === "circle" && b.kind === "circle") {
        return circleCrossings(a, b);
    }
    const line = a.kind === "line" ? a : b as Extract<Locus, { kind: "line" }>;
    const circle = a.kind === "circle" ? a : b as Extract<Locus, { kind: "circle" }>;
    const offset = sub(line.through, circle.center);
    const half = dot(offset, line.direction);
    const rest = dot(offset, offset) - circle.radius * circle.radius;
    const discriminant = half * half - rest;
    if (discriminant < 0) {
        return [];
    }
    const root = Math.sqrt(discriminant);
    return [-half - root, -half + root].map(along => add(line.through, scale(line.direction, along)));
}

function circleCrossings(a: { center: Vec2; radius: number }, b: { center: Vec2; radius: number }): Vec2[] {
    const between = sub(b.center, a.center);
    const distance = length(between);
    if (distance <= COINCIDENT || distance > a.radius + b.radius || distance < Math.abs(a.radius - b.radius)) {
        return [];
    }
    const along = (a.radius * a.radius - b.radius * b.radius + distance * distance) / (2 * distance);
    const across = Math.sqrt(Math.max(0, a.radius * a.radius - along * along));
    const foot = add(a.center, scale(between, along / distance));
    const normal = left(scale(between, 1 / distance));
    return [add(foot, scale(normal, across)), sub(foot, scale(normal, across))];
}

function nearest(point: Vec2, candidates: Vec2[]): Vec2 | undefined {
    let best: Vec2 | undefined;
    for (const candidate of candidates) {
        if (best === undefined || length(sub(candidate, point)) < length(sub(best, point))) {
            best = candidate;
        }
    }
    return best;
}

function touchPoint(piece: LinePiece | ArcPiece, center: Vec2): Vec2 {
    if (piece.kind === "line") {
        const direction = unit(sub(piece.to, piece.from));
        return add(piece.from, scale(direction, dot(sub(center, piece.from), direction)));
    }
    return add(piece.center, scale(unit(sub(center, piece.center)), piece.radius));
}

/** How far along a line or an arc a point on it lies from the piece's start. */
function travelled(piece: LinePiece | ArcPiece, point: Vec2): number {
    if (piece.kind === "line") {
        return dot(sub(point, piece.from), unit(sub(piece.to, piece.from)));
    }
    const angle = angleOf(sub(point, piece.center));
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
        return add(piece.from, scale(unit(sub(piece.to, piece.from)), along));
    }
    return onCircle(piece.center, piece.radius, piece.start + Math.sign(piece.sweep) * along / piece.radius);
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
