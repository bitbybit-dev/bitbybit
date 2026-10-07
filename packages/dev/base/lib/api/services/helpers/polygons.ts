import type * as Inputs from "../../inputs";
import { length2, subtract2 } from "./vectors";

type Point2 = Inputs.Base.Point2;

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
