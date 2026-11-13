import type * as Inputs from "../../../inputs";
import type { FrameAxes } from "./frame-axes";
import { degreesOf, radiansOf } from "./scalars";
import { GIMBAL_SINE, QUARTER_TURN_DEGREES, QUATERNION_LENGTH } from "./quaternions.constants";

type Quaternion = Inputs.Base.Quaternion;
type Vec3 = Inputs.Base.Vector3;

const HALF = 0.5;

export const isQuaternion = (value: unknown): value is Quaternion =>
    Array.isArray(value) && value.length === QUATERNION_LENGTH && value.every(n => typeof n === "number" && Number.isFinite(n));

export const unitQuaternion = (quaternion: Quaternion): Quaternion | undefined => {
    const length = Math.hypot(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
    if (!(length > 0 && length < Infinity)) {
        return undefined;
    }
    return [quaternion[0] / length, quaternion[1] / length, quaternion[2] / length, quaternion[3] / length];
};

export const quaternionAbout = (unitAxis: Vec3, degrees: number): Quaternion => {
    const half = radiansOf(degrees) * HALF;
    const sine = Math.sin(half);
    return [unitAxis[0] * sine, unitAxis[1] * sine, unitAxis[2] * sine, Math.cos(half)];
};

export const quaternionProduct = (a: Quaternion, b: Quaternion): Quaternion => [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];

export const quaternionOfDegrees = (angles: Vec3): Quaternion =>
    quaternionProduct(quaternionAbout([0, 0, 1], angles[2]), quaternionProduct(quaternionAbout([0, 1, 0], angles[1]), quaternionAbout([1, 0, 0], angles[0])));

export const quaternionTurned = (unit: Quaternion, vector: Vec3): Vec3 => {
    const [x, y, z, w] = unit;
    const tx = 2 * (y * vector[2] - z * vector[1]);
    const ty = 2 * (z * vector[0] - x * vector[2]);
    const tz = 2 * (x * vector[1] - y * vector[0]);
    return [vector[0] + w * tx + (y * tz - z * ty), vector[1] + w * ty + (z * tx - x * tz), vector[2] + w * tz + (x * ty - y * tx)];
};

export const degreesOfQuaternion = (unit: Quaternion): Vec3 => {
    const [x, y, z, w] = unit;
    const r00 = 1 - 2 * (y * y + z * z);
    const r01 = 2 * (x * y - z * w);
    const r10 = 2 * (x * y + z * w);
    const r11 = 1 - 2 * (x * x + z * z);
    const r20 = 2 * (x * z - y * w);
    const r21 = 2 * (y * z + x * w);
    const r22 = 1 - 2 * (x * x + y * y);
    if (Math.abs(r20) > GIMBAL_SINE) {
        return [0, r20 > 0 ? -QUARTER_TURN_DEGREES : QUARTER_TURN_DEGREES, degreesOf(Math.atan2(-r01, r11))];
    }
    return [degreesOf(Math.atan2(r21, r22)), degreesOf(Math.asin(-r20)), degreesOf(Math.atan2(r10, r00))];
};

export const quaternionOfAxes = ({ x, y, z }: Pick<FrameAxes, "x" | "y" | "z">): Quaternion => {
    const trace = x[0] + y[1] + z[2];
    if (trace > 0) {
        const root = Math.sqrt(trace + 1);
        const share = HALF / root;
        return [(y[2] - z[1]) * share, (z[0] - x[2]) * share, (x[1] - y[0]) * share, root * HALF];
    }
    if (x[0] > y[1] && x[0] > z[2]) {
        const root = Math.sqrt(1 + x[0] - y[1] - z[2]);
        const share = HALF / root;
        return [root * HALF, (y[0] + x[1]) * share, (z[0] + x[2]) * share, (y[2] - z[1]) * share];
    }
    if (y[1] > z[2]) {
        const root = Math.sqrt(1 + y[1] - x[0] - z[2]);
        const share = HALF / root;
        return [(y[0] + x[1]) * share, root * HALF, (z[1] + y[2]) * share, (z[0] - x[2]) * share];
    }
    const root = Math.sqrt(1 + z[2] - x[0] - y[1]);
    const share = HALF / root;
    return [(z[0] + x[2]) * share, (z[1] + y[2]) * share, root * HALF, (x[1] - y[0]) * share];
};

export const quaternionMatrix = ([x, y, z, w]: Quaternion): Inputs.Base.TransformMatrix => [
    1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (z * x - y * w), 0,
    2 * (x * y - z * w), 1 - 2 * (z * z + x * x), 2 * (y * z + x * w), 0,
    2 * (z * x + y * w), 2 * (y * z - x * w), 1 - 2 * (y * y + x * x), 0,
    0, 0, 0, 1,
];
