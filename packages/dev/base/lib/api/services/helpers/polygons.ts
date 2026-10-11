import type * as Inputs from "../../inputs";
import { add2, dot2, length2, scale2, subtract2 } from "./vectors";

type Point2 = Inputs.Base.Point2;

const STRAIGHT_TOLERANCE = 1e-9;
const FIT_TOLERANCE = 1e-9;

export const signedArea2 = (points: readonly Point2[]): number => {
    let twice = 0;
    for (let at = 0; at < points.length; at++) {
        const a = points[at]!;
        const b = points[(at + 1) % points.length]!;
        twice += a[0] * b[1] - b[0] * a[1];
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

const unit2 = (vector: Point2): Point2 => scale2(vector, 1 / length2(vector));

export const roundedCorners2 = (points: readonly Point2[], radii: readonly number[], segmentsFor: (sweep: number) => number): Point2[] => {
    const rounded: Point2[] = [];
    points.forEach((corner, at) => {
        const radius = radii[at] ?? 0;
        const previous = points[(at + points.length - 1) % points.length]!;
        const next = points[(at + 1) % points.length]!;
        const toPrevious = unit2(subtract2(previous, corner));
        const toNext = unit2(subtract2(next, corner));
        const half = Math.acos(Math.min(1, Math.max(-1, dot2(toPrevious, toNext)))) / 2;
        if (!(radius > 0) || half < STRAIGHT_TOLERANCE || half > Math.PI / 2 - STRAIGHT_TOLERANCE) {
            rounded.push(corner);
            return;
        }
        const reach = radius / Math.tan(half);
        const room = Math.min(length2(subtract2(previous, corner)), length2(subtract2(next, corner)));
        if (reach > room * (1 + FIT_TOLERANCE)) {
            throw new Error(`A corner radius of ${radius} does not fit the edges beside its corner`);
        }
        const center = add2(corner, scale2(unit2(add2(toPrevious, toNext)), radius / Math.sin(half)));
        const start = subtract2(add2(corner, scale2(toPrevious, reach)), center);
        const end = subtract2(add2(corner, scale2(toNext, reach)), center);
        const from = Math.atan2(start[1], start[0]);
        let sweep = Math.atan2(end[1], end[0]) - from;
        sweep -= Math.round(sweep / (2 * Math.PI)) * 2 * Math.PI;
        const segments = segmentsFor(Math.abs(sweep));
        for (let step = 0; step <= segments; step++) {
            const angle = from + (sweep * step) / segments;
            rounded.push([center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)]);
        }
    });
    return rounded;
};
