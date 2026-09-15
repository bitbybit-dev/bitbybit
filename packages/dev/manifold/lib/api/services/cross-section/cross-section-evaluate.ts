import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Measuring Manifold cross-sections: area, emptiness, vertex and contour counts and the bounding
 * rectangle. Nothing here changes the cross-section.
 */
export class CrossSectionEvaluate {

    constructor(_wasm: Manifold3D.ManifoldToplevel) {
    }

    /**
     * Measures the area of a cross-section, in square model units, holes excluded.
     * @param inputs - The cross-section
     * @returns The area
     * @group basic
     * @shortname area
     * @drawable false
     * @example
     * ```typescript
     * const area = await bitbybit.manifold.crossSection.evaluate.area({ crossSection: outline });
     * ```
     */
    area(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): number {
        return inputs.crossSection.area();
    }

    /**
     * Tells whether a cross-section has no contours at all.
     * @param inputs - The cross-section
     * @returns True when the cross-section is empty
     * @group basic
     * @shortname is empty
     * @drawable false
     * @example
     * ```typescript
     * const empty = await bitbybit.manifold.crossSection.evaluate.isEmpty({ crossSection: outline });
     * ```
     */
    isEmpty(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): boolean {
        return inputs.crossSection.isEmpty();
    }

    /**
     * Counts the vertices of a cross-section over all its contours.
     * @param inputs - The cross-section
     * @returns The number of vertices
     * @group basic
     * @shortname num vert
     * @drawable false
     * @example
     * ```typescript
     * const vertices = await bitbybit.manifold.crossSection.evaluate.numVert({ crossSection: outline });
     * ```
     */
    numVert(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): number {
        return inputs.crossSection.numVert();
    }

    /**
     * Counts the contours of a cross-section: its outer outlines and its holes.
     * @param inputs - The cross-section
     * @returns The number of contours
     * @group basic
     * @shortname num contour
     * @drawable false
     * @example
     * ```typescript
     * const contours = await bitbybit.manifold.crossSection.evaluate.numContour({ crossSection: plate });
     * ```
     */
    numContour(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): number {
        return inputs.crossSection.numContour();
    }

    /**
     * Finds the rectangle around a cross-section as two 2D points: the minimum corner, then the
     * maximum corner.
     * @param inputs - The cross-section
     * @returns The minimum corner and the maximum corner
     * @group basic
     * @shortname bounds
     * @drawable false
     * @example
     * ```typescript
     * const [min, max] = await bitbybit.manifold.crossSection.evaluate.bounds({ crossSection: outline });
     * ```
     */
    bounds(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Inputs.Base.Vector2[] {
        const bounds = inputs.crossSection.bounds();
        return [bounds.min, bounds.max];
    }

}
