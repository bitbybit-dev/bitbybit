import { OpenCascadeInstance, TopoDS_Shape } from '../../../../bitbybit-dev-occt/bitbybit-dev-occt';
import { OccHelper } from '../occ-helper';
import * as Inputs from '../../../api/inputs/inputs';

export class OCCTBooleans {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    union(inputs: Inputs.OCCT.UnionDto<TopoDS_Shape>): TopoDS_Shape {
        let combined = inputs.shapes[0];
        for (let i = 0; i < inputs.shapes.length; i++) {
            const combinedFuse = new this.occ.BRepAlgoAPI_Fuse_3(combined, inputs.shapes[i], new this.occ.Message_ProgressRange_1());
            combinedFuse.Build(new this.occ.Message_ProgressRange_1());
            combined = combinedFuse.Shape();
        }

        if (!inputs.keepEdges) {
            const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(combined, true, true, false);
            fusor.Build();
            combined = fusor.Shape();
        }

        return combined;
    }

    difference(inputs: Inputs.OCCT.DifferenceDto<TopoDS_Shape>): TopoDS_Shape {
        let difference = inputs.shape;
        const objectsToSubtract = inputs.shapes;
        for (let i = 0; i < objectsToSubtract.length; i++) {
            if (!objectsToSubtract[i] || objectsToSubtract[i].IsNull()) { console.error('Tool in Difference is null!'); }
            const differenceCut = new this.occ.BRepAlgoAPI_Cut_3(difference, objectsToSubtract[i], new this.occ.Message_ProgressRange_1());
            differenceCut.Build(new this.occ.Message_ProgressRange_1());
            difference = differenceCut.Shape();
        }

        if (!inputs.keepEdges) {
            const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(difference, true, true, false);
            fusor.Build();
            difference = fusor.Shape();
        }

        if (this.och.getNumSolidsInCompound(difference) === 1) {
            difference = this.och.getSolidFromCompound(difference, 0);
        }

        return difference;
    }

    intersection(inputs: Inputs.OCCT.IntersectionDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.intersection(inputs);
    }

}
