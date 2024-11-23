import * as Inputs from "../../../../api/inputs/manifold-inputs";
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

    rotate(inputs: Inputs.Manifold.RotateCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.rotate(inputs.degrees);
    }

    translateXYZ(inputs: Inputs.Manifold.TranslateXYCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.translate(inputs.x, inputs.y);
    }

    transform(inputs: Inputs.Manifold.TransformCrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.transform(inputs.transform);
    }

}