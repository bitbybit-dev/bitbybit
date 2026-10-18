import { cross3, dot3, scale3, subtract3 } from "./vectors";
import type * as Inputs from "../../../inputs";

type Vec3 = Inputs.Base.Vector3;

/**
 * The sine below which two directions count as parallel wherever a frame is squared: a direction
 * closer than this to its normal leaves the X axis to rounding.
 */
export const PARALLEL_SINE = 1e-9;

const LEAST_ALIGNED_SLACK = 1e-9;

/**
 * A frame as the four vectors the maths reads: the origin and three unit axes at right angles,
 * with `y` the cross product of `z` and `x`.
 */
export interface FrameAxes {
    readonly origin: Vec3;
    readonly x: Vec3;
    readonly y: Vec3;
    readonly z: Vec3;
}

/** Whether a value is three finite numbers. */
export const isTriple = (value: unknown): value is Vec3 =>
    Array.isArray(value) && value.length === 3 && value.every(n => typeof n === "number" && Number.isFinite(n));

/** Whether a value has the shape of a frame: an `origin`, a `normal` and a `direction`, three finite numbers each. */
export const isFrameShaped = (value: unknown): value is Inputs.Base.Frame => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }
    const fields = value as Record<string, unknown>;
    return isTriple(fields["origin"]) && isTriple(fields["normal"]) && isTriple(fields["direction"]);
};

export const unitOf = (vector: Vec3): Vec3 | undefined => {
    const largest = Math.max(Math.abs(vector[0]), Math.abs(vector[1]), Math.abs(vector[2]));
    if (!(largest > 0 && largest < Infinity)) {
        return undefined;
    }
    const scaled: Vec3 = [vector[0] / largest, vector[1] / largest, vector[2] / largest];
    const length = Math.hypot(scaled[0], scaled[1], scaled[2]);
    return [scaled[0] / length, scaled[1] / length, scaled[2] / length];
};

const withoutPartAlong = (vector: Vec3, unit: Vec3): Vec3 => subtract3(vector, scale3(unit, dot3(vector, unit)));

/**
 * The axes of an origin, a normal and a rough X direction: the normal scaled to length 1 and the
 * direction turned square to it. Gives the name of the part that cannot be squared instead: a
 * normal of no length, or a direction of no length or within `PARALLEL_SINE` of the normal.
 *
 * The direction is projected twice: a direction close to the normal loses most of its digits to
 * the first subtraction, and the second takes out what rounding left along the normal.
 */
export const squareFrame = (origin: Vec3, normal: Vec3, direction: Vec3): FrameAxes | "normal" | "direction" => {
    const z = unitOf(normal);
    if (z === undefined) {
        return "normal";
    }
    const unitDirection = unitOf(direction);
    if (unitDirection === undefined) {
        return "direction";
    }
    const square = withoutPartAlong(unitDirection, z);
    if (!(Math.hypot(square[0], square[1], square[2]) > PARALLEL_SINE)) {
        return "direction";
    }
    const x = unitOf(withoutPartAlong(square, z))!;
    const y = cross3(z, x);
    return { origin: [origin[0], origin[1], origin[2]], x, y, z };
};

/**
 * The axes of an origin and a normal alone: X is the world axis least aligned with the normal,
 * squared to it, so the choice never comes close to parallel. Axes within a billionth of the least
 * aligned count as tied and the first of them, in X, Y, Z order, is taken, so rounding noise in the
 * normal cannot turn the frame. Gives undefined for a normal of no length.
 */
export const axesAlong = (origin: Vec3, normal: Vec3): FrameAxes | undefined => {
    const z = unitOf(normal);
    if (z === undefined) {
        return undefined;
    }
    const magnitudes = z.map(Math.abs);
    const least = Math.min(...magnitudes);
    const pick = magnitudes.findIndex(magnitude => magnitude <= least + LEAST_ALIGNED_SLACK);
    const across: Vec3 = pick === 0 ? [1, 0, 0] : pick === 1 ? [0, 1, 0] : [0, 0, 1];
    return squareFrame(origin, z, across) as FrameAxes;
};

export const WORLD_AXES: FrameAxes = { origin: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

export const vectorToWorld = (axes: FrameAxes, vector: Vec3): Vec3 => [
    (axes.x[0] * vector[0] + axes.y[0] * vector[1]) + axes.z[0] * vector[2],
    (axes.x[1] * vector[0] + axes.y[1] * vector[1]) + axes.z[1] * vector[2],
    (axes.x[2] * vector[0] + axes.y[2] * vector[1]) + axes.z[2] * vector[2],
];

export const pointToWorld = (axes: FrameAxes, point: Vec3): Vec3 => {
    const along = vectorToWorld(axes, point);
    return [axes.origin[0] + along[0], axes.origin[1] + along[1], axes.origin[2] + along[2]];
};

export const vectorToLocal = (axes: FrameAxes, vector: Vec3): Vec3 => [
    vector[0] * axes.x[0] + vector[1] * axes.x[1] + vector[2] * axes.x[2],
    vector[0] * axes.y[0] + vector[1] * axes.y[1] + vector[2] * axes.y[2],
    vector[0] * axes.z[0] + vector[1] * axes.z[1] + vector[2] * axes.z[2],
];

export const pointToLocal = (axes: FrameAxes, point: Vec3): Vec3 =>
    vectorToLocal(axes, [point[0] - axes.origin[0], point[1] - axes.origin[1], point[2] - axes.origin[2]]);

export const composeAxes = (parent: FrameAxes, child: FrameAxes): FrameAxes => ({
    origin: pointToWorld(parent, child.origin),
    x: vectorToWorld(parent, child.x),
    y: vectorToWorld(parent, child.y),
    z: vectorToWorld(parent, child.z),
});

export const relativeAxes = (parent: FrameAxes, child: FrameAxes): FrameAxes => ({
    origin: pointToLocal(parent, child.origin),
    x: vectorToLocal(parent, child.x),
    y: vectorToLocal(parent, child.y),
    z: vectorToLocal(parent, child.z),
});

export const axesToMatrix = (axes: FrameAxes): Inputs.Base.TransformMatrix => [
    axes.x[0], axes.x[1], axes.x[2], 0,
    axes.y[0], axes.y[1], axes.y[2], 0,
    axes.z[0], axes.z[1], axes.z[2], 0,
    axes.origin[0], axes.origin[1], axes.origin[2], 1,
];
