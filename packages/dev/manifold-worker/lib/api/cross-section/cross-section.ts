import { ManifoldWorkerManager } from "../../manifold-worker/manifold-worker-manager";
import * as Inputs from "@bitbybit-dev/manifold/lib/api/inputs";
import { CrossSectionOperations } from "./operations";
import { CrossSectionShapes } from "./shapes";
import { CrossSectionTransforms } from "./transforms";
import { CrossSectionBooleans } from "./booleans";
import { CrossSectionEvaluate } from "./evaluate";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldCrossSection{

    shapes: CrossSectionShapes;
    operations: CrossSectionOperations;
    booleans: CrossSectionBooleans;
    transforms: CrossSectionTransforms;
    evaluate: CrossSectionEvaluate;

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
    ) { 
        this.shapes = new CrossSectionShapes(manifoldWorkerManager);
        this.operations = new CrossSectionOperations(manifoldWorkerManager);
        this.booleans = new CrossSectionBooleans(manifoldWorkerManager);
        this.transforms = new CrossSectionTransforms(manifoldWorkerManager);
        this.evaluate = new CrossSectionEvaluate(manifoldWorkerManager);
    }


    /**
     * Turns cross section into polygons
     * @param inputs cross section
     * @returns polygons
     * @group decompose
     * @shortname cross section to polygons
     * @drawable false
     */
    async crossSectionToPolygons(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Base.Vector2[][]> {
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
    async crossSectionsToPolygons(inputs: Inputs.Manifold.CrossSectionsDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Base.Vector2[][][]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.crossSectionsToPolygons", inputs);
    }

}
