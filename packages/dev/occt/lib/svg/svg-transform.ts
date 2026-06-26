/**
 * SVG `transform` attribute parsing and exact affine application.
 *
 * A matrix is stored as the 6-tuple [a, b, c, d, e, f] matching SVG's
 * matrix(a b c d e f), i.e.
 *     x' = a*x + c*y + e
 *     y' = b*x + d*y + f
 *
 * Lines and beziers transform exactly by mapping their control points. Arcs are
 * handled exactly too: the unit-circle-to-ellipse matrix is rebuilt and
 * re-decomposed (2x2 SVD) so a transformed circle/ellipse arc remains an exact
 * (possibly rotated) ellipse arc, with sweep orientation flipped on reflection.
 */

import { Base } from "@bitbybit-dev/base";
import { SvgArcSegment, SvgSegment, SvgSubpath } from "./svg-models";

export type Matrix = [number, number, number, number, number, number];

export const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

/** Compose so the result applied to a point = m1(m2(point)). */
export function multiply(m1: Matrix, m2: Matrix): Matrix {
    const [a1, b1, c1, d1, e1, f1] = m1;
    const [a2, b2, c2, d2, e2, f2] = m2;
    return [
        a1 * a2 + c1 * b2,
        b1 * a2 + d1 * b2,
        a1 * c2 + c1 * d2,
        b1 * c2 + d1 * d2,
        a1 * e2 + c1 * f2 + e1,
        b1 * e2 + d1 * f2 + f1,
    ];
}

export function applyToPoint(m: Matrix, p: Base.Point2): Base.Point2 {
    return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
}

const DEG = Math.PI / 180;

/** Parse a `transform` attribute value into a single composed matrix. */
export function parseTransform(value: string | undefined | null): Matrix {
    if (!value) { return IDENTITY; }
    let m: Matrix = IDENTITY;
    const re = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(value)) !== null) {
        const name = match[1];
        const nums = match[2]
            .split(/[\s,]+/)
            .map((s) => parseFloat(s))
            .filter((x) => !Number.isNaN(x));
        let t: Matrix = IDENTITY;
        switch (name) {
            case "matrix":
                if (nums.length === 6) { t = nums as Matrix; }
                break;
            case "translate":
                t = [1, 0, 0, 1, nums[0] || 0, nums[1] || 0];
                break;
            case "scale": {
                const sx = nums[0] ?? 1;
                const sy = nums.length > 1 ? nums[1] : sx;
                t = [sx, 0, 0, sy, 0, 0];
                break;
            }
            case "rotate": {
                const ang = (nums[0] || 0) * DEG;
                const cos = Math.cos(ang);
                const sin = Math.sin(ang);
                const rot: Matrix = [cos, sin, -sin, cos, 0, 0];
                if (nums.length >= 3) {
                    const cx = nums[1];
                    const cy = nums[2];
                    t = multiply([1, 0, 0, 1, cx, cy], multiply(rot, [1, 0, 0, 1, -cx, -cy]));
                } else {
                    t = rot;
                }
                break;
            }
            case "skewX":
                t = [1, 0, Math.tan((nums[0] || 0) * DEG), 1, 0, 0];
                break;
            case "skewY":
                t = [1, Math.tan((nums[0] || 0) * DEG), 0, 1, 0, 0];
                break;
            default:
                break;
        }
        m = multiply(m, t);
    }
    return m;
}

/** Exact affine transform of a center-parametrized elliptical arc. */
function transformArc(m: Matrix, arc: SvgArcSegment): SvgArcSegment {
    const [a, b, c, d] = m; // linear (2x2) part: columns (a,b) and (c,d)
    const cosP = Math.cos(arc.xAxisRotation);
    const sinP = Math.sin(arc.xAxisRotation);

    // M = L * Rot(phi) * diag(rx, ry) maps the unit circle to the new ellipse.
    // L = [[a, c],[b, d]]; Rot(phi) = [[cosP, -sinP],[sinP, cosP]].
    const r00 = cosP * arc.rx;
    const r10 = sinP * arc.rx;
    const r01 = -sinP * arc.ry;
    const r11 = cosP * arc.ry;
    const m00 = a * r00 + c * r10;
    const m10 = b * r00 + d * r10;
    const m01 = a * r01 + c * r11;
    const m11 = b * r01 + d * r11;

    // SVD of the 2x2 [[m00, m01],[m10, m11]] to recover axes and radii.
    const e = (m00 + m11) / 2;
    const f = (m00 - m11) / 2;
    const g = (m10 + m01) / 2;
    const h = (m10 - m01) / 2;
    const q = Math.hypot(e, h);
    const r = Math.hypot(f, g);
    const sx = q + r; // larger singular value
    const sy = Math.abs(q - r);
    const a1 = Math.atan2(g, f);
    const a2 = Math.atan2(h, e);
    const theta = (a2 - a1) / 2; // rotation of the major axis

    const newCenter = applyToPoint(m, arc.center);
    const det = a * d - b * c;

    // Map start/end angles into the new ellipse frame.
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const toNewAngle = (ang: number): number => {
        // image of unit-circle point under M, relative to new center
        const px = m00 * Math.cos(ang) + m01 * Math.sin(ang);
        const py = m10 * Math.cos(ang) + m11 * Math.sin(ang);
        // express in axis frame, normalize by radii
        const lx = (cosT * px + sinT * py) / (sx || 1);
        const ly = (-sinT * px + cosT * py) / (sy || 1);
        return Math.atan2(ly, lx);
    };

    const newStart = toNewAngle(arc.startAngle);
    let newEnd = toNewAngle(arc.startAngle + arc.deltaAngle);
    let newDelta = newEnd - newStart;
    // Preserve sweep magnitude/direction; reflection (det<0) flips orientation.
    const sweepSign = det < 0 ? -Math.sign(arc.deltaAngle) : Math.sign(arc.deltaAngle);
    if (sweepSign > 0 && newDelta < 0) { newDelta += 2 * Math.PI; }
    if (sweepSign < 0 && newDelta > 0) { newDelta -= 2 * Math.PI; }
    if (sweepSign === 0) { newDelta = 0; }
    newEnd = newStart + newDelta;

    return {
        type: "arc",
        to: applyToPoint(m, arc.to),
        center: newCenter,
        rx: sx,
        ry: sy,
        xAxisRotation: theta,
        startAngle: newStart,
        deltaAngle: newDelta,
    };
}

export function transformSegment(m: Matrix, seg: SvgSegment): SvgSegment {
    switch (seg.type) {
        case "line":
            return { type: "line", to: applyToPoint(m, seg.to) };
        case "quad":
            return { type: "quad", c: applyToPoint(m, seg.c), to: applyToPoint(m, seg.to) };
        case "cubic":
            return {
                type: "cubic",
                c1: applyToPoint(m, seg.c1),
                c2: applyToPoint(m, seg.c2),
                to: applyToPoint(m, seg.to),
            };
        case "arc":
            return transformArc(m, seg);
        default:
            return seg;
    }
}

export function transformSubpath(m: Matrix, sp: SvgSubpath): SvgSubpath {
    return {
        start: applyToPoint(m, sp.start),
        segments: sp.segments.map((s) => transformSegment(m, s)),
        closed: sp.closed,
    };
}
