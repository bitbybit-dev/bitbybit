import * as Inputs from "../../../../inputs";
import { simplex } from "../../../../models/simplex";
import { angleWithinTurn } from "../../curves/conic-arcs";
import { pointToWorld } from "../../geometry/frame-axes";
import type { FrameAxes } from "../../geometry/frame-axes";
import { degreesOf, radiansOf } from "../../geometry/scalars";
import { distance2, dot2, leftOf2, polar2, scale2, subtract2 } from "../../geometry/vectors";
import { strokeFontInk, strokeTextAdvance } from "../../text/stroke-font";
import { FULL_TURN_DEGREES, LONGEST_TEXT, QUARTER_TURN_DEGREES } from "../drawing/drawing.constants";
import { mappedSegments } from "./dxf-reader-geometry";
import {
    ANNOTATION_GROUP, GROUP, HATCH_EDGE, HATCH_POLYLINE_FLAG, MAX_SPLINE_DEGREE, MIDDLE_DROP_SHARE, SAME_ANGLE_DEGREES, SAME_TURN, TEXT_CODES, TEXT_CONTROLS, TEXT_JUSTIFIED, TEXT_VERTICAL,
} from "./dxf-reader.constants";
import type { DxfEntityRecord, DxfGroup, PlanarTurn, ReadHatch, ReadSegment, ReadText } from "./dxf-reader-types";
import type { DxfMeasurement } from "./dxf-tables";
import { decodedText, numberIn, numberOf, textOf, valueOf } from "./dxf-tokens";
import { DXF_EXTRUSION_CODES, DXF_HATCH_NAMES, DXF_HATCH_NATIVE_ANGLE, DXF_HATCH_NATIVE_SPACING } from "./dxf.constants";

type Point2 = Inputs.Base.Point2;
type Point3 = Inputs.Base.Point3;

interface HatchLine {
    readonly angle: number;
    readonly spacing: number;
}

const HATCH_DEFAULTS = new Inputs.IO.DrawingHatchDto();
const NAMED_PATTERNS: ReadonlyMap<string, Inputs.IO.hatchPatternEnum> = new Map(Object.values(Inputs.IO.hatchPatternEnum)
    .filter(pattern => pattern !== Inputs.IO.hatchPatternEnum.solid)
    .map(pattern => [DXF_HATCH_NAMES[pattern]!.toLowerCase(), pattern]));
const CUT_SHORT = "its boundary is cut short or is not one this reads";
const TOO_HIGH_DEGREE = `its boundary holds a spline of a degree above ${MAX_SPLINE_DEGREE}, the highest a kernel curve takes`;

class Unread extends Error {
    constructor(readonly reason: string) {
        super(reason);
    }
}

class Cursor {
    constructor(private readonly groups: readonly DxfGroup[], private at: number) { }

    peek(ahead = 0): number | undefined {
        return this.groups[this.at + ahead]?.code;
    }

    take(code: number): number {
        return numberIn(this.next(code));
    }

    pass(code: number): void {
        this.next(code);
    }

    count(code: number): number {
        const value = this.take(code);
        if (!Number.isInteger(value) || value < 0 || value > this.groups.length - this.at) {
            throw new Unread(CUT_SHORT);
        }
        return value;
    }

    seek(code: number): boolean {
        const found = this.groups.findIndex((group, at) => at >= this.at && group.code === code);
        if (found >= 0) {
            this.at = found;
        }
        return found >= 0;
    }

    private next(code: number): DxfGroup {
        while (this.at < this.groups.length) {
            const group = this.groups[this.at]!;
            this.at += 1;
            if (group.code === code) {
                return group;
            }
        }
        throw new Unread(CUT_SHORT);
    }
}

export const planarTurnOf = (map: FrameAxes): PlanarTurn | undefined => {
    const scale = Math.hypot(map.x[0], map.x[1]);
    const slack = SAME_TURN * Math.max(1, scale);
    const flat = Math.abs(map.x[2]) <= slack && Math.abs(map.y[2]) <= slack && Math.abs(map.z[0]) <= slack && Math.abs(map.z[1]) <= slack && map.z[2] > 0;
    const square = Math.abs(map.y[0] + map.x[1]) <= slack && Math.abs(map.y[1] - map.x[0]) <= slack;
    return flat && square && scale > 0 ? { scale, rotation: Math.atan2(map.x[1], map.x[0]) } : undefined;
};

