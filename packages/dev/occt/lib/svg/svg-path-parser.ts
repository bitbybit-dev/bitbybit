/**
 * Parser for the SVG path `d` mini-language.
 *
 * Produces absolute subpaths over the exact segment vocabulary in svg-models.
 * Handles: M/m L/l H/h V/v C/c S/s Q/q T/t A/a Z/z, relative/absolute,
 * smooth-curve reflection, implicit repeated commands, and the quirky arc-flag
 * packing. Elliptical arcs are converted from SVG endpoint parametrization to
 * center parametrization so downstream code never re-derives it.
 */

import { Base } from "@bitbybit-dev/base";
import { SvgArcSegment, SvgSegment, SvgSubpath } from "./svg-models";

interface Token {
    command: string;
    /** Raw numeric args following the command letter. */
    args: number[];
}

/** Number of arguments each command letter consumes per repetition. */
const ARG_COUNTS: { [cmd: string]: number } = {
    m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0,
};

/**
 * Tokenize a `d` string into command + flat arg list groups. Arc flags
 * (large-arc, sweep) are single digits that may be written without separators,
 * so we parse per-command rather than globally splitting numbers.
 */
function tokenize(d: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const n = d.length;

    const isCommand = (ch: string): boolean => /[MmLlHhVvCcSsQqTtAaZz]/.test(ch);

    const skipSep = (): void => {
        while (i < n && /[\s,]/.test(d[i])) { i++; }
    };

    // Reads one number; when `isFlag` is set, reads exactly a single 0/1 digit
    // (SVG arc flag packing, e.g. "016" => 0, 1, 6).
    const readNumber = (isFlag: boolean): number | undefined => {
        skipSep();
        if (i >= n) { return undefined; }
        if (isFlag) {
            const ch = d[i];
            if (ch === "0" || ch === "1") { i++; return ch === "1" ? 1 : 0; }
            return undefined;
        }
        const start = i;
        if (d[i] === "+" || d[i] === "-") { i++; }
        let sawDigit = false;
        while (i < n && /[0-9]/.test(d[i])) { i++; sawDigit = true; }
        if (i < n && d[i] === ".") {
            i++;
            while (i < n && /[0-9]/.test(d[i])) { i++; sawDigit = true; }
        }
        if (sawDigit && i < n && (d[i] === "e" || d[i] === "E")) {
            i++;
            if (i < n && (d[i] === "+" || d[i] === "-")) { i++; }
            while (i < n && /[0-9]/.test(d[i])) { i++; }
        }
        if (!sawDigit) { return undefined; }
        return parseFloat(d.slice(start, i));
    };

    while (i < n) {
        skipSep();
        if (i >= n) { break; }
        const ch = d[i];
        if (!isCommand(ch)) {
            // Malformed — skip the offending character to stay resilient.
            i++;
            continue;
        }
        i++;
        const lower = ch.toLowerCase();
        const count = ARG_COUNTS[lower];
        if (count === 0) {
            tokens.push({ command: ch, args: [] });
            continue;
        }
        // A command may be followed by multiple coordinate sets (implicit repeat).
        let first = true;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const group: number[] = [];
            let ok = true;
            for (let k = 0; k < count; k++) {
                // Arc args 3 and 4 (0-based) are flags.
                const isFlag = lower === "a" && (k === 3 || k === 4);
                const num = readNumber(isFlag);
                if (num === undefined) { ok = false; break; }
                group.push(num);
            }
            if (!ok) {
                if (first) { /* command had no/partial args; drop it */ }
                break;
            }
            // After the first moveto group, implicit repeats are linetos (SVG spec).
            const emitCmd = (!first && lower === "m") ? (ch === "m" ? "l" : "L") : ch;
            tokens.push({ command: emitCmd, args: group });
            first = false;
            // After the first explicit moveto, subsequent implicit pairs are linetos.
            skipSep();
            if (i >= n || isCommand(d[i])) { break; }
        }
    }
    return tokens;
}

/** SVG endpoint-arc -> center parametrization (per SVG 1.1 implementation notes). */
function endpointToCenterArc(
    p0: Base.Point2, p1: Base.Point2, rxIn: number, ryIn: number,
    xRotDeg: number, largeArc: boolean, sweep: boolean
): SvgArcSegment | SvgSegment {
    let rx = Math.abs(rxIn);
    let ry = Math.abs(ryIn);
    if (rx === 0 || ry === 0) {
        return { type: "line", to: p1 };
    }
    const phi = (xRotDeg * Math.PI) / 180;
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    const dx = (p0[0] - p1[0]) / 2;
    const dy = (p0[1] - p1[1]) / 2;
    const x1p = cosPhi * dx + sinPhi * dy;
    const y1p = -sinPhi * dx + cosPhi * dy;

    // Correct out-of-range radii.
    const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    if (lambda > 1) {
        const s = Math.sqrt(lambda);
        rx *= s;
        ry *= s;
    }

    const rx2 = rx * rx;
    const ry2 = ry * ry;
    const num = rx2 * ry2 - rx2 * y1p * y1p - ry2 * x1p * x1p;
    const den = rx2 * y1p * y1p + ry2 * x1p * x1p;
    let factor = den === 0 ? 0 : Math.sqrt(Math.max(0, num / den));
    if (largeArc === sweep) { factor = -factor; }

    const cxp = (factor * rx * y1p) / ry;
    const cyp = (-factor * ry * x1p) / rx;

    const cx = cosPhi * cxp - sinPhi * cyp + (p0[0] + p1[0]) / 2;
    const cy = sinPhi * cxp + cosPhi * cyp + (p0[1] + p1[1]) / 2;

    const angle = (ux: number, uy: number, vx: number, vy: number): number => {
        const dot = ux * vx + uy * vy;
        const len = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
        let a = Math.acos(Math.min(1, Math.max(-1, dot / len)));
        if (ux * vy - uy * vx < 0) { a = -a; }
        return a;
    };

    const startAngle = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
    let delta = angle(
        (x1p - cxp) / rx, (y1p - cyp) / ry,
        (-x1p - cxp) / rx, (-y1p - cyp) / ry
    );
    if (!sweep && delta > 0) { delta -= 2 * Math.PI; }
    if (sweep && delta < 0) { delta += 2 * Math.PI; }

    return {
        type: "arc",
        to: p1,
        center: [cx, cy],
        rx, ry,
        xAxisRotation: phi,
        startAngle,
        deltaAngle: delta,
    };
}

