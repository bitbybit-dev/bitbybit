import { OpenCascadeInstance } from "opencascade.js";
import { OccHelper } from "../../occ-helper";
import * as Inputs from '../../../../api/inputs/inputs';

export class OCCTCompound {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    makeCompound(inputs: Inputs.OCCT.CompoundShapesDto): any {
        const resCompound = new this.occ.TopoDS_Compound();
        const builder = new this.occ.BRep_Builder();
        builder.MakeCompound(resCompound);
        inputs.shapes.forEach(shape => {
            builder.Add(resCompound, shape);
        });
        return resCompound;
    }

}
