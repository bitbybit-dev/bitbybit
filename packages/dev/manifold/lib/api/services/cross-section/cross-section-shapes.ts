import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Contains various functions for making shapes Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class CrossSectionShapes {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    /**
     * Create a 2d cross-section from a set of contours (complex polygons). A
     * boolean union operation (with Positive filling rule by default) is
     * performed to combine overlapping polygons and ensure the resulting
     * CrossSection is free of intersections.
     * @param inputs polygons and fill rule
     * @returns cross section
     * @group base
     * @shortname create
     * @drawable true
     */
    create(inputs: Inputs.Manifold.CreateContourSectionDto): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        return new CrossSection(inputs.polygons, inputs.fillRule);
    }

    /**
     * Create a 2D square cross section
     * @param inputs Square parameters
     * @returns square cross section
     * @group primitives
     * @shortname square
     * @drawable true
     */
    square(inputs: Inputs.Manifold.SquareDto): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { square } = CrossSection;
        return square(inputs.size, inputs.center);
    }

    /**
     * Create a 2D circle cross section
     * @param inputs Circle parameters
     * @returns circle cross section
     * @group primitives
     * @shortname circle
     * @drawable true
     */
    circle(inputs: Inputs.Manifold.CircleDto): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { circle } = CrossSection;
        return circle(inputs.radius, inputs.circularSegments);
    }

    /**
     * Create a 2D rectangle cross section
     * @param inputs Rectangle parameters
     * @returns rectangle cross section
     * @group primitives
     * @shortname rectangle
     * @drawable true
     */
    rectangle(inputs: Inputs.Manifold.RectangleDto): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { square } = CrossSection;
        return square([inputs.length, inputs.height], inputs.center);
    }
}
