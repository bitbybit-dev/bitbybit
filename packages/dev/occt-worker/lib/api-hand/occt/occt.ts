// Hand-written members of the generated class of the same name (see scripts/gen-worker-api.mjs).
// Each member's marker says where it lands: `// replaces <path>` takes the kernel method's slot (and its doc,
// when the member has none), `// after <path>` follows that slot, `// first` and `// last` frame the class.
import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";

export class OCCT {
    constructor(public readonly occWorkerManager: OCCTWorkerManager) { }

    // last
    /**
     * Frees the memory a shape holds inside the kernel; the shape cannot be used afterwards. Call
     * it for intermediate results a script no longer needs, so long sessions do not run out of
     * memory.
     * @param inputs - The shape to free
     * @group memory
     * @shortname delete shape
     * @example
     * ```typescript
     * const box = await bitbybit.occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
     * const rounded = await bitbybit.occt.fillets.filletEdges({ shape: box, radius: 1 });
     * await bitbybit.occt.deleteShape({ shape: box });
     * ```
     */
    async deleteShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        return await this.occWorkerManager.genericCallToWorkerPromise("deleteShape", inputs);
    }

    // last
    /**
     * Frees the memory several shapes hold inside the kernel; they cannot be used afterwards. Call
     * it for intermediate results a script no longer needs, so long sessions do not run out of
     * memory.
     * @param inputs - The shapes to free
     * @group memory
     * @shortname delete shapes
     * @example
     * ```typescript
     * await bitbybit.occt.deleteShapes({ shapes: [box, cylinder] });
     * ```
     */
    async deleteShapes(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        return await this.occWorkerManager.genericCallToWorkerPromise("deleteShapes", inputs);
    }

    // last
    /**
     * Frees every shape the kernel holds at once, including the ones your variables still point to,
     * so nothing created before can be used afterwards. Call it when starting over rather than
     * between steps.
     * @group memory
     * @shortname clean all cache
     * @example
     * ```typescript
     * await bitbybit.occt.cleanAllCache();
     * ```
     */
    async cleanAllCache(): Promise<void> {
        return await this.occWorkerManager.genericCallToWorkerPromise("cleanAllCache", {});
    }
}
