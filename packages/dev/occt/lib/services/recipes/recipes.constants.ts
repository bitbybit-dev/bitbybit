import type { Base } from "@bitbybit-dev/base";
import type { StepLengthUnit } from "./recipe-types";

export const IDENTITY_MATRIX: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
export const UNIT_TOLERANCE = 1e-12;
export const STEP_UNITS: readonly (readonly [number, StepLengthUnit])[] = [[1, "mm"], [10, "cm"], [1000, "m"], [25.4, "in"]];
export const RGB_SIZE = 3;
export const RGBA_SIZE = 4;
export const MAX_KERNEL_COUNT = 2 ** 31 - 1;
export const STEPS_BEFORE_EXACT_BREPS: ReadonlySet<string> = new Set(["polygon", "circle", "extrude", "halfSpace", "difference", "transform", "voids", "triangles", "compound", "union", "intersection", "revolve", "loft"]);
export const SPLINED_FOR_IFC = 0b111;
