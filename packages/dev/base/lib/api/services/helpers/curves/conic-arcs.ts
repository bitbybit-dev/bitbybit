import type * as Inputs from "../../../inputs";
import type { NurbsCurveForm } from "./nurbs-forms";
import type { EllipseArc2 } from "../geometry/ellipse-arcs";
import type { WorkBudget } from "../files/work-budget";
import { add3, distance2, dot3, length3, scale3 } from "../geometry/vectors";
import { BULGE_TURN_SHARE, FRAME_AXES, LEAST_RELATIVE_TOLERANCE, PIECE_SLACK, QUARTER_TURN } from "./conic-arcs.constants";

type Point3 = Inputs.Base.Point3;
type Vec3 = Inputs.Base.Vector3;

export interface EllipseFrame {
    readonly center: Point3;
    readonly xAxis: Vec3;
    readonly yAxis: Vec3;
}

export interface ConicArc {
    readonly frame: EllipseFrame;
    readonly start: number;
    readonly sweep: number;
}

export const angleWithinTurn = (angle: number, turn: number): number => ((angle % turn) + turn) % turn;

export const ellipseFramePoint = (frame: EllipseFrame, angle: number): Point3 =>
    add3(frame.center, add3(scale3(frame.xAxis, Math.cos(angle)), scale3(frame.yAxis, Math.sin(angle))));

export const conicArcOfEllipseArc = (arc: EllipseArc2): ConicArc => {
    const cos = Math.cos(arc.xAxisRotation);
    const sin = Math.sin(arc.xAxisRotation);
    return {
        frame: { center: [arc.center[0], arc.center[1], 0], xAxis: [arc.rx * cos, arc.rx * sin, 0], yAxis: [-arc.ry * sin, arc.ry * cos, 0] },
        start: arc.startAngle,
        sweep: arc.deltaAngle,
    };
};

export const conicArcSamples = (arc: ConicArc, tolerance: number, budget?: WorkBudget): Point3[] => {
    const radius = Math.max(length3(arc.frame.xAxis), length3(arc.frame.yAxis));
    const relative = Math.max(tolerance / radius, LEAST_RELATIVE_TOLERANCE);
    const step = relative >= 1 ? QUARTER_TURN : Math.min(QUARTER_TURN, 2 * Math.acos(1 - relative));
    const wanted = Math.max(1, Math.ceil(Math.abs(arc.sweep) / step));
    const count = budget === undefined || budget.spend(wanted + 1) ? wanted : 1;
    return Array.from({ length: count + 1 }, (_, at) => ellipseFramePoint(arc.frame, arc.start + (arc.sweep * at) / count));
};

export const conicArcAsNurbs = (arc: ConicArc): NurbsCurveForm => {
    const pieces = Math.max(1, Math.ceil(Math.abs(arc.sweep) / QUARTER_TURN - PIECE_SLACK));
    const step = arc.sweep / pieces;
    const middleWeight = Math.cos(step / 2);
    const points: Point3[] = [ellipseFramePoint(arc.frame, arc.start)];
    const weights: number[] = [1];
    const knots: number[] = [0, 0, 0];
    for (let piece = 0; piece < pieces; piece++) {
        const middle = arc.start + ((2 * piece + 1) * step) / 2;
        points.push(add3(arc.frame.center, scale3(add3(scale3(arc.frame.xAxis, Math.cos(middle)), scale3(arc.frame.yAxis, Math.sin(middle))), 1 / middleWeight)));
        points.push(ellipseFramePoint(arc.frame, arc.start + (piece + 1) * step));
        weights.push(middleWeight, 1);
        knots.push(piece + 1, piece + 1);
    }
    knots.push(pieces);
    return { degree: 2, points, weights, knots };
};

export const bulgeArcOf = (start: Point3, end: Point3, bulge: number): ConicArc => {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const offset = (1 - bulge * bulge) / (BULGE_TURN_SHARE * bulge);
    const center: Point3 = [(start[0] + end[0]) / 2 - dy * offset, (start[1] + end[1]) / 2 + dx * offset, start[2]];
    const radius = distance2([start[0], start[1]], [center[0], center[1]]);
    return {
        frame: { center, xAxis: [radius, 0, 0], yAxis: [0, radius, 0] },
        start: Math.atan2(start[1] - center[1], start[0] - center[0]),
        sweep: BULGE_TURN_SHARE * Math.atan(bulge),
    };
};

export const bulgeOfSweep = (sweep: number): number => Math.tan(sweep / BULGE_TURN_SHARE);

export const conicArcExtremes = (arc: ConicArc, axes: readonly number[] = FRAME_AXES): Point3[] => {
    const from = Math.min(arc.start, arc.start + arc.sweep);
    const to = Math.min(Math.max(arc.start, arc.start + arc.sweep), from + 2 * Math.PI);
    const halfTurnsAcross = Math.ceil(Math.min(Math.abs(arc.sweep), 2 * Math.PI) / Math.PI) + 1;
    const turns: number[] = [];
    for (const axis of axes) {
        const flat = Math.atan2(arc.frame.yAxis[axis]!, arc.frame.xAxis[axis]!);
        const firstHalfTurn = Math.ceil((from - flat) / Math.PI);
        for (let step = 0; step < halfTurnsAcross; step++) {
            const angle = flat + (firstHalfTurn + step) * Math.PI;
            if (angle > to) {
                break;
            }
            turns.push(angle);
        }
    }
    const along = turns.filter(angle => angle > from && angle < to).sort((first, second) => (first - second) * Math.sign(arc.sweep));
    return [arc.start, ...along, arc.start + arc.sweep].map(angle => ellipseFramePoint(arc.frame, angle));
};

export const principalArcOf = (arc: ConicArc): ConicArc => {
    const { center, xAxis, yAxis } = arc.frame;
    const xx = dot3(xAxis, xAxis);
    const yy = dot3(yAxis, yAxis);
    const xy = dot3(xAxis, yAxis);
    if (Math.abs(xy) <= Number.EPSILON * (xx + yy)) {
        return xx >= yy ? arc : { frame: { center, xAxis: yAxis, yAxis: scale3(xAxis, -1) }, start: arc.start - Math.PI / 2, sweep: arc.sweep };
    }
    const shift = Math.atan2(2 * xy, xx - yy) / 2;
    const cos = Math.cos(shift);
    const sin = Math.sin(shift);
    return {
        frame: { center, xAxis: add3(scale3(xAxis, cos), scale3(yAxis, sin)), yAxis: add3(scale3(xAxis, -sin), scale3(yAxis, cos)) },
        start: arc.start - shift,
        sweep: arc.sweep,
    };
};
