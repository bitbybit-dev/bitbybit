import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Moving, turning, scaling, mirroring and warping Manifold cross-sections in the XY plane. Angles
 * are in degrees and rotations turn about the origin; every method returns a new cross-section.
 */
export class CrossSectionTransforms {

    constructor(_wasm: Manifold3D.ManifoldToplevel) {
    }

    /**
     * Scales a cross-section by a separate factor along X and Y, about the origin.
     * @param inputs - The cross-section and the two factors
     * @returns The scaled cross-section
     * @group transforms
     * @shortname scale 2d
     * @drawable true
     * @example
     * ```typescript
     * const stretched = await bitbybit.manifold.crossSection.transforms.scale2D({ crossSection: square, vector: [2, 1] });
     * ```
     */
    scale2D(inputs: Inputs.Manifold.Scale2DCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.scale(inputs.vector);
    }

    /**
     * Scales a cross-section uniformly about the origin by a factor.
     * @param inputs - The cross-section and the factor
     * @returns The scaled cross-section
     * @group transforms
     * @shortname scale uniform
     * @drawable true
     * @example
     * ```typescript
     * const bigger = await bitbybit.manifold.crossSection.transforms.scale({ crossSection: square, factor: 2 });
     * ```
     */
    scale(inputs: Inputs.Manifold.ScaleCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.scale(inputs.factor);
    }

    /**
     * Mirrors a cross-section across the line through the origin that is perpendicular to the given
     * normal.
     * @param inputs - The cross-section and the normal of the mirror line
     * @returns The mirrored cross-section
     * @group transforms
     * @shortname mirror
     * @drawable true
     * @example
     * ```typescript
     * const other = await bitbybit.manifold.crossSection.transforms.mirror({ crossSection: outline, normal: [1, 0] });
     * ```
     */
    mirror(inputs: Inputs.Manifold.MirrorCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.mirror(inputs.normal);
    }

    /**
     * Moves a cross-section by a 2D vector, in model units.
     * @param inputs - The cross-section and the vector to move it by
     * @returns The moved cross-section
     * @group transforms
     * @shortname translate
     * @drawable true
     * @example
     * ```typescript
     * const moved = await bitbybit.manifold.crossSection.transforms.translate({ crossSection: square, vector: [10, 0] });
     * ```
     */
    translate(inputs: Inputs.Manifold.TranslateCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.translate(inputs.vector);
    }

    /**
     * Moves a cross-section by separate distances along X and Y, in model units.
     * @param inputs - The cross-section and the two distances
     * @returns The moved cross-section
     * @group transforms
     * @shortname translate xy
     * @drawable true
     * @example
     * ```typescript
     * const moved = await bitbybit.manifold.crossSection.transforms.translateXY({ crossSection: square, x: 10, y: 5 });
     * ```
     */
    translateXY(inputs: Inputs.Manifold.TranslateXYCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.translate([inputs.x, inputs.y]);
    }

    /**
     * Rotates a cross-section about the origin by an angle in degrees, counterclockwise.
     * @param inputs - The cross-section and the angle in degrees
     * @returns The rotated cross-section
     * @group transforms
     * @shortname rotate
     * @drawable true
     * @example
     * ```typescript
     * const turned = await bitbybit.manifold.crossSection.transforms.rotate({ crossSection: square, degrees: 45 });
     * ```
     */
    rotate(inputs: Inputs.Manifold.RotateCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.rotate(inputs.degrees);
    }

    /**
     * Applies a 3x3 matrix to a cross-section, for any combination of move, turn, scale and shear
     * in the plane.
     * @param inputs - The cross-section and the 3x3 matrix
     * @returns The transformed cross-section
     * @group matrix
     * @shortname transform
     * @drawable true
     * @example
     * ```typescript
     * const moved = await bitbybit.manifold.crossSection.transforms.transform({ crossSection: square, transform: matrix });
     * ```
     */
    transform(inputs: Inputs.Manifold.TransformCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.transform(inputs.transform);
    }

    /**
     * Moves every point of a cross-section with a function of your own that changes the point in
     * place, then fuses the result so any crossings the move introduced are cleaned up.
     * @param inputs - The cross-section and the function that moves each point
     * @returns The warped cross-section
     * @group transforms
     * @shortname warp
     * @drawable true
     * @example
     * ```typescript
     * const wavy = await bitbybit.manifold.crossSection.transforms.warp({
     *     crossSection: square,
     *     warpFunc: (vert) => { vert[1] += Math.sin(vert[0]) * 0.5; },
     * });
     * ```
     */
    warp(inputs: Inputs.Manifold.CrossSectionWarpDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.warp(inputs.warpFunc);
    }

}
