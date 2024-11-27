import { OpenCascadeInstance, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { ShapeGettersService } from "./shape-getters";

export class BooleansService {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly shapeGettersService: ShapeGettersService
    ) { }

    intersection(inputs: Inputs.OCCT.IntersectionDto<TopoDS_Shape>): TopoDS_Shape[] {
        if (inputs.shapes.length < 2) {
            throw (new Error("Intersection requires 2 or more shapes to be given"));
        }

        const intersectShape = inputs.shapes[0];
        let intersectionResults: TopoDS_Shape[] = [];

        for (let i = 1; i < inputs.shapes.length; i++) {
            let intersectionResult: TopoDS_Shape;
            const messageProgress = new this.occ.Message_ProgressRange_1();
            const intersectedCommon = new this.occ.BRepAlgoAPI_Common_3(
                intersectShape,
                inputs.shapes[i],
                messageProgress
            );
            const messageProgress2 = new this.occ.Message_ProgressRange_1();
            if (intersectedCommon.HasGenerated()) {
                intersectedCommon.Build(messageProgress2);
                intersectionResult = intersectedCommon.Shape();
                intersectionResults.push(intersectionResult);
            }
            messageProgress.delete();
            intersectedCommon.delete();
            messageProgress2.delete();
        }

        if (!inputs.keepEdges && intersectionResults.length > 0) {
            intersectionResults = intersectionResults.map(i => {
                const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(i, true, true, false);
                fusor.Build();
                const fusedShape = fusor.Shape();
                fusor.delete();
                return fusedShape;
            });
        }

        return intersectionResults;
    }

    difference(inputs: Inputs.OCCT.DifferenceDto<TopoDS_Shape>): TopoDS_Shape {
        let difference = inputs.shape;
        const objectsToSubtract = inputs.shapes;
        for (let i = 0; i < objectsToSubtract.length; i++) {
            if (!objectsToSubtract[i] || objectsToSubtract[i].IsNull()) { console.error("Tool in Difference is null!"); }
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
            const fusedShape = fusor.Shape();
            difference.delete();
            difference = fusedShape;
            fusor.delete();
        }

        if (this.shapeGettersService.getNumSolidsInCompound(difference) === 1) {
            const solid = this.shapeGettersService.getSolidFromCompound(difference, 0);
            difference.delete();
            difference = solid;
        }

        return difference;
    }

    union(inputs: Inputs.OCCT.UnionDto<TopoDS_Shape>): TopoDS_Shape {
        let combined = inputs.shapes[0];
        for (let i = 0; i < inputs.shapes.length; i++) {
            const messageProgress1 = new this.occ.Message_ProgressRange_1();
            const combinedFuse = new this.occ.BRepAlgoAPI_Fuse_3(combined, inputs.shapes[i], messageProgress1);
            const messageProgress2 = new this.occ.Message_ProgressRange_1();
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

}
