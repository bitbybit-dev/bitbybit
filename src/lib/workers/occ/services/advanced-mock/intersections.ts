import { OpenCascadeInstance, TopoDS_Shape } from 'opencascade.js';
import { OccHelper } from '../../occ-helper';
import * as Inputs from '../../../../api/inputs/inputs';

export class OCCTIntersections {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    // Source code of this method is only available in proprietary bitbybit library that is not opensourced
    slice(inputs: Inputs.OCCT.SliceDto<Inputs.OCCT.TopoDSShapePointer>): TopoDS_Shape[] {
        console.error('Slice method is only available in our advanced proprietary package. If you are interested in purchasing the license, please contact MB "Bit by bit developers" company.');
        return undefined;
    }

}