export const plainDxfText = (value: string): string =>
    decodedText(value).replace(TEXT_CODES, (_found, code: string | undefined, caret: string | undefined) => {
        if (code === undefined) {
            return caret === " " ? "^" : "";
        }
        switch (code.toLowerCase()) {
            case "%":
                return "%";
            case "c":
                return "⌀";
            case "d":
                return "°";
            case "p":
                return "±";
            case "u":
            case "o":
            case "k":
                return "";
            default:
                return String.fromCharCode(Number(code));
        }
    }).replace(TEXT_CONTROLS, "");

const facesUp = (record: DxfEntityRecord): boolean =>
    numberOf(record, DXF_EXTRUSION_CODES[0], 0) === 0 && numberOf(record, DXF_EXTRUSION_CODES[1], 0) === 0 && numberOf(record, DXF_EXTRUSION_CODES[2], 1) > 0;

const pointAt = (record: DxfEntityRecord, xCode: number, yCode: number, fallback: Point3): Point3 => [numberOf(record, xCode, fallback[0]), numberOf(record, yCode, fallback[1]), 0];

const flat = (point: Point3): Point2 => [point[0], point[1]];

const verticalOf = (record: DxfEntityRecord, justified: number): number => {
    if (justified === TEXT_JUSTIFIED.middle) {
        return TEXT_VERTICAL.middle;
    }
    return justified <= TEXT_JUSTIFIED.right ? numberOf(record, ANNOTATION_GROUP.verticalJustified, TEXT_VERTICAL.baseline) : TEXT_VERTICAL.baseline;
};

const dropOf = (vertical: number, height: number): number => {
    switch (vertical) {
        case TEXT_VERTICAL.bottom:
            return strokeFontInk(simplex).lowest * height;
        case TEXT_VERTICAL.middle:
            return MIDDLE_DROP_SHARE * height;
        case TEXT_VERTICAL.top:
            return height;
        default:
            return 0;
    }
};

const baselineOf = (point: Point3, rotation: number, drop: number): Point3 => {
    if (drop === 0) {
        return point;
    }
    const lowered = subtract2(flat(point), scale2(leftOf2(polar2(1, radiansOf(rotation))), drop));
    return [lowered[0], lowered[1], point[2]];
};

export const readTextOf = (record: DxfEntityRecord): ReadText | string | undefined => {
    if (!facesUp(record)) {
        return "it is drawn out of the drawing's plane";
    }
    const value = plainDxfText(valueOf(record, ANNOTATION_GROUP.text) ?? "");
    if (value.trim() === "") {
        return undefined;
    }
    if (value.length > LONGEST_TEXT) {
        return `its text is longer than ${LONGEST_TEXT} characters`;
    }
    const given = numberOf(record, ANNOTATION_GROUP.height, 0);
    if (!(given > 0)) {
        return "it has no height";
    }
    const first = pointAt(record, GROUP.x, GROUP.y, [0, 0, 0]);
    const second = pointAt(record, GROUP.otherX, ANNOTATION_GROUP.otherY, first);
    const justified = numberOf(record, ANNOTATION_GROUP.justified, TEXT_JUSTIFIED.left);
    const natural = strokeTextAdvance(simplex, value) * given;
    const span = distance2(flat(second), flat(first));
    const written = numberOf(record, ANNOTATION_GROUP.widthFactor, 1);
    const factor = written > 0 ? written : 1;
    if ((justified === TEXT_JUSTIFIED.fit || justified === TEXT_JUSTIFIED.aligned) && span > 0 && natural > 0) {
        const fitted = justified === TEXT_JUSTIFIED.fit;
        return {
            value,
            position: first,
            height: fitted ? given : given * span / (natural * factor),
            anchor: "start",
            rotation: degreesOf(Math.atan2(second[1] - first[1], second[0] - first[0])),
            widthFactor: fitted ? span / natural : factor,
        };
    }
    const centred = justified === TEXT_JUSTIFIED.center || justified === TEXT_JUSTIFIED.middle;
    const ended = justified === TEXT_JUSTIFIED.right;
    const vertical = verticalOf(record, justified);
    const rotation = numberOf(record, GROUP.rotation, 0);
    const aligned = centred || ended || vertical !== TEXT_VERTICAL.baseline ? second : first;
    return {
        value,
        position: baselineOf(aligned, rotation, dropOf(vertical, given)),
        height: given,
        anchor: centred ? "middle" : ended ? "end" : "start",
        rotation,
        widthFactor: factor,
    };
};

export const placedText = (text: ReadText, turn: PlanarTurn, map: FrameAxes): ReadText => ({
    ...text,
    position: pointToWorld(map, text.position),
    height: text.height * turn.scale,
    rotation: text.rotation + degreesOf(turn.rotation),
});

