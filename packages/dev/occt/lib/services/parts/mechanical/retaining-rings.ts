import type { RetainingRingShapes } from "./retaining-ring-shapes";
import { OCCTRetainingRingsAnsi } from "./retaining-rings-ansi";
import { OCCTRetainingRingsDin } from "./retaining-rings-din";

/**
 * Retaining rings as solids, by the standard that sizes them: `din` holds the metric DIN 471 rings
 * for shafts and DIN 472 rings for bores and `ansi` the inch tapered rings, each in the unit asked
 * for, with their lugs and lug holes.
 */
export class OCCTRetainingRings {
    public readonly din: OCCTRetainingRingsDin;
    public readonly ansi: OCCTRetainingRingsAnsi;

    constructor(shapes: RetainingRingShapes) {
        this.din = new OCCTRetainingRingsDin(shapes);
        this.ansi = new OCCTRetainingRingsAnsi(shapes);
    }
}
