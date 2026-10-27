import type { OperationsService } from "../../base/operations.service";
import type { OCCTOperations } from "../../operations";
import type { OCCTShapes } from "../../shapes/shapes";
import type { OCCTSketch } from "../../sketch/sketch";
import type { PartBuilder } from "../part-builder";
import { BallBearingShapes } from "./ball-bearing-shapes";
import { OCCTBearings } from "./bearings";
import { FastenerShapes } from "./fastener-shapes";
import { OCCTFasteners } from "./fasteners";
import { OCCTGears } from "./gears";
import { OCCTKeys } from "./keys";
import { MachiningShapes } from "./machining-shapes";
import { OCCTMachining } from "./machining";
import { ParallelKeyShapes } from "./parallel-key-shapes";
import { RetainingRingShapes } from "./retaining-ring-shapes";
import { OCCTRetainingRings } from "./retaining-rings";
import { OCCTSprings } from "./springs";
import { ThreadCutter } from "./thread-cutter";

/**
 * Mechanical standard parts as solids, the shapes of what `bitbybit.engineering.mechanical` sizes:
 * `gears`, `fasteners`, `springs`, `bearings`, `keys` and `retainingRings`, with `machining` for the
 * keyways, flats, grooves, threads, knurls and splines cut into shafts and hubs. Each family holds one
 * member per standard, such as `iso` or `din`, whose parts are made in the `unit` asked for.
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
        this.fasteners = new OCCTFasteners(new FastenerShapes(build, threads));
        this.springs = new OCCTSprings(build);
        this.bearings = new OCCTBearings(new BallBearingShapes(build));
        this.keys = new OCCTKeys(new ParallelKeyShapes(build));
        this.retainingRings = new OCCTRetainingRings(new RetainingRingShapes(build));
        this.machining = new OCCTMachining(new MachiningShapes(sketch, build, threads));
    }
}

