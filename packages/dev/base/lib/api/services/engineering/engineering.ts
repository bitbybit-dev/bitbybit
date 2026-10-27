import { EngineeringMechanical } from "./mechanical/mechanical";

/**
 * Engineering knowledge by its numbers, grouped by domain, with no CAD kernel needed. `mechanical`
 * holds the machine elements: gears and racks, fasteners and threads, ball bearings, keys, retaining
 * rings, splines, knurls and springs, each standard's sizes in the unit asked for. Each domain gives
 * sizes and outlines for any kernel to build from.
 * @beta
 */
export class Engineering {
    public readonly mechanical: EngineeringMechanical;

    constructor() {
        this.mechanical = new EngineeringMechanical();
    }
}
