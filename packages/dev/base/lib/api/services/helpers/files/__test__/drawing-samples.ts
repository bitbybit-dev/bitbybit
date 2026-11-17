import type * as Inputs from "../../../../inputs";
import { ellipseFramePoint } from "../../curves/conic-arcs";
import { knotDomain, nurbsCurvePoint } from "../../curves/nurbs";
import { distance3 } from "../../geometry/vectors";
import { circleArcOf, ellipseArcOf } from "../drawing/drawing-geometry";
import { drawingPathOf } from "../drawing/drawing-model";

type Point3 = Inputs.Base.Point3;
export type SegmentDto = Inputs.IO.DrawingPathDto["segments"][number];

const SAMPLES = 64;

export const kindOf = (segment: SegmentDto): string => drawingPathOf({ segments: [segment] }, "segment").segments[0]!.kind;

export const pointsAlong = (segment: SegmentDto, from = 0, to = 1, count = SAMPLES): Point3[] => {
    const checked = drawingPathOf({ segments: [segment] }, "segment").segments[0]!;
    const shares = Array.from({ length: count + 1 }, (_, at) => from + (to - from) * at / count);
    switch (checked.kind) {
        case "line":
            return shares.map(share => checked.start.map((value, axis) => value + (checked.end[axis]! - value) * share) as Point3);
        case "circle":
        case "arc":
        case "ellipse": {
            const arc = checked.kind === "ellipse" ? ellipseArcOf(checked) : circleArcOf(checked);
            return shares.map(share => ellipseFramePoint(arc.frame, arc.start + arc.sweep * share));
        }
        case "spline": {
            const [low, high] = knotDomain(checked.curve.degree, checked.curve.knots);
            return shares.map(share => nurbsCurvePoint(checked.curve.degree, checked.curve.points, checked.curve.weights, checked.curve.knots, low + (high - low) * share));
        }
        case "polyline":
            return checked.points.map(point => [...point]);
    }
};

export const farthestOff = (points: readonly Point3[], others: readonly Point3[]): number =>
    Math.max(...points.map(point => Math.min(...others.map(other => distance3(point, other)))));

export const farthestApart = (first: readonly Point3[], second: readonly Point3[]): number =>
    Math.max(farthestOff(first, second), farthestOff(second, first));

export const segmentsOfParts = (parts: readonly Inputs.IO.DrawingPartDto[]): SegmentDto[] =>
    parts.flatMap(part => part.paths.flatMap(path => path.segments));
