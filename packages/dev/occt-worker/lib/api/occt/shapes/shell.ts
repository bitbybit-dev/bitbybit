import { Inputs, Models } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

export class OCCTShell {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Returns debug info about the shell: face/edge counts, total surface area and per-face surface
     * debug info (type, U/V degree, poles/knots, bounds, area, ...).
     * @param inputs shell
     * @returns Shell debug info
     * @group debug
     * @shortname shell debug info
     * @drawable false
     */
    debugInfo(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShellPointer>): Promise<Models.OCCT.ShellDebugInfo> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.shell.debugInfo", inputs);
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
