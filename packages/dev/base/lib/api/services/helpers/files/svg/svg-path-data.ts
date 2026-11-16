import type * as Inputs from "../../../../inputs";
import { conicArcOfEllipseArc, ellipseFramePoint } from "../../curves/conic-arcs";
import { pointOnCubic2 } from "../../geometry/arcs";
import { ellipseArcOfEndpoints2 } from "../../geometry/ellipse-arcs";
import { radiansOf } from "../../geometry/scalars";
import { between2, scale2, subtract2 } from "../../geometry/vectors";
import type { ScannedSvgNumbers, SvgSegment, SvgSubpath } from "./svg-path-types";
import {
    ARC_COMMAND, ARC_END_ARGUMENT, ARC_FLAG_ARGUMENTS, ARGUMENTS_PER_PATH_COMMAND, CUBIC_END_ARGUMENT, MOVE_COMMAND, QUADRATIC_TO_CUBIC_SHARE, QUARTER_TURN,
} from "./svg-path-data.constants";

type Point2 = Inputs.Base.Point2;

interface PathToken {
    command: string;
    args: number[];
}

interface ArgumentGroup {
    args: number[];
    end: number;
}

type Read = readonly [number, number];

const NUMBER = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y;
const SEPARATOR = /[\s,]/;

const skipSeparators = (text: string, from: number): number => {
    let at = from;
    while (at < text.length && SEPARATOR.test(text[at]!)) {
        at++;
    }
    return at;
};

export const svgNumberAt = (text: string, at: number): Read | undefined => {
    NUMBER.lastIndex = at;
    const match = NUMBER.exec(text);
    const value = match ? parseFloat(match[0]) : Number.NaN;
    return Number.isFinite(value) ? [value, NUMBER.lastIndex] : undefined;
};

export const scanSvgNumbers = (text: string | undefined): ScannedSvgNumbers => {
    const numbers: number[] = [];
    if (!text) {
        return { numbers, malformed: false };
    }
    for (let at = skipSeparators(text, 0); at < text.length; at = skipSeparators(text, at)) {
        const read = svgNumberAt(text, at);
        if (!read) {
            return { numbers, malformed: true };
        }
        numbers.push(read[0]);
        at = read[1];
    }
    return { numbers, malformed: false };
};

const flagAt = (text: string, at: number): Read | undefined => {
    const ch = text[at];
    return ch === "0" || ch === "1" ? [ch === "1" ? 1 : 0, at + 1] : undefined;
};

const argumentGroupAt = (d: string, from: number, lower: string, count: number): ArgumentGroup => {
    const args: number[] = [];
    let at = from;
    for (let k = 0; k < count; k++) {
        at = skipSeparators(d, at);
        const read = lower === ARC_COMMAND && ARC_FLAG_ARGUMENTS.has(k) ? flagAt(d, at) : svgNumberAt(d, at);
        if (!read) {
            break;
        }
        args.push(read[0]);
        at = read[1];
    }
    return { args, end: at };
};

const pathTokens = (d: string): PathToken[] => {
    const tokens: PathToken[] = [];
    let at = skipSeparators(d, 0);
    while (at < d.length) {
        const command = d[at]!;
        const lower = command.toLowerCase();
        const count = ARGUMENTS_PER_PATH_COMMAND.get(lower);
        at++;
        if (count === 0) {
            tokens.push({ command, args: [] });
        } else if (count !== undefined) {
            for (let first = true; ; first = false) {
                const group = argumentGroupAt(d, at, lower, count);
                at = group.end;
                if (group.args.length < count) {
                    break;
                }
                tokens.push({ command: !first && lower === MOVE_COMMAND ? (command === MOVE_COMMAND ? "l" : "L") : command, args: group.args });
                at = skipSeparators(d, at);
                if (at >= d.length || ARGUMENTS_PER_PATH_COMMAND.has(d[at]!.toLowerCase())) {
                    break;
                }
            }
        }
        at = skipSeparators(d, at);
    }
    return tokens;
};

