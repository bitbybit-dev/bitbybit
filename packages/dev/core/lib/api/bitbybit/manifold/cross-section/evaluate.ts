
import { ManifoldWorkerManager } from "../../../../workers/manifold/manifold-worker-manager";
import * as Inputs from "../../../inputs/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class CrossSectionEvaluate {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
    ) { }

    /**
     * Get area of cross section
     * @param inputs cross section
     * @returns area of cross section
     * @group basic
     * @shortname area
     * @drawable false
     */
    async area(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.evaluate.area", inputs);
    }

    /**
     * Check if cross section is empty
     * @param inputs cross section
     * @returns boolean indicating emptyness
     * @group basic
     * @shortname is empty
     * @drawable false
     */
    async isEmpty(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<boolean> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.evaluate.isEmpty", inputs);
    }

    /**
     * Get number of vertices in cross section
     * @param inputs cross section
     * @returns number of vertices of cross section
     * @group basic
     * @shortname num vert
     * @drawable false
     */
    async numVert(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.evaluate.numVert", inputs);
    }

    /**
     * Get number of contours in cross section
     * @param inputs cross section
     * @returns number of contour of cross section
     * @group basic
     * @shortname num contour
     * @drawable false
     */
    async numContour(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.evaluate.numContour", inputs);
    }

    /**
     * Get the bounds of the contour as a rectangle. Output is given in two vec2 points in the array. First array is the min point and second array is the max point.
     * @param inputs cross section
     * @returns bounds of cross section
     * @group basic
     * @shortname bounds
     * @drawable false
     */
    async bounds(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Base.Vector2[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.evaluate.bounds", inputs);
    }

}
