
import { ManifoldWorkerManager } from "../../../../workers/manifold/manifold-worker-manager";
import * as Inputs from "../../../inputs/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldShapes {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,

    ) { }

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