const arcOf = (cursor: Cursor, xAxis: Point3, yAxis: Point3, center: Point3): ReadSegment => {
    const from = cursor.take(GROUP.startAngle);
    const to = cursor.take(GROUP.endAngle);
    const counterclockwise = cursor.take(ANNOTATION_GROUP.counterclockwise) !== 0;
    const start = counterclockwise ? from : FULL_TURN_DEGREES - to;
    const end = counterclockwise ? to : FULL_TURN_DEGREES - from;
    const sweep = angleWithinTurn(end - start, FULL_TURN_DEGREES);
    return { kind: "conic", center, xAxis, yAxis, start: radiansOf(angleWithinTurn(start, FULL_TURN_DEGREES)), sweep: radiansOf(sweep === 0 ? FULL_TURN_DEGREES : sweep) };
};

const splineEdgeOf = (cursor: Cursor): ReadSegment => {
    const degree = cursor.take(ANNOTATION_GROUP.edgeDegree);
    const rational = cursor.take(ANNOTATION_GROUP.rational) !== 0;
    cursor.take(ANNOTATION_GROUP.periodic);
    const knotCount = cursor.count(ANNOTATION_GROUP.knotCount);
    const pointCount = cursor.count(ANNOTATION_GROUP.pointCount);
    const knots = Array.from({ length: knotCount }, () => cursor.take(GROUP.knot));
    const points: Point3[] = [];
    const weights: number[] = [];
    for (let at = 0; at < pointCount; at += 1) {
        points.push([cursor.take(GROUP.x), cursor.take(GROUP.y), 0]);
        weights.push(rational && cursor.peek() === ANNOTATION_GROUP.edgeWeight ? cursor.take(ANNOTATION_GROUP.edgeWeight) : 1);
    }
    if (cursor.peek() === ANNOTATION_GROUP.fitCount && (cursor.peek(1) === GROUP.otherX || cursor.peek(1) === ANNOTATION_GROUP.sources)) {
        const fitted = cursor.count(ANNOTATION_GROUP.fitCount);
        for (let at = 0; at < fitted; at += 1) {
            cursor.take(GROUP.otherX);
            cursor.take(ANNOTATION_GROUP.otherY);
        }
    }
    if (degree > MAX_SPLINE_DEGREE) {
        throw new Unread(TOO_HIGH_DEGREE);
    }
    if (!Number.isInteger(degree) || degree < 1 || pointCount <= degree || knots.length !== pointCount + degree + 1 || weights.some(weight => !(weight > 0))) {
        throw new Unread(CUT_SHORT);
    }
    return { kind: "spline", curve: { degree, points, weights, knots } };
};

const edgeOf = (cursor: Cursor): ReadSegment => {
    const kind = cursor.take(ANNOTATION_GROUP.edgeType);
    if (kind === HATCH_EDGE.spline) {
        return splineEdgeOf(cursor);
    }
    const first: Point3 = [cursor.take(GROUP.x), cursor.take(GROUP.y), 0];
    if (kind === HATCH_EDGE.line) {
        return { kind: "line", start: first, end: [cursor.take(GROUP.otherX), cursor.take(ANNOTATION_GROUP.otherY), 0] };
    }
    if (kind === HATCH_EDGE.arc) {
        const radius = cursor.take(GROUP.radius);
        return arcOf(cursor, [radius, 0, 0], [0, radius, 0], first);
    }
    if (kind === HATCH_EDGE.ellipse) {
        const major: Point3 = [cursor.take(GROUP.otherX), cursor.take(ANNOTATION_GROUP.otherY), 0];
        const ratio = cursor.take(GROUP.ratio);
        return arcOf(cursor, major, [-major[1] * ratio, major[0] * ratio, 0], first);
    }
    throw new Unread(CUT_SHORT);
};

const loopOf = (cursor: Cursor): ReadSegment[] => {
    const flags = cursor.take(ANNOTATION_GROUP.loopFlags);
    let segments: ReadSegment[];
    if ((flags & HATCH_POLYLINE_FLAG) !== 0) {
        const bulged = cursor.take(ANNOTATION_GROUP.hasBulge) !== 0;
        cursor.take(ANNOTATION_GROUP.closedLoop);
        const count = cursor.count(ANNOTATION_GROUP.vertexCount);
        const points: Point3[] = [];
        const bulges: number[] = [];
        for (let at = 0; at < count; at += 1) {
            points.push([cursor.take(GROUP.x), cursor.take(GROUP.y), 0]);
            bulges.push(bulged && cursor.peek() === GROUP.bulge ? cursor.take(GROUP.bulge) : 0);
        }
        segments = points.length < 2 ? [] : [{ kind: "polyline", points, bulges, closed: true, normal: [0, 0, 1] }];
    } else {
        segments = Array.from({ length: cursor.count(ANNOTATION_GROUP.vertexCount) }, () => edgeOf(cursor));
    }
    const sources = cursor.count(ANNOTATION_GROUP.sources);
    for (let at = 0; at < sources; at += 1) {
        cursor.pass(ANNOTATION_GROUP.owner);
    }
    return segments;
};

