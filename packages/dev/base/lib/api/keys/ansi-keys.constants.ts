import type { KeyRow } from "./key-types";

export const ANSI_PARALLEL_KEYS: readonly KeyRow[] = [
    { upTo: 0.4375, width: 0.09375, height: 0.09375, shaftDepth: 0.046875, hubDepth: 0.051875 },
    { upTo: 0.5625, width: 0.125, height: 0.125, shaftDepth: 0.0625, hubDepth: 0.0675 },
    { upTo: 0.875, width: 0.1875, height: 0.1875, shaftDepth: 0.09375, hubDepth: 0.09875 },
    { upTo: 1.25, width: 0.25, height: 0.25, shaftDepth: 0.125, hubDepth: 0.13 },
    { upTo: 1.375, width: 0.3125, height: 0.3125, shaftDepth: 0.15625, hubDepth: 0.16125 },
    { upTo: 1.75, width: 0.375, height: 0.375, shaftDepth: 0.1875, hubDepth: 0.1925 },
    { upTo: 2.25, width: 0.5, height: 0.5, shaftDepth: 0.25, hubDepth: 0.255 },
    { upTo: 2.75, width: 0.625, height: 0.625, shaftDepth: 0.3125, hubDepth: 0.3175 },
    { upTo: 3.25, width: 0.75, height: 0.75, shaftDepth: 0.375, hubDepth: 0.38 },
    { upTo: 3.75, width: 0.875, height: 0.875, shaftDepth: 0.4375, hubDepth: 0.4425 },
    { upTo: 4.5, width: 1, height: 1, shaftDepth: 0.5, hubDepth: 0.505 },
    { upTo: 5.5, width: 1.25, height: 1.25, shaftDepth: 0.625, hubDepth: 0.63 },
    { upTo: 6.5, width: 1.5, height: 1.5, shaftDepth: 0.75, hubDepth: 0.755 },
];

export const ANSI_SMALLEST_KEYED_SHAFT = 0.3125;
