import { EngineeringKnurlsDin } from "./knurls-din";
import { EngineeringKnurlsAnsi } from "./knurls-ansi";

/**
 * The grooves of knurls on a cylinder by the standard that sets them, with no CAD kernel needed:
 * `din` holds the metric DIN 82 knurls, `ansi` the ASME B94.6 diametral pitch ones, each in the unit
 * asked for. `occt.parts.mechanical.machining`
 * cuts them into a body.
 * @beta
 */
export class EngineeringKnurls {
    public readonly din: EngineeringKnurlsDin;
    public readonly ansi: EngineeringKnurlsAnsi;

    constructor() {
        this.din = new EngineeringKnurlsDin();
        this.ansi = new EngineeringKnurlsAnsi();
    }
}
