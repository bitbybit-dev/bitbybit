
import { ManifoldWorkerManager } from "../../../../workers/manifold/manifold-worker-manager";
import * as Inputs from "../../../inputs/inputs";

/**
 * Contains various functions for transforming cross section from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class CrossSectionTransforms {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
    ) { }

    /**
     * Scales a cross section shape with 2D vector
     * @param inputs cross section and scale vector
     * @returns Scaled cross section shape
     * @group transforms
     * @shortname scale 2d
     * @drawable true
     */
    async scale2D(inputs: Inputs.Manifold.Scale2DCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.transforms.scale2D", inputs);
    }

    /**
     * Scales a cross section shape with single factor
     * @param inputs cross section and scale factor
     * @returns Scaled cross section shape
     * @group transforms
     * @shortname scale uniform
     * @drawable true
     */
    async scale(inputs: Inputs.Manifold.ScaleCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.transforms.scale", inputs);
    }

    /**
     * Mirrors a cross section shape over a plane defined by a normal vector
     * @param inputs cross section and normal vector
     * @returns Mirrored cross section shape
     * @group transforms
     * @shortname mirror
     * @drawable true
     */
    async mirror(inputs: Inputs.Manifold.MirrorCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.transforms.mirror", inputs);
    }

    /**
    * Translates a cross section shape along the vector
    * @param inputs cross section and trnaslation vector
    * @returns Translated cross section shape
    * @group transforms
    * @shortname translate
    * @drawable true
    */
    async translate(inputs: Inputs.Manifold.TranslateCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.transforms.translate", inputs);
    }

    /**
     * Translates a cross section shape along x, y
     * @param inputs cross section and trnaslation coordinates
     * @returns Translated cross section shape
     * @group transforms
     * @shortname translate xy
     * @drawable true
     */
    async translateXY(inputs: Inputs.Manifold.TranslateXYCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.transforms.translateXY", inputs);
    }

    /**
     * Rotates a cross section shape along the containing degrees
     * @param inputs cross section and rotation degrees
     * @returns Rotated cross section shape
     * @group transforms
     * @shortname rotate
     * @drawable true
     */
    async rotate(inputs: Inputs.Manifold.RotateCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.transforms.rotate", inputs);
    }

    /**
     * Transforms a cross section shape by using the 3x3 transformation matrix
     * @param inputs cross section and transformation matrix
     * @returns Transformed cross section shape
     * @group matrix
     * @shortname transform
     * @drawable true
     */
    async transform(inputs: Inputs.Manifold.TransformCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.transforms.transform", inputs);
    }

}
