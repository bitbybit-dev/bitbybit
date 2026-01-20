import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { ShapeGettersService } from "./shape-getters";

export class BooleansService {

    constructor(
        private readonly occ: BitbybitOcctModule,
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
            const intersectedCommon = new this.occ.BRepAlgoAPI_Common(
                intersectShape,
                inputs.shapes[i]
            );
            if (intersectedCommon.HasGenerated()) {
                intersectedCommon.Build();
                intersectionResult = intersectedCommon.Shape();
                intersectionResults.push(intersectionResult);
            }
            intersectedCommon.delete();
        }

        if (!inputs.keepEdges && intersectionResults.length > 0) {
            intersectionResults = intersectionResults.map(i => {
                return this.occ.ShapeUpgrade_UnifySameDomain_Perform(i, true, true, false);
            });
        }

        return intersectionResults;
    }

    difference(inputs: Inputs.OCCT.DifferenceDto<TopoDS_Shape>): TopoDS_Shape {
        let difference = inputs.shape;
        const objectsToSubtract = inputs.shapes;
        for (let i = 0; i < objectsToSubtract.length; i++) {
            if (!objectsToSubtract[i] || objectsToSubtract[i].IsNull()) { console.error("Tool in Difference is null!"); }
            const differenceCut = new this.occ.BRepAlgoAPI_Cut(difference, objectsToSubtract[i]);
            differenceCut.Build();
            difference = differenceCut.Shape();
            differenceCut.delete();
        }

        if (!inputs.keepEdges) {
            const fusedShape = this.occ.ShapeUpgrade_UnifySameDomain_Perform(difference, true, true, false);
            difference.delete();
            difference = fusedShape;
        }

        if (this.shapeGettersService.getNumSolidsInCompound(difference) === 1) {
            const solid = this.shapeGettersService.getSolidFromCompound(difference, 0);
            difference = solid;
        }

        return difference;
    }

    union(inputs: Inputs.OCCT.UnionDto<TopoDS_Shape>): TopoDS_Shape {
        let combined = inputs.shapes[0];
        for (let i = 0; i < inputs.shapes.length; i++) {
            const combinedFuse = new this.occ.BRepAlgoAPI_Fuse(combined, inputs.shapes[i]);
            combinedFuse.Build();
            combined = combinedFuse.Shape();
            combinedFuse.delete();
        }

        if (!inputs.keepEdges) {
            combined = this.occ.ShapeUpgrade_UnifySameDomain_Perform(combined, true, true, false);
        }

        return combined;
    }

}
