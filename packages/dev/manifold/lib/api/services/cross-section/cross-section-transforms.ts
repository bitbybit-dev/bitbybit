import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Contains various functions for transforming cross section from Manifold library
 * https://github.com/elalish/manifold Thanks Manifold community for developing this kernel
 */
export class CrossSectionTransforms {

    constructor(_wasm: Manifold3D.ManifoldToplevel) {
    }

    /**
     * Scales a cross section shape with 2D vector
     * @param inputs cross section and scale vector
     * @returns Scaled cross section shape
     * @group transforms
     * @shortname scale 2d
     * @drawable true
     */
    scale2D(inputs: Inputs.Manifold.Scale2DCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.scale(inputs.vector);
    }

    /**
     * Scales a cross section shape with single factor
     * @param inputs cross section and scale factor
     * @returns Scaled cross section shape
     * @group transforms
     * @shortname scale uniform
     * @drawable true
     */
    scale(inputs: Inputs.Manifold.ScaleCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.scale(inputs.factor);
    }

    /**
     * Mirrors a cross section shape over a plane defined by a normal vector
     * @param inputs cross section and normal vector
     * @returns Mirrored cross section shape
     * @group transforms
     * @shortname mirror
     * @drawable true
     */
    mirror(inputs: Inputs.Manifold.MirrorCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.mirror(inputs.normal);
    }

    /**
     * Translates a cross section shape along the vector
     * @param inputs cross section and trnaslation vector
     * @returns Translated cross section shape
     * @group transforms
     * @shortname translate
     * @drawable true
     */
    translate(inputs: Inputs.Manifold.TranslateCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.translate(inputs.vector);
    }

    /**
     * Translates a cross section shape along x, y
     * @param inputs cross section and trnaslation coordinates
     * @returns Translated cross section shape
     * @group transforms
     * @shortname translate xy
     * @drawable true
     */
    translateXY(inputs: Inputs.Manifold.TranslateXYCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.translate([inputs.x, inputs.y]);
    }

    /**
     * Rotates a cross section shape along the containing degrees
     * @param inputs cross section and rotation degrees
     * @returns Rotated cross section shape
     * @group transforms
     * @shortname rotate
     * @drawable true
     */
    rotate(inputs: Inputs.Manifold.RotateCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.rotate(inputs.degrees);
    }

    /**
     * Transforms a cross section shape by using the 3x3 transformation matrix
     * @param inputs cross section and transformation matrix
     * @returns Transformed cross section shape
     * @group matrix
     * @shortname transform
     * @drawable true
     */
    transform(inputs: Inputs.Manifold.TransformCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.transform(inputs.transform);
    }

    /**
     * Move the vertices of this CrossSection (creating a new one) according to
     * any arbitrary input function, followed by a union operation (with a
     * Positive fill rule) that ensures any introduced intersections are not
     * included in the result.
     * @param inputs cross section and warp function
     * @returns Warped cross section shape
     * @group transforms
     * @shortname warp
     * @drawable true
     */
    warp(inputs: Inputs.Manifold.CrossSectionWarpDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.warp(inputs.warpFunc);
    }

}