export const parseSvgPathData = (d: string): SvgSubpath[] => {
    const subpaths: SvgSubpath[] = [];
    let current: SvgSubpath | undefined;
    let cursor: Point2 = [0, 0];
    let subpathStart: Point2 = [0, 0];
    let lastCubicControl: Point2 | undefined;
    let lastQuadControl: Point2 | undefined;

    const startSubpath = (point: Point2): void => {
        current = { start: [point[0], point[1]], segments: [], closed: false };
        subpaths.push(current);
        subpathStart = [point[0], point[1]];
    };
    const push = (segment: SvgSegment): void => {
        if (!current) {
            startSubpath(cursor);
        }
        current!.segments.push(segment);
    };
    const reflected = (control: Point2 | undefined): Point2 => (control ? subtract2(scale2(cursor, 2), control) : [cursor[0], cursor[1]]);

    for (const { command, args: a } of pathTokens(d)) {
        const relative = command === command.toLowerCase();
        const baseX = relative ? cursor[0] : 0;
        const baseY = relative ? cursor[1] : 0;
        const at = (k: number): Point2 => [baseX + a[k]!, baseY + a[k + 1]!];
        let cubicControl: Point2 | undefined;
        let quadControl: Point2 | undefined;
        switch (command.toLowerCase()) {
            case "m":
                cursor = at(0);
                startSubpath(cursor);
                break;
            case "l":
            case "h":
            case "v": {
                const lower = command.toLowerCase();
                const to: Point2 = lower === "l" ? at(0) : lower === "h" ? [baseX + a[0]!, cursor[1]] : [cursor[0], baseY + a[0]!];
                push({ type: "line", to });
                cursor = to;
                break;
            }
            case "c": {
                const to = at(CUBIC_END_ARGUMENT);
                cubicControl = at(2);
                push({ type: "cubic", c1: at(0), c2: cubicControl, to });
                cursor = to;
                break;
            }
            case "s": {
                const to = at(2);
                cubicControl = at(0);
                push({ type: "cubic", c1: reflected(lastCubicControl), c2: cubicControl, to });
                cursor = to;
                break;
            }
            case "q": {
                const to = at(2);
                quadControl = at(0);
                push({ type: "quad", c: quadControl, to });
                cursor = to;
                break;
            }
            case "t": {
                const to = at(0);
                quadControl = reflected(lastQuadControl);
                push({ type: "quad", c: quadControl, to });
                cursor = to;
                break;
            }
            case "a": {
                const to = at(ARC_END_ARGUMENT);
                if (cursor[0] !== to[0] || cursor[1] !== to[1]) {
                    const arc = ellipseArcOfEndpoints2(cursor, to, a[0]!, a[1]!, radiansOf(a[2]!), a[3] === 1, a[4] === 1);
                    push(arc ? { type: "arc", to, ...arc } : { type: "line", to });
                }
                cursor = to;
                break;
            }
            default:
                if (current) {
                    current.closed = true;
                    cursor = [subpathStart[0], subpathStart[1]];
                }
                current = undefined;
                break;
        }
        lastCubicControl = cubicControl;
        lastQuadControl = quadControl;
    }
    return subpaths.filter((subpath) => subpath.segments.length > 0);
};

const segmentPoints = (from: Point2, segment: SvgSegment, perCurve: number, perQuarterTurn: number, out: Point2[]): void => {
    if (segment.type === "line") {
        out.push(segment.to);
        return;
    }
    if (segment.type === "arc") {
        const frame = conicArcOfEllipseArc(segment).frame;
        const steps = Math.max(1, perCurve, Math.ceil(Math.abs(segment.deltaAngle) / QUARTER_TURN * perQuarterTurn));
        for (let k = 1; k <= steps; k++) {
            const point = ellipseFramePoint(frame, segment.startAngle + segment.deltaAngle * k / steps);
            out.push([point[0], point[1]]);
        }
        return;
    }
    const [c1, c2] = segment.type === "cubic"
        ? [segment.c1, segment.c2]
        : [between2(from, segment.c, QUADRATIC_TO_CUBIC_SHARE), between2(segment.to, segment.c, QUADRATIC_TO_CUBIC_SHARE)];
    for (let k = 1; k <= perCurve; k++) {
        out.push(pointOnCubic2(from, c1, c2, segment.to, k / perCurve));
    }
};

export const svgSubpathPoints = (subpath: SvgSubpath, perCurve: number, perQuarterTurn: number): Point2[] => {
    const points: Point2[] = [subpath.start];
    let from = subpath.start;
    for (const segment of subpath.segments) {
        segmentPoints(from, segment, perCurve, perQuarterTurn, points);
        from = segment.to;
    }
    return points;
};
