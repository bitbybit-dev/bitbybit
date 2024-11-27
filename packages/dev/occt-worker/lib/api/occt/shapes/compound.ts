import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

export class OCCTCompound {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Makes the compound shape, which can include any kind of shapes
     * @param inputs OpenCascade shapes
     * @returns OpenCascade compounded shape
     * @group create
     * @shortname make
     * @drawable true
     */
    makeCompound(inputs: Inputs.OCCT.CompoundShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.compound.makeCompound", inputs);
    }

}
