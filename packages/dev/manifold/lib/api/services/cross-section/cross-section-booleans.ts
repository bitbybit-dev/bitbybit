import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

export class CrossSectionBooleans {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    subtract(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection1.subtract(inputs.crossSection2);
    }

    add(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection1.add(inputs.crossSection2);
    }

    intersect(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection1.intersect(inputs.crossSection2);
    }

    differenceTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { difference } = CrossSection;
        return difference(inputs.crossSection1, inputs.crossSection2);
    }

    difference(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { difference } = CrossSection;
        return difference(inputs.crossSections);
    }

    unionTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { union } = CrossSection;
        return union(inputs.crossSection1, inputs.crossSection2);
    }

    union(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { union } = CrossSection;
        return union(inputs.crossSections);
    }

    intersectionTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { intersection } = CrossSection;
        return intersection(inputs.crossSection1, inputs.crossSection2);
    }

    intersection(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { intersection } = CrossSection;
        return intersection(inputs.crossSections);
    }

}
