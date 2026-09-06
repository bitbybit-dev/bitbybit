// Hand-written members of the generated class of the same name (see scripts/gen-worker-api.mjs).
// Each member's marker says where it lands: `// replaces <path>` takes the kernel method's slot (and its doc,
// when the member has none), `// after <path>` follows that slot, `// first` and `// last` frame the class.
import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";

export class OCCT {
    constructor(public readonly occWorkerManager: OCCTWorkerManager) { }

    // last
    /**
     * Deletes shape from the cache to keep memory usage low
     * @param inputs shape
     * @group memory
     * @shortname delete shape
     */
    async deleteShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        return await this.occWorkerManager.genericCallToWorkerPromise("deleteShape", inputs);
    }

    // last
    /**
     * Deletes shapes from the cache to keep memory usage low
     * @param inputs shape
     * @group memory
     * @shortname delete shapes
     */
    async deleteShapes(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        return await this.occWorkerManager.genericCallToWorkerPromise("deleteShapes", inputs);
    }

    // last
    /**
     * Cleans all cache and all shapes from the memory
     * @param inputs shape
     * @group memory
     * @shortname clean all cache
     */
    async cleanAllCache(): Promise<void> {
        return await this.occWorkerManager.genericCallToWorkerPromise("cleanAllCache", {});
    }
}
