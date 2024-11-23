import * as Inputs from "../../../../api/inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

export class ManifoldOperations {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    hull(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.hull();
    }

    slice(inputs: Inputs.Manifold.SliceDto<Manifold3D.Manifold>): Manifold3D.CrossSection {
        return inputs.manifold.slice(inputs.height);
    }

    project(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Manifold3D.CrossSection {
        return inputs.manifold.project();
    }
}
