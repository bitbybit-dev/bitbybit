import { ManifoldWorkerManager } from "../../manifold-worker/manifold-worker-manager";
import * as Inputs from "@bitbybit-dev/manifold/lib/api/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldTransforms {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,

    ) { }

    /**
     * Scales a manifold shape with 3D vector
     * @param inputs manifold and scale vector
     * @returns Scaled manifold shape
     * @group transforms
     * @shortname scale 3d
     * @drawable true
     */
    async scale3D(inputs: Inputs.Manifold.Scale3DDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.transforms.scale3D", inputs);
    }

    /**
     * Scales a manifold shape with single factor
     * @param inputs manifold and scale factor
     * @returns Scaled manifold shape
     * @group transforms
     * @shortname scale uniform
     * @drawable true
     */
    async scale(inputs: Inputs.Manifold.ScaleDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.transforms.scale", inputs);
    }

    /**
     * Mirrors a manifold shape over a plane defined by a normal vector
     * @param inputs manifold and normal vector
     * @returns Mirrored manifold shape
     * @group transforms
     * @shortname mirror
     * @drawable true
     */
    async mirror(inputs: Inputs.Manifold.MirrorDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.transforms.mirror", inputs);
    }

    /**
    * Translates a manifold shape along the vector
    * @param inputs manifold and trnaslation vector
    * @returns Translated manifold shape
    * @group transforms
    * @shortname translate
    * @drawable true
    */
    async translate(inputs: Inputs.Manifold.TranslateDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.transforms.translate", inputs);
    }

    /**
    * Translates a manifold shape along by multiple vectors
    * @param inputs manifold and trnaslation vectors
    * @returns Translated manifold shapes
    * @group multiple
    * @shortname translate by vectors
    * @drawable true
    */
    async translateByVectors(inputs: Inputs.Manifold.TranslateByVectorsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.transforms.translateByVectors", inputs);
    }

    /**
     * Translates a manifold shape along x, y, z
     * @param inputs manifold and trnaslation coordinates
     * @returns Translated manifold shape
     * @group transforms
     * @shortname translate xyz
     * @drawable true
     */
    async translateXYZ(inputs: Inputs.Manifold.TranslateXYZDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.transforms.translateXYZ", inputs);
    }

    /**
     * Rotates a manifold shape along the vector containing euler angles
     * @param inputs manifold and rotation vector
     * @returns Rotated manifold shape
     * @group transforms
     * @shortname rotate
     * @drawable true
     */
    async rotate(inputs: Inputs.Manifold.RotateDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.transforms.rotate", inputs);
    }

    /**
     * Rotates a manifold shape along the x y z euler angles
     * @param inputs manifold and rotation eulers
     * @returns Rotated manifold shape
     * @group transforms
     * @shortname rotate xyz
     * @drawable true
     */
    async rotateXYZ(inputs: Inputs.Manifold.RotateXYZDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.transforms.rotateXYZ", inputs);
    }

    /**
     * Transforms a manifold shape by using the 4x4 transformation matrix
     * @param inputs manifold and transformation matrix
     * @returns Transformed manifold shape
     * @group matrix
     * @shortname transform
     * @drawable true
     */
    async transform(inputs: Inputs.Manifold.TransformDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.transforms.transform", inputs);
    }

    /**
     * Transforms a manifold shape by using the 4x4 transformation matrixes
     * @param inputs manifold and transformation matrixes
     * @returns Transformed manifold shape
     * @group matrix
     * @shortname transforms
     * @drawable true
     */
    async transforms(inputs: Inputs.Manifold.TransformsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.transforms.transforms", inputs);
    }

    /**
     * Move the vertices of this Manifold (creating a new one) according to any
     * arbitrary input function. It is easy to create a function that warps a
     * geometrically valid object into one which overlaps, but that is not checked
     * here, so it is up to the user to choose their function with discretion.
     * @param inputs manifold and warp function
     * @returns Warped manifold shape
     * @group transforms
     * @shortname warp
     * @drawable true
     */
    async warp(inputs: Inputs.Manifold.ManifoldWarpDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.transforms.warp", inputs);
    }


}
