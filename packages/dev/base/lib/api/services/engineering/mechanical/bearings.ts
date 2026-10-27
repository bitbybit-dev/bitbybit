import { EngineeringBearingsIso } from "./bearings-iso";
import { EngineeringBearingsAnsi } from "./bearings-ansi";

/**
 * The sizes of deep groove ball bearings by the standard that sets them, with no CAD kernel needed:
 * `iso` holds the metric 60 and 62 series and the small 62x and 60x sizes, `ansi` the inch R-series,
 * each in the unit asked for.
 * `occt.parts.mechanical.bearings` builds them as solids.
 * @beta
 */
export class EngineeringBearings {
    public readonly iso: EngineeringBearingsIso;
    public readonly ansi: EngineeringBearingsAnsi;

    constructor() {
        this.iso = new EngineeringBearingsIso();
        this.ansi = new EngineeringBearingsAnsi();
    }
}
