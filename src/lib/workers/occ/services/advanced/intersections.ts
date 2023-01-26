import { OpenCascadeInstance, TopoDS_Shape } from '../../../../../bitbybit-dev-occt/bitbybit-dev-occt';
import { OccHelper } from '../../occ-helper';
import * as Inputs from '../../../../api/inputs/inputs';
import { AdvIntersections } from 'projects/bitbybit-advanced/src/adv-intersections';
import { TopoDS_Compound } from 'opencascade.js';

export class OCCTIntersections {

    private readonly advIntersections: AdvIntersections;

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
        this.advIntersections = new AdvIntersections(occ, och);
    }

    // Source code of this method is only available in proprietary bitbybit library that is not opensourced
    slice(inputs: Inputs.OCCT.SliceDto<TopoDS_Shape>): TopoDS_Compound {
        return this.advIntersections.slice(inputs);
    }

}
