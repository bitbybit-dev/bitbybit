import { OpenCascadeInstance, TopoDS_Compound } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs/inputs";

export class OCCTDimensions {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    simpleLinearLengthDimension(inputs: Inputs.OCCT.SimpleLinearLengthDimensionDto): TopoDS_Compound {
        return this.och.dimensionsService.simpleLinearLengthDimension(inputs);
    }

    simpleAngularDimension(inputs: Inputs.OCCT.SimpleAngularDimensionDto): TopoDS_Compound {
        return this.och.dimensionsService.simpleAngularDimension(inputs);
    }

    pinWithLabel(inputs: Inputs.OCCT.PinWithLabelDto): TopoDS_Compound {
        return this.och.dimensionsService.pinWithLabel(inputs);
    }
    
    
}
