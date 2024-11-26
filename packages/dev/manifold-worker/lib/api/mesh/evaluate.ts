import { ManifoldWorkerManager } from "../../manifold-worker/manifold-worker-manager";
import * as Inputs from "@bitbybit-dev/manifold/lib/api/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class MeshEvaluate {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,

    ) { }

    /**
     * Get position on mesh vertex index
     * @param inputs mesh
     * @returns point
     * @group basic
     * @shortname position
     * @drawable true
     */
    async position(inputs: Inputs.Manifold.MeshVertexIndexDto<Inputs.Manifold.MeshPointer>): Promise<Inputs.Base.Point3> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("mesh.evaluate.position", inputs);
    }

    /**
     * Gets the three vertex indices of this triangle in CCW order.
     * @param inputs mesh
     * @returns verts
     * @group basic
     * @shortname verts
     * @drawable false
     */
    async verts(inputs: Inputs.Manifold.MeshTriangleIndexDto<Inputs.Manifold.MeshPointer>): Promise<number[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("mesh.evaluate.verts", inputs);
    }

    /**
     * Gets the tangent vector starting at verts(tri)[j] pointing to the next
     * Bezier point along the CCW edge. The fourth value is its weight.
     * @param inputs mesh
     * @returns tangent
     * @group basic
     * @shortname tangent
     * @drawable true
     */
    async tangent(inputs: Inputs.Manifold.MeshHalfEdgeIndexDto<Inputs.Manifold.MeshPointer>): Promise<number[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("mesh.evaluate.tangent", inputs);
    }

    /**
     * Gets any other properties associated with this vertex.
     * @param inputs mesh
     * @returns extras
     * @group basic
     * @shortname extras
     * @drawable false
     */
    async extras(inputs: Inputs.Manifold.MeshVertexIndexDto<Inputs.Manifold.MeshPointer>): Promise<number[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("mesh.evaluate.extras", inputs);
    }

    /**
     * Gets the column-major 4x4 matrix transform from the original mesh to these
     * related triangles.
     * @param inputs mesh
     * @returns transform matrix
     * @group basic
     * @shortname transform 4x4 matrix
     * @drawable false
     */
    async transform(inputs: Inputs.Manifold.MeshVertexIndexDto<Inputs.Manifold.MeshPointer>): Promise<number[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("mesh.evaluate.transform", inputs);
    }

    /**
     * Number of properties per vertex, always >= 3.
     * @param inputs mesh
     * @returns number of properties
     * @group basic
     * @shortname number props
     * @drawable false
     */
    async numProp(inputs: Inputs.Manifold.MeshDto<Inputs.Manifold.MeshPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("mesh.evaluate.numProp", inputs);
    }

    /**
     * Number of property vertices
     * @param inputs mesh
     * @returns number of vertices
     * @group basic
     * @shortname number vertices
     * @drawable false
     */
    async numVert(inputs: Inputs.Manifold.MeshDto<Inputs.Manifold.MeshPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("mesh.evaluate.numVert", inputs);
    }

    /**
     * Get number of triangles on mesh
     * @param inputs mesh
     * @returns number of triangles
     * @group basic
     * @shortname number triangles
     * @drawable false
     */
    async numTri(inputs: Inputs.Manifold.MeshDto<Inputs.Manifold.MeshPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("mesh.evaluate.numTri", inputs);
    }

    /**
     * Number of triangle runs. Each triangle run is a set of consecutive
     * triangles that all come from the same instance of the same input mesh.
     * @param inputs mesh
     * @returns number of runs
     * @group basic
     * @shortname number runs
     * @drawable false
     */
    async numRun(inputs: Inputs.Manifold.MeshDto<Inputs.Manifold.MeshPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("mesh.evaluate.numRun", inputs);
    }

}
