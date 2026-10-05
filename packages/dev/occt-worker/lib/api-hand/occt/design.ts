import type { Inputs, Models } from "@bitbybit-dev/occt";
import type { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";
import { buildWithScripts } from "../../occ-worker/design-scripts";

export class OCCTDesign {
    constructor(readonly occWorkerManager: OCCTWorkerManager) { }

    // after design.build
    /**
     * Builds a design document whose script features run here, on the main thread, as the kernel runs no
     * code: it builds, runs the code of every script the build lists as `pending`, and builds again
     * with what each made, until no script waits.
     *
     * A script's code is the asset its feature names, given in `assets` as an import's file is, and
     * is the body of an async function given `inputs`, the feature's params with bodies as shapes and
     * references as indexes, and `occt`, this package's API: it returns a shape, or `{ shape, roles }`
     * naming faces by role, such as `{ shape, roles: { tooth: [3, 4] } }`. Run only documents whose
     * scripts you trust: their code runs with the rights of the page that runs it.
     * @param inputs - The document, the configuration, the values, the assets with each script's code, and the documents an assembly places
     * @returns What the last build made: the parts, a report per feature and the problems found, as `build` returns them
     * @group document
     * @shortname build design with scripts
     * @drawable true
     * @ignore true
     * @example
     * ```typescript
     * const code = "const box = await occt.shapes.solid.createBox({ width: inputs.size, length: inputs.size, height: 2, center: [0, 0, 0] }); return { shape: box, roles: { slab: [0, 1, 2, 3, 4, 5] } };";
     * const result = await bitbybit.occt.design.buildWithScripts({
     *     document: {
     *         schemaVersion: 1,
     *         parameters: { size: 20 },
     *         assets: [{ id: "slab", uri: "slab.js", sha256: "be4375e273b65ebd4034cef2a4e3c9b5a9141f6b92abcd3796fc624369fa231d" }],
     *         features: [{ id: "slab", type: "script", script: "slab", params: { size: { expr: "size" } } }],
     *     },
     *     assets: { slab: code },
     * });
     * console.log(result.report[0]?.status);
     * ```
     */
    buildWithScripts(inputs: Inputs.OCCT.DesignBuildDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.DesignBuildResult<Inputs.OCCT.TopoDSShapePointer>> {
        return buildWithScripts(this.occWorkerManager, inputs);
    }
}
