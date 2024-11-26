import * as Manifold3D from "manifold-3d";
import { MeshEvaluate } from "./mesh-evaluate";
import { MeshOperations } from "./mesh-operations";

// Worker make an instance of this class itself
export class Mesh {

    plugins: any;

    public operations: MeshOperations;
    public evaluate: MeshEvaluate;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.operations = new MeshOperations(wasm);
        this.evaluate = new MeshEvaluate(wasm);
    }
}
