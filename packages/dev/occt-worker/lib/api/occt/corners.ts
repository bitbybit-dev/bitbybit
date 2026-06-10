import { Inputs } from "@bitbybit-dev/occt";
import { Models } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";

export class OCCTCorners {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Rounds (fillets) the corner(s) of a shell or solid nearest the given point(s), affecting the corner only
     * @param inputs Shape, points near corners, radius, taper factor, snap tolerance and mode
     * @returns OpenCascade shape with rounded corner(s)
     * @group by point
     * @shortname fillet corner by point
     * @drawable true
     */
    filletCornerByPoint(inputs: Inputs.OCCT.FilletCornerByPointDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("corners.filletCornerByPoint", inputs);
    }

    /**
     * Bevels (chamfers) the corner(s) of a shell or solid nearest the given point(s), affecting the corner only
     * @param inputs Shape, points near corners, distance, angle, snap tolerance and mode
     * @returns OpenCascade shape with beveled corner(s)
     * @group by point
     * @shortname chamfer corner by point
     * @drawable true
     */
    chamferCornerByPoint(inputs: Inputs.OCCT.ChamferCornerByPointDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("corners.chamferCornerByPoint", inputs);
    }

    /**
     * Classifies the corner(s) nearest the given point(s) without modifying the shape
     * @param inputs Shape, points near corners and snap tolerance
     * @returns Per-point classification report
     * @group by point
     * @shortname classify corner by point
     * @drawable false
     */
    classifyCornerByPoint(inputs: Inputs.OCCT.ClassifyCornerByPointDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.CornerByPointReport> {
        return this.occWorkerManager.genericCallToWorkerPromise("corners.classifyCornerByPoint", inputs);
    }

    /**
     * Runs the corner fillet and returns a per-point diagnostic report alongside it
     * @param inputs Shape, points near corners, radius, taper factor, snap tolerance and mode
     * @returns Per-point corner report
     * @group by point
     * @shortname corner by point report
     * @drawable false
     */
    cornerByPointReport(inputs: Inputs.OCCT.FilletCornerByPointDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.CornerByPointReport> {
        return this.occWorkerManager.genericCallToWorkerPromise("corners.cornerByPointReport", inputs);
    }

}
