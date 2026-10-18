export const RIGHT_ANGLE = 90;

export const HALF_TURN = 180;

export const FULL_TURN = 360;

export const DIMENSIONS = 3;

export const QUARTER_SINES: ReadonlyMap<number, number> = new Map<number, number>([[0, 0], [30, 0.5], [45, Math.SQRT1_2], [60, Math.sqrt(3) / 2], [RIGHT_ANGLE, 1]]);

export const HOLE_HEAD_SINK = 0.5;

export const MOST_BOXES = 4096;

export const KEPT_MESH_BYTES = 128 * 1024 * 1024;

export const KEPT_SOLIDS = 4096;

export const KEPT_PAIRS = 4096;

export const TAPPED_WALL_SHARE = 1e-4;

export const TOUCH_SHARE = 1e-3;

export const LEAST_TOUCH = 1e-6;
export const GEAR_NUMBERS = ["module", "teeth", "pressureAngle", "profileShift", "backlash", "addendum", "dedendum", "rootFillet", "rotation"] as const;
export const RACK_NUMBERS = ["module", "teeth", "pressureAngle", "backlash", "addendum", "dedendum", "rootFillet", "height"] as const;
