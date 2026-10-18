export const LEAF_TRIANGLES = 8;
export const RAY_DIRECTIONS: readonly (readonly [number, number, number])[] = [
    [0.5773, 0.5779, 0.5767],
    [-0.6123, 0.7071, 0.3536],
    [0.2673, -0.5345, 0.8018],
];
export const PARALLEL = 1e-12;
export const POINT_SHARE = 1e-12;
export const FLAT_SHARE = 1e-28;
export const WELD_SHARE = 1e-9;
export const PRUNE_SLACK = 8 * Number.EPSILON;
