import type { AffineMatrix2 } from "./affine2";
import type * as Inputs from "../../../inputs";
import { angleOfCosine } from "./scalars";
import { cross2 } from "./vectors";

type Point2 = Inputs.Base.Point2;


export interface EllipseArc2 {
    center: Point2;
    rx: number;
    ry: number;
    xAxisRotation: number;
    startAngle: number;
    deltaAngle: number;
}

const FULL_TURN = 2 * Math.PI;

const turnBetween = (ux: number, uy: number, vx: number, vy: number): number => {
    const angle = angleOfCosine((ux * vx + uy * vy) / Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy)));
    return ux * vy - uy * vx < 0 ? -angle : angle;
};

export const ellipseArcOfEndpoints2 = (
    from: Point2, to: Point2, radiusX: number, radiusY: number, xAxisRotation: number, largeArc: boolean, sweep: boolean
): EllipseArc2 | undefined => {
    let rx = Math.abs(radiusX);
    let ry = Math.abs(radiusY);
    if ((from[0] === to[0] && from[1] === to[1]) || rx === 0 || ry === 0) {
        return undefined;
    }
    const cosPhi = Math.cos(xAxisRotation);
    const sinPhi = Math.sin(xAxisRotation);
    const dx = (from[0] - to[0]) / 2;
    const dy = (from[1] - to[1]) / 2;
    const x1p = cosPhi * dx + sinPhi * dy;
    const y1p = -sinPhi * dx + cosPhi * dy;
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
    const size = den === 0 ? 0 : Math.sqrt(Math.max(0, num / den));
    const factor = largeArc === sweep ? -size : size;
    const cxp = (factor * rx * y1p) / ry;
    const cyp = (-factor * ry * x1p) / rx;
    const startAngle = turnBetween(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
    let deltaAngle = turnBetween((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
    if (!sweep && deltaAngle > 0) {
        deltaAngle -= FULL_TURN;
    }
    if (sweep && deltaAngle < 0) {
        deltaAngle += FULL_TURN;
    }
    return {
        center: [cosPhi * cxp - sinPhi * cyp + (from[0] + to[0]) / 2, sinPhi * cxp + cosPhi * cyp + (from[1] + to[1]) / 2],
        rx,
        ry,
        xAxisRotation,
        startAngle,
        deltaAngle,
    };
};

export const affineEllipseArc2 = (matrix: AffineMatrix2, arc: EllipseArc2): EllipseArc2 => {
    const [a, b, c, d, tx, ty] = matrix;
    const cosP = Math.cos(arc.xAxisRotation);
    const sinP = Math.sin(arc.xAxisRotation);
    const r00 = cosP * arc.rx;
    const r10 = sinP * arc.rx;
    const r01 = -sinP * arc.ry;
    const r11 = cosP * arc.ry;
    const m00 = a * r00 + c * r10;
    const m10 = b * r00 + d * r10;
    const m01 = a * r01 + c * r11;
    const m11 = b * r01 + d * r11;
    const e = (m00 + m11) / 2;
    const f = (m00 - m11) / 2;
    const g = (m10 + m01) / 2;
    const h = (m10 - m01) / 2;
    const q = Math.hypot(e, h);
    const r = Math.hypot(f, g);
    const sx = q + r;
    const sy = Math.abs(q - r);
    const theta = (Math.atan2(h, e) + Math.atan2(g, f)) / 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const imageAngle = (angle: number): number => {
        const px = m00 * Math.cos(angle) + m01 * Math.sin(angle);
        const py = m10 * Math.cos(angle) + m11 * Math.sin(angle);
        return Math.atan2((-sinT * px + cosT * py) / (sy || 1), (cosT * px + sinT * py) / (sx || 1));
    };
    const startAngle = imageAngle(arc.startAngle);
    let deltaAngle = imageAngle(arc.startAngle + arc.deltaAngle) - startAngle;
    const sweepSign = cross2([a, b], [c, d]) < 0 ? -Math.sign(arc.deltaAngle) : Math.sign(arc.deltaAngle);
    if (sweepSign > 0 && deltaAngle < 0) {
        deltaAngle += FULL_TURN;
    }
    if (sweepSign < 0 && deltaAngle > 0) {
        deltaAngle -= FULL_TURN;
    }
    return {
        center: [a * arc.center[0] + c * arc.center[1] + tx, b * arc.center[0] + d * arc.center[1] + ty],
        rx: sx,
        ry: sy,
        xAxisRotation: theta,
        startAngle,
        deltaAngle: sweepSign === 0 ? 0 : deltaAngle,
    };
};
