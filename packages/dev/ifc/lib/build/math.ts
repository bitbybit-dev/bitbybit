import type { Base } from "@bitbybit-dev/base";
import { pointToWorld, squareFrame, unitOf } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/frame-axes";
import { add2, cross2, dot2, length2, scale2, subtract2, unit2Of } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import type { Frame3, Line2 } from "./build-types";

const NO_DIRECTION = "A direction needs a finite length above zero";
const NO_SQUARE_X = "A frame's X direction has no part square to its Z axis";

export function direction2Of(a: Base.Vector2): Base.Vector2 {
    const unit = unit2Of(a);
    if (unit === undefined) {
        throw new RangeError(NO_DIRECTION);
    }
    return unit;
}

export function direction3Of(a: Base.Vector3): Base.Vector3 {
    const unit = unitOf(a);
    if (unit === undefined) {
        throw new RangeError(NO_DIRECTION);
    }
    return unit;
}

export function requiredFrame(frame: Frame3 | "normal" | "direction"): Frame3 {
    if (frame === "normal") {
        throw new RangeError(NO_DIRECTION);
    }
    if (frame === "direction") {
        throw new RangeError(NO_SQUARE_X);
    }
    return frame;
}

export function frameFrom(origin: Base.Point3, zAxis: Base.Vector3, xHint: Base.Vector3): Frame3 {
    return requiredFrame(squareFrame(origin, zAxis, xHint));
}

export function intersectLines(first: Line2, second: Line2, parallelTolerance: number): Base.Point2 | undefined {
    const denominator = cross2(first.direction, second.direction);
    if (Math.abs(denominator) <= parallelTolerance) {
        return undefined;
    }
    const along = cross2(subtract2(second.point, first.point), second.direction) / denominator;
    return add2(first.point, scale2(first.direction, along));
}

export function distanceToLine(point: Base.Point2, line: Line2): number {
    return cross2(line.direction, subtract2(point, line.point));
}

export function distanceToSegment(point: Base.Point2, start: Base.Point2, end: Base.Point2): number {
    const along = subtract2(end, start);
    const squared = dot2(along, along);
    const offset = subtract2(point, start);
    const fraction = squared > 0 ? Math.min(1, Math.max(0, dot2(offset, along) / squared)) : 0;
    return length2(subtract2(point, add2(start, scale2(along, fraction))));
}

export function parameterOnLine(point: Base.Point2, line: Line2): number {
    return dot2(subtract2(point, line.point), line.direction);
}

export function placedOnPlan(frame: Frame3, point: Base.Point2): Base.Point2 {
    const [x, y] = pointToWorld(frame, [point[0], point[1], 0]);
    return [x, y];
}
