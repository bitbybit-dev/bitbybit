// Hand-written members of the generated class of the same name (see scripts/gen-worker-api.mjs).
// Each member's marker says where it lands: `// replaces <path>` takes the kernel method's slot (and its doc,
// when the member has none), `// after <path>` follows that slot, `// first` and `// last` frame the class.
import * as Inputs from "@bitbybit-dev/manifold/lib/api/inputs";
import { ManifoldWorkerManager } from "../manifold-worker/manifold-worker-manager";

export class ManifoldBitByBit {
    constructor(private readonly manifoldWorkerManager: ManifoldWorkerManager) { }

    // first
    /**
      * Turns manifold shape into a mesh pointer that lives in worker's memory. This pointer can be used with bitbybit.manifold.mesh functions
      * @param inputs Manifold shape
      * @returns Pointer to manifold mesh definition
      * @group meshing
      * @shortname manifold to mesh pointer
      * @drawable false
      */
    async manifoldToMeshPointer(inputs: Inputs.Manifold.ManifoldToMeshDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.MeshPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifoldToMeshPointer", inputs);
    }

    // last
    /**
     * Delete manifold or cross section from memory
     * @param inputs manifold or cross section
     * @group cleanup
     * @shortname delete m or cs
     * @drawable false
     */
    async deleteManifoldOrCrossSection(inputs: Inputs.Manifold.ManifoldOrCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<void> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("deleteManifoldOrCrossSection", inputs);
    }

    // last
    /**
     * Delete manifolds or cross sections from memory
     * @param inputs manifolds or cross sections
     * @group cleanup
     * @shortname delete m's or cs's
     * @drawable false
     */
    async deleteManifoldsOrCrossSections(inputs: Inputs.Manifold.ManifoldsOrCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<void> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("deleteManifoldsOrCrossSections", inputs);
    }
}
