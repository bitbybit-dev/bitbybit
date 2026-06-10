import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";

export class OCCTDraft {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Tapers the selected faces of a shape by a draft angle about a neutral plane
     * @param inputs Shape, faces, pull direction, angle and neutral plane
     * @returns OpenCascade shape with drafted faces
     * @group draft
     * @shortname draft angle
     * @drawable true
     */
    draftAngle(inputs: Inputs.OCCT.DraftAngleDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("draft.draftAngle", inputs);
    }

    /**
     * Builds a draft from a shape along a direction up to a maximum corner edge length
     * @param inputs Shape, direction, angle and maximum length
     * @returns OpenCascade drafted shape
     * @group draft
     * @shortname make draft
     * @drawable true
     */
    makeDraft(inputs: Inputs.OCCT.MakeDraftDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("draft.makeDraft", inputs);
    }

    /**
     * Builds a draft from a shape along a direction up to a stop shape
     * @param inputs Shape, direction, angle, stop shape and keep-out flag
     * @returns OpenCascade drafted shape
     * @group draft
     * @shortname make draft to shape
     * @drawable true
     */
    makeDraftToShape(inputs: Inputs.OCCT.MakeDraftToShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("draft.makeDraftToShape", inputs);
    }

}
