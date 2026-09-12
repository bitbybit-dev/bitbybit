import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Repairs on Manifold mesh data before it is turned back into a solid; today that is `merge`, which
 * restores the merge information a file round trip loses.
 */
export class MeshOperations {

    constructor(_wasm: Manifold3D.ManifoldToplevel) {
    }

    /**
     * Fills in the mesh's merge information so it can become a solid again: vertices on open edges
     * within the tolerance are merged, keeping existing entries.
     *
     * A mesh that is already closed is left alone and false comes back. Meant for a mesh whose
     * merge data was lost in a file; the rebuilt solid reports a status if still open.
     * @param inputs - The mesh to repair
     * @returns True when the mesh was changed, false when it was already closed
     * @group base
     * @shortname merge
     * @drawable true
     * @example
     * ```typescript
     * const changed = await bitbybit.manifold.mesh.operations.merge({ mesh });
     * ```
     */
    merge(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): boolean {
        return inputs.mesh.merge();
    }
}
