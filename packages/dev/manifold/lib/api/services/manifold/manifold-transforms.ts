import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldTransforms {

    constructor(_wasm: Manifold3D.ManifoldToplevel) {
    }

    /**
     * Scales a manifold shape with 3D vector
     * @param inputs manifold and scale vector
     * @returns Scaled manifold shape
     * @group transforms
     * @shortname scale 3d
     * @drawable true
     */
    scale3D(inputs: Inputs.Manifold.Scale3DDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.scale(inputs.vector);
    }

    /**
     * Scales a manifold shape with single factor
     * @param inputs manifold and scale factor
     * @returns Scaled manifold shape
     * @group transforms
     * @shortname scale uniform
     * @drawable true
     */
    scale(inputs: Inputs.Manifold.Scale3DDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.scale(inputs.vector);
    }

    /**
     * Mirrors a manifold shape over a plane defined by a normal vector
     * @param inputs manifold and normal vector
     * @returns Mirrored manifold shape
     * @group transforms
     * @shortname mirror
     * @drawable true
     */
    mirror(inputs: Inputs.Manifold.MirrorDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.mirror(inputs.normal);
    }

    /**
     * Translates a manifold shape along the vector
     * @param inputs manifold and trnaslation vector
     * @returns Translated manifold shape
     * @group transforms
     * @shortname translate
     * @drawable true
     */
    translate(inputs: Inputs.Manifold.TranslateDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.translate(inputs.vector);
    }

    /**
     * Translates a manifold shape along by multiple vectors
     * @param inputs manifold and trnaslation vectors
     * @returns Translated manifold shapes
     * @group multiple
     * @shortname translate by vectors
     * @drawable true
     */
    translateByVectors(inputs: Inputs.Manifold.TranslateByVectorsDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        return inputs.vectors.map(vector => {
            return inputs.manifold.translate(vector);
        });
    }

    /**
     * Rotates a manifold shape along the vector containing euler angles
     * @param inputs manifold and rotation vector
     * @returns Rotated manifold shape
     * @group transforms
     * @shortname rotate
     * @drawable true
     */
    rotate(inputs: Inputs.Manifold.RotateDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.rotate(inputs.vector);
    }

    /**
     * Rotates a manifold shape along the x y z euler angles
     * @param inputs manifold and rotation eulers
     * @returns Rotated manifold shape
     * @group transforms
     * @shortname rotate xyz
     * @drawable true
     */
    rotateXYZ(inputs: Inputs.Manifold.RotateXYZDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.rotate(inputs.x, inputs.y, inputs.z);
    }

    /**
     * Translates a manifold shape along x, y, z
     * @param inputs manifold and trnaslation coordinates
     * @returns Translated manifold shape
     * @group transforms
     * @shortname translate xyz
     * @drawable true
     */
    translateXYZ(inputs: Inputs.Manifold.TranslateXYZDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.translate(inputs.x, inputs.y, inputs.z);
    }

    /**
     * Transforms a manifold shape by using the 4x4 transformation matrix
     * @param inputs manifold and transformation matrix
     * @returns Transformed manifold shape
     * @group matrix
     * @shortname transform
     * @drawable true
     */
    transform(inputs: Inputs.Manifold.TransformDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.transform(inputs.transform);
    }

    /**
     * Transforms a manifold shape by using the 4x4 transformation matrixes
     * @param inputs manifold and transformation matrixes
     * @returns Transformed manifold shape
     * @group matrix
     * @shortname transforms
     * @drawable true
     */
    transforms(inputs: Inputs.Manifold.TransformsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        let currentShape = inputs.manifold;
        //potentially leaks in betweens...
        const transformedShapes: Manifold3D.Manifold[] = [];
        inputs.transforms.forEach(transform => {
            currentShape = currentShape.transform(transform);
            transformedShapes.push(currentShape);
        });
        const res = transformedShapes.pop();
        if (!res) {
            throw new Error("At least one transform is required");
        }
        transformedShapes.forEach(shape => {
            shape.delete();
        });
        return res;
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
    warp(inputs: Inputs.Manifold.ManifoldWarpDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.warp(inputs.warpFunc);
    }
}
