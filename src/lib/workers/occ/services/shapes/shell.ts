import { OpenCascadeInstance, TopoDS_Face, TopoDS_Shell } from '../../../../../bitbybit-dev-occt/bitbybit-dev-occt';
import { OccHelper } from '../../occ-helper';
import * as Inputs from '../../../../api/inputs/inputs';

export class OCCTShell {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    sewFaces(inputs: Inputs.OCCT.SewDto<TopoDS_Face>): TopoDS_Shell {
        const sew = new this.occ.BRepBuilderAPI_Sewing(inputs.tolerance, true, true, true, false);
        inputs.shapes.forEach(face => {
            sew.Add(face);
        });
        const messageProgress = new this.occ.Message_ProgressRange_1();
        sew.Perform(messageProgress);
        const res = sew.SewedShape();
        return this.och.getActualTypeOfShape(res);
    }

    isClosed(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): { result: boolean } {
        return { result: this.occ.BRep_Tool.IsClosed_1(inputs.shape) }
    }

    getShellSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): { result: number } {
        return { result: this.och.getShellSurfaceArea(inputs) };
    }
}
