import type { Vector } from "./helpers";

/** A rotation as an axis through the origin and an angle in degrees about it, right-handed. */
export interface AxisTurn {
    axis: Vector;
    angle: number;
}

/** One rigid motion: turn about the origin, then shift. */
export interface RigidMotion {
    turn: AxisTurn;
    shift: Vector;
}

type Quaternion = [number, number, number, number];

const STILL = 1e-12;

function about(axis: 0 | 1 | 2, degrees: number): Quaternion {
    const half = degrees * Math.PI / 360;
    const quaternion: Quaternion = [Math.cos(half), 0, 0, 0];
    quaternion[axis + 1] = Math.sin(half);
    return quaternion;
}

function times(a: Quaternion, b: Quaternion): Quaternion {
    return [
        a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
        a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
        a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
        a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
    ];
}

function rotated(quaternion: Quaternion, point: Vector): Vector {
    const [w, x, y, z] = quaternion;
    const [px, py, pz] = point;
    const tx = 2 * (y * pz - z * py);
    const ty = 2 * (z * px - x * pz);
    const tz = 2 * (x * py - y * px);
    return [px + w * tx + (y * tz - z * ty), py + w * ty + (z * tx - x * tz), pz + w * tz + (x * ty - y * tx)];
}

/**
 * The one motion that turns by `turns` degrees about X, then Y, then Z, each about an axis through
 * `pivot`, and then shifts by `shift`.
 */
export function rigidMotion(turns: Vector, pivot: Vector, shift: Vector): RigidMotion {
    const quaternion = times(about(2, turns[2]), times(about(1, turns[1]), about(0, turns[0])));
    const sine = Math.hypot(quaternion[1], quaternion[2], quaternion[3]);
    const angle = sine < STILL ? 0 : 2 * Math.atan2(sine, quaternion[0]) * 180 / Math.PI;
    const axis: Vector = sine < STILL ? [0, 0, 1] : [quaternion[1] / sine, quaternion[2] / sine, quaternion[3] / sine];
    const moved = rotated(quaternion, pivot);
    return { turn: { axis, angle }, shift: [pivot[0] - moved[0] + shift[0], pivot[1] - moved[1] + shift[1], pivot[2] - moved[2] + shift[2]] };
}
