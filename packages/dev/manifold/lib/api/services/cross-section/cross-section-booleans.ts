import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class CrossSectionBooleans {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    /**
     * Subtract two cross sections
     * @param inputs two cross sections
     * @returns subtracted cross section
     * @group a to b
     * @shortname subtract
     * @drawable true
     */
    subtract(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection1.subtract(inputs.crossSection2);
    }

    /**
     * Add two cross sections
     * @param inputs two cross sections
     * @returns unioned cross section
     * @group a to b
     * @shortname add
     * @drawable true
     */
    add(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection1.add(inputs.crossSection2);
    }

    /**
     * Intersect two cross sections
     * @param inputs two cross sections
     * @returns intersected cross section
     * @group a to b
     * @shortname intersect
     * @drawable true
     */
    intersect(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection1.intersect(inputs.crossSection2);
    }

    /**
     * Difference of two cross sections
     * @param inputs two cross sections
     * @returns difference of two cross sections
     * @group 2 cross sections
     * @shortname difference 2 cs
     * @drawable true
     */
    differenceTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { difference } = CrossSection;
        return difference(inputs.crossSection1, inputs.crossSection2);
    }

    /**
     * Difference of multiple cross sections
     * @param inputs multiple cross sections
     * @returns difference of cross sections
     * @group multiple
     * @shortname diff cross sections
     * @drawable true
     */
    difference(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { difference } = CrossSection;
        return difference(inputs.crossSections);
    }

    /**
     * Union of two cross sections
     * @param inputs two cross sections
     * @returns union of two cross sections
     * @group 2 cross sections
     * @shortname union 2 cs
     * @drawable true
     */
    unionTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { union } = CrossSection;
        return union(inputs.crossSection1, inputs.crossSection2);
    }

    /**
     * Union of multiple cross sections
     * @param inputs multiple cross sections
     * @returns union of two cross sections
     * @group multiple
     * @shortname union cross sections
     * @drawable true
     */
    union(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { union } = CrossSection;
        return union(inputs.crossSections);
    }

    /**
     * Intersection of two cross sections
     * @param inputs two shapes
     * @returns intersection of two cross sections
     * @group 2 cross sections
     * @shortname intersect 2 cs
     * @drawable true
     */
    intersectionTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { intersection } = CrossSection;
        return intersection(inputs.crossSection1, inputs.crossSection2);
    }

    /**
     * Intersection of multiple cross sections
     * @param inputs two cross sections
     * @returns intersection of multiple cross sections
     * @group multiple
     * @shortname intersection cross sections
     * @drawable true
     */
    intersection(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { intersection } = CrossSection;
        return intersection(inputs.crossSections);
    }

}
