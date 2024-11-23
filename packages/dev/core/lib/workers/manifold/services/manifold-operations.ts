import * as Inputs from "../../../api/inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

export class ManifoldOperations {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    hull(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.hull();
    }

}
