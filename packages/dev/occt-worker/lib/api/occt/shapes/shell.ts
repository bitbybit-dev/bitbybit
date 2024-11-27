import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

export class OCCTShell {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Creates a shell from faces
     * @param inputs OpenCascade shell and faces
     * @returns OpenCascade shell
     * @group create
     * @shortname sew
     * @drawable true
     */
    sewFaces(inputs: Inputs.OCCT.SewDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShellPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shell.sewFaces", inputs);
    }

    /**
     * Get shell surface area
     * @param inputs shell shape
     * @returns Surface area
     * @group get
     * @shortname area
     * @drawable false
     */
    getShellSurfaceArea(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShellPointer>): Promise<number> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shell.getShellSurfaceArea", inputs);
    }
}
