import { OpenCascadeInstance, TopoDS_Compound, TopoDS_Shape } from 'opencascade.js';
import { OccHelper } from '../../occ-helper';
import * as Inputs from '../../../../api/inputs/inputs';

export class OCCTCompound {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    makeCompound(inputs: Inputs.OCCT.CompoundShapesDto<TopoDS_Shape>): TopoDS_Compound {
        return this.och.makeCompound(inputs);
    }

}
