import * as Manifold3D from "manifold-3d";
import { ManifoldShapes } from "./manifold-shapes";
import { ManifoldBooleans } from "./manifold-booleans";
import { ManifoldOperations } from "./manifold-operations";
import { ManifoldTransforms } from "./manifold-transforms";
import { ManifoldEvaluate } from "./manifold-evaluate";
import * as Inputs from "../../inputs";

/**
 * Solids in the Manifold kernel: `shapes` builds cubes, spheres, cylinders and solids from meshes,
 * `booleans` fuses, cuts and splits them, `operations` hulls, slices, refines and smooths them,
 * `transforms` moves them and `evaluate` measures them. A solid here is a closed triangle mesh;
 * every operation returns a new solid and the inputs stay as they are. The methods on this class
 * turn solids into plain mesh data.
 */
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
    
    /**
     * Turns a solid into plain mesh data: vertex properties, triangle indexes and the runs that
     * group triangles by their original shape.
     *
     * `normalIdx` names the vertex property channel that holds normals, when the solid carries
     * them.
     * @param inputs - The solid and the optional normal channel
     * @returns The mesh data
     * @group meshing
     * @shortname manifold to mesh
     * @drawable false
     * @example
     * ```typescript
     * const mesh = await bitbybit.manifold.manifold.manifoldToMesh({ manifold: cube });
     * ```
     */
    manifoldToMesh(inputs: Inputs.Manifold.ManifoldToMeshDto<Manifold3D.Manifold>): Manifold3D.Mesh {
        return inputs.manifold.getMesh(inputs.normalIdx);
    }

    /**
     * Turns several solids into plain mesh data, as `manifoldToMesh` does for one.
     *
     * `normalIdx` gives one normal channel per solid.
     * @param inputs - The solids and the optional normal channels
     * @returns One mesh per solid, in the same order
     * @group meshing
     * @shortname manifolds to meshes
     * @drawable false
     * @example
     * ```typescript
     * const meshes = await bitbybit.manifold.manifold.manifoldsToMeshes({ manifolds: [cube, sphere] });
     * ```
     */
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
