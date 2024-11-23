
import { ManifoldWorkerManager } from "../../../../workers/manifold/manifold-worker-manager";
import { CrossSectionOperations } from "./operations";
import { CrossSectionShapes } from "./shapes";
import * as Inputs from "../../../inputs/inputs";
import * as Manifold3D from "manifold-3d";
import { CrossSectionTransforms } from "./transforms";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldCrossSection{

    shapes: CrossSectionShapes;
    operations: CrossSectionOperations;
    transforms: CrossSectionTransforms;

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
    ) { 
        this.shapes = new CrossSectionShapes(manifoldWorkerManager);
        this.operations = new CrossSectionOperations(manifoldWorkerManager);
        this.transforms = new CrossSectionTransforms(manifoldWorkerManager);
    }


    /**
     * Turns cross section into polygons
     * @param inputs cross section
     * @returns polygons
     * @group decompose
     * @shortname cross section to polygons
     * @drawable false
     */
    async crossSectionToPolygons(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Manifold3D.SimplePolygon[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.crossSectionToPolygons", inputs);
    }

    /**
     * Turns cross sections into polygons
     * @param inputs cross sections
     * @returns polygons
     * @group decompose
     * @shortname cross sections to polygons
     * @drawable false
     */
    async crossSectionsToPolygons(inputs: Inputs.Manifold.CrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Manifold3D.SimplePolygon[][]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.crossSectionsToPolygons", inputs);
    }

}
