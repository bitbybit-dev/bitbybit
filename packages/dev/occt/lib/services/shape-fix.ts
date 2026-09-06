import { OccHelper } from "../occ-helper";
import { BitbybitOcctModule, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs";

export class OCCTShapeFix {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Performs the basic shape repair
     * @param inputs the shape to be fixed and some options
     * @returns OpenCascade fixed shape
     * @group shape
     * @shortname basic shape repair
     * @drawable true
     */
    basicShapeRepair(inputs: Inputs.OCCT.BasicShapeRepairDto<TopoDS_Shape>): TopoDS_Shape {
        const shapeFix = new this.occ.ShapeFix_Shape();
        shapeFix.Init(inputs.shape);
        shapeFix.SetPrecision(inputs.precision);
        shapeFix.SetMaxTolerance(inputs.maxTolerance);
        shapeFix.SetMinTolerance(inputs.minTolerance);
        shapeFix.Perform();
        const result = shapeFix.Shape();
        shapeFix.delete();
        return result;
    }

    /**
     * Fix small edge on wire
     * @param inputs the wire to be fixed and some options
     * @returns OpenCascade fixed wire
     * @group wire
     * @shortname fix small edge
     * @drawable true
     */
    fixSmallEdgeOnWire(inputs: Inputs.OCCT.FixSmallEdgesInWireDto<TopoDS_Wire>): TopoDS_Wire {
        const wireFix = new this.occ.ShapeFix_Wire();
        wireFix.Load(inputs.shape);
        wireFix.FixSmall(inputs.lockvtx, inputs.precsmall);
        wireFix.Perform();
        const result = wireFix.Wire();
        return result;
    }

    /**
     * Fix edge orientations along wire
     * @param inputs the wire to be fixed and some options
     * @returns OpenCascade fixed wire
     * @group wire
     * @shortname fix edge orientations
     * @drawable true
     */
    fixEdgeOrientationsAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.edgesService.fixEdgeOrientationsAlongWire(inputs);
    }
}
