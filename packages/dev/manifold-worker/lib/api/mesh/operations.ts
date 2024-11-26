import { ManifoldWorkerManager } from "../../manifold-worker/manifold-worker-manager";
import * as Inputs from "@bitbybit-dev/manifold/lib/api/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class MeshOperations {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,

    ) { }

    /**
     * Updates the mergeFromVert and mergeToVert vectors in order to create a
     * manifold solid. If the MeshGL is already manifold, no change will occur and
     * the function will return false. Otherwise, this will merge verts along open
     * edges within tolerance (the maximum of the MeshGL tolerance and the
     * baseline bounding-box tolerance), keeping any from the existing merge
     * vectors.
     *
     * There is no guarantee the result will be manifold - this is a best-effort
     * helper function designed primarily to aid in the case where a manifold
     * multi-material MeshGL was produced, but its merge vectors were lost due to
     * a round-trip through a file format. Constructing a Manifold from the result
     * will report a Status if it is not manifold.
     * @param inputs mesh
     * @returns merged mesh
     * @group base
     * @shortname merge
     * @drawable true
     */
    async merge(inputs: Inputs.Manifold.MeshDto<Inputs.Manifold.MeshPointer>): Promise<Inputs.Manifold.MeshPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("mesh.operations.merge", inputs);
    }
}
