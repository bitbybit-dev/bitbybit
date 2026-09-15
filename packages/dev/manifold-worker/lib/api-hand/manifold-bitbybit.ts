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
     * Frees the memory a solid or a cross-section holds inside the kernel; the object cannot be
     * used afterwards. Call it for results a script no longer needs, so long sessions do not run
     * out of memory.
     * @param inputs - The solid or cross-section to free
     * @group cleanup
     * @shortname delete m or cs
     * @drawable false
     * @example
     * ```typescript
     * await bitbybit.manifold.deleteManifoldOrCrossSection({ manifoldOrCrossSection: cube });
     * ```
     */
    async deleteManifoldOrCrossSection(inputs: Inputs.Manifold.ManifoldOrCrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<void> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("deleteManifoldOrCrossSection", inputs);
    }

    // last
    /**
     * Frees the memory several solids or cross-sections hold inside the kernel; they cannot be used
     * afterwards. Call it for results a script no longer needs, so long sessions do not run out of
     * memory.
     * @param inputs - The solids or cross-sections to free
     * @group cleanup
     * @shortname delete m's or cs's
     * @drawable false
     * @example
     * ```typescript
     * await bitbybit.manifold.deleteManifoldsOrCrossSections({ manifoldsOrCrossSections: [cube, sphere] });
     * ```
     */
    async deleteManifoldsOrCrossSections(inputs: Inputs.Manifold.ManifoldsOrCrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<void> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("deleteManifoldsOrCrossSections", inputs);
    }
}
