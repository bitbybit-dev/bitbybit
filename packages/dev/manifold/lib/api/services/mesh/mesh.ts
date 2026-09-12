import * as Manifold3D from "manifold-3d";
import { MeshEvaluate } from "./mesh-evaluate";
import { MeshOperations } from "./mesh-operations";

/**
 * The plain triangle data of a Manifold solid, as `manifold.manifoldToMesh` hands it out:
 * `evaluate` reads vertices, triangles, tangents and the runs that group triangles by their
 * original shape, and `operations` repairs merge information. A mesh is what crosses from the
 * kernel to a renderer or a file.
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
