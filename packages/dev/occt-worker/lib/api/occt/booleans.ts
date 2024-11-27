import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";

export class OCCTBooleans {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Joins separate objects
     * @param inputs Objects to join
     * @returns OpenCascade joined shape
     * @group booleans
     * @shortname union
     * @drawable true
     */
    union(inputs: Inputs.OCCT.UnionDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("booleans.union", inputs);
    }

    /**
     * Does boolean difference operation between a main shape and given shapes
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     * @group booleans
     * @shortname difference
     * @drawable true
     */
    difference(inputs: Inputs.OCCT.DifferenceDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("booleans.difference", inputs);
    }

    /**
     * Does boolean intersection operation between a main shape and given shapes
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade intersection of shapes
     * @group booleans
     * @shortname intersection
     * @drawable true
     */
    intersection(inputs: Inputs.OCCT.IntersectionDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("booleans.intersection", inputs);
    }
}
