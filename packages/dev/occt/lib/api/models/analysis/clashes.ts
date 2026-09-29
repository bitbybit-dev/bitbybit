import type { Base } from "../../inputs";

/**
 * One pair a clash query reports: the two items by index, `indexA` below `indexB` when both come
 * from one list or one shape, the nearest distance between them (0 where they touch, overlap or one
 * lies inside a solid of the other), the volume they share when both hold a solid (0 otherwise), and
 * the nearest points, `pointA` on the first and `pointB` on the second; where faces of one shape
 * cross, both are one point on their crossing.
 */
export interface Clash {
    indexA: number;
    indexB: number;
    distance: number;
    volume: number;
    pointA: Base.Point3;
    pointB: Base.Point3;
}
