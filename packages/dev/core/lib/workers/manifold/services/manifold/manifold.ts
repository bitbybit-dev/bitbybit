import * as Manifold3D from "manifold-3d";
import { ManifoldShapes } from "./manifold-shapes";
import { ManifoldBooleans } from "./manifold-booleans";
import { ManifoldOperations } from "./manifold-operations";
import { ManifoldTransforms } from "./manifold-transforms";
import { ManifoldEvaluate } from "./manifold-evaluate";
import * as Inputs from "../../../../api/inputs";

// Worker make an instance of this class itself
export class Manifold {

    plugins: any;

    public shapes: ManifoldShapes;
    public booleans: ManifoldBooleans;
    public operations: ManifoldOperations;
    public transforms: ManifoldTransforms;
    public evaluate: ManifoldEvaluate;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.shapes = new ManifoldShapes(wasm);
        this.booleans = new ManifoldBooleans(wasm);
        this.operations = new ManifoldOperations(wasm);
        this.transforms = new ManifoldTransforms(wasm);
        this.evaluate = new ManifoldEvaluate(wasm);
    }
    
    manifoldToMesh(inputs: Inputs.Manifold.ManifoldToMeshDto<Manifold3D.Manifold>): Manifold3D.Mesh {
        return inputs.manifold.getMesh(inputs.normalIdx);
    }

    manifoldsToMeshes(inputs: Inputs.Manifold.ManifoldsToMeshesDto<Manifold3D.Manifold>): (Manifold3D.Mesh)[] {
        return inputs.manifolds.map((manifold, index) => {
            const normalIdx = inputs.normalIdx ? inputs.normalIdx[index] : undefined;
            return this.manifoldToMesh({
                manifold,
                normalIdx
            });
        });
    }
}
