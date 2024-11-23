import * as Inputs from "../../../../api/inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

export class CrossSectionShapes {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    square(inputs: Inputs.Manifold.SquareDto): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { square } = CrossSection;
        return square(inputs.size, inputs.center);
    }

    circle(inputs: Inputs.Manifold.CircleDto): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { circle } = CrossSection;
        return circle(inputs.radius, inputs.circularSegments);
    }

    rectangle(inputs: Inputs.Manifold.RectangleDto): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { square } = CrossSection;
        return square([inputs.length, inputs.height], inputs.center);
    }
}
