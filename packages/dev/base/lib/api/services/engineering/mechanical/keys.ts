import { EngineeringKeysDin } from "./keys-din";
import { EngineeringKeysAnsi } from "./keys-ansi";

/**
 * The sizes of parallel keys and their keyways by the standard that sets them, with no CAD kernel
 * needed: `din` holds the metric DIN 6885 form A keys, `ansi` the ANSI B17.1 square keys, each in
 * the unit asked for.
 * `occt.parts.mechanical.keys` builds the keys as solids.
 * @beta
 */
export class EngineeringKeys {
    public readonly din: EngineeringKeysDin;
    public readonly ansi: EngineeringKeysAnsi;

    constructor() {
        this.din = new EngineeringKeysDin();
        this.ansi = new EngineeringKeysAnsi();
    }
}
