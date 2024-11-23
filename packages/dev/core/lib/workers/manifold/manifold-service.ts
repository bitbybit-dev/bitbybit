import * as Manifold3D from "manifold-3d";
import { ManifoldShapes } from "./services/manifold-shapes";
import { ManifoldBooleans } from "./services/manifold-booleans";
import * as Inputs from "../../api/inputs";
import { ManifoldOperations } from "./services";
import { ManifoldTransforms } from "./services/manifold-transforms";

// Worker make an instance of this class itself
export class ManifoldService {

    private manifold: Manifold3D.ManifoldToplevel;
    plugins: any;

    public shapes: ManifoldShapes;
    public booleans: ManifoldBooleans;
    public operations: ManifoldOperations;
    public transforms: ManifoldTransforms;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
        this.shapes = new ManifoldShapes(wasm);
        this.booleans = new ManifoldBooleans(wasm);
        this.operations = new ManifoldOperations(wasm);
        this.transforms = new ManifoldTransforms(wasm);
    }

    manifoldToMesh(inputs: Inputs.Manifold.ManifoldToMeshDto<Manifold3D.Manifold>): Manifold3D.Mesh {
        return inputs.manifold.getMesh(inputs.normalIdx);
    }

    manifoldsToMeshes(inputs: Inputs.Manifold.ManifoldsToMeshesDto<Manifold3D.Manifold>): Manifold3D.Mesh[] {
        return inputs.manifolds.map((manifold, index) => {
            const normalIdx = inputs.normalIdx ? inputs.normalIdx[index] : undefined;
            return this.manifoldToMesh({
                manifold,
                normalIdx
            });
        });
    }
}
