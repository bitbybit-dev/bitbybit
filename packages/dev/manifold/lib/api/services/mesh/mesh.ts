import * as Manifold3D from "manifold-3d";
import { MeshEvaluate } from "./mesh-evaluate";
import { MeshOperations } from "./mesh-operations";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class Mesh {

    plugins: any;

    public operations: MeshOperations;
    public evaluate: MeshEvaluate;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.operations = new MeshOperations(wasm);
        this.evaluate = new MeshEvaluate(wasm);
    }
}
