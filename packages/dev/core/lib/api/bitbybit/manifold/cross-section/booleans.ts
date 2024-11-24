
import { ManifoldWorkerManager } from "../../../../workers/manifold/manifold-worker-manager";
import * as Inputs from "../../../inputs/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class CrossSectionBooleans {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,

    ) { }

    /**
     * Subtract two cross sections
     * @param inputs two cross sections
     * @returns subtracted cross section
     * @group a to b
     * @shortname subtract
     * @drawable true
     */
    async subtract(inputs: Inputs.Manifold.TwoCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.booleans.subtract", inputs);
    }

    /**
     * Add two cross sections
     * @param inputs two cross sections
     * @returns unioned cross section
     * @group a to b
     * @shortname add
     * @drawable true
     */
    async add(inputs: Inputs.Manifold.TwoCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.booleans.add", inputs);
    }

    /**
     * Intersect two cross sections
     * @param inputs two cross sections
     * @returns intersected cross section
     * @group a to b
     * @shortname intersect
     * @drawable true
     */
    async intersect(inputs: Inputs.Manifold.TwoCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.booleans.intersect", inputs);
    }

    /**
     * Difference of two cross sections
     * @param inputs two cross sections
     * @returns difference of two cross sections
     * @group 2 cross sections
     * @shortname difference 2 cs
     * @drawable true
     */
    async differenceTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.booleans.differenceTwo", inputs);
    }

    /**
     * Union of two cross sections
     * @param inputs two cross sections
     * @returns union of two cross sections
     * @group 2 cross sections
     * @shortname union 2 cs
     * @drawable true
     */
    async unionTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.booleans.unionTwo", inputs);
    }

    /**
     * Intersection of two cross sections
     * @param inputs two shapes
     * @returns intersection of two cross sections
     * @group 2 cross sections
     * @shortname intersect 2 cs
     * @drawable true
     */
    async intersectionTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.booleans.intersectionTwo", inputs);
    }

    /**
     * Difference of multiple cross sections
     * @param inputs multiple cross sections
     * @returns difference of cross sections
     * @group multiple
     * @shortname diff cross sections
     * @drawable true
     */
    async difference(inputs: Inputs.Manifold.CrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.booleans.difference", inputs);
    }

    /**
     * Union of multiple cross sections
     * @param inputs multiple cross sections
     * @returns union of two cross sections
     * @group multiple
     * @shortname union cross sections
     * @drawable true
     */
    async union(inputs: Inputs.Manifold.CrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.booleans.union", inputs);
    }

    /**
     * Intersection of multiple cross sections
     * @param inputs two cross sections
     * @returns intersection of multiple cross sections
     * @group multiple
     * @shortname intersection cross sections
     * @drawable true
     */
    async intersection(inputs: Inputs.Manifold.CrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.booleans.intersection", inputs);
    }

}
