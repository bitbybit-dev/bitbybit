import { EngineeringRetainingRingsDin } from "./retaining-rings-din";
import { EngineeringRetainingRingsAnsi } from "./retaining-rings-ansi";

/**
 * The sizes of retaining rings and their grooves by the standard that sets them, with no CAD kernel
 * needed: `din` holds the metric DIN 471 rings for shafts and DIN 472 rings for bores, `ansi` the inch
 * tapered rings, each in the unit asked for. `occt.parts.mechanical.retainingRings` builds the rings as solids.
 * @beta
 */
export class EngineeringRetainingRings {
    public readonly din: EngineeringRetainingRingsDin;
    public readonly ansi: EngineeringRetainingRingsAnsi;

    constructor() {
        this.din = new EngineeringRetainingRingsDin();
        this.ansi = new EngineeringRetainingRingsAnsi();
    }
}
