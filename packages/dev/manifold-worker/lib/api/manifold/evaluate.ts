import { ManifoldWorkerManager } from "../../manifold-worker/manifold-worker-manager";
import * as Inputs from "@bitbybit-dev/manifold/lib/api/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldEvaluate {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
    ) { }

    /**
     * Get surface area of manifold
     * @param inputs manifold
     * @returns surface area of manifold
     * @group basic
     * @shortname surface area
     * @drawable false
     */
    async surfaceArea(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.evaluate.surfaceArea", inputs);
    }

    /**
     * Get volume of manifold
     * @param inputs manifold
     * @returns volume of manifold
     * @group basic
     * @shortname volume
     * @drawable false
     */
    async volume(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.evaluate.volume", inputs);
    }

    /**
      * Check if manifold contains triangles
      * @param inputs manifold
      * @returns boolean indicating emptyness
      * @group basic
      * @shortname is empty
      * @drawable false
      */
    async isEmpty(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<boolean> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.evaluate.isEmpty", inputs);
    }

    /**
     * Get number of vertices in manifold
     * @param inputs manifold
     * @returns number of vertices of manifold
     * @group basic
     * @shortname num vert
     * @drawable false
     */
    async numVert(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.evaluate.numVert", inputs);
    }

    /**
     * Get number of triangles in manifold
     * @param inputs manifold
     * @returns number of triangles of manifold
     * @group basic
     * @shortname num triangles
     * @drawable false
     */
    async numTri(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.evaluate.numTri", inputs);
    }

    /**
     * Get number of edges in manifold
     * @param inputs manifold
     * @returns number of edges of manifold
     * @group basic
     * @shortname num edges
     * @drawable false
     */
    async numEdge(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.evaluate.numEdge", inputs);
    }

    /**
     * Get number of properties in manifold
     * @param inputs manifold
     * @returns number of properties of manifold
     * @group basic
     * @shortname num prop
     * @drawable false
     */
    async numProp(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.evaluate.numProp", inputs);
    }

    /**
     * The number of property vertices in the Manifold. This will always be >=
     * numVert, as some physical vertices may be duplicated to account for
     * different properties on different neighboring triangles.
     * @param inputs manifold
     * @returns number of properties of manifold
     * @group basic
     * @shortname num prop vert
     * @drawable false
     */
    async numPropVert(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.evaluate.numPropVert", inputs);
    }

    /**
     * Returns the axis-aligned bounding box of all the Manifold's vertices.
     * @param inputs manifold
     * @returns bounding box corner vectors of manifold
     * @group basic
     * @shortname bounding box
     * @drawable false
     */
    async boundingBox(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Base.Vector3[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.evaluate.boundingBox", inputs);
    }

    /**
     * Returns the tolerance of this Manifold's vertices, which tracks the
     * approximate rounding error over all the transforms and operations that have
     * led to this state. Any triangles that are colinear within this tolerance
     * are considered degenerate and removed. This is the value of &epsilon;
     * defining
     * [&epsilon;-valid](https://github.com/elalish/manifold/wiki/Manifold-Library#definition-of-%CE%B5-valid).
     * @param inputs manifold
     * @returns tolerance of manifold
     * @group basic
     * @shortname tolerance
     * @drawable false
     */
    async tolerance(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.evaluate.tolerance", inputs);
    }

    /**
     * The genus is a topological property of the manifold, representing the
     * number of "handles". A sphere is 0, torus 1, etc. It is only meaningful for
     * a single mesh, so it is best to call Decompose() first.
     * @param inputs manifold
     * @returns genus of manifold
     * @group basic
     * @shortname genus
     * @drawable false
     */
    async genus(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.evaluate.genus", inputs);
    }
    
    /**
     * Returns the minimum gap between two manifolds. Returns a float between
     * 0 and searchLength.
     * @param inputs two manifolds and search length
     * @returns minimum
     * @group basic
     * @shortname min gap
     * @drawable false
     */
    async minGap(inputs: Inputs.Manifold.ManifoldsMinGapDto<Inputs.Manifold.ManifoldPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.evaluate.minGap", inputs);
    }

    /**
     * If this mesh is an original, this returns its ID that can be referenced
     * by product manifolds. If this manifold is a product, this
     * returns -1.
     * @param inputs manifold
     * @returns original ID of manifold
     * @group basic
     * @shortname original id
     * @drawable false
     */
    async originalID(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.evaluate.originalID", inputs);
    }

}
