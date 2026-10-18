import type { OperationsService } from "../../base/operations.service";
import type { OCCTOperations } from "../../operations";
import type { OCCTShapes } from "../../shapes/shapes";
import type { OCCTSketch } from "../../sketch/sketch";
import type { PartBuilder } from "../part-builder";
import { OCCTBearings } from "./bearings";
import { OCCTFasteners } from "./fasteners";
import { OCCTGears } from "./gears";
import { OCCTKeys } from "./keys";
import { OCCTMachining } from "./machining";
import { OCCTRetainingRings } from "./retaining-rings";
import { OCCTSprings } from "./springs";
import { ThreadCutter } from "./thread-cutter";

/**
 * Mechanical standard parts as solids, the shapes of what `bitbybit.engineering.mechanical` sizes:
 * `gears`, `fasteners`, `springs`, `bearings`, `keys` and `retainingRings`, with `machining` for the
 * keyways, flats, grooves, threads, knurls and splines cut into shafts and hubs.
 */
export class OCCTPartsMechanical {
    public readonly gears: OCCTGears;
    public readonly fasteners: OCCTFasteners;
    public readonly springs: OCCTSprings;
    public readonly bearings: OCCTBearings;
    public readonly keys: OCCTKeys;
    public readonly retainingRings: OCCTRetainingRings;
    public readonly machining: OCCTMachining;

    constructor(sketch: OCCTSketch, operations: OCCTOperations, shapes: OCCTShapes, sweeps: OperationsService, build: PartBuilder) {
        this.gears = new OCCTGears(sketch, operations, shapes, build);
        const threads = new ThreadCutter(build, sweeps);
        this.fasteners = new OCCTFasteners(build, threads);
        this.springs = new OCCTSprings(build);
        this.bearings = new OCCTBearings(build);
        this.keys = new OCCTKeys(build);
        this.retainingRings = new OCCTRetainingRings(build);
        this.machining = new OCCTMachining(sketch, build, threads);
    }
}

