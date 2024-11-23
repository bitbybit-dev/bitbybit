
import { ManifoldWorkerManager } from "../../../../workers/manifold/manifold-worker-manager";
import * as Inputs from "../../../inputs/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class CrossSectionOperations {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
    ) { }

    /**
     * Extrude the cross section to create a 3D shape
     * @param inputs cross section and extrusion parameters
     * @returns extruded manifold shape
     * @group basic
     * @shortname extrude
     * @drawable true
     */
    async extrude(inputs: Inputs.Manifold.ExtrudeDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.operations.extrude", inputs);
    }

    /**
     * Revolve the cross section to create a 3D shape
     * @param inputs cross section and extrusion parameters
     * @returns extruded manifold shape
     * @group basic
     * @shortname revolve
     * @drawable true
     */
    async revolve(inputs: Inputs.Manifold.RevolveDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.operations.revolve", inputs);
    }


}
