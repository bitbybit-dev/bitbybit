import * as Inputs from "../../../api/inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

export class ManifoldCrossSection {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    square(inputs: Inputs.Manifold.SquareDto): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { square } = CrossSection;
        return square(inputs.size, inputs.center);
    }
}
