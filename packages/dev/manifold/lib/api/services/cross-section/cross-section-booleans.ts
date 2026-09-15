import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Combining Manifold cross-sections: fusing, cutting and intersecting two or many flat outlines at
 * once. The two-shape and many-shape forms give the same results and exist for convenience; every
 * method returns a new cross-section and leaves the inputs as they are.
 */
export class CrossSectionBooleans {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    /**
     * Cuts the second cross-section out of the first, leaving what remains of the first.
     * @param inputs - The cross-section to cut from and the one to cut with
     * @returns The first minus the second
     * @group a to b
     * @shortname subtract
     * @drawable true
     * @example
     * ```typescript
     * const ring = await bitbybit.manifold.crossSection.booleans.subtract({ crossSection1: outerDisc, crossSection2: innerDisc });
     * ```
     */
    subtract(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection1.subtract(inputs.crossSection2);
    }

    /**
     * Fuses two cross-sections into one outline, holes and all.
     * @param inputs - The two cross-sections
     * @returns The fused cross-section
     * @group a to b
     * @shortname add
     * @drawable true
     * @example
     * ```typescript
     * const fused = await bitbybit.manifold.crossSection.booleans.add({ crossSection1: square, crossSection2: disc });
     * ```
     */
    add(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection1.add(inputs.crossSection2);
    }

    /**
     * Keeps only the area two cross-sections share, dropping everything else.
     * @param inputs - The two cross-sections
     * @returns The shared area
     * @group a to b
     * @shortname intersect
     * @drawable true
     * @example
     * ```typescript
     * const common = await bitbybit.manifold.crossSection.booleans.intersect({ crossSection1: square, crossSection2: disc });
     * ```
     */
    intersect(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection1.intersect(inputs.crossSection2);
    }

    /**
     * Cuts the second cross-section out of the first, the same as `subtract`.
     * @param inputs - The cross-section to cut from and the one to cut with
     * @returns The first minus the second
     * @group 2 cross sections
     * @shortname difference 2 cs
     * @drawable true
     * @example
     * ```typescript
     * const ring = await bitbybit.manifold.crossSection.booleans.differenceTwo({ crossSection1: outerDisc, crossSection2: innerDisc });
     * ```
     */
    differenceTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { difference } = CrossSection;
        return difference(inputs.crossSection1, inputs.crossSection2);
    }

    /**
     * Fuses two cross-sections into one, the same as `add`.
     * @param inputs - The two cross-sections
     * @returns The fused cross-section
     * @group 2 cross sections
     * @shortname union 2 cs
     * @drawable true
     * @example
     * ```typescript
     * const fused = await bitbybit.manifold.crossSection.booleans.unionTwo({ crossSection1: square, crossSection2: disc });
     * ```
     */
    unionTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { union } = CrossSection;
        return union(inputs.crossSection1, inputs.crossSection2);
    }

    /**
     * Keeps only the area two cross-sections share, the same as `intersect`.
     * @param inputs - The two cross-sections
     * @returns The shared area
     * @group 2 cross sections
     * @shortname intersect 2 cs
     * @drawable true
     * @example
     * ```typescript
     * const common = await bitbybit.manifold.crossSection.booleans.intersectionTwo({ crossSection1: square, crossSection2: disc });
     * ```
     */
    intersectionTwo(inputs: Inputs.Manifold.TwoCrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { intersection } = CrossSection;
        return intersection(inputs.crossSection1, inputs.crossSection2);
    }

    /**
     * Cuts every further cross-section in the list out of the first one.
     * @param inputs - The cross-sections, the first being the one cut from
     * @returns The first minus all the others
     * @group multiple
     * @shortname diff cross sections
     * @drawable true
     * @example
     * ```typescript
     * const plate = await bitbybit.manifold.crossSection.booleans.difference({ crossSections: [square, hole1, hole2] });
     * ```
     */
    difference(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { difference } = CrossSection;
        return difference(inputs.crossSections);
    }

    /**
     * Fuses all the cross-sections in a list into one.
     * @param inputs - The cross-sections
     * @returns The fused cross-section
     * @group multiple
     * @shortname union cross sections
     * @drawable true
     * @example
     * ```typescript
     * const fused = await bitbybit.manifold.crossSection.booleans.union({ crossSections: [square, disc, rectangle] });
     * ```
     */
    union(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { union } = CrossSection;
        return union(inputs.crossSections);
    }

    /**
     * Keeps only the area all the cross-sections in a list share.
     * @param inputs - The cross-sections
     * @returns The area common to all of them
     * @group multiple
     * @shortname intersection cross sections
     * @drawable true
     * @example
     * ```typescript
     * const common = await bitbybit.manifold.crossSection.booleans.intersection({ crossSections: [square, disc] });
     * ```
     */
    intersection(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { intersection } = CrossSection;
        return intersection(inputs.crossSections);
    }

}
