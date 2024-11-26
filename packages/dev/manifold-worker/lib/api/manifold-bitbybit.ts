import { ManifoldWorkerManager } from "../manifold-worker/manifold-worker-manager";
import * as Inputs from "@bitbybit-dev/manifold/lib/api/inputs";
import { Manifold } from "./manifold/manifold";
import { ManifoldCrossSection } from "./cross-section/cross-section";
import { Mesh } from "./mesh/mesh";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldBitByBit {
    public readonly manifold: Manifold;
    public readonly crossSection: ManifoldCrossSection;
    public readonly mesh: Mesh;

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
    ) {
        this.manifold = new Manifold(manifoldWorkerManager);
        this.crossSection = new ManifoldCrossSection(manifoldWorkerManager);
        this.mesh = new Mesh(manifoldWorkerManager);
    }

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

    /**
     * Decomposes manifold or cross section shape into a mesh or simple polygons
     * @param inputs Manifold shape or cross section
     * @returns Decomposed mesh definition or simple polygons
     * @group decompose
     * @shortname decompose m or cs
     * @drawable false
     */
    async decomposeManifoldOrCrossSection(inputs: Inputs.Manifold.DecomposeManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.DecomposedManifoldMeshDto | Inputs.Base.Vector2[][]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldOrCrossSection", inputs);
    }

    /**
     * Decomposes manifold or cross section shape into a mesh or simple polygons
     * @param inputs Manifold shapes or cross sections
     * @returns Decomposed mesh definitions or a list of simple polygons
     * @group decompose
     * @shortname decompose m's or cs's
     * @drawable false
     */
    async decomposeManifoldsOrCrossSections(inputs: Inputs.Manifold.DecomposeManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer>): Promise<(Inputs.Manifold.DecomposedManifoldMeshDto | Inputs.Base.Vector2[][])[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldsOrCrossSections", inputs);
    }

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