const linesOf = (cursor: Cursor): HatchLine[] => {
    if (!cursor.seek(ANNOTATION_GROUP.lineCount)) {
        return [];
    }
    return Array.from({ length: cursor.count(ANNOTATION_GROUP.lineCount) }, (): HatchLine => {
        const angle = cursor.take(ANNOTATION_GROUP.lineAngle);
        cursor.take(ANNOTATION_GROUP.baseX);
        cursor.take(ANNOTATION_GROUP.baseY);
        const offset: Point2 = [cursor.take(ANNOTATION_GROUP.offsetX), cursor.take(ANNOTATION_GROUP.offsetY)];
        const dashes = cursor.count(ANNOTATION_GROUP.dashCount);
        for (let at = 0; at < dashes; at += 1) {
            cursor.take(ANNOTATION_GROUP.dash);
        }
        return { angle, spacing: Math.abs(dot2(offset, leftOf2(polar2(1, radiansOf(angle))))) };
    });
};

const apart = (first: number, second: number): number => {
    const turned = angleWithinTurn(second - first, FULL_TURN_DEGREES / 2);
    return Math.min(turned, FULL_TURN_DEGREES / 2 - turned);
};

const patternOf = (record: DxfEntityRecord, lines: readonly HatchLine[], measurement: DxfMeasurement): Pick<ReadHatch, "pattern" | "angle" | "spacing" | "simplified"> => {
    const pattern = Inputs.IO.hatchPatternEnum;
    if (numberOf(record, ANNOTATION_GROUP.solid, 0) === 1) {
        return { pattern: pattern.solid, angle: HATCH_DEFAULTS.angle!, spacing: HATCH_DEFAULTS.spacing!, simplified: false };
    }
    const [first, second] = lines;
    if (first === undefined || !(first.spacing > 0)) {
        const named = NAMED_PATTERNS.get(textOf(record, GROUP.name).toLowerCase());
        const known = named ?? pattern.ansi31;
        const scale = numberOf(record, ANNOTATION_GROUP.patternScale, 1);
        return {
            pattern: known,
            angle: angleWithinTurn(DXF_HATCH_NATIVE_ANGLE + numberOf(record, ANNOTATION_GROUP.patternAngle, 0), FULL_TURN_DEGREES),
            spacing: DXF_HATCH_NATIVE_SPACING[measurement][known]! * (scale > 0 ? scale : 1),
            simplified: named === undefined,
        };
    }
    const paired = second !== undefined && lines.length === 2 && apart(first.angle, second.angle) <= SAME_ANGLE_DEGREES;
    const crossed = second !== undefined && lines.length === 2 && Math.abs(apart(first.angle, second.angle) - QUARTER_TURN_DEGREES) <= SAME_ANGLE_DEGREES;
    return { pattern: paired ? pattern.ansi32 : crossed ? pattern.ansi37 : pattern.ansi31, angle: first.angle, spacing: first.spacing, simplified: lines.length > 1 && !paired && !crossed };
};

export const readHatchOf = (record: DxfEntityRecord, measurement: DxfMeasurement): ReadHatch | string | undefined => {
    if (!facesUp(record)) {
        return "it is drawn out of the drawing's plane";
    }
    const start = record.groups.findIndex(group => group.code === ANNOTATION_GROUP.loopCount);
    if (start < 0) {
        return "it has no boundary";
    }
    try {
        const cursor = new Cursor(record.groups, start);
        const boundaries = Array.from({ length: cursor.count(ANNOTATION_GROUP.loopCount) }, () => loopOf(cursor)).filter(loop => loop.length > 0);
        return boundaries.length === 0 ? undefined : { ...patternOf(record, linesOf(cursor), measurement), boundaries };
    } catch (error) {
        if (error instanceof Unread) {
            return error.reason;
        }
        throw error;
    }
};

export const placedHatch = (hatch: ReadHatch, turn: PlanarTurn, map: FrameAxes, isPlaced: boolean): ReadHatch => ({
    ...hatch,
    boundaries: isPlaced ? hatch.boundaries.map(loop => loop.flatMap(segment => mappedSegments(map, segment))) : hatch.boundaries,
    angle: hatch.angle + degreesOf(turn.rotation),
    spacing: hatch.spacing * turn.scale,
});
