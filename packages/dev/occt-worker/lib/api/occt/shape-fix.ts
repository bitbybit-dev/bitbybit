import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";


export class OCCTShapeFix {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
    * Performs the basic shape repair
    * @param inputs the shape to be fixed and some options
    * @returns OpenCascade fixed shape
    * @group shape
    * @shortname basic shape repair
    * @drawable true
    */
    basicShapeRepair(inputs: Inputs.OCCT.BasicShapeRepairDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapeFix.basicShapeRepair", inputs);
    }

    /**
    * Fix small edge on wire
    * @param inputs the wire to be fixed and some options
    * @returns OpenCascade fixed wire
    * @group wire
    * @shortname fix small edge
    * @drawable true
    */
    fixSmallEdgeOnWire(inputs: Inputs.OCCT.FixSmallEdgesInWireDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapeFix.fixSmallEdgeOnWire", inputs);
    }

    /**
     * Fix edge orientations along wire
     * @param inputs the wire to be fixed and some options
     * @returns OpenCascade fixed wire
     * @group wire
     * @shortname fix edge orientations
     * @drawable true
     */
    fixEdgeOrientationsAlongWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapeFix.fixEdgeOrientationsAlongWire", inputs);
    }

}
