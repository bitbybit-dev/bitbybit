import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";

export class MeshOperations {

    constructor(_wasm: Manifold3D.ManifoldToplevel) {
    }

    merge(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): boolean {
        return inputs.mesh.merge();
    }
}
