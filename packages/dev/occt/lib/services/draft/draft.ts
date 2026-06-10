import { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

export class OCCTDraft {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

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
