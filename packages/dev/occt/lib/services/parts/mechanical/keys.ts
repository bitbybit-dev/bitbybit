import type { ParallelKeyShapes } from "./parallel-key-shapes";
import { OCCTKeysAnsi } from "./keys-ansi";
import { OCCTKeysDin } from "./keys-din";

/**
 * Keys as solids, by the standard that sizes them: `din` holds the metric DIN 6885 form A parallel
 * keys and `ansi` the inch ANSI B17.1 square ones, each in the unit asked for. A key sunk its
 * keyway's depth also serves as the tool that cuts its keyway.
 */
export class OCCTKeys {
    public readonly din: OCCTKeysDin;
    public readonly ansi: OCCTKeysAnsi;

    constructor(shapes: ParallelKeyShapes) {
        this.din = new OCCTKeysDin(shapes);
        this.ansi = new OCCTKeysAnsi(shapes);
    }
}
