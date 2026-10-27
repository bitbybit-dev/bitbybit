import * as Inputs from "../../api/inputs";
import { millimetresPerUnitOf } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/lengths";
import type { StepLengthUnit } from "./recipe-types";

export const UNIT_TOLERANCE = 1e-12;
export const STEP_UNITS: readonly (readonly [number, StepLengthUnit])[] = Object.values(Inputs.Base.unitOfLengthEnum).map((unit): readonly [number, StepLengthUnit] => [millimetresPerUnitOf(unit), unit]);
export const RGB_SIZE = 3;
export const RGBA_SIZE = 4;
export const MAX_KERNEL_COUNT = 2 ** 31 - 1;
export const STEPS_BEFORE_EXACT_BREPS: ReadonlySet<string> = new Set(["polygon", "circle", "extrude", "halfSpace", "difference", "transform", "voids", "triangles", "compound", "union", "intersection", "revolve", "loft"]);
export const SPLINED_FOR_IFC = 0b111;
