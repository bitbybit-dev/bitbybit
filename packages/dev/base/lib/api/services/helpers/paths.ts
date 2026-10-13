import type * as Inputs from "../../inputs";
import { arcThroughThreePoints, pointsOnArc } from "./arcs";
import { add3, cross3, dot3, length3, scale3, subtract3 } from "./vectors";

type Vec3 = Inputs.Base.Vector3;
type Point3 = Inputs.Base.Point3;

const STRAIGHT_SLACK = 1e-12;
const STRAIGHT_COSINE = 1 - STRAIGHT_SLACK;
const CORNERED_POINTS = 3;
const MAX_MITRE = 8;
const TINY_LENGTH = 1e-9;
const TINY_SQUARED = 1e-18;
const AXES: readonly Vec3[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

const unit3 = (vector: Vec3): Vec3 => scale3(vector, 1 / length3(vector));

const reflected = (vector: Vec3, across: Vec3, squared: number): Vec3 => subtract3(vector, scale3(across, (2 / squared) * dot3(across, vector)));

const square = (vector: Vec3, to: Vec3): Vec3 | undefined => {
    const across = subtract3(vector, scale3(to, dot3(vector, to)));
    const length = length3(across);
    return length > TINY_LENGTH ? scale3(across, 1 / length) : undefined;
};

const anyAcross = (tangent: Vec3): Vec3 => {
    const least = AXES.reduce((best, axis) => (Math.abs(dot3(axis, tangent)) < Math.abs(dot3(best, tangent)) ? axis : best));
    return square(least, tangent)!;
};

export const pathLength3 = (points: readonly Point3[]): number =>
    points.reduce((length, point, at) => (at === 0 ? length : length + length3(subtract3(point, points[at - 1]!))), 0);

export const pathTangents = (points: readonly Point3[], start?: Vec3, end?: Vec3): Vec3[] => {
    const directions = points.slice(1).map((point, at) => unit3(subtract3(point, points[at]!)));
    return points.map((_, at) => {
        if (at === 0) {
            return start === undefined ? directions[0]! : unit3(start);
        }
        if (at === points.length - 1) {
            return end === undefined ? directions[at - 1]! : unit3(end);
        }
        const sum = add3(directions[at - 1]!, directions[at]!);
        return length3(sum) > TINY_LENGTH ? unit3(sum) : directions[at]!;
    });
};

export const transportedAxes = (points: readonly Point3[], tangents: readonly Vec3[], first: Vec3): Vec3[] => {
    const axes: Vec3[] = [square(first, tangents[0]!) ?? anyAcross(tangents[0]!)];
    for (let at = 1; at < points.length; at++) {
        const step = subtract3(points[at]!, points[at - 1]!);
        const stepSquared = dot3(step, step);
        const previous = axes[at - 1]!;
        const turnedAxis = reflected(previous, step, stepSquared);
        const turnedTangent = reflected(tangents[at - 1]!, step, stepSquared);
        const remaining = subtract3(tangents[at]!, turnedTangent);
        const remainingSquared = dot3(remaining, remaining);
        const axis = remainingSquared > TINY_SQUARED ? reflected(turnedAxis, remaining, remainingSquared) : turnedAxis;
        axes.push(square(axis, tangents[at]!) ?? anyAcross(tangents[at]!));
    }
    return axes;
};

const mitred = (vector: Vec3, bend: Vec3, stretch: number): Vec3 => add3(vector, scale3(bend, (stretch - 1) * dot3(vector, bend)));

export const sweepMatrices = (points: readonly Point3[], tangents: readonly Vec3[], xAxes: readonly Vec3[]): Inputs.Base.TransformMatrix[] =>
    points.map((origin, at) => {
        const z = tangents[at]!;
        let x = xAxes[at]!;
        let y = cross3(z, x);
        if (at > 0 && at < points.length - 1) {
            const incoming = unit3(subtract3(origin, points[at - 1]!));
            const outgoing = unit3(subtract3(points[at + 1]!, origin));
            const cosine = dot3(incoming, outgoing);
            const bend = square(subtract3(outgoing, incoming), z);
            if (cosine < STRAIGHT_COSINE && bend !== undefined) {
                const stretch = Math.min(MAX_MITRE, 1 / Math.max(dot3(z, incoming), 1 / MAX_MITRE));
                x = mitred(x, bend, stretch);
                y = mitred(y, bend, stretch);
            }
        }
        return [x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, origin[0], origin[1], origin[2], 1];
    });

export const roundedPath3 = (points: readonly Point3[], radius: number, segmentsFor: (sweep: number) => number): Point3[] => {
    if (!(radius > 0) || points.length < CORNERED_POINTS) {
        return [...points];
    }
    const rounded: Point3[] = [points[0]!];
    for (let at = 1; at < points.length - 1; at++) {
        const corner = points[at]!;
        const toPrevious = subtract3(points[at - 1]!, corner);
        const toNext = subtract3(points[at + 1]!, corner);
        const incoming = scale3(toPrevious, -1 / length3(toPrevious));
        const outgoing = unit3(toNext);
        const cosine = dot3(incoming, outgoing);
        if (!(cosine < STRAIGHT_COSINE)) {
            rounded.push(corner);
            continue;
        }
        const turn = Math.acos(Math.max(-1, Math.min(1, cosine)));
        const reach = Math.min(radius * Math.tan(turn / 2), length3(toPrevious) / 2, length3(toNext) / 2);
        const start = add3(corner, scale3(incoming, -reach));
        const end = add3(corner, scale3(outgoing, reach));
        const inward = unit3(subtract3(outgoing, incoming));
        const fitted = reach / Math.tan(turn / 2);
        const middle = add3(corner, scale3(inward, fitted / Math.cos(turn / 2) - fitted));
        const arc = arcThroughThreePoints(start, middle, end);
        rounded.push(...(arc ? pointsOnArc(arc, start, end, segmentsFor(turn)) : [corner]));
    }
    rounded.push(points[points.length - 1]!);
    return rounded;
};
