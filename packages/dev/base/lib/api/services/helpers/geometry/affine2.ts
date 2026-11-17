import type { Base } from "../../../inputs/base-inputs";
import { cross2 } from "./vectors";

export type AffineMatrix2 = readonly [number, number, number, number, number, number];

export const AFFINE_IDENTITY2: AffineMatrix2 = [1, 0, 0, 1, 0, 0];

export const affineProduct2 = (first: AffineMatrix2, second: AffineMatrix2): AffineMatrix2 => {
    const [a1, b1, c1, d1, e1, f1] = first;
    const [a2, b2, c2, d2, e2, f2] = second;
    return [
        a1 * a2 + c1 * b2,
        b1 * a2 + d1 * b2,
        a1 * c2 + c1 * d2,
        b1 * c2 + d1 * d2,
        a1 * e2 + c1 * f2 + e1,
        b1 * e2 + d1 * f2 + f1,
    ];
};

export const affinePoint2 = (matrix: AffineMatrix2, point: Base.Point2): Base.Point2 =>
    [matrix[0] * point[0] + matrix[2] * point[1] + matrix[4], matrix[1] * point[0] + matrix[3] * point[1] + matrix[5]];

export const affineTranslation2 = (x: number, y: number): AffineMatrix2 => [1, 0, 0, 1, x, y];

export const affineScaling2 = (x: number, y: number): AffineMatrix2 => [x, 0, 0, y, 0, 0];

export const affineAreaScale2 = (matrix: AffineMatrix2): number => Math.sqrt(Math.abs(cross2([matrix[0], matrix[1]], [matrix[2], matrix[3]])));
