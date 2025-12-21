import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

export class CrossSectionTransforms {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    scale2D(inputs: Inputs.Manifold.Scale2DCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.scale(inputs.vector);
    }

    scale(inputs: Inputs.Manifold.ScaleCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.scale(inputs.factor);
    }

    mirror(inputs: Inputs.Manifold.MirrorCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.mirror(inputs.normal);
    }

    translate(inputs: Inputs.Manifold.TranslateCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.translate(inputs.vector);
    }

    translateXY(inputs: Inputs.Manifold.TranslateXYCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.translate([inputs.x, inputs.y]);
    }

    rotate(inputs: Inputs.Manifold.RotateCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.rotate(inputs.degrees);
    }

    transform(inputs: Inputs.Manifold.TransformCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.transform(inputs.transform);
    }

    warp(inputs: Inputs.Manifold.CrossSectionWarpDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.warp(inputs.warpFunc);
    }

}
