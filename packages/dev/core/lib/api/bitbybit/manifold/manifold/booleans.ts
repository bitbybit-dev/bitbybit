
import { ManifoldWorkerManager } from "../../../../workers/manifold/manifold-worker-manager";
import * as Inputs from "../../../inputs/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldBooleans {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,

    ) { }


    /**
     * Subtract two manifold shapes
     * @param inputs two shapes
     * @returns subtracted manifold shape
     * @group a to b
     * @shortname subtract
     * @drawable true
     */
    async subtract(inputs: Inputs.Manifold.TwoManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.booleans.subtract", inputs);
    }

    /**
     * Add two manifold shapes
     * @param inputs two shapes
     * @returns unioned manifold shape
     * @group a to b
     * @shortname add
     * @drawable true
     */
    async add(inputs: Inputs.Manifold.TwoManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.booleans.add", inputs);
    }

    /**
     * Intersect two manifold shapes
     * @param inputs two shapes
     * @returns intersected manifold shape
     * @group a to b
     * @shortname intersect
     * @drawable true
     */
    async intersect(inputs: Inputs.Manifold.TwoManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.booleans.intersect", inputs);
    }

    /**
     * Difference of two manifold shapes
     * @param inputs two shapes
     * @returns difference of two manifold shapes
     * @group 2 manifolds
     * @shortname difference 2 manifolds
     * @drawable true
     */
    async differenceTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.booleans.differenceTwo", inputs);
    }

    /**
     * Union of two manifold shapes
     * @param inputs two shapes
     * @returns union of two manifold shapes
     * @group 2 manifolds
     * @shortname union 2 manifolds
     * @drawable true
     */
    async unionTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.booleans.unionTwo", inputs);
    }

    /**
     * Intersection of two manifold shapes
     * @param inputs two shapes
     * @returns intersection of two manifold shapes
     * @group 2 manifolds
     * @shortname intersection 2 manifolds
     * @drawable true
     */
    async intersectionTwo(inputs: Inputs.Manifold.TwoManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.booleans.intersectionTwo", inputs);
    }

    /**
     * Difference of multiple manifold shapes
     * @param inputs multiple shapes
     * @returns difference of two manifold shapes
     * @group multiple
     * @shortname difference manifolds
     * @drawable true
     */
    async difference(inputs: Inputs.Manifold.ManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.booleans.difference", inputs);
    }

    /**
     * Union of multiple manifold shapes
     * @param inputs multiple shapes
     * @returns union of two manifold shapes
     * @group multiple
     * @shortname union manifolds
     * @drawable true
     */
    async union(inputs: Inputs.Manifold.ManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.booleans.union", inputs);
    }

    /**
     * Intersection of multiple manifold shapes
     * @param inputs two shapes
     * @returns intersection of multiple manifold shapes
     * @group multiple
     * @shortname intersection manifolds
     * @drawable true
     */
    async intersection(inputs: Inputs.Manifold.ManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.booleans.intersection", inputs);
    }

    /**
     * Split manifold by another manifold
     * @param inputs manifold to split and manifold cutter
     * @returns split manifold
     * @group split
     * @shortname split
     * @drawable true
     */
    split(inputs: Inputs.Manifold.SplitManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.booleans.split", inputs);
    }

    /**
     * Split manifold by plane
     * @param inputs manifold and plane
     * @returns split manifold
     * @group split
     * @shortname split by plane
     * @drawable true
     */
    splitByPlane(inputs: Inputs.Manifold.SplitByPlaneDto<Inputs.Manifold.SplitByPlaneDto<Inputs.Manifold.ManifoldPointer>>): Promise<Inputs.Manifold.ManifoldPointer[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.booleans.splitByPlane", inputs);
    }

    /**
     * Trim manifold by plane
     * @param inputs manifold and plane
     * @returns trimmed manifold
     * @group trim
     * @shortname trim by plane
     * @drawable true
     */
    trimByPlane(inputs: Inputs.Manifold.TrimByPlaneDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.booleans.trimByPlane", inputs);
    }
}
