import { OpenCascadeInstance } from "opencascade.js";
import { OccHelper } from "../occ-helper";
import * as Inputs from '../../../api/inputs/inputs';

export class OCCTBooleans {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }
    
    union(inputs: Inputs.OCCT.UnionDto): any {
        let combined = inputs.shapes[0];
        for (let i = 0; i < inputs.shapes.length; i++) {
            const combinedFuse = new this.occ.BRepAlgoAPI_Fuse_3(combined, inputs.shapes[i]);
            combinedFuse.Build();
            combined = combinedFuse.Shape();
        }

        if (!inputs.keepEdges) {
            const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(combined, true, true, false);
            fusor.Build();
            combined = fusor.Shape();
        }

        return combined;
    }

    difference(inputs: Inputs.OCCT.DifferenceDto): any {
        let difference = inputs.shape;
        const objectsToSubtract = inputs.shapes;
        for (let i = 0; i < objectsToSubtract.length; i++) {
            if (!objectsToSubtract[i] || objectsToSubtract[i].IsNull()) { console.error('Tool in Difference is null!'); }
            const differenceCut = new this.occ.BRepAlgoAPI_Cut_3(difference, objectsToSubtract[i]);
            differenceCut.Build();
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

    intersection(inputs: Inputs.OCCT.IntersectionDto): any {
        if (inputs.shapes.length < 2) {
            throw (new Error('Less than 2 shapes provided for intersection'));
        }

        let intersected = inputs.shapes[0];
        for (let i = 1; i < inputs.shapes.length; i++) {
            const intersectedCommon = new this.occ.BRepAlgoAPI_Common_3(intersected, inputs.shapes[i]);
            intersectedCommon.Build();
            intersected = intersectedCommon.Shape();
        }

        if (!inputs.keepEdges) {
            const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(intersected, true, true, false);
            fusor.Build();
            intersected = fusor.Shape();
        }

        return intersected;
    }

}
