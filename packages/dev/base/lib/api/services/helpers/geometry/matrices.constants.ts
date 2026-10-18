import type * as Inputs from "../../../inputs";

export const RIGID_TOLERANCE = 1e-7;
export const LINEAR_COLUMN_STARTS = [0, 4, 8] as const;
export const MATRIX_COLUMN = 4;
export const TRANSLATION_START = 12;
export const W_AXIS = 3;
export const POSITION_SIZE = 3;
export const IDENTITY_MATRIX: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
