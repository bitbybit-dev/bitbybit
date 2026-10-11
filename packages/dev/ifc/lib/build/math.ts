import type { Base } from "@bitbybit-dev/base";
import { pointToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { add2, cross2, cross3, dot2, dot3, length2, length3, scale2, scale3, subtract2, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import type { Frame3, Line2 } from "./build-types";

const ZERO_LENGTH = "A direction of zero length has no direction";

export function normalize2(a: Base.Vector2): Base.Vector2 {
    const length = length2(a);
    if (!(length > 0)) {
        throw new RangeError(ZERO_LENGTH);
    }
    return [a[0] / length, a[1] / length];
}

export function normalize3(a: Base.Vector3): Base.Vector3 {
    const length = length3(a);
    if (!(length > 0)) {
        throw new RangeError(ZERO_LENGTH);
    }
    return [a[0] / length, a[1] / length, a[2] / length];
}

export function frameFrom(origin: Base.Point3, zAxis: Base.Vector3, xHint: Base.Vector3): Frame3 {
    const z = normalize3(zAxis);
    const x = normalize3(subtract3(xHint, scale3(z, dot3(xHint, z))));
    return { origin, x, y: cross3(z, x), z };
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
