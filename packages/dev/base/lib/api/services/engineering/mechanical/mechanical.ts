import { EngineeringFasteners } from "./fasteners";
import { EngineeringGears } from "./gears";
import { EngineeringBearings } from "./bearings";
import { EngineeringKeys } from "./keys";
import { EngineeringKnurls } from "./knurls";
import { EngineeringRetainingRings } from "./retaining-rings";
import { EngineeringSplines } from "./splines";
import { EngineeringSprings } from "./springs";
import { EngineeringThreads } from "./threads";

/**
 * Mechanical engineering by its numbers: the sizes and outlines of involute gears and racks, and
 * the threads, fasteners, ball bearings, parallel keys, retaining rings, splines and knurls of each
 * standard, with compression springs, for any kernel to build from. Each family holds one member per
 * standard, such as `iso` or `din`, whose sizes come in the `unit` asked for; gears and springs are
 * in model units. `occt.parts.mechanical` builds the same parts as solids with named faces.
 * @beta
 */
export class EngineeringMechanical {
    public readonly gears: EngineeringGears;
    public readonly threads: EngineeringThreads;
    public readonly fasteners: EngineeringFasteners;
    public readonly bearings: EngineeringBearings;
    public readonly keys: EngineeringKeys;
    public readonly retainingRings: EngineeringRetainingRings;
    public readonly splines: EngineeringSplines;
    public readonly knurls: EngineeringKnurls;
    public readonly springs: EngineeringSprings;

    constructor() {
        this.gears = new EngineeringGears();
        this.threads = new EngineeringThreads();
        this.fasteners = new EngineeringFasteners();
        this.bearings = new EngineeringBearings();
        this.keys = new EngineeringKeys();
        this.retainingRings = new EngineeringRetainingRings();
        this.splines = new EngineeringSplines();
        this.knurls = new EngineeringKnurls();
        this.springs = new EngineeringSprings();
    }
}
