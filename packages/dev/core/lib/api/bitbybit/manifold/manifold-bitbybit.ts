
import { ManifoldWorkerManager } from "../../../workers/manifold/manifold-worker-manager";
import * as Inputs from "../../inputs/inputs";
import * as Manifold3D from "manifold-3d";
import { Manifold } from "./manifold/manifold";
import { ManifoldCrossSection } from "./cross-section/cross-section";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldBitByBit {
    public readonly manifold: Manifold;
    public readonly crossSection: ManifoldCrossSection;

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
    ) {
        this.manifold = new Manifold(manifoldWorkerManager);
        this.crossSection = new ManifoldCrossSection(manifoldWorkerManager);
    }

    /**
     * Decomposes manifold or cross section shape into a mesh or simple polygons
     * @param inputs Manifold shape or cross section
     * @returns Decomposed mesh definition or simple polygons
     * @group decompose
     * @shortname decompose m or cs
     * @drawable false
     */
    async decomposeManifoldOrCrossSection(inputs: Inputs.Manifold.DecomposeManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer>): Promise<Manifold3D.Mesh | Manifold3D.SimplePolygon[]> {
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
    async decomposeManifoldsOrCrossSections(inputs: Inputs.Manifold.DecomposeManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer>): Promise<(Manifold3D.Mesh | Manifold3D.SimplePolygon)[]> {
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
