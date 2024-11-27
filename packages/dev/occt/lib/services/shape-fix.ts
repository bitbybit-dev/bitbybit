import { OccHelper } from "../occ-helper";
import { OpenCascadeInstance, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs/inputs";

export class OCCTShapeFix {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    fixEdgeOrientationsAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.edgesService.fixEdgeOrientationsAlongWire(inputs);
    }

    basicShapeRepair(inputs: Inputs.OCCT.BasicShapeRepairDto<TopoDS_Shape>): TopoDS_Shape {
        const shapeFix = new this.occ.ShapeFix_Shape_1();
        shapeFix.Init(inputs.shape);
        shapeFix.SetPrecision(inputs.precision);
        shapeFix.SetMaxTolerance(inputs.maxTolerance);
        shapeFix.SetMinTolerance(inputs.minTolerance);
        const messageProgress = new this.occ.Message_ProgressRange_1();
        shapeFix.Perform(messageProgress);
        messageProgress.delete();
        const result = shapeFix.Shape();
        shapeFix.delete();
        return result;
    }

    fixSmallEdgeOnWire(inputs: Inputs.OCCT.FixSmallEdgesInWireDto<TopoDS_Wire>) {
        const wireFix = new this.occ.ShapeFix_Wire_1();
        wireFix.Load_1(inputs.shape);
        wireFix.FixSmall_1(inputs.lockvtx, inputs.precsmall);
        wireFix.Perform();
        const result = wireFix.Wire();
        return result;
    }
}
