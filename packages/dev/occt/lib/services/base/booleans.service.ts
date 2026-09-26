import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { ShapeGettersService } from "./shape-getters";
import * as Resolved from "../../api/resolved-inputs";

export class BooleansService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly shapeGettersService: ShapeGettersService
    ) { }

    intersection(inputs: Resolved.OCCT.IntersectionDto<TopoDS_Shape>): TopoDS_Shape[] {
        if (inputs.shapes.length < 2) {
            throw (new Error("Intersection requires 2 or more shapes to be given"));
        }

        const intersectShape = inputs.shapes[0]!;
        let intersectionResults: TopoDS_Shape[] = [];

        for (let i = 1; i < inputs.shapes.length; i++) {
            const intersectedCommon = new this.occ.BRepAlgoAPI_Common(
                intersectShape,
                inputs.shapes[i]!
            );
            if (intersectedCommon.IsDone() && !intersectedCommon.HasErrors()) {
                const intersectionResult = intersectedCommon.Shape();
                if (this.hasContent(intersectionResult)) {
                    intersectionResults.push(intersectionResult);
                } else {
                    intersectionResult.delete();
                }
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

    difference(inputs: Resolved.OCCT.DifferenceDto<TopoDS_Shape>): TopoDS_Shape {
        let difference = inputs.shape;
        const objectsToSubtract = inputs.shapes;
        for (let i = 0; i < objectsToSubtract.length; i++) {
            if (!objectsToSubtract[i] || objectsToSubtract[i]!.IsNull()) { console.error("Tool in Difference is null!"); }
            const differenceCut = new this.occ.BRepAlgoAPI_Cut(difference, objectsToSubtract[i]!);
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

    union(inputs: Resolved.OCCT.UnionDto<TopoDS_Shape>): TopoDS_Shape {
        let combined = inputs.shapes[0]!;
        const first = inputs.shapes.length > 1 ? 1 : 0;
        for (let i = first; i < inputs.shapes.length; i++) {
            const combinedFuse = new this.occ.BRepAlgoAPI_Fuse(combined, inputs.shapes[i]!);
            combined = combinedFuse.Shape();
            combinedFuse.delete();
        }

        if (!inputs.keepEdges) {
            combined = this.occ.ShapeUpgrade_UnifySameDomain_Perform(combined, true, true, false);
        }

        return combined;
    }

    private hasContent(shape: TopoDS_Shape): boolean {
        const children = new this.occ.TopoDS_Iterator(shape);
        const found = children.More();
        children.delete();
        return found;
    }

}
