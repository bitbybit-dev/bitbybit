import { ManifoldWorkerManager } from "../../manifold-worker/manifold-worker-manager";
import * as Inputs from "@bitbybit-dev/manifold/lib/api/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldShapes {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,

    ) { }

    /**
     * Convert a Mesh into a Manifold, retaining its properties and merging only
     * the positions according to the merge vectors. Will throw an error if the
     * result is not an oriented 2-manifold. Will collapse degenerate triangles
     * and unnecessary vertices.
     *
     * All fields are read, making this structure suitable for a lossless
     * round-trip of data from manifoldToMesh(). For multi-material input, use
     * reserveIDs() to set a unique originalID for each material, and sort the
     * materials into triangle runs.
     * @param inputs mesh definition
     * @returns manifold
     * @group create
     * @shortname manifold from mesh
     * @drawable true
     */
    manifoldFromMesh(inputs: Inputs.Manifold.CreateFromMeshDto): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.shapes.manifoldFromMesh", inputs);
    }

    /**
     * Create a 3D cube shape
     * @param inputs Cube parameters
     * @returns Cube solid
     * @group primitives
     * @shortname cube
     * @drawable true
     */
    async cube(inputs: Inputs.Manifold.CubeDto): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.shapes.cube", inputs);
    }

    /**
     * Create a 3D sphere shape
     * @param inputs Sphere parameters
     * @returns Sphere solid
     * @group primitives
     * @shortname sphere
     * @drawable true
     */
    async sphere(inputs: Inputs.Manifold.SphereDto): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.shapes.sphere", inputs);
    }

    /**
     * Create a 3D tetrahedron shape
     * @returns Tetrahedron solid
     * @group primitives
     * @shortname tetrahedron
     * @drawable true
     */
    async tetrahedron(): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.shapes.tetrahedron", {});
    }

    /**
     * Create a 3D cylinder shape
     * @param inputs Cylinder parameters
     * @returns Cylinder solid
     * @group primitives
     * @shortname cylinder
     * @drawable true
     */
    async cylinder(inputs: Inputs.Manifold.CylinderDto): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.shapes.cylinder", inputs);
    }
}
