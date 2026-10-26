import { EngineeringFastenersAnsi } from "./fasteners-ansi";
import { EngineeringFastenersIso } from "./fasteners-iso";

/**
 * The sizes of fasteners by the standard that sets them, with no CAD kernel needed: `iso` holds the
 * ISO metric clearance holes, cap screws, hexagon bolts and nuts, washers and set screws, `ansi` the
 * ASME inch ones, each in the unit asked for. `occt.parts.mechanical.fasteners` builds the same parts as solids.
 * @beta
 */
export class EngineeringFasteners {
    public readonly iso: EngineeringFastenersIso;
    public readonly ansi: EngineeringFastenersAnsi;

    constructor() {
        this.iso = new EngineeringFastenersIso();
        this.ansi = new EngineeringFastenersAnsi();
    }
}
