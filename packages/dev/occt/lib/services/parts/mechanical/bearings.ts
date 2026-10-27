import type { BallBearingShapes } from "./ball-bearing-shapes";
import { OCCTBearingsAnsi } from "./bearings-ansi";
import { OCCTBearingsIso } from "./bearings-iso";

/**
 * Rolling bearings as solids, by the standard that sizes them: `iso` holds the metric deep groove
 * ball bearings and `ansi` the inch R-series ones, each in the unit asked for, with their rings,
 * balls and cage as separate solids in one compound, and shields if asked for.
 */
export class OCCTBearings {
    public readonly iso: OCCTBearingsIso;
    public readonly ansi: OCCTBearingsAnsi;

    constructor(shapes: BallBearingShapes) {
        this.iso = new OCCTBearingsIso(shapes);
        this.ansi = new OCCTBearingsAnsi(shapes);
    }
}
