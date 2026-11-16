import type * as Inputs from "../../../../inputs";
import { cubicsOfPiece } from "../../curves/bezier-pieces";
import { conicArcExtremes, principalArcOf } from "../../curves/conic-arcs";
import type { ConicArc } from "../../curves/conic-arcs";
import { bezierPiecesOf, isRationalPiece } from "../../curves/nurbs-forms";
import type { BezierPiece } from "../../curves/nurbs-forms";
import { add2, cross2, dot2, length2, scale2 } from "../../geometry/vectors";
import { bulgeArcOfSpan, circleArcOf, ellipseArcOf, polylineSpanEnd, polylineSpans } from "../drawing/drawing-geometry";
import type { DrawingPolyline, DrawingSegment } from "../drawing/drawing-types";
import type { WorkBudget } from "../work-budget";
import { CUBIC_DEGREE, EDGE_ON_SHARE, QUADRATIC_DEGREE, SVG_ARC_PIECE } from "./svg.constants";

type Point2 = Inputs.Base.Point2;
type Point3 = Inputs.Base.Point3;

export interface SvgLineMove {
    readonly kind: "L";
    readonly to: Point2;
}

export interface SvgArcMove {
    readonly kind: "A";
    readonly radiusX: number;
    readonly radiusY: number;
    readonly rotation: number;
    readonly large: boolean;
    readonly counterclockwise: boolean;
    readonly to: Point2;
}

export interface SvgQuadraticMove {
    readonly kind: "Q";
    readonly control: Point2;
    readonly to: Point2;
}

export interface SvgCubicMove {
    readonly kind: "C";
    readonly control1: Point2;
    readonly control2: Point2;
    readonly to: Point2;
}

export type SvgMove = SvgLineMove | SvgArcMove | SvgQuadraticMove | SvgCubicMove;

export interface SvgStroke {
    readonly start: Point2;
    readonly moves: readonly SvgMove[];
    readonly closed: boolean;
}

const flat = (point: Point3): Point2 => [point[0], point[1]];

const shadowOf = (point: Point3): Point3 => [point[0], point[1], 0];

const endOf = (stroke: SvgStroke): Point2 => stroke.moves.length === 0 ? stroke.start : stroke.moves[stroke.moves.length - 1]!.to;

const conicStroke = (arc: ConicArc): SvgStroke => {
    const center = flat(arc.frame.center);
    const x = flat(arc.frame.xAxis);
    const y = flat(arc.frame.yAxis);
    const closed = Math.abs(arc.sweep) >= 2 * Math.PI;
    const shadow: ConicArc = { frame: { center: shadowOf(arc.frame.center), xAxis: shadowOf(arc.frame.xAxis), yAxis: shadowOf(arc.frame.yAxis) }, start: arc.start, sweep: arc.sweep };
    if (Math.abs(cross2(x, y)) <= EDGE_ON_SHARE * Math.max(dot2(x, x), dot2(y, y))) {
        const along = length2([x[0], y[0]]) >= length2([x[1], y[1]]) ? 0 : 1;
        const turns = conicArcExtremes(shadow, [along]).map(flat);
        return { start: turns[0]!, moves: turns.slice(1).map((to): SvgLineMove => ({ kind: "L", to })), closed };
    }
    const principal = principalArcOf(shadow);
    const u = flat(principal.frame.xAxis);
    const v = flat(principal.frame.yAxis);
    const pointAt = (angle: number): Point2 => add2(center, add2(scale2(u, Math.cos(angle)), scale2(v, Math.sin(angle))));
    const pieces = Math.max(1, Math.ceil(Math.abs(arc.sweep) / SVG_ARC_PIECE));
    const step = arc.sweep / pieces;
    const from = principal.start;
    const counterclockwise = (cross2(u, v) > 0) === (step > 0);
    const rotation = Math.atan2(u[1], u[0]);
    const moves = Array.from({ length: pieces }, (_, piece): SvgArcMove => ({
        kind: "A",
        radiusX: length2(u),
        radiusY: length2(v),
        rotation,
        large: false,
        counterclockwise,
        to: pointAt(from + (piece + 1) * step),
    }));
    return { start: pointAt(from), moves, closed };
};

const bulgeMove = (polyline: DrawingPolyline, span: number): SvgMove => {
    const to = flat(polylineSpanEnd(polyline, span));
    const arc = bulgeArcOfSpan(polyline, span);
    if (arc === undefined) {
        return { kind: "L", to };
    }
    const radius = Math.abs(arc.frame.xAxis[0]);
    return { kind: "A", radiusX: radius, radiusY: radius, rotation: 0, large: Math.abs(arc.sweep) > Math.PI, counterclockwise: arc.sweep > 0, to };
};

const polylineStroke = (polyline: DrawingPolyline): SvgStroke => ({
    start: flat(polyline.points[0]!),
    moves: Array.from({ length: polylineSpans(polyline) }, (_, span) => bulgeMove(polyline, span)),
    closed: polyline.closed,
});

const flatPiece = (piece: BezierPiece): BezierPiece => ({ points: piece.points.map((point): Point3 => [point[0], point[1], 0]), weights: piece.weights });

const pieceMoves = (piece: BezierPiece, tolerance: number, budget: WorkBudget | undefined): SvgMove[] => {
    const points = piece.points.map(flat);
    const degree = points.length - 1;
    if (!isRationalPiece(piece) && degree === 1) {
        return [{ kind: "L", to: points[1]! }];
    }
    if (!isRationalPiece(piece) && degree === QUADRATIC_DEGREE) {
        return [{ kind: "Q", control: points[1]!, to: points[2]! }];
    }
    if (!isRationalPiece(piece) && degree === CUBIC_DEGREE) {
        return [{ kind: "C", control1: points[1]!, control2: points[2]!, to: points[CUBIC_DEGREE]! }];
    }
    return cubicsOfPiece(flatPiece(piece), tolerance, budget).map((cubic): SvgCubicMove => ({ kind: "C", control1: flat(cubic.control1), control2: flat(cubic.control2), to: flat(cubic.end) }));
};

export const strokeOf = (segment: DrawingSegment, tolerance: number, budget?: WorkBudget): SvgStroke => {
    switch (segment.kind) {
        case "line":
            return { start: flat(segment.start), moves: [{ kind: "L", to: flat(segment.end) }], closed: false };
        case "circle":
        case "arc":
            return conicStroke(circleArcOf(segment));
        case "ellipse":
            return conicStroke(ellipseArcOf(segment));
        case "polyline":
            return polylineStroke(segment);
        case "spline": {
            const pieces = bezierPiecesOf(segment.curve, budget);
            const start = pieces.length === 0 ? segment.curve.points[0]! : pieces[0]!.points[0]!;
            return { start: flat(start), moves: pieces.flatMap(piece => pieceMoves(piece, tolerance, budget)), closed: false };
        }
    }
};

const reversedMove = (move: SvgMove, to: Point2): SvgMove => {
    switch (move.kind) {
        case "L":
            return { kind: "L", to };
        case "A":
            return { ...move, counterclockwise: !move.counterclockwise, to };
        case "Q":
            return { kind: "Q", control: move.control, to };
        case "C":
            return { kind: "C", control1: move.control2, control2: move.control1, to };
    }
};

export const reversedStroke = (stroke: SvgStroke): SvgStroke => {
    const starts = [stroke.start, ...stroke.moves.slice(0, -1).map(move => move.to)];
    return {
        start: endOf(stroke),
        moves: stroke.moves.map((move, at) => reversedMove(move, starts[at]!)).reverse(),
        closed: stroke.closed,
    };
};

export const strokeEnd = endOf;
