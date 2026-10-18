import type { BallBearingDesignation, BallBearingSizes, KeyRow } from "./machine-element-types";

export const BALL_BEARINGS: Readonly<Record<BallBearingDesignation, BallBearingSizes>> = {
    "623": { bore: 3, outside: 10, width: 4 },
    "624": { bore: 4, outside: 13, width: 5 },
    "625": { bore: 5, outside: 16, width: 5 },
    "626": { bore: 6, outside: 19, width: 6 },
    "608": { bore: 8, outside: 22, width: 7 },
    "609": { bore: 9, outside: 24, width: 7 },
    "6000": { bore: 10, outside: 26, width: 8 },
    "6001": { bore: 12, outside: 28, width: 8 },
    "6002": { bore: 15, outside: 32, width: 9 },
    "6003": { bore: 17, outside: 35, width: 10 },
    "6004": { bore: 20, outside: 42, width: 12 },
    "6005": { bore: 25, outside: 47, width: 12 },
    "6006": { bore: 30, outside: 55, width: 13 },
    "6007": { bore: 35, outside: 62, width: 14 },
    "6008": { bore: 40, outside: 68, width: 15 },
    "6009": { bore: 45, outside: 75, width: 16 },
    "6010": { bore: 50, outside: 80, width: 16 },
    "6200": { bore: 10, outside: 30, width: 9 },
    "6201": { bore: 12, outside: 32, width: 10 },
    "6202": { bore: 15, outside: 35, width: 11 },
    "6203": { bore: 17, outside: 40, width: 12 },
    "6204": { bore: 20, outside: 47, width: 14 },
    "6205": { bore: 25, outside: 52, width: 15 },
    "6206": { bore: 30, outside: 62, width: 16 },
    "6207": { bore: 35, outside: 72, width: 17 },
    "6208": { bore: 40, outside: 80, width: 18 },
    "6209": { bore: 45, outside: 85, width: 19 },
    "6210": { bore: 50, outside: 90, width: 20 },
};

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
export const SPRING_POINTS_PER_COIL = 24;
export const MOST_ACTIVE_COILS = 1000;
export const SPRING_END_COILS = 1;
export const SPRING_EASE = 0.25;
export const SMALLEST_SPRING_INDEX = 3;
export const MIDPOINT = 0.5;
export const SPRING_CLOSED_RISE = 1.05;
export const SPRING_GRIND_OVERRUN = 0.75;
export const SPRING_ROUNDING_PLACES = 9;
