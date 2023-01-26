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
            const messageProgress1 = new this.occ.Message_ProgressRange_1();
            const combinedFuse = new this.occ.BRepAlgoAPI_Fuse_3(combined, inputs.shapes[i], messageProgress1);
            const messageProgress2 = new this.occ.Message_ProgressRange_1()
            combinedFuse.Build(messageProgress2);
            combined = combinedFuse.Shape();
            messageProgress1.delete();
            messageProgress2.delete();
            combinedFuse.delete();
        }

        if (!inputs.keepEdges) {
            const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(combined, true, true, false);
            fusor.Build();
            combined = fusor.Shape();
            fusor.delete();
        }

        return combined;
    }

    difference(inputs: Inputs.OCCT.DifferenceDto<TopoDS_Shape>): TopoDS_Shape {
        let difference = inputs.shape;
        const objectsToSubtract = inputs.shapes;
        for (let i = 0; i < objectsToSubtract.length; i++) {
            if (!objectsToSubtract[i] || objectsToSubtract[i].IsNull()) { console.error('Tool in Difference is null!'); }
            const messageProgress1 = new this.occ.Message_ProgressRange_1();
            const differenceCut = new this.occ.BRepAlgoAPI_Cut_3(difference, objectsToSubtract[i], messageProgress1);
            const messageProgress2 = new this.occ.Message_ProgressRange_1();
            differenceCut.Build(messageProgress2);
            difference = differenceCut.Shape();
            messageProgress1.delete();
            messageProgress2.delete();
            differenceCut.delete();
        }

        if (!inputs.keepEdges) {
            const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(difference, true, true, false);
            fusor.Build();
            let fusedShape = fusor.Shape();
            difference.delete();
            difference = fusedShape;
            fusor.delete();
        }

        if (this.och.getNumSolidsInCompound(difference) === 1) {
            let solid = this.och.getSolidFromCompound(difference, 0);
            difference.delete();
            difference = solid;
        }

        return difference;
    }

    intersection(inputs: Inputs.OCCT.IntersectionDto<TopoDS_Shape>): TopoDS_Shape[] {
        return this.och.intersection(inputs);
    }

}
