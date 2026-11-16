import type * as Inputs from "../../../../inputs";
import { bezierPiecesBounds, samplesOfPiece } from "../../curves/bezier-pieces";
import { bulgeArcOf, conicArcExtremes, conicArcSamples } from "../../curves/conic-arcs";
import type { ConicArc } from "../../curves/conic-arcs";
import { bezierPiecesOf } from "../../curves/nurbs-forms";
import { unitOf } from "../../geometry/frame-axes";
import type { FrameAxes } from "../../geometry/frame-axes";
import { cross3, length3, scale3 } from "../../geometry/vectors";
import type { WorkBudget } from "../work-budget";
import type { DrawingArc, DrawingBounds, DrawingCircle, DrawingEllipse, DrawingPart, DrawingPolyline, DrawingSegment, DrawingSpline } from "./drawing-types";
import { ARBITRARY_AXIS_LIMIT, PATTERN_UNIT_SHARE, PLAN_AXES } from "./drawing.constants";

type Point3 = Inputs.Base.Point3;
type Vec3 = Inputs.Base.Vector3;

const WORLD_Y: Vec3 = [0, 1, 0];
const WORLD_Z: Vec3 = [0, 0, 1];

export const ocsAxesOf = (normal: Vec3): FrameAxes => {
    const nearZ = Math.abs(normal[0]) < ARBITRARY_AXIS_LIMIT && Math.abs(normal[1]) < ARBITRARY_AXIS_LIMIT;
    const x = unitOf(cross3(nearZ ? WORLD_Y : WORLD_Z, normal)) ?? [1, 0, 0];
    return { origin: [0, 0, 0], x, y: cross3(normal, x), z: normal };
};

export const circleArcOf = (segment: DrawingCircle | DrawingArc): ConicArc => {
    const axes = ocsAxesOf(segment.normal);
    const frame = { center: segment.center, xAxis: scale3(axes.x, segment.radius), yAxis: scale3(axes.y, segment.radius) };
    return segment.kind === "circle"
        ? { frame, start: 0, sweep: 2 * Math.PI }
        : { frame, start: segment.startAngle, sweep: segment.endAngle - segment.startAngle };
};

export const ellipseArcOf = (segment: DrawingEllipse): ConicArc => {
    const minor = unitOf(cross3(segment.normal, segment.majorAxis)) ?? [0, 1, 0];
    return {
        frame: { center: segment.center, xAxis: segment.majorAxis, yAxis: scale3(minor, length3(segment.majorAxis) * segment.ratio) },
        start: segment.start,
        sweep: segment.end - segment.start,
    };
};

export const polylineSpans = (polyline: DrawingPolyline): number => polyline.closed ? polyline.points.length : polyline.points.length - 1;

export const polylineSpanEnd = (polyline: DrawingPolyline, span: number): Point3 => polyline.points[(span + 1) % polyline.points.length]!;

export const bulgeArcOfSpan = (polyline: DrawingPolyline, span: number): ConicArc | undefined => {
    const bulge = polyline.bulges[span] ?? 0;
    return bulge === 0 ? undefined : bulgeArcOf(polyline.points[span]!, polylineSpanEnd(polyline, span), bulge);
};

export const segmentSamples = (segment: DrawingSpline | DrawingEllipse, tolerance: number, budget?: WorkBudget): readonly Point3[] =>
    segment.kind === "ellipse"
        ? conicArcSamples(ellipseArcOf(segment), tolerance)
        : bezierPiecesOf(segment.curve, budget).flatMap((piece, at) => samplesOfPiece(piece, tolerance, budget).slice(at === 0 ? 0 : 1));

const boundsPointsOf = (segment: DrawingSegment, tolerance: number, budget: WorkBudget | undefined): readonly Point3[] => {
    switch (segment.kind) {
        case "line":
            return [segment.start, segment.end];
        case "circle":
        case "arc":
            return conicArcExtremes(circleArcOf(segment));
        case "ellipse":
            return conicArcExtremes(ellipseArcOf(segment));
        case "polyline": {
            const arcs = Array.from({ length: polylineSpans(segment) }, (_, span) => bulgeArcOfSpan(segment, span));
            return [...segment.points, ...arcs.flatMap(arc => arc === undefined ? [] : conicArcExtremes(arc))];
        }
        case "spline": {
            const bounds = bezierPiecesBounds(bezierPiecesOf(segment.curve, budget), tolerance, budget);
            return [bounds.min, bounds.max];
        }
    }
};

export const drawingBounds = (parts: readonly DrawingPart[], tolerance: number, budget?: WorkBudget): DrawingBounds | undefined => {
    const min: Point3 = [Infinity, Infinity, Infinity];
    const max: Point3 = [-Infinity, -Infinity, -Infinity];
    for (const part of parts) {
        for (const path of part.paths) {
            for (const segment of path.segments) {
                for (const point of boundsPointsOf(segment, tolerance, budget)) {
                    for (let axis = 0; axis < min.length; axis++) {
                        min[axis] = Math.min(min[axis]!, point[axis]!);
                        max[axis] = Math.max(max[axis]!, point[axis]!);
                    }
                }
            }
        }
    }
    return min[0] === Infinity ? undefined : { min, max };
};

export const drawingSize = (bounds: DrawingBounds | undefined, axes = PLAN_AXES): number => {
    let size = 0;
    for (let axis = 0; axis < axes && bounds !== undefined; axis++) {
        size = Math.max(size, bounds.max[axis]! - bounds.min[axis]!);
    }
    return size > 0 ? size : 1;
};

export const patternUnitOf = (bounds: DrawingBounds | undefined): number => drawingSize(bounds) * PATTERN_UNIT_SHARE;
