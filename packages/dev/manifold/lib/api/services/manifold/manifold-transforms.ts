import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Moving, turning, scaling, mirroring and warping Manifold solids. The kernel combines transforms
 * lazily, so chaining them is cheap; angles are in degrees, and rotations turn about the origin, X
 * first, then Y, then Z. Every method returns a new solid.
 */
export class ManifoldTransforms {

    constructor(_wasm: Manifold3D.ManifoldToplevel) {
    }

    /**
     * Scales a solid by a separate factor along X, Y and Z, about the origin.
     * @param inputs - The solid and the three factors
     * @returns The scaled solid
     * @group transforms
     * @shortname scale 3d
     * @drawable true
     * @example
     * ```typescript
     * const stretched = await bitbybit.manifold.manifold.transforms.scale3D({ manifold: cube, vector: [1, 2, 1] });
     * ```
     */
    scale3D(inputs: Inputs.Manifold.Scale3DDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.scale(inputs.vector);
    }

    /**
     * Scales a solid by a factor per axis, about the origin; it takes the same inputs as `scale3D`,
     * so use equal factors for a uniform scale.
     * @param inputs - The solid and the three factors
     * @returns The scaled solid
     * @group transforms
     * @shortname scale uniform
     * @drawable true
     * @example
     * ```typescript
     * const bigger = await bitbybit.manifold.manifold.transforms.scale({ manifold: cube, vector: [2, 2, 2] });
     * ```
     */
    scale(inputs: Inputs.Manifold.Scale3DDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.scale(inputs.vector);
    }

    /**
     * Mirrors a solid across the plane through the origin with the given normal.
     *
     * A zero-length normal gives an empty solid.
     * @param inputs - The solid and the normal of the mirror plane
     * @returns The mirrored solid
     * @group transforms
     * @shortname mirror
     * @drawable true
     * @example
     * ```typescript
     * const other = await bitbybit.manifold.manifold.transforms.mirror({ manifold: shape, normal: [1, 0, 0] });
     * ```
     */
    mirror(inputs: Inputs.Manifold.MirrorDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.mirror(inputs.normal);
    }

    /**
     * Moves a solid by a vector, in model units.
     * @param inputs - The solid and the vector to move it by
     * @returns The moved solid
     * @group transforms
     * @shortname translate
     * @drawable true
     * @example
     * ```typescript
     * const moved = await bitbybit.manifold.manifold.transforms.translate({ manifold: cube, vector: [10, 0, 0] });
     * ```
     */
    translate(inputs: Inputs.Manifold.TranslateDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.translate(inputs.vector);
    }

    /**
     * Makes one moved copy of a solid per vector, for laying out repeats.
     * @param inputs - The solid and the vectors to move copies by
     * @returns One moved copy per vector, in the same order
     * @group multiple
     * @shortname translate by vectors
     * @drawable true
     * @example
     * ```typescript
     * const row = await bitbybit.manifold.manifold.transforms.translateByVectors({ manifold: cube, vectors: [[0, 0, 0], [10, 0, 0], [20, 0, 0]] });
     * ```
     */
    translateByVectors(inputs: Inputs.Manifold.TranslateByVectorsDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        return inputs.vectors.map(vector => {
            return inputs.manifold.translate(vector);
        });
    }

    /**
     * Moves a solid by separate distances along X, Y and Z, in model units.
     * @param inputs - The solid and the three distances
     * @returns The moved solid
     * @group transforms
     * @shortname translate xyz
     * @drawable true
     * @example
     * ```typescript
     * const moved = await bitbybit.manifold.manifold.transforms.translateXYZ({ manifold: cube, x: 10, y: 0, z: 5 });
     * ```
     */
    translateXYZ(inputs: Inputs.Manifold.TranslateXYZDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.translate(inputs.x, inputs.y, inputs.z);
    }

    /**
     * Rotates a solid about the origin by Euler angles in degrees: first about X, then Y, then Z.
     *
     * Multiples of 90 degrees are exact, with no rounding error.
     * @param inputs - The solid and the three angles in degrees
     * @returns The rotated solid
     * @group transforms
     * @shortname rotate
     * @drawable true
     * @example
     * ```typescript
     * const turned = await bitbybit.manifold.manifold.transforms.rotate({ manifold: cube, vector: [0, 0, 45] });
     * ```
     */
    rotate(inputs: Inputs.Manifold.RotateDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.rotate(inputs.vector);
    }

    /**
     * Rotates a solid about the origin by separate angles in degrees about X, then Y, then Z.
     *
     * Multiples of 90 degrees are exact, with no rounding error.
     * @param inputs - The solid and the three angles in degrees
     * @returns The rotated solid
     * @group transforms
     * @shortname rotate xyz
     * @drawable true
     * @example
     * ```typescript
     * const turned = await bitbybit.manifold.manifold.transforms.rotateXYZ({ manifold: cube, x: 0, y: 0, z: 45 });
     * ```
     */
    rotateXYZ(inputs: Inputs.Manifold.RotateXYZDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.rotate(inputs.x, inputs.y, inputs.z);
    }

    /**
     * Applies a 4x4 matrix to a solid.
     *
     * The matrix is column-major, 16 numbers with the translation at indexes 12 to 14; the kernel
     * reads it as a 3x4 affine transform and ignores the last row.
     * @param inputs - The solid and the matrix
     * @returns The transformed solid
     * @group matrix
     * @shortname transform
     * @drawable true
     * @example
     * ```typescript
     * const moved = await bitbybit.manifold.manifold.transforms.transform({ manifold: cube, transform: matrix });
     * ```
     */
    transform(inputs: Inputs.Manifold.TransformDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.transform(inputs.transform);
    }

    /**
     * Applies a list of 4x4 matrices to a solid one after another, first to last, and returns the
     * final result.
     *
     * An empty list throws an error.
     * @param inputs - The solid and the matrices
     * @returns The solid after all the matrices
     * @group matrix
     * @shortname transforms
     * @drawable true
     * @example
     * ```typescript
     * const placed = await bitbybit.manifold.manifold.transforms.transforms({ manifold: cube, transforms: [turn, move] });
     * ```
     */
    transforms(inputs: Inputs.Manifold.TransformsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        let currentShape = inputs.manifold;
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
     * Moves every vertex of a solid with a function of your own that changes the vertex position in
     * place, for bends, tapers and other free deformations.
     *
     * The mesh connectivity stays the same and nothing checks that the result still makes sense, so
     * a function that folds the surface through itself gives a broken solid.
     * @param inputs - The solid and the function that moves each vertex
     * @returns The warped solid
     * @group transforms
     * @shortname warp
     * @drawable true
     * @example
     * ```typescript
     * const bent = await bitbybit.manifold.manifold.transforms.warp({
     *     manifold: cube,
     *     warpFunc: (vert) => { vert[0] += vert[2] * 0.2; },
     * });
     * ```
     */
    warp(inputs: Inputs.Manifold.ManifoldWarpDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.warp(inputs.warpFunc);
    }
}
