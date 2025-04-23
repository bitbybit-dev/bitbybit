import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";


export class OCCTDimensions {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager
    ) {
    }
    
    /**
    * Creates simple linear length dimension between two points - measuring units
    * @param inputs two points, direction, label size, label normal direction, offset, and unit suffix, decimal rounding place
    * @returns compound wires representing dimensions
    * @group simple
    * @shortname linear dimension
    * @drawable true
    */
    simpleLinearLengthDimension(inputs: Inputs.OCCT.SimpleLinearLengthDimensionDto): Promise<Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("dimensions.simpleLinearLengthDimension", inputs);
    }
}
