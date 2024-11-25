import * as Inputs from "../../../../api/inputs";
import * as Manifold3D from "manifold-3d";

export class MeshOperations {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    merge(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): boolean {
        return inputs.mesh.merge();
    }
}
