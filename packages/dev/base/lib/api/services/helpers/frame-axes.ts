import type * as Inputs from "../../inputs";

type Vec3 = Inputs.Base.Vector3;

/**
 * The sine below which two directions count as parallel wherever a frame is squared: a direction
 * closer than this to its normal leaves the X axis to rounding.
 */
export const PARALLEL_SINE = 1e-9;

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

/**
 * A vector scaled to length 1, or undefined for one of no length. It is divided by its largest
 * component before it is measured, so no square overflows or underflows at any finite size.
 */
export const unitOf = (vector: Vec3): Vec3 | undefined => {
    const largest = Math.max(Math.abs(vector[0]), Math.abs(vector[1]), Math.abs(vector[2]));
    if (!(largest > 0 && largest < Infinity)) {
        return undefined;
    }
    const scaled: Vec3 = [vector[0] / largest, vector[1] / largest, vector[2] / largest];
    const length = Math.hypot(scaled[0], scaled[1], scaled[2]);
    return [scaled[0] / length, scaled[1] / length, scaled[2] / length];
};

const withoutPartAlong = (vector: Vec3, unit: Vec3): Vec3 => {
    const along = vector[0] * unit[0] + vector[1] * unit[1] + vector[2] * unit[2];
    return [vector[0] - along * unit[0], vector[1] - along * unit[1], vector[2] - along * unit[2]];
};

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
    const y: Vec3 = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    return { origin: [origin[0], origin[1], origin[2]], x, y, z };
};
