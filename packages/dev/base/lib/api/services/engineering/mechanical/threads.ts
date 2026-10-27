import { EngineeringThreadsAnsi } from "./threads-ansi";
import { EngineeringThreadsIso } from "./threads-iso";

/**
 * The sizes of screw threads by the standard that sets them, with no CAD kernel needed: `iso` holds
 * the ISO metric threads, `ansi` the Unified inch threads. Each gives diameters, pitches and tap
 * drills in the unit asked for; `occt.parts.mechanical.machining` cuts the threads into a body.
 * @beta
 */
export class EngineeringThreads {
    public readonly iso: EngineeringThreadsIso;
    public readonly ansi: EngineeringThreadsAnsi;

    constructor() {
        this.iso = new EngineeringThreadsIso();
        this.ansi = new EngineeringThreadsAnsi();
    }
}
