import type { BaseBitByBit } from "@bitbybit-dev/base";
import type { OCCTAnalysis } from "../analysis/analysis";
import type { OperationsService } from "../base/operations.service";
import type { OCCTBooleans } from "../booleans";
import type { OCCTOperations } from "../operations";
import type { OCCTShapes } from "../shapes/shapes";
import type { OCCTSketch } from "../sketch/sketch";
import type { OCCTRecipes } from "../recipes/recipes";
import type { OCCTTransforms } from "../transforms";
import { OCCTPartsMechanical } from "./mechanical/mechanical";
import { PartBuilder } from "./part-builder";

/**
 * Standard parts made from their sizes, so a part is asked for by what defines it, such as a gear's
 * module and teeth, a screw's thread size and length or a bearing's designation, instead of being
 * drawn, grouped by discipline: `mechanical` holds gears, fasteners, springs, bearings, keys,
 * retaining rings and machining. Each part also comes as a twin whose faces are named by the part
 * they play, with the frames it is placed by.
 */
export class OCCTParts {
    public readonly mechanical: OCCTPartsMechanical;

    constructor(sketch: OCCTSketch, operations: OCCTOperations, booleans: OCCTBooleans, shapes: OCCTShapes, transforms: OCCTTransforms, analysis: OCCTAnalysis, sweeps: OperationsService, recipes: OCCTRecipes, base: BaseBitByBit) {
        const build = new PartBuilder(shapes, operations, booleans, transforms, analysis, base, sketch, recipes);
        this.mechanical = new OCCTPartsMechanical(sketch, operations, shapes, sweeps, build);
    }
}
