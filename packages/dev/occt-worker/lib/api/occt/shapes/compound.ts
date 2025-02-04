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

    /**
     * Gets the shapes that compound is made of
     * @param inputs OpenCascade shapes
     * @returns OpenCascade compounded shape
     * @group get
     * @shortname get shapes of compound
     * @drawable true
     */
    getShapesOfCompound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSCompoundPointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.compound.getShapesOfCompound", inputs);
    }
}
