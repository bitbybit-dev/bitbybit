import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class CrossSectionEvaluate {

    constructor(_wasm: Manifold3D.ManifoldToplevel) {
    }

    /**
     * Get area of cross section
     * @param inputs cross section
     * @returns area of cross section
     * @group basic
     * @shortname area
     * @drawable false
     */
    area(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): number {
        return inputs.crossSection.area();
    }

    /**
     * Check if cross section is empty
     * @param inputs cross section
     * @returns boolean indicating emptyness
     * @group basic
     * @shortname is empty
     * @drawable false
     */
    isEmpty(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): boolean {
        return inputs.crossSection.isEmpty();
    }

    /**
     * Get number of vertices in cross section
     * @param inputs cross section
     * @returns number of vertices of cross section
     * @group basic
     * @shortname num vert
     * @drawable false
     */
    numVert(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): number {
        return inputs.crossSection.numVert();
    }

    /**
     * Get number of contours in cross section
     * @param inputs cross section
     * @returns number of contour of cross section
     * @group basic
     * @shortname num contour
     * @drawable false
     */
    numContour(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): number {
        return inputs.crossSection.numContour();
    }

    /**
     * Get the bounds of the contour as a rectangle. Output is given in two vec2 points in the array. First array is the min point and second array is the max point.
     * @param inputs cross section
     * @returns bounds of cross section
     * @group basic
     * @shortname bounds
     * @drawable false
     */
    bounds(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Inputs.Base.Vector2[] {
        const bounds = inputs.crossSection.bounds();
        return [bounds.min, bounds.max];
    }

}
