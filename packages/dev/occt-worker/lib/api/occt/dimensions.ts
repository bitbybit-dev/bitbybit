import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";


export class OCCTDimensions {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager
    ) {
    }

    /**
    * Creates simple linear length dimension between two points - measuring units. You decide what kind of units you re using by providing a suffix.
    * @param inputs two points, direction, label size, label normal direction, offset, and unit suffix, decimal rounding place
    * @returns compound wires representing dimensions
    * @group simple
    * @shortname linear dimension
    * @drawable true
    */
    simpleLinearLengthDimension(inputs: Inputs.OCCT.SimpleLinearLengthDimensionDto): Promise<Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("dimensions.simpleLinearLengthDimension", inputs);
    }

    /**
     * Creates simple angular dimension. By default we output degrees, but you can opt to use radians.
     * @param inputs a center, two directions, radius and various label parameters
     * @returns compound wires representing dimension
     * @group simple
     * @shortname angular dimension
     * @drawable true
     */
    simpleAngularDimension(inputs: Inputs.OCCT.SimpleAngularDimensionDto): Promise<Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("dimensions.simpleAngularDimension", inputs);
    }

    /**
     * Creates pin label. It can be used to explain things about the models or mark important things in the 3D scene.
     * @param inputs a start and end point, direction and parameters for the label
     * @returns compound wires representing dimension
     * @group simple
     * @shortname pin with label
     * @drawable true
     */
    pinWithLabel(inputs: Inputs.OCCT.PinWithLabelDto): Promise<Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("dimensions.pinWithLabel", inputs);
    }
}
