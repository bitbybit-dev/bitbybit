import { EngineeringMechanical } from "./mechanical/mechanical";

/**
 * Engineering knowledge by its numbers, grouped by domain, with no CAD kernel needed. `mechanical`
 * holds the machine elements: gears and racks, ISO metric fasteners, ball bearings, keys, retaining
 * rings, splines, knurls and springs. Each domain gives sizes and outlines for any kernel to build
 * from.
 * @beta
 */
export class Engineering {
    public readonly mechanical: EngineeringMechanical;

    constructor() {
        this.mechanical = new EngineeringMechanical();
    }
}
