import { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

export class OCCTDraft {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    /**
     * Tapers the selected faces of a shape by a draft angle about a neutral plane
     * @param inputs Shape, faces, pull direction, angle and neutral plane
     * @returns OpenCascade shape with drafted faces
     * @group draft
     * @shortname draft angle
     * @drawable true
     */
    draftAngle(inputs: Inputs.OCCT.DraftAngleDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        const draft = new this.occ.BRepOffsetAPI_DraftAngle(inputs.shape);
        const direction = this.och.entitiesService.gpDir(inputs.direction);
        const neutralPlane = this.och.entitiesService.gpPln(inputs.neutralPlaneOrigin, inputs.neutralPlaneDirection);
        const angle = this.och.vecHelper.degToRad(inputs.angle);

        inputs.faces.forEach(face => draft.Add(face, direction, angle, neutralPlane, inputs.flag));
        draft.Build();

        if (!draft.IsDone()) {
            direction.delete();
            neutralPlane.delete();
            draft.delete();
            throw new Error("Could not apply the draft angle to the given faces.");
        }
        const shape = this.och.converterService.getActualTypeOfShape(draft.Shape());
        direction.delete();
        neutralPlane.delete();
        draft.delete();
        return shape;
    }

    /**
     * Builds a draft from a shape along a direction up to a maximum corner edge length
     * @param inputs Shape, direction, angle and maximum length
     * @returns OpenCascade drafted shape
     * @group draft
     * @shortname make draft
     * @drawable true
     */
    makeDraft(inputs: Inputs.OCCT.MakeDraftDto<TopoDS_Shape>): TopoDS_Shape {
        const direction = this.och.entitiesService.gpDir(inputs.direction);
        const angle = this.och.vecHelper.degToRad(inputs.angle);
        const maker = new this.occ.BRepOffsetAPI_MakeDraft(inputs.shape, direction, angle);
        maker.SetDraft(inputs.internal);
        maker.Perform(inputs.lengthMax);

        if (!maker.IsDone()) {
            direction.delete();
            maker.delete();
            throw new Error("Could not build the draft.");
        }
        const shape = this.och.converterService.getActualTypeOfShape(maker.Shape());
        direction.delete();
        maker.delete();
        return shape;
    }

    /**
     * Builds a draft from a shape along a direction up to a stop shape
     * @param inputs Shape, direction, angle, stop shape and keep-out flag
     * @returns OpenCascade drafted shape
     * @group draft
     * @shortname make draft to shape
     * @drawable true
     */
    makeDraftToShape(inputs: Inputs.OCCT.MakeDraftToShapeDto<TopoDS_Shape>): TopoDS_Shape {
        const direction = this.och.entitiesService.gpDir(inputs.direction);
        const angle = this.och.vecHelper.degToRad(inputs.angle);
        const maker = new this.occ.BRepOffsetAPI_MakeDraft(inputs.shape, direction, angle);
        maker.SetDraft(inputs.internal);
        maker.PerformToShape(inputs.stopShape, inputs.keepOut);

        if (!maker.IsDone()) {
            direction.delete();
            maker.delete();
            throw new Error("Could not build the draft up to the stop shape.");
        }
        const shape = this.och.converterService.getActualTypeOfShape(maker.Shape());
        direction.delete();
        maker.delete();
        return shape;
    }

}
