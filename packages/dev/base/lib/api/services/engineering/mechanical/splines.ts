import { EngineeringSplinesDin } from "./splines-din";
import { EngineeringSplinesAnsi } from "./splines-ansi";

/**
 * The sizes of involute splines by the standard that sets them, with no CAD kernel needed: `din`
 * holds the metric DIN 5480 splines, `ansi` the ANSI B92.1 inch splines, each in the unit asked for. `occt.parts.mechanical.machining` builds
 * a splined shaft and cuts the hub to fit it.
 * @beta
 */
export class EngineeringSplines {
    public readonly din: EngineeringSplinesDin;
    public readonly ansi: EngineeringSplinesAnsi;

    constructor() {
        this.din = new EngineeringSplinesDin();
        this.ansi = new EngineeringSplinesAnsi();
    }
}
