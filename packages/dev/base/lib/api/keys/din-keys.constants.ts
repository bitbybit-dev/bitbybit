import type { KeyRow } from "./key-types";

export const PARALLEL_KEYS: readonly KeyRow[] = [
    { upTo: 8, width: 2, height: 2, shaftDepth: 1.2, hubDepth: 1 },
    { upTo: 10, width: 3, height: 3, shaftDepth: 1.8, hubDepth: 1.4 },
    { upTo: 12, width: 4, height: 4, shaftDepth: 2.5, hubDepth: 1.8 },
    { upTo: 17, width: 5, height: 5, shaftDepth: 3, hubDepth: 2.3 },
    { upTo: 22, width: 6, height: 6, shaftDepth: 3.5, hubDepth: 2.8 },
    { upTo: 30, width: 8, height: 7, shaftDepth: 4, hubDepth: 3.3 },
    { upTo: 38, width: 10, height: 8, shaftDepth: 5, hubDepth: 3.3 },
    { upTo: 44, width: 12, height: 8, shaftDepth: 5, hubDepth: 3.3 },
    { upTo: 50, width: 14, height: 9, shaftDepth: 5.5, hubDepth: 3.8 },
    { upTo: 58, width: 16, height: 10, shaftDepth: 6, hubDepth: 4.3 },
    { upTo: 65, width: 18, height: 11, shaftDepth: 7, hubDepth: 4.4 },
];

export const SMALLEST_KEYED_SHAFT = 6;
