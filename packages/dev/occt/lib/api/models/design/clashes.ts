import type { Base } from "../../inputs";

/**
 * Two placed parts of a design build that overlap, touch or come within the clearance:
 * `components` are their paths in the build (for a part document, the parts' ids), `distance` how far
 * apart they are, 0 where they touch or overlap, `volume` the volume they share, and `pointA` and
 * `pointB` the nearest points, on the first and on the second. `joined` says a joint holds the two
 * together, which a touch between them is expected to; such a touch is never listed, an overlap is.
 */
export interface DesignClash {
    components: [string, string];
    distance: number;
    volume: number;
    pointA: Base.Point3;
    pointB: Base.Point3;
    joined: boolean;
}
