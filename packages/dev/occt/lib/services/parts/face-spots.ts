import type * as Inputs from "../../api/inputs";
import type { FaceSpot } from "./parts-types";

export const near = (value: number, target: number, tolerance: number): boolean => Math.abs(value - target) <= tolerance;

export function spotOf(kind: Inputs.OCCT.surfaceTypeEnum, min: Inputs.Base.Point3, max: Inputs.Base.Point3): FaceSpot {
    return { kind, z: (min[2] + max[2]) / 2, zMin: min[2], zMax: max[2], reach: Math.max(Math.abs(min[0]), Math.abs(max[0]), Math.abs(min[1]), Math.abs(max[1])), span: Math.max(max[0] - min[0], max[1] - min[1]) };
}
