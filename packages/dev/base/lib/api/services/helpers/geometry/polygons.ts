import type * as Inputs from "../../../inputs";
import { InputError } from "../../../kernel-calls/errors";
import { add2, between2, cross2, distance2, dot2, leftOf2, length2, polar2, scale2, subtract2, unit2Of } from "./vectors";
import type { RoundedCorner } from "../helper-types";

type Point2 = Inputs.Base.Point2;

const STRAIGHT_TOLERANCE = 1e-9;
const FIT_TOLERANCE = 1e-9;
const MESSAGE_DIGITS = 12;

const shown = (value: number): number => Number(value.toPrecision(MESSAGE_DIGITS));

export const signedArea2 = (points: readonly Point2[]): number => {
    const origin = points[0]!;
    let twice = 0;
    for (let at = 1; at + 1 < points.length; at++) {
        twice += cross2(subtract2(points[at]!, origin), subtract2(points[at + 1]!, origin));
    }
    return twice / 2;
};

export const wound2 = (points: readonly Point2[], counterClockwise: boolean): Point2[] =>
    (signedArea2(points) > 0) === counterClockwise ? [...points] : [...points].reverse();

export const isInsidePolygon2 = (point: Point2, outline: readonly Point2[]): boolean => {
    let inside = false;
    for (let at = 0, previous = outline.length - 1; at < outline.length; previous = at++) {
        const [x1, y1] = outline[at]!;
        const [x2, y2] = outline[previous]!;
        if ((y1 > point[1]) !== (y2 > point[1]) && point[0] < ((x2 - x1) * (point[1] - y1)) / (y2 - y1) + x1) {
            inside = !inside;
        }
    }
    return inside;
};

export const perimeter2 = (points: readonly Point2[]): number =>
    points.reduce((sum, point, at) => sum + length2(subtract2(points[(at + 1) % points.length]!, point)), 0);

const cornerOf = (points: readonly Point2[], radii: readonly number[], at: number): RoundedCorner | undefined => {
    const corner = points[at]!;
    const radius = radii[at] ?? 0;
    const toPrevious = unit2Of(subtract2(points[(at + points.length - 1) % points.length]!, corner));
    const toNext = unit2Of(subtract2(points[(at + 1) % points.length]!, corner));
    if (toPrevious === undefined || toNext === undefined) {
        throw new Error(`The point at position ${at} lies on a point beside it, so the corner there has no sides`);
    }
    const half = Math.atan2(Math.abs(cross2(toPrevious, toNext)), dot2(toPrevious, toNext)) / 2;
    if (!(radius > 0) || half < STRAIGHT_TOLERANCE || half > Math.PI / 2 - STRAIGHT_TOLERANCE || unit2Of(add2(toPrevious, toNext)) === undefined) {
        return undefined;
    }
    return { corner, radius, toPrevious, toNext, half, reach: radius / Math.tan(half) };
};

const requireFit = (points: readonly Point2[], corners: readonly (RoundedCorner | undefined)[]): void => {
    corners.forEach((first, at) => {
        const next = (at + 1) % points.length;
        const second = corners[next];
        const side = length2(subtract2(points[next]!, points[at]!));
        const need = (first?.reach ?? 0) + (second?.reach ?? 0);
        if (need <= side * (1 + FIT_TOLERANCE)) {
            return;
        }
        const single = first === undefined || second === undefined;
        throw new InputError(single
            ? `A corner radius of ${(first ?? second)!.radius} does not fit the edges beside its corner`
            : `the arcs at the points at positions ${at} and ${next} need ${shown(need)} of the side between them, which is ${shown(side)} long`);
    });
};

const meetingOf = (points: readonly Point2[], corners: readonly (RoundedCorner | undefined)[], at: number): Point2 | undefined => {
    const next = (at + 1) % points.length;
    const first = corners[at];
    const second = corners[next];
    const need = (first?.reach ?? 0) + (second?.reach ?? 0);
    if (need < distance2(points[next]!, points[at]!) * (1 - FIT_TOLERANCE)) {
        return undefined;
    }
    if (first === undefined) {
        return points[at];
    }
    return second === undefined ? points[next] : between2(points[at]!, points[next]!, first.reach / need);
};

export const roundedCorners2 = (points: readonly Point2[], radii: readonly number[], segmentsFor: (sweep: number) => number): Point2[] => {
    const corners = points.map((_, at) => cornerOf(points, radii, at));
    requireFit(points, corners);
    const meetings = points.map((_, at) => meetingOf(points, corners, at));
    const rounded: Point2[] = [];
    const append = (point: Point2): void => {
        if (rounded.length === 0 || distance2(point, rounded[rounded.length - 1]!) > 0) {
            rounded.push(point);
        }
    };
    points.forEach((point, at) => {
        const rounding = corners[at];
        if (rounding === undefined) {
            append(point);
            return;
        }
        const { corner, radius, toPrevious, toNext, reach } = rounding;
        const start = meetings[(at + points.length - 1) % points.length] ?? add2(corner, scale2(toPrevious, reach));
        const end = meetings[at] ?? add2(corner, scale2(toNext, reach));
        const inward = scale2(leftOf2(toPrevious), cross2(toPrevious, toNext) < 0 ? -radius : radius);
        const center = add2(add2(corner, scale2(toPrevious, reach)), inward);
        const fromStart = subtract2(start, center);
        const toEnd = subtract2(end, center);
        const from = Math.atan2(fromStart[1], fromStart[0]);
        let sweep = Math.atan2(toEnd[1], toEnd[0]) - from;
        sweep -= Math.round(sweep / (2 * Math.PI)) * 2 * Math.PI;
        const segments = segmentsFor(Math.abs(sweep));
        append(start);
        for (let step = 1; step < segments; step++) {
            append(add2(center, polar2(radius, from + (sweep * step) / segments)));
        }
        append(end);
    });
    if (rounded.length > 1 && distance2(rounded[0]!, rounded[rounded.length - 1]!) === 0) {
        rounded.pop();
    }
    return rounded;
};
