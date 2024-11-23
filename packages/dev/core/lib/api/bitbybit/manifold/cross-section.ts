
import { ManifoldWorkerManager } from "../../../workers/manifold/manifold-worker-manager";
import * as Inputs from "../../inputs/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldCrossSection{

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,

    ) { }

    /**
     * Create a 2D square cross section
     * @param inputs Square parameters
     * @returns square cross section
     * @group primitives
     * @shortname square
     * @drawable true
     */
    async square(inputs: Inputs.Manifold.SquareDto): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.square", inputs);
    }

}
