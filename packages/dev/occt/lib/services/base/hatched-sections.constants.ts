import type * as Inputs from "../../api/inputs";

export const GROUND_FRAME: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, -1, 0], direction: [1, 0, 0] };
export const NEIGHBOUR_TURNS: readonly number[] = [0, 90, 30, 120, 60, 150];
export const SPACE_AXES: readonly number[] = [0, 1, 2];
