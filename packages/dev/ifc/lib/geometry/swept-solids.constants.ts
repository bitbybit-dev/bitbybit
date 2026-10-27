import type { Base } from "@bitbybit-dev/base";

export const FULL_TURN = 2 * Math.PI;
export const TURN_SLACK = 1e-9;
export const PARAMETER_RATIO = 1e-6;
export const LENGTH_MEASURE = "IFCLENGTHMEASURE";
export const IDENTITY_MATRIX: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
export const Y_TO_Z: Base.TransformMatrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1];
export const PYRAMID_TRIANGLES: readonly number[] = [0, 2, 1, 0, 3, 2, 0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4];
