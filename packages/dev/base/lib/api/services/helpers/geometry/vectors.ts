import type * as Inputs from "../../../inputs";

type Vec2 = Inputs.Base.Vector2;
type Vec3 = Inputs.Base.Vector3;

const PLANE_Z = 0;

export const add2 = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];

export const subtract2 = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];

export const scale2 = (a: Vec2, factor: number): Vec2 => [a[0] * factor, a[1] * factor];

export const dot2 = (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1];

export const cross2 = (a: Vec2, b: Vec2): number => a[0] * b[1] - a[1] * b[0];

export const length2 = (a: Vec2): number => Math.sqrt(a[0] * a[0] + a[1] * a[1]);

export const distance2 = (a: Vec2, b: Vec2): number => length2(subtract2(a, b));

export const leftOf2 = (a: Vec2): Vec2 => [-a[1], a[0]];

export const between2 = (a: Vec2, b: Vec2, share: number): Vec2 => [a[0] + (b[0] - a[0]) * share, a[1] + (b[1] - a[1]) * share];

export const polar2 = (radius: number, angle: number): Vec2 => [radius * Math.cos(angle), radius * Math.sin(angle)];

export const rotated2 = (a: Vec2, angle: number): Vec2 => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [a[0] * cos - a[1] * sin, a[0] * sin + a[1] * cos];
};

export const unit2Of = (a: Vec2): Vec2 | undefined => {
    const largest = Math.max(Math.abs(a[0]), Math.abs(a[1]));
    if (!(largest > 0 && largest < Infinity)) {
        return undefined;
    }
    const x = a[0] / largest;
    const y = a[1] / largest;
    const length = Math.hypot(x, y, PLANE_Z);
    return [x / length, y / length];
};

export const unitVectorOf = (vector: readonly number[]): number[] | undefined => {
    const largest = Math.max(...vector.map(Math.abs));
    if (!(largest > 0 && largest < Infinity)) {
        return undefined;
    }
    const scaled = vector.map(value => value / largest);
    const length = Math.hypot(...scaled);
    return scaled.map(value => value / length);
};

export const add3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export const subtract3 = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

export const scale3 = (a: Vec3, factor: number): Vec3 => [a[0] * factor, a[1] * factor, a[2] * factor];

export const dot3 = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross3 = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export const length3 = (a: Vec3): number => Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);

export const between3 = (a: Vec3, b: Vec3, share: number): Vec3 => [a[0] + (b[0] - a[0]) * share, a[1] + (b[1] - a[1]) * share, a[2] + (b[2] - a[2]) * share];

export const distance3 = (a: Vec3, b: Vec3): number => length3(subtract3(a, b));