/** Parse an SVG path `d` attribute into absolute subpaths. */
export function parsePathData(d: string): SvgSubpath[] {
    const tokens = tokenize(d);
    const subpaths: SvgSubpath[] = [];

    let current: SvgSubpath | undefined;
    let cursor: Base.Point2 = [0, 0];
    let subpathStart: Base.Point2 = [0, 0];
    // Reflection points for smooth curves.
    let lastCubicCtrl: Base.Point2 | undefined;
    let lastQuadCtrl: Base.Point2 | undefined;

    const startSubpath = (pt: Base.Point2): void => {
        current = { start: [pt[0], pt[1]], segments: [], closed: false };
        subpaths.push(current);
        subpathStart = [pt[0], pt[1]];
    };

    const pushSeg = (seg: SvgSegment): void => {
        if (!current) { startSubpath(cursor); }
        current!.segments.push(seg);
    };

    for (const tok of tokens) {
        const c = tok.command;
        const rel = c === c.toLowerCase();
        const a = tok.args;
        const baseX = rel ? cursor[0] : 0;
        const baseY = rel ? cursor[1] : 0;

        switch (c.toLowerCase()) {
            case "m": {
                const pt: Base.Point2 = [baseX + a[0], baseY + a[1]];
                startSubpath(pt);
                cursor = pt;
                lastCubicCtrl = lastQuadCtrl = undefined;
                break;
            }
            case "l": {
                const pt: Base.Point2 = [baseX + a[0], baseY + a[1]];
                pushSeg({ type: "line", to: pt });
                cursor = pt;
                lastCubicCtrl = lastQuadCtrl = undefined;
                break;
            }
            case "h": {
                const pt: Base.Point2 = [(rel ? cursor[0] : 0) + a[0], cursor[1]];
                pushSeg({ type: "line", to: pt });
                cursor = pt;
                lastCubicCtrl = lastQuadCtrl = undefined;
                break;
            }
            case "v": {
                const pt: Base.Point2 = [cursor[0], (rel ? cursor[1] : 0) + a[0]];
                pushSeg({ type: "line", to: pt });
                cursor = pt;
                lastCubicCtrl = lastQuadCtrl = undefined;
                break;
            }
            case "c": {
                const c1: Base.Point2 = [baseX + a[0], baseY + a[1]];
                const c2: Base.Point2 = [baseX + a[2], baseY + a[3]];
                const pt: Base.Point2 = [baseX + a[4], baseY + a[5]];
                pushSeg({ type: "cubic", c1, c2, to: pt });
                cursor = pt;
                lastCubicCtrl = c2;
                lastQuadCtrl = undefined;
                break;
            }
            case "s": {
                const reflect: Base.Point2 = lastCubicCtrl
                    ? [2 * cursor[0] - lastCubicCtrl[0], 2 * cursor[1] - lastCubicCtrl[1]]
                    : [cursor[0], cursor[1]];
                const c2: Base.Point2 = [baseX + a[0], baseY + a[1]];
                const pt: Base.Point2 = [baseX + a[2], baseY + a[3]];
                pushSeg({ type: "cubic", c1: reflect, c2, to: pt });
                cursor = pt;
                lastCubicCtrl = c2;
                lastQuadCtrl = undefined;
                break;
            }
            case "q": {
                const cc: Base.Point2 = [baseX + a[0], baseY + a[1]];
                const pt: Base.Point2 = [baseX + a[2], baseY + a[3]];
                pushSeg({ type: "quad", c: cc, to: pt });
                cursor = pt;
                lastQuadCtrl = cc;
                lastCubicCtrl = undefined;
                break;
            }
            case "t": {
                const reflect: Base.Point2 = lastQuadCtrl
                    ? [2 * cursor[0] - lastQuadCtrl[0], 2 * cursor[1] - lastQuadCtrl[1]]
                    : [cursor[0], cursor[1]];
                const pt: Base.Point2 = [baseX + a[0], baseY + a[1]];
                pushSeg({ type: "quad", c: reflect, to: pt });
                cursor = pt;
                lastQuadCtrl = reflect;
                lastCubicCtrl = undefined;
                break;
            }
            case "a": {
                const pt: Base.Point2 = [baseX + a[5], baseY + a[6]];
                const seg = endpointToCenterArc(
                    cursor, pt, a[0], a[1], a[2], a[3] === 1, a[4] === 1
                );
                pushSeg(seg);
                cursor = pt;
                lastCubicCtrl = lastQuadCtrl = undefined;
                break;
            }
            case "z": {
                if (current) {
                    current.closed = true;
                    cursor = [subpathStart[0], subpathStart[1]];
                }
                lastCubicCtrl = lastQuadCtrl = undefined;
                current = undefined; // a following command starts a fresh subpath
                break;
            }
            default:
                break;
        }
    }

    // Drop empty subpaths (e.g. a lone moveto).
    return subpaths.filter((s) => s.segments.length > 0);
}
