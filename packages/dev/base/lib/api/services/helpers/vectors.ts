import type * as Inputs from "../../inputs";

type Vec2 = Inputs.Base.Vector2;
type Vec3 = Inputs.Base.Vector3;

export const add2 = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];

export const subtract2 = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];

export const scale2 = (a: Vec2, factor: number): Vec2 => [a[0] * factor, a[1] * factor];

export const dot2 = (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1];

export const cross2 = (a: Vec2, b: Vec2): number => a[0] * b[1] - a[1] * b[0];

export const length2 = (a: Vec2): number => Math.hypot(a[0], a[1]);

export const leftOf2 = (a: Vec2): Vec2 => [-a[1], a[0]];

export const unit2Of = (a: Vec2): Vec2 | undefined => {
    const length = length2(a);
    return length > 0 && length < Infinity ? [a[0] / length, a[1] / length] : undefined;
};

export const add3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export const subtract3 = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

export const scale3 = (a: Vec3, factor: number): Vec3 => [a[0] * factor, a[1] * factor, a[2] * factor];

export const dot3 = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross3 = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export const length3 = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
